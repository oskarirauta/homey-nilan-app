import sourceMapSupport from 'source-map-support';
sourceMapSupport.install();

import Homey from 'homey';

module.exports = class NilanApp extends Homey.App {

  async onInit() {
    await this._initFlows();
    this.log('NilanApp is running...');
  }

  async _initFlows() {

   this.homey.flow.getActionCard('nilan_set_water_temperature')
      .registerRunListener((args, state) => args.device.triggerCapabilityListener('target_temperature.water', args.temperature, {}));
 
   this.homey.flow.getActionCard('nilan_set_state')
      .registerRunListener((args, state) => args.device.triggerCapabilityListener('pump_mode.run', args.state, {}));

    this.homey.flow.getActionCard('nilan_set_mode')
      .registerRunListener((args, state) => args.device.triggerCapabilityListener('pump_mode.mode', args.mode, {}));

    this.homey.flow.getActionCard('nilan_set_air_exchange')
      .registerRunListener((args, state) => args.device.triggerCapabilityListener('pump_mode.air_exchange', args.mode, {}));

    this.homey.flow.getActionCard('nilan_set_power_save')
      .registerRunListener((args, state) => args.device.triggerCapabilityListener('pump_mode.power_save', args.state, {}));

  }

};
