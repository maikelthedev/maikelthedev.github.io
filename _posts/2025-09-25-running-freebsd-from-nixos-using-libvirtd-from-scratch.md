---
layout: post
title: "Running FreeBSD from NixOS using Libvirtd from scratch"
date: "2025-09-25"
excerpt: "How to run FreeBSD alongisde Nixos on the same computer for quick tests using libvirtd to stop having recompilation issues of VirtualBox"
image: "/assets/images/unsplash-1657724576853.jpg"
tags:
  - FreeBSD
  - NixOS
  - DevOps
  - virtualization
---

I use **FreeBSD** for work because my clients deploy servers on it. At home, I have a PC with 32 GB of RAM and use **NixOS**, so I wanted to run FreeBSD locally for quick tests.

My first choice would normally be **VirtualBox**, but on NixOS it’s a pain: every system upgrade forces VirtualBox to be recompiled. Since I upgrade often, that became unmanageable.

People in the fediverse suggested **libvirtd**, so I gave it a try. It’s trickier at first, but once you learn a few commands it’s not bad at all—and in fact, it allows for a lot of automation.

# Installing Libvirtd

In configuration.nix you need to make the following changes.
<code ># Add the user to these groups, internet wisdom is not clear about what exactly is the name of each group. users.users.maikel = { extraGroups = [ "libvirtd", "libvirt", "qemu-libvirtd" ]; }; # Enable libvirtd virtualisation = { libvirtd = { enable = true; qemu.vhostUserPackages = with pkgs; [ virtiofsd ]; }; }; # Add Virt-Manager makes simpler to explore actual configs. programs.virt-manager.enable = true; environment = { systemPackages = with pkgs; [ virt-viewer cloud-utils cloud-init ]; }; `</pre> # Running commands when using Libvirtd as a system's service <p>Despite all the changes there, I still need to prepend all virsh and virt-viewer commands with
<code ># For Virsh virsh -c qemu:///system # For Virt-viewer virt-viewer -c qemu:///system`</pre><p>Either that or put sudo ahead of all virsh commands. Since I'm lazy I prefer to do what works every time and since I use Fish shell, I just added to `~/.config/fish/conf.d/abbreviations.fish`
<code >abbr --add virt-viewer "virt-viewer -c qemu:///system" abbr --add virsh "virsh -c qemu:///system" `</pre><p>That way every time I write either it auto completes so assume every command below takes this into account. If you don't want to autocomplete either use sudo (for virsh) or the whole `-c qemu:///system` for virt-viewer (can't use sudo, you need the display). I like abbr instead of alias because with abbr **I don't actually forget** the full command ever. It's shown to me every time.

# Configuring the Network

By default there's nothing running network wise. So you need to start the default network with
<code ># Starts it if you can't see any new networks in ifconfig virsh net-start default # So it autostarts virsh net-autostart default `</pre><p>That will run the virtual network every time the PC reboots.

# Creating a cloud-init enabled image
<div class="kg-card kg-callout-card kg-callout-card-blue"><div class="kg-callout-emoji">💡</div><div class="kg-callout-text">**IMPORTANT**

Always download the VM version, not the installer version from https://www.freebsd.org/where/</div></div>
## For standard VM image (UFS)

