# Proof of Personhood Marketplace - Implementation Plan

**Version:** 1.1.0  
**Status:** Draft (Updated with clarifications)  
**Date:** 2026-01-30  
**Protocol Version:** 1.1.0 (Added deposit slashing mechanism)

---

## Executive Summary

This plan implements the **Proof of Personhood Marketplace Protocol** across three workspaces: **Contracts** (Solidity/Foundry), **Web** (React/Vite/Win95 theme), and **Mobile** (React Native). 

### Key Architecture Decisions

1. **Web Dashboard** (Win95 Theme): Full marketplace interface for browsing offers, managing rentals, and creating offers. Uses QR codes to communicate with mobile app for signatures.

2. **Mobile App** (Simplified): Acts as a secure signer/approver. Stores private keys, scans QR codes from web to provide signatures, and sends push notifications for usage approval.

3. **Deposit Slashing**: New mechanism where submitters lose part of their deposit if they fail to approve/reject usage requests within a timeout period.

### Current State vs Target

| Component | Current | Target (Protocol v1.1) |
|-----------|---------|------------------------|
| **Contract Model** | Simple lender-borrower agreement | Offer-based marketplace with slashing |
| **Contract States** | `isActive` boolean | `PENDING` → `ACTIVE` → `EXPIRED` → `REMOVED` |
| **Payment Model** | One-time collateral | Weekly rental + deposit + slashing |
| **Signature Storage** | None | 64-byte ECDSA signatures stored on-chain |
| **Web App** | Static Win95 window skeleton | Full Win95-themed marketplace |
| **Mobile App** | Basic text display | QR signer + notification approver |

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

## Milestone 1: Protocol-Compliant Smart Contract with Slashing

**Goal:** Replace the current simple agreement contract with the full offer-based marketplace protocol, including deposit slashing mechanism.

### Current Contract Issues
- Uses `LendingAgreement` struct (lender/borrower model)
- No signature storage (protocol requires 64-byte ECDSA signatures)
- No state machine (protocol requires PENDING/ACTIVE/EXPIRED/REMOVED)
- No weekly payment system (protocol requires rental model)
- No grace period or deposit claim mechanism
- **NEW:** No slashing mechanism for unresponsive submitters

### 1.1 Redesign Data Structures

**Task ID:** `m1-task-1`  
**Scope:** Define new structs, enums, and storage layout matching protocol spec with slashing

**Deliverables:**
- Offer struct with all protocol fields
- OfferStatus enum (PENDING, ACTIVE, EXPIRED, REMOVED)
- NEW: UsageRequest struct for tracking usage approvals
- Storage mappings for offers and request tracking
- Protocol parameters: minDeposit, GRACE_PERIOD, SLASHING_PERIOD, SLASHING_PERCENTAGE

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
6. `claimDeposit` - Return deposit to submitter (minus any slashed amounts)
7. `updateOfferTerms` - Modify weekly payment

**Completion File:** `plan/m1-task-2.md`

---

### 1.3 Implement Slashing Mechanism

**Task ID:** `m1-task-3`  
**Scope:** Add deposit slashing for unresponsive submitters

**Deliverables:**

1. `requestUsage` - Renter calls to request identity usage
   - Creates UsageRequest with deadline
   - Emits event for mobile notification
   
2. `approveUsage` - Submitter approves the request
   - Marks request as approved
   - Updates response tracking
   
3. `rejectUsage` - Submitter rejects the request
   - Marks request as rejected
   
4. `slashNonResponsive` - Anyone can call after deadline
   - Deducts percentage from deposit
   - Transfers slashed amount to caller (incentive)
   
5. `setAutoApprove` - Submitter enables auto-approval mode
   - Bypass manual approval for future requests

**Events:**
- `UsageRequested` - When renter requests usage
- `UsageApproved` - When submitter approves
- `UsageRejected` - When submitter rejects
- `DepositSlashed` - When slashing occurs

**Completion File:** `plan/m1-task-3.md`

---

### 1.4 Implement Core Events

**Task ID:** `m1-task-4`  
**Scope:** Define and emit all 8 protocol events with indexed parameters

**Events:**
- `OfferCreated` - New offer created
- `OfferAccepted` - Offer rented
- `RentalRenewed` - Rental extended
- `OfferExpired` - Rental period ended
- `OfferReturnedToMarket` - Expired offer returned to PENDING
- `OfferRemoved` - Offer permanently removed
- `DepositClaimed` - Submitter reclaimed deposit
- `OfferTermsUpdated` - Payment terms changed

All events use indexed parameters for efficient querying.

**Completion File:** `plan/m1-task-4.md`

