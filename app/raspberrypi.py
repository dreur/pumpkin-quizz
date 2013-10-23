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

  def __init__(self):
    try:
      import pifacecommon
      import pifacedigitalio
      self.on_pi=True
    except:
      self.on_pi=False

    if self.on_pi:
      pifacedigitalio.init()
      pifacecommon.core.init()

      self.pifacedigital = pifacedigitalio.PiFaceDigital()

      # GPIOB is the input ports, including the four buttons.
      port = pifacecommon.core.GPIOB
      self.listener = pifacecommon.interrupts.PortEventListener(port)

  def register_listener(self, button_number, method):
    # set up listeners for all buttons
    if self.on_pi:
      self.listener.register(button_number, pifacecommon.interrupts.IODIR_ON, method)

  def activate(self):
    if self.on_pi:
      self.listener.activate()

  def shutdown(self):
    if self.on_pi:
      self.listener.deactivate()
      pifacedigitalio.init()

  def toggle_led(self, led_number):
    if self.on_pi:
      self.pifacedigital.leds[led_number].toggle()
