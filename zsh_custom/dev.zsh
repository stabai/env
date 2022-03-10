# Create a dev.private.zsh file as well, and set the DEV variable to whatever
# folder you store code in.
# For example:
#   DEV="$HOME/Code"

devdir() {
  echo "$DEV"
}

dev() {
  cd "$DEV/$@"
}

complete -C "ls -d $(devdir)/*/ | sed -E 's#.*/([^/]+)/#\1#'" dev
