import Homey from 'homey';
import net from 'net';
import { Register, ValueType, CapacityMapping, CapacityMap, UpdateMapping, UpdateMap, Fetch, limitValueRange } from '../../types';
import { OPERATION_REGISTERS, SENSOR_REGISTERS, CAPABILITIES, newUpdateMap } from './constants'
import { ModbusApi } from '../../modbus_api';

module.exports = class CTS700Device extends Homey.Device {

  _api!: ModbusApi;
  fetchTimeout?: NodeJS.Timeout;
  updates: UpdateMap = newUpdateMap();
  fetches: Array<Fetch> = [
    {
      queries: OPERATION_REGISTERS,
      condition: ((now, last): Boolean => { return true; }),
      timeout: 0,
    },
    {
      queries: SENSOR_REGISTERS,
      condition: ((now, last): Boolean => {
        return (!last || now - last > ( this.getSetting('temp-report-interval') * 1000 )) ? true : false;
      }),
      timeout: 1000,
    },
  ];

  async onInit() {

    this._api = new ModbusApi({
      device: this,
      homey: this.homey,
      logger: this.log,
      onUpdateValues: this.onUpdateValues
    });

    this.addFetchTimeout(1);
    await this.connect();
    if ((this._api._socket === undefined) || (this._api._client === undefined))
      this.log('waiting for connection to device');
    else {
      await this.setAvailable();
      this.log('device initialized');
    }
  }

  async onAdded(): Promise<void> {
    this.log('device added');
  }

  onDeleted(): void {
    this.clearFetchTimeout();
    if (this._api) {
      if (this._api._clearSocketTimeout) {
        this._api._clearSocketTimeout();
      }
      this._api._disconnect();
    }
    this.log('device deleted');
  }

  async ready(): Promise<void> {

    try {
      await this.resetAlarms();
      this.log('initial values set');
    } catch (err) {
      this.log('failed to set initial capacity values: ', err);
    }

    this.log('device ready');

    await this.connect();
  }

  async onSettings({oldSettings, newSettings, changedKeys}: {
    oldSettings: object;
    newSettings: object;
    changedKeys: string[];
  }): Promise<string | void> {
    if ((changedKeys.includes('device-ip')) || (changedKeys.includes('device-port')) || (changedKeys.includes('device-id'))) {
      if (!this.getAvailable()) {
        await this.setAvailable();
        this.addFetchTimeout(1);
      }
      this._api.resetSocket();
    }
    if (changedKeys.includes('Polling_Interval')) {
      this.addFetchTimeout();
    }
    if (changedKeys.includes('temp_report_interval')) {
      this.addFetchTimeout();
    }
  }

  addFetchTimeout(seconds?: number): void {
    this.clearFetchTimeout();
    const settings = this.getSettings();
    const interval = seconds || settings['polling-interval'] || 10;
    this.fetchTimeout = this.homey.setTimeout(() => this.fetchParameters(), 1000 * interval);
  }

  clearFetchTimeout(): void {
    if (this.fetchTimeout) {
      this.homey.clearTimeout(this.fetchTimeout);
      this.fetchTimeout = undefined;
    }
  }

  async connect(): Promise<void> {
        
    const settings = this.getSettings();
    await this._api._connection(settings['device-ip'], settings['device-port'], settings['device-id']);
  }

  async fetchParameters(): Promise<void> {

    let connectionLost = false;
    let connectionRestored = false;

    try {
      if (this.getAvailable()) {

        if ((this.getSetting('device-ip') === undefined) || (this.getSetting('device-ip') === null) || (this.getSetting('device-ip').endsWith('.xxx')) || (this.getSetting('device-ip') === '')) {
          this.log('IP address not set');
          await this.setUnavailable(this.homey.__('unavailable.set_ip_address'));
        } else if (!net.isIP(this.getSetting('device-ip'))) {
          this.log('Invalid ip address');
          await this.setUnavailable(this.homey.__('errors.invalid_ip_address'));
        } else if ((this._api._socket === undefined) || (this._api._client === undefined)) {
          this.log('connection to device was lost');
          connectionLost = true;
          await this.setUnavailable(this.homey.__('errors.connection_lost'));
        } else {

          const now = Date.now();
          for ( let i = 0; i < this.fetches.length; i++ ) {
            if (this.fetches[i].condition(now, this.fetches[i].last)) {
              if (this.fetches[i].timeout === 0 ) {
                try {
                  await this._api.read(this.fetches[i].queries).catch((err: any) => this.log(err));
                  this.fetches[i].last = now;
                } catch (err) {}
              } else {
                this.homey.setTimeout(async () => {
                  try {
                    await this._api.read(this.fetches[i].queries).catch((err: any) => this.log(err));
                    this.fetches[i].last = now;
                  } catch (err) {}
                }, this.fetches[i].timeout);
              }
            }
          }
        }
      } else {

        await this.connect();

        if ((this._api._socket !== undefined) && (this._api._client !== undefined)) {
          await this.setAvailable();
          connectionRestored = true;
          this.log('Connection to device was restored');
        }
      }
    } catch (err) {
      this.log('fetchSensors error', err);
    } finally {
      if (connectionLost) {
        this.addFetchTimeout(5);
      } else if (connectionRestored) {
        this.addFetchTimeout(1);
      } else {
        this.addFetchTimeout();
      }
    }
  }

  async onUpdateValues(result: Register.Results, device: any): Promise<void> {

    if (result.has('Alarm.Status') && result.has('Alarm.List_1_ID') && result.has('Alarm.List_2_ID') && result.has('Alarm.List_3_ID') && result.has('Input.AirFilter'))
      device.updateAlarms(result.get('Alarm.Status'), result.get('Alarm.List_1_ID'), result.get('Alarm.List_2_ID'), result.get('Alarm.List_3_ID'), result.get('Input.AirFilter'));

    result.forEach((value, key) => {
      const mapping = CAPABILITIES.get(key);
      if (mapping !== undefined) {
        if (mapping.type !== ValueType.Parser)
          device.updateNumber(mapping, limitValueRange(value, mapping.min, mapping.max));
        else device.parseValue(mapping, limitValueRange(value, mapping.min, mapping.max));
      }
    })
  }

  async updateNumber(mapping: CapacityMapping, value: number, override?: Boolean): Promise<void> {

    if ((override === undefined || override === false) && (mapping.update !== undefined) && (this.updates.has(mapping.update)) && (this.updates.get(mapping.update)!.timeout !== undefined))
      return;

    const factor = mapping.factor || 1;
    const toValue = Math.round(10 * value / factor) * 0.1

    if (typeof(mapping.name) === 'string') {
      await this.setCapabilityValue(mapping.name, mapping.type === ValueType.State ? toValue.toString() : toValue).catch(err => this.log(err));
    } else if (Array.isArray(mapping.name)) {
      for ( let i = 0; i < mapping.name.length; i++ )        
        await this.setCapabilityValue(mapping.name[i], mapping.type === ValueType.State ? toValue.toString() : toValue).catch(err => this.log(err));
    }
  }

  async parseValue(mapping: CapacityMapping, value: number) {

    if ((mapping.update !== undefined) && (this.updates.has(mapping.update)) && (this.updates.get(mapping.update)!.timeout !== undefined))
      return;

    if ((mapping.name === 'alarm_generic.inlet') || (mapping.name === 'alarm_generic.outlet')) {

      const prev_inlet_alert = await this.getCapabilityValue('alarm_generic.inlet');
      const prev_outlet_alert = await this.getCapabilityValue('alarm_generic.outlet');
      const new_inlet_alert = mapping.name === 'alarm_generic.inlet' ? (value === 0 ? false : true) : prev_inlet_alert;
      const new_outlet_alert = mapping.name === 'alarm_generic.outlet' ? (value === 0 ? false : true) : prev_outlet_alert;

      if ((prev_inlet_alert === new_inlet_alert) && (prev_outlet_alert === new_outlet_alert))
        return;

      if (prev_inlet_alert !== new_inlet_alert)
        await this.setCapabilityValue('alarm_generic.inlet', new_inlet_alert);

      if (prev_outlet_alert !== new_outlet_alert)
        await this.setCapabilityValue('alarm_generic.outlet', new_outlet_alert);

      if (!prev_inlet_alert && !prev_outlet_alert && (new_inlet_alert || new_outlet_alert))
        await this.setWarning(this.homey.__('warnings.filter_change'));
      else if (!new_inlet_alert && !new_outlet_alert && (prev_inlet_alert || prev_outlet_alert))
        await this.unsetWarning();

    } else await this.updateNumber(mapping, value);
  }

  async resetAlarms(): Promise<void> {

    const prev_inlet_alert = await this.getCapabilityValue('alarm_generic.inlet');  
    const prev_outlet_alert = await this.getCapabilityValue('alarm_generic.outlet');

    if ((prev_inlet_alert === null) || (prev_inlet_alert === 'null') || (prev_inlet_alert === true))
      await this.setCapabilityValue('alarm_generic.inlet', false);

    if ((prev_outlet_alert === null) || (prev_outlet_alert === 'null') || (prev_outlet_alert === true))
      await this.setCapabilityValue('alarm_generic.outlet', false);

    if (prev_inlet_alert || prev_outlet_alert)
      await this.unsetWarning();
  }

}
