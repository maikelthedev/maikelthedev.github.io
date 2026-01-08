---
layout: post
title: "Running FreeBSD from NixOS using Libvirtd from scratch"
date: "2025-09-27"
excerpt: "Complete guide to running FreeBSD alongside NixOS using libvirtd, with automation scripts, network configuration, cloud-init setup, and desktop environment installation."
image: "/assets/images/unsplash-1657724576853.jpg"
featured: true
tags:
  - FreeBSD
  - NixOS
  - DevOps
  - virtualization
---

I use **FreeBSD** for work because my clients deploy servers on it. At home, I have a PC with 32 GB of RAM and use **NixOS**, so I wanted to run FreeBSD locally for quick tests.

My first choice would normally be **VirtualBox**, but on NixOS it's a pain: every system upgrade forces VirtualBox to be recompiled. Since I upgrade often, that became unmanageable.

People in the fediverse suggested **libvirtd**, so I gave it a try. It's trickier at first, but once you learn a few commands it's not bad at all—and in fact, it allows for a lot of automation.

<details markdown="1">
<summary>Version History</summary>

This guide has evolved through several iterations:

**v3.0 (Current)**
- Removed `add_vm_to_network` Fish-shell function (no longer necessary with NSS)
- Fixed `create_vm` Fish-shell function (no longer needs MACs)
- Simplified network edition
- Added NSS configuration to `configuration.nix` for hostname resolution
- Set default URI to avoid adding `-c qemu:///system` to every command
- Improved `clone_user_data` function with automatic folder creation
- Added repo with all functions

**v2.0**
- Removed UFS images to avoid duplication (ZFS only)
- Added Fish-shell scripts to automate creation, destruction and network config
- Fixed IP assignment to VMs using MACs and hostnames
- Added KDE desktop environment setup via cloud-init
- Added Zerotier integration with self-authorization

**v1.0**
- Initial guide with basic libvirtd setup
- UFS and ZFS image support
- Basic cloud-init configuration

</details>

# Installing Libvirtd

In `configuration.nix` you need to make the following changes.

```nix
# Add the user to these groups
users.users.maikel = {
  extraGroups = [ "libvirtd", "libvirt", "qemu-libvirtd" ];
};

# Enable libvirtd
virtualisation = {
  libvirtd = {
    enable = true;
    qemu.vhostUserPackages = with pkgs; [ virtiofsd ];
    # Enable NSS plugin for resolving VM hostnames
    nss = {
      enable = true;        # classic libvirt NSS
      enableGuest = true;    # resolves domain names of guests
    };
  };
};

# Add Virt-Manager makes simpler to explore actual configs
programs.virt-manager.enable = true;

environment = {
  systemPackages = with pkgs; [
    virt-viewer
    cloud-utils
    cloud-init
  ];
};
```

# Running commands when using Libvirtd as a system's service

Despite all the changes there, I still need to prepend all virsh and virt-viewer commands with `-c qemu:///system`. One way to avoid having to do this is to set the environment variable.

For Fish shell:

```fish
# Run this from anywhere, it automatically stores it in ~/.config/fish/fish_variables
set -Ux LIBVIRT_DEFAULT_URI qemu:///system
```

For Bash:

```bash
# Append to ~/.bashrc or ~/.profile, whichever is the last to load on your system
export LIBVIRT_DEFAULT_URI="qemu:///system"
```

Alternatively, you can use Fish abbreviations (which I prefer because they show you the full command):

```fish
# Add to ~/.config/fish/conf.d/abbreviations.fish
abbr --add virt-viewer "virt-viewer -c qemu:///system"
abbr --add virsh "virsh -c qemu:///system"
```

I like `abbr` instead of `alias` because with `abbr` **I don't actually forget** the full command ever. It's shown to me every time.

# Configuring the Network

By default there's nothing running network wise. So you need to start the default network with:

```bash
# Starts it if you can't see any new networks in ifconfig
virsh net-start default

# So it autostarts
virsh net-autostart default
```

That will run the virtual network every time the PC reboots.

## Modifying the default network to your desired IP range

