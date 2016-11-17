/**
 * Copyright 2016 Colin Law
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 **/

module.exports = function(RED) {
  "use strict";
  
  function timeprop(config) {
    RED.nodes.createNode(this,config);
    var node = this;
    // cycleTimes and dead_time are in seconds in config, convert to ms
    node.cycleTime = Number(config.cycleTime) * 1000;
    node.deadTime = Number(config.deadTime) * 1000;
    node.triggerPeriod = Number(config.triggerPeriod) * 1000;
    node.invert = config.invert;
    // initialise power and current state to cope with situation up to when it is first received
    node.power = 0;
    node.opState = 0;
   
    this.on('input', function(msg) {
      var newMsg = null;
      if (msg.topic === 'tick') {
        newMsg = handleTick();
      } else {
        // anything else is assumed to be a power value
        node.power = Number(msg.payload);
      }
      node.send(newMsg);
    });

    function handleTick() {
      // node.cycleTime is the cycle time in ms
      // node.deadTime is the actuator deadTime ms
      // node.invert is whether to invert the o/p or not
      // returns msg with payload 1 or 0
      var now = (new Date()).getTime();   // now in ms
      // calc current wave value between 0 and 1
      var wave = (now % node.cycleTime)/node.cycleTime;     // fraction of way through cycle
      var direction;
      // determine direction of travel and convert to triangular wave
      if (wave < 0.5) {
          direction = 1;      // on the way up
          wave = wave*2;
      } else {
          direction = -1;     // on the way down
          wave = (1 - wave)*2;
      }
      var effectivePower;
      // if a dead_time has been supplied for this o/p then adjust power accordingly
      if (node.deadTime > 0  && node.power > 0.0  &&  node.power < 1.0) {
          var dtop = node.deadTime/node.cycleTime;
          effectivePower = (1.0-2.0*dtop)*node.power + dtop;
      } else {
          effectivePower = node.power;
      }
      //  cope with end cases in case values outside 0..1
      if (effectivePower <= 0.0) {
          node.opState = 0;     // no heat
      } else if (effectivePower >= 1.0) {
          node.opState = 1;     // full heat
      } else {
          // only allow power to come on on the way down and off on the way up, to reduce short pulses
          if (effectivePower >= wave  &&  direction === -1) {
              node.opState = 1;
          } else if (effectivePower <= wave  &&  direction === 1) {
              node.opState = 0;
          } else {
              // otherwise leave it as it is
          }
      }
      return {payload: (node.invert ? (1-node.opState) : node.opState)};
    }

		var tick = setInterval(function() {
			node.emit("input", {topic: "tick"});
		}, node.triggerPeriod); // trigger at appropriate rate
		
		node.on("close", function() {
			if (tick) {
				clearInterval(tick);
			}
		});
		
  }
  RED.nodes.registerType("timeprop",timeprop);
}

  

