### homey-nilan-app

With this app you can get support for many Nilan heatpumps running with CTS602 board
to Homey. Connection to Nilan must be made through TCP Modbus device/bridge.
There are numerous one's available from many vendors, such as waveshare.

Personally I can recommend very reasonable priced Elfin EW11 for this,
it is available on AliExpress for pretty cheap
I do not get anything for this recommendation, it is just my personal opinion;
device runs on various voltages, including +12V provided by Nilan's heatpumps.

TCP Modbus device is wired to RS485 bus on either CTS602, or if you have 8 pin port
at top of the device (with printer USB port), then it is wired to there. 

### credits

This app/driver is based on already existing SystemAir app, which you can find
from https://github.com/balmli/com.systemair.
So, thank you for balmli and tesharp for their work.
