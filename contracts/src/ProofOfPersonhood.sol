// SPDX-License-Identifier: MIT
pragma solidity ^0.8.23;

contract ProofOfPersonhood {
    struct Attestation {
        address person;
        uint256 timestamp;
        bool verified;
        bytes32 metadataHash;
    }

    mapping(address => Attestation) public attestations;
    mapping(address => bool) public attestors;
    address public owner;

    event AttestationCreated(address indexed person, address indexed attestor, uint256 timestamp);
    event AttestationVerified(address indexed person, bool verified);
    event AttestorAdded(address indexed attestor);

    constructor() {
        owner = msg.sender;
    }

    modifier onlyOwner() {
        require(msg.sender == owner, "Not owner");
        _;
    }

    modifier onlyAttestor() {
        require(attestors[msg.sender], "Not an attestor");
        _;
    }

    function addAttestor(address _attestor) external onlyOwner {
        attestors[_attestor] = true;
        emit AttestorAdded(_attestor);
    }

    function createAttestation(address _person, bytes32 _metadataHash) external onlyAttestor {
        require(attestations[_person].person == address(0), "Already attested");
        
        attestations[_person] = Attestation({
            person: _person,
            timestamp: block.timestamp,
            verified: false,
            metadataHash: _metadataHash
        });

        emit AttestationCreated(_person, msg.sender, block.timestamp);
    }

    function verifyAttestation(address _person, bool _verified) external onlyAttestor {
        attestations[_person].verified = _verified;
        emit AttestationVerified(_person, _verified);
    }
}
