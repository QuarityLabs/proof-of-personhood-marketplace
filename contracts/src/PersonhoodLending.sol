// SPDX-License-Identifier: MIT
pragma solidity ^0.8.23;

/**
 * @title PersonhoodLending
 * @notice Protocol-compliant marketplace for lending personhood context
 * @dev Implements offer-based marketplace with deposit slashing mechanism
 */
contract PersonhoodLending {
    // ============ Enums ============

    /**
     * @notice Offer status states
     * @dev State machine: PENDING -> ACTIVE -> EXPIRED -> [PENDING | REMOVED]
     */
    enum OfferStatus {
        PENDING,
        ACTIVE,
        EXPIRED,
        REMOVED
    }

    /**
     * @notice Usage request status for slashing mechanism
     */
    enum RequestStatus {
        PENDING,
        APPROVED,
        REJECTED,
        SLASHED
    }

    // ============ Structs ============

    /**
     * @notice Offer struct representing a personhood lending offer
     */
    struct Offer {
        uint256 offerId;
        address submitter;
        address renter;
        string usageContext;
        uint256 weeklyPayment;
        uint256 deposit;
        bytes signature;
        uint256 createdAt;
        uint256 rentedAt;
        uint256 expiresAt;
        OfferStatus status;
        bool autoApprove;
        uint256 totalRentals;
    }

    /**
     * @notice UsageRequest struct for slashing mechanism
     */
    struct UsageRequest {
        uint256 requestId;
        uint256 offerId;
        address renter;
        uint256 deadline;
        RequestStatus status;
        uint256 createdAt;
    }

    // ============ Constants ============

    uint256 public constant MIN_DEPOSIT = 0.1 ether;
    uint256 public constant GRACE_PERIOD = 7 days;
    uint256 public constant SLASHING_PERIOD = 1 hours;
    uint256 public constant SLASHING_PERCENTAGE = 1000;
    uint256 public constant BASIS_POINTS = 10000;
    uint256 public constant RENTAL_DURATION = 7 days;

    // ============ State Variables ============

    uint256 public nextOfferId;
    uint256 public nextRequestId;
    mapping(uint256 => Offer) public offers;
    mapping(uint256 => UsageRequest) public usageRequests;
    mapping(uint256 => uint256[]) public offerRequestHistory;
    mapping(address => uint256[]) public submitterOffers;
    mapping(address => uint256[]) public renterActiveOffers;
    mapping(bytes => bool) public usedSignatures;

    // ============ Events ============

    event OfferCreated(
        uint256 indexed offerId,
        address indexed submitter,
        string usageContext,
        uint256 weeklyPayment,
        uint256 deposit,
        uint256 createdAt
    );

    event OfferAccepted(uint256 indexed offerId, address indexed renter, uint256 rentedAt, uint256 expiresAt);

    event RentalRenewed(uint256 indexed offerId, uint256 newExpiresAt, uint256 paymentAmount);

    event OfferExpired(uint256 indexed offerId, uint256 expiredAt);

    event OfferReturnedToMarket(uint256 indexed offerId, uint256 returnedAt);

    event OfferRemoved(uint256 indexed offerId, uint256 removedAt);

    event DepositClaimed(uint256 indexed offerId, address indexed submitter, uint256 depositAmount, uint256 claimedAt);

    event OfferTermsUpdated(uint256 indexed offerId, uint256 oldPayment, uint256 newPayment, uint256 updatedAt);

    event UsageRequested(uint256 indexed requestId, uint256 indexed offerId, address indexed renter, uint256 deadline);

    event UsageApproved(uint256 indexed requestId, uint256 indexed offerId, uint256 approvedAt);

    event UsageRejected(uint256 indexed requestId, uint256 indexed offerId, uint256 rejectedAt);

    event DepositSlashed(
        uint256 indexed requestId,
        uint256 indexed offerId,
        address indexed caller,
        uint256 slashAmount,
        uint256 remainingDeposit
    );

    event AutoApproveSet(uint256 indexed offerId, bool autoApprove, uint256 updatedAt);
}
