#!/usr/bin/env python
# coding: utf-8

import os
from tornado.wsgi import WSGIContainer
from tornado.web import Application, FallbackHandler, StaticFileHandler
from tornado.ioloop import IOLoop
import anyjson as json
from app import app
from app.raspberrypi import RPI
from app.websocket import WSHandler


def broadcast(msg):
  RPI().toggle_led(7)
  for clientid, client in WSHandler.WSCLIENTS.items():
    client.write_message(json.dumps({'command': 'print', 'args': { 'msg': msg }}))

def broadcastButton(idx):
  RPI().toggle_led(7)
  for clientid, client in WSHandler.WSCLIENTS.items():
    client.write_message(json.dumps({'command': 'buttonPressed', 'args': { 'idx': idx }}))


def button_pressed(event):
  broadcastButton(event.pin_num)
  print("Flag:      ", bin(event.interrupt_flag))
  print("Capture:   ", bin(event.interrupt_capture))
  print("Pin num:   ", event.pin_num)
  print("Direction: ", event.direction)

if __name__ == '__main__':
  if RPI().on_pi:
    print 'Deployed on a Raspberry PI & PIFace'
  else:
    print 'Deployed on non Raspberry PI environment'

  wsgi_app = WSGIContainer(app)

  application = Application([
    (r'/websocket', WSHandler),
    (r'/static/(.*)', StaticFileHandler, {'path': os.path.join(os.path.dirname(os.path.realpath(__file__)), 'static')}),
    (r'.*', FallbackHandler, dict(fallback=wsgi_app))
    ])

  application.listen(8080)

  RPI().register_listener(0, button_pressed)
  RPI().register_listener(1, button_pressed)
  RPI().register_listener(2, button_pressed)
  RPI().register_listener(3, button_pressed)
  RPI().activate()

  print "Server active: http://localhost:8080/"
  try:
    IOLoop.instance().start()
  except:
    print "Server shutting down!"

  RPI().shutdown()
