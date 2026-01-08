---
layout: post
title: "Using HAProxy for Ngrok-style domain tunneling  in Nixos with SSL self-renewal enabled"
date: "2025-10-14"
excerpt: "Another way to do the same tunneling without Ngrok or any paid service,  but this time with autorenewal of the SSL and in a more robust and simple manner. "
image: "/assets/images/unsplash-1637481687365.jpg"
tags:
  - NixOS
  - DevOps
  - networking
  - tunneling
  - SSL
---

I love accessing computers from elsewhere yet hate Ngrok, Tailscale and Zrok with passion so I made a post not long ago about [how to self-host Pagekite](/pagekite-with-custom-domain-in-nixos-tunneling-without-ngrok-for-free/) to be able to use your own domain names for this. The problem is how ugly it made my configuration.nix files and how I didn't manage to write an auto-renewal script. Today I've figured how using ACME. HAProxy seems to have the same issue of wanting a single file for all keys but I managed to bypass that one here.

# Configuration.nix
<code ># Assuming configuration.nix { # Rest of your file imports = [ # Rest of your imports ./haproxy-acme.nix ] } `</pre> # Server: haproxy-acme.nix <p>Change `serverNames` for whatever list of servers you want to add, don't forget to manually edit the `services.haproxy.config` configuration too for your added servernames without SSL, in my case is my zerotier one, accessible on my zerotier network.

The `acme_email`variable should point to your var.
<code >{ config, pkgs, ... }: let acme_email = "acme@maikel.dev"; # Map domains to their backend host:port serverBackends = { "something_one.maikeladas.es" = "127.0.0.1:4000"; # Phoenix dev server. "something_else.maikeladas.es" = "thinkpad.zerotier:8080"; #Zerotier URL }; serverNames = builtins.attrNames serverBackends; # ACLs aclLines = builtins.concatStringsSep "\n" (map (d: let aclName = "host_${builtins.replaceStrings [ "." ] [ "_" ] d}"; in " acl ${aclName} hdr(host) -i ${d}" ) serverNames); redirectLines = builtins.concatStringsSep "\n" (map (d: " http-request redirect scheme https code 301 if host_${builtins.replaceStrings [ "." ] [ "_" ] d}") serverNames); # use_backend lines backendLines = builtins.concatStringsSep "\n" (map (d: let aclName = "host_${builtins.replaceStrings [ "." ] [ "_" ] d}"; backendName = builtins.replaceStrings [ "." ] [ "_" ] d; in " use_backend ${backendName}_app if ${aclName}" ) serverNames); # crt files crtFiles = builtins.concatStringsSep " " (map (d: "crt /var/lib/haproxy/certs/${d}.pem" ) serverNames); # backend definitions backendDefs = builtins.concatStringsSep "\n" (map (d: let backendName = builtins.replaceStrings [ "." ] [ "_" ] d; backendAddr = serverBackends.${d}; indent = " "; # 1 tab = 4 spaces in '' ${indent}backend ${backendName}_app ${indent} mode http ${indent} server ${backendName}_1 ${backendAddr} check inter 2s fall 3 rise 2 ${indent} errorfiles customerrors '' ) serverNames); in { # SSL certificates for HAProxy security.acme = { acceptTerms = true; defaults.email = acme_email; certs = builtins.listToAttrs (map (domain: { name = domain; value = { webroot = "/var/lib/acme/acme-challenge"; group = "haproxy"; postRun = '' mkdir -p /var/lib/haproxy/certs cat /var/lib/acme/${domain}/fullchain.pem \ /var/lib/acme/${domain}/key.pem \ &gt; /var/lib/haproxy/certs/${domain}.pem chown root:haproxy /var/lib/haproxy/certs/${domain}.pem chmod 0640 /var/lib/haproxy/certs/${domain}.pem ''; }; }) serverNames); }; # HAProxy service services.haproxy = { enable = true; config = '' global log stdout format raw local0 maxconn 2000 defaults log global mode http option httplog option dontlognull option forwardfor except 127.0.0.1 timeout connect 5s timeout client 30s timeout server 30s retries 3 frontend http_in bind *:80 acl acme_challenge path_beg /.well-known/acme-challenge/ use_backend acme_backend if acme_challenge acl host_zt hdr(host) -i stephen.zerotier ${aclLines} use_backend something_one_maikeladas_es_app if host_zt ${redirectLines} default_backend not_found frontend https_in bind *:443 ssl ${crtFiles} mode http acl acme_challenge path_beg /.well-known/acme-challenge/ ${aclLines} use_backend acme_backend if acme_challenge ${backendLines} default_backend not_found backend acme_backend mode http server local_acme 127.0.0.1:8081 ${backendDefs} http-errors customerrors errorfile 503 /etc/haproxy/errorfiles/503.http backend not_found mode http errorfiles customerrors ''; user = "haproxy"; group = "haproxy"; }; environment.etc."haproxy/errorfiles/503.http".text = '' HTTP/1.1 503 Service Unavailable Cache-Control: no-cache Connection: close Content-Type: text/html ${builtins.readFile ./haproxy-error-503.html} ''; # Local HTTP server to serve ACME challenges systemd.services.acme-challenge-server = { description = "Serve Let's Encrypt challenges for HAProxy"; wantedBy = [ "multi-user.target" ]; serviceConfig = { ExecStart = "${pkgs.python3}/bin/python3 -m http.server 8081 --directory /var/lib/acme/acme-challenge"; Restart = "always"; }; }; } `</pre> # Your laptop or other PC configuration to be accessible <p>Assuming you use Zerotier (is free) and have it in the same network as the server (I do) and you know the IP or domain name if you have it in /etc/hosts (I do but I prefer to use IPs). Notice how I've limited the listening interfaces to that one of Zerotier only.

