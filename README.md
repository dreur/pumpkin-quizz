# Pumpkin Quizz

For Nakina Systems Pumpkin Carving Contest!

https://www.youtube.com/watch?v=z-0BPkHR6m8

### State

In Development! - Not ready for Halloween Yet!

#### TODO
1. Use Halloween Font
2. Configure background and music for questions
3. Do whole workflow of Quizz
4. Present Answers and Score
5. Highscore!

### Tech

Hardware: Raspberry PI Model B + PI Face

Components:

Software: Flask + Tornado + Websocket

### Raspberry PI Setup

1. Enable Default Raspbian's Desktop OpenBox
2. Unblacklist SPI Kernel Module

  in /etc/modprobe.d/raspi-blacklist.conf comment the SPI driver:
  `#blacklist spi-bcm2708`
  
3. Upgrade your OS

  `sudo apt-get update`
  
### Software Dependencies

Python dev:

    sudo apt-get install python-dev
    
Distribute and Pip:

    curl -O http://python-distribute.org/distribute_setup.py
    sudo python distribute_setup.py
    curl -O https://raw.github.com/pypa/pip/master/contrib/get-pip.py
    sudo python get-pip.py
    
VirtualEnv and VirtualEnvWrapper:

    sudo pip install virtualenvwrapper

PI Face's Common and IO lib:

    git clone https://github.com/piface/pifacecommon.git
    pip install pifacecommon
    git clone https://github.com/piface/pifacedigitalio.git
    pip install pifacedigitalio

#### Setup Virtual Env Wrapper

    export WORKON_HOME=$HOME/.virtualenvs
    export PROJECT_HOME=$HOME/Devel
    source /usr/local/bin/virtualenvwrapper.sh

### Create the project

    mkvirtualenv --no-site-packages pump-quizz
    pip install -r requirements.txt

### Start Server

    workon pump-quizz
    python server.py
    # Connect to http://localhost:5000/
    
### Awesome git post-receive script

    #!/bin/sh

    PROJECT_DIR=/home/pi/projects/pump-quizz

    GIT_WORK_TREE=$PROJECT_DIR git checkout -f

    chmod u+x $PROJECT_DIR/restartServer.sh
    $PROJECT_DIR/restartServer.sh $PROJECT_DIR > /tmp/pump-quizz-git.log 2>&2
