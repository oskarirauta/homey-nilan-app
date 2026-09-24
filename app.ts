import sourceMapSupport from 'source-map-support';
sourceMapSupport.install();

import Homey from 'homey';

type FlowArguments = {
  device: Homey.Device;
  [key: string]: unknown;
};

module.exports = class NilanApp extends Homey.App {

  async onInit(): Promise<void> {
    this.initFlows();
    this.log('NilanApp is running...');
  }

  private initFlows(): void {
    this.registerCapabilityAction('nilan_set_room_temperature', 'target_temperature', 'temperature');
    this.registerCapabilityAction('nilan_set_water_temperature', 'target_temperature.water', 'temperature');
    this.registerCapabilityAction('nilan_set_central_heating_temperature', 'target_temperature.ek', 'temperature');
    this.registerCapabilityAction('nilan_set_target_humidity', 'nl_target_humidity', 'humidity');
    this.registerCapabilityAction('nilan_set_state', 'pump_mode.run', 'state');
    this.registerCapabilityAction('nilan_set_mode', 'pump_mode.mode', 'mode');
    this.registerCapabilityAction('nilan_set_air_exchange', 'pump_mode.air_exchange', 'mode');
    this.registerCapabilityAction('nilan_set_power_save', 'pump_mode.power_save', 'state');
    this.registerCapabilityAction('nilan_set_ventilation_step', 'fanstep_enum.ventilation', 'step');
  }

  private registerCapabilityAction(cardId: string, capabilityId: string, argumentName: string): void {
    this.homey.flow.getActionCard(cardId)
      .registerRunListener((args: FlowArguments) => {
        const value = args[argumentName];

        if (value === undefined)
          throw new Error(`Missing Flow argument: ${argumentName}`);

        return args.device.triggerCapabilityListener(capabilityId, value, {});
      });
  }

};
