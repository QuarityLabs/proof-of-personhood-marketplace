// SPDX-License-Identifier: MIT
pragma solidity ^0.8.23;

import {Test} from "forge-std/Test.sol";
import {PersonhoodLending} from "../src/PersonhoodLending.sol";

contract PersonhoodLendingTest is Test {
    PersonhoodLending public marketplace;
    address public treasury = address(0x9999);

    function setUp() public {
        marketplace = new PersonhoodLending(treasury);
    }

    function test_OfferStatusEnumValues() public pure {
        assertEq(uint256(PersonhoodLending.OfferStatus.PENDING), 0);
        assertEq(uint256(PersonhoodLending.OfferStatus.ACTIVE), 1);
        assertEq(uint256(PersonhoodLending.OfferStatus.EXPIRED), 2);
        assertEq(uint256(PersonhoodLending.OfferStatus.REMOVED), 3);
    }

    function test_DisputeStatusEnumValues() public pure {
        assertEq(uint256(PersonhoodLending.DisputeStatus.PENDING), 0);
        assertEq(uint256(PersonhoodLending.DisputeStatus.RESOLVED_SIGNATURE), 1);
        assertEq(uint256(PersonhoodLending.DisputeStatus.RESOLVED_ACK), 2);
        assertEq(uint256(PersonhoodLending.DisputeStatus.TIMEOUT), 3);
    }

    function test_ProtocolConstants() public view {
        assertEq(marketplace.MIN_DEPOSIT(), 0.1 ether);
        assertEq(marketplace.MIN_WEEKLY_PAYMENT(), 0.01 ether);
        assertEq(marketplace.GRACE_PERIOD(), 7 days);
        assertEq(marketplace.DISPUTE_TIMEOUT(), 2 hours);
        assertEq(marketplace.OFFENCE_PENALTY_PERCENTAGE(), 5000);
        assertEq(marketplace.BASIS_POINTS(), 10000);
        assertEq(marketplace.RENTAL_DURATION(), 7 days);
        assertEq(marketplace.MAX_OFFENCES(), 3);
        assertEq(marketplace.MAX_INVALID_DISPUTES(), 3);
    }

    function test_InitialCounters() public view {
        assertEq(marketplace.nextOfferId(), 0);
        assertEq(marketplace.nextDisputeId(), 0);
    }

    function test_ProtocolTreasury() public view {
        assertEq(marketplace.protocolTreasury(), treasury);
    }

    function test_OfferStructExists() public {
        PersonhoodLending.Offer memory testOffer = PersonhoodLending.Offer({
            offerId: 1,
            submitter: address(0x1111),
            renter: address(0),
            usageContext: "Polkadot Forum",
            weeklyPayment: 0.01 ether,
            deposit: 0.1 ether,
            lockedPayment: 0,
            createdAt: block.timestamp,
            rentedAt: 0,
            expiresAt: 0,
            status: PersonhoodLending.OfferStatus.PENDING,
            totalRentals: 0,
            lenderOffences: 0,
            renterInvalidDisputes: 0,
            activeDisputeId: 0
        });
        assertEq(testOffer.offerId, 1);
        assertEq(testOffer.lenderOffences, 0);
        assertEq(testOffer.renterInvalidDisputes, 0);
        assertEq(testOffer.activeDisputeId, 0);
    }

    function test_DisputeStructExists() public {
        PersonhoodLending.Dispute memory testDispute = PersonhoodLending.Dispute({
            disputeId: 1,
            offerId: 1,
            renter: address(0x2222),
            renterSignedRequest: new bytes(64),
            expectedPayload: new bytes(32),
            deadline: block.timestamp + 2 hours,
            status: PersonhoodLending.DisputeStatus.PENDING,
            createdAt: block.timestamp,
            disputeDeposit: 0.01 ether
        });
        assertEq(testDispute.disputeId, 1);
        assertEq(testDispute.deadline, block.timestamp + 2 hours);
    }

    // ============ Core Functions Tests ============

    function test_CreateOffer() public {
        uint256 offerId = marketplace.createOffer("Context", 0.01 ether, 0.1 ether);
        assertEq(offerId, 0);
        assertEq(marketplace.nextOfferId(), 1);
    }

    function test_CreateOffer_RevertEmptyContext() public {
        vm.expectRevert("Usage context cannot be empty");
        marketplace.createOffer("", 0.01 ether, 0.1 ether);
    }

    function test_CreateOffer_RevertLowPayment() public {
        vm.expectRevert("Weekly payment too low");
        marketplace.createOffer("Context", 0.009 ether, 0.1 ether);
    }

    function test_CreateOffer_RevertLowDeposit() public {
        vm.expectRevert("Deposit too low");
        marketplace.createOffer("Context", 0.01 ether, 0.09 ether);
    }

    function test_AcceptOffer() public {
        uint256 offerId = marketplace.createOffer("Context", 0.01 ether, 0.1 ether);
        address renter = address(0x1234);
        vm.deal(renter, 0.11 ether);
        vm.prank(renter);
        marketplace.acceptOffer{value: 0.11 ether}(offerId);

        (,, address offerRenter,,,,,,,,,,,,) = marketplace.offers(offerId);
        assertEq(offerRenter, renter);
    }

    function test_AcceptOffer_RevertNotPending() public {
        uint256 offerId = marketplace.createOffer("Context", 0.01 ether, 0.1 ether);
        address renter = address(0x1234);
        vm.deal(renter, 0.22 ether);
        vm.prank(renter);
        marketplace.acceptOffer{value: 0.11 ether}(offerId);

        address renter2 = address(0x5678);
        vm.deal(renter2, 0.11 ether);
        vm.prank(renter2);
        vm.expectRevert("Offer not available");
        marketplace.acceptOffer{value: 0.11 ether}(offerId);
    }

    function test_AcceptOffer_RevertOwnOffer() public {
        uint256 offerId = marketplace.createOffer("Context", 0.01 ether, 0.1 ether);
        vm.deal(address(this), 0.11 ether);
        vm.expectRevert("Cannot rent own offer");
        marketplace.acceptOffer{value: 0.11 ether}(offerId);
    }

    function test_AcceptOffer_RevertIncorrectAmount() public {
        uint256 offerId = marketplace.createOffer("Context", 0.01 ether, 0.1 ether);
        address renter = address(0x1234);
        vm.deal(renter, 0.1 ether);
        vm.prank(renter);
        vm.expectRevert("Incorrect payment amount");
        marketplace.acceptOffer{value: 0.1 ether}(offerId);
    }

    receive() external payable {}
}
