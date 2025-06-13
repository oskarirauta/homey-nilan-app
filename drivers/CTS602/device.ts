import Homey from 'homey';
import net from 'net';
import { Register, ValueType, CapacityMapping, CapacityMap, UpdateMapping, UpdateMap, Fetch, limitValueRange } from '../../types';
import { ID_REGISTERS, OPERATION_REGISTERS, SENSOR_REGISTERS, ALARM_REGISTERS, CAPABILITIES, newUpdateMap } from './constants'
import { ModbusApi } from '../../modbus_api';

module.exports = class CTS602Device extends Homey.Device {

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
    {
      queries: ALARM_REGISTERS,
      condition: ((now, last): Boolean => { return (!last || now - last > 10 * 1000) ? true : false; }),
      timeout: 5000,
    },
    {
      queries:ID_REGISTERS,
      condition: ((now, last): Boolean => { return (!last || now - last > 10 * 30 * 1000) ? true : false }),
      timeout: 8000,
    }
  ];

  async onInit() {

    this._api = new ModbusApi({
      device: this,
      homey: this.homey,
      logger: this.log,
      onUpdateValues: this.onUpdateValues
    });

    this.updates.forEach((item, key) => {

      if (item.queries.has(item.id))
        this.registerCapabilityListener(key, (value, opts) => {
          return this.updateValue(key, value, opts);
        });

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

      await this.setCapabilityValue('bus_version', -1);
      await this.setCapabilityValue('hidden_string.version_major', '');
      await this.setCapabilityValue('hidden_string.version_minor', '');
      await this.setCapabilityValue('hidden_string.version_release', '');
      await this.setCapabilityValue('firmware_version', 'unknown');
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
          this.log('Connection to device was lost');
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

    if (mapping.name == 'hidden_string.version_major' || mapping.name == 'hidden_string.version_minor' || mapping.name == 'hidden_string.version_release') {

      const ver = this.parseVersionNumber(value);

      if (ver !== '') {

        await this.setCapabilityValue(mapping.name, ver).catch(err => this.log(err));

        const major = await this.getCapabilityValue('hidden_string.version_major');
        const minor = await this.getCapabilityValue('hidden_string.version_minor');
        const release = await this.getCapabilityValue('hidden_string.version_release');
        const current_fw = await this.getCapabilityValue('firmware_version');
        const combined = major + '.' + minor + '.' + release;

        if (major !== null && major !== '' && minor !== null && minor !== '' && release !== null && release !== '' && current_fw !== combined)
          await this.setCapabilityValue('firmware_version', combined);
      }

    } else await this.updateNumber(mapping, value);
  }

  parseVersionNumber(value: number): string {

    const high = ((value >> 8) & 0xff);
    const low = value & 0xff;
    let result = '';
     
    if ((high > 47) && (high < 58)) {
      const v = high - 48;
      result += v.toString();
    }
    
    if ((low > 47) && (low < 58)) {
      const v = low - 48;
      result += v.toString();
    }

    return result;
  }

  async setAlarms(alarms: Array<number>): Promise<void> {

    const filterState = await this.getCapabilityValue('alarm_generic.filter');
    const alarmState = await this.getCapabilityValue('alarm_pump_device');

    if ((alarmState === false) || (alarmState === null)) {

      if (filterState === true) {
        await this.unsetWarning();
      }

      await this.setCapabilityValue('alarm_pump_device', true);
      await this.setWarning(this.homey.__('warnings.alarm'));
    }

    if (alarms.length > 0) {
      if (!this.hasCapability('alarm_nilan.id1')) {
        await this.addCapability('alarm_nilan.id1');
      }
      await this.setCapabilityValue('alarm_nilan.id1', alarms[0].toString());
    } else if ((alarms.length < 1) && (this.hasCapability('alarm_nilan.id1'))) {
      await this.removeCapability('alarm_nilan.id1');
    }

    if (alarms.length > 1) { 
      if (!this.hasCapability('alarm_nilan.id2')) {    
        await this.addCapability('alarm_nilan.id2');
      } 
      await this.setCapabilityValue('alarm_nilan.id2', alarms[1].toString());
    } else if ((alarms.length < 2) && (this.hasCapability('alarm_nilan.id2'))) {
      await this.removeCapability('alarm_nilan.id2');
    }

    if (alarms.length > 2) {
      if (!this.hasCapability('alarm_nilan.id3')) {
        await this.addCapability('alarm_nilan.id3');
      }
      await this.setCapabilityValue('alarm_nilan.id3', alarms[2].toString());
    } else if ((alarms.length < 3) && (this.hasCapability('alarm_nilan.id3'))) {
      await this.removeCapability('alarm_nilan.id3');
    }

    await this.setCapabilityValue('hidden_number.alarm_count', alarms.length);
  }

  async unsetAlarms(): Promise<void> {

    const filterState = await this.getCapabilityValue('alarm_generic.filter');
    const alarmState = await this.getCapabilityValue('alarm_pump_device');

    if (this.hasCapability('alarm_nilan.id3')) {
      await this.removeCapability('alarm_nilan.id3');
    }

    if (this.hasCapability('alarm_nilan.id2')) {
      await this.removeCapability('alarm_nilan.id2');
    }

    if (this.hasCapability('alarm_nilan.id1')) {
      await this.removeCapability('alarm_nilan.id1');
    }

    if ((alarmState === true) || (alarmState === null)) {

      await this.setCapabilityValue('alarm_pump_device', false);
      await this.unsetWarning();

      if (filterState === true) {
        await this.setWarning(this.homey.__('warnings.filter_change'));
      }

      await this.setCapabilityValue('hidden_number.alarm_count', 0);
    }
  }

  async setFilterAlarm(): Promise<void> {
  
    const filterState = await this.getCapabilityValue('alarm_generic.filter');
    const alarmState = await this.getCapabilityValue('alarm_pump_device');

    if ((filterState === false || (filterState === null))) {
      await this.setCapabilityValue('alarm_generic.filter', true);
      if (alarmState !== true) {
        await this.setWarning(this.homey.__('warnings.filter_change'));
      }
    }
  }

  async unsetFilterAlarm(): Promise<void> {

    const filterState = await this.getCapabilityValue('alarm_generic.filter');
    const alarmState = await this.getCapabilityValue('alarm_pump_device');

    if ((filterState === true) || (filterState === null)) {
      await this.setCapabilityValue('alarm_generic.filter', false);
      if ((filterState === true) && (alarmState !== true)) {
        await this.unsetWarning();
      }
    }
  }

  async resetAlarms(): Promise<void> {

    const filterState = await this.getCapabilityValue('alarm_generic.filter');
    const alarmState = await this.getCapabilityValue('alarm_pump_device');
    const warningState = ((filterState === true) || (alarmState === true)) ? true : false;

    if ((alarmState === null) || (alarmState === 'null') || (alarmState === true))
      await this.setCapabilityValue('alarm_pump_device', false);

    if ((filterState === null) || (filterState === 'null') || (filterState === true))
      await this.setCapabilityValue('alarm_generic.filter', false);

    if (warningState === true) {
      await this.unsetWarning();
    }

    if (this.hasCapability('alarm_nilan.id1')) {
      await this.removeCapability('alarm_nilan.id1');
    }

    if (this.hasCapability('alarm_nilan.id2')) {
      await this.removeCapability('alarm_nilan.id2');
    }

    if (this.hasCapability('alarm_nilan.id3')) {
      await this.removeCapability('alarm_nilan.id3');
    }

    await this.setCapabilityValue('hidden_number.alarm_count', 0);
  }

  async previousAlarmCode(idx: number): Promise<number> {

    if ((idx === 1) && (this.hasCapability('alarm_nilan.id1'))) {
      return parseInt(await this.getCapabilityValue('alarm_nilan.id1'));
    } else if ((idx === 2) && (this.hasCapability('alarm_nilan.id2'))) {
      return parseInt(await this.getCapabilityValue('alarm_nilan.id2'));
    } else if ((idx === 3) && (this.hasCapability('alarm_nilan.id3'))) {
      return parseInt(await this.getCapabilityValue('alarm_nilan.id3'));
    }

    return 0;
  }

  parseFilter(status: number, id1: number, id2: number, id3: number, filt: number): Boolean {

    if (filt !== 0)
      return true;

    const cnt = status & 0x03;

    if ((cnt > 0) && (id1 == 19)) {
      return true;
    } else if ((cnt > 1) && (id2 == 19)) {
      return true;
    } else if ((cnt > 2) && (id3 == 19)) {
      return true;
    }

    return false;
  }

  parseAlarms(status: number, id1: number, id2: number, id3: number, filt: number): Array<number> {

    const arr = new Array<number>();
    const cnt = status & 0x03;

    if ( cnt > 0 ) {

      if ((id1 !== 19) && (id1 !== 0)) {
        arr.push(id1);
      }

      if ((cnt > 1) && (id2 !== 19) && (id2 !== 0)) {
        arr.push(id2);
      }

      if ((cnt > 2) && (id3 !== 19) && (id3 !== 0)) {
        arr.push(id3);
      }      
    }

    return arr;
  }

  async parsePreviousAlarms(): Promise<Array<number>> {

    const arr = new Array<number>();
    const prevCount = await this.getCapabilityValue('hidden_number.alarm_count');
    const id1 = this.hasCapability('alarm_nilan.id1') ? parseInt(await this.getCapabilityValue('alarm_nilan.id1')) : 0;
    const id2 = this.hasCapability('alarm_nilan.id2') ? parseInt(await this.getCapabilityValue('alarm_nilan.id2')) : 0;
    const id3 = this.hasCapability('alarm_nilan.id3') ? parseInt(await this.getCapabilityValue('alarm_nilan.id3')) : 0;

    if ((prevCount > 0) && (id1 !== 0) && (id1 !== 19)) {
      arr.push(id1);
    }

    if ((prevCount > 1) && (id2 !== 0) && (id2 !== 19)) {
      arr.push(id2);
    }

    if ((prevCount > 2) && (id3 !== 0) && (id3 !== 19)) {
      arr.push(id3);
    }

    return arr;
  }

  alarmsChanged(prev: Array<number>, current: Array<number>): Boolean {

    if (prev.length !== current.length) {
      return true;
    } else if (( prev.length === current.length) && (prev.length === 0)) {
      return false;
    }

    if ((prev.length > 0) && (prev[0] !== current[0])) {
      return true;
    } else if ((prev.length > 1) && (prev[1] !== current[1])) {
      return true;
    } else if ((prev.length > 2) && (prev[2] !== current[2])) {
      return true;
    }

    return false;
  }

  async updateAlarms(status: number, id1: number, id2: number, id3: number, filt: number): Promise<void> {

    try {

      const prevFilterState = await this.getCapabilityValue('alarm_generic.filter');
      const prevAlarms = await this.parsePreviousAlarms();
      const newAlarms = this.parseAlarms(status, id1, id2, id3, filt);
      const newFilterState = this.parseFilter(status, id1, id2, id3, filt);

      if ((prevFilterState !== newFilterState) && (newFilterState)) {
        await this.setFilterAlarm();
      } else if ((prevFilterState !== newFilterState) && (!newFilterState)) {
        await this.unsetFilterAlarm();
      }

      if (!this.alarmsChanged(prevAlarms, newAlarms)) {
        return;
      }

      if (newAlarms.length === 0) {
        await this.unsetAlarms();
        return;
      }

      await this.setAlarms(newAlarms);

    } catch (err) {
      this.log('Update alarms error:', err);
    }
  }

  async updateValue(key: string, value: number, opts:any): Promise<void> {

    if (!this.getAvailable() || !this.updates.has(key))
      return;

    try {

      this.clearFetchTimeout();

      this.updates.get(key)!.timeout = this.homey.setTimeout(() => {
        this.updates.get(key)!.timeout = undefined;
      }, 5000);

      const toValue = value * (this.updates.get(key)!.factor == undefined ? 1 : this.updates.get(key)!.factor!);
      await this._api.write(this.updates.get(key)!.id, this.updates.get(key)!.queries, toValue);

      if ( this.updates.get(key)!.capability !== undefined && this.hasCapability(this.updates.get(key)!.capability!))
          await this.setCapabilityValue(this.updates.get(key)!.capability!, value);

    } finally {
      this.addFetchTimeout();
    }
  }

}
