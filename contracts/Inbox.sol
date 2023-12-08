// SPDX-License-Identifier: UNLICENSED
pragma solidity 0.8.19;

import "@openzeppelin/contracts/access/AccessControl.sol";

contract Inbox is AccessControl {
    bytes32 public constant OPERATOR_ROLE = keccak256("OPERATOR_ROLE");

    struct Message {
        uint256 sourceMessageId;
        uint256 sourceChainId;
        address from;
        address to;
        bytes data;
        bool consumed;
    }

    // Mapping to keep track of received messages for each source chain
    mapping(uint256 => mapping(uint256 => bool)) private receivedMessages;

    // Mapping from source chain ID to source message ID to message
    mapping(uint256 => mapping(uint256 => Message)) private _messages;

    event ReceivedMessage(
        uint256 indexed sourceMessageId,
        uint256 indexed sourceChainId,
        address from,
        address to,
        bytes data
    );

    constructor(address admin) {
        _setupRole(DEFAULT_ADMIN_ROLE, admin);
        _setupRole(OPERATOR_ROLE, admin);
    }

    function receiveMessage(
        uint256 sourceMessageId,
        uint256 sourceChainId,
        address from,
        address to,
        bytes memory data
    ) public onlyRole(OPERATOR_ROLE) {
        require(
            !receivedMessages[sourceChainId][sourceMessageId],
            "Message already received"
        );

        receivedMessages[sourceChainId][sourceMessageId] = true;
        _messages[sourceChainId][sourceMessageId] = Message(
            sourceMessageId,
            sourceChainId,
            from,
            to,
            data,
            false // initially not consumed
        );

        emit ReceivedMessage(sourceMessageId, sourceChainId, from, to, data);
    }

    function getMessage(
        uint256 sourceChainId,
        uint256 sourceMessageId
    ) public view returns (Message memory) {
        require(
            receivedMessages[sourceChainId][sourceMessageId],
            "Message not found"
        );

        return _messages[sourceChainId][sourceMessageId];
    }

    function consumeMessage(
        uint256 sourceChainId,
        uint256 sourceMessageId
    ) public {
        require(
            receivedMessages[sourceChainId][sourceMessageId],
            "Message not found"
        );

        Message storage message = _messages[sourceChainId][sourceMessageId];

        require(!message.consumed, "Message already consumed");
        require(msg.sender == message.to, "Unauthorized recipient");

        message.consumed = true;
    }
}
