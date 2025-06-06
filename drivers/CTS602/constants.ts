export enum IntegerType {
  UINT, // Unsigned Integers I
  INT,  // Signed Integers I*
}

export enum RegisterType {
  Holding,
  Input,
  Coil,
  Discrete,
}

export interface ModbusParameter {
  register: number;
  sig: IntegerType;
  regType: RegisterType;
  short: string;
  description: string;
  scaleFactor?: number;
  boolean?: boolean;
  min?: number;
  max?: number;
}

export interface ModbusResult {
  value: number | boolean;
}

export type ModbusResultParameter = ModbusParameter & ModbusResult;

export type ModbusParameters = ModbusParameter[];
export type ModbusParametersMap = { [key: string]: ModbusParameter };

export type ModbusResultParameters = ModbusResultParameter[];
export type ModbusResultParametersMap = { [key: string]: ModbusResultParameter };

export const PARAMETERS: ModbusParameters = [

  /* Input registers */

  {
    register: 0,
    sig: IntegerType.INT,
    regType: RegisterType.Input, 
    short: 'Bus.Version',
    description: 'Protocol version number',
  },
  {
    register: 1,
    sig: IntegerType.INT,
    regType: RegisterType.Input,
    short: 'App.VersionMajor',
    description: 'Software version - major (2 character ascii text)',
  },
  {
    register: 2,
    sig: IntegerType.INT,
    regType: RegisterType.Input,
    short: 'App.VersionMinor',
    description: 'Software version - minor (2 character ascii text)',
  },
  {
    register: 3,
    sig: IntegerType.INT,
    regType: RegisterType.Input,
    short: 'App.VersionRelease',
    description: 'Software version - release (2 character ascii text)',
  },
  {
    register: 101,
    sig: IntegerType.INT,
    regType: RegisterType.Input,
    short: 'Input.AirFilter',
    description: 'Air filter alarm',
  },
  {
    register: 200,
    sig: IntegerType.INT,
    regType: RegisterType.Input,
    short: 'Input.T0_Controller',
    description: 'Controller board temperature',
    scaleFactor: 100,
    min: 0,
    max: 7000,
  },
  {
    register: 201,
    sig: IntegerType.INT,
    regType: RegisterType.Input,
    short: 'Input.T1_Intake',
    description: 'Fresh air intake temperature',
    scaleFactor: 100,
    min: 0,
    max: 7000,
  },
  {
    register: 202,
    sig: IntegerType.INT,
    regType: RegisterType.Input,
    short: 'Input.T2_Inlet',
    description: 'Inlet temperature (before heater)',
    scaleFactor: 100,
    min: 0,
    max: 7000,
  },
  {
    register: 203,
    sig: IntegerType.INT,
    regType: RegisterType.Input,
    short: 'Input.T3_Exhaust',
    description: 'Room exhaust temperature',
    scaleFactor: 100,
    min: 0,
    max: 7000,
  },
  {
    register: 204,
    sig: IntegerType.INT,
    regType: RegisterType.Input,
    short: 'Input.T4_Outlet',
    description: 'Outlet temperature',
    scaleFactor: 100,
    min: 0,
    max: 7000,
  },
  {
    register: 205,
    sig: IntegerType.INT,
    regType: RegisterType.Input,
    short: 'Input.T5_Cond',
    description: 'Condenser temperature',
    scaleFactor: 100,
    min: 0,
    max: 7000,
  },
  {
    register: 206,
    sig: IntegerType.INT,
    regType: RegisterType.Input,
    short: 'Input.T6_Evap',
    description: 'Evaporator temperature',
    scaleFactor: 100,
    min: 0,
    max: 7000,
  },
  {
    register: 207,
    sig: IntegerType.INT,
    regType: RegisterType.Input,
    short: 'Input.T7_Inlet',
    description: 'Inlet temperature (after heater)',
    scaleFactor: 100,
    min: 0,
    max: 7000,
  },
  {
    register: 208,
    sig: IntegerType.INT,
    regType: RegisterType.Input,
    short: 'Input.T8_Outdoor',
    description: 'Outdoor temperature',
    scaleFactor: 100,
    min: -5000,
    max: 8000,
  },
  {
    register: 209,
    sig: IntegerType.INT,
    regType: RegisterType.Input,
    short: 'Input.T9_Heater',
    description: 'Heating surface temperature',
    scaleFactor: 100,
    min: -5000,
    max: 8000,
  },
  {
    register: 210,
    sig: IntegerType.INT,
    regType: RegisterType.Input,
    short: 'Input.T10_Extern',
    description: 'External room temperature',
    scaleFactor: 100,
    min: -5000,
    max: 8000,
  },
  {
    register: 211,
    sig: IntegerType.INT,
    regType: RegisterType.Input,
    short: 'Input.T11_Top',
    description: 'Hot water top temperature',
    scaleFactor: 100,
    min: 0,
    max: 7000,
  },
  {
    register: 212,
    sig: IntegerType.INT,
    regType: RegisterType.Input,
    short: 'Input.T12_Bottom',
    description: 'Hot water bottom temperature',
    scaleFactor: 100,
    min: 0,
    max: 7000,
  },
  {
    register: 213,
    sig: IntegerType.INT,
    regType: RegisterType.Input,
    short: 'Input.T13_Return',
    description: 'EK return temperature',
    scaleFactor: 100,
    min: 0,
    max: 7000,
  },
  {
    register: 214,
    sig: IntegerType.INT,
    regType: RegisterType.Input,
    short: 'Input.T14_Supply',
    description: 'EK supply temperature',
    scaleFactor: 100,
    min: 0,
    max: 7000,
  },
  { 
    register: 215,
    sig: IntegerType.INT,
    regType: RegisterType.Input,
    short: 'Input.T15_Room',
    description: 'User panel room temperature',
    scaleFactor: 100,
    min: 0,
    max: 7000,
  },
  {
    register: 216,
    sig: IntegerType.INT,
    regType: RegisterType.Input,
    short: 'Input.T16',
    description: 'AUX temperature (sacrificial anode)',
    scaleFactor: 100,
    min: 0,
    max: 7000,
  },
  {
    register: 221,
    sig: IntegerType.INT,
    regType: RegisterType.Input,
    short: 'Input.RH',
    description: 'Humidity',
    scaleFactor: 100,
    min: 0,
    max: 10000,
  },
  { 
    register: 222,
    sig: IntegerType.INT,
    regType: RegisterType.Input,
    short: 'Input.CO2',
    description: 'Carbon dioxide',
    min: 0,
    max: 40000,
  },
  {
    register: 400,
    sig: IntegerType.UINT,
    regType: RegisterType.Input,
    short: 'Alarm.Status',
    description: 'Alarm state bit mask, 0x80 = Active, 0x03 = number of alarms',
  },
  {
    register: 401,
    sig: IntegerType.UINT,
    regType: RegisterType.Input,
    short: 'Alarm.List_1_ID',
    description: 'Alarm 1 code',
  },
  {
    register: 404,
    sig: IntegerType.UINT,
    regType: RegisterType.Input,
    short: 'Alarm.List_2_ID',
    description: 'Alarm 2 code',
  },
  {
    register: 407,
    sig: IntegerType.UINT,
    regType: RegisterType.Input,
    short: 'Alarm.List_3_ID',
    description: 'Alarm 3 code',
  },
  {
    register: 1000,
    sig: IntegerType.UINT,
    regType: RegisterType.Input,
    short: 'Control.RunAct',
    description: 'Actual on/off state',
    min: 0,
    max: 1,
  },
  {
    register: 1001,
    sig: IntegerType.UINT,
    regType: RegisterType.Input,  
    short: 'Control.ModeAct',
    description: 'Actual operation mode',
    min: 0,
    max: 4,
  },
  {
    register: 1002,
    sig: IntegerType.UINT,
    regType: RegisterType.Input,
    short: 'Control.State',
    description: 'Actual control state',
    min: 0,
    max: 16,
  },
  {
    register: 1103,
    sig: IntegerType.UINT,
    regType: RegisterType.Input,
    short: 'AirFlow.SinceFiltDay',
    description: 'Days since last air filter change alarm',
  },
  {
    register: 1104,
    sig: IntegerType.UINT,
    regType: RegisterType.Input,
    short: 'AirFlow.ToFiltDay',
    description: 'Days to next air filter change alarm',
  },
  {
    register: 1200,
    sig: IntegerType.UINT,
    regType: RegisterType.Input,
    short: 'AirTemp.IsSummer',
    description: 'Summer state',
    min: 0,
    max: 1,
  },
  {
    register: 1201,
    sig: IntegerType.INT,
    regType: RegisterType.Input,
    short: 'AirTemp.TempInlet',
    description: 'Inlet temperature request (T7 setpoint)',
    scaleFactor: 100,
    min: -5000,
    max: 8000,
  },
  {
    register: 1202,
    sig: IntegerType.INT,
    regType: RegisterType.Input,
    short: 'AirTemp.TempControl',
    description: 'Actual value for controlled temperature',
    scaleFactor: 100,
    min: -5000,
    max: 8000,
  },

  {
    register: 1203,
    sig: IntegerType.INT,
    regType: RegisterType.Input,
    short: 'AirTemp.TempRoom',
    description: 'Actual room temperature',
    scaleFactor: 100,
    min: -5000,
    max: 8000,
  },
  {
    register: 1204,
    sig: IntegerType.INT,
    regType: RegisterType.Input,
    short: 'AirTemp.EffPct',
    description: 'Passive heat exchanger efficiency',
    scaleFactor: 100,
    min: -5000,
    max: 8000,
  },
  {
    register: 1205,
    sig: IntegerType.INT,
    regType: RegisterType.Input,
    short: 'AirTemp.CapSet',
    description: 'Requested capacity',
    scaleFactor: 100,
    min: 0,
    max: 10000,
  },
  {
    register: 1206,
    sig: IntegerType.INT,
    regType: RegisterType.Input,
    short: 'AirTemp.CapAct',
    description: 'Actual capacity',
    scaleFactor: 100,
    min: 0,
    max: 10000,
  },
  {
    register: 3003,
    sig: IntegerType.UINT,
    regType: RegisterType.Input,
    short: 'AirQual.CO2_Enable',
    description: 'Return > 0 if CO2 sensor is present, otherwise 0 or fail register reading',
  },

  /* Holding registers */

  {
     register: 200,
     sig: IntegerType.UINT,
     regType: RegisterType.Holding,
     short: 'Output.ExhaustSpeed',
     description: 'Exhaust fan speed',
     scaleFactor: 100,
     min: 100,
     max: 10000,
  },
  {
     register: 201,
     sig: IntegerType.UINT,
     regType: RegisterType.Holding,
     short: 'Output.InletSpeed',
     description: 'Inlet fan speed',
     scaleFactor: 100,
     min: 100,
     max: 10000,
  },
  {
     register: 202,
     sig: IntegerType.UINT,
     regType: RegisterType.Holding,
     short: 'Output.AirHeatCap',
     description: 'Air heater capacity',
     scaleFactor: 100,
     min: 100,
     max: 10000,
  },
  {
     register: 203,
     sig: IntegerType.UINT,
     regType: RegisterType.Holding,
     short: 'Output.CenHeatCap',
     description: 'Central heater capacity',
     scaleFactor: 100,
     min: 100,
     max: 10000,
  },
  {
     register: 204,
     sig: IntegerType.UINT,
     regType: RegisterType.Holding,
     short: 'Output.CprCap',
     description: 'Compresor capacity',
     scaleFactor: 100,
     min: 100,
     max: 10000,
  },
  {
     register: 205,
     sig: IntegerType.UINT,
     regType: RegisterType.Holding,
     short: 'Output.EarthSpeed',
     description: 'Earth tube air intake fan speed',
     scaleFactor: 100,
     min: 100,
     max: 10000,
  },
  {
    register: 600,
    sig: IntegerType.UINT,
    regType: RegisterType.Holding,
    short: 'Program.UserFuncAct',
    description: 'User function active',
    min: 0,
    max: 6,
  },
  {
    register: 601,
    sig: IntegerType.UINT,
    regType: RegisterType.Holding,
    short: 'Program.UserFuncSet',
    description: 'User function select',
    min: 0,
    max: 6,
  },
  {
    register: 602,
    sig: IntegerType.UINT,
    regType: RegisterType.Holding,
    short: 'Program.UserTimeSet',
    description: 'User function period',
    min: 0,
    max: 120,
  },
  {
     register: 1000,
     sig: IntegerType.UINT,
     regType: RegisterType.Holding,
     short: 'Control.Type',
     description: 'Machine type select (DO NOT WRITE TO THIS)',
     min: 0,
     max: 255,
  },
  {
    register: 1001,
    sig: IntegerType.UINT,
    regType: RegisterType.Holding,
    short: 'Control.RunSet',
    description: 'User on/off select',
    min: 0,
    max: 1,
  },
  {
    register: 1002,
    sig: IntegerType.UINT,
    regType: RegisterType.Holding,
    short: 'Control.ModeSet',
    description: 'User operation mode select',
    min: 0,
    max: 4,
  },
  {
    register: 1003,
    sig: IntegerType.UINT,
    regType: RegisterType.Holding,
    short: 'Control.VentSet',
    description: 'User ventilation step select',
    min: 0,
    max: 4,
  },
  { 
    register: 1004,
    sig: IntegerType.INT,
    regType: RegisterType.Holding,
    short: 'Control.TempSet',   
    description: 'User temperature setpoint',
    scaleFactor: 100,
    min: 500,  
    max: 3000, 
  },
  {
    register: 1005,
    sig: IntegerType.INT,
    regType: RegisterType.Holding,
    short: 'Control.ServiceMode',
    description: 'Service mode select',
    scaleFactor: 1,
    min: 0,
    max: 8,
  },
  {
    register: 1006,
    sig: IntegerType.INT,
    regType: RegisterType.Holding,
    short: 'Control.ServicePct',
    description: 'Service mode capacity',
    scaleFactor: 100,
    min: 100,
    max: 10000,
  },
  {
    register: 1007,
    sig: IntegerType.INT,
    regType: RegisterType.Holding,
    short: 'Control.Preset',
    description: 'Request preset to factory settings',
    scaleFactor: 1,
    min: 0,
    max: 3,
  },
  { 
    register: 1100,
    sig: IntegerType.INT,
    regType: RegisterType.Holding,
    short: 'AirFlow.AirExchMode',     
    description: 'Air exchange mode',
    scaleFactor: 1,
    min: 0,
    max: 2,
  },
  {
    register: 1700,
    sig: IntegerType.INT,
    regType: RegisterType.Holding,
    short: 'HotWater.TempSet_T11',
    description: 'Top temperature setpoint',
    scaleFactor: 100,
    min: 500,
    max: 6500,
  },   
  {
    register: 1701,
    sig: IntegerType.INT,
    regType: RegisterType.Holding,
    short: 'HotWater.TempSet_T12',
    description: 'Bottom temperature setpoint',
    scaleFactor: 100,
    min: 500, 
    max: 6500,
  },
  { 
    register: 1800,
    sig: IntegerType.INT,
    regType: RegisterType.Holding,
    short: 'CentralHeat.HeatExtern',
    description: 'External heating offset from room temperature setpoing',
    scaleFactor: 100,
    min: 500,
    max: 6500,
  },
  {
    register: 1910,
    sig: IntegerType.INT,
    regType: RegisterType.Holding,
    short: 'AirQual.RH_VentLo',
    description: 'AirQual.RH_VentLo 1910 Step Humidity low winter step select',
    scaleFactor: 1,
  },
  {
    register: 1911,
    sig: IntegerType.INT,
    regType: RegisterType.Holding,
    short: 'AirQual.RH_VentHi',
    description: 'Humidity high step select',
    scaleFactor: 1,
  },
  {
    register: 1912,
    sig: IntegerType.INT,
    regType: RegisterType.Holding,
    short: 'AirQual.RH_LimLo',
    description: 'Humidity limit for low ventilation',
    scaleFactor: 100,
    min: 0,
    max: 10000,
  },
  {
    register: 1913,
    sig: IntegerType.INT,
    regType: RegisterType.Holding,
    short: 'AirQual.RH_TimeOut',
    description: 'Humidity max. time on high ventilation',
    scaleFactor: 1,
  },



  {
    register: 4041,
    sig: IntegerType.INT,
    regType: RegisterType.Holding,
    short: 'Control.PowerSave',
    description: 'Enable power saving features',
    scaleFactor: 1,
    min: 0,
    max: 1,
  },

];

