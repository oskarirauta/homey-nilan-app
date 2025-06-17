import { Register } from '../../types';

const asInt16 = (value: number): number => {
  return (value << 16) >> 16;
}

const asFanSpeed = (value: number): number => {
  return ((value << 16) >> 16) - 100;
}

export const REGISTERS: Register.Queries = new Map([
  [ 'prmSystemWorkinMode', {
    addr: 1047,
    type: Register.Type.Holding,
    description: 'System working mode',
    modifier_read: asInt16,
  }],
  [ 'prmFilterInlet_TimeThreshold', { // interval of filter change
    addr: 1326,
    type: Register.Type.Holding,
    description: 'Inlet filter Time threshold',
  }],
  [ 'prmFilterExhaust_TimeThreshold', { // interval of filter change
    addr: 1327,
    type: Register.Type.Holding,
    description: 'Outlet filter Time threshold',
  }],
  [ 'prmFilterInlet_PassDays', {
    addr: 1328,
    type: Register.Type.Holding,
    description: 'Pass days for Inlet software filter',
  }],
  [ 'prmFilterExhaust_PassDays', {
    addr: 1329,
    type: Register.Type.Holding,
    description: 'Pass days for Outlet software filter',
  }],
  [ 'VAL_DEV_RH_SENSOR', {
    addr: 4716,
    type: Register.Type.Holding,
    description: 'Value of Humidity sensor',
    modifier_read: asInt16,
  }],
  [ 'prmUserTemperature', {
    addr: 4746,
    type: Register.Type.Holding,
    description: 'User setpoint value',
    factor: 100,
    modifier_read: asInt16,
  }],
  [ 'prmUserFanSpeed', {
    addr: 4747,
    type: Register.Type.Holding,
    description: 'User Fan speed setting',
    modifier_read: asFanSpeed,
  }],
  [ 'DRV_EXT_LN_STATE_Heater', {
    addr: 5019,
    type: Register.Type.Holding,
    description: 'Heater external state',
    modifier_read: asInt16,
  }],
  [ 'prmTmasterSensor', {
    addr: 5088,
    type: Register.Type.Holding,
    description: 'Temperature of Master sensor',
    factor: 100,
    modifier_read: asInt16,
  }],
  [ 'VAL_DEV_TSENS1', {
    addr: 5152,
    type: Register.Type.Holding,
    description: 'Temperature sensor 1',
    factor: 100,
    modifier_read: asInt16,
  }],
  [ 'VAL_DEV_TSENS2', {
    addr: 5153,
    type: Register.Type.Holding,
    description: 'Temperature sensor 2',
    factor: 100,
    modifier_read: asInt16,
  }],
  [ 'VAL_DEV_TSENS3', {
    addr: 5154,
    type: Register.Type.Holding,
    description: 'Temperature sensor 3',
    factor: 100,
    modifier_read: asInt16,
  }],
  [ 'VAL_DEV_TSENS4', {
    addr: 5155,
    type: Register.Type.Holding,
    description: 'Temperature sensor 4',
    factor: 100,
    modifier_read: asInt16,
  }],
  [ 'VAL_DEV_TSENS5', {
    addr: 5156,
    type: Register.Type.Holding,
    description: 'Temperature sensor 5',
    factor: 100,
    modifier_read: asInt16,
  }],
  [ 'VAL_DEV_TSENS6', {
    addr: 5157,
    type: Register.Type.Holding,
    description: 'Temperature sensor 6',
    factor: 100,
    modifier_read: asInt16,
  }],
  [ 'VAL_DEV_TSENS11', {
    addr: 5162,
    type: Register.Type.Holding,
    description: 'Temperature sensor 11',
    factor: 100,
    modifier_read: asInt16,
  }],
  [ 'VAL_DEV_TSENS12', {
    addr: 5163,
    type: Register.Type.Holding,
    description: 'Temperature sensor 12',
    factor: 100,
    modifier_read: asInt16,
  }],
  [ 'VAL_DEV_TSENS16', {
    addr: 5167,
    type: Register.Type.Holding,
    description: 'Temperature sensor 16',
    factor: 100,
    modifier_read: asInt16,
  }],
  [ 'VAL_DEV_TSENS17', {
    addr: 5168,
    type: Register.Type.Holding,
    description: 'Temperature sensor 17',
    factor: 100,
    modifier_read: asInt16,
  }],
  [ 'VAL_DEV_TSENS18', {
    addr: 5169,
    type: Register.Type.Holding,
    description: 'Temperature sensor 18',
    factor: 100,
    modifier_read: asInt16,
  }],
  [ 'VAL_DEV_TSENS20', {
    addr: 5171,
    type: Register.Type.Holding,
    description: 'Temperature sensor 20',
    factor: 100,
    modifier_read: asInt16,
  }],
  [ 'VAL_DEV_TSENS23', {
    addr: 5174,
    type: Register.Type.Holding,
    description: 'Temperature sensor 23',
    factor: 100,
    modifier_read: asInt16,
  }],
  [ 'prmRegulationMode', {
    addr: 5432,
    type: Register.Type.Holding,
    description: 'Current regulation mode',
  }],
  [ 'prmUserTempDHW', {
    addr: 5548,
    type: Register.Type.Holding,
    description: 'User DHW setpoint value',
    factor: 100,
    modifier: asInt16,
  }],
]);
