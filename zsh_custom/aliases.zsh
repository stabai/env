alias src="exec zsh"
alias ohmy="code $(dirname $(dirname $0))/env.code-workspace"

quick_folder "my" "$HOME"

addalias() {
  alias_name="$1"
  shift
  alias $alias_name="$@"
  echo "alias $alias_name=\"$@\"" >> $ZSH_CUSTOM/aliases.zsh
}

shawn() {
  fortune | cowsay -f $(ls /home/linuxbrew/.linuxbrew/Cellar/cowsay/3.04_1/share/cows/*.cow | shuf -n1)
}

alias yuni="open ~/Downloads/yuni.jpg"
