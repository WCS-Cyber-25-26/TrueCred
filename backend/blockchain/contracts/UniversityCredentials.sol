// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title UniversityCredentials
 * @notice On-chain registry for university credential issuance and revocation.
 *
 * Flow:
 *   1. Admin (contract owner) deploys this contract.
 *
    2. Admin calls registerUniversity() for each onboarded university, supplying
 *      the university's Ethereum wallet address and its UUID from the TrueCred DB.
 *   3. The university's backend wallet calls issueCredential() with the
 *      canonicalHash (keccak256 of the normalised credential JSON) and the
 *      credential's DB UUID.
 *   4. Anyone can call verifyCredential() to check whether a hash is valid,
 *      who issued it, and whether it has been revoked.
 *   5. The issuing university or the owner can call revokeCredential().
 */
contract UniversityCredentials {
    // -------------------------------------------------------------------------
    // State
    // -------------------------------------------------------------------------

    address public owner;

    struct UniversityInfo {
        bool     registered;
        string   universityId;   // UUID from the TrueCred database
        string   name;
        uint256  registeredAt;
    }

    struct CredentialInfo {
        bool     issued;
        bool     revoked;
        address  issuedBy;       // university wallet that issued the credential
        uint256  issuedAt;
        uint256  revokedAt;
        string   credentialId;   // UUID from the TrueCred database
    }

    /// @dev university wallet address → registration info
    mapping(address => UniversityInfo) public universities;

    /// @dev canonical hash (bytes32) → credential record
    mapping(bytes32 => CredentialInfo) public credentials;

    // -------------------------------------------------------------------------
    // Events
    // -------------------------------------------------------------------------

    event UniversityRegistered(
        address indexed universityAddress,
        string  universityId,
        string  name
    );

    event UniversityDeregistered(address indexed universityAddress);

    event CredentialIssued(
        bytes32 indexed canonicalHash,
        address indexed issuedBy,
        string  credentialId
    );

    event CredentialRevoked(
        bytes32 indexed canonicalHash,
        address indexed revokedBy
    );

    event OwnershipTransferred(
        address indexed previousOwner,
        address indexed newOwner
    );

    // -------------------------------------------------------------------------
    // Modifiers
    // -------------------------------------------------------------------------

    modifier onlyOwner() {
        require(msg.sender == owner, "UC: caller is not owner");
        _;
    }

    modifier onlyRegisteredUniversity() {
        require(
            universities[msg.sender].registered,
            "UC: caller is not a registered university"
        );
        _;
    }

    // -------------------------------------------------------------------------
    // Constructor
    // -------------------------------------------------------------------------

    constructor() {
        owner = msg.sender;
        emit OwnershipTransferred(address(0), msg.sender);
    }

    // -------------------------------------------------------------------------
    // Owner-only administration
    // -------------------------------------------------------------------------

    /**
     * @notice Register a university wallet so it can issue credentials.
     * @param universityAddress  Ethereum wallet assigned to the university.
     * @param universityId       UUID from the TrueCred database (University.id).
     * @param name               Human-readable name stored for reference.
     */
    function registerUniversity(
        address universityAddress,
        string calldata universityId,
        string calldata name
    ) external onlyOwner {
        require(universityAddress != address(0), "UC: zero address");
        require(
            !universities[universityAddress].registered,
            "UC: university already registered"
        );
        universities[universityAddress] = UniversityInfo({
            registered:    true,
            universityId:  universityId,
            name:          name,
            registeredAt:  block.timestamp
        });
        emit UniversityRegistered(universityAddress, universityId, name);
    }

    /**
     * @notice Remove a university's registration (revokes issuing rights).
     *         Previously issued credentials remain in the mapping and are
     *         still verifiable.
     */
    function deregisterUniversity(address universityAddress) external onlyOwner {
        require(
            universities[universityAddress].registered,
            "UC: university not registered"
        );
        universities[universityAddress].registered = false;
        emit UniversityDeregistered(universityAddress);
    }

    /**
     * @notice Transfer contract ownership.
     */
    function transferOwnership(address newOwner) external onlyOwner {
        require(newOwner != address(0), "UC: zero address");
        emit OwnershipTransferred(owner, newOwner);
        owner = newOwner;
    }

    // -------------------------------------------------------------------------
    // University-facing write functions
    // -------------------------------------------------------------------------

    /**
     * @notice Anchor a credential hash on-chain.
     * @param canonicalHash  keccak256 of the canonical (normalised) credential
     *                       JSON.  Compute off-chain with ethers.js:
     *                       `ethers.keccak256(ethers.toUtf8Bytes(canonicalJson))`
     * @param credentialId   UUID from the TrueCred database (Credential.id).
     */
    function issueCredential(
        bytes32 canonicalHash,
        string  calldata credentialId
    ) external onlyRegisteredUniversity {
        require(!credentials[canonicalHash].issued, "UC: credential already issued");
        credentials[canonicalHash] = CredentialInfo({
            issued:       true,
            revoked:      false,
            issuedBy:     msg.sender,
            issuedAt:     block.timestamp,
            revokedAt:    0,
            credentialId: credentialId
        });
        emit CredentialIssued(canonicalHash, msg.sender, credentialId);
    }

    // -------------------------------------------------------------------------
    // Shared revocation
    // -------------------------------------------------------------------------

    /**
     * @notice Revoke a previously issued credential.
     *         Only the issuing university wallet or the contract owner may call
     *         this function.
     */
    function revokeCredential(bytes32 canonicalHash) external {
        CredentialInfo storage cred = credentials[canonicalHash];
        require(cred.issued,   "UC: credential not found");
        require(!cred.revoked, "UC: already revoked");
        require(
            msg.sender == cred.issuedBy || msg.sender == owner,
            "UC: not authorised to revoke"
        );
        cred.revoked   = true;
        cred.revokedAt = block.timestamp;
        emit CredentialRevoked(canonicalHash, msg.sender);
    }

    // -------------------------------------------------------------------------
    // View / verification
    // -------------------------------------------------------------------------

    /**
     * @notice Verify a credential hash.
     * @return issued     Whether the hash was ever anchored.
     * @return revoked    Whether the credential has been revoked.
     * @return issuedBy   University wallet that issued it (zero if not found).
     * @return issuedAt   Unix timestamp of issuance (0 if not found).
     * @return revokedAt  Unix timestamp of revocation (0 if not revoked).
     */
    function verifyCredential(bytes32 canonicalHash)
        external
        view
        returns (
            bool    issued,
            bool    revoked,
            address issuedBy,
            uint256 issuedAt,
            uint256 revokedAt
        )
    {
        CredentialInfo storage cred = credentials[canonicalHash];
        return (
            cred.issued,
            cred.revoked,
            cred.issuedBy,
            cred.issuedAt,
            cred.revokedAt
        );
    }

    /**
     * @notice Check whether a wallet address is a currently registered university.
     */
    function isUniversityRegistered(address universityAddress)
        external
        view
        returns (bool)
    {
        return universities[universityAddress].registered;
    }
}
