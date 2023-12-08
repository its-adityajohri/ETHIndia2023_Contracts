// SPDX-License-Identifier: UNLICENSED
pragma solidity 0.8.19;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract MyToken is ERC20 {
    constructor(
        string memory name,
        string memory symbol,
        address receiver,
        uint256 ts
    ) ERC20(name, symbol) {
        _mint(receiver, ts);
    }
}
