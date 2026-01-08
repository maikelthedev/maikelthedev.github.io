---
layout: post
title: "Pagekite with Custom Domain in Nixos, tunneling without Ngrok for free"
date: "2025-10-09"
excerpt: "I got tired of Ngrok, Zrok, Tailscale and all of these options that charge you absurds amounts of money for just letting you use your own domain names in a web tunnel to try APIs or development. So I made my own derivation in NixOS to run Pagekite. "
image: "/assets/images/unsplash-1610098905401.jpg"
tags:
  - NixOS
  - DevOps
  - networking
  - tunneling
---

There are instructions all over on how to configure Pagekite on Ubuntu but none on NixOS there's not even a derivation of it so I made one. I'm tired of Zrok, Ngrok, Tailscale and all of their offerings that are either closed-source or impossibly hard to install or maintain. Let alone **to use a custom domain **you'll have to pay north of 20 USD per month.

I just want to be able to use my own domains, that's all. I don't need any of the other fancy stuff so even though Pagekite is a lot cheaper than all of them 3, to use custom domains **with **SSL is not so much. So I decided to self-host the frontend. Btw, whoever decided to call the server "frontend" and the client "backend" deserves to be hanged upside down in a bucket filled with piranhas.

## Getting SSL

Think that here `DOMAIN` is going to be the parent domain. I could make it be directly maikeladas.es but I have other stuff there and using a wildcard would force me to get rid of subdomains so I rather use a subdomain for specific temporary stuff, in this case `dev.maikeladas.es`. I could have used `maikel.dev`but the restrictions of dev domains that you cannot use port 80. They force you to use 443 and SSL. I want flexibility.

```bash
mkdir $HOME/certs
set DOMAIN dev.maikeladas.es
nix-shell -p certbot
certbot certonly --manual \
  --work-dir=$HOME/certs --logs-dir=/tmp/ --config-dir=$HOME/certs \
  --preferred-challenges=dns \
  --email avalid@email.whatever \
  --server https://acme-v02.api.letsencrypt.org/directory \
  --agree-tos \
  -d "*.$DOMAIN"
exit
sudo cat \
  $HOME/certs/live/$DOMAIN/fullchain.pem \
  $HOME/certs/live/$DOMAIN/privkey.pem \
  | sudo tee $HOME/certs/keycert.pem > /dev/null
```

Now you have the keycert.pem file that Pagekite requires to provide domains over HTTPS. The certificate will require renewal every 6 months. It can be automated but that's for another day.

## Do your DNS changes

Go to your DNS provider. For the domain create a `*.dev.YOURDOMAIN.COM` record of A type pointing to the IP and one of the parent subdomain pointing to the same IP. So also `dev.YOURDOMAIN.COM` again of A type.

## NixOS Changes to get Pagekite

Assuming you use configuration.nix or somefile.nix that is not a flake.

```nix
{ config, lib, pkgs, ... }:
let
  kitesecret = "YOUR_KITE_PASS";
  pagekite = import ./pagekite-package.nix { inherit pkgs; };
in {
  # The rest of your config
  # To install the derivation while keeping it around to pass it
  environment.systemPackages = lib.mkAfter [ pagekite ];
  imports = [
    # ...your other imports
    # Import as functions, passing pagekite and kitesecret explicitly
    # If this machine is the client
    (import ./pagekite-client.nix {
      inherit config pkgs lib pagekite kitesecret;
      frontendHost = "dev.maikeladas.es";
      frontendPort = 80;
      backendHost = "stephen.dev.maikeladas.es";
      backendLocalPort = 4000;
    })
    # If this machine is the server
    (import ./pagekite-server.nix {
      inherit config pkgs lib pagekite kitesecret;
      kitename = "*.dev.maikeladas.es";
      ports = "80,443";
      protos = "http,https";
      domainHttp = "*.dev.maikeladas.es";
      domainHttps = "*.dev.maikeladas.es";
      tlsEndpoint = "*.dev.maikeladas.es:/home/maikel/certs/keycert.pem";
    })
  ];
  # The rest of your /etc/nixos/configuration.nix file
}
```

## Then the pagekite-package.nix

This is all you need to intsall pagekite.py

