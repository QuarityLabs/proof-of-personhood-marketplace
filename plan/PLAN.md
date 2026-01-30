# Proof of Personhood Marketplace - Implementation Plan

**Version:** 1.0.0  
**Status:** Draft  
**Date:** 2026-01-30  
**Protocol Version:** 1.0.0 (from PROTOCOL.md)

---

## Executive Summary

This plan implements the **Proof of Personhood Marketplace Protocol** across three workspaces: **Contracts** (Solidity/Foundry), **Web** (React/Vite/Win95 theme), and **Mobile** (React Native). The current codebase has a minimal, non-compliant implementation that must be completely rebuilt to match the protocol specification.

### Current State vs Target

| Component | Current | Target (Protocol v1.0) |
|-----------|---------|------------------------|
| **Contract Model** | Simple lender-borrower agreement | Offer-based marketplace with states |
| **Contract States** | `isActive` boolean | `PENDING` → `ACTIVE` → `EXPIRED` → `REMOVED` |
| **Payment Model** | One-time collateral | Weekly rental payments + deposit |
| **Signature Storage** | None | 64-byte ECDSA signatures stored on-chain |
| **Web App** | Static Win95 window skeleton | Full marketplace dashboard |
| **Mobile App** | Basic text display | Signature verification + wallet management |

---

## Task Completion Rules

**Each task in this plan MUST follow these rules:**

1. **Task Completion File**: After completing a task, create `plan/<task-id>.md` describing:
   - What was implemented
   - Key decisions made
   - Learnings and challenges
   - Any known issues (must be accepted by user before marking done)

2. **Pull Request Requirement**: Each task = exactly ONE pull request
   - PR must pass all CI checks (contracts, web, mobile)
   - PR must be reviewed and merged to `main`
   - Only then proceed to next task

3. **Known Issues Protocol**:
   - Document all known issues in the task completion file
   - User MUST explicitly accept issues before task marked done
   - Never mark task complete with unresolved known issues

4. **CI Monitoring**:
   - Monitor GitHub Actions after each PR
   - All three workspace jobs must be green
   - Fix failures before proceeding

---

## Milestone 1: Protocol-Compliant Smart Contract

**Goal:** Replace the current simple agreement contract with the full offer-based marketplace protocol.

### Current Contract Issues
- Uses `LendingAgreement` struct (lender/borrower model)
- No signature storage (protocol requires 64-byte ECDSA signatures)
- No state machine (protocol requires PENDING/ACTIVE/EXPIRED/REMOVED)
- No weekly payment system (protocol requires rental model)
- No grace period or deposit claim mechanism

### 1.1 Redesign Data Structures

**Task ID:** `m1-task-1`  
**Scope:** Define new structs, enums, and storage layout matching protocol spec

**Deliverables:**
```solidity
struct Offer {
    bytes32 usageContext;      // 32 bytes
    bytes32 addressToRent;     // 32 bytes  
    bytes signature;           // 64 bytes
    uint256 weeklyPayment;     // Current weekly rate
    uint256 deposit;           // Locked collateral
    address submitter;         // Original offer creator
    address renter;            // Current user (0x0 if PENDING)
    uint256 expiresAt;         // Expiration timestamp
    OfferStatus status;        // PENDING | ACTIVE | EXPIRED | REMOVED
}

enum OfferStatus { PENDING, ACTIVE, EXPIRED, REMOVED }
```

**Storage Layout:**
- `uint256 public nextOfferId`
- `mapping(uint256 => Offer) public offers`
- `mapping(address => uint256[]) public submitterOffers`
- `mapping(address => uint256[]) public renterOffers`
- `uint256 public minDeposit`
- `uint256 public constant GRACE_PERIOD = 7 days`

**Completion File:** `plan/m1-task-1.md`

---

### 1.2 Implement Core Functions

**Task ID:** `m1-task-2`  
**Scope:** Implement all 7 core protocol functions with full validation

**Functions:**
1. `createOffer` - Create new offer in PENDING state
2. `acceptOffer` - Transition PENDING → ACTIVE
3. `renewRental` - Extend ACTIVE offer by 1 week
4. `returnToMarket` - Transition EXPIRED → PENDING
5. `removeExpiredOffer` - Transition EXPIRED → REMOVED
6. `claimDeposit` - Return deposit to submitter
7. `updateOfferTerms` - Modify weekly payment

**Completion File:** `plan/m1-task-2.md`

---

### 1.3 Implement Events

**Task ID:** `m1-task-3`  
**Scope:** Define and emit all 8 protocol events with indexed parameters

**Events:** OfferCreated, OfferAccepted, RentalRenewed, OfferExpired, OfferReturnedToMarket, OfferRemoved, DepositClaimed, OfferTermsUpdated

