alias src="exec zsh"
alias ohmy="code $(dirname $(dirname $0))/env.code-workspace"
alias lsal="ls -al $@"
alias k="kubectl"
alias mk="minikube"

quick_folder "my" "$HOME"

addalias() {
  alias_name="$1"
  shift
  alias $alias_name="$@"
  echo "alias $alias_name=\"$@\"" >> $ZSH_CUSTOM/aliases.zsh
}

alias shawn="imgcat ~/Downloads/yuni.jpg"
alias yuni="imgcat ~/Downloads/yuni.jpg"
alias dockerclean="docker container prune && docker image prune -a"
