import { Register, ValueType, CapacityMapping, CapacityMap, UpdateMapping, UpdateMap } from '../../types';
import { REGISTERS } from './registers'

export const OPERATION_REGISTERS: Register.Queries = Register.filter(REGISTERS, [
  'prmSystemWorkinMode',
  'prmUserTemperature',
  'prmUserFanSpeed',
]);

export const SENSOR_REGISTERS: Register.Queries = Register.filter(REGISTERS, [
  'prmFilterInlet_TimeThreshold',
  'prmFilterExhaust_TimeThreshold',
  'prmFilterInlet_PassDays',
  'prmFilterExhaust_PassDays',
  'VAL_DEV_RH_SENSOR',
  'DRV_EXT_LN_STATE_Heater',
  'prmTmasterSensor',
  'VAL_DEV_TSENS1',
  'VAL_DEV_TSENS2',
  'VAL_DEV_TSENS3',
  'VAL_DEV_TSENS4',
  'VAL_DEV_TSENS5',
  'VAL_DEV_TSENS6',
  'VAL_DEV_TSENS11',
  'VAL_DEV_TSENS12',
  'prmRegulationMode',
]);

export const CAPABILITIES: CapacityMap = new Map([
  [ 'prmSystemWorkinMode', {
    name: 'operational_state.systemworkmode',
    type: ValueType.State,
    max: 5,
  }],
  [ 'prmUserTemperature', {
    name: 'measure_temperature.user',
    type: ValueType.Number,
  }],
  [ 'prmUserFanSpeed', {
    name: 'fanspeed.user',
    type: ValueType.Number,
  }],
  [ 'prmFilterInlet_TimeThreshold', {
    name: 'alarm_generic.inlet',
    type: ValueType.Parser,
  }],
  [ 'prmFilterExhaust_TimeThreshold', {
    name: 'alarm_generic.outlet',
    type: ValueType.Parser,
  }],
  [ 'prmFilterInlet_PassDays', {
    name: 'filter_days.inlet',
    type: ValueType.Number,
  }],
  [ 'prmFilterExhaust_PassDays', {
    name: 'filter_days.outlet',
    type: ValueType.Number,
  }],
  [ 'VAL_DEV_RH_SENSOR', {
    name: 'measure_humidity',
    type: ValueType.Number,
  }],
  [ 'DRV_EXT_LN_STATE_Heater', {
    name: 'operational_state.external',
    type: ValueType.State,
    max: 9,
  }],
  [ 'prmTmasterSensor', {
    name: 'measure_temperature.master',
    type: ValueType.Number,
  }],
  [ 'VAL_DEV_TSENS1', {
    name: 'measure_temperature.outdoor',
    type: ValueType.Number,
  }],
  [ 'VAL_DEV_TSENS2', {
    name: 'measure_temperature.supply',
    type: ValueType.Number,
  }],
  [ 'VAL_DEV_TSENS3', {
    name: 'measure_temperature.extract',
    type: ValueType.Number,
  }],
  [ 'VAL_DEV_TSENS4', {
    name: 'measure_temperature.discharge',
    type: ValueType.Number,
  }],
  [ 'VAL_DEV_TSENS5', {
    name: 'measure_temperature.cond',
    type: ValueType.Number,
  }],
  [ 'VAL_DEV_TSENS6', {
    name: 'measure_temperatire.evap',
    type: ValueType.Number,
  }],
  [ 'VAL_DEV_TSENS11', {
    name: 'measure_temperature.water_top',
    type: ValueType.Number,
  }],
  [ 'VAL_DEV_TSENS12', {
    name: 'measure_temperature.water_bottom',
    type: ValueType.Number,
  }],
  [ 'prmRegulationMode', {
    name: 'operational_state.regulation',
    type: ValueType.State,
    max: 5,
  }],
]);

export const newUpdateMap = ((): UpdateMap => {
  return new Map([]);
});

export const DEVICE_IDENTIFICATION_REGISTER = 'Control.Type';

export const MachineTypes: Map<number, string> = new Map([
  [ 2, 'Comfort light' ],
  [ 4, 'VPL 15c' ],
  [ 10, 'CompactS' ],
  [ 11, 'VP 18comp' ],
  [ 12, 'VP18cCom' ],
  [ 13, 'COMFORT' ],
  [ 19, 'VP 18c' ],
  [ 20, 'VP 18ek' ],
  [ 21, 'VP 18cek' ],
  [ 25, 'VPL 25c' ],
  [ 31, 'COMFORTn' ],
  [ 33, 'COMBI 300 N' ],
  [ 35, 'COMBI 302' ],
  [ 36, 'COMBI 302 T' ],
  [ 38, 'VGU180 ek' ],
  [ 44, 'CompactP' ],
]);