```bash
virsh net-dumpxml default > mynetwork.xml
```

We get this from it on the file `mynetwork.xml`:

```xml
<network>
  <name>default</name>
  <uuid>07c8b831-3fa7-4bb1-ae07-fad64b672a67</uuid>
  <forward mode='nat'>
    <nat>
      <port start='1024' end='65535'/>
    </nat>
  </forward>
  <bridge name='virbr0' stp='on' delay='0'/>
  <mac address='52:54:00:9f:f9:f6'/>
  <ip address='192.168.122.1' netmask='255.255.255.0'>
    <dhcp>
      <range start='192.168.122.2' end='192.168.122.254'/>
    </dhcp>
  </ip>
</network>
```

I'm going to change the range to `192.168.100.0/24` and the network name to `maikenet` since I like it more and tells me on the name what it is. You can remove UUID.

```xml
<network>
  <name>maikenet</name>
  <forward mode='nat'>
    <nat>
      <port start='1024' end='65535'/>
    </nat>
  </forward>
  <bridge name='virbr0' stp='on' delay='0'/>
  <mac address='52:54:00:9f:f9:f6'/>
  <ip address='192.168.100.1' netmask='255.255.255.0'>
    <dhcp>
      <range start='192.168.100.2' end='192.168.100.254'/>
    </dhcp>
  </ip>
</network>
```

Now let's destroy the network interface and create a new one. Beware if you're doing these commands while your machines are running and attached to any network you're destroying, they might need a reboot to recover their IPs once that network is back up.

```bash
# To destroy it
virsh net-destroy default

# We need to undefine it in case something is assigned to it already but also because we're not using it anymore
virsh net-undefine default

# To recreate it from file
virsh net-define mynetwork.xml

# Now start it and autostart to ensure it starts with NixOS
virsh net-start maikenet
virsh net-autostart maikenet

# Check with an ifconfig
ifconfig
# You should see an adapter virbr0 with the right IP
```

# Creating a cloud-init enabled image

<div class="kg-card kg-callout-card kg-callout-card-blue"><div class="kg-callout-emoji">💡</div><div class="kg-callout-text" markdown="1">
**IMPORTANT**

Always download the VM version, not the installer version from https://www.freebsd.org/where/
</div></div>

## For a ZFS VM image

This will create a template on your PC to run cloud-init from the ZFS VM image that uses ZFS filesystem, **the most common case.**

```bash
# Make a folder for your vms
mkdir $HOME/vms
cd $HOME/vms

# Download standard VM image and unzip it
wget https://download.freebsd.org/releases/VM-IMAGES/14.3-RELEASE/amd64/Latest/FreeBSD-14.3-RELEASE-amd64-zfs.qcow2.xz

# Decompress but keeps the original
xz -dk FreeBSD-14.3-RELEASE-amd64-zfs.qcow2.xz

# Make the disk slightly bigger
mv FreeBSD-14.3-RELEASE-amd64-zfs.qcow2 freebsd14-cloud-init-zfs.qcow2
qemu-img resize freebsd14-cloud-init-zfs.qcow2 10G

# Run it with the network to install CloudInit
virt-install \
  --name freebsd-zfs \
  --memory 2048 \
  --vcpus 2 \
  --disk path=freebsd14-cloud-init-zfs.qcow2,format=qcow2,bus=virtio \
  --os-variant freebsd14.0 \
  --import \
  --network network=maikenet,model=virtio \
  --graphics spice
```

## Now inside the machine

The default root user is passwordless so if you use `root` it won't ask for any password, just log you in.

```bash
# OPTIONAL: Keyboard to Spanish, symbols are in different places
kbdcontrol -l es

# Now inside the machine prepare it for cloud-init (as root, no pass)
pkg update
pkg search cloud-init
pkg install -y WHATEVER_VERSION_YOU_GOT_FROM_SEARCH

# Now enable it
sysrc cloudinit_enable="YES"
poweroff

# On your host system: Back it up
xz -k freebsd14-cloud-init-zfs.qcow2
```

# Using your own templates to launch custom-made VMs easily

