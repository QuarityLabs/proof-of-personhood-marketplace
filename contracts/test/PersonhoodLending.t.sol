// SPDX-License-Identifier: MIT
pragma solidity ^0.8.23;

import {Test} from "forge-std/Test.sol";
import {PersonhoodLending} from "../src/PersonhoodLending.sol";

contract PersonhoodLendingTest is Test {
    PersonhoodLending public personhoodLending;

    // Test accounts
    address lender = address(0x1111);
    address borrower = address(0x2222);

    function setUp() public {
        personhoodLending = new PersonhoodLending();
    }

    function testCreateAgreement() public {
        // Setup the agreement parameters
        string memory context = "Polkadot Forum";
        uint256 duration = 7 days;
        uint256 collateral = 1 ether;

        // Create the agreement
        vm.deal(lender, collateral);
        vm.prank(lender);
        uint256 agreementId = personhoodLending.createAgreement{value: collateral}(borrower, context, duration);

        // Verify the agreement was created correctly
        PersonhoodLending.LendingAgreement memory agreement = personhoodLending.getAgreement(agreementId);
        assertEq(agreement.agreementId, 1);
        assertEq(agreement.lender, lender);
        assertEq(agreement.borrower, borrower);
        assertEq(keccak256(abi.encodePacked(agreement.context)), keccak256(abi.encodePacked(context)));
        assertEq(agreement.duration, duration);
        assertEq(agreement.collateral, collateral);
        assertTrue(agreement.isActive);
    }

    function testCompleteAgreement() public {
        // Setup the agreement parameters
        string memory context = "Governance Voting";
        uint256 duration = 1 hours;
        uint256 collateral = 0.5 ether;

        // Create an agreement first
        vm.deal(lender, collateral);
        vm.prank(lender);
        uint256 agreementId = personhoodLending.createAgreement{value: collateral}(borrower, context, duration);

        // Warp time forward to simulate completion of the agreement duration
        vm.warp(block.timestamp + duration + 1);

        // Complete the agreement
        vm.prank(lender);
        personhoodLending.completeAgreement(agreementId);

        // Check that the agreement is no longer active
        PersonhoodLending.LendingAgreement memory agreement = personhoodLending.getAgreement(agreementId);
        assertFalse(agreement.isActive);
    }

    function test_RevertWhen_ZeroAddressBorrower() public {
        vm.deal(address(this), 1 ether);
        vm.expectRevert("Invalid borrower address");
        personhoodLending.createAgreement{value: 1 ether}(address(0), "Test Context", 1 days);
    }

    function test_RevertWhen_ZeroCollateral() public {
        vm.expectRevert("Collateral must be greater than 0");
        personhoodLending.createAgreement(borrower, "Test Context", 1 days);
    }
}
