# coc-phpstan

[PHPStan](https://phpstan.org/) (PHP Static Analysis tool) extension for [coc.nvim](https://github.com/neoclide/coc.nvim).

<img width="780" alt="coc-phpstan-demo" src="https://user-images.githubusercontent.com/188642/119638316-7fc24a80-be51-11eb-8b0e-5ec592a90154.gif">

## Install

**CocInstall**:

```vim
:CocInstall @yaegassy/coc-phpstan
```

> scoped package

**vim-plug**:

```vim
Plug 'yaegassy/coc-phpstan', {'do': 'yarn install --frozen-lockfile'}
```

## Features

- Linter
- CodeAction
- Downloader

## Detect tool: phpstan

1. `phpstan.toolPath` setting
1. `vendor/bin/phpstan` (project)
1. Extension-only `phpstan` retrieved by the download feature (`:CocCommand phpstan.download`)
   - Mac/Linux: `~/.config/coc/extensions/@yaegassy/coc-phpstan-data/phpstan`
   - Windows: `~/AppData/Local/coc/extensions/@yaegassy/coc-phpstan-data/phpstan`

## "phpstan.neon", "phpstan.neon.dist" or "phpstan.dist.neon" configuration file

If you wish to use a [configuration file](https://phpstan.org/config-reference) you should place the `phpstan.neon`, `phpstan.neon.dist` or `phpstan.dist.neon` file in the root of your project folder

## Linting of NEON file

This extension includes a feature to perform linting using the `neon-js` library in a phpstan configuration file (`phpstan.neon`, `phpstan.neon.dist` or `phpstan.dist.neon`).

To run this linting feature, you need the following 2 additional settings.

1. The "filetype" must be `yaml.neon` for this `neon-js` lint to work.

   Please add the following settings to your `.vimrc` or `init.vim` file.

   ```vim
   au BufNewFile,BufRead *.neon,*.neon.dist set ft=yaml.neon
   ```

2. You also need to set `g:coc_filetype_map` in `.vimrc` or `init.vim`.

   ```vim
   let g:coc_filetype_map = {
     \ 'yaml.neon': 'neon',
     \ }
   ```

---

- [DEMO](https://github.com/yaegassy/coc-phpstan/pull/2#issue-1700077931)

## Configuration options ("coc-settings.json" or ".vim/coc-settings.json")

- `phpstan.enable`: Enable coc-phpstan extension, default: `true`
- `phpstan.toolPath`: The path to the phpstan (Absolute path), default: `""`
- `phpstan.level`: Specifies the rule level (0 - 9 and max) to run, If you apply this setting, the level setting in the phpstan.neon file will be ignored, e.g. valid option `"9"`, `"max"`, default: `null`
- `phpstan.configuration`: Specifies the path to a configuration file, default: `null`
- `phpstan.memoryLimit`: Specifies the memory limit in the same format php.ini accepts, Example: -1, 1024M, 2G, default: `"-1"`
- `phpstan.download.checkOnStartup`: Perform built-in download if phpstan is not present at startup, default: `true`
- `phpstan.neonLint.enable`: Enable neon-js lint (diagnostics). It will only work if the file name is `phpstan.neon`, `phpstan.neon.dist` or `phpstan.dist.neon`, default: `true`

## Commands

- `phpstan.download`: Download PHPStan
- `phpstan.showOutput`: Show phpstan output channel

## Code Actions

**Example key mapping (Code Action related)**:

```vim
nmap <silent> ga <Plug>(coc-codeaction-line)
```

**Usage**:

In the line with diagnostic message, enter the mapped key (e.g. `ga`) and you will see a list of code actions that can be performed.

**Actions**:

- `Add @phpstan-ignore-next-line`
- `Add @phpstan-ignore-line`

## Thanks

- [phpstan/phpstan](https://github.com/phpstan/phpstan)
- [matej21/neon-js](https://github.com/matej21/neon-js)

## License

MIT

---

> This extension is built with [create-coc-extension](https://github.com/fannheyward/create-coc-extension)
