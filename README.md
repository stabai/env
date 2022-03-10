# env

Setup for shell environment on dev machines

## How to Run

Running the [shell_install.sh](shell_install) script will start you off setting
up your dev environment and guide you to the next steps.

```shell
./shell_install.sh
```

Once the shell script succeeds in installing Homebrew and the brew bundle, it
will instruct you to continue by running the Deno installer script:

```shell
./deno_install.ts
```

The Deno script allows elegant handling of more complicated installations, so
the majority of the work is done there. However, it's unlikely that Deno is
installed on a fresh system, so the bash script first installs it if needed.

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
  3. Snap (Linux only)
  4. Flatpak (Linux only)
  5. Nix
  6. UI Apps
     - Chrome
     - Visual Studio Code
     - Zoom
     - Slack
     - Discord
     - Insomnia
     - GitHub Desktop
     - Karabiner-Elements (Mac only)
     - Alfred (Mac only)
     - AltTab (Mac only)
     - DevToys (Mac only)
     - Iterm (Mac only)
