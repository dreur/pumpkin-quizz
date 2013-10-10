# coding: utf-8
import anyjson as json
from tornado.websocket import WebSocketHandler
import pifacedigitalio


class WSHandler(WebSocketHandler):
    WSCLIENTS_COUNT = 0
    WSCLIENTS = {}
    def open(self):
        WSHandler.WSCLIENTS_COUNT += 1
        self.wsclientid = WSHandler.WSCLIENTS_COUNT
        WSHandler.WSCLIENTS[self.wsclientid] = self
        print 'new connection'
        self.write_message(json.dumps(dict(output="Hello World")))

    def on_message(self, incoming):
        pifacedigital = pifacedigitalio.PiFaceDigital()
        pifacedigital.leds[7].toggle()
        print 'message received %s' % incoming

        text = json.loads(incoming).get('text', None)
        msg = text if text else 'Sorry could you repeat?'

        response = json.dumps(dict(output='Parrot: {0}'.format(msg)))
        self.write_message(response)

    def on_close(self):
        del WSHandler.WSCLIENTS[self.wsclientid]
        print 'connection closed'
