#!/usr/bin/env python
# coding: utf-8
from time import sleep
import datetime
import threading
import pifacedigitalio
import pifacecommon.core
import pifacecommon.interrupts
import os
from tornado.wsgi import WSGIContainer
from tornado.web import Application, FallbackHandler
from tornado.ioloop import IOLoop
import anyjson as json
from app.websocket import WSHandler
from app import app

def broadcast(msg):
  for clientid,client in WSHandler.WSCLIENTS.items():
    client.write_message(json.dumps({'output':msg}))
    pifacedigital = pifacedigitalio.PiFaceDigital()
    pifacedigital.leds[7].toggle()

def send_events():
  while True:
    for clientid,client in WSHandler.WSCLIENTS.items():
      datestr = unicode(datetime.datetime.now().replace(microsecond=0))
      client.write_message(json.dumps({'output':datestr}))
    sleep(1)


quit = False

def button_pressed(event):
    broadcast('You pressed button %s.' % event.pin_num)
    print("Flag:     ", bin(event.interrupt_flag))
    print("Capture:  ", bin(event.interrupt_capture))
    print("Pin num:  ", event.pin_num)
    print("Direction:", event.direction)

pifacedigitalio.init()
pifacecommon.core.init()

# GPIOB is the input ports, including the four buttons.
port = pifacecommon.core.GPIOB

listener = pifacecommon.interrupts.PortEventListener(port)

# set up listeners for all buttons
listener.register(0, pifacecommon.interrupts.IODIR_ON, button_pressed)
listener.register(1, pifacecommon.interrupts.IODIR_ON, button_pressed)
listener.register(2, pifacecommon.interrupts.IODIR_ON, button_pressed)
listener.register(3, pifacecommon.interrupts.IODIR_ON, button_pressed)


if __name__ == '__main__':
    wsgi_app = WSGIContainer(app)

    application = Application([
        (r'/websocket', WSHandler),
        (r'.*', FallbackHandler, dict(fallback=wsgi_app))
    ])

    application.listen(5000)

    #t = threading.Thread(target=send_events)
    #t.daemon = True
    #t.start()
    
    # Start listening for events.  This spawns a new thread.
    listener.activate()

    print "Server active: http://localhost:5000/"

    try:    
	IOLoop.instance().start()
    except:
        print "Except!"	
    
    listener.deactivate()
    pifacedigitalio.init()
