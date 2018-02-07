import Client from 'bitcoin-core';
import shell from 'node-powershell';

const homedir = require('os').homedir();
const { exec, spawn } = require('child_process');


class Wallet {

  constructor() {
    this.client = new Client({
      host: '127.0.0.1',
      port: 19119,
      username: 'yourusername',
      password: 'yourpassword'
    });
  }

  help() {
    return new Promise((resolve, reject) => {
      this.client.help().then((data) => {
        return resolve(data);
      }).catch((err) => {
        return reject(err);
      });
    });
  }

  command(batch) {
    return new Promise((resolve, reject) => {
      this.client.command(batch).then((responses) => {
        return resolve(responses);
      }).catch((err) => {
        return reject(err);
      });
    });
  }

  getInfo() {
    if (typeof this.client === 'undefined' || !this.client) {
      return Promise.reject(new Error('RPC this.client was not defined'));
    }

    return this.client.getInfo().then(res => {
      return Promise.resolve(res);
    }).catch((err) => {
      return Promise.reject(new Error(err));
    });
  }

  getBlockchainInfo() {
    return new Promise((resolve, reject) => {
      this.client.getBlockchainInfo().then((data) => {
        return resolve(data);
      }).catch((err) => {
        return reject(err);
      });
    });
  }

  getWalletInfo() {

    return this.client.getWalletInfo().then(res => {
      return Promise.resolve(res);
    }).catch((err) => {
      return Promise.reject(new Error(err))
    });
  }


  getTransactions(account, count, skip) {
    return new Promise((resolve, reject) => {
      let a = account;
      if (a === null) {
        a = '*';
      }
      this.client.listTransactions(a, count, skip).then((transactions) => {
        return resolve(transactions);
      }).catch((err) => {
        return reject(err);
      });
    });
  }

  listAllAccounts() {
    return new Promise((resolve, reject) => {
      this.client.listReceivedByAddress(0, true).then((addresses) => {
        return resolve(addresses);
      }).catch((err) => {
        return reject(err);
      });
    });
  }

  async createNewAddress(nameOpt) {
    const name = nameOpt || null;
    let newAddress;
    if (name === null) {
      newAddress = await this.client.getNewAddress();
    } else {
      newAddress = await this.client.getNewAddress(name);
    }
    return newAddress;
  }

  async sendMoney(sendAddress, amount) {
    const amountNum = parseFloat(amount);
    const sendAddressStr = `${sendAddress}`;
    await this.client.sendToAddress(sendAddressStr, amountNum);
  }

  async setTxFee(amount) {
    const amountNum = parseFloat(amount);
    await this.client.setTxFee(amountNum);
  }

  async validate(address) {
    const result = await this.client.validateAddress(address);
    return result;
  }

  async getblockcount() {
    const result = await this.client.getBlockCount();
    return result;
  }

  async getblockhash(hash) {
    const result = await this.client.getBlockHash(hash);
    return result;
  }

  async getpeerinfo() {
    const result = await this.client.getPeerInfo();
    return result;
  }

  async encryptWallet(passphrase) {
    try {
      const result = await this.client.encryptWallet(passphrase);
      return result;
    } catch (err) {
      return err;
    }
  }

  async walletlock() {
    try {
      const result = await this.client.walletLock();
      return result;
    } catch (err) {
      return err;
    }
  }

  async walletpassphrase(passphrase, time) {
    try {
      const ntime = parseInt(time);
      const result = await this.client.walletPassphrase(passphrase, ntime);
      return result;
    } catch (err) {
      return err;
    }
  }

  async walletChangePassphrase(oldPassphrase, newPassphrase) {
    try {
      return await this.client.walletPassphraseChange(oldPassphrase, newPassphrase);
    } catch (err) {
      return err;
    }
  }

  async walletstop() {
    try {
      return await this.client.stop();
    } catch (err) {
      return err;
    }
  }

  walletstart(cb) {
    if (process.platform === 'linux') {
      const path = `${homedir}/.eccoin-wallet/Eccoind`;
      runExec(`chmod +x ${path} && ${path}`, 1000).then(() => {
        return cb(true);
      })
        .catch(() => {
          cb(false);
        });

    } else if (process.platform === 'darwin') {
      const path = `${homedir}/.eccoin-wallet/Eccoind.app/Contents/MacOS/eccoind`;
      runExec(`chmod +x ${path} && ${path}`, 1000).then(() => {
        return cb(true);
      })
        .catch(() => {
          cb(false);
        });
    } else if (process.platform.indexOf('win') > -1) {
      let path = `${homedir}\\.eccoin-wallet\\Eccoind.exe`;
      path = `& '${path}'`;
      const ps = new shell({ //eslint-disable-line
        executionPolicy: 'Bypass',
        noProfile: true
      });

      ps.addCommand(path);
      ps.invoke()
        .then(() => {
          return cb(true);
        })
        .catch(err => {
          console.log(err);
          cb(false);
          ps.dispose();
        });
    } 
  }

}

const instance = new Wallet();
Object.freeze(instance);

export default instance;

function runExec(cmd, timeout, cb) {
  return new Promise((resolve, reject) => {
    exec(cmd, (error, stdout, stderr) => {
      if (error) {
        reject(error);
      } else {
        resolve('program exited without an error');
      }
    });
    setTimeout(() => {
      resolve('program still running');
    }, timeout);
  });
}
