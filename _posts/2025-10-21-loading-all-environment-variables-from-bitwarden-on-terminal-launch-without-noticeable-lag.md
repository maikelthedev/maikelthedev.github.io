---
layout: post
title: "Loading all environment variables from Bitwarden on terminal launch without noticeable lag"
date: "2025-10-21"
excerpt: "Solving the major issue of Bitwarden being incredibly slow to load environment variables by combining rbw, jq and fish shell"
image: "/assets/images/unsplash-1614064641938.jpg"
tags:
  - security
  - tools
  - Bitwarden
  - NixOS
---

# The problem I'm trying to solve

If you use Bitwarden you might have tried using [Bitwarden CLI](https://bitwarden.com/help/cli/) which is a nightmare of a tool clearly not fit for purpose.

The main problem with it is that it takes between 1 to 5 seconds for every value you retrieve. The secondary problem is that unlike any other official Bitwarden implementation it is impossible to remain logged in without writing your own scripts to store BW_SESSION (logging with api credentials), pass it between shell sessions or make it universal and still make it so that it tests it works and relogs again if the session token has expired. Considering this again costs between 1 to 5 seconds it is too much time to waste whenever you open a new terminal.

I use [Fish shell](https://fishshell.com/), it's been my favourite shell for more than ten years, it does stuff that all other shells should be doing now without plugins required. In Fish shell when you make a universal environment variable with `set -U VARIABLE`, it doesn't magically get into the ether or stored in memory, it gets writen on the filesystem on `$HOME/.config/fish/fish_variables` and I definitely don't want that there.

So we have two problems, on one side the official bitwarden cli takes ages with any command, and on the other side I don't want to keep the session alive by writing the token to a file anywhere on my system.

# RBW entered the room

The program `rbw` is a command-line tool that does the same job as Bitwarden-CLI albeit very **very **differently. To begin with the commands are not the same, and the way you search for stuff is not the same either. But the most important value of `rbw` is that it maintains the connection logged unlike the official CLI tool.

It has a small issue, which is that it doesn't accept [Webauth/FIDO2 as 2FA right now](https://github.com/doy/rbw/issues/292#issuecomment-3425564942) but you can bypass this issue enabling any of the other accepted 2FA ways. In fact I enabled TOTP and it worked beautifully, I was asked for the temporal number combo only once the first time. You can use bitwarden itself as TOTP generator for this since you already have other login mechanisms for it.

That done, one problem was solved, login with `rbw` is very easy after installing it, if you use Bitwarden's official vault, same as I do, do not forget the `register` command as explained in the [rbw repo](https://github.com/doy/rbw) also if you use Nixos add `pinsentry-tty` to your packages, not `pinsentry` not any GUI version, you want the one for the terminal . Then do:
<code ># To configure it rbw config set email your@ema.il # Lock timeout in seconds, I prefer 16 hours, covers the time I'm awake rbw config set lock_timeout $(math "60*60*16") # To log in rbw login `</pre><p>And that's it. You don't need to do anything else. Any changes in config will ask you to login again the next time you try to get anything out of Bitwarden. With this we've solved the second problem, keeping environment variables anywhere on our system to stay connected.

# Next issue: RBW speed has limits

So imagine I want to set up a function called `load_bitwarden_vars` that I call at the very end of `config.fish` so something like this
<code >function load_bitwarden_vars set -gx GITHUB_CLIENT_ID $(rbw get github -f client_id) set -gx GITHUB_CLIENT_SECRET $(rbw get github -f client_secret) set -gx ZT_TOKEN $(rbw get zerotier -f token) set -gx ZT_NWID $(rbw get zerotier -f network_id) end`</pre><p>The `rbw` tool has the advantage over `bw` that it is a lot faster retrieving data, milliseconds, not seconds. But the more calls you do to it during start up of fish shell the slower it gets for you to see the shell prompt whenever you open a window. This is unwieldly. I don't have 4 vars, I have plenty more of them. After filling up my `load_bitwarden_vars.fish` file containing the function this took a very **unacceptable **long time.

I came up with the idea of putting each var directly as an alias or abbreviation of the tool it uses them. So, e.g: vault became either
<code ># option 1 abb --add vault "TOKEN=$(rbw get...) vault" # option 2 alias vault "TOKEN=$(rbw get...) /run/current-system/sw/bin/vault"`</pre><p>Yet alias has the issue of needing the whole vault path (Nixos) otherwise it becomes an infinite loop and Fish doesn't allow it. And both have the major issue of computing the values when Fish launches so very slow.

# The solution

One call, just one. It doesn't matter how big is the item, with just one call it still takes less than a second. So I created an item called `tokens` in Bitwarden, I made it as a note, but it really doesn't matter if you store it as a login, identity or anything else because `rbw` doesn't care of what it is when it retrieves it with `rbw get tokens` all that matters is the custom fields I created.

For each one of the variables I want to retrieve I created a hidden text field, with the exact name of the variable. For conveniency I used Bitwarden-desktop for this but you could easily use the CLI tool or `rbw` itself to do so. I just had to do too much copy and paste from different places so prefered the visual GUI.
![Image](/assets/images/2025-10-image-2.png)
The elegance of this approach is that I get to name all vars directly on Bitwarden as custom-fields, no sign of them in my fish config files.

So now to get Fish to load them type `funced load_bitwarden_vars` and add this to it
<code >function load_bitwarden_vars set TOKENS $(rbw get tokens --raw) for pair in (printf "%s" "$TOKENS" | jq -r '.fields[] | "\(.name)=\(.value)"') set -l parts (string split -m1 = $pair) set -gx $parts[1] $parts[2] end end `</pre><p>Then `funcsave load_bitwarden_vars` to store it in `$HOME/.config/fish/functions/load_bitwarden_vars.fish` and then add at the end of `$HOME/.config/fish/config.fish` the function name `load_bitwarden_vars` to run it after everything else of your config has loaded. In my case being at the end was quite important as I have modifiers for `PATH` in this file.

Now to test it fully lock your vault with `rbw lock` and close your terminal window. Open a newone and you should see 👇
![Image](/assets/images/2025-10-image-3.png)
Once you log in, close the shell and open it again. This time it doesn't ask for anything, you'll notice a very small lag but one you can **comfortably** live with. In fact try to open multiple terminal windows.

You've tested both cases, being logged and locked. As you see it works.

**Problem solved! **🥳

# How it works

It's pretty simple actually, it uses the speed of `rbw` for any given item, combined with JQ to set the variables without making them universal so they don't get written to disk.

1. We take the whole output as json of the item tokens from Bitwarden and assign it to the local variable TOKENS
2. With JQ we extract from the fields array on TOKENS each one of the pairs of name and value  custom fields we created. Format them as lines name=value
3. With a for loop we iterate over each one of those lines and assign them to pair
4. The inner content of the loop asigns each part of part to the corresponding local variables name and value.
5. The final line inside the loop assigns the globally exported variable. So that shell window and any subshells get the values.

I'm sure it can be improved and if you come up with ideas feel free to provide me some feedback. I'm not entirely sure of the difference between the types of variables. I mean universal, local and function environment variables are pretty self-explanatory but exported and global are not that clear. The manual says exported makes them available to child processes, but how's that different from global? Feel free to share some light to me about this in Mastodon.

# Useful links

- Fish shell scope in the Fish manual, very important to understand how set -U works.
- RBW repo page in Github.
