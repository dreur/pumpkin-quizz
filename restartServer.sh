#!/bin/sh

cd $1

serverPid=
if [ -f server.pid ]; then
    serverPid=$(cat server.pid)
    echo "Killing $serverPid"
    ps -ef | grep $serverPid
    kill -- -$( ps opgid= $serverPid | tr -d ' ' ) || true
    rm server.pid
fi

nohup $HOME/.virtualenvs/pump-quizz/bin/python2.7 server.py > /tmp/pump-quizz.log 2>&1&

serverPid=$!
ps -ef | grep $serverPid

echo $serverPid > server.pid

