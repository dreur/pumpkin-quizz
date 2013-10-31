# coding: utf-8
import anyjson as json
from tornado.websocket import WebSocketHandler
from raspberrypi import RPI


class WSHandler(WebSocketHandler):
    WSCLIENTS_COUNT = 0
    WSCLIENTS = {}

    def open(self):
        WSHandler.WSCLIENTS_COUNT += 1
        self.wsclientid = WSHandler.WSCLIENTS_COUNT
        WSHandler.WSCLIENTS[self.wsclientid] = self
        print 'New Connection'
        self.write_message(json.dumps(dict(output="Hello World")))

    def on_message(self, incoming):
        print 'Message received %s' % incoming
        jsonMessage = json.loads(incoming)

        RPI().toggle_led(7)

        if (jsonMessage.get('command', None)):
          print "Received command to turn all on"
          RPI().all_on();
        else:
          RPI().init();

    def on_close(self):
        del WSHandler.WSCLIENTS[self.wsclientid]
        print 'Connection Closed'
