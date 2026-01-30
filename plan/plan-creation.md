# Task Completion: Implementation Plan Creation

**Task ID:** plan-creation  
**Status:** Completed  
**Date:** 2026-01-30

---

## What Was Implemented

Created comprehensive implementation plan at `plan/PLAN.md` (734 lines) covering 6 milestones and 26 tasks across all three workspaces:

### Milestones Overview
- **Milestone 1:** Protocol-Compliant Smart Contract with Slashing (6 tasks)
- **Milestone 2:** Web Dashboard - Win95 Theme Foundation (5 tasks)
- **Milestone 3:** Web Dashboard - Rental Management & My Account (4 tasks)
- **Milestone 4:** Mobile App - Core Infrastructure (3 tasks)
- **Milestone 5:** Mobile App - Approval Flow and Settings (4 tasks)
- **Milestone 6:** Integration, Testing, and Deployment (4 tasks)

---

## Key Clarifications Applied

### 1. Win95 Theme Requirements (Web)
Based on user clarification, the web app must maintain authentic Win95 styling:

**Requirements Added:**
- Teal (#008080) desktop background
- Working Start button with Windows logo (SVG recreation, not external image)
- Working clock in taskbar showing real time (updates every minute)
- Start menu dropdown with program icons
- Multiple resizable windows support
- Win95 Explorer-style interface for browsing offers
- Win95 wizard dialogs for creating offers
- Authentic Win95 controls (buttons, dialogs, status bars)

**Implementation Impact:**
- Tasks m2-task-1 through m3-task-4 redesigned around Win95 UI patterns
- QR codes integrated into Win95 dialogs for mobile communication
- File explorer metaphor used for offer browsing

### 2. Mobile App Simplification
The mobile app scope was significantly reduced from a full marketplace app to a focused signer/approver:

**Removed from Original Plan:**
- Browse offers screen (mobile doesn't browse)
- Wallet integration on mobile (not needed)
- Complex navigation with multiple tabs
- Signature verification service (now just signing with stored key)

**New Simplified Scope:**
- Securely store private key (Keychain/Keystore)
- Scan QR code from web to receive offer data
- Sign offer data with stored private key
- Display signature as QR code for web to scan back
- Receive push notifications for usage requests
- Show approval screen with countdown timer (slashing deadline)
- Approve or reject usage requests
- Auto-approve settings to avoid slashing

**QR Code Workflow:**
1. Web: Create offer, display QR with offer data
2. Mobile: Scan QR, display confirmation, user taps Sign
3. Mobile: Generate ECDSA signature, display as QR
4. Web: Scan signature QR, submit to blockchain

### 3. Deposit Slashing Mechanism (NEW)
**Critical Addition:** Submitters lose deposit if unresponsive to usage requests.

**Rationale:**
If submitters don't approve/reject usage requests, renters can't actually use the borrowed identity. The slashing mechanism incentivizes prompt responses.

**Mechanism:**
- Renter calls `requestUsage` which creates a deadline
- Submitter has SLASHING_PERIOD (configurable, e.g., 1 hour) to respond
- Push notification sent to mobile app
- Mobile shows approval screen with countdown timer
- If submitter ignores past deadline, anyone can call `slashNonResponsive`
- 10% of deposit is slashed and sent to caller (incentive for watchers)
- Submitter can enable `autoApprove` mode to avoid slashing risk

**Contract Changes:**
- Added UsageRequest struct to track pending requests
- Added slashing parameters: SLASHING_PERIOD, SLASHING_PERCENTAGE
- New functions: requestUsage, approveUsage, rejectUsage, slashNonResponsive, setAutoApprove
- New events: UsageRequested, UsageApproved, UsageRejected, DepositSlashed
- Modified claimDeposit to account for slashed amounts

**Mobile Changes:**
- Approval screen with countdown timer (m5-task-1)
- Auto-approve settings screen (m5-task-2)
- Deposit and slashing info display (m5-task-3)
- Push notification handling (m4-task-3)

---

## Architecture Decisions

### Web-Mobile Communication
Since mobile is simplified and doesn't browse offers, all communication happens via QR codes:

1. **Web → Mobile:** Web displays QR with offer creation data
2. **Mobile → Web:** Mobile displays QR with generated signature
3. **Contract → Mobile:** Push notifications via FCM/OneSignal

This eliminates need for:
- Mobile wallet integration
- Mobile contract interaction
- Complex mobile UI
- Direct web-to-mobile network communication

### Security Model
1. **Private keys stored only on mobile** (secure Keychain/Keystore)
2. **Biometric auth required** to unlock keys
3. **Web never sees private keys** - only signatures via QR
4. **Slashing ensures liveness** - submitters must respond or lose deposit
5. **Auto-approve option** for trusted contexts/renters

---

## Known Issues / Open Questions

1. **QR Code Format:** Need to define exact JSON schema for QR data exchange between web and mobile
2. **Push Notification Reliability:** Push notifications can be unreliable; need fallback (email? SMS?)
3. **Slashing Parameters:** SLASHING_PERIOD and SLASHING_PERCENTAGE need tuning based on real usage
4. **Gas Costs:** Slashing requires someone to call the function - is 10% incentive enough?
5. **QR Security:** How to prevent QR code spoofing in public places?

**User Acceptance Required:** Yes - please confirm the slashing mechanism parameters and QR workflow meet your expectations.

---

## Learnings

1. **Clarifications Early Save Time:** Getting the Win95 theme and mobile scope clarified before implementation prevents rework.

2. **Slashing Adds Complexity but Necessary:** The slashing mechanism adds significant contract complexity but is essential for protocol liveness. Without it, submitters could lock up deposits and ignore renters.

3. **QR Codes Simplify Mobile:** By using QR codes for web-mobile communication, we eliminated most mobile complexity while maintaining security.

4. **Win95 Theme is a Feature:** The retro theme isn't just aesthetic - it provides familiar UI patterns (Start menu, Explorer, wizards) that users understand.

---

## Next Steps

Plan is ready for implementation. Recommended order:
1. Start with Milestone 1 (contracts) - slashing mechanism needs careful review
2. Parallel: Milestone 2 can start once contract ABI is stable
3. Mobile (Milestones 4-5) can start independently
4. Integration testing (Milestone 6) after all others complete

