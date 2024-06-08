# Flutter X Neovim

## Introduction 
I mean Android Studio is awesome IDE, but it won't let us tweet "I use neovim". Now, enough introduction Let's start with the setup.

## LSP Configration
Mason natively do not support any dart language server protocol, because a dart lsp called dartls is configured on your local machine when you install flutter. In order to utilize the dartls, we pass some extra commands in our `lsp-config.nvim`:

`return {
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
}`

## Flutter tools
We want all the capabilities that Android studio provides i.e. `auto restart`, `auto start devtools`, `color previews`. In order to enable them we have to install `akinsho/flutter-tools.nvim`

`return {
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
}`

*Note : I have added shortcuts for most used Vim commands.*

## Telescope 
You can use flutter tools from `Telescope`, all you need to do is just add following 

-`require("telescope").load_extension("flutter")`

`return {
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
      require("telescope").load_extension("flutter")
    end,
  },
}`

## Screenshots


