// SPDX-License-Identifier: MIT
pragma solidity ^0.8.23;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

/**
 * @title ProofOfPersonhood
 * @notice A minimal contract for managing proof-of-personhood attestations on Polkadot Asset Hub
 * @dev Uses Revive compiler for Polkadot Asset Hub compatibility
 */
contract ProofOfPersonhood is Ownable, ReentrancyGuard {
    struct Attestation {
        address person;
        uint256 timestamp;
        bool verified;
        bytes32 metadataHash;
    }

    mapping(address => Attestation) public attestations;
    mapping(address => bool) public attestors;

    uint256 public totalAttestations;

    event AttestationCreated(address indexed person, address indexed attestor, uint256 timestamp);
    event AttestationVerified(address indexed person, bool verified);
    event AttestorAdded(address indexed attestor);
    event AttestorRemoved(address indexed attestor);

    modifier onlyAttestor() {
        require(attestors[msg.sender], "Not an attestor");
        _;
    }

    constructor(address _owner) Ownable(_owner) {}

    function addAttestor(address _attestor) external onlyOwner {
        require(_attestor != address(0), "Invalid address");
        attestors[_attestor] = true;
        emit AttestorAdded(_attestor);
    }

    function removeAttestor(address _attestor) external onlyOwner {
        attestors[_attestor] = false;
        emit AttestorRemoved(_attestor);
    }

    function createAttestation(
        address _person,
        bytes32 _metadataHash
    ) external onlyAttestor nonReentrant {
        require(attestations[_person].person == address(0), "Already attested");
        require(_person != address(0), "Invalid person address");

        attestations[_person] = Attestation({
            person: _person,
            timestamp: block.timestamp,
            verified: false,
            metadataHash: _metadataHash
        });

        totalAttestations++;

        emit AttestationCreated(_person, msg.sender, block.timestamp);
    }

    function verifyAttestation(address _person, bool _verified) external onlyAttestor {
        require(attestations[_person].person != address(0), "No attestation found");
        attestations[_person].verified = _verified;
        emit AttestationVerified(_person, _verified);
    }

    function isVerified(address _person) external view returns (bool) {
        return attestations[_person].verified;
    }

    function getAttestation(address _person) external view returns (Attestation memory) {
        return attestations[_person];
    }
}
