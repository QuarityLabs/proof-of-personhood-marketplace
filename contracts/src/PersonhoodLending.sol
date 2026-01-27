// SPDX-License-Identifier: MIT
pragma solidity ^0.8.23;

contract PersonhoodLending {
    // Structure to represent a lending agreement
    struct LendingAgreement {
        uint256 agreementId;
        address lender;
        address borrower;
        string context; // e.g. "Polkadot Forum", "Governance Voting", etc.
        uint256 startTime;
        uint256 duration; // in seconds
        uint256 collateral;
        bool isActive;
    }

    // Mapping of agreement IDs to agreements
    mapping(uint256 => LendingAgreement) public agreements;
    
    // Total agreements counter
    uint256 public totalAgreements;
    
    // Event for when a lending agreement is created
    event AgreementCreated(
        uint256 indexed agreementId,
        address indexed lender,
        address indexed borrower,
        string context,
        uint256 duration,
        uint256 collateral
    );
    
    // Event for when a lending agreement is completed
    event AgreementCompleted(uint256 indexed agreementId);

    /**
     * @dev Create a new personhood lending agreement
     * @param _borrower The address borrowing the personhood
     * @param _context The specific context for which personhood is borrowed
     * @param _duration The duration of the lending agreement in seconds
     */
    function createAgreement(
        address _borrower,
        string memory _context,
        uint256 _duration
    ) public payable returns (uint256) {
        // Validate inputs
        require(_borrower != address(0), "Invalid borrower address");
        require(bytes(_context).length > 0, "Context cannot be empty");
        require(_duration > 0, "Duration must be greater than 0");
        require(msg.value > 0, "Collateral must be greater than 0");
        
        // Create new agreement
        totalAgreements++;
        uint256 agreementId = totalAgreements;
        
        agreements[agreementId] = LendingAgreement({
            agreementId: agreementId,
            lender: msg.sender,
            borrower: _borrower,
            context: _context,
            startTime: block.timestamp,
            duration: _duration,
            collateral: msg.value,
            isActive: true
        });
        
        emit AgreementCreated(
            agreementId,
            msg.sender,
            _borrower,
            _context,
            _duration,
            msg.value
        );
        
        return agreementId;
    }

    /**
     * @dev Complete a lending agreement and return collateral
     * @param _agreementId The ID of the agreement to complete
     */
    function completeAgreement(uint256 _agreementId) public {
        LendingAgreement storage agreement = agreements[_agreementId];
        
        // Validate that agreement exists and is active
        require(agreement.agreementId != 0, "Agreement does not exist");
        require(agreement.isActive, "Agreement is not active");
        require(agreement.lender == msg.sender, "Only lender can complete agreement");
        require(block.timestamp >= agreement.startTime + agreement.duration, "Agreement duration not yet completed");
        
        // Mark agreement as inactive
        agreement.isActive = false;
        
        // Transfer collateral back to lender
        payable(agreement.lender).transfer(agreement.collateral);
        
        emit AgreementCompleted(_agreementId);
    }

    /**
     * @dev Get the details of a specific lending agreement
     * @param _agreementId The ID of the agreement to query
     * @return The lending agreement details
     */
    function getAgreement(
        uint256 _agreementId
    ) public view returns (LendingAgreement memory) {
        return agreements[_agreementId];
    }

    /**
     * @dev Fallback function to receive ETH
     */
    receive() external payable {}
}