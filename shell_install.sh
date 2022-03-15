#!/bin/bash

set -e

function install_compilers {
  if [ -x "$(command -v apt)" ]; then
    sudo apt install gcc build-essentials
    echo "✅ compilers successfully installed."
    return 0
  elif [ -x "$(command -v eopkg)" ]; then
    sudo eopkg install -c system.devel
    sudo eopkg install gcc
    echo "✅ compilers successfully installed."
    return 0
  elif [ -x "$(command -v xcode-select)" ]; then
    xcode-select --install
    echo "✅ curl was successfully installed."
  fi
}

function install_curl {
  if [[ "$OSTYPE" != "linux-gnu"* ]]; then
    echo "⛔ You don't have curl installed, and I don't how to install it on $OSTYPE."
    return 1
  fi

  if [ -x "$(command -v apt)" ]; then
    sudo apt install curl gcc build-essentials
    echo "✅ curl was successfully installed."
    return 0
  elif [ -x "$(command -v eopkg)" ]; then
    sudo eopkg install -c system.devel
    sudo eopkg install curl gcc
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

  install_compilers
  brew install deno gcc git wget
  echo "✅ Compilers and core utilities are installed."

  if ! [ -x "$(command -v deno)" ]; then
    echo "⛔ Can't find Deno in path, but it should have been installed by the previous step."
    return 1
  fi

  echo "✅ Homebrew, Deno, and compilers are installed!"
  echo
  echo "Run the following to continue installations:"
  echo "  ./deno_install.ts zsh"
  echo "  ./deno_install.ts oh-my-zsh"
  echo "  brew bundle"
  echo "  ./deno_install.ts"
}

preinstall
