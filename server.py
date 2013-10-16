#!/usr/bin/env python
# coding: utf-8

import os
from tornado.wsgi import WSGIContainer
from tornado.web import Application, FallbackHandler, StaticFileHandler
from tornado.ioloop import IOLoop
import anyjson as json
from app import app
from app.raspberrypi import RaspberryPI
from app.websocket import WSHandler

if RaspberryPI().on_pi:
    print 'Deployed on a Raspberry PI & PIFace'


def broadcast(msg):
    for clientid, client in WSHandler.WSCLIENTS.items():
        client.write_message(json.dumps({'output': msg}))
        RaspberryPI().toggle_led(7)


def button_pressed(event):
    broadcast('You pressed button %s.' % event.pin_num)
    print("Flag:      ", bin(event.interrupt_flag))
    print("Capture:   ", bin(event.interrupt_capture))
    print("Pin num:   ", event.pin_num)
    print("Direction: ", event.direction)

if __name__ == '__main__':
    wsgi_app = WSGIContainer(app)

    application = Application([
        (r'/websocket', WSHandler),
        (r'/static/(.*)', StaticFileHandler, {'path': os.path.join(os.path.dirname(os.path.realpath(__file__)), 'static')}),
        (r'.*', FallbackHandler, dict(fallback=wsgi_app))
    ])

    application.listen(8080)

    RaspberryPI().activate()
    print "Server active: http://localhost:8080/"

    try:
        IOLoop.instance().start()
    except:
        print "Except!"

    RaspberryPI().shutdown()