---

### 1.5 Comprehensive Test Suite

**Task ID:** `m1-task-5`  
**Scope:** Full test coverage including slashing scenarios

**Test Categories:**
- State Transitions (PENDING→ACTIVE→EXPIRED→REMOVED)
- Access Control (submitter/renter permissions)
- Economic Security (deposits, payments, grace period)
- Slashing Mechanism (request, approve, reject, slash)
- Edge Cases (wrong states, boundary conditions, auto-approve)

**Completion File:** `plan/m1-task-5.md`

---

### 1.6 Deployment Script Update

**Task ID:** `m1-task-6`  
**Scope:** Update Foundry deployment script for new contract

**Deliverables:**
- Update `contracts/script/PersonhoodLending.s.sol`
- Set initial parameters: minDeposit, slashing period, percentage
- Include contract verification setup
- Document slashing parameters

**Completion File:** `plan/m1-task-6.md`


---

## Milestone 2: Web Dashboard - Win95 Theme Foundation

**Goal:** Build Win95-themed web interface with working Start menu and clock.

**Dependencies:** Milestone 1 (contract must be deployed or ABI available)

### Current State
Web app is a static Win95-themed window with non-working clock and Start button.

### 2.1 Win95 Desktop Shell

**Task ID:** `m2-task-1`  
**Scope:** Create authentic Win95 desktop environment