export const PARAMETER_MAP: ModbusParametersMap = PARAMETERS.reduce((obj: {}, r) => {
  // @ts-ignore
  obj[r.short] = r;
  return obj;
}, {});

export const IDENTIFICATION_PARAMETERS = [
  'Bus.Version',
  'App.VersionMajor',
  'App.VersionMinor',
  'App.VersionRelease',
  'Control.Type',
].map((key) => PARAMETER_MAP[key]);

export const OPERATION_PARAMETERS = [
  'Control.RunSet',
  'Control.ModeSet',
  'Control.VentSet',
  'Control.TempSet',
  'HotWater.TempSet_T12',
  'AirQual.RH_LimLo',
  'AirFlow.AirExchMode',
/*
  'Program.UserFuncAct',
  'Program.UserFuncSet',
  'Program.UserTimeSet',
*/
  'Control.PowerSave',
].map((key) => PARAMETER_MAP[key]);

export const SENSOR_PARAMETERS = [
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
].map((key) => PARAMETER_MAP[key]);

export const ALARM_PARAMETERS = [
  'Alarm.Status',
  'Alarm.List_1_ID',
  'Alarm.List_2_ID',
  'Alarm.List_3_ID',
  'Input.AirFilter'
].map((key) => PARAMETER_MAP[key]);

export const MachineType = new Map([
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
