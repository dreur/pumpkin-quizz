from util import singleton

def OnPI(func):
    "Only execute this function when run on a RaspberryPI"
    def empty_func(*args,**kargs):
        pass
    try:
      import pifacecommon
      import pifacedigitalio
      return func
    except:
      return empty_func

@singleton
class RaspberryPI:

  def __new__(cls):
    pass

  def __init__(self):
    self.on_pi=True
    try:
      import pifacecommon
      import pifacedigitalio
    except:
      self.on_pi=False

    pifacedigitalio.init()
    pifacecommon.core.init()

    self.pifacedigital = pifacedigitalio.PiFaceDigital()

    # GPIOB is the input ports, including the four buttons.
    port = pifacecommon.core.GPIOB
    self.listener = pifacecommon.interrupts.PortEventListener(port)

  def on_pi(self):
    return self.on_pi

  @OnPI
  def register_listener(self, button_number, method):
    # set up listeners for all buttons
    self.listener.register(button_number, pifacecommon.interrupts.IODIR_ON, method)

  @OnPI
  def activate(self):
    self.listener.activate()

  @OnPI
  def shutdown(self):
    self.listener.deactivate()
    pifacedigitalio.init()

  @OnPI
  def toggle_led(self, led_number):
    self.pifacedigital.leds[led_number].toggle()