This will create a template on your PC to run cloud-init from the standard VM image that uses as filesystem UFS, **if you need ZFS move onto the next step.**
<code ># Make a folder for your vms mkdir ~/vms cd ~/vms # Download standard VM image and unzip it wget https://download.freebsd.org/releases/VM-IMAGES/14.3-RELEASE/amd64/Latest/FreeBSD-14.3-RELEASE-amd64.qcow2.xz # Decompress but keeps the original xz -dk FreeBSD-14.3-RELEASE-amd64.qcow2.xz # Make the disk slightly bigger mv FreeBSD-14.3-RELEASE-amd64.qcow2 freebsd14-cloud-init.qcow2 qemu-img resize freebsd14-cloud-init.qcow2 10G # Run it with the "default" network to install CloudInit virt-install \ --connect qemu:///system \ --name freebsd14 \ --memory 2048 \ --vcpus 2 \ --disk path=./freebsd14-cloud-init.qcow2,format=qcow2,bus=virtio \ --os-variant freebsd14.0 \ --import \ --network network=default,model=virtio \ --graphics spice `</pre> ## Now inside the machine <p>The default root user is passwordless so if you use "root" it won't ask for any password, just log you in.
<code ># OPTIONAL: Keyboard to Spanish, symbols are in different places kbdcontrol -l es # Now inside the machine prepare it for cloud-init (as root, no pass) pkg update pkg search cloud-init pkg install -y WHATEVER_VERSION_YOU_GOT_FROM_SEARCH # Now enable it sysrc cloudinit_enable="YES" poweroff # On your host system: Back it up xz -k freebsd14-cloud-init.qcow2 `</pre> ## For a ZFS VM image <p>This will create a template on your PC to run cloud-init from the ZFS VM image that uses as filesystem ZFS, **the most common case.**
<code ># Make a folder for your vms mkdir ~/vms cd ~/vms # Download standard VM image and unzip it wget https://download.freebsd.org/releases/VM-IMAGES/14.3-RELEASE/amd64/Latest/FreeBSD-14.3-RELEASE-amd64-zfs.qcow2.xz # Decompress but keeps the original xz -dk FreeBSD-14.3-RELEASE-amd64-zfs.qcow2.xz # Make the disk slightly bigger mv FreeBSD-14.3-RELEASE-amd64-zfs.qcow2 freebsd14-cloud-init-zfs.qcow2 qemu-img resize freebsd14-cloud-init-zfs.qcow2 10G # Run it with the "default" network to install CloudInit virt-install \ --connect qemu:///system \ --name freebsd-zfs \ --memory 2048 \ --vcpus 2 \ --disk path=./freebsd14-cloud-init-zfs.qcow2,format=qcow2,bus=virtio \ --os-variant freebsd14.0 \ --import \ --network network=default,model=virtio \ --graphics spice `</pre> ## Now inside the machine <p>The default root user is passwordless so if you use "root" it won't ask for any password, just log you in. This is pretty much the same as with UFS. Only changes the file you back up.
<code ># OPTIONAL: Keyboard to Spanish, symbols are in different places kbdcontrol -l es # Now inside the machine prepare it for cloud-init (as root, no pass) pkg update pkg search cloud-init pkg install -y WHATEVER_VERSION_YOU_GOT_FROM_SEARCH # Now enable it sysrc cloudinit_enable="YES" poweroff # On your host system: Back it up xz -k freebsd14-cloud-init-zfs.qcow2 `</pre> # Using your own templates to launch custom-made VMs quickly ## Create a cloud-init config 
1. Create this file as `user-data.yaml` on the `~/vms` folder
<pre><code >#cloud-config hostname: freebsd users: - name: maikel shell: /usr/local/bin/fish sudo: ALL=(ALL) NOPASSWD:ALL lock_passwd: false # Use mkpasswd to get this passwd: "$6$L80IKTw......dbZewtsw5FjosH0" # Your public key for SSH ssh_authorized_keys: - ssh-ed25519 AAAAC3NzaC1.... ...@maikel.dev ssh_pwauth: True keyboard: layout: es # Any packages you need in FreeBSD go here packages: - fish - sudo - mkpasswd - neovim - git runcmd: # Enable SSH - sysrc sshd_enable=YES - service sshd start # Set Spanish keyboard permanently - sysrc keymap="es.kbd" - service syscons restart # Optional: set root and maikel shells to fish explicitly - pw usermod root -s /usr/local/bin/fish - pw usermod maikel -s /usr/local/bin/fish `</pre>
1. Use this command to create a CD-ROM ISO to launch it from. Assuming you're in `~/vms`
<pre><code >cloud-localds seed.iso user-data.yaml `</pre> # Creating the final machine using the ZFS image <p>The instructions are prety much the same for a UFS image you just change the filenames.
<code ># Access the folder of your vms cd ~/vms # Decompress the fresh cloud-init-enabled version we created before. xz -dk freebsd14-cloud-init-zfs.qcow2.xz # Rename it to something more useful to distinguish it from the template cp freebsd14-cloud-init-zfs.qcow2 freebsd14-ready.qcow2 # Create the seed ISO from user-data.yaml in case you've made any changes. cloud-localds seed.iso user-data.yaml # Make the disk bigger here it is set to 20G but you can do whatever size you like qemu-img resize freebsd14-ready.qcow2 20G # Install virt-install \ --connect qemu:///system \ --name freebsd-new \ --memory 2048 \ --vcpus 4 \ --disk path=freebsd14-ready.qcow2,format=qcow2,bus=virtio \ --disk path=seed.iso,device=cdrom \ --os-variant freebsd14.0 \ --import \ --network network=default,model=virtio \ --graphics spice \ --noautoconsole # Added this here because I prefer to let it run first. # To view virt-viewer freebsd-new `</pre><p>And that's it, your system should be up and running ready to be used. 🥳
![Image](/assets/images/2025/09/image-4.png)
# Extra steps for your own sanity

