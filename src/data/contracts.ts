import { AuditContract } from '../types/web3';

export const INITIAL_CONTRACTS: AuditContract[] = [
  {
    id: 'marketplace-core',
    name: 'MarketplaceCore',
    fileName: 'MarketplaceCore.sol',
    description: 'Central escrow and trade settlement engine for primary mints and secondary content NFT exchanges.',
    compilerVersion: '0.8.24',
    byteCodeSizeKb: 19.4,
    isPatched: false,
    sourceCode: `// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "@openzeppelin/contracts/interfaces/IERC2981.sol";

/**
 * @title MarketplaceCore (Vulnerable Pre-Audit Build)
 * @notice Handles listing, purchasing, and creator royalty distribution.
 */
contract MarketplaceCore {
    struct Listing {
        address seller;
        address nftAddress;
        uint256 tokenId;
        uint256 price;
        bool isActive;
    }

    address public owner;
    uint256 public platformFeeBasisPoints = 150; // 1.5%
    mapping(bytes32 => Listing) public listings;
    mapping(address => uint256) public pendingProceeds;

    event ItemListed(bytes32 indexed listingId, address indexed seller, uint256 price);
    event ItemSold(bytes32 indexed listingId, address indexed buyer, uint256 price);

    constructor() {
        owner = msg.sender;
    }

    // [VULN: Access Control Missing] Unrestricted fee setter
    function setPlatformFee(uint256 _newFee) external {
        platformFeeBasisPoints = _newFee;
    }

    function createListing(address nftAddress, uint256 tokenId, uint256 price) external returns (bytes32 listingId) {
        require(price > 0, "Price must be > 0");
        IERC721(nftAddress).transferFrom(msg.sender, address(this), tokenId);

        listingId = keccak256(abi.encodePacked(nftAddress, tokenId, msg.sender, block.timestamp));
        listings[listingId] = Listing({
            seller: msg.sender,
            nftAddress: nftAddress,
            tokenId: tokenId,
            price: price,
            isActive: true
        });

        emit ItemListed(listingId, msg.sender, price);
    }

    function buyItem(bytes32 listingId) external payable {
        Listing storage listing = listings[listingId];
        require(listing.isActive, "Listing inactive");
        require(msg.value >= listing.price, "Insufficient payment");

        listing.isActive = false;

        // Calculate royalties via EIP-2981 if supported
        uint256 royaltyAmount = 0;
        address royaltyReceiver = address(0);
        try IERC2981(listing.nftAddress).royaltyInfo(listing.tokenId, listing.price) returns (address receiver, uint256 amount) {
            royaltyReceiver = receiver;
            royaltyAmount = amount;
        } catch {}

        uint256 platformCut = (listing.price * platformFeeBasisPoints) / 10000;
        uint256 sellerCut = listing.price - platformCut - royaltyAmount;

        pendingProceeds[listing.seller] += sellerCut;
        if (royaltyAmount > 0 && royaltyReceiver != address(0)) {
            pendingProceeds[royaltyReceiver] += royaltyAmount;
        }

        IERC721(listing.nftAddress).transferFrom(address(this), msg.sender, listing.tokenId);
        emit ItemSold(listingId, msg.sender, listing.price);
    }

    // [VULN: Reentrancy] State updated after low-level call
    function withdrawProceeds() external {
        uint256 amount = pendingProceeds[msg.sender];
        require(amount > 0, "Zero balance");

        // Vulnerable external call before updating state!
        (bool success, ) = msg.sender.call{value: amount}("");
        require(success, "Transfer failed");

        pendingProceeds[msg.sender] = 0;
    }
}`,
    patchedCode: `// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "@openzeppelin/contracts/interfaces/IERC2981.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/Ownable2Step.sol";

/**
 * @title MarketplaceCore (Audited & Hardened)
 * @notice Fixed Checks-Effects-Interactions and enforced Ownable2Step access controls.
 */
contract MarketplaceCore is ReentrancyGuard, Ownable2Step {
    struct Listing {
        address seller;
        address nftAddress;
        uint256 tokenId;
        uint256 price;
        bool isActive;
    }

    uint256 public constant MAX_PLATFORM_FEE = 500; // 5% Hard Cap
    uint256 public platformFeeBasisPoints = 150; // 1.5%
    mapping(bytes32 => Listing) public listings;
    mapping(address => uint256) public pendingProceeds;

    event ItemListed(bytes32 indexed listingId, address indexed seller, uint256 price);
    event ItemSold(bytes32 indexed listingId, address indexed buyer, uint256 price);
    event PlatformFeeUpdated(uint256 oldFee, uint256 newFee);
    event ProceedsWithdrawn(address indexed recipient, uint256 amount);

    constructor() Ownable(msg.sender) {}

    /// @notice Only owner can update platform fee, strictly bounded by MAX_PLATFORM_FEE
    function setPlatformFee(uint256 _newFee) external onlyOwner {
        require(_newFee <= MAX_PLATFORM_FEE, "Fee exceeds safety cap");
        emit PlatformFeeUpdated(platformFeeBasisPoints, _newFee);
        platformFeeBasisPoints = _newFee;
    }

    function createListing(address nftAddress, uint256 tokenId, uint256 price) external nonReentrant returns (bytes32 listingId) {
        require(price > 0, "Price must be > 0");
        IERC721(nftAddress).transferFrom(msg.sender, address(this), tokenId);

        listingId = keccak256(abi.encodePacked(nftAddress, tokenId, msg.sender, block.timestamp));
        listings[listingId] = Listing({
            seller: msg.sender,
            nftAddress: nftAddress,
            tokenId: tokenId,
            price: price,
            isActive: true
        });

        emit ItemListed(listingId, msg.sender, price);
    }

    function buyItem(bytes32 listingId) external payable nonReentrant {
        Listing storage listing = listings[listingId];
        require(listing.isActive, "Listing inactive");
        require(msg.value >= listing.price, "Insufficient payment");

        listing.isActive = false;

        uint256 royaltyAmount = 0;
        address royaltyReceiver = address(0);
        try IERC2981(listing.nftAddress).royaltyInfo(listing.tokenId, listing.price) returns (address receiver, uint256 amount) {
            royaltyReceiver = receiver;
            royaltyAmount = amount;
        } catch {}

        uint256 platformCut = (listing.price * platformFeeBasisPoints) / 10000;
        uint256 sellerCut = listing.price - platformCut - royaltyAmount;

        pendingProceeds[listing.seller] += sellerCut;
        if (royaltyAmount > 0 && royaltyReceiver != address(0)) {
            pendingProceeds[royaltyReceiver] += royaltyAmount;
        }

        IERC721(listing.nftAddress).transferFrom(address(this), msg.sender, listing.tokenId);
        emit ItemSold(listingId, msg.sender, listing.price);

        // Refund excess payment if buyer overpaid
        if (msg.value > listing.price) {
            (bool refundSuccess, ) = msg.sender.call{value: msg.value - listing.price}("");
            require(refundSuccess, "Refund failed");
        }
    }

    /// @notice Follows Checks-Effects-Interactions pattern with ReentrancyGuard mutex
    function withdrawProceeds() external nonReentrant {
        uint256 amount = pendingProceeds[msg.sender];
        require(amount > 0, "Zero balance");

        // CHECKS & EFFECTS first
        pendingProceeds[msg.sender] = 0;

        // INTERACTIONS last
        (bool success, ) = msg.sender.call{value: amount}("");
        require(success, "Transfer failed");

        emit ProceedsWithdrawn(msg.sender, amount);
    }
}`,
    initialReport: {
      contractName: 'MarketplaceCore.sol',
      securityScore: 48,
      summary: 'Critical vulnerability detected: withdrawProceeds() fails to follow Checks-Effects-Interactions and lacks ReentrancyGuard mutex. Missing access control allows unauthorized fee modification.',
      metrics: {
        criticalCount: 1,
        highCount: 1,
        mediumCount: 1,
        lowCount: 1,
        gasCount: 1,
      },
      findings: [
        {
          id: 'CRIT-001',
          title: 'State Update After External Call (Reentrancy)',
          severity: 'CRITICAL',
          line: 73,
          description: 'The function withdrawProceeds() transfers ether via low-level call before setting pendingProceeds[msg.sender] to zero. A malicious contract receiver fallback can recursively drain the contract balance.',
          recommendation: 'Zero out pendingProceeds[msg.sender] prior to the external call and apply OpenZeppelin nonReentrant modifier.',
          codeSnippet: '(bool success, ) = msg.sender.call{value: amount}("");\npendingProceeds[msg.sender] = 0;',
        },
        {
          id: 'HIGH-001',
          title: 'Unrestricted Administrative Fee Setter',
          severity: 'HIGH',
          line: 28,
          description: 'setPlatformFee() lacks any access control modifier (onlyOwner). Any arbitrary account can set platform fee to 100% or alter protocol economics.',
          recommendation: 'Inherit Ownable2Step and restrict setter with onlyOwner modifier.',
          codeSnippet: 'function setPlatformFee(uint256 _newFee) external { ... }',
        },
        {
          id: 'MED-001',
          title: 'Unbounded Platform Fee Parameter',
          severity: 'MEDIUM',
          line: 28,
          description: 'No upper bound validation on _newFee allows setting basis points greater than 10000 (100%), which causes integer underflow / transaction reverts.',
          recommendation: 'Add require(_newFee <= MAX_PLATFORM_FEE, "Fee exceeds cap").',
          codeSnippet: 'platformFeeBasisPoints = _newFee;',
        },
        {
          id: 'LOW-001',
          title: 'Lack of Excess Payment Refund',
          severity: 'LOW',
          line: 45,
          description: 'If msg.value > listing.price, excess ether is locked inside contract without crediting the buyer.',
          recommendation: 'Refund excess msg.value to msg.sender.',
          codeSnippet: 'require(msg.value >= listing.price, "Insufficient payment");',
        },
        {
          id: 'GAS-001',
          title: 'Storage Read Optimization in buyItem',
          severity: 'GAS',
          line: 52,
          description: 'Multiple SLOAD operations reading platformFeeBasisPoints from storage instead of local stack variable.',
          recommendation: 'Cache platformFeeBasisPoints in local stack memory.',
          codeSnippet: 'uint256 platformCut = (listing.price * platformFeeBasisPoints) / 10000;',
        },
      ],
      mainnetReadiness: {
        isReady: false,
        blockingIssues: [
          'Critical reentrancy vector in withdrawProceeds()',
          'Unprotected administrative setter in setPlatformFee()',
        ],
      },
    },
    patchedReport: {
      contractName: 'MarketplaceCore.sol (Hardened)',
      securityScore: 98,
      summary: 'All critical and high-severity vulnerabilities remediated. ReentrancyGuard mutex active, Checks-Effects-Interactions strictly enforced, and Ownable2Step access controls configured.',
      metrics: {
        criticalCount: 0,
        highCount: 0,
        mediumCount: 0,
        lowCount: 0,
        gasCount: 1,
      },
      findings: [
        {
          id: 'GAS-001',
          title: 'Custom Error Migration',
          severity: 'GAS',
          line: 38,
          description: 'Using custom errors instead of require string messages saves ~24 gas per assertion check.',
          recommendation: 'Replace require statements with custom errors: error FeeExceedsSafetyCap().',
          codeSnippet: 'require(_newFee <= MAX_PLATFORM_FEE, "Fee exceeds safety cap");',
        },
      ],
      mainnetReadiness: {
        isReady: true,
        blockingIssues: [],
      },
    },
  },
  {
    id: 'erc721-content-token',
    name: 'ERC721ContentToken',
    fileName: 'ERC721ContentToken.sol',
    description: 'Content NFT implementation with EIP-2981 royalty standard and ECDSA signature-verified token-gated content decryption.',
    compilerVersion: '0.8.24',
    byteCodeSizeKb: 14.8,
    isPatched: true,
    sourceCode: `// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/token/common/ERC2981.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";

/**
 * @title ERC721ContentToken
 * @notice Standard ERC721 NFT with EIP-2981 Royalties and Token-Gated Content Signatures.
 */
contract ERC721ContentToken is ERC721URIStorage, ERC2981, Ownable {
    using ECDSA for bytes32;

    uint256 private _nextTokenId;
    mapping(uint256 => bytes32) public contentPayloadHashes;
    mapping(uint256 => string) public ipfsSecretCids;

    event ContentMinted(uint256 indexed tokenId, address indexed creator, string ipfsCid);

    constructor(string memory name, string memory symbol, address defaultRoyaltyReceiver, uint96 defaultRoyaltyFeeNumerator)
        ERC721(name, symbol)
        Ownable(msg.sender)
    {
        _setDefaultRoyalty(defaultRoyaltyReceiver, defaultRoyaltyFeeNumerator);
    }

    function mintContent(
        address to,
        string memory uri,
        string memory secretCid,
        bytes32 payloadHash,
        uint96 royaltyFeeNumerator
    ) external onlyOwner returns (uint256 tokenId) {
        tokenId = ++_nextTokenId;
        _safeMint(to, tokenId);
        _setTokenURI(tokenId, uri);

        if (royaltyFeeNumerator > 0) {
            _setTokenRoyalty(tokenId, to, royaltyFeeNumerator);
        }

        ipfsSecretCids[tokenId] = secretCid;
        contentPayloadHashes[tokenId] = payloadHash;

        emit ContentMinted(tokenId, to, secretCid);
    }

    /// @notice Verify if caller owns or holds authorization to access decrypted IPFS payload
    function verifyContentAccess(uint256 tokenId, address viewer) external view returns (bool) {
        return ownerOf(tokenId) == viewer;
    }

    function supportsInterface(bytes4 interfaceId)
        public
        view
        override(ERC721URIStorage, ERC2981)
        returns (bool)
    {
        return super.supportsInterface(interfaceId);
    }
}`,
    patchedCode: `// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/token/common/ERC2981.sol";
import "@openzeppelin/contracts/access/Ownable2Step.sol";

contract ERC721ContentToken is ERC721URIStorage, ERC2981, Ownable2Step {
    uint256 private _nextTokenId;
    mapping(uint256 => bytes32) public contentPayloadHashes;
    mapping(uint256 => string) public ipfsSecretCids;

    event ContentMinted(uint256 indexed tokenId, address indexed creator, string ipfsCid);

    constructor(string memory name, string memory symbol, address defaultRoyaltyReceiver, uint96 defaultRoyaltyFeeNumerator)
        ERC721(name, symbol)
        Ownable(msg.sender)
    {
        _setDefaultRoyalty(defaultRoyaltyReceiver, defaultRoyaltyFeeNumerator);
    }

    function mintContent(
        address to,
        string memory uri,
        string memory secretCid,
        bytes32 payloadHash,
        uint96 royaltyFeeNumerator
    ) external onlyOwner returns (uint256 tokenId) {
        tokenId = ++_nextTokenId;
        _safeMint(to, tokenId);
        _setTokenURI(tokenId, uri);

        if (royaltyFeeNumerator > 0) {
            _setTokenRoyalty(tokenId, to, royaltyFeeNumerator);
        }

        ipfsSecretCids[tokenId] = secretCid;
        contentPayloadHashes[tokenId] = payloadHash;

        emit ContentMinted(tokenId, to, secretCid);
    }

    function verifyContentAccess(uint256 tokenId, address viewer) external view returns (bool) {
        return ownerOf(tokenId) == viewer;
    }

    function supportsInterface(bytes4 interfaceId)
        public
        view
        override(ERC721URIStorage, ERC2981)
        returns (bool)
    {
        return super.supportsInterface(interfaceId);
    }
}`,
    initialReport: {
      contractName: 'ERC721ContentToken.sol',
      securityScore: 94,
      summary: 'Standard ERC-721 and EIP-2981 compliance verified. Interface checks match ERC-165 specifications. Ready for production.',
      metrics: {
        criticalCount: 0,
        highCount: 0,
        mediumCount: 0,
        lowCount: 1,
        gasCount: 1,
      },
      findings: [
        {
          id: 'LOW-002',
          title: 'Consider Ownable2Step for Safe Ownership Transfer',
          severity: 'LOW',
          line: 12,
          description: 'Single-step ownership transfers can result in permanent loss of administrative access if transferred to an incorrect address.',
          recommendation: 'Upgrade from Ownable to OpenZeppelin Ownable2Step.',
          codeSnippet: 'contract ERC721ContentToken is ERC721URIStorage, ERC2981, Ownable',
        },
      ],
      mainnetReadiness: {
        isReady: true,
        blockingIssues: [],
      },
    },
    patchedReport: {
      contractName: 'ERC721ContentToken.sol (Hardened)',
      securityScore: 99,
      summary: 'Contract upgraded to Ownable2Step. Zero security warnings.',
      metrics: {
        criticalCount: 0,
        highCount: 0,
        mediumCount: 0,
        lowCount: 0,
        gasCount: 0,
      },
      findings: [],
      mainnetReadiness: {
        isReady: true,
        blockingIssues: [],
      },
    },
  },
  {
    id: 'auction-engine',
    name: 'AuctionEngine',
    fileName: 'AuctionEngine.sol',
    description: 'English ascending reserve auctions and Dutch price-decay engine with automated escrow release.',
    compilerVersion: '0.8.24',
    byteCodeSizeKb: 16.2,
    isPatched: false,
    sourceCode: `// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC721/IERC721.sol";

contract AuctionEngine {
    struct Auction {
        address seller;
        uint256 reservePrice;
        uint256 highestBid;
        address highestBidder;
        uint256 endTime;
        bool settled;
    }

    mapping(uint256 => Auction) public auctions;
    mapping(address => uint256) public refunds;

    function createAuction(uint256 tokenId, uint256 reservePrice, uint256 duration) external {
        auctions[tokenId] = Auction({
            seller: msg.sender,
            reservePrice: reservePrice,
            highestBid: 0,
            highestBidder: address(0),
            endTime: block.timestamp + duration,
            settled: false
        });
    }

    function placeBid(uint256 tokenId) external payable {
        Auction storage auction = auctions[tokenId];
        require(block.timestamp < auction.endTime, "Auction ended");
        require(msg.value > auction.highestBid, "Bid too low");

        if (auction.highestBidder != address(0)) {
            // [VULN: Push payment in bid loop susceptible to DoS / Gas Griefing]
            payable(auction.highestBidder).transfer(auction.highestBid);
        }

        auction.highestBid = msg.value;
        auction.highestBidder = msg.sender;
    }
}`,
    patchedCode: `// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

contract AuctionEngine is ReentrancyGuard {
    struct Auction {
        address seller;
        uint256 reservePrice;
        uint256 highestBid;
        address highestBidder;
        uint256 endTime;
        bool settled;
    }

    mapping(uint256 => Auction) public auctions;
    mapping(address => uint256) public pendingReturns;

    event BidPlaced(uint256 indexed tokenId, address indexed bidder, uint256 amount);
    event RefundClaimed(address indexed bidder, uint256 amount);

    function createAuction(uint256 tokenId, uint256 reservePrice, uint256 duration) external nonReentrant {
        require(duration >= 300, "Duration minimum 5 minutes");
        auctions[tokenId] = Auction({
            seller: msg.sender,
            reservePrice: reservePrice,
            highestBid: 0,
            highestBidder: address(0),
            endTime: block.timestamp + duration,
            settled: false
        });
    }

    /// @notice Fixed with Pull-over-Push refund pattern to eliminate denial-of-service
    function placeBid(uint256 tokenId) external payable nonReentrant {
        Auction storage auction = auctions[tokenId];
        require(block.timestamp < auction.endTime, "Auction ended");
        require(msg.value >= auction.reservePrice, "Below reserve price");
        require(msg.value > auction.highestBid, "Bid too low");

        if (auction.highestBidder != address(0)) {
            // Credit previous bidder via pull pattern
            pendingReturns[auction.highestBidder] += auction.highestBid;
        }

        auction.highestBid = msg.value;
        auction.highestBidder = msg.sender;

        emit BidPlaced(tokenId, msg.sender, msg.value);
    }

    function withdrawRefund() external nonReentrant {
        uint256 refundAmount = pendingReturns[msg.sender];
        require(refundAmount > 0, "No pending refund");

        pendingReturns[msg.sender] = 0;
        (bool success, ) = msg.sender.call{value: refundAmount}("");
        require(success, "Refund transfer failed");

        emit RefundClaimed(msg.sender, refundAmount);
    }
}`,
    initialReport: {
      contractName: 'AuctionEngine.sol',
      securityScore: 56,
      summary: 'High severity DoS (Denial of Service) vector discovered. Direct push refund via transfer() enables malicious bidding smart contracts to reject refunds and block all subsequent higher bids.',
      metrics: {
        criticalCount: 0,
        highCount: 1,
        mediumCount: 1,
        lowCount: 1,
        gasCount: 1,
      },
      findings: [
        {
          id: 'HIGH-002',
          title: 'Push-Payment Denial of Service in Bidding Loop',
          severity: 'HIGH',
          line: 34,
          description: 'Directly transferring funds to the previous highest bidder during placeBid() allows an attacker to bid with a contract that reverts on receive(), making it impossible for anyone else to outbid them.',
          recommendation: 'Refactor to Pull-over-Push pattern where outbid participants withdraw their own refunds separately via withdrawRefund().',
          codeSnippet: 'payable(auction.highestBidder).transfer(auction.highestBid);',
        },
      ],
      mainnetReadiness: {
        isReady: false,
        blockingIssues: ['Denial of Service vector in placeBid() prevents auction progression'],
      },
    },
    patchedReport: {
      contractName: 'AuctionEngine.sol (Hardened)',
      securityScore: 97,
      summary: 'Pull-over-Push refund architecture implemented. DoS vulnerability resolved.',
      metrics: {
        criticalCount: 0,
        highCount: 0,
        mediumCount: 0,
        lowCount: 0,
        gasCount: 1,
      },
      findings: [],
      mainnetReadiness: {
        isReady: true,
        blockingIssues: [],
      },
    },
  },
];
