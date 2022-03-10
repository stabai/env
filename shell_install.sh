#!/bin/bash

set -e

function install_curl {
  if [[ "$OSTYPE" != "linux-gnu"* ]]; then
    echo "⛔ You don't have curl installed, and I don't how to install it on $OSTYPE."
    return 1
  fi

  if [ -x "$(command -v apt)" ]; then
    sudo apt install curl
    echo "✅ curl was successfully installed."
    return 0
  elif [ -x "$(command -v eopkg)" ]; then
    sudo eopkg install curl
    echo "✅ curl was successfully installed."
    return 0
  fi

  echo "⛔ You don't have curl installed, and I don't know how to install it without apt or eopkg."
  return 1
}

function install_brew {
  /bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"

  if [[ "$OSTYPE" == "linux-gnu"* ]]; then
    test -d ~/.linuxbrew && eval "$(~/.linuxbrew/bin/brew shellenv)"
    test -d /home/linuxbrew/.linuxbrew && eval "$(/home/linuxbrew/.linuxbrew/bin/brew shellenv)"
    test -r ~/.bash_profile && echo "eval \"\$($(brew --prefix)/bin/brew shellenv)\"" >> ~/.bash_profile
    eval "$(brew --prefix)/bin/brew shellenv"
    echo "Homebrew was installed. It was added to the PATH for this session, but may not be"
    echo "for new terminals. Install Zsh and Oh My Zsh to ensure this is fixed."
  fi

  echo "✅ Homebrew was successfully installed."
}

function preinstall {
  if [ -x "$(command -v curl)" ]; then
    echo "✅ curl is installed."
  else
    install_curl
    echo "Run this script again to continue installations:"
    echo "  $0"
    return 0
  fi

  if [ -x "$(command -v brew)" ]; then
    echo "✅ Homebrew is installed."
  else
    install_brew
    echo "Run this script again to continue installations:"
    echo "  $0"
    return 0
  fi

  brew bundle
  echo "✅ All software in Homebrew bundle is installed."

  if ! [ -x "$(command -v deno)" ]; then
    echo "⛔ You don't have Deno installed, but it should have been installed with the Homebrew bundle."
    return 1
  fi

  echo "✅ Homebrew + bundle are installed!"
  echo "Run the following to continue installations:"
  echo "  ./deno_install.ts"
}

preinstall