## Resizing the partition to use all available space (ZFS)

If you want your system to use all the available space in your qcow2 file after resizing it you'll need some extra steps.
<code ># Ensure vtbd0 is the name of it gpart show # Reize partition gpart recover vtbd0 # Get the lice or number of partition, in my case is 4 gpart show # This is assumign the slice is 4 gpart resize -i 4 vtbd0 # Again the end "p4" depends on the slice number zpool online -e zroot /dev/vtbd0p4 `</pre><p>That's all your machine is ready to use. If you ever need to change the size of the qcow2 file repeat those steps.

## Autostart this machine with NixOS with Nixos

Run on the host machine
<code >virsh --connect qemu:///system autostart freebsd-new `</pre> ## Detach cloud-init disk just in case <p>Normally cloud-init runs only once, but just to be sure on the host machine
<code ># To find the name of the ISO device, in my case "hda" sudo virsh domblklist freebsd-new # To both remove it and ensure it never comes back after reboot virsh --connect qemu:///system change-media freebsd-new hda --eject --config --live `</pre> ## SSH-ing in made easier with Fish shell functions <p>I don't want to have to finding the IP before I connect so I wrote this fish shell function stored in `~/.config/fish/functions/sshvm` which uses the global variable `$LOCAL_VM_KEY` as path to the private key used to log into the FreeBSD VM. I defined that key in `~/.config/fish/conf.d/variables`
<code >function sshvm # This gets the IP of the server with the given name set ip (virsh --connect qemu:///system domifaddr $argv[1] | string match -r '\d+\.\d+\.\d+\.\d+' | head -n1) # This connects to the server using the private key ssh -i $LOCAL_VM_KEY maikel@$ip end `</pre><p>Then I just use
<code >sshvm freebsd-new `</pre><p>Or whatever name I gave to that virtual machine.

## Cleaning up
<code ># See the machines sudo virsh list --all # The first stops immediately the machine sudo virsh destroy freebsd14 # This second removes it from the pool of VMs of libvirtd sudo virsh undefine frebsd14 # Delete any pre-made seed just in case rm -rf seed.iso `</pre> # Some oddities <p>These are some painful parts from the process.

### The command `Virt-install` and "~"

I don't know why the path can't interpret "~" hence why I did it all from the `~/vms` folder

### Run without virt-viewer

Sometimes you want to install and see nothing, in those case use
<code > --graphics spice \ --noautoconsole `</pre><p>At the end of the `virt-install` command, this runs the system with graphics enable but doesn't attach any viewer to it.