## Create a cloud-init config

The SSH key I have there is the default one I have in SSH part of my home-manager config.

1. Create this file as `user-data.yaml` on the `$HOME/vms` folder as the basic template for all other machines:

```yaml
#cloud-config
hostname: freebsd1
users:
  - name: maikel
    shell: /usr/local/bin/fish
    sudo: ALL=(ALL) NOPASSWD:ALL
    lock_passwd: false
    # Use mkpasswd -m sha-512 to get this
    passwd: "$6$L80IKTwDwcfp......josH0"
    ssh_authorized_keys:
      - ssh-ed25519 AAAA......ikel.dev
ssh_pwauth: True
keyboard:
  layout: es
packages:
  - fish
  - sudo
  - mkpasswd
  - neovim
  - ncdu
  - git
runcmd:
  # Enable SSH
  - sysrc sshd_enable=YES
  - service sshd start
  # OPTIONAL: Set Spanish keyboard permanently
  - sysrc keymap="es.kbd"
  - service syscons restart
  # OPTIONAL: set root and maikel shells to fish explicitly
  - pw usermod root -s /usr/local/bin/fish
  - pw usermod maikel -s /usr/local/bin/fish
  # OPTIONAL: Auto resize main partition
  - gpart recover vtbd0
  - gpart resize -i 4 vtbd0
  - zpool online -e zroot /dev/vtbd0p4
```

2. Use this command to create a CD-ROM ISO to launch it from. Assuming you're in `$HOME/vms`:

```bash
cloud-localds seed.iso user-data.yaml
```

## Creating the final machine using the ZFS image

```bash
# Access the folder of your vms
cd $HOME/vms

# Decompress the fresh cloud-init-enabled version we created before
xz -dk freebsd14-cloud-init-zfs.qcow2.xz

# Rename it to something more useful to distinguish it from the template
cp freebsd14-cloud-init-zfs.qcow2 freebsd1.qcow2

# Create the seed ISO from user-data.yaml in case you've made any changes
cloud-localds freebsd1.iso user-data.yaml

# Make the disk bigger here it is set to 20G but you can do whatever size you like
qemu-img resize freebsd1.qcow2 50G

virt-install \
  --name freebsd1 \
  --memory 4096 \
  --vcpus 4 \
  --disk path=freebsd1.qcow2,format=qcow2,bus=virtio \
  --disk path=freebsd1.iso,device=cdrom \
  --os-variant freebsd14.0 \
  --import \
  --network network=maikenet,model=virtio \
  --graphics spice \
  --noautoconsole
```

And that's it, your system should be up and running ready to be used. Because you enabled NSS and added your default SSH key (default in `.ssh/config`), you can just log into it with a simple:

```bash
ssh maikel@freebsd1
```

...once the machine finishes running all of its cloud-init script.

![Image](/assets/images/2025/09/image-4.png)

# Extra steps for your own sanity

## Resizing the partition to use all available space (ZFS)

If you want your system to use all the available space in your qcow2 file after resizing it you'll need some extra steps. This can all be added on the user-data template though which I did so you don't need to.

```bash
# Ensure vtbd0 is the name of it
gpart show

# Resize partition
gpart recover vtbd0

# Get the slice or number of partition, in my case is 4
gpart show

# This is assuming the slice is 4
gpart resize -i 4 vtbd0

# Again the end "p4" depends on the slice number
zpool online -e zroot /dev/vtbd0p4

# Check with
zpool list
```

That's all your machine is ready to use. If you ever need to change the size of the qcow2 file repeat those steps.

## Autostart this machine with NixOS

Run on the host machine:

```bash
virsh autostart freebsd1
```

Otherwise to start manually:

```bash
virsh start freebsd1
```

## Detach cloud-init disk just in case

Normally cloud-init runs only once, but just to be sure on the host machine:

```bash
# To find the name of the ISO device, in my case "hda"
virsh domblklist freebsd1

# To both remove it and ensure it never comes back after reboot
virsh change-media freebsd1 hda --eject --config --live
```

## Cloning user data

