# Note: You may have to add this command in .zshrc before sourcing oh-my-zsh.sh
# script. Any plugins that rely on applications installed through Homebrew may
# not work properly otherwise. But it doesn't matter if this command runs
# multiple times, so you can still leave this here.

if [[ -f "/home/linuxbrew/.linuxbrew/bin/brew" ]]; then
  eval "$(/home/linuxbrew/.linuxbrew/bin/brew shellenv)"
fi

if [[ -f "/opt/homebrew/bin/brew" ]]; then
  eval "$(/opt/homebrew/bin/brew shellenv)"
fi