**Completion File:** `plan/m1-task-3.md`

---

### 1.4 Comprehensive Test Suite

**Task ID:** `m1-task-4`  
**Scope:** Full test coverage per protocol section 11

**Test Categories:**
- State Transitions (PENDING→ACTIVE→EXPIRED→REMOVED)
- Access Control (submitter/renter permissions)
- Economic Security (deposits, payments, grace period)
- Edge Cases (wrong states, boundary conditions)

**Completion File:** `plan/m1-task-4.md`

---

### 1.5 Deployment Script Update

**Task ID:** `m1-task-5`  
**Scope:** Update Foundry deployment script for new contract

**Deliverables:**
- Update `contracts/script/PersonhoodLending.s.sol`
- Set initial `minDeposit` parameter
- Include contract verification setup

**Completion File:** `plan/m1-task-5.md`

---

## Milestone 2: Web Dashboard - Offer Browsing

**Goal:** Build web interface for browsing and discovering identity offers.

**Dependencies:** Milestone 1 (contract must be deployed or ABI available)

### Current State
Web app is a static Win95-themed window with no real functionality.

### 2.1 Project Structure Setup

**Task ID:** `m2-task-1`  
**Scope:** Create folder structure and base components

**Deliverables:**
- `web/src/components/` - Reusable UI components
- `web/src/pages/` - Page-level components  
- `web/src/hooks/` - Custom React hooks
- `web/src/services/` - Contract interaction layer
- `web/src/types/` - TypeScript type definitions
- `web/src/utils/` - Helper functions

**Completion File:** `plan/m2-task-1.md`

---

### 2.2 Contract Integration Layer

**Task ID:** `m2-task-2`  
**Scope:** Create TypeScript interface to interact with smart contract

**Deliverables:**
- Contract ABI TypeScript definitions
- Contract service with ethers/viem integration
- Hook: `useOffers()` for querying PENDING offers
- Hook: `useOffer(offerId)` for single offer details
- Error handling for failed transactions
- Type definitions for Offer, OfferStatus

**Completion File:** `plan/m2-task-2.md`

---

### 2.3 Browse Offers Page

**Task ID:** `m2-task-3`  
**Scope:** Implement main marketplace browsing interface

**Deliverables:**
- Grid/list view of PENDING offers
- Filters: price range, context category
- Sorting: price (low/high), newest first
- Pagination for large result sets
- Empty state when no offers available
- Win95 styling consistent with theme
- Loading states and error handling

**Completion File:** `plan/m2-task-3.md`

---

### 2.4 Offer Detail View

**Task ID:** `m2-task-4`  
**Scope:** Individual offer detail page

**Deliverables:**
- Display: context, address to rent, weekly payment, deposit required
- Status indicator (PENDING/ACTIVE/EXPIRED/REMOVED)
- Accept Offer button (for PENDING offers)
- Show expiration time if ACTIVE
- Link to blockchain explorer
- Wallet connection requirement

**Completion File:** `plan/m2-task-4.md`

---

### 2.5 Wallet Integration

**Task ID:** `m2-task-5`  
**Scope:** Connect wallet functionality for transactions

**Deliverables:**
- Wallet connection button (MetaMask, WalletConnect)
- Display connected address
- Network switching to Polkadot Asset Hub
- Transaction confirmation modals
- Error handling for rejected transactions

**Completion File:** `plan/m2-task-5.md`


---

## Milestone 3: Web Dashboard - Rental Management

**Goal:** Add functionality for renters to manage their active rentals and submitters to manage their offers.

**Dependencies:** Milestone 2 (contract integration layer)

### 3.1 My Rentals Page

**Task ID:** `m3-task-1`  
**Scope:** Dashboard for renters to manage active rentals

**Deliverables:**
- List of offers where user is the renter
- Status indicators (ACTIVE, EXPIRED)
- Renew Rental button with payment
- Expiration countdown timer
- Grace period warning notifications
- Link to return to marketplace

**Completion File:** `plan/m3-task-1.md`

---

### 3.2 My Offers Page (Submitter View)

**Task ID:** `m3-task-2`  
**Scope:** Dashboard for submitters to manage created offers

**Deliverables:**
- List of all offers created by user
- Status breakdown (PENDING/ACTIVE/EXPIRED/REMOVED)
- Update Terms functionality (change weekly payment)
- Claim Deposit button for PENDING or REMOVED offers
- Withdraw Offer (set price to MAX effectively)
- Revenue statistics (if any payments received)

**Completion File:** `plan/m3-task-2.md`

---

### 3.3 Navigation and Layout

**Task ID:** `m3-task-3`  
**Scope:** Complete the Win95-themed navigation

