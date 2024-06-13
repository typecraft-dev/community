---
title: "Flutter x Neovim"
tags: ["flutter", "dart", "neovim"] 
author: "robert@typecraft.dev"
featured_image: "https://github.com/laggedskapari/community/assets/53974841/345fabc4-23fe-4cac-a79f-a107a84576f9"

---

## Introduction 
Android Studio is an awesome IDE, but one of the major drawbacks is that it won't let us tweet "I use neovim, btw". Let's do what's necessary to keep that nerd cred. 

## LSP Configration
Mason does not natively support **any** dart language server protocol. However, when you install flutter, a dart lsp called `dartls` is configured. The trick is we need to add some configuration in our `lsp-config.nvim` file. 


```lua
return {
  {
    "williamboman/mason.nvim",
    config = function()
      require("mason").setup()
    end,
  },
  {
    "williamboman/mason-lspconfig.nvim",
    lazy = false,
    opts = {
      auto_install = true,
    },
  },
  {
    "neovim/nvim-lspconfig",
    config = function()
      local capabilities = require("cmp_nvim_lsp").default_capabilities()
      local lspconfig = require("lspconfig")
      
      lspconfig.lua_ls.setup({
        capabilities = capabilities,
      })
      lspconfig.dartls.setup({
        capabilities = capabilities,
        cmd = { "dart", "language-server", "--protocol=lsp" },
      })
      lspconfig.yamlls.setup({
        capabilities = capabilities,
      })
      
      vim.keymap.set("n", "K", vim.lsp.buf.hover, {})
      vim.keymap.set("n", "gd", vim.lsp.buf.definition, {})
      vim.keymap.set({ "n", "v" }, "<leader>ca", vim.lsp.buf.code_action, {})
    end,
  },
}
```

## Flutter tools
Now, we want all the capabilities that Android studio provides us, such as `auto restart`, `auto start devtools`, `color previews`. To enable them, we have to install `akinsho/flutter-tools.nvim`. I'd recommend creating a new lua file specifically for that. 

```lua
return {
  "akinsho/flutter-tools.nvim",
  lazy = false,
  dependencies = {
    "nvim-lua/plenary.nvim",
    "stevearc/dressing.nvim", -- optional for vim.ui.select
  },
  config = function()
    vim.keymap.set("n", "<leader>FS", ":FlutterRun <CR>", {})
    vim.keymap.set("n", "<leader>FQ", ":FlutterQuit <CR>", {})
    vim.keymap.set("n", "<leader>FR", ":FlutterRestart <CR>", {})
    vim.keymap.set("n", "<leader>LR", ":FlutterLspRestart <CR>", {})
    vim.keymap.set("n", "<leader>FD", ":FlutterDevTools <CR>", {})
    require("flutter-tools").setup({
      decorations = {
        statusline = {
          app_version = true,
          device = true,
        },
      },
      dev_tools = {
        autostart = true, -- autostart devtools server if not detected
        auto_open_browser = true, -- Automatically opens devtools in the browser
      },
      lsp = {
        color = { -- show the derived colours for dart variables
          enabled = true, -- whether or not to highlight color variables at all, only supported on flutter >= 2.10
        },
      },
    })
  end,
}
```

*Note : I have added shortcuts for most used Vim commands for flutter tools (you can remap them according to your comfort).*

## Telescope 
You can use flutter tools from `Telescope`. All you need to do is just add following to your telescope config file.

- `require("telescope").load_extension("flutter")`

```
return {
  {
    "nvim-telescope/telescope.nvim",
    tag = "0.1.5",
    dependencies = { "nvim-lua/plenary.nvim" },
    config = function()
      local builtin = require("telescope.builtin")
      vim.keymap.set("n", "<leader>o", builtin.find_files, {})
      vim.keymap.set("n", "<leader>fg", builtin.live_grep, {})
    end,
  },
  {
    "nvim-telescope/telescope-ui-select.nvim",
    config = function()
      require("telescope").setup({
        extensions = {
          ["ui-select"] = {
            require("telescope.themes").get_dropdown({}),
          },
        },
      })
      require("telescope").load_extension("ui-select")
      *require("telescope").load_extension("flutter")*
    end,
  },
}
```

## Screenshots
![image](https://github.com/laggedskapari/community/assets/53974841/2134e4d2-d449-41dd-8b90-0700f49b97b9)
![image](https://github.com/laggedskapari/community/assets/53974841/b9641885-a48c-4b0f-a3b8-e5fe49304bca)
![image](https://github.com/laggedskapari/community/assets/53974841/05303cff-9a16-46b0-94c4-cd74deb5bf0e)

## Conclusion 
Now, you are all set for you flutter development needs. You can add more features from `akinsho/flutter-tools` repository as you require them.
PS - If you want to clone my Neovim setup, you can clone my `dotfiles` [laggedskapari/.config](https://github.com/laggedskapari/.config.git)



