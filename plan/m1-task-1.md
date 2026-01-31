# Task Completion Report: m1-task-1 (Protocol v2.0)

**Task ID:** m1-task-1  
**Title:** Redesign Data Structures  
**Milestone:** 1 - Protocol-Compliant Smart Contract with Dispute System  
**Status:** Complete  
**Date:** 2026-01-30  
**Protocol Version:** 2.0.0 (Dispute-based off-chain communication)

---

## Summary of Changes

This implementation was updated from Protocol v1.1 (slashing-based) to Protocol v2.0 (dispute-based off-chain communication) based on review feedback.

### Key Protocol Changes v2.0

1. **Off-Chain First**: By default, sign-requests happen off-chain directly between renter and lender
2. **Dispute System**: On-chain only used when renter claims lender is unresponsive
3. **Offence-Based Penalties**: Instead of slashing deposits, offences reduce lender payout by 50% each (100% → 50% → 25% → 12.5%)
4. **Reputation for Both Parties**: 
   - Lender offences: failure to respond to disputes within 2 hours
   - Renter offences: submitting invalid disputes (proven false by lender ACK)
5. **Locked Payments**: Weekly payments locked until lease ends, minus any penalties
6. **Contract Cancellation**: 
   - After 3 lender offences: renter can cancel and reclaim payment
   - After 3 renter invalid disputes: contract cancelled for both parties
   - Cancelled contract deposits go to protocol treasury

---

## What Was Implemented

### 1. New Enums

**OfferStatus Enum**
- PENDING (0) - Offer created, awaiting renter
- ACTIVE (1) - Offer rented, in use
- EXPIRED (2) - Rental period ended, in grace period
- REMOVED (3) - Offer permanently removed

**DisputeStatus Enum**
- PENDING (0) - Dispute active, awaiting resolution
- RESOLVED_SIGNATURE (1) - Lender submitted signature
- RESOLVED_ACK (2) - Lender submitted renter ACK (renter was lying)
- TIMEOUT (3) - Lender failed to respond within 2 hours

### 2. New Structs

**Offer Struct** (16 fields)
- offerId, submitter, renter, usageContext
- weeklyPayment, deposit, lockedPayment
- createdAt, rentedAt, expiresAt
- status, totalRentals
- lenderOffences, renterInvalidDisputes
- activeDisputeId

**Dispute Struct** (9 fields)
- disputeId, offerId, renter
- renterSignedRequest, expectedPayload
- deadline, status, createdAt, disputeDeposit

### 3. Protocol Constants

| Constant | Value | Description |
|----------|-------|-------------|
| MIN_DEPOSIT | 0.1 ether | Minimum deposit for offers |
| MIN_WEEKLY_PAYMENT | 0.01 ether | Minimum weekly payment |
| GRACE_PERIOD | 7 days | Time to renew after expiration |
| DISPUTE_TIMEOUT | 2 hours | Time for lender to respond |
| OFFENCE_PENALTY_PERCENTAGE | 5000 (50%) | Payout reduction per offence |
| BASIS_POINTS | 10000 | For percentage calculations |
| RENTAL_DURATION | 7 days | Fixed rental period |
| MAX_OFFENCES | 3 | Max before rent cancellation |
| MAX_INVALID_DISPUTES | 3 | Max before contract termination |

### 4. Storage Mappings

- offers - offerId => Offer
- disputes - disputeId => Dispute
- submitterOffers - address => offerId[] (lender's offers)
- renterActiveOffers - address => offerId[] (renter's rentals)

### 5. All Protocol Events (15 events)

**Core Offer Events:**
- OfferCreated, OfferAccepted, RentalRenewed, OfferExpired
- OfferReturnedToMarket, OfferRemoved, PayoutClaimed
- DepositClaimed, OfferTermsUpdated

**Dispute Events:**
- DisputeSubmitted, SignatureSubmitted, ACKSubmitted
- DisputeResolved, OffenceCounted, RentCancelled

### 6. Constructor

Contract now requires protocolTreasury address in constructor.

---

## Updated PLAN.md

The main implementation plan at plan/PLAN.md was updated to reflect Protocol v2.0:
- New dispute-based architecture section
- Updated milestone descriptions
- Revised task breakdowns for m1-task-2 through m1-task-6
- Updated compliance checklist

---

## Deployment Script Update

The deployment script now reads PROTOCOL_TREASURY from environment.

---

## Test Coverage

Created comprehensive tests verifying:
- Enum values correctly ordered
- All protocol constants correctly set
- Constructor properly sets treasury
- Counters initialize to zero
- Structs can be instantiated with all fields
- 7 tests passing, 0 failures

---

## Files Changed

| File | Change |
|------|--------|
| plan/PLAN.md | Complete rewrite for Protocol v2.0 |
| contracts/src/PersonhoodLending.sol | Updated to dispute-based system |
| contracts/test/PersonhoodLending.t.sol | Updated tests for v2.0 structures |
| contracts/script/PersonhoodLending.s.sol | Added treasury parameter |
| plan/m1-task-1.md | This completion file |

---

## Known Issues

**None.** All tests pass and contract compiles successfully.

---

## Next Steps

Proceed to m1-task-2: Implement Core Functions which will implement:
- createOffer, acceptOffer, renewRental
- returnToMarket, removeExpiredOffer
- claimPayout, updateOfferTerms

---

## CI Status

✅ All checks passing:
- forge fmt --check - Code formatting
- forge build --sizes - Compilation with size report
- forge test -vv - All tests passing
