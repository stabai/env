alias g4d="cdg"

stashall() {
  git stash --include-untracked
}

groot() {
  git rev-parse --show-toplevel 2> /dev/null
}

cdg() {
  cd "$(groot)/$@"
}

branch() {
  git rev-parse --abbrev-ref HEAD
}

push() {
  git push || git push --set-upstream origin "$(branch)"
}

unstage() {
  git restore --staged $@
}

ignored() {
  git check-ignore **/* | grep -v node_modules
}

untracked() {
  git ls-files --others --exclude-standard
}

gitrepo() {
  git config --get remote.origin.url | sed -E "s~^git@([^:]*):(.*)\.git~https://\1/\2~" | sed -E "s~\.git\$~~"
}

gitreponame() {
  git config --get remote.origin.url | sed -E "s~\.git\$~~" | sed -E "s~.*/([^/]+)/([^/]+)\$~\1/\2~"
}

github() {
  GH_ROOT="$(gitrepo)"
  if [[ "$GH_ROOT" == "" ]]; then
    echo "Unable to find repo root."
    return 1
  fi
  GH_PATH="$(git rev-parse --show-prefix)"
  if [[ "$GH_PATH" == "" ]]; then
    open "$GH_ROOT"
  else
    open "$GH_ROOT/tree/$(branch)/$GH_PATH"
  fi
}

lss() {
  echo
  echo "$(tput smso)Contents of folder $(tput bold)$PWD$(tput sgr0)$(tput smso)$(tput rmso)"
  ls -al

  git_root="$(groot)"
  if [[ "$git_root" == "" ]]; then
    return  
  fi

  echo
  echo "$(tput smso)Git repo status for $(tput bold)$(gitreponame)$(tput sgr0)$(tput smso) ($(tput bold)$(gitrepo)$(tput sgr0)$(tput smso))$(tput rmso)"
  git status $@
}

alias gl="git log --graph --oneline --decorate --all"
alias rebase="git fetch && git rebase -i origin/main"
