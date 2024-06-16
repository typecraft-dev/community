---
title: "XDG and Tmux Plugins"
tags: ["XDG", "TPM", "tmux"] 
author: "alecthegeek"
featured_image: "./resources/xdg-and-tmux/robot.jpeg"
---
<!--
This work is copyright Alec Clews 2014.

It is licensed under a Creative Commons ATTRIBUTION-SHAREALIKE 4.0 INTERNATIONAL license https://creativecommons.org/licenses/by-sa/4.0/ 
-->
<figure>
<img src="./resources/xdg-and-tmux/robot.jpeg" alt="A cartoon of a robot with the words tmux" style="width:500px;"/>
<figcaption>Image credit: DALL.E 3 AI</figcaption>
</figure>

## What are we talking about?

This post explains how to configure the tmux plugin manager, specifically when the tmux configuration is located in the `~/.config/tmux`
directory, and is managed with a dotfiles tool like [GNU Stow](https://learn.typecraft.dev/tutorial/never-lose-your-configs-again/).

If you use [tmux](https://learn.typecraft.dev/tmux-for-newbs/) then hopefully your
`tmux.conf` file is located somewhere like `$HOME/.config/tmux/tmux.conf`,
because you are using the [XDG Base Directory Specification](https://specifications.freedesktop.org/basedir-spec/basedir-spec-latest.html).

<a href="https://imgflip.com/i/8u0tpg"><img src="https://i.imgflip.com/8u0tpg.jpg" title="made at imgflip.com"/></a><div><a href="https://imgflip.com/memegenerator">from Imgflip Meme Generator</a></div>

I'm told that is what all the cool kids do.

However, the [tmux Plugin Manager](https://github.com/tmux-plugins/tpm?tab=readme-ov-file#readme)(TPM)
will then install plugin files in `$HOME/.config/tmux/plugins`, and suddenly your dotfiles repo is
populated with a set of files that you probably don't want to track.

There are a couple of options:

1. Modify the dotfiles manager configuration, or `.gitignore`, to ignore these additional files and avoid saving them in the repo
2. Install the plugin files somewhere else outside `~/.config`.

Fortunately TPM allows us to install our plugin files anywhere we want via the the
[`TMUX_PLUGIN_MANAGER_PATH`](https://github.com/tmux-plugins/tpm/blob/master/docs/changing_plugins_install_dir.md)
setting,
so we will take option number 2.

The XDG Base Directory Specification does suggest a potential location to install the plugin files.
To quote from the documentation

> User-specific executable files may be stored in $HOME/.local/bin

So let's configure TPM to use the `.local/bin` location to store the plugin files.

## How To

1. Create an install directory for TPM managed plugins, `mkdir -p ~/.local/bin/tmux/plugins`

1. Install TPM to the new location with `git clone https://github.com/tmux-plugins/tpm ~/.local/bin/tmux/plugins/tpm`

1. Edit the tmux configuration file (`~/.config/tmux/tmux.conf`)
   
   a. Add the following setting at the top:

      ```
      set-environment -g TMUX_PLUGIN_MANAGER_PATH "$HOME/.local/bin/tmux/plugins"
      ```

   b. You also need to change the syntax of the `set -g @plugin` statements. For example:

      ```
      set -g @tpm_plugins ' \
          tmux-plugins/tpm \
          christoomey/vim-tmux-navigator \
          jimeh/tmux-themepack \
      '
      ```

      (see https://raw.githubusercontent.com/tmux-plugins/tpm/master/docs/tpm_not_working.md on why this is needed)

   c. Finally edit the tmux `run` statement to reflect the new path (it should be the last line in `tmux.conf`)

      ```
      run "$HOME/.local/bin/tmux/plugins/tpm/tpm"
      ```

1. plugins can now be installed by running `$HOME/.local/bin/tmux/plugins/tpm/bin/install_plugins`

**NOTE**:Plugins can be updated by running `$HOME/.local/bin/tmux/plugins/tpm/bin/update_plugins all`.

## References:

* https://github.com/tmux-plugins/tpm/blob/master/docs/tpm_not_working.md
* https://specifications.freedesktop.org/basedir-spec/basedir-spec-latest.html
* https://github.com/tmux-plugins/tpm/issues/114#issuecomment-315960729

## About Alec

Alec is a neck beard who lives and works on Bunurong Land, Melbourne, Australia. He loves
working with APIs and yak shaving. He learnt vi so long ago he still can't use the fancy
visual mode in Vim.
You can find him online in most places as [alecthegeek](https://alecthegeek.gitlab.io/).
Feel free to reach out on [Mastodon](https://mstdn.social/@alecthegeek)