I create this mostly because I was considering the Zerotier one that is far below and realised I can kill two birds with one shot.

```fish
function clone_user_data
  if test (count $argv) -ne 1
    echo "Usage: clone_user_data <vmname>"
    return 1
  end

  set NEWVM $argv[1]
  set BASE "$HOME/vms/user-data.yaml"
  set vm_dir $HOME/vms/in_use/$vm
  mkdir -p $vm_dir
  set OUT "$vm_dir/$NEWVM-user-data.yaml"

  if not test -f $BASE
    echo "Error: base file $BASE does not exist"
    return 1
  end

  # Replace hostname line
  sed "s/^hostname:.*/hostname: $NEWVM/" $BASE > $OUT
  echo "Created config: $OUT"
end
```

## Creating machines quickly with Fish function

At the moment I separate creating the user-data file for that machine from creating it because precisely we might want to change what is installed on the machine. So this is how I normally do it now:

```fish
# Assuming decompressed ready cloud image on ~/vms
# Create a user-data file for that machine
clone_user_data freebsd4

# Edit it
vi $HOME/vms/in_use/freebsd4/freebsd4-user-data.yaml

# Create the machine
create_vm freebsd4
```

Then create the machine:

```fish
function create_vm
  if test (count $argv) -lt 1
    echo "Usage: createvm <vm-name>"
    return 1
  end

  set vm $argv[1]
  set vm_dir $HOME/vms/in_use/$vm
  cd $vm_dir

  echo "Copying template to VM disk..."
  cp $HOME/vms/freebsd14-cloud-init-zfs.qcow2 $vm.qcow2

  echo "Creating seed ISO..."
  cloud-localds $vm.iso $vm-user-data.yaml

  echo "Resizing disk..."
  qemu-img resize $vm.qcow2 20G

  echo "Launching VM..."
  virt-install \
    --connect qemu:///system \
    --name $vm \
    --memory 4096 \
    --vcpus 4 \
    --disk path=$vm.qcow2,format=qcow2,bus=virtio \
    --disk path=$vm.iso,device=cdrom \
    --os-variant freebsd14.0 \
    --import \
    --network network=maikenet,model=virtio \
    --graphics spice \
    --noautoconsole

  echo "VM $vm launched."
end
```

## Destroying machines quickly with Fish shell

```fish
function destroy_vm
  if test (count $argv) -lt 1
    echo "Usage: destroyvm <vm-name>"
    return 1
  end

  set vm $argv[1]
  echo "Destroying VM $vm..."
  virsh destroy $vm

  echo "Undefining VM $vm..."
  virsh undefine $vm

  set disk ~/vms/in_use/$vm/$vm.qcow2
  set seed ~/vms/in_use/$vm/$vm.iso
  set userdata ~/vms/in_use/$vm/$vm-user-data.yaml

  if test -f $disk
    echo "Deleting disk $disk..."
    rm -f $disk
  else
    echo "Disk $disk not found, skipping."
  end

  if test -f $seed
    echo "Deleting seed $seed..."
    rm -f $seed
  else
    echo "Disk $seed not found, skipping."
  end

  if test -f $userdata
    echo "Deleting user-data $userdata..."
    rm -f $userdata
  else
    echo "Disk $userdata not found, skipping."
  end

  rm -rf $HOME/vms/in_use/$vm
end
```

## Zerotier on creation with self-authorisation

This is something I'm experimenting with, installing Zerotier and joining a network are easy steps but I want it to self-authorise too. It does works as it currently is but I want the variables to be fed into the cloud config somehow instead of hard-coding the variables.

Then once the machine is up and running you can just and simply run `/root/join-network.sh` as root.

I set a few variables to simplify this all, for example I want the fish functions to be in the vm folder as they are all related to this.

```fish
# This loads functions from the path in the vms add to config.fish
set -g fish_function_path $fish_function_path ~/vms/fish_functions

# This sets the default password I want to use for my machines which is later hashed by mkpasswd, can be set from the shell
set -Ua DEFAULT_VM_PASSWORD whatever_passw_you_want
```

