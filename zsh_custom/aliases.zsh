alias ohmy="code $(dirname $(dirname $0))/env.code-workspace"

if [[ "$OSTYPE" == "linux-gnu"* ]]; then
  alias open="xdg-open"
fi

alias stubby="grpc_cli"

alias hdd="cd /mnt/hdd"
alias dev="cd /mnt/hdd/IdeaProjects"
