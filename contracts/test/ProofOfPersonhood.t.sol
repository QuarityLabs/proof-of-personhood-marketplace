// SPDX-License-Identifier: MIT
pragma solidity ^0.8.23;

import "forge-std/Test.sol";
import "../src/ProofOfPersonhood.sol";

contract ProofOfPersonhoodTest is Test {
    ProofOfPersonhood poh;
    address owner = address(0x1);
    address attestor = address(0x2);
    address person = address(0x3);

    function setUp() public {
        vm.prank(owner);
        poh = new ProofOfPersonhood(owner);
        vm.prank(owner);
        poh.addAttestor(attestor);
    }

    function test_AddAttestor() public {
        vm.prank(owner);
        poh.addAttestor(address(0x4));
        assertTrue(poh.attestors(address(0x4)));
    }

    function test_CreateAttestation() public {
        vm.prank(attestor);
        poh.createAttestation(person, keccak256("metadata"));

        (address attestedPerson, uint256 timestamp, bool verified, bytes32 metadataHash) = poh.getAttestation(person);
        assertEq(attestedPerson, person);
        assertGt(timestamp, 0);
        assertFalse(verified);
        assertEq(metadataHash, keccak256("metadata"));
    }

    function test_VerifyAttestation() public {
        vm.prank(attestor);
        poh.createAttestation(person, keccak256("metadata"));

        vm.prank(attestor);
        poh.verifyAttestation(person, true);

        assertTrue(poh.isVerified(person));
    }

    function test_Revert_IfNotAttestor() public {
        vm.expectRevert("Not an attestor");
        vm.prank(address(0x999));
        poh.createAttestation(person, keccak256("metadata"));
    }
}
