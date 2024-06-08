# Meta keybindings with iTerm

## TL;DR

Open up your iTerm preferences, go to `Profiles` -> `Keys,` and set the `Left option key` and `Right option key` to `+Esc.` Uncheck the "Apps can override" checkbox for added peace of mind.

![iterm-preferences](https://github.com/mthomps4/blog-posts/blob/main/posts/iterm-meta-keys/images/iterm-profile-keys.png)

## The Full Story

Setting up Tmux and Neovim to work together is honestly pretty trivial with the suitable packages and config [(see typecrafts video here)](https://youtu.be/_YaI2vDbk0o?si=cH00Rvh-pDwcYZnY). However, one thing that can be annoying is the meta keybindings. Take the keybinding `<M-j>` or `<M-k>,` for example, to move lines up and down in [LazyVim](http://www.lazyvim.org). The command should be simple enough, right?! Hold Alt over a line and move up and down; that makes sense. However, if you're using iTerm, you might look at your monitor and wonder why it's not working until you realize it has nothing to do with Tmux or Neovim setup.

![Why-oh-that-why-meme](https://github.com/mthomps4/blog-posts/blob/main/posts/iterm-meta-keys/images/why-meme.png)

By default, iTerm does not send the correct escape sequences for the meta key; instead, the default is "normal" (whatever that means). Worse, the default allows other apps to override the keybindings. This default means that even if you have your Tmux and Neovim configured correctly, iTerm may be allowing Tmux or other app preferences to get in the way of Neovim when you press the Alt key. It kinda becomes a "Who's on first" situation. To get meta keys working with Neovim, we have two other options, "Meta" and "Esc+."

## Some context

As mentioned, iTerm has three configuration options for our Alt keys: Normal, Meta, and Esc+. According to our lovely friend Chat GPT, each setting means something different.

### Normal

**Behavior:** The Alt key functions as the standard Option key on a Mac.

**Usage:** The Alt key enters special characters (like © for Alt + g).

### Meta

**Behavior:** The Alt key is treated as the Meta key, a modifier key used in many Unix systems and text editors like Emacs.

**Usage:** This is useful for applications that recognize the Meta key and send Meta-prefixed key sequences.

### Esc+

**Behavior:** The Alt key sends an escape sequence (ESC) followed by the character you type.

**Usage:** This is useful for terminal applications and editors like Vim, where Alt key combinations (like Alt + j) are interpreted as escape sequences (e.g., ESC+j).

### Example Use Case in Vim

**Normal:** Pressing Alt + j might not send any special sequence that Vim recognizes.

**Meta:** Vim might not interpret Alt + j correctly because it expects an escape sequence.

**Esc+:** Pressing Alt + j will send ESC+j to Vim, which Vim can interpret as Alt + j.

## Until next time

For more "How To's" and "TIL's," follow me on [Twitter(X) @mthomps4](https://twitter.com/mthomps4).
Thanks for reading!