**Deliverables:**
- Sidebar navigation menu
- Win95-style taskbar
- Page routing (React Router)
- Active state indicators
- Responsive mobile layout
- Start Menu style navigation

**Completion File:** `plan/m3-task-3.md`


---

## Milestone 4: Mobile App - Core Infrastructure

**Goal:** Build React Native app foundation with navigation, wallet support, and UI framework.

**Dependencies:** Milestone 1 (contract ABIs and types)

### Current State
Mobile app displays only static text "Proof of Personhood Mobile App Skeleton".

### 4.1 Project Structure and Navigation

**Task ID:** `m4-task-1`  
**Scope:** Set up React Native navigation and folder structure

**Deliverables:**
- `mobile/src/navigation/` - React Navigation setup
- `mobile/src/screens/` - Screen components
- `mobile/src/components/` - Reusable UI components
- `mobile/src/services/` - API and contract services
- `mobile/src/hooks/` - Custom hooks
- `mobile/src/types/` - TypeScript definitions
- Bottom tab navigator with 3 tabs: Browse, My Rentals, Settings

**Completion File:** `plan/m4-task-1.md`

---

### 4.2 Wallet Integration

**Task ID:** `m4-task-2`  
**Scope:** Integrate wallet connection for mobile

**Deliverables:**
- WalletConnect v2 integration
- Deep linking for wallet apps
- Display connected address and balance
- Network configuration for Polkadot Asset Hub
- Secure key management (read-only, no key storage)

**Completion File:** `plan/m4-task-2.md`

---

### 4.3 Browse Offers Screen

**Task ID:** `m4-task-3`  
**Scope:** Mobile interface for browsing available offers

**Deliverables:**
- List view of PENDING offers
- Pull-to-refresh
- Infinite scroll pagination
- Offer card with key details
- Filter by context category
- Search functionality

**Completion File:** `plan/m4-task-3.md`


---

## Milestone 5: Mobile App - Signature Verification

**Goal:** Implement the critical security feature: off-chain signature verification before identity lending. This is the core value proposition of the protocol.

**Dependencies:** Milestone 4 (mobile infrastructure)

### 5.1 Signature Verification Service

**Task ID:** `m5-task-1`  
**Scope:** Build ECDSA signature verification logic

**Deliverables:**
- Service: `verifySignature(offer, signature, addressToRent)`
- Implement protocol signature format: context || address || payment || off_chain_info
- Use ethers.js or similar for recovery
- Return verification result with detailed error messages
- Unit tests for verification logic

**Completion File:** `plan/m5-task-1.md`

---

### 5.2 Active Rental Verification Screen

**Task ID:** `m5-task-2`  
**Scope:** Screen for verifying and using a rented identity

**Deliverables:**
- Display current rental details
- Show verification status of stored signature
- Verify Signature button (re-verify on demand)
- QR code display of verified identity (for counterparty scanning)
- Expiration countdown
- Grace period warnings

**Completion File:** `plan/m5-task-2.md`

---

### 5.3 Secure Identity Display

**Task ID:** `m5-task-3`  
**Scope:** Display verified identity securely to counterparties

**Deliverables:**
- Full-screen identity display mode
- Show: addressToRent, usageContext, verification timestamp
- Watermark to prevent screenshots (if possible)
- Auto-refresh verification before display
- Session timeout for security

**Completion File:** `plan/m5-task-3.md`

---

### 5.4 My Rentals Management

**Task ID:** `m5-task-4`  
**Scope:** Manage active rentals on mobile

**Deliverables:**
- List of users rentals
- Quick renew action
- Notifications for expiring rentals
- Direct link to verification screen

**Completion File:** `plan/m5-task-4.md`


---

## Milestone 6: Integration, Testing, and Deployment

**Goal:** End-to-end testing, documentation, and preparation for mainnet deployment.

**Dependencies:** Milestones 1-5 (all core functionality)

### 6.1 End-to-End Integration Testing

**Task ID:** `m6-task-1`  
**Scope:** Test complete user flows across web and mobile

**Deliverables:**
- Test: Submitter creates offer → Web user browses and accepts → Mobile verifies signature
- Test: Grace period flow and return to market
- Test: Deposit claim after removal
- Test: Multiple concurrent rentals
- Document any integration issues

**Completion File:** `plan/m6-task-1.md`

---

### 6.2 Protocol Documentation

**Task ID:** `m6-task-2`  
**Scope:** Create comprehensive documentation for users and developers

**Deliverables:**
- User guide for web dashboard
- User guide for mobile app
- Developer documentation (contract ABI, event specs)
- Integration guide for third parties
- Update README files in each workspace

**Completion File:** `plan/m6-task-2.md`

---

### 6.3 Security Audit Preparation

