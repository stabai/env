# env

Setup for shell environment on dev machines

## How to Run

Running the [shell_install.sh](shell_install) script will start you off setting
up your dev environment and guide you to the next steps.

```shell
./shell_install.sh
```

## Preinstalled Packages

Most things that are already installed will be skipped. However, the Homebrew
bundle sometimes fails to notice software that was installed from another
source.

## What Gets Installed

- shell_install.sh
  1. Homebrew
  2. Homebrew [bundle](Brewfile)
- deno_install.ts
  1. Zsh
  2. Oh My Zsh
  3. Snap
  4. Flatpak
  5. Nix
  6. UI Apps
     - Chrome
     - Visual Studio Code
     - Zoom
     - Slack
     - Discord
     - Insomnia
     - GitHub Desktop