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

Well, if you are having problems with the script installation, you can do it manually, so let's see how.

1. How to download, install and preview "Where is my sddm theme"

  - First we need to clone the original repository, so, how we do this?
    - Open your terminal and we are going to open a directory to not let the repository be where we dont want.
    - Once we are in the desired directory we can proceed to clone of the repository.
        - ```git clone https://github.com/stepanzubkov/where-is-my-sddm-theme```
        -Let's go inside the clone directory with ```cd wheres-is-my-sddm-theme```
      - Now we can run the ```sudo ./install_qt5.sh``` this need to be run in sudo, because need access to a directory in our files, which cannot reach if it doesn't have privileges.
      - We can preview the default theme of where is my sddm theme, with the following command:
        - ```sddm-greeter --test-mode --theme [folder location]```
        - **Note:** You need to change "[folder location]", for example ```/usr/share/sddm/themes/where_is_my_sddm_theme_qt5```

2. How to set "Where is my sddm theme" as the current sddm theme:
  - **Note:** We are going to change the default file of sddm, it's not a good practice but it's the only place we found it.
  - First we are going to open the directory where the sddm config file is, so execute this on your terminal:
    - ```cd /usr/lib/sddm/sddm.conf.d/```
    - Once we are in this directory just open the config file:
      - ```sudo vim default.conf```
      - Here you only need to change a line, so be careful and don't edit anything else.
      - Inside vim you can use ```/Current``` to search for the line will be editing, so once you found it just change after the ```=``` and just add ```wheres_my_sddm_theme_qt5```
        - After this just press ```ESC``` and write ```:wq```. 
      - At this point if you reboot you will see the default theme of where is my sddm theme.

3. So let's change the theme of where is my sddm theme

  - The first thing we have to do is open the where_is_my_sddm_theme directory
    - In our terminal execute the following commmand ```cd /usr/share/sddm/themes/where_is_my_sddm_theme_qt5/example_configs```.
    - Once we are in this directory you will have some themes to choose you can see the themes in the original repository.
        - For this example we will be using the tree theme
        - Before the next step just verify that you are in the ```example_configs``` directory.
        - So we are going to execute the next commands:
            ```sudo cp tree.conf ../theme.conf```
            And for the Background Image we execute the following command:
            ```sudo cp tree.png ../tree.png```
    - There is a common problem with the background Image which can have some white margins with the screen, so to fix this we have to do the following step.
      - In the directory ```cd /usr/share/sddm/themes/where_is_my_sddm_theme_qt5/``` we need to edit the file named ```theme.conf```, to do this we use *vim*.
      - So lets execute ```sudo vim theme.conf```
      - Once we are in this file we need to add the following line:
         ```backgroundMode=fill```
      - After this we have finish, so you can do the same steps for the other themes.
    
  We finished our sddm ricing in the manual way.

### Kde

@T.crow edit here

## Acknowledgement

After editing, you can add your name here

- Leanghok (Article structure and scripts)
- Kyup (Intallation guide in the manual way)
- Name (work)
