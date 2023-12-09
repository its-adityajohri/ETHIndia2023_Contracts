// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "./Outbox.sol";
import "./Inbox.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

contract TokenBridge {
    Outbox public outbox;
    Inbox public inbox;

    mapping(uint256 => mapping(address => address)) public crossTokenAddress;

    mapping(uint256 => address) public crossChainTokenBridgeMappers;

    constructor(Inbox _inbox, Outbox _outbox) {
        inbox = _inbox;
        outbox = _outbox;
    }

    function setCrossChainBridgeMapper(
        uint256 chainId,
        address destinationBridgeMap
    ) external {
        require(
            crossChainTokenBridgeMappers[chainId] == address(0),
            "Inbox already mapped"
        );
        crossChainTokenBridgeMappers[chainId] = destinationBridgeMap;
    }

    function setCrossTokenAddress(
        uint256 destinationChainId,
        address sourceTokenAddress,
        address targetTokenAddress
    ) external {
        // Ensure that the address is not already set
        require(
            crossTokenAddress[destinationChainId][sourceTokenAddress] ==
                address(0),
            "Address already set"
        );

        crossTokenAddress[destinationChainId][
            sourceTokenAddress
        ] = targetTokenAddress;
    }

    function bridgeToken(
        uint256 chainId,
        address tokenAddress,
        address to,
        uint256 amount
    ) external {
        // Ensure the token address is valid for the target chain
        require(
            crossTokenAddress[chainId][tokenAddress] != address(0),
            "Invalid token for target chain"
        );

        require(
            crossChainTokenBridgeMappers[chainId] != address(0),
            "Invalid destination Inbox"
        );

        // Transfer tokens to this contract
        IERC20(tokenAddress).transferFrom(msg.sender, address(this), amount);

        // Encode the token transfer data
        bytes memory data = abi.encode(
            crossTokenAddress[chainId][tokenAddress],
            to,
            amount
        );

        // Send the message via Outbox
        outbox.sendMessage(
            crossChainTokenBridgeMappers[chainId],
            chainId,
            data
        );
    }

    function releaseToken(uint256 chainId, uint256 messageId) external {
        // Retrieve the message from Inbox
        Inbox.Message memory message = inbox.getMessage(chainId, messageId);

        // Decode the token transfer data
        (address tokenAddress, address to, uint256 amount) = abi.decode(
            message.data,
            (address, address, uint256)
        );

        // Ensure right contract is consuming it
        require(message.to != address(0), "Can't be zero");
        require(message.to == address(this), "Right Contract not consuming it");

        // Transfer the tokens to the recipient
        IERC20(tokenAddress).transfer(to, amount);
    }
}
