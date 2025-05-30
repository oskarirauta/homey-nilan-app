import Homey from 'homey';
import net from 'net';

import {
  ModbusResultParameter,
  ModbusResultParameters,
  ModbusResultParametersMap,
  IDENTIFICATION_PARAMETERS,
  OPERATION_PARAMETERS,
  SENSOR_PARAMETERS,
  PARAMETER_MAP,
  ALARM_PARAMETERS,
} from './constants';
import {NilanApi} from './nilan_modbus_api';

module.exports = class NilanModbusDevice extends Homey.Device {

  _api!: NilanApi;
  fetchTimeout?: NodeJS.Timeout;
  lastFetchParams?: number;
  lastFetchIdentification?: number;
  lastFetchAlarms?: number;
  updateTargetTempTimeout?: NodeJS.Timeout;
  updateWaterTempTimeout?: NodeJS.Timeout;
  updateTargetHumidityTimeout?: NodeJS.Timeout;
  updateRunStateTimeout?: NodeJS.Timeout;
  updateModeTimeout?: NodeJS.Timeout;
  updateAirExchangeModeTimeout? : NodeJS.Timeout;
  updatePowerSaveModeTimeout? : NodeJS.Timeout;

  async onInit() {

    this._api = new NilanApi({
      device: this,
      homey: this.homey,
      logger: this.log,
      onUpdateValues: this.onUpdateValues
    });

    this.registerCapabilityListener('target_temperature', (value, opts) => {
      return this.onUpdateTargetTemperature(value, opts);
    });

    this.registerCapabilityListener('target_temperature.water', (value, opts) => {
      return this.onUpdateWaterTemperature(value, opts);
    });

    this.registerCapabilityListener('target_humidity', (value, opts) => {
      return this.onUpdateTargetHumidity(value, opts);
    });

    this.registerCapabilityListener('pump_mode.run', (value, opts) => {
      return this.onUpdateRunState(value, opts);
    });

    this.registerCapabilityListener('pump_mode.mode', (value, opts) => {
      return this.onUpdateMode(value, opts);
    });

    this.registerCapabilityListener('pump_mode.air_exchange', (value, opts) => {
      return this.onUpdateAirExchangeMode(value, opts);
    });

    this.registerCapabilityListener('pump_mode.power_save', (value, opts) => {
      return this.onUpdateAirExchangeMode(value, opts);
    });

    this.addFetchTimeout(1);
    await this.setAvailable();
    this.log('device initialized');
  }

  async onAdded(): Promise<void> {
    this.log('device added');
  }

  onDeleted(): void {
    this.clearFetchTimeout();
    if (this._api && this._api._clearSocketTimeout) {
      this._api._clearSocketTimeout();
    }
    this.log('device deleted');
  }

  async ready(): Promise<void> {

    this.initDefaults();
    this.log('device ready');

    await this.initiateConnection();
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

  async initDefaults(): Promise<void> {

    try {
      await this.setCapabilityValue('bus_version', -1);
      await this.setCapabilityValue('hidden_string.version_major', '');
      await this.setCapabilityValue('hidden_string.version_minor', '');
      await this.setCapabilityValue('hidden_string.release_version', '');
      await this.setCapabilityValue('firmware_version', 'unknown');
      await this.resetAlarms();

      this.log('initial values set');

    } catch (err) {
      this.log('failed to set initial capacity values: ', err);
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

  async initiateConnection(): Promise<void> {
        
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

          try {
            await this._api.read(OPERATION_PARAMETERS).catch((err: any) => this.log(err));
          } catch (err) {
          }
          const now = Date.now();
          const settings = this.getSettings();
          if (!this.lastFetchParams || now - this.lastFetchParams > (settings['temp-report-interval'] * 1000)) {
            this.homey.setTimeout(async () => {
              try {
                await this._api.read(SENSOR_PARAMETERS).catch((err: any) => this.log(err));
                this.lastFetchParams = now;
              } catch (err) {
              }
            }, 1000);
          }
          if (!this.lastFetchAlarms || now - this.lastFetchAlarms > 10 * 1000) {
            this.homey.setTimeout(async () => {
              try {
                await this._api.read(ALARM_PARAMETERS).catch((err: any) => this.log(err));
                this.lastFetchAlarms = now;
              } catch (err) {
              }
            }, 5000);
          }
          if (!this.lastFetchIdentification || now - this.lastFetchIdentification > 10 * 30 * 1000) {
            this.homey.setTimeout(async () => {
              try {
                await this._api.read(IDENTIFICATION_PARAMETERS).catch((err: any) => this.log(err));
                this.lastFetchIdentification = now;
              } catch (err) {
              }
            }, 8000);
          }
        }
      } else {

        await this.initiateConnection();

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

  async onUpdateValues(result: ModbusResultParameters, device: any): Promise<void> {
    const resultAsMap: ModbusResultParametersMap = result.reduce((obj, r) => {
      // @ts-ignore
      obj[r.short] = r;
      return obj;
    }, {});

    if (!device.updateRunStateTimeout) {
      await device.updateState('pump_mode.run', resultAsMap['Control.RunSet']);
    }

    if (!device.updateModeTimeout) {
      await device.updateState('pump_mode.mode', resultAsMap['Control.ModeSet']);
    }
    
    if (!device.updateAirExchangeModeTimeout) {
      await device.updateState('pump_mode.air_exchange', resultAsMap['AirFlow.AirExchMode']);
    }

    if (!device.updatePowerSaveModeTimeout) {
      await device.updateState('pump_mode.power_save', resultAsMap['Control.PowerSave']);
    }

    if (!device.updateTargetTempTimeout) {
      await device.updateNumber('target_temperature', resultAsMap['Control.TempSet']);
    }

    if (!device.updateWaterTempTimeout) {

      await device.updateNumber('target_temperature.water', resultAsMap['HotWater.TempSet_T12']);
    }

    if (!device.updateTargetHumidityTimeout) {
      await device.updateNumber('target_humidity', resultAsMap['AirQual.RH_LimLo']);
    }

    await device.updateNumber('measure_temperature', resultAsMap['AirTemp.TempRoom']);
    await device.updateNumber('measure_temperature.water', resultAsMap['Input.T11_Top']);
    await device.updateNumber('measure_temperature.controller', resultAsMap['Input.T0_Controller']);
    await device.updateNumber('measure_temperature.intake', resultAsMap['Input.T1_Intake']);
    await device.updateNumber('measure_temperature.inlet_before', resultAsMap['Input.T2_Inlet']);
    await device.updateNumber('measure_temperature.exhaust', resultAsMap['Input.T3_Exhaust']);
    await device.updateNumber('measure_temperature.outlet', resultAsMap['Input.T4_Outlet']);
    await device.updateNumber('measure_temperature.cond', resultAsMap['Input.T5_Cond']);
    await device.updateNumber('measure_temperature.evap', resultAsMap['Input.T6_Evap']);
    await device.updateNumber('measure_temperature.inlet_after', resultAsMap['Input.T7_Inlet']);
    await device.updateNumber('measure_temperature.outdoor', resultAsMap['Input.T8_Outdoor']);
    await device.updateNumber('measure_temperature.heater', resultAsMap['Input.T9_Heater']);
    await device.updateNumber('measure_temperature.extern', resultAsMap['Input.T10_Extern']);
    await device.updateNumber('measure_temperature.water_top', resultAsMap['Input.T11_Top']);
    await device.updateNumber('measure_temperature.water_bottom', resultAsMap['Input.T12_Bottom']);
    await device.updateNumber('measure_temperature.ek_return', resultAsMap['Input.T13_Return']);
    await device.updateNumber('measure_temperature.ek_supply', resultAsMap['Input.T14_Supply']);
    await device.updateNumber('measure_temperature.panel', resultAsMap['Input.T15_Room']);
    await device.updateNumber('measure_humidity', resultAsMap['Input.RH']);
    await device.updateNumber('measure_co2', resultAsMap['Input.CO2']);

    await device.updateNumber('fanspeed.exhaust', resultAsMap['Output.ExhaustSpeed']);
    await device.updateNumber('fanspeed.inlet', resultAsMap['Output.InletSpeed']);
    await device.updateNumber('capacity.airheat', resultAsMap['Output.AirHeatCap']);
    await device.updateNumber('capacity.cenheat', resultAsMap['Output.CenHeatCap']);
    await device.updateNumber('capacity.compressor', resultAsMap['Output.CprCap']);

    if (device.hasCapability('filter_days.since')) {
      await device.updateNumber('filter_days.since', resultAsMap['AirFlow.SinceFiltDay']);
    }

    await device.updateNumber('filter_days.left', resultAsMap['AirFlow.ToFiltDay']);

    await device.updateNumber('bus_version', resultAsMap['Bus.Version']);
    await device.updateVersionNumber('hidden_string.version_major', resultAsMap['App.VersionMajor']);
    await device.updateVersionNumber('hidden_string.version_minor', resultAsMap['App.VersionMinor']);
    await device.updateVersionNumber('hidden_string.release_version', resultAsMap['App.VersionRelease']);
    await device.updateState('heatpump_type', resultAsMap['Control.Type']);

    await device.updateState('operational_state.run', resultAsMap['Control.RunAct']);
    await device.updateState('operational_state.mode', resultAsMap['Control.ModeAct']);
    await device.updateState('operational_state.state', resultAsMap['Control.State']);

    if (resultAsMap['Alarm.Status'] !== undefined) {
      await device.updateAlarms(resultAsMap);
    }
  }

  async updateState(cap: string, resultParameter?: ModbusResultParameter, factor = 1): Promise<void> {
    const toValue = resultParameter?.value as number;
    if (toValue !== undefined && toValue !== null && this.hasCapability(cap)) {
      await this.setCapabilityValue(cap, toValue.toString());
      if ((cap === 'heatpump_type') && (this.hasCapability('heatpump_id'))) {
        await this.setCapabilityValue('heatpump_id', toValue);
      } else if (cap === 'pump_mode.air_exchange') {
        await this.setCapabilityValue('operational_state.air_exchange', toValue.toString());
      } else if (cap === 'pump_mode.power_save') {
        await this.setCapabilityValue('operational_state.power_save', toValue.toString());
      }
    }
  }

  async updateNumber(cap: string, resultParameter?: ModbusResultParameter, factor = 1): Promise<void> {
    const toValue = resultParameter?.value as number;
    if (toValue !== undefined && toValue !== null && this.hasCapability(cap)) {

      if (cap === 'target_humidity') {
        await this.setCapabilityValue(cap, Math.round(10 * toValue / factor) * 0.001).catch(err => this.log(err));
      } else {
        await this.setCapabilityValue(cap, Math.round(10 * toValue / factor) * 0.1).catch(err => this.log(err));
      }

      if (cap === 'measure_temperature' && this.hasCapability('measure_temperature.indoor')) {
        await this.setCapabilityValue('measure_temperature.indoor', Math.round(10 * toValue / factor) / 10).catch(err => this.log(err));
      } else if ( cap === 'measure_temperature.water' && this.hasCapability('measure_temperature.water')) {
        await this.setCapabilityValue('measure_temperature.water_current', Math.round(10 * toValue / factor) / 10).catch(err => this.log(err));
      } else if ( cap === 'measure_humidity' && this.hasCapability('measure_humidity.indoor')) {
        await this.setCapabilityValue('measure_humidity.indoor', Math.round(10 * toValue / factor) / 10).catch(err => this.log(err));
      }

    }
  }

  async updateVersionNumber(cap: string, resultParameter?: ModbusResultParameter, factor = 1): Promise<void> {
    const toValue = resultParameter?.value as number;
    if (toValue !== undefined && toValue !== null && this.hasCapability(cap)) {

      const high = ((toValue >> 8) & 0xff);
      const low = toValue & 0xff;
      var verno = '';

      if ((high > 47) && (high < 58)) {
        const v1 = high - 48;
        verno = verno + v1.toString();
      }

      if ((low > 47) && (low < 58)) {
        const v2 = low - 48;
        verno = verno + v2.toString();
      }

      if (verno !== '') {
        await this.setCapabilityValue(cap, verno).catch(err => this.log(err));

        if (cap === 'hidden_string.release_version') {
          const major = await this.getCapabilityValue('hidden_string.version_major');
          const minor = await this.getCapabilityValue('hidden_string.version_minor');

          if ((major !== '') && (minor !== '')) {
            await this.setCapabilityValue('firmware_version', major + '.' + minor + '.' + verno);
          }
        }
      }
    }
  }

  async setAlarms(alarms: Array<number>): Promise<void> {

    const filterState = await this.getCapabilityValue('alarm_generic.filter');
    const alarmState = await this.getCapabilityValue('alarm_pump_device');

    if ((alarmState === false) || (alarmState === null)) {

      if (filterState === true) {
        await this.unsetWarning();
      }

      await this.setCapabilityValue('alarm_pump_device', true);
      await this.setWarning('Heat pump alert');
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
        await this.setWarning('Filter change');
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
        await this.setWarning('Filter change');
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

    if ((alarmState === true) || (alarmState === null)) {
      await this.setCapabilityValue('alarm_pump_device', false);
    }

    if ((filterState === true) || (filterState === null)) {
      await this.setCapabilityValue('alarm_generic.filter', false);
    }

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

  parseFilter(resultMap: ModbusResultParametersMap): Boolean {

    if ((resultMap['Input.AirFilter'].value as number) !== 0 ) {
      return true;
    } else if (((resultMap['Alarm.Status'].value as number) & 0x03) > 0 ) {
      const cnt = (resultMap['Alarm.Status'].value as number) & 0x03;
      if ((cnt > 0) && ((resultMap['Alarm.List_1_ID'].value as number) == 19)) {
        return true;
      } else if ((cnt > 1) && ((resultMap['Alarm.List_2_ID'].value as number) == 19)) {
        return true;
      } else if ((cnt > 2) && ((resultMap['Alarm.List_3_ID'].value as number) == 19)) {
        return true;
      }
    }

    return false;
  }

  parseAlarms(resultMap: ModbusResultParametersMap): Array<number> {

    const arr = new Array<number>();
    const cnt = (resultMap['Alarm.Status'].value as number) & 0x03;

    if ( cnt > 0 ) {

      const id1 = resultMap['Alarm.List_1_ID'].value as number;
      const id2 = resultMap['Alarm.List_2_ID'].value as number;
      const id3 = resultMap['Alarm.List_3_ID'].value as number;

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

  async updateAlarms(resultMap: ModbusResultParametersMap): Promise<void> {

    if (resultMap['Alarm.Status'] === undefined) {
      return;
    }

    try {

      const prevFilterState = await this.getCapabilityValue('alarm_generic.filter');
      const prevAlarms = await this.parsePreviousAlarms();
      const newAlarms = this.parseAlarms(resultMap);
      const newFilterState = this.parseFilter(resultMap);

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

  async onUpdateTargetTemperature(value: number, opts: any): Promise<void> {
    if (!this.getAvailable()) {
      return;
    }
    try {
      this.clearFetchTimeout();
      this.updateTargetTempTimeout = this.homey.setTimeout(() => {
        this.updateTargetTempTimeout = undefined;
      }, 10000);
      await this._api.write(PARAMETER_MAP['Control.TempSet'], value);
      this.log(`Set target temperature OK: ${value}`);
    } finally {
      this.addFetchTimeout();
    }
  }

  async onUpdateWaterTemperature(value: number, opts: any): Promise<void> {
    if (!this.getAvailable()) {
      return;
    }
    try {
      this.clearFetchTimeout();
      this.updateWaterTempTimeout = this.homey.setTimeout(() => {
        this.updateWaterTempTimeout = undefined;
      }, 10000);
      await this._api.write(PARAMETER_MAP['HotWater.TempSet_T11'], value);
      this.log(`Set water temperature OK: ${value}`);
    } finally {
      this.addFetchTimeout();
    }
  }

  async onUpdateTargetHumidity(value: number, opts: any): Promise<void> {
    if (!this.getAvailable()) {
      return;
    }
    try {
      this.clearFetchTimeout();
      this.updateTargetHumidityTimeout = this.homey.setTimeout(() => {
        this.updateTargetHumidityTimeout = undefined;
      }, 10000);
      await this._api.write(PARAMETER_MAP['AirQual.RH_LimLo'], value * 100);
      this.log(`Set target humidity OK: ${value * 100}`);
    } finally {
      this.addFetchTimeout();
    }
  }  

  async onUpdateRunState(value: string, opts: any): Promise<void> {
    if (!this.getAvailable()) {
      return;
    }
    try {
      this.clearFetchTimeout();
      this.updateRunStateTimeout = this.homey.setTimeout(() => {
        this.updateRunStateTimeout = undefined;
      }, 10000);

      if (this.hasCapability('operational_state.run')) {
        await this.setCapabilityValue('operational_state.run', value.toString());
      }
      await this._api.write(PARAMETER_MAP['Control.RunSet'], Number(value));
      this.log(`Set RunSet OK: ${value}`);
    } finally {
      this.addFetchTimeout();
    }
  }

  async onUpdateMode(value: string, opts: any): Promise<void> {
    if (!this.getAvailable()) {
      return;
    }
    try {
      this.clearFetchTimeout();
      this.updateModeTimeout = this.homey.setTimeout(() => {
        this.updateModeTimeout = undefined;
      }, 10000);
    
      if (this.hasCapability('operational_state.mode')) {
        await this.setCapabilityValue('operational_state.mode', value.toString());
      }
      await this._api.write(PARAMETER_MAP['Control.ModeSet'], Number(value));
      this.log(`Set mode OK: ${value}`);
    } finally {
      this.addFetchTimeout();
    }
  }

  async onUpdateAirExchangeMode(value: string, opts: any): Promise<void> {
    if (!this.getAvailable()) {
      return;
    }
    try {
      this.clearFetchTimeout();
      this.updateAirExchangeModeTimeout = this.homey.setTimeout(() => {
        this.updateAirExchangeModeTimeout = undefined;
      }, 10000);
        
      if (this.hasCapability('operational_state.air_exchange')) {
        await this.setCapabilityValue('operational_state.air_exchange', value.toString());
      }
      await this._api.write(PARAMETER_MAP['AirFlow.AirExchMode'], Number(value));
      this.log(`Set air exchange mode OK: ${value}`);
    } finally {
      this.addFetchTimeout();
    }
  }

  async onUpdatePowerSaveMode(value: string, opts: any): Promise<void> {
    if (!this.getAvailable()) {
      return;
    } 
    try {
      this.clearFetchTimeout();
      this.updatePowerSaveModeTimeout = this.homey.setTimeout(() => {
        this.updatePowerSaveModeTimeout = undefined;
      }, 10000);
        
      if (this.hasCapability('operational_state.power_save')) {
        await this.setCapabilityValue('operational_state.power_save', value.toString());
      } 
      await this._api.write(PARAMETER_MAP['Control.PowerSave'], Number(value));
      this.log(`Set power save mode OK: ${value}`);
    } finally {
      this.addFetchTimeout();
    }
  }

}

