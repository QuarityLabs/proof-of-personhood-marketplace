// SPDX-License-Identifier: MIT
pragma solidity ^0.8.23;

/**
 * @title PersonhoodLending
 * @notice Protocol v2.0 - Dispute-based marketplace for personhood context
 * @dev Off-chain first communication, on-chain dispute resolution
 */
contract PersonhoodLending {
    // ============ Enums ============

    enum OfferStatus {
        PENDING,
        ACTIVE,
        EXPIRED,
        REMOVED
    }

    enum DisputeStatus {
        PENDING,
        RESOLVED_SIGNATURE,
        RESOLVED_ACK,
        TIMEOUT
    }

    // ============ Structs ============

    struct Offer {
        uint256 offerId;
        address submitter;
        address renter;
        string usageContext;
        uint256 weeklyPayment;
        uint256 deposit;
        uint256 lockedPayment;
        uint256 createdAt;
        uint256 rentedAt;
        uint256 expiresAt;
        OfferStatus status;
        uint256 totalRentals;
        uint8 lenderOffences;
        uint8 renterInvalidDisputes;
        uint256 activeDisputeId;
    }

    struct Dispute {
        uint256 disputeId;
        uint256 offerId;
        address renter;
        bytes renterSignedRequest;
        bytes expectedPayload;
        uint256 deadline;
        DisputeStatus status;
        uint256 createdAt;
        uint256 disputeDeposit;
    }

    // ============ Constants ============

    uint256 public constant MIN_DEPOSIT = 0.1 ether;
    uint256 public constant MIN_WEEKLY_PAYMENT = 0.01 ether;
    uint256 public constant GRACE_PERIOD = 7 days;
    uint256 public constant DISPUTE_TIMEOUT = 2 hours;
    uint256 public constant OFFENCE_PENALTY_PERCENTAGE = 5000;
    uint256 public constant BASIS_POINTS = 10000;
    uint256 public constant RENTAL_DURATION = 7 days;
    uint256 public constant MAX_OFFENCES = 3;
    uint256 public constant MAX_INVALID_DISPUTES = 3;

    // ============ State Variables ============

    uint256 public nextOfferId;
    uint256 public nextDisputeId;
    address public protocolTreasury;
    mapping(uint256 => Offer) public offers;
    mapping(uint256 => Dispute) public disputes;
    mapping(address => uint256[]) public submitterOffers;
    mapping(address => uint256[]) public renterActiveOffers;

    // ============ Events ============

    event OfferCreated(
        uint256 indexed offerId,
        address indexed submitter,
        string usageContext,
        uint256 weeklyPayment,
        uint256 deposit,
        uint256 createdAt
    );

    event OfferAccepted(
        uint256 indexed offerId, address indexed renter, uint256 rentedAt, uint256 expiresAt, uint256 weeklyPayment
    );

    event RentalRenewed(uint256 indexed offerId, uint256 newExpiresAt, uint256 additionalPayment);

    event OfferExpired(uint256 indexed offerId, uint256 expiredAt);

    event OfferReturnedToMarket(uint256 indexed offerId, uint256 returnedAt);

    event OfferRemoved(uint256 indexed offerId, uint256 removedAt);

    event PayoutClaimed(
        uint256 indexed offerId,
        address indexed submitter,
        uint256 payoutAmount,
        uint256 penaltyAmount,
        uint256 offences
    );

    event DepositClaimed(uint256 indexed offerId, address indexed submitter, uint256 depositAmount, uint256 claimedAt);

    event OfferTermsUpdated(uint256 indexed offerId, uint256 oldPayment, uint256 newPayment, uint256 updatedAt);

    event DisputeSubmitted(
        uint256 indexed disputeId, uint256 indexed offerId, address indexed renter, uint256 deadline, uint256 deposit
    );

    event SignatureSubmitted(uint256 indexed disputeId, uint256 indexed offerId, bytes signature, uint256 submittedAt);

    event ACKSubmitted(uint256 indexed disputeId, uint256 indexed offerId, bytes renterAck, uint256 submittedAt);

    event DisputeResolved(
        uint256 indexed disputeId, uint256 indexed offerId, DisputeStatus resolution, uint256 resolvedAt
    );

    event OffenceCounted(uint256 indexed offerId, address indexed party, uint8 offenceCount, uint8 offenceType);

    event RentCancelled(
        uint256 indexed offerId,
        address indexed renter,
        uint256 refundAmount,
        uint256 depositToTreasury,
        uint256 cancelledAt
    );

    // ============ Constructor ============

    constructor(address _protocolTreasury) {
        require(_protocolTreasury != address(0), "Invalid treasury address");
        protocolTreasury = _protocolTreasury;
    }

    // ============ Internal Functions ============

    /**
     * @notice Calculate payout amount after applying offence penalties
     * @param _totalLocked Total locked payment amount
     * @param _offences Number of lender offences
     * @return payoutAmount Amount to pay to lender
     * @return penaltyAmount Amount to send to treasury as penalty
     */
    function _calculatePayoutWithPenalties(uint256 _totalLocked, uint256 _offences)
        internal
        pure
        returns (uint256 payoutAmount, uint256 penaltyAmount)
    {
        if (_totalLocked == 0) {
            return (0, 0);
        }

        // Calculate penalty based on offences (50% reduction per offence)
        uint256 payoutPercentage = BASIS_POINTS;
        for (uint256 i = 0; i < _offences; i++) {
            payoutPercentage = (payoutPercentage * (BASIS_POINTS - OFFENCE_PENALTY_PERCENTAGE)) / BASIS_POINTS;
        }

        payoutAmount = (_totalLocked * payoutPercentage) / BASIS_POINTS;
        penaltyAmount = _totalLocked - payoutAmount;

        return (payoutAmount, penaltyAmount);
    }

    // ============ Core Functions ============

    /**
     * @notice Create a new offer for personhood context
     * @param _usageContext Description of how the personhood will be used
     * @param _weeklyPayment Amount to be paid per week
     * @param _deposit Required deposit from renters
     * @return offerId The ID of the newly created offer
     */
    function createOffer(string calldata _usageContext, uint256 _weeklyPayment, uint256 _deposit)
        external
        returns (uint256 offerId)
    {
        require(bytes(_usageContext).length > 0, "Usage context cannot be empty");
        require(_weeklyPayment >= MIN_WEEKLY_PAYMENT, "Weekly payment too low");
        require(_deposit >= MIN_DEPOSIT, "Deposit too low");

        offerId = nextOfferId++;

        offers[offerId] = Offer({
            offerId: offerId,
            submitter: msg.sender,
            renter: address(0),
            usageContext: _usageContext,
            weeklyPayment: _weeklyPayment,
            deposit: _deposit,
            lockedPayment: 0,
            createdAt: block.timestamp,
            rentedAt: 0,
            expiresAt: 0,
            status: OfferStatus.PENDING,
            totalRentals: 0,
            lenderOffences: 0,
            renterInvalidDisputes: 0,
            activeDisputeId: 0
        });

        submitterOffers[msg.sender].push(offerId);

        emit OfferCreated(offerId, msg.sender, _usageContext, _weeklyPayment, _deposit, block.timestamp);

        return offerId;
    }

    /**
     * @notice Accept an offer and start rental period
     * @param _offerId ID of the offer to accept
     */
    function acceptOffer(uint256 _offerId) external payable {
        Offer storage offer = offers[_offerId];

        require(offer.submitter != address(0), "Offer does not exist");
        require(offer.status == OfferStatus.PENDING, "Offer not available");
        require(offer.submitter != msg.sender, "Cannot rent own offer");
        require(msg.value == offer.deposit + offer.weeklyPayment, "Incorrect payment amount");
        require(offer.activeDisputeId == 0, "Offer has active dispute");

        offer.renter = msg.sender;
        offer.lockedPayment = offer.weeklyPayment;
        offer.rentedAt = block.timestamp;
        offer.expiresAt = block.timestamp + RENTAL_DURATION;
        offer.status = OfferStatus.ACTIVE;
        offer.totalRentals++;

        renterActiveOffers[msg.sender].push(_offerId);

        emit OfferAccepted(_offerId, msg.sender, block.timestamp, offer.expiresAt, offer.weeklyPayment);
    }

    /**
     * @notice Renew rental for an additional week
     * @param _offerId ID of the offer to renew
     */
    function renewRental(uint256 _offerId) external payable {
        Offer storage offer = offers[_offerId];

        require(offer.status == OfferStatus.ACTIVE || offer.status == OfferStatus.EXPIRED, "Invalid offer status");
        require(offer.renter == msg.sender, "Only renter can renew");
        require(offer.activeDisputeId == 0, "Cannot renew with active dispute");
        require(msg.value == offer.weeklyPayment, "Incorrect payment amount");
        require(block.timestamp <= offer.expiresAt + GRACE_PERIOD, "Grace period expired");

        // If expired, move back to active
        if (offer.status == OfferStatus.EXPIRED) {
            offer.status = OfferStatus.ACTIVE;
        }

        offer.lockedPayment += offer.weeklyPayment;
        // Extend from current expiration or now, whichever is later
        uint256 newExpiresAt = (offer.expiresAt > block.timestamp ? offer.expiresAt : block.timestamp) + RENTAL_DURATION;
        offer.expiresAt = newExpiresAt;

        emit RentalRenewed(_offerId, newExpiresAt, offer.weeklyPayment);
    }

    /**
     * @notice Return expired offer to market (can be rented again)
     * @param _offerId ID of the expired offer
     */
    function returnToMarket(uint256 _offerId) external {
        Offer storage offer = offers[_offerId];

        require(offer.status == OfferStatus.EXPIRED, "Offer not expired");
        require(
            offer.renter == msg.sender || offer.submitter == msg.sender
                || block.timestamp > offer.expiresAt + GRACE_PERIOD,
            "Not authorized or grace period still active"
        );
        require(offer.activeDisputeId == 0, "Cannot return with active dispute");
        // Prevent non-renters from resetting offers with locked payments
        require(
            offer.lockedPayment == 0 || msg.sender == offer.renter,
            "Renter must settle locked payment before returning to market"
        );

        offer.renter = address(0);
        offer.rentedAt = 0;
        offer.expiresAt = 0;
        offer.status = OfferStatus.PENDING;

        emit OfferReturnedToMarket(_offerId, block.timestamp);
    }

    /**
     * @notice Remove expired offer permanently
     * @param _offerId ID of the expired offer to remove
     */
    function removeExpiredOffer(uint256 _offerId) external {
        Offer storage offer = offers[_offerId];

        require(offer.status == OfferStatus.EXPIRED, "Offer not expired");
        require(offer.submitter == msg.sender, "Only submitter can remove");
        require(offer.activeDisputeId == 0, "Cannot remove with active dispute");
        require(block.timestamp > offer.expiresAt + GRACE_PERIOD, "Grace period still active");

        uint256 totalLocked = offer.lockedPayment;
        uint256 lenderOffences = offer.lenderOffences;

        // Calculate payout with penalties (same logic as claimPayout)
        (uint256 payoutAmount, uint256 penaltyAmount) = _calculatePayoutWithPenalties(totalLocked, lenderOffences);

        offer.status = OfferStatus.REMOVED;
        offer.lockedPayment = 0;

        // Transfer payout to lender
        if (payoutAmount > 0) {
            (bool success,) = payable(offer.submitter).call{value: payoutAmount}("");
            require(success, "Refund transfer failed");
        }

        // Transfer penalty to treasury
        if (penaltyAmount > 0) {
            (bool success,) = payable(protocolTreasury).call{value: penaltyAmount}("");
            require(success, "Penalty transfer failed");
        }

        emit OfferRemoved(_offerId, block.timestamp);
    }

    /**
     * @notice Claim payout for a completed rental
     * @param _offerId ID of the offer to claim payout for
     */
    function claimPayout(uint256 _offerId) external {
        Offer storage offer = offers[_offerId];

        require(
            offer.status == OfferStatus.EXPIRED
                || (offer.status == OfferStatus.ACTIVE && block.timestamp >= offer.expiresAt),
            "Rental must be expired to claim payout"
        );
        require(offer.submitter == msg.sender, "Only submitter can claim");
        require(offer.activeDisputeId == 0, "Cannot claim with active dispute");
        require(offer.lockedPayment > 0, "No locked payment to claim");

        uint256 totalLocked = offer.lockedPayment;
        uint256 lenderOffences = offer.lenderOffences;

        // Calculate payout with penalties
        (uint256 payoutAmount, uint256 penaltyAmount) = _calculatePayoutWithPenalties(totalLocked, lenderOffences);

        // Reset locked payment before external call (reentrancy protection)
        offer.lockedPayment = 0;

        // Transfer payout to lender
        if (payoutAmount > 0) {
            (bool success,) = payable(offer.submitter).call{value: payoutAmount}("");
            require(success, "Payout transfer failed");
        }

        // Transfer penalty to treasury
        if (penaltyAmount > 0) {
            (bool success,) = payable(protocolTreasury).call{value: penaltyAmount}("");
            require(success, "Penalty transfer failed");
        }

        emit PayoutClaimed(_offerId, msg.sender, payoutAmount, penaltyAmount, uint8(lenderOffences));
    }

    /**
     * @notice Update offer terms (only for pending offers)
     * @param _offerId ID of the offer to update
     * @param _newWeeklyPayment New weekly payment amount
     */
    function updateOfferTerms(uint256 _offerId, uint256 _newWeeklyPayment) external {
        Offer storage offer = offers[_offerId];

        require(offer.status == OfferStatus.PENDING, "Only pending offers can be updated");
        require(offer.submitter == msg.sender, "Only submitter can update");
        require(_newWeeklyPayment >= MIN_WEEKLY_PAYMENT, "Weekly payment too low");
        require(offer.activeDisputeId == 0, "Cannot update with active dispute");

        uint256 oldPayment = offer.weeklyPayment;
        offer.weeklyPayment = _newWeeklyPayment;

        emit OfferTermsUpdated(_offerId, oldPayment, _newWeeklyPayment, block.timestamp);
    }
}
