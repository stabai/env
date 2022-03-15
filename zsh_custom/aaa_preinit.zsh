quick_folder() {
  eval "$1() { cd \"$2/\$@\" }; complete -C \"ls -d $2/*/ | sed -E 's#.*/([^/]+)/#\1#'\" $1"
}
