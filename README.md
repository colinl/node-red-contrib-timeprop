node-red-contrib-timeprop
=========================

A [Node-RED] node that generates a time proportioned output from a linear input.


Install
-------

Run the following command in the root directory of your Node-RED install

    npm install node-red-contrib-pid


Usage
-----

Given a required power value in **msg.payload** in the range 0.0 to 1.0 this node generates a time proportioned 0/1 output (representing OFF/ON) which averages to required power value. The signal is output in **msg.payload**.  It uses a configurable cycle time, so if, for example, the period is set to 10 minutes and the power input is 0.2 then the output would be on for two minutes in every ten minutes.
    
Configuration
-------------

    
  * **Cycle time** - This is the cycle time of the time proportioned output as described above.
      
  * **Actuator dead time** - This can be used to specify the time (in seconds) that the actuator or other device takes to respond when told to go from ON to OFF or vice versa. The algorithm allows for this and will not ask the device to open/close for too short a time, in order to avoid it being told to open and then close again before it has responded to the first request. If the time to switch on is different to that switching off again then add the two times together and divide by two to get the value to enter. Set this to 0 to disable this feature.
      
  * **Trigger period** - This tells the node how often to determine what state the output should be set to.  I generally set this to about 1% of the cycle time, so for a 10 minute cycle time I would set this to around 6 seconds.
      
  * **Invert** - This allows the output to be inverted, so that a 0 output indicates full power, and 1 indicates no power. This is useful if, for example, the output is connected to an active low signal such as that used to drive a relay connected to a GPIO pin on a Raspberry Pi


[Node-RED]:  http://nodered.org/