Of course import this file in your configuration for that machine. I call it `haproxy-redirect.nix` to make it clear what the nix contains.
<code >{ config, pkgs, ... }: { # HAProxy service services.haproxy = { enable = true; config = '' global log stdout format raw local0 maxconn 2000 defaults log global mode http option httplog option dontlognull option forwardfor except 127.0.0.1 timeout connect 5s timeout client 30s timeout server 30s retries 3 frontend local_http bind thinkpad.zerotier:8080 default_backend phoenix_app backend phoenix_app server phoenix_1 127.0.0.1:4000 check inter 2s fall 3 rise 2 errorfile 503 /etc/haproxy/errorfiles/503.http ''; user = "haproxy"; group = "haproxy"; }; environment.etc."haproxy/errorfiles/503.http".text = '' HTTP/1.1 503 Service Unavailable Cache-Control: no-cache Connection: close Content-Type: text/html ${builtins.readFile ./haproxy-error-503.html} ''; } `</pre> ## The default 503 error file ![Image](/assets/images/2025-10-image-1.png)<p>All errors I got when I turned off any of them servers were of type 503 so that's the error I customised. The files is `haproxy-error-503.html` and should be in the same folder as the nix configuration. The content is this
<pre><code >&lt;!DOCTYPE html&gt;
&lt;html lang="en"&gt;
  &lt;head&gt;
    &lt;meta charset="utf-8" /&gt;
    &lt;title&gt;Service Unavailable&lt;/title&gt;
    &lt;style&gt;
      body {
        font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
        background: #fafafa;
        color: #333;
        margin: 0;
        display: flex;
        align-items: center;
        justify-content: center;
        height: 100vh;
      }
      main {
        text-align: center;
        padding: 2rem;
        background: white;
        border-radius: 1rem;
        box-shadow: 0 4px 12px rgba(0,0,0,0.08);
      }
      h1 {
        font-size: 2rem;
        margin-bottom: 0.5rem;
        color: #c0392b;
      }
      p {
        font-size: 1rem;
        color: #666;
      }
    &lt;/style&gt;
  &lt;/head&gt;
  &lt;body&gt;
    &lt;main&gt;
      &lt;h1&gt;503 – Service Unavailable&lt;/h1&gt;
      &lt;p&gt;Our server is taking a quick break. Please try again in a moment.&lt;/p&gt;
    &lt;/main&gt;
  &lt;/body&gt;
&lt;/html&gt;
</code></pre>
# Advantages over the Pagekite way

1. HAProxy is a lot more robust.
2. Since you're using already a machine as server and Zerotier for LAN-like communication, this harness precisely all that to make the config a lot simpler.
3. SSL renewal bult-in.
4. You can just stop the services whenever, the 503 custom-error page will be shown. No need to remember to "sysctl stop whatever"
5. Custom error page.
