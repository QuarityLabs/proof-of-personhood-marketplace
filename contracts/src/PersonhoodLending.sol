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
}
