import Homey from 'homey';
import PairSession from 'homey/lib/PairSession';
import net from 'net';
import {ID_REGISTERS, DEVICE_IDENTIFICATION_REGISTER, MachineTypes} from './constants';
import {Register} from '../../types';
import {ModbusApi} from '../../modbus_api';

module.exports = class CTS602Driver extends Homey.Driver {

  async onInit() {
    this.log('Nilan CTS602 driver has been initialized');
  }

  async _getMachineType(api: ModbusApi): Promise<number | undefined> {
    return new Promise((resolve, reject) => {
      (async () => {
        try {
          const machineType = await api.readSingle(DEVICE_IDENTIFICATION_REGISTER, ID_REGISTERS);
          if (machineType === undefined )
            reject(this.homey.__('errors.device_type_read_error'));
          if (!MachineTypes.has((machineType as unknown) as number)) {
            this.log('Unsupported machine type code ', (machineType as unknown) as number);
            reject(this.homey.__('errors.device_unsupported', {machineType}));
          } else if (MachineTypes.get((machineType as unknown) as number) === '?') {
            this.log('Unsupported machine type code ', (machineType as unknown) as number, ' - value is reserved for future uses');
            reject(this.homey.__('errors.device_unsupported', {machineType}));
          }
          resolve((machineType as unknown) as number);
        } catch(err) {
          this.log(err);
        }
        reject(this.homey.__('errors.identification_failed'));
      })();
    });
  }

  onPair(session: PairSession): void {

    let devices: any[] = [];

    session.setHandler('connection_details_entered', async (data) => {
      this.log('onPair: connection_details_entered:', data);
      if (!net.isIP(data.ipaddress)) {
        throw new Error(this.homey.__('pair.valid_ip_address'));
      }

      // todo: check port and unitid that they are numbers and in given ranges

      const api = new ModbusApi({
        homey: this.homey,
        logger: this.log,
      });
      await api._connection(data.ipaddress, data.port, data.unitid);

      const machineType = await this._getMachineType(api);

      if ( machineType == undefined ) {
        throw new Error(this.homey.__('errors.identification_failed'));
      } else this.log('Machine type', MachineTypes.get(machineType), 'with type code', machineType, 'found'); 

      await api._disconnect();
      await api._connection(data.ipaddress, data.port, data.unitid);

      this.log('got machinetype code ' + machineType);
      this.log('device identified as ' + MachineTypes.get(machineType));

      devices = [{
        name: MachineTypes.get(machineType),
        data: {
          id: 'x.x.x.x',
        },
        settings: {
          'device-ip': data.ipaddress,
          'device-port': data.port,
          'device-id': data.unitid
        }
      }];

      // @ts-ignore
      await session.showView('list_devices');
    });

    session.setHandler('list_devices', async () => {
      return devices;
    });

  }

};
