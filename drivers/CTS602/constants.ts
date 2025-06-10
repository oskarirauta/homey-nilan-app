import { Register, ValueType, CapacityMapping, CapacityMap, UpdateMapping, UpdateMap } from '../../types';
import { REGISTERS } from './registers'

export const ID_REGISTERS: Register.Queries = Register.filter(REGISTERS, [
  'Bus.Version',
  'App.VersionMajor',
  'App.VersionMinor',
  'App.VersionRelease',
  'Control.Type',
]);

export const OPERATION_REGISTERS: Register.Queries = Register.filter(REGISTERS, [
  'Control.RunSet',
  'Control.ModeSet',
  'Control.VentSet',
  'Control.TempSet',
  'HotWater.TempSet_T11',
  'HotWater.TempSet_T12',
  'AirQual.RH_LimLo',
  'AirFlow.AirExchMode',
//  'Program.UserFuncAct',
//  'Program.UserFuncSet',
//  'Program.UserTimeSet',
  'Control.PowerSave',
]);

export const SENSOR_REGISTERS: Register.Queries = Register.filter(REGISTERS, [
  'Input.T0_Controller',
  'Input.T1_Intake',
  'Input.T2_Inlet',
  'Input.T3_Exhaust',
  'Input.T4_Outlet',
  'Input.T5_Cond',
  'Input.T6_Evap',
  'Input.T7_Inlet',
  'Input.T8_Outdoor',
  'Input.T9_Heater',
  'Input.T10_Extern',
  'Input.T11_Top',
  'Input.T12_Bottom',
  'Input.T13_Return',
  'Input.T14_Supply',
  'Input.T15_Room',
  'Input.RH',
  'Input.CO2',
  'Control.RunAct',
  'Control.ModeAct',
  'Control.State',
  'AirTemp.TempRoom',
  'Output.ExhaustSpeed',
  'Output.InletSpeed',
  'Output.AirHeatCap',
  'Output.CenHeatCap',
  'Output.CprCap',
  'AirFlow.SinceFiltDay',
  'AirFlow.ToFiltDay',
]);

export const ALARM_REGISTERS: Register.Queries = Register.filter(REGISTERS, [
  'Alarm.Status',
  'Alarm.List_1_ID',
  'Alarm.List_2_ID',
  'Alarm.List_3_ID',
  'Input.AirFilter'
]);

