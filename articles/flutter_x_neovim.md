# Flutter X Neovim

## Introduction 
I mean Android Studio is awesome IDE, but it won't let us tweet "I use neovim". Now, enough introduction Let's start with the setup.

## LSP Configration
Mason natively do not support any dart language server protocol, because a dart lsp called dartls is configured on your local machine when you install flutter. In order to utilize the dartls, we pass some extra commands in our `lsp-config.nvim`:

<script src="https://gist.github.com/laggedskapari/7f0bf9e24bb6062f1d32263b36b73cba.js"/>

## Flutter tools
We want all the capabilities that Android studio provides i.e. `auto restart`, `auto start devtools`, `color previews`. In order to enable them we have to install `akinsho/flutter-tools.nvim`

<script src="https://gist.github.com/laggedskapari/e49f7cc617003983ced32d0d3d002dff.js"/>

*Note : I have added shortcuts for most used Vim commands.*

## Telescope 
You can use flutter tools from `Telescope`, all you need to do is just add following 

-`require("telescope").load_extension("flutter")`

<script src="https://gist.github.com/laggedskapari/b342eef1264b98d03a56b816eefe77fb.js"/>

## Screenshots


