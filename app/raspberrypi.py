import logging
from util import singleton

def OnPI(func):
    "Only execute this function when run on a RPI"
    def empty_func(*args,**kargs):
        pass
    if RPI().on_pi:
      return func
    return empty_func

@singleton
class RPI:
  "Singleton offering a Facade to all of RaspberryPi features"

  def __init__(self):
    try:
      import pifacecommon
      import pifacedigitalio
      pifacedigitalio.init()
      #pifacecommon.core.init()

      self.on_pi=True
    except Exception as ex:
      logging.exception("Something awful happened!")
      self.on_pi=False

    if self.on_pi:
      self.pifacecommon = pifacecommon
      self.pifacedigitalio = pifacedigitalio

      self.pifacedigital = pifacedigitalio.PiFaceDigital()
      self.listener = pifacedigitalio.InputEventListener(chip=self.pifacedigital)

  def register_listener(self, button_number, method):
    # set up listeners for all buttons
    if self.on_pi:
      self.listener.register(button_number, self.pifacecommon.interrupts.IODIR_ON, method, 2)

  def init(self):
    if self.on_pi:
      # self.pifacedigitalio.init()
      self.pifacedigital.output_ports[7].turn_off()
      self.pifacedigital.output_ports[6].turn_off()
      self.pifacedigital.output_ports[5].turn_off()
      self.pifacedigital.output_ports[4].turn_off()

  def activate(self):
    if self.on_pi:
      self.listener.activate()

  def shutdown(self):
    if self.on_pi:
      self.listener.deactivate()
      self.pifacedigitalio.init()

  def toggle_led(self, led_number):
    if self.on_pi:
      self.pifacedigital.leds[led_number].toggle()

  def all_on(self):
    if self.on_pi:
      try:
        print "Port All On"
        # self.pifacedigital.output_port.all_on()
        self.pifacedigital.output_port.all_on()
      except Exception as ex:
        logging.exception("Could not turn all output port on!")
      try:
        print "Relays All On"
        self.pifacedigital.relays.all_on()
      except Exception as ex:
        logging.exception("Could not turn all relays on!")
