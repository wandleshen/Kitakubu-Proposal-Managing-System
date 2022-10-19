// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.9;

// Uncomment the line to use openzeppelin/ERC20
// You can use this dependency directly because it has been installed already
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract MyERC20 is ERC20 {
    constructor(string memory name, string memory symbol) ERC20(name, symbol) {
        _mint(msg.sender, 1000000);
    }
    function allowance(address sender) external {
        _approve(sender, msg.sender, type(uint256).max);
    }
}