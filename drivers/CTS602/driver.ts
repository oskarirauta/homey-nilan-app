import Homey from 'homey';
import PairSession from 'homey/lib/PairSession';

import net from 'net';
import {NilanApi} from './nilan_modbus_api';
import {MachineType} from './constants';

module.exports = class NilanModbusDriver extends Homey.Driver {

  async onInit() {
    this.log('NilanDriver has been initialized');
  }

  onPair(session: PairSession): void {

    let devices: any[] = [];

    session.setHandler('connection_details_entered', async (data) => {
      this.log('onPair: connection_details_entered:', data);
      if (!net.isIP(data.ipaddress)) {
        throw new Error(this.homey.__('pair.valid_ip_address'));
      }

      // todo: check port and unitid that they are numbers and in given ranges

      const api = new NilanApi({
        homey: this.homey,
        logger: this.log,
      });
      await api._connection(data.ipaddress, data.port, data.unitid);

      var machineType = -1;

      try {
        machineType = await api.getDeviceType();
      } catch (err) {
        this.log('error occurred while trying to retrieve machine type: ' + err);
        throw new Error(this.homey.__('pair.device_type_read_error'));
      }

      if ((machineType < 0) || (!MachineType.has(machineType))) {
        this.log('error, unsupported machine type or type code read failure');
        throw new Error(this.homey.__('pair.unsupported_device_type'));
      }

      await api._disconnect();
      await api._connection(data.ipaddress, data.port, data.unitid);

      this.log('got machinetype code ' + machineType);
      this.log('device identified as ' + MachineType.get(machineType));

      devices = [{
        name: MachineType.get(machineType),
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
