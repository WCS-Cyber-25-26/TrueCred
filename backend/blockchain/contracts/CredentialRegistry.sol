// contracts/CredentialRegistry.sol
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract CredentialRegistry {
    address public owner;

    struct Credential {
        bytes32 studentHash;
        address issuer;
        uint256 issuedAt;
    }

    mapping(bytes32 => Credential) private credentials;

    event CredentialAdded(bytes32 credentialId, address issuer);

    modifier onlyOwner() {
        require(msg.sender == owner, "Not authorized");
        _;
    }

    constructor(address _owner) {
        owner = _owner;
    }

    function addCredential(
        bytes32 credentialId,
        bytes32 studentHash
    ) external onlyOwner {
        require(credentials[credentialId].issuedAt == 0, "Already exists");

        credentials[credentialId] = Credential({
            studentHash: studentHash,
            issuer: msg.sender,
            issuedAt: block.timestamp
        });

        emit CredentialAdded(credentialId, msg.sender);
    }

    function getCredential(bytes32 credentialId)
        external
        view
        returns (bytes32 studentHash, address issuer, uint256 issuedAt)
    {
        Credential memory c = credentials[credentialId];
        require(c.issuedAt != 0, "Not found");
        return (c.studentHash, c.issuer, c.issuedAt);
    }
}
