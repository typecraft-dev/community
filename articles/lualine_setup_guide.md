# Lualine - A complete guide
Let's be honest, we all want a cool looking neovim setup and statusline is one major essence of it. But the problem is, we have to choose from pre-designed statusline, which lacks our own touch and getting to figure out how to design it and making it our own is pure pain.

What if there was a easier way ?, Well I mean there is (that is why is I'm writing this article, otherwise it is pretty lame to mention it) and It is called -

## Lualine

It is a blazingly fast and easy to configure Neovim statusline written in lua. Well, this pretty much defines itself. But this is not what we are interested in, we want to created our own statusline from scratch.

## Installation

If You are a newbie, I will recommend going through [Typecraft's Neovim for noobs series](https://www.youtube.com/watch?v=zHTeCSVAFNY&list=PLsz00TDipIffreIaUNk64KxTIkQaGguqn).

## Understanding lualine

Lualine is divided in six sections i.e. `a`, `b`, `c` (left) - `x`, `y`, `z` (right).

These sections are placeholder for the components that we want to put on the statusline.

```
  lualine_a = {}
  lualine_b = {}
  lualine_c = {}
  lualine_x = {}
  lualine_y = {}
  lualine_z = {}
```
This is how we can access section in lualine. You can insert one or more components in each section. **But wait what the hell are components ?**

## Components 

Neovim provides us with multiple components that can be used to represent useful information about projects and files we are working on, i.e.

- `branch` : represent the current branch of a git repository.
- `buffers` : shows currently available buffers.
- `diagnostics` : shows errors, warning, hint in files.
- `diff` : shows git diff status (add, deletion, modified)
- `encoding` : shows file encoding.
- `fileformat` : shows file format (UNIX, DOS, MAC).
- `filename` : shows file name.
- `filesize` : show file sizea.
- `filetype` : show file type (.lua, .go, etc).
- `hostname` : shows hostname (remote sessions)
- `location` : shows location in file in line:column format.
- `mode` : shows mode (NORMAL, INSERT, VISUAL, COMMAND). 
- `progress` : shows %progress in file.
- `searchcount` : shows number of search matches when hlsearch is active.
- `selectioncount` : shows number of selected characters or lines.
- `tabs` : shows currently available tabs.
- `windows` : shows currently available windows.

All these components comes out of the box when we install neovim, but what if you wanna make one yourself (Don't worry, I got you). All you need is some basic lua and you can create your own components that is ready to use in lualine.

Let's start with basic custom component,

```
local function helloWorld()
  return [[Hello World]]
end
```
Now, all we did is create a lua `function` which returns 'Hello World' and this is all you need to create a custom component, just make a function which returns a string value.

*Note: I'll show exactly how you can use custom components with muc more complex example.*

## Component Options 
Component options can change the way a component behave. There are two kinds of options:

- global options affecting all components
- local options affecting specific

Global options can be used as local options (can be applied to specific components) but you cannot use local options as global. Global option used locally overwrites the global, for example:

```
require('lualine').setup {
  options = { fmt = string.lower }, -- global option
  sections = { 
    lualine_a = {
      { 'mode', fmt = function(str) return str:sub(1,1) end } -- local option
    },
    lualine_b = {'branch'} 
  }
}
```

`mode` will be formatted with the passed function so only first char will be shown . On the other hand branch will be formatted with global formatter string.lower so it will be showed in lower case.

*Note : Please read about local option for component in lualine docs, if you are looking for something specific (Sorry I couldn't cover all of it).*

## Building our own statusline with lualine

First, Basic configration for lualine:
```
-- Color Palette for Lualine

local colors = {
  bg = "#131517",
  fg = "#bbc2cf",
  yellow = "#ECBE7B",
  cyan = "#008080",
  darkblue = "#081633",
  green = "#98be65",
  orange = "#FF8800",
  violet = "#a9a1e1",
  magenta = "#c678dd",
  blue = "#51afef",
  red = "#ec5f67",
}

-- Colors for different modes.
local mode_color = {
  n = colors.red,
  i = colors.green,
  v = colors.blue,
  [""] = colors.blue,
  V = colors.blue,
  c = colors.magenta,
  no = colors.red,
  s = colors.orange,
  S = colors.orange,
  ic = colors.yellow,
  R = colors.violet,
  Rv = colors.violet,
  cv = colors.red,
  ce = colors.red,
  r = colors.cyan,
  rm = colors.cyan,
  ["r?"] = colors.cyan,
  ["!"] = colors.red,
  t = colors.red,
}


local conditions = {
  buffer_not_empty = function()
    return vim.fn.empty(vim.fn.expand("%:t")) ~= 1
  end,
  hide_in_width = function()
    return vim.fn.winwidth(0) > 80
  end,
  check_git_workspace = function()
    local filepath = vim.fn.expand("%:p:h")
    local gitdir = vim.fn.finddir(".git", filepath .. ";")
    return gitdir and #gitdir > 0 and #gitdir < #filepath
  end,
}

-- Custom component to get current github username.

local getGithubUsername = function()
  local handle = io.popen("git config user.name")
  local result = " " .. handle:read("*a")
  return string.sub(result, 1, -2)
end


local config = {
  options = {
    -- Disable sections and component separators
    component_separators = "",
    section_separators = "",
    theme = {

      -- We are going to use lualine_c an lualine_x as left and
      -- right section. Both are highlighted by c theme .  So we
      -- are just setting default looks o statusline
      normal = { c = { fg = colors.fg, bg = colors.bg } },
      inactive = { c = { fg = colors.fg, bg = colors.bg } },
    },
  },
  sections = {
    -- these are to remove the defaults
    lualine_a = {},
    lualine_b = {},
    lualine_y = {},
    lualine_z = {},
    -- These will be filled later
    lualine_c = {},
    lualine_x = {},
  },
  inactive_sections = {
    -- these are to remove the defaults
    lualine_a = {},
    lualine_b = {},
    lualine_y = {},
    lualine_z = {},
    lualine_c = {},
    lualine_x = {},
  },
}
```
We are only going to use `lualine_c` and `lualine_x` for more control over middle section. In order to easily insert components in lualine sections, let's create 2 functions `insert_right` and `insert_left` : 
```
-- Inserts a component in lualine_c at left section
local function insert_left(component)
  table.insert(config.sections.lualine_c, component)
end

-- Inserts a component in lualine_x at right section
local function insert_right(component)
  table.insert(config.sections.lualine_x, component)
end
```
Now, we move on to each component we going to use in lualine.


1. Neovim mode - `mode`

```
insert_left({
  "mode",
  -- auto change color according to neovims mode
  color = { fg = mode_color[vim.fn.mode()], gui = "bold" } 
  end,

  icons_enabled = true,
  padding = { left = 1 },
})
```
2. File size - `filesize`

```
insert_left({
  "filesize",
  icons_enabled = true,
  cond = conditions.buffer_not_empty,
})
```
3. File name - `filename`

```
insert_left({
  "filename",
  cond = conditions.buffer_not_empty,
  color = { fg = colors.magenta, gui = "bold" },
})
```
4. Location - `location`

```
insert_left({ "location" })
```

5. Diagnostics - `diagnostics`

```
insert_left({
  "diagnostics",
  sources = { "nvim_diagnostic" },
  symbols = { error = " ", warn = " ", info = " ", hint = " " },
  colored = true,
  diagnostics_color = {
    error = { fg = colors.red }, -- Changes diagnostics' error color.
    warn = { fg = colors.yellow }, -- Changes diagnostics' warn color.
    info = { fg = colors.cyan }, -- Changes diagnostics' info color.
    hint = { fg = colors.green }, -- Changes diagnostics' hint color.
  },
})
```
6. Custom component to create middle section 

```
-- Insert mid section. You can make any number of sections in neovim :)
-- for lualine it's any number greater then 2
insert_left({
  function()
    return "%="
  end,
})
```
7. Custom component (for cool look)

```
insert_left({
  -- mode component
  function()
    return "->>  <<-"
  end,
  -- auto change color according to neovims mode
  color = { fg = mode_color[vim.fn.mode()] }
  end,
  padding = { left = 2, right = 1 },
}
```

1. LSP Name (custom component that get us current LSP name we are using, I was taking about this earlier).
```
insert_right({
  function()
    local msg = "No Active Lsp"
    local buf_ft = vim.api.nvim_buf_get_option(0, "filetype")
    local clients = vim.lsp.get_active_clients()
    if next(clients) == nil then
      return msg
    end
    for _, client in ipairs(clients) do
      local filetypes = client.config.filetypes
      if filetypes and vim.fn.index(filetypes, buf_ft) ~= -1 then
        return client.name
      end
    end
    return msg
  end,
  icon = "",
  color = { fg = colors.orange },
})
```

2. Github Username
```
insert_right({
  getGithubUsername,
  color = { fg = colors.cyan },
})
```

3. Branch
```
insert_right({
  "branch",
  icon = "",
  color = { fg = colors.violet, gui = "bold" },
})
```

4. File type
```
insert_right({
  "filetype",
  icon_only = true,
  colored = true,
})
```

5. Diff
```
insert_right({
  "diff",
  -- Is it me or the symbol for modified us really weird
  symbols = { added = " ", modified = " ", removed = " " },
  diff_color = {
    added = { fg = colors.green },
    modified = { fg = colors.orange },
    removed = { fg = colors.red },
  },
  cond = conditions.hide_in_width,
})
```
We are almost done.

### Final lua file : 

```
local colors = {
  bg = "#131517",
  fg = "#bbc2cf",
  yellow = "#ECBE7B",
  cyan = "#008080",
  darkblue = "#081633",
  green = "#98be65",
  orange = "#FF8800",
  violet = "#a9a1e1",
  magenta = "#c678dd",
  blue = "#51afef",
  red = "#ec5f67",
}

local mode_color = {
  n = colors.red,
  i = colors.green,
  v = colors.blue,
  [""] = colors.blue,
  V = colors.blue,
  c = colors.magenta,
  no = colors.red,
  s = colors.orange,
  S = colors.orange,
  ic = colors.yellow,
  R = colors.violet,
  Rv = colors.violet,
  cv = colors.red,
  ce = colors.red,
  r = colors.cyan,
  rm = colors.cyan,
  ["r?"] = colors.cyan,
  ["!"] = colors.red,
  t = colors.red,
}


local conditions = {
  buffer_not_empty = function()
    return vim.fn.empty(vim.fn.expand("%:t")) ~= 1
  end,
  hide_in_width = function()
    return vim.fn.winwidth(0) > 80
  end,
  check_git_workspace = function()
    local filepath = vim.fn.expand("%:p:h")
    local gitdir = vim.fn.finddir(".git", filepath .. ";")
    return gitdir and #gitdir > 0 and #gitdir < #filepath
  end,
}

local getGithubUsername = function()
  local handle = io.popen("git config user.name")
  local result = " " .. handle:read("*a")
  return string.sub(result, 1, -2)
end

-- Config
local config = {
  options = {
    -- Disable sections and component separators
    component_separators = "",
    section_separators = "",
    theme = {
      -- We are going to use lualine_c an lualine_x as left and
      -- right section. Both are highlighted by c theme .  So we
      -- are just setting default looks o statusline
      normal = { c = { fg = colors.fg, bg = colors.bg } },
      inactive = { c = { fg = colors.fg, bg = colors.bg } },
    },
  },
  sections = {
    -- these are to remove the defaults
    lualine_a = {},
    lualine_b = {},
    lualine_y = {},
    lualine_z = {},
    -- These will be filled later
    lualine_c = {},
    lualine_x = {},
  },
  inactive_sections = {
    -- these are to remove the defaults
    lualine_a = {},
    lualine_b = {},
    lualine_y = {},
    lualine_z = {},
    lualine_c = {},
    lualine_x = {},
  },
}

-- Inserts a component in lualine_c at left section
local function insert_left(component)
  table.insert(config.sections.lualine_c, component)
end

-- Inserts a component in lualine_x at right section
local function insert_right(component)
  table.insert(config.sections.lualine_x, component)
end

insert_left({
  "mode",
  color = function()
    -- auto change color according to neovims mode
    local mode_color = {
      n = colors.red,
      i = colors.green,
      v = colors.blue,
      [""] = colors.blue,
      V = colors.blue,
      c = colors.magenta,
      no = colors.red,
      s = colors.orange,
      S = colors.orange,
      ic = colors.yellow,
      R = colors.violet,
      Rv = colors.violet,
      cv = colors.red,
      ce = colors.red,
      r = colors.cyan,
      rm = colors.cyan,
      ["r?"] = colors.cyan,
      ["!"] = colors.red,
      t = colors.red,
    }
    return { fg = mode_color[vim.fn.mode()], gui = "bold" }
  end,

  icons_enabled = true,
  padding = { left = 1 },
})

insert_left({
  -- filesize component
  "filesize",
  icons_enabled = true,
  cond = conditions.buffer_not_empty,
})

insert_left({
  "filename",
  cond = conditions.buffer_not_empty,
  color = { fg = colors.magenta, gui = "bold" },
})

insert_left({ "location" })

insert_left({
  "diagnostics",
  sources = { "nvim_diagnostic" },
  symbols = { error = " ", warn = " ", info = " ", hint = " " },
  colored = true,
  diagnostics_color = {
    error = { fg = colors.red }, -- Changes diagnostics' error color.
    warn = { fg = colors.yellow }, -- Changes diagnostics' warn color.
    info = { fg = colors.cyan }, -- Changes diagnostics' info color.
    hint = { fg = colors.green }, -- Changes diagnostics' hint color.
  },
})

-- Insert mid section. You can make any number of sections in neovim :)
-- for lualine it's any number greater then 2
insert_left({
  function()
    return "%="
  end,
})

insert_left({
  -- mode component
  function()
    return "->>  <<-"
  end,
  color = function()
    -- auto change color according to neovims mode
    local mode_color = {
      n = colors.red,
      i = colors.green,
      v = colors.blue,
      [""] = colors.blue,
      V = colors.blue,
      c = colors.magenta,
      no = colors.red,
      s = colors.orange,
      S = colors.orange,
      ic = colors.yellow,
      R = colors.violet,
      Rv = colors.violet,
      cv = colors.red,
      ce = colors.red,
      r = colors.cyan,
      rm = colors.cyan,
      ["r?"] = colors.cyan,
      ["!"] = colors.red,
      t = colors.red,
    }
    return { fg = mode_color[vim.fn.mode()] }
  end,
  padding = { left = 2, right = 1 },
})

insert_right({
  function()
    local msg = "No Active Lsp"
    local buf_ft = vim.api.nvim_buf_get_option(0, "filetype")
    local clients = vim.lsp.get_active_clients()
    if next(clients) == nil then
      return msg
    end
    for _, client in ipairs(clients) do
      local filetypes = client.config.filetypes
      if filetypes and vim.fn.index(filetypes, buf_ft) ~= -1 then
        return client.name
      end
    end
    return msg
  end,
  icon = "",
  color = { fg = colors.orange },
})

insert_right({
  getGithubUsername,
  color = { fg = colors.cyan },
})

insert_right({
  "branch",
  icon = "",
  color = { fg = colors.violet, gui = "bold" },
})

insert_right({
  "filetype",
  icon_only = true,
  colored = true,
})

insert_right({
  "diff",
  -- Is it me or the symbol for modified us really weird
  symbols = { added = " ", modified = " ", removed = " " },
  diff_color = {
    added = { fg = colors.green },
    modified = { fg = colors.orange },
    removed = { fg = colors.red },
  },
  cond = conditions.hide_in_width,
})

return {
  "nvim-lualine/lualine.nvim",
  dependencies = { "nvim-tree/nvim-web-devicons" },
  config = function()
    require("lualine").setup(config)
  end,
}
```
