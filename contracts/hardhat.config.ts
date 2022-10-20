import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";

const config: HardhatUserConfig = {
  solidity: "0.8.9",
  networks: {
    ganache: {
      // rpc url, change it according to your ganache configuration
      url: 'http://localhost:8545',
      // the private key of signers, change it according to your ganache user
      accounts: [
        '0xbb6d22d9222c683f09b203fb1cf166514cbfa5bb99ddfbd341419e273c9174f8',
        '0x2ba71a963f89c86e6f8173c1ce246aaf24917faa50ac21fb3e4512046aee902a',
        '0x447f2fa47ebe181e8a012cd6bc8a8ec70ee95a745c9960afb33be6029dcbce05',
        '0xce49f84483e5172b1059314f4e1006c6227eec78739f1adfb5cd63645034b1fc',
        '0x356034d0358af015981bcce635af897d8524a6dd80e72907d2c20c91c945c048'
      ]
    },
  },
};

export default config;
