pragma solidity >=0.7.0 <0.9.0;

import "./Verifier.sol";

contract KycWallet {
    address public operator;
    Verifier public verifier;

    // front running and be solved latter
    constructor(
        Verifier _verifier,
        uint[2] memory _pA,
        uint[2][2] memory _pB,
        uint[2] memory _pC,
        uint[34] memory _pubSignals
    ) {
        require(
            _verifier.verifyProof(_pA, _pB, _pC, _pubSignals),
            "Invalid Proof"
        );
        verifier = verifier;
    }

    function external_call(
        address destination,
        uint value,
        uint dataLength,
        bytes memory data
    ) internal returns (bool) {
        require(msg.sender == operator, "Only operator can be called");
        bool result;
        assembly {
            let x := mload(0x40) // "Allocate" memory for output (0x40 is where "free memory" pointer is stored by convention)
            let d := add(data, 32) // First 32 bytes are the padded length of data, so exclude that
            result := call(
                sub(gas(), 34710), // 34710 is the value that solidity is currently emitting
                // It includes callGas (700) + callVeryLow (3, to pay for SUB) + callValueTransferGas (9000) +
                // callNewAccountGas (25000, in case the destination address does not exist and needs creating)
                destination,
                value,
                d,
                dataLength, // Size of the input (in bytes) - this is what fixes the padding problem
                x,
                0 // Output is ignored, therefore the output size is zero
            )
        }
        return result;
    }
}
