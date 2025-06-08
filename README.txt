This app adds support for Nilan Heatpumps, such as EC9 - running with CTS602
while also combining support for CTS700.

App uses TCP Modbus for communication though RS-485.
For TCP Modbus connection, a bridge device is required; I personally can
recommend cheap Elfin EW11, which works very nicely and has proven for me to be stable.
It also accepts +12V provided by Nilan's heat pumps.

App is very comprehensive and provides a lot of sensor data. You also get to control
temperatures, humidity and modes of device - and can also do this with flows if you
choose to.

This app was built on top of already existing SystemAir app by Bjørnar Almli, so thank
you for that, propably couldn't have built this without his work.
