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

## "phpstan.neon" or "phpstan.neon.dist" configuration file

If you wish to use a [configuration file](https://phpstan.org/config-reference) you should place the `phpstan.neon` or `phpstan.neon.dist` file in the root of your project folder

## Configuration options ("coc-settings.json" or ".vim/coc-settings.json")

- `phpstan.enable`: Enable coc-phpstan extension, default: `true`
- `phpstan.toolPath`: The path to the phpstan (Absolute path), default: `""`
- `phpstan.level`: Specifies the rule level (0 - 8 and max) to run, If you apply this setting, the level setting in the phpstan.neon file will be ignored, e.g. valid option `"8"`, `"max"`, default: `null`
- `phpstan.configuration`: Specifies the path to a configuration file, default: `null`
- `phpstan.memoryLimit`: Specifies the memory limit in the same format php.ini accepts, Example: -1, 1024M, 2G, default: `"-1"`

## Commands

- `phpstan.download`: Download PHPStan

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

## License

MIT

---

> This extension is built with [create-coc-extension](https://github.com/fannheyward/create-coc-extension)
