// SPDX-License-Identifier: MIT
pragma solidity ^0.8.23;

import {Test} from "forge-std/Test.sol";
import {PersonhoodLending} from "../src/PersonhoodLending.sol";

contract PersonhoodLendingTest is Test {
    PersonhoodLending public marketplace;

    function setUp() public {
        marketplace = new PersonhoodLending();
    }

    function test_OfferStatusEnumValues() public pure {
        assertEq(uint256(PersonhoodLending.OfferStatus.PENDING), 0);
        assertEq(uint256(PersonhoodLending.OfferStatus.ACTIVE), 1);
        assertEq(uint256(PersonhoodLending.OfferStatus.EXPIRED), 2);
        assertEq(uint256(PersonhoodLending.OfferStatus.REMOVED), 3);
    }

    function test_RequestStatusEnumValues() public pure {
        assertEq(uint256(PersonhoodLending.RequestStatus.PENDING), 0);
        assertEq(uint256(PersonhoodLending.RequestStatus.APPROVED), 1);
        assertEq(uint256(PersonhoodLending.RequestStatus.REJECTED), 2);
        assertEq(uint256(PersonhoodLending.RequestStatus.SLASHED), 3);
    }

    function test_ProtocolConstants() public view {
        assertEq(marketplace.MIN_DEPOSIT(), 0.1 ether);
        assertEq(marketplace.GRACE_PERIOD(), 7 days);
        assertEq(marketplace.SLASHING_PERIOD(), 1 hours);
        assertEq(marketplace.SLASHING_PERCENTAGE(), 1000);
        assertEq(marketplace.BASIS_POINTS(), 10000);
        assertEq(marketplace.RENTAL_DURATION(), 7 days);
    }

    function test_InitialCounters() public view {
        assertEq(marketplace.nextOfferId(), 0);
        assertEq(marketplace.nextRequestId(), 0);
    }

    function test_OfferStructExists() public {
        PersonhoodLending.Offer memory testOffer = PersonhoodLending.Offer({
            offerId: 1,
            submitter: address(0x1111),
            renter: address(0),
            usageContext: "Test",
            weeklyPayment: 0.01 ether,
            deposit: 0.1 ether,
            signature: new bytes(64),
            createdAt: block.timestamp,
            rentedAt: 0,
            expiresAt: 0,
            status: PersonhoodLending.OfferStatus.PENDING,
            autoApprove: false,
            totalRentals: 0
        });
        assertEq(testOffer.offerId, 1);
    }

    function test_UsageRequestStructExists() public {
        PersonhoodLending.UsageRequest memory testRequest = PersonhoodLending.UsageRequest({
            requestId: 1,
            offerId: 1,
            renter: address(0x2222),
            deadline: block.timestamp + 1 hours,
            status: PersonhoodLending.RequestStatus.PENDING,
            createdAt: block.timestamp
        });
        assertEq(testRequest.requestId, 1);
    }

    function test_SignatureMappingExists() public {
        bytes memory testSig = new bytes(64);
        bool isUsed = marketplace.usedSignatures(testSig);
        assertFalse(isUsed);
    }

    receive() external payable {}
}
