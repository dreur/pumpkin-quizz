# Pumpkin Quizz

For Nakina Systems Pumpkin Carving Contest!

https://www.youtube.com/watch?v=z-0BPkHR6m8

<img src="http://github.bboudreau.ca/pumpkin-quizz/images/2013-10-31 11.09.06.jpg" alt="Setup Example" style="width: 200px;"/>

### State

Ready for Halloween!

#### Features
1. Uses Raspberry PI + PI Face
2. Uses Halloween Font
3. Configured background and music for questions
4. Amazing!
5. Presents Answers and Score
6. Flashes all outuputs and relays

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

  `sudo apt-get -y update && sudo apt-get -y full-update`

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
