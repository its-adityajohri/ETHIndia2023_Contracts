// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract Outbox {
    // This event logs the message details when a message is sent
    event SentMessage(
        uint256 indexed messageId,
        uint256 indexed fromChainId,
        uint256 toChainId,
        address to,
        bytes data
    );

    // A counter for the current message ID
    uint256 public currentMessageId;

    constructor() {
        currentMessageId = 0;
    }

    // The sendMessage function allows sending a message from one chain to another
    function sendMessage(
        address to,
        uint256 chainId,
        bytes memory data
    ) public {
        // Increment the message ID for each new message
        currentMessageId++;

        // Emit the event with the message details
        emit SentMessage(currentMessageId, block.chainid, chainId, to, data);
    }
}
