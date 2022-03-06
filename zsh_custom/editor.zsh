if [[ -n $SSH_CONNECTION ]]; then
  export EDITOR='pico'
else
  export EDITOR='code -w'
fi