#!/bin/bash

cd /home/pi/projects
curl -O http://python-distribute.org/distribute_setup.py
sudo python distribute_setup.py
curl -O https://raw.github.com/pypa/pip/master/contrib/get-pip.py
sudo python get-pip.py

sudo pip install virtualenvwrapper

cat >> $HOME/.bashrc <<EOF
export WORKON_HOME=$HOME/.virtualenvs
source /usr/local/bin/virtualenvwrapper.sh
EOF

source $HOME/.bashrc

mkvirtualenv --no-site-packages pump-quizz
workon pump-quizz

git clone https://github.com/piface/pifacecommon.git
pip install pifacecommon
git clone https://github.com/piface/pifacedigitalio.git
pip install pifacedigitalio

cd /home/pi/projects/pump-quizz

pip install -r requirements.txt