```nix
{ pkgs }:
pkgs.stdenv.mkDerivation rec {
  pname = "pagekite";
  version = "1.0";
  src = pkgs.fetchurl {
    url = "https://pagekite.net/pk/pagekite.py";
    sha256 = "1nqa4nkhjq2shc7zpxn22pxfqpsl6xf06mfxlwa72c5p72zf7x94";
  };
  nativeBuildInputs = [ pkgs.makeWrapper ];
  unpackPhase = ":";
  installPhase = ''
    mkdir -p $out/bin
    sed "1 s|^.*$|#!${pkgs.python3}/bin/python3|" $src > $out/bin/pagekite
    chmod +x $out/bin/pagekite
  '';
}
```

## Then the pagekite-client.nix

This is the one to use a client.

```nix
{ config, pkgs, lib, kitesecret, pagekite, frontendHost, frontendPort, backendHost, backendLocalPort, ... }:
let
  # Construct addresses
  frontend = "${frontendHost}:${toString frontendPort}";
  backend = "http:${backendHost}:localhost:${toString backendLocalPort}";
in {
  # PageKite client configuration file
  environment.etc."pagekite.d/${backendHost}.conf".text = ''
    frontend = ${frontend}
    service_on = ${backend}:${kitesecret}
  '';

  # Systemd service
  systemd.services."pagekite-client-${backendHost}" = {
    description = "PageKite Client Tunnel Service for ${backendHost}";
    after = [ "network.target" ];
    wantedBy = [ "multi-user.target" ];
    serviceConfig = {
      Type = "simple";
      ExecStart = "${pagekite}/bin/pagekite --optfile /etc/pagekite.d/${backendHost}.conf";
      Restart = "always";
      RestartSec = 10;
      User = "root";
    };
  };
}
```

## Then the pagekite-server.nix

This is the one to run a server. This machine needs to be one that responds when you ping `dev.YOURDOMAIN.COM` and `*.dev.YOURDOMAIN.COM` so you must have your DNS configured correctly.

```nix
{ config, pkgs, lib, kitesecret, pagekite, kitename, ports, protos, domainHttp, domainHttps, tlsEndpoint, ... }:
{
  # PageKite server configuration file
  environment.etc."pagekite.d/pk-server.conf".text = ''
    kitename = ${kitename}
    kitesecret = ${kitesecret}
    isfrontend
    ports = ${ports}
    protos = ${protos}
    domain = http:${domainHttp}:${kitesecret}
    domain = https:${domainHttps}:${kitesecret}
    tls_endpoint = ${tlsEndpoint}
  '';

  # Systemd service
  systemd.services.pagekite = {
    description = "PageKite Reverse Tunnel Service";
    after = [ "network.target" ];
    wantedBy = [ "multi-user.target" ];
    serviceConfig = {
      Type = "simple";
      ExecStart = "${pagekite}/bin/pagekite --optfile /etc/pagekite.d/pk-server.conf";
      Restart = "always";
      RestartSec = 10;
      User = "root";
    };
  };
}
```

# How to use it

On whatever machine plays as server add the necessary files to run the server, and on the client for the client. Both cases need pagekite-package.nix though. Then just `nixos-rebuild switch` or whatever NixOS method you use to update your config.

I normally do a `sudo systemctl stop pagekite-client-DOMAIN` after running any client the first time so it's only available when I need it.
![Image](/assets/images/2025-10-image.png)
## Caveats

1. I haven't automated SSL renewal, it can be done, but I need to have a life. I might not be using this in six months.
2. If you stop whatever is you're serving or the server, the client hangs and does not auto-reconnect. So get ready to restart the client.
3. You won't have to pay ever again Zrok, Ngrok or Tailscale for using a custom domain. Oh, the suffering!

<!--kg-card-begin: html-->
<div><iframe src="https://giphy.com/embed/5WXqTFTgO9a7e" frameBorder="0" allowFullScreen></iframe></div>
<!--kg-card-end: html-->
If you liked this article consider tipping me on Ko-Fi 👇
<!--kg-card-begin: html-->
<script type='text/javascript' src='https://storage.ko-fi.com/cdn/widget/Widget_2.js'></script><script type='text/javascript'>kofiwidget2.init('Support me on Ko-fi', '#72a4f2', 'H2H4GCC0N');kofiwidget2.draw();</script>
<!--kg-card-end: html-->