I also did a few more changes here and in the cloning function since now this is my standard user-data.yaml template:

```yaml
#cloud-config
hostname: {{VM_NAME}}
users:
  - name: maikel
    shell: /usr/local/bin/fish
    sudo: ALL=(ALL) NOPASSWD:ALL
    lock_passwd: false
    passwd: "{{PASSWD}}"
    ssh_authorized_keys:
      - {{SSH_PUBKEY}}
ssh_pwauth: True
keyboard:
  layout: es
packages:
  - fish
  - sudo
  - mkpasswd
  - neovim
  - ncdu
  - zerotier
  - curl
  - jq
write_files:
  - path: /root/join-network.sh
    permissions: '0755'
    content: |
      #!/bin/sh
      zerotier-cli join "{{NWID}}" && \
      MEMBER_ID=$(zerotier-cli info | awk '{print $3}') && \
      curl -H "Authorization: token {{ZT_TOKEN}}" -X POST \
      "https://api.zerotier.com/api/v1/network/{{NWID}}/member/$MEMBER_ID" \
      --data '{"config": {"authorized": true}}'
runcmd:
  # Enable SSH
  - sysrc sshd_enable=YES
  - service sshd start
  # Set Spanish keyboard permanently
  - sysrc keymap="es.kbd"
  - service syscons restart
  # Optional: set root and maikel shells to fish explicitly
  - pw usermod root -s /usr/local/bin/fish
  - pw usermod maikel -s /usr/local/bin/fish
  # Auto resize main partition
  - gpart recover vtbd0
  - gpart resize -i 4 vtbd0
  - zpool online -e zroot /dev/vtbd0p4
  # Zerotier joy
  - sysrc zerotier_enable="YES"
  - service zerotier start
```

Applying the ZT_TOKEN and ZT_NW with a Fish-shell function `clone_user_data VM_NAME`:

```fish
function clone_user_data
  if test (count $argv) -ne 1
    echo "Usage: clone_user_data <vmname>"
    return 1
  end

  set NEWVM $argv[1]
  set BASE "$HOME/vms/user-data.yaml"
  set VM_DIR "$HOME/vms/in_use/$NEWVM"
  mkdir -p "$VM_DIR"
  echo "Created directory $VM_DIR"

  set OUT "$VM_DIR/$NEWVM-user-data.yaml"

  if not test -f $BASE
    echo "Error: base file $BASE does not exist"
    return 1
  end

  if test -z "$ZT_TOKEN"
    echo "Error: ZT_TOKEN environment variable not set"
    return 1
  end

  if test -z "$ZT_NWID"
    echo "Error: ZT_NWID environment variable not set"
    return 1
  end

  if test -z "$DEFAULT_VM_PASSWORD"
    echo "Error: DEFAULT_VM_PASSWORD environment variable not set"
    return 1
  end

  # Generate hashed password
  set PASSWD (mkpasswd -m sha-512 $DEFAULT_VM_PASSWORD)

  # Extract default identity file from ssh config (already a .pub in your setup)
  set PUBKEYFILE (grep -m1 -i 'IdentityFile' ~/.ssh/config | awk '{print $2}' | sed "s|~|$HOME|")

  if test -z "$PUBKEYFILE"
    echo "Error: could not find IdentityFile in ~/.ssh/config"
    return 1
  end

  if not test -f $PUBKEYFILE
    echo "Error: public key $PUBKEYFILE not found"
    return 1
  end

  set PUBKEY (cat $PUBKEYFILE)

  sed \
    -e "s|{{VM_NAME}}|$NEWVM|g" \
    -e "s|{{NWID}}|$ZT_NWID|g" \
    -e "s|{{ZT_TOKEN}}|$ZT_TOKEN|g" \
    -e "s|{{PASSWD}}|$PASSWD|g" \
    -e "s|{{SSH_PUBKEY}}|$PUBKEY|" \
    $BASE >$OUT

  if test $status -ne 0
    echo "Error: failed to generate $OUT"
    return 1
  end

  echo "Created config: $OUT"
end
```

## Installing a desktop environment

