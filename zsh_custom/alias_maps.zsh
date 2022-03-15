map_alias() {
  installed1="$(command -v $1)"
  installed2="$(command -v $2)"
  if [[ "$installed1" == "" && "$installed2" != "" ]]; then
    alias $1="$2"
  elif [[ "$installed2" == "" && "$installed1" != "" ]]; then
    alias $2="$1"
  fi
}

map_alias pico nano
map_alias code code-oss
map_alias open xdg-open
