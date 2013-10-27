#!/bin/bash

# Disable DPMS / Screen blanking
xset -dpms
xset s off


# Pass the cwd of the project

if [ $# -gt 0 ]; then
  cd $1
fi

serverPid=
if [ -f server.pid ]; then
    serverPid=$(cat server.pid)
    rm server.pid
    if [ -n $serverPid ]; then
      echo "Killing $serverPid"
      if [ $(ps -ef | grep $serverPid | wc -l) -gt 1 ]; then
        kill -- -$( ps opgid= $serverPid | tr -d ' ' ) || true
      fi
    fi
fi

nohup $HOME/.virtualenvs/pump-quizz/bin/python2.7 -u server.py > /tmp/pump-quizz.log 2>&1 &

serverPid=$!
ps -ef | grep $serverPid

echo $serverPid > server.pid