**Deliverables:**
- Teal (#008080) desktop background
- Working Start button with Windows logo (use SVG recreation)
- Working clock in taskbar (shows real time, updates every minute)
- Start menu dropdown with program icons
- Desktop icons for marketplace functions
- Window management (minimize, maximize, close buttons)
- Multiple resizable windows support

**Completion File:** `plan/m2-task-1.md`

---

### 2.2 Project Structure and Contract Integration

**Task ID:** `m2-task-2`  
**Scope:** Set up project structure and contract interaction layer

**Deliverables:**
- `web/src/components/win95/` - Win95 UI components
- `web/src/pages/` - Page components as Win95 windows
- `web/src/services/contract.ts` - Contract interaction
- Contract ABI TypeScript definitions
- Hook: `useOffers()` for querying PENDING offers
- Hook: `useOffer(offerId)` for single offer details
- Error handling for failed transactions

**Completion File:** `plan/m2-task-2.md`

---

### 2.3 Browse Offers (Win95 Explorer Window)

**Task ID:** `m2-task-3`  
**Scope:** Implement offer browsing as Win95 Explorer window

**Deliverables:**
- Win95 Explorer-style window with tree sidebar and content area
- List PENDING offers as file icons or list view
- Details pane showing: context, weekly payment, deposit required
- Sort by: name, price, date (Win95 column headers)
- Right-click context menu (Accept, View Details)
- Status bar at bottom showing item count
- Double-click to open offer details

**Completion File:** `plan/m2-task-3.md`

---

### 2.4 Offer Detail Window

**Task ID:** `m2-task-4`  
**Scope:** Individual offer details in Win95 dialog window

**Deliverables:**
- Win95 dialog window with icon and details
- Display: usageContext, addressToRent, weeklyPayment, deposit
- Status indicator with icon (PENDING/ACTIVE/EXPIRED)
- Accept Offer button (Win95 style)
- QR code display for mobile signature scanning
- Transaction confirmation dialog
- Link to blockchain explorer (opens in new window)

**Completion File:** `plan/m2-task-4.md`

---

### 2.5 Wallet Integration

**Task ID:** `m2-task-5`  
**Scope:** Wallet connection in Win95 style

**Deliverables:**
- Win95-style wallet connection dialog
- MetaMask and WalletConnect options
- Display connected address in taskbar or status area
- Network switching for Polkadot Asset Hub
- Transaction confirmation as Win95 modal dialog
- Error messages as Win95 alert boxes

**Completion File:** `plan/m2-task-5.md`


---

## Milestone 3: Web Dashboard - Rental Management & My Account

**Goal:** Add rental management windows and submitter dashboard in Win95 style.

**Dependencies:** Milestone 2 (contract integration layer)

### 3.1 My Rentals Window

**Task ID:** `m3-task-1`  
**Scope:** Dashboard for renters to manage active rentals

**Deliverables:**
- Win95 window listing user's rentals
- Columns: Offer ID, Context, Status, Expires In
- Status icons (green for ACTIVE, yellow for EXPIRED)
- Renew Rental button (opens payment dialog)
- Request Usage button (for ACTIVE rentals)
- Shows QR code for mobile identity retrieval
- Grace period warning (red alert icon)

**Completion File:** `plan/m3-task-1.md`

---

### 3.2 My Offers Window (Submitter View)

**Task ID:** `m3-task-2`  
**Scope:** Dashboard for submitters to manage created offers

**Deliverables:**
- Win95 window listing all offers created by user
- Tabs or views: PENDING, ACTIVE, EXPIRED, REMOVED
- For each offer: context, price, status, rental count
- Update Terms dialog (change weekly payment)
- Claim Deposit button (for PENDING or REMOVED)
- Set Auto-Approve checkbox and settings
- Revenue display (total earnings from rentals)

**Completion File:** `plan/m3-task-3.md`

---

### 3.3 Create Offer Wizard

**Task ID:** `m3-task-3`  
**Scope:** Multi-step wizard for creating new offers with QR signature

**Deliverables:**
- Win95 wizard dialog (Next/Back/Finish buttons)
- Step 1: Enter usage context and weekly payment
- Step 2: Show QR code for mobile to scan and sign
- Step 3: Mobile scans QR, signs, returns signature via QR
- Step 4: Web reads signature QR and submits to contract
- Deposit payment dialog
- Success confirmation with offer ID

**Completion File:** `plan/m3-task-3.md`

---

### 3.4 Start Menu Programs

**Task ID:** `m3-task-4`  
**Scope:** Populate Start menu with working programs

**Deliverables:**
- Start menu opens with Windows logo button
- Programs list:
  - Marketplace Explorer (browse offers)
  - My Rentals
  - My Offers
  - Create Offer Wizard
  - Wallet Settings
- Each menu item opens corresponding window
- Recent documents (recently viewed offers)
- Run... dialog for direct offer ID access
- Shut Down option (disconnect wallet)

**Completion File:** `plan/m3-task-4.md`


---

## Milestone 4: Mobile App - Core Infrastructure

**Goal:** Build simplified mobile app for QR-based signature and approval.

**Dependencies:** Milestone 1 (contract ABIs and types)

### Current State
Mobile app displays only static text. Needs complete rebuild.

### 4.1 Project Structure and Key Storage

**Task ID:** `m4-task-1`  
**Scope:** Set up mobile app with secure key storage

**Deliverables:**
- `mobile/src/screens/` - Screen components
- `mobile/src/services/` - API and crypto services
- Secure key storage using React Native Keychain/Keystore
- Import/generate private key flow
- Key backup and recovery phrase
- Biometric authentication (Face ID / fingerprint) to unlock
- No browsing offers - this is a pure signer app

**Completion File:** `plan/m4-task-1.md`

---

### 4.2 QR Code Scanner

**Task ID:** `m4-task-2`  
**Scope:** Implement QR scanning for signature requests

**Deliverables:**
- QR scanner screen using react-native-camera or expo-camera
- Parse QR data format: `{action: "sign", offerData: {...}}`
- Show confirmation screen with offer details
- Sign button to generate ECDSA signature
- Display signature as QR code for web to scan back
- History of signed offers (for reference)

**Completion File:** `plan/m4-task-2.md`

---

### 4.3 Push Notifications Setup

**Task ID:** `m4-task-3`  
**Scope:** Configure push notifications for usage approval

**Deliverables:**
- Firebase Cloud Messaging (FCM) or OneSignal integration
- Register device token with backend/contract events
- Notification format: "Renter X requesting identity usage for Context Y"
- Deep linking from notification to approval screen
- Handle notification when app is backgrounded/killed

**Completion File:** `plan/m4-task-3.md`


---

## Milestone 5: Mobile App - Approval Flow and Settings

**Goal:** Complete the approval workflow and settings management.

**Dependencies:** Milestone 4 (mobile infrastructure)

### 5.1 Usage Approval Screen

**Task ID:** `m5-task-1`  
**Scope:** Screen for approving/rejecting usage requests

**Deliverables:**
- Full-screen approval request with details:
  - Renter address (truncated)
  - Usage context
  - Timestamp
  - Countdown timer (time remaining before auto-slash)
- Approve button (green, prominent)
- Reject button (red)
- Auto-approve toggle for this renter/context
- Submit approval to blockchain (via walletConnect or relay)
- Confirmation screen

**Completion File:** `plan/m5-task-1.md`

---

### 5.2 Auto-Approve Settings

**Task ID:** `m5-task-2`  
**Scope:** Configure automatic approval rules

**Deliverables:**
- Settings screen with auto-approve toggle
- Context whitelist (e.g., auto-approve for "Polkadot Forum")
- Renter whitelist (specific trusted addresses)
- Maximum auto-approve per day limit
- Risk warnings about slashing
- Biometric re-authentication to change settings

**Completion File:** `plan/m5-task-2.md`

---

### 5.3 Deposit and Slashing Info

**Task ID:** `m5-task-3`  
**Scope:** Display deposit status and slashing warnings

**Deliverables:**
- Current deposit amount display
- List of active offers with deposits
- Warning notifications about pending slashes
- History of past slashes
- Guide on how to avoid slashing
- Quick claim deposit button for inactive offers

**Completion File:** `plan/m5-task-3.md`

---

### 5.4 Signature QR Display

**Task ID:** `m5-task-4`  
**Scope:** Display generated signatures as QR for web scanning

**Deliverables:**
- Full-screen QR code display after signing
- Data format: `{signature: "0x...", address: "0x...", timestamp: ...}`
- Large QR for easy scanning by web camera
- Instructions text: "Scan with web app to complete offer"
- Copy to clipboard option (alternative to QR)
- Save signature history locally

**Completion File:** `plan/m5-task-4.md`


---

## Milestone 6: Integration, Testing, and Deployment

**Goal:** End-to-end testing, documentation, and preparation for mainnet deployment.

**Dependencies:** Milestones 1-5 (all core functionality)

### 6.1 End-to-End Integration Testing

**Task ID:** `m6-task-1`  
**Scope:** Test complete user flows across web and mobile

**Test Flows:**
1. Web: Create offer wizard → Mobile: Scan QR, sign → Web: Scan signature QR, submit
2. Web: Browse offers → Accept offer → Pay → Mobile: Receive notification → Approve usage
3. Web: Request usage → Mobile: Ignore → Anyone: Call slash function → Deposit slashed
4. Mobile: Enable auto-approve → Web: Request usage → Auto-approved without notification
5. Grace period test: EXPIRED offer → Return to market → Re-rental

**Deliverables:**
- Integration test scripts
- Testnet deployment for testing
- Documented issues and resolutions

**Completion File:** `plan/m6-task-1.md`

---

### 6.2 Protocol Documentation

**Task ID:** `m6-task-2`  
**Scope:** Create comprehensive documentation

**Deliverables:**
- User guide for Win95 web dashboard
- Mobile app user guide (QR signing and approvals)
- Submitter guide (avoiding slashing, auto-approve setup)
- Developer docs: contract ABI, event specs, slashing mechanism
- QR code format specification
- Integration guide for third parties

**Completion File:** `plan/m6-task-2.md`

---

### 6.3 Security Audit Preparation

**Task ID:** `m6-task-3`  
**Scope:** Prepare contracts for security audit

**Deliverables:**
- Slashing mechanism documentation
- Access control review
- Reentrancy protection verification
- Key storage security (mobile)
- QR code spoofing prevention analysis
- Test coverage report (target: 100%)

**Completion File:** `plan/m6-task-3.md`

---

### 6.4 Production Deployment

**Task ID:** `m6-task-4`  
**Scope:** Deploy to production

**Deliverables:**
- Mainnet deployment scripts
- Parameter configuration: minDeposit, slashingPeriod, slashingPercentage
- Contract verification
- Web app hosting (GitHub Pages already configured)
- Mobile app store submissions (iOS TestFlight, Google Play Internal)
- Monitoring and alerting setup

**Completion File:** `plan/m6-task-4.md`


---

## Appendix A: Complete Task Index

| Task ID | Milestone | Title | Workspace | Status |
|---------|-----------|-------|-----------|--------|
| m1-task-1 | 1 | Redesign Data Structures | contracts | pending |
| m1-task-2 | 1 | Implement Core Functions | contracts | pending |
| m1-task-3 | 1 | Implement Slashing Mechanism | contracts | pending |
| m1-task-4 | 1 | Implement Core Events | contracts | pending |
| m1-task-5 | 1 | Comprehensive Test Suite | contracts | pending |
| m1-task-6 | 1 | Deployment Script Update | contracts | pending |
| m2-task-1 | 2 | Win95 Desktop Shell | web | pending |
| m2-task-2 | 2 | Project Structure and Contract Integration | web | pending |
| m2-task-3 | 2 | Browse Offers (Win95 Explorer) | web | pending |
| m2-task-4 | 2 | Offer Detail Window | web | pending |
| m2-task-5 | 2 | Wallet Integration | web | pending |
| m3-task-1 | 3 | My Rentals Window | web | pending |
| m3-task-2 | 3 | My Offers Window | web | pending |
| m3-task-3 | 3 | Create Offer Wizard | web | pending |
| m3-task-4 | 3 | Start Menu Programs | web | pending |
| m4-task-1 | 4 | Project Structure and Key Storage | mobile | pending |
| m4-task-2 | 4 | QR Code Scanner | mobile | pending |
| m4-task-3 | 4 | Push Notifications Setup | mobile | pending |
| m5-task-1 | 5 | Usage Approval Screen | mobile | pending |
| m5-task-2 | 5 | Auto-Approve Settings | mobile | pending |
| m5-task-3 | 5 | Deposit and Slashing Info | mobile | pending |
| m5-task-4 | 5 | Signature QR Display | mobile | pending |
| m6-task-1 | 6 | End-to-End Integration Testing | all | pending |
| m6-task-2 | 6 | Protocol Documentation | all | pending |
| m6-task-3 | 6 | Security Audit Preparation | all | pending |
| m6-task-4 | 6 | Production Deployment | all | pending |

**Total Tasks:** 26  
**Estimated Duration:** 14-18 weeks (assuming 1-2 tasks per week with PR review cycles)


---

## Appendix B: Protocol Compliance Checklist

### Core Functions (Original Protocol Section 4)
- [ ] createOffer - m1-task-2
- [ ] acceptOffer - m1-task-2
- [ ] renewRental - m1-task-2
- [ ] returnToMarket - m1-task-2
- [ ] removeExpiredOffer - m1-task-2
- [ ] claimDeposit - m1-task-2
- [ ] updateOfferTerms - m1-task-2

### Slashing Functions (NEW in v1.1)
- [ ] requestUsage - m1-task-3
- [ ] approveUsage - m1-task-3
- [ ] rejectUsage - m1-task-3
- [ ] slashNonResponsive - m1-task-3
- [ ] setAutoApprove - m1-task-3

### Data Structures
- [ ] Offer struct with all fields - m1-task-1
- [ ] OfferStatus enum - m1-task-1
- [ ] UsageRequest struct - m1-task-1
- [ ] Storage layout with mappings - m1-task-1

### Events
- [ ] OfferCreated - m1-task-4
- [ ] OfferAccepted - m1-task-4
- [ ] RentalRenewed - m1-task-4
- [ ] OfferExpired - m1-task-4
- [ ] OfferReturnedToMarket - m1-task-4
- [ ] OfferRemoved - m1-task-4
- [ ] DepositClaimed - m1-task-4
- [ ] OfferTermsUpdated - m1-task-4
- [ ] UsageRequested - m1-task-3
- [ ] UsageApproved - m1-task-3
- [ ] UsageRejected - m1-task-3
- [ ] DepositSlashed - m1-task-3

### Web Integration (Win95 Theme)
- [ ] Win95 desktop shell with Start menu - m2-task-1
- [ ] Working clock in taskbar - m2-task-1
- [ ] Browse offers as Explorer window - m2-task-3
- [ ] QR code for mobile signature - m2-task-4
- [ ] My Rentals management - m3-task-1
- [ ] Create offer with QR workflow - m3-task-3

### Mobile Integration (Simplified)
- [ ] Secure key storage - m4-task-1
- [ ] QR scanner for signing - m4-task-2
- [ ] Push notifications for requests - m4-task-3
- [ ] Approval/rejection screen - m5-task-1
- [ ] Auto-approve settings - m5-task-2
- [ ] Signature display as QR - m5-task-4

---

## Key Clarifications Applied

### 1. Win95 Theme Requirements
- Desktop background: #008080 teal
- Start button with Windows logo (SVG recreation)
- Working clock showing real time (updates every minute)
- Start menu dropdown with program icons
- Multiple resizable windows support
- Authentic Win95 dialogs and controls

### 2. Mobile App Simplification
**Removed from scope:**
- Browse offers screen
- Wallet integration
- Complex navigation
- Signature verification service (now just signing)

**New simplified scope:**
- Store private key securely (Keychain/Keystore)
- Scan QR from web to get offer data
- Sign offer data with stored private key
- Display signature as QR for web to scan
- Receive push notifications for usage requests
- Approve/reject with countdown timer
- Auto-approve settings

### 3. Deposit Slashing Mechanism (NEW)
**Problem:** Submitters might not respond to usage requests

**Solution:**
- Renter calls `requestUsage` which creates deadline
- Submitter has SLASHING_PERIOD (e.g., 1 hour) to respond
- If no response, anyone can call `slashNonResponsive`
- 10% of deposit is slashed and sent to caller as incentive
- Submitter can enable `autoApprove` to avoid slashing

**Flow:**
1. Renter requests usage via contract
2. Contract emits event, push notification sent to mobile
3. Mobile shows approval screen with countdown
4. Submitter approves/rejects OR ignores
5. If ignored past deadline, slashing occurs
6. Slashed amount incentivizes watchers to call slash function

