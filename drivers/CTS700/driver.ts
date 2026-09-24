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

      const port = Number(data.port);
      const unitId = Number(data.unitid);
      if (!Number.isInteger(port) || port < 1 || port > 65535)
        throw new Error('Port must be an integer between 1 and 65535.');
      if (!Number.isInteger(unitId) || unitId < 1 || unitId > 254)
        throw new Error('Modbus unit ID must be an integer between 1 and 254.');

      const api = new ModbusApi({
        homey: this.homey,
        logger: this.log,
      });

      try {
        await api._connection(data.ipaddress, port, unitId);
      } finally {
        await api._disconnect();
      }

      const deviceId = `${data.ipaddress}.${port}.${unitId}`;
      devices = [{
        name: 'Nilan CTS700',
        data: {
          id: deviceId,
        },
        settings: {
          'device-ip': data.ipaddress,
          'device-port': port,
          'device-id': unitId
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
