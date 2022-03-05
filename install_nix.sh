#!/bin/bash

function install_nix {
  nix_location="$(which nix-shell)"
  if [[ "$?" == "0" && "$1" != "-f" ]]; then
    echo "Nix is already installed: $nix_location"
    echo "If you wish to install manually anyways, use -f flag."
    return 0
  fi
  if [[ ! -z "$IS_WSL" ]]; then
    sh <(curl -L https://nixos.org/nix/install) --no-daemon
  elif [[ "$OSTYPE" == "linux-gnu"* ]]; then
    sh <(curl -L https://nixos.org/nix/install) --daemon
  elif [[ "$OSTYPE" == "darwin"* ]]; then
    sh <(curl -L https://nixos.org/nix/install)
  else
    echo "Unsupported OS type: $OSTYPE"
    echo "Install manually: https://nixos.org/download.html"
    return 1
  fi
}

install_nix $1
