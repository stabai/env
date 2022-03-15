# Create a dev.private.zsh file as well, and set the DEV variable to whatever
# folder you store code in.
# For example:
#   DEV="$HOME/Code"

devdir() {
  echo "$DEV"
}

quick_folder "dev" "$DEV"
