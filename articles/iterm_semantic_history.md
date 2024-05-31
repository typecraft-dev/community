---
title: "iTerm Semantic History with Neovim"
tags: ["vim", "iterm", "iterm2", "neovim", "terminal_emulator"] 
author: "n8wm@icloud.com"
featured_image: "https://cdn.discordapp.com/attachments/1246197478181572729/1246197586445078580/logo2x.png?ex=665b8371&is=665a31f1&hm=0adf1bb0b6732583123829d952ac372b009e948a49172aa76604652abc545742&"
---

*PSA for those who use iTerm and Neovim*

iTerm has a profile setting called "semantic history" that allows you to define the behavior of cmd-clicking on a file name in the command line. By default, it will open the default app for the file. But instead, I found myself wanting to open things in Neovim like 95% of the time. Not only is this possible, but you can even set it to automatically jump to the correct line number if one exists! Here is the solution:

Navigate to **Settings** > **Profiles** (pick your profile) > **Advanced** and scroll down to **Semantic History**. In the dropdown, select **Run coprocess...** and in the "*Enter command*" textbox, enter the following command:

```bash
[ -z "\2" ] && echo nvim \1 || echo nvim +\2 \1
```

![Setting Semantic History](https://cdn.discordapp.com/attachments/1246197478181572729/1246198696929001513/Screenshot_2024-05-31_at_1.26.40_PM.png?ex=665b847a&is=665a32fa&hm=2eedd80328355eb1bedfd24c865723093677277b9cf9262ce7880e654ed241a4&)

## Demo
Here is a quick demo of the cmd-click functionality this enables...

![Feature Demo](https://cdn.discordapp.com/attachments/1246197478181572729/1246199562125971506/semantic_history_demo.gif?ex=665b8548&is=665a33c8&hm=0a9327c03a38c7e335776eec6c3cc6147fa9d03935ff570eeaeaaf2dbc3728de&)

## Optional Filesystem Navigation
I am a chaotic individual and decided to make another version of this command with the added functionality of navigating my filesystem with my mouse using chained `ls` outputs. This enables navigating directories and opening files simply by cmd-clicking output from the `ls` command. It does this by calling `cd` if the cmd-clicked path is a directory, and then it calls `ls` again. Also, with this version, Neovim can be opened in the current working directory if the PS1 prompt is cmd-clicked.

Here is the altered coprocess command for the **Semantic History** setting, use this at your own risk (becoming overly reliant on your mouse may be considered a felony by some).

```bash
[ -d "\1" ] && ([ "\5" = "\1" ] && echo nvim \1 || echo "cd \1 && ls") || ([ -z "\2" ] && echo nvim \1 || echo nvim +\2 \1)
```