**Task ID:** `m6-task-3`  
**Scope:** Prepare contracts for external security audit

**Deliverables:**
- Document all access control mechanisms
- Create threat model document
- List all external calls and reentrancy protections
- Verify no TODO comments or debug code
- Ensure 100% test coverage on contracts

**Completion File:** `plan/m6-task-3.md`

---

### 6.4 Deployment Configuration

**Task ID:** `m6-task-4`  
**Scope:** Prepare deployment scripts and configuration

**Deliverables:**
- Mainnet deployment scripts
- Environment variable templates
- Contract verification setup (Etherscan equivalent for Polkadot)
- Initial minDeposit parameter recommendation
- Emergency pause mechanism (optional)

**Completion File:** `plan/m6-task-4.md`

---

## Appendix A: Complete Task Index

| Task ID | Milestone | Title | Workspace | Status |
|---------|-----------|-------|-----------|--------|
| m1-task-1 | 1 | Redesign Data Structures | contracts | pending |
| m1-task-2 | 1 | Implement Core Functions | contracts | pending |
| m1-task-3 | 1 | Implement Events | contracts | pending |
| m1-task-4 | 1 | Comprehensive Test Suite | contracts | pending |
| m1-task-5 | 1 | Deployment Script Update | contracts | pending |
| m2-task-1 | 2 | Project Structure Setup | web | pending |
| m2-task-2 | 2 | Contract Integration Layer | web | pending |
| m2-task-3 | 2 | Browse Offers Page | web | pending |
| m2-task-4 | 2 | Offer Detail View | web | pending |
| m2-task-5 | 2 | Wallet Integration | web | pending |
| m3-task-1 | 3 | My Rentals Page | web | pending |
| m3-task-2 | 3 | My Offers Page | web | pending |
| m3-task-3 | 3 | Navigation and Layout | web | pending |
| m4-task-1 | 4 | Project Structure and Navigation | mobile | pending |
| m4-task-2 | 4 | Wallet Integration | mobile | pending |
| m4-task-3 | 4 | Browse Offers Screen | mobile | pending |
| m5-task-1 | 5 | Signature Verification Service | mobile | pending |
| m5-task-2 | 5 | Active Rental Verification Screen | mobile | pending |
| m5-task-3 | 5 | Secure Identity Display | mobile | pending |
| m5-task-4 | 5 | My Rentals Management | mobile | pending |
| m6-task-1 | 6 | End-to-End Integration Testing | all | pending |
| m6-task-2 | 6 | Protocol Documentation | all | pending |
| m6-task-3 | 6 | Security Audit Preparation | contracts | pending |
| m6-task-4 | 6 | Deployment Configuration | contracts | pending |

**Total Tasks:** 24  
**Estimated Duration:** 12-16 weeks (assuming 1-2 tasks per week with PR review cycles)

---

## Appendix B: Protocol Compliance Checklist

This checklist maps each protocol requirement to the implementing task:

### Core Functions (Protocol Section 4)
- [ ] createOffer - m1-task-2
- [ ] acceptOffer - m1-task-2
- [ ] renewRental - m1-task-2
- [ ] returnToMarket - m1-task-2
- [ ] removeExpiredOffer - m1-task-2
- [ ] claimDeposit - m1-task-2
- [ ] updateOfferTerms - m1-task-2

### Data Structures (Protocol Section 5)
- [ ] Offer struct with all fields - m1-task-1
- [ ] OfferStatus enum - m1-task-1
- [ ] Storage layout with mappings - m1-task-1

### Events (Protocol Section 6)
- [ ] OfferCreated - m1-task-3
- [ ] OfferAccepted - m1-task-3
- [ ] RentalRenewed - m1-task-3
- [ ] OfferExpired - m1-task-3
- [ ] OfferReturnedToMarket - m1-task-3
- [ ] OfferRemoved - m1-task-3
- [ ] DepositClaimed - m1-task-3
- [ ] OfferTermsUpdated - m1-task-3

### State Transitions (Protocol Section 7)
- [ ] PENDING → ACTIVE - m1-task-4 (tests)
- [ ] ACTIVE → EXPIRED - m1-task-4 (tests)
- [ ] EXPIRED → PENDING - m1-task-4 (tests)
- [ ] EXPIRED → REMOVED - m1-task-4 (tests)

### Web Integration (Protocol Section 9.2)
- [ ] Browse offers (PENDING) - m2-task-3
- [ ] Accept flow - m2-task-4
- [ ] Manage rentals - m3-task-1

### Mobile Integration (Protocol Section 9.1)
- [ ] Query active offers - m4-task-3
- [ ] Verify signatures - m5-task-1
- [ ] Check authorization - m5-task-2

