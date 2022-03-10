alias src="exec zsh"
alias ohmy="code $(dirname $(dirname $0))/env.code-workspace"

if [[ "$OSTYPE" == "linux-gnu"* ]]; then
  alias open="xdg-open"
fi

addalias() {
  alias_name="$1"
  shift
  alias $alias_name="$@"
  echo "alias $alias_name=\"$@\"" >> $ZSH_CUSTOM/aliases.zsh
}

alias shawn="fortune | cowsay"
alias yuni="open ~/Downloads/yuni.jpg"
