---
title: Ricing Sddm
tags: ["Sddm", "Ricing", "Linux", "Display Manager"]
author: leanghokoeng5@gmail.com
featured_image: "https://github.com/stepanzubkov/where-is-my-sddm-theme/blob/main/screenshots/tree.png?raw=true"
---

# Ricing Sddm

## Tables Of Contents

- [What is sddm?](#what-is-sddm?)
- [Installing sddm](#installing-sddm)
- [Installing a theme](#installing-a-theme)
- [Applying themes to sddm](#applying-themes-to-sddm)
    - [Script](#script)
    - [Manual](#manual)
    - [Kde](#kde)
- [Acknowledgement](#acknowledgement)

## What is sddm?

Simple Desktop Display Manager (sddm) is a display manager like gdm or lightdm for x11 and wayland.

## Installing Sddm

You can install sddm manually or use this script: [install-sddm](https://github.com/leanghok120/Install-Sddm-Theme).

**Note**: to theme sddm, you would need qt5, so make sure to install qt5.

- On arch-based distros: ```sudo pacman -S sddm```
- On debian-based distros: ```sudo apt install sddm```
- on redhat distros: ```sudo dnf install sddm```

After installing, we would need to enable sddm to use it

- Disable your current display manager: ```sudo systemctl disable gdm (or lightdm)```
- Enable sddm: ```sudo systemctl enable sddm```
- Reboot and you should see sddm instead of gdm or lightdm

## Installing a theme

There are tons of themes available for sddm, you can find them by just searching sddm themes but we're going to use a theme called [where is my sddm theme](https://github.com/stepanzubkov/where-is-my-sddm-theme)

**Note**: If you're going to use the install script, you can skip this part.

## Applying themes to sddm

After installing a theme, you would need to apply the theme (duh). You can do this 3 ways, use a script, do it manually, do it kde way (for kde folks).

### Script

You don't need to install the theme because the script does it for you. The script is on github (a star would be appreciated): https://github.com/leanghok120/Install-Sddm-Theme

```sh
git clone git@github.com:leanghok120/Install-Sddm-Theme.git
cd Install-Sddm-Theme
./install-theme.sh
```

After the script is finished, reboot your system and you should see a minimal display manager after booting into arch.

### Manual

@kyup edit here

### Kde

@T.crow edit here

## Acknowledgement

After editing, you can add your name here

- Leanghok (Article structure and scripts)
- Name (work)
- Name (work)
