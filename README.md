# Pumpkin Quizz

### Tech

Flask + Tornado + Websocket

### Installing Dependencies

    sudo apt-get install python-dev
    curl -O http://python-distribute.org/distribute_setup.py
    sudo python distribute_setup.py
    curl -O https://raw.github.com/pypa/pip/master/contrib/get-pip.py
    sudo python get-pip.py
    sudo pip install virtualenvwrapper

    git clone https://github.com/piface/pifacedigitalio.git
    pip install pifacedigitalio

    git clone https://github.com/piface/pifacecommon.git
    pip install pifacecommon

#### Add to bashrc

    export WORKON_HOME=$HOME/.virtualenvs
    export PROJECT_HOME=$HOME/Devel
    source /usr/local/bin/virtualenvwrapper.sh

### Get Ready running the project

    mkvirtualenv --no-site-packages pump-quizz
    pip install -r requirements.txt
    unblacklist Linux module in /etc/modprobe.d/raspi-blacklist.conf
       #blacklist spi-bcm2708

### Start Server
    workon pump-quizz
    python server.py
    
### Awesome git post-receive script
    #!/bin/sh

    PROJECT_DIR=/home/pi/projects/pump-quizz

    GIT_WORK_TREE=$PROJECT_DIR git checkout -f

    chmod u+x $PROJECT_DIR/restartServer.sh
    $PROJECT_DIR/restartServer.sh $PROJECT_DIR > /tmp/pump-quizz-git.log 2>&2
