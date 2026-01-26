// SPDX-License-Identifier: MIT
pragma solidity ^0.8.23;

import {Test} from "forge-std/Test.sol";
import {ProofOfPersonhood} from "../src/ProofOfPersonhood.sol";

contract ProofOfPersonhoodTest is Test {
    ProofOfPersonhood public pop;
    address public owner;
    address public attestor;
    address public person;

    function setUp() public {
        owner = address(this);
        attestor = address(0x1);
        person = address(0x2);
        
        pop = new ProofOfPersonhood();
        pop.addAttestor(attestor);
    }

    function test_CreateAttestation() public {
        vm.prank(attestor);
        pop.createAttestation(person, bytes32(0));
        
        (address p, , , ) = pop.attestations(person);
        assertEq(p, person);
    }
}
