import Homey from 'homey';
import PairSession from 'homey/lib/PairSession';
import net from 'net';
import {Register} from '../../types';
import {ModbusApi} from '../../modbus_api';

module.exports = class CTS700Driver extends Homey.Driver {

  async onInit() {
    this.log('Nilan CTS700 driver has been initialized');
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

      devices = [{
        name: 'Compact P - Air 9',
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
