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
        '0x596c7e73ba2c590ed05198108fdc7807f20b22c1ae6b1b44a7c506e9b2ab861d',
        '0x1f1a1c7bfed820317e9be0c3dd148b6991caa83d5bdf81f7d5eb26f50e371c7d',
        '0xc1173cfedb98621898c2c478bcaf2ce4888fd7cd5fe872592d0b7a291cf83a44',
        '0x200c042aef37334da8bb057516e193d17fdf05cb1be1b251118500360f4bafc7',
        '0xf2086d4cba428d5b8cf6d8fbfa53666b3677fc63cbc0b7f5c645db6518af1267'
      ]
    },
  },
};

export default config;