I use KDE, it really just needs to read the handbook and follow it step by step. I even created its own `desktop-user-data.yaml` file for this one in case I ever need the desktop.

The yaml file for cloudinit:

```yaml
#cloud-config
hostname: desktop
users:
  - name: maikel
    shell: /usr/local/bin/fish
    sudo: ALL=(ALL) NOPASSWD:ALL
    lock_passwd: false
    passwd: "$6$L80IKTw............osH0"
    ssh_authorized_keys:
      - ssh-ed25519 ....... maikel.dev
ssh_pwauth: True
keyboard:
  layout: es
packages:
  - fish
  - sudo
  - mkpasswd
  - neovim
  - ncdu
  - xorg
  - kde
  - sddm
runcmd:
  # Enable SSH
  - sysrc sshd_enable=YES
  - service sshd start
  # Set Spanish keyboard permanently
  - sysrc keymap="es.kbd"
  - service syscons restart
  # Optional: set root and maikel shells to fish explicitly
  - pw usermod root -s /usr/local/bin/fish
  - pw usermod maikel -s /usr/local/bin/fish
  # Auto resize main partition
  - gpart recover vtbd0
  - gpart resize -i 4 vtbd0
  - zpool online -e zroot /dev/vtbd0p4
  # Add KDE
  - pw groupmod video -m maikel
  - sysrc dbus_enable="YES"
  - service dbus start
  - sysctl net.local.stream.recvspace=65536
  - sysctl net.local.stream.sendspace=65536
  - sysctl -f /etc/sysctl.conf
  - sysrc sddm_enable="YES"
  - sysrc sddm_lang="es_ES"
  - setxkbmap -layout es
  - service ssdm start
```

The machine has a few differences, I assigned more total system memory (8GB) and hiked the RAM assigned to the video card too. My mouse is a USB one so only works with that line in input. If yours isn't USB delete that line.

```bash
virt-install \
  --connect qemu:///system \
  --name desktop \
  --memory 8192 \
  --vcpus 4 \
  --disk path=desktop.qcow2,format=qcow2,bus=virtio \
  --disk path=desktop.iso,device=cdrom \
  --os-variant freebsd14.0 \
  --import \
  --video qxl,ram=524288,vram=262144,vgamem=262144 \
  --network network=maikenet,model=virtio,mac=52:54:00:6f:3c:58 \
  --input type=mouse,bus=usb \
  --graphics spice \
  --noautoconsole
```

<div class="kg-card kg-callout-card kg-callout-card-blue"><div class="kg-callout-emoji">💡</div><div class="kg-callout-text" markdown="1">
The Fish function **create_vm** won't work for this because the definition is for a non-GUI machine. But you can use the Fish function **clone_user_data** to get the MAC and fix the IP. Since this was a one off, I didn't care about automating it. As soon as I discovered the **hours-long** nightmare that is [installing VSCode in FreeBSD](https://freebsdfoundation.org/resource/how-to-use-vs-code-on-freebsd/) I realised I'm only using it for servers and appliances.
</div></div>

## Cleaning up

```bash
# See the machines
sudo virsh list --all

# The first stops immediately the machine
sudo virsh destroy freebsd14

# This second removes it from the pool of VMs of libvirtd
sudo virsh undefine freebsd14

# Delete any pre-made seed just in case
rm -rf seed.iso
```

# Extra: Repo with all this

I made a repo with all these commands including a pre-made ZFS-ready FreeBSD 14.3 image.

The URL is [https://github.com/maikelthedev/libvirtd_automation](https://github.com/maikelthedev/libvirtd_automation)

# Some oddities

These are some painful parts from the process.

## The command `virt-install` and "~"

I don't know why the path can't interpret "~" hence why I did it all from the `$HOME/vms` folder. In this version I changed "~" to `$HOME` in all scripts for consistency.

## Run without virt-viewer

Sometimes you want to install and see nothing, in those case use:

```bash
--graphics spice \
--noautoconsole
```

At the end of the `virt-install` command, this runs the system with graphics enable but doesn't attach any viewer to it.

