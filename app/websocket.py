# coding: utf-8
import anyjson as json
from tornado.websocket import WebSocketHandler
from raspberrypi import RaspberryPI


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
        RaspberryPI().toggle_led(7)
        print 'Message received %s' % incoming

        text = json.loads(incoming).get('text', None)
        msg = text if text else 'Sorry could you repeat?'

        response = json.dumps(dict(output='Parrot: {0}'.format(msg)))
        self.write_message(response)

    def on_close(self):
        del WSHandler.WSCLIENTS[self.wsclientid]
        print 'Connection Closed'