export const CAPABILITIES: CapacityMap = new Map([
  [ 'AirTemp.TempRoom', {
    name: [ 'measure_temperature', 'measure_temperature.indoor' ],
    type: ValueType.Number,
  }],
  [ 'Input.T0_Controller', {
    name: 'measure_temperature.controller' ,
    type: ValueType.Number,
  }],
  [ 'Input.T1_Intake', {
    name: 'measure_temperature.intake',
    type: ValueType.Number,
  }],
  [ 'Input.T2_Inlet', {
    name: 'measure_temperature.inlet_before',
    type: ValueType.Number,
  }],
  [ 'Input.T3_Exhaust', {
    name: 'measure_temperature.exhaust',
    type: ValueType.Number,
  }],
  [ 'Input.T4_Outlet', {
    name: 'measure_temperature.outlet',
    type: ValueType.Number,
  }],
  [ 'Input.T5_Cond', {
    name: 'measure_temperature.cond',
    type: ValueType.Number,
  }],
  [ 'Input.T6_Evap', {
    name: 'measure_temperature.evap',
    type: ValueType.Number,
  }],
  [ 'Input.T7_Inlet', {
    name: 'measure_temperature.inlet_after',
    type: ValueType.Number,
  }],
  [ 'Input.T8_Outdoor', {
    name: 'measure_temperature.outdoor',
    type: ValueType.Number,
  }],
  [ 'Input.T9_Heater', {
    name: 'measure_temperature.heater',
    type: ValueType.Number,
  }],
  [ 'Input.T10_Extern', {
    name: 'measure_temperature.extern',
    type: ValueType.Number,
  }],
  [ 'Input.T11_Top', {
    name: [ 'measure_temperature.water', 'measure_temperature.water_current', 'measure_temperature.water_top' ],
    type: ValueType.Number,
  }],
  [ 'Input.T12_Bottom', {
    name: 'measure_temperature.water_bottom',
    type: ValueType.Number,
  }],
  [ 'Input.T13_Return', {
    name: 'measure_temperature.ek_return',
    type: ValueType.Number,
  }],
  [ 'Input.T14_Supply', {
    name: 'measure_temperature.ek_supply',
    type: ValueType.Number,
  }],
  [ 'Input.T15_Room', {
    name: 'measure_temperature.room',
    type: ValueType.Number,
  }],
  [ 'Input.RH', {
    name: 'measure_humidity',
    type: ValueType.Number,
  }],
  [ 'Input.CO2', {
    name: 'measure_co2',
    type: ValueType.Number,
  }],
  [ 'AirQual.RH_LimLo', {
    name: 'target_humidity',
    type: ValueType.Number,
    factor: 100,
    update: 'target_humidity',
  }],
  [ 'Output.ExhaustSpeed', {
    name: 'fanspeed.exhaust',
    type: ValueType.Number,
  }],
  [ 'Output.InletSpeed', {
    name: 'fanspeed.inlet',
    type: ValueType.Number,
  }],
  [ 'Output.AirHeatCap', {
    name: 'capacity.airheat',
    type: ValueType.Number,
  }],
  [ 'Output.CenHeatCap', {
    name: 'capacity.cenheat',
    type: ValueType.Number,
  }],
  [ 'Output.CprCap', {
    name: 'capacity.compressor',
    type: ValueType.Number,
  }],
  [ 'AirFlow.SinceFiltDay', {
    name: 'filter_days.since',
    type: ValueType.Number,
  }],
  [ 'AirFlow.ToFiltDay', {
    name: 'filter_days.left',
    type: ValueType.Number,
  }],
  [ 'Bus.Version', {
    name: 'bus_version',
    type: ValueType.Number,
  }],
  [ 'Control.TempSet', {
    name: 'target_temperature',
    type: ValueType.Number,
    update: 'target_temperature',
  }],
  [ 'HotWater.TempSet_T12', {
    name: 'target_temperature.water',
    type: ValueType.Number,
    update: 'target_temperature.water',
  }],
  [ 'Control.Type', {
    name: [ 'heatpump_type', 'heatpump_typecode' ],
    type: ValueType.State,
  }],
  [ 'Control.RunSet', {
    name: 'pump_mode.run',
    type: ValueType.State,
    update: 'pump_mode.run',
  }],  
  [ 'Control.RunAct', {
    name: 'operational_state.run',
    type: ValueType.State,
    max: 2,
    update: 'pump_mode.run',
  }],
  [ 'Control.ModeSet', {
    name: 'pump_mode.mode',
    type: ValueType.State,
    update: 'pump_mode.mode',
  }],
  [ 'Control.ModeAct', {
    name: 'operational_state.mode',
    type: ValueType.State,
    max: 5,
    update: 'pump_mode.mode',
  }],
  [ 'Control.State', {
    name: 'operational_state.state',
    max: 18,
    type: ValueType.State,
  }],
  [ 'AirFlow.AirExchMode', {
    name: [ 'pump_mode.air_exchange', 'operational_state.air_exchange' ],
    type: ValueType.State,
    update: 'pump_mode.air_exchange',
  }],
  [ 'Control.PowerSave', {
    name: [ 'pump_mode.power_save', 'operational_state.power_save' ],
    type: ValueType.State,
    update: 'pump_mode.power_save',
  }],
  [ 'App.VersionMajor', {
    name: 'hidden_string.version_major',
    type: ValueType.Parser,
  }],
  [ 'App.VersionMinor', {
    name: 'hidden_string.version_minor',
    type: ValueType.Parser,
  }],
  [ 'App.VersionRelease', {
    name: 'hidden_string.version_release',
    type: ValueType.Parser,
  }],
]);

export const newUpdateMap = ((): UpdateMap => {
  return  new Map([
    [ 'target_temperature', {
      id: 'Control.TempSet',
      description: 'target temperature',
      queries: OPERATION_REGISTERS,
    }],
    [ 'target_temperature.water', {
       id: 'HotWater.TempSet_T12',
       description: 'water temperature',
       queries: OPERATION_REGISTERS,
    }],
    [ 'target_humidity', {
      id: 'AirQual.RH_LimLo',
      description: 'target humidity',
      queries: OPERATION_REGISTERS,
      factor: 100,
    }],
    [ 'pump_mode.run', {
      id: 'Control.RunSet',
      description: 'run set',
      queries: OPERATION_REGISTERS,
      capability: 'operational_state.run',
    }],
    [ 'pump_mode.mode', {
      id: 'Control.ModeSet',
      description: 'mode',
      queries: OPERATION_REGISTERS,
      capability: 'operational_state.mode',
    }],
    [ 'pump_mode.air_exchange', {
      id: 'AirFlow.AirExchMode',
      description: 'air exchange mode',
      queries: OPERATION_REGISTERS,
      capability: 'operational_state.air_exchange',
    }],
    [ 'pump_mode.power_save', {
      id: 'Control.PowerSave',
      description: 'power save mode',
      queries: OPERATION_REGISTERS,
      capability: 'operational_state.power_save',
    }],
  ]);
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
