import { NFTContentItem, FeatureModule, ChainConfig } from '../types/web3';

export const SUPPORTED_CHAINS: ChainConfig[] = [
  {
    id: 1,
    name: 'Ethereum Mainnet',
    symbol: 'ETH',
    rpcUrl: 'https://eth-mainnet.g.alchemy.com/v2/demo',
    blockExplorer: 'https://etherscan.io',
    iconColor: '#627EEA',
    avgGasGwei: 18,
  },
  {
    id: 42161,
    name: 'Arbitrum One',
    symbol: 'ETH',
    rpcUrl: 'https://arb1.arbitrum.io/rpc',
    blockExplorer: 'https://arbiscan.io',
    iconColor: '#28A0F0',
    avgGasGwei: 0.1,
  },
  {
    id: 8453,
    name: 'Base',
    symbol: 'ETH',
    rpcUrl: 'https://mainnet.base.org',
    blockExplorer: 'https://basescan.org',
    iconColor: '#0052FF',
    avgGasGwei: 0.05,
  },
  {
    id: 137,
    name: 'Polygon PoS',
    symbol: 'POL',
    rpcUrl: 'https://polygon-rpc.com',
    blockExplorer: 'https://polygonscan.com',
    iconColor: '#8247E5',
    avgGasGwei: 28,
  },
  {
    id: 11155111,
    name: 'Sepolia Testnet',
    symbol: 'SepoliaETH',
    rpcUrl: 'https://rpc.sepolia.org',
    blockExplorer: 'https://sepolia.etherscan.io',
    iconColor: '#10B981',
    avgGasGwei: 1.2,
  },
];

export const INITIAL_NFT_ITEMS: NFTContentItem[] = [
  {
    id: 'nft-001',
    tokenId: 104,
    contractAddress: '0x3Af42F7969E3a954B514f7d49826d9c6eC229081',
    title: 'Auralys Synapse — Master Stem Vault',
    contentType: 'audio',
    creatorName: 'SoundArchitect.eth',
    creatorAddress: '0x71C94a6b16e8A91Fe1308a404Fe17E8687f8649b',
    ownerAddress: '0x71C94a6b16e8A91Fe1308a404Fe17E8687f8649b', // creator owns it currently
    priceEth: 0.85,
    priceUsdc: 2450,
    coverImage: '/src/assets/images/nft_cyber_audio_matrix_1793010944101.jpg',
    description: 'A 24-bit 96kHz cyber-acoustic electronic symphony encoded with procedural granular synthesizers. Token ownership unlocks exclusive access to uncompressed multi-track audio stems, MIDI arrangements, and commercial synchronization clearance.',
    tags: ['Electronic', 'Spatial Audio', 'Stem Vault', 'Sync License'],
    royaltyPercent: 7.5,
    tokenStandard: 'ERC-721',
    isAuction: false,
    tokenGatedPayload: {
      isLocked: true,
      secretCid: 'ipfs://bafybeicg4w555pvh2uukr7j427g7fq3q23v6a7t7yv5e4g5r4p6',
      decryptionKey: '0x8f2a99c4d2e1b8a734f0e6918c57291a4b783c21',
      lockedMessage: 'Exclusive content locked. Connect authorized wallet holding NFT #104 to decrypt multi-track stems and synchronization license.',
      unlockedContent: {
        heading: 'Master Audio Stem Package & Commercial Sync License',
        description: 'Verification successful. Your cryptographic wallet signature has decrypted the private IPFS storage cluster.',
        downloadFiles: [
          { name: '01_Kick_Sub_808.wav', size: '48.2 MB', format: 'WAV 96kHz/24-Bit', hash: 'QmXoypizjW3WknFiJnKLwHCnL72vedxjQkDDP1mXWo6uco' },
          { name: '02_Granular_Synths_Master.flac', size: '112.5 MB', format: 'FLAC Lossless', hash: 'QmZtmD2qt8SJ9BvD442G4d36sJd5E17mB2J98H1x7hGq6' },
          { name: '03_Acoustic_Vocals_Dry.wav', size: '74.1 MB', format: 'WAV 96kHz/24-Bit', hash: 'QmPZ9gcCEpqKTo6aq61g2nXGUhM49wbdukVaTeBRCEofma' },
          { name: 'Commercial_Sync_License_Agreement.pdf', size: '2.4 MB', format: 'Cryptographically Signed PDF', hash: 'QmUNLLsPACCz1vLxQVkXqqLX5R1X3255kuCXypZ5R7845' },
        ],
        secretKeySnippet: 'AES256-GCM::SHA256:7b91d29fa8a002bc923e4f71a067',
        rawTextExcerpt: 'Commercial Sync Grant: Global non-exclusive synchronization license granted to holder of token #104 on Ethereum Contract 0x3Af42F7969E3a954B514f7d49826d9c6eC229081.',
      },
    },
    mintedAt: '2026-10-21',
    viewsCount: 1420,
    likesCount: 88,
  },
  {
    id: 'nft-002',
    tokenId: 219,
    contractAddress: '0x3Af42F7969E3a954B514f7d49826d9c6eC229081',
    title: 'Arcana zk-SNARK: Sub-Linear Proof Verification',
    contentType: 'research',
    creatorName: 'Dr. Elena Vance',
    creatorAddress: '0x94B8f0E72C411e7456d354a8C42E8D3970E91523',
    ownerAddress: '0x94B8f0E72C411e7456d354a8C42E8D3970E91523',
    priceEth: 1.40,
    priceUsdc: 4050,
    coverImage: '/src/assets/images/nft_crypto_research_codex_1793010944587.jpg',
    description: 'A 42-page peer-reviewed cryptography manuscript establishing novel zero-knowledge polynomial commitments with $O(\\log^2 n)$ verification overhead. Includes full LaTeX source files, benchmark circuit synthesis code in Rust, and formal verification proofs.',
    tags: ['Cryptography', 'zk-SNARK', 'Research', 'Rust Benchmarks'],
    royaltyPercent: 5.0,
    tokenStandard: 'ERC-721',
    isAuction: true,
    auction: {
      highestBid: 1.65,
      highestBidder: '0x5B38Da6a701c568545dCfcB03FcB875f56beddC4',
      reservePrice: 1.20,
      minBidIncrement: 0.05,
      endsAt: Date.now() + 86400000 * 2.5, // 2.5 days left
      bidCount: 7,
      bids: [
        { bidder: '0x5B38...ddC4', amount: 1.65, timestamp: Date.now() - 3600000 * 2, txHash: '0x9c3d...4b82' },
        { bidder: '0x12F8...8931', amount: 1.55, timestamp: Date.now() - 3600000 * 8, txHash: '0x7e2a...19ef' },
        { bidder: '0x88Ca...10c2', amount: 1.40, timestamp: Date.now() - 3600000 * 18, txHash: '0x3b1c...99a0' },
      ],
    },
    tokenGatedPayload: {
      isLocked: true,
      secretCid: 'ipfs://bafybeihdwdcefgh4dqjqwerty4567890abcdef123456789',
      decryptionKey: '0x1c4490f230b889e1a5f45812e9bca9376189',
      lockedMessage: 'Manuscript LaTeX sources, Rust circuits, and Coq verification proof scripts are token-gated.',
      unlockedContent: {
        heading: 'Complete Academic Manuscript & Coq Formal Verification Proofs',
        description: 'Decrypted verified repository for Arcana zk-SNARK polynomial commitments.',
        downloadFiles: [
          { name: 'arcana_zk_manuscript_complete.pdf', size: '14.8 MB', format: 'Full 42-Page Academic PDF', hash: 'QmR7n8bC7qLz3kQ4r8wT2yJ6hP5vM9sK3xF1bZ4wE6uN8' },
          { name: 'rust_arkworks_circuits.tar.gz', size: '68.4 MB', format: 'Cargo Workspace & Benchmarks', hash: 'QmW2b8rY6mN4jP7tK9vC3xL1qF5zB8hT2sE4uD6wJ8' },
          { name: 'coq_formal_soundness_proofs.v', size: '4.2 MB', format: 'Coq 8.18 Proof Script', hash: 'QmY9vK3xL1qF5zB8hT2sE4uD6wJ8mN4jP7tW2b8rY6' },
        ],
        secretKeySnippet: 'ED25519-PRIVKEY::d4c728e9a61b8f0412354789abceeff0',
        rawTextExcerpt: 'Theorem 4.1 (Computational Zero-Knowledge): For every non-uniform polynomial-time adversary A, the distribution of simulated transcripts is statistically indistinguishable from genuine prover evaluations with error epsilon < 2^-128.',
      },
    },
    mintedAt: '2026-10-18',
    viewsCount: 2890,
    likesCount: 174,
  },
  {
    id: 'nft-003',
    tokenId: 312,
    contractAddress: '0x3Af42F7969E3a954B514f7d49826d9c6eC229081',
    title: 'Hyperion Core V8 — 3D Mechanical Assembly',
    contentType: '3d_model',
    creatorName: 'VoxelForge Studios',
    creatorAddress: '0x12F81A5E9d39c08B739023B06Eb1C41232888931',
    ownerAddress: '0x12F81A5E9d39c08B739023B06Eb1C41232888931',
    priceEth: 2.10,
    priceUsdc: 6100,
    coverImage: '/src/assets/images/nft_hyperion_mech_render_1793010945934.jpg',
    description: 'A 4.2 million polygon industrial biomechanical propulsion core. Engineered with physically based materials, kinematic hydraulic piston rigging, and ready for Unreal Engine 5 Nanite integration.',
    tags: ['3D Asset', 'Unreal Engine 5', 'Rigged', 'PBR 8K'],
    royaltyPercent: 8.0,
    tokenStandard: 'ERC-721',
    isAuction: false,
    tokenGatedPayload: {
      isLocked: true,
      secretCid: 'ipfs://bafybeid6789abcdefghij0123456789abcdefghij0123456',
      decryptionKey: '0x43ff9981a21e4b889c2014782bbcd88390',
      lockedMessage: 'High-poly production CAD package and 8K UDIM texture sets are locked to NFT owners.',
      unlockedContent: {
        heading: 'Hyperion V8 Production Asset Archive (CAD + UE5 Project)',
        description: 'Complete commercial 3D asset package with full commercial reproduction and distribution rights.',
        downloadFiles: [
          { name: 'hyperion_v8_rigged_assembly.fbx', size: '245 MB', format: 'Rigged FBX with Inverse Kinematics', hash: 'QmZ9wE6uN8rY6mN4jP7tK9vC3xL1qF5zB8hT2sE4uD6' },
          { name: 'pbr_8k_udim_textures.zip', size: '1.42 GB', format: 'EXR 32-bit & PNG 16-bit PBR Maps', hash: 'QmX1bZ4wE6uN8rY6mN4jP7tK9vC3xL1qF5zB8hT2sE' },
          { name: 'unreal_engine_5_project.zip', size: '3.18 GB', format: 'UE5.4 Project with Lumen Shaders', hash: 'QmT2sE4uD6wJ8mN4jP7tW2b8rY6QmY9vK3xL1qF5zB' },
        ],
        secretKeySnippet: 'IPFS-GATEWAY-AUTH::Bearer-token-v8-99e82110c',
        rawTextExcerpt: 'Commercial Asset License: Unlimited royalty-free worldwide distribution in interactive video games, cinematic films, and spatial applications.',
      },
    },
    mintedAt: '2026-10-15',
    viewsCount: 3410,
    likesCount: 231,
  },
  {
    id: 'nft-004',
    tokenId: 405,
    contractAddress: '0x3Af42F7969E3a954B514f7d49826d9c6eC229081',
    title: 'Quantum Dispersion Canvas #042',
    contentType: 'visual_art',
    creatorName: 'Kira Sol',
    creatorAddress: '0x88Ca4312675908eA217c093aC33857e5101a10c2',
    ownerAddress: '0x88Ca4312675908eA217c093aC33857e5101a10c2',
    priceEth: 0.65,
    priceUsdc: 1880,
    coverImage: '/src/assets/images/nft_aurora_algorithmic_canvas_1793010944086.jpg',
    description: 'An interactive generative fluid dynamics canvas computed with WebGL 2.0 fragment shaders. The visual state morphs continuously based on real-time Ethereum block hash entropy.',
    tags: ['Generative Art', 'GLSL Shader', 'Dynamic NFT', '16K Master'],
    royaltyPercent: 6.0,
    tokenStandard: 'ERC-721',
    isAuction: false,
    tokenGatedPayload: {
      isLocked: true,
      secretCid: 'ipfs://bafybeif1234567890abcdefghij1234567890abcdefghij',
      decryptionKey: '0x7e88912ba091c532ef880129a00823c714',
      lockedMessage: 'Raw GLSL shader source code, vector master file, and museum print certificate locked.',
      unlockedContent: {
        heading: 'Generative Shader Source & 16K Master Print Files',
        description: 'Verified access to authentic procedural source code and museum archival certificate.',
        downloadFiles: [
          { name: 'quantum_dispersion_fragment.glsl', size: '124 KB', format: 'WebGL 2.0 GLSL Shader Script', hash: 'QmF5zB8hT2sE4uD6wJ8mN4jP7tW2b8rY6QmY9vK3xL1' },
          { name: 'canvas_vector_master_16k.tiff', size: '380 MB', format: '16K Ultra-Res 16-bit TIFF', hash: 'QmL1qF5zB8hT2sE4uD6wJ8mN4jP7tW2b8rY6QmY9vK3' },
          { name: 'archival_print_certificate.pdf', size: '3.1 MB', format: 'Hahnemuhle Certified Token', hash: 'QmH1x7hGq6ZtmD2qt8SJ9BvD442G4d36sJd5E17mB2' },
        ],
        secretKeySnippet: 'GLSL-SEED::0x8f2d4e8b991c0451a92e633d7b00',
        rawTextExcerpt: 'precision highp float; uniform vec2 u_resolution; uniform float u_time; uniform bytes32 u_block_entropy; // Real-time generative dispersion engine',
      },
    },
    mintedAt: '2026-10-24',
    viewsCount: 1980,
    likesCount: 145,
  },
];

export const INITIAL_FEATURE_MODULES: FeatureModule[] = [
  {
    id: 'feat-royalty-splitter',
    title: 'EIP-2981 Multi-Recipient Royalty Splitter',
    eipStandard: 'EIP-2981 / EIP-2981 Splitter',
    category: 'Monetization',
    summary: 'Trustless on-chain distribution of secondary marketplace royalties across multiple creator addresses (e.g. Lead Artist 70%, Audio Engineer 20%, Community Treasury 10%).',
    enabled: true,
    gasImpact: '+18,400 gas on settlement',
    solidityCode: `// EIP-2981 Multi-Recipient Splitter
struct RoyaltyShare {
    address payable recipient;
    uint256 basisPoints; // e.g. 7000 = 70%
}

mapping(uint256 => RoyaltyShare[]) public tokenRoyaltySplits;

function setTokenRoyaltySplits(
    uint256 tokenId,
    RoyaltyShare[] calldata shares
) external onlyOwner {
    delete tokenRoyaltySplits[tokenId];
    uint256 total = 0;
    for (uint256 i = 0; i < shares.length; i++) {
        total += shares[i].basisPoints;
        tokenRoyaltySplits[tokenId].push(shares[i]);
    }
    require(total == 10000, "Split must sum to 100%");
}

function distributeRoyalties(uint256 tokenId) external payable nonReentrant {
    RoyaltyShare[] storage shares = tokenRoyaltySplits[tokenId];
    for (uint256 i = 0; i < shares.length; i++) {
        uint256 shareAmount = (msg.value * shares[i].basisPoints) / 10000;
        (bool s, ) = shares[i].recipient.call{value: shareAmount}("");
        require(s, "Royalty split transfer failed");
    }
}`,
    unitTests: [
      { name: 'test_royalty_split_sum_invariance()', description: 'Reverts if basis points do not equal exactly 10,000 (100%)', status: 'passed', gasUsed: 42100 },
      { name: 'test_zero_address_split_rejection()', description: 'Prevents sending royalty shares to 0x0 blackhole', status: 'passed', gasUsed: 29400 },
      { name: 'test_multi_recipient_payout_math()', description: 'Verifies exact wei allocation to 3 distinct recipients without rounding drift', status: 'passed', gasUsed: 68900 },
    ],
  },
  {
    id: 'feat-dutch-auction',
    title: 'Linear Time-Decay Dutch Auction Engine',
    eipStandard: 'Custom Auction Extension',
    category: 'Monetization',
    summary: 'Automated price discovery that smoothly decays price from startPrice down to reserveFloor over auctionDuration, preventing bidding wars and gas spikes.',
    enabled: true,
    gasImpact: '+12,200 gas on listing',
    solidityCode: `// Linear Price-Decay Dutch Auction
struct DutchAuction {
    uint256 startPrice;
    uint256 reserveFloor;
    uint256 startTime;
    uint256 duration;
}

mapping(uint256 => DutchAuction) public dutchAuctions;

function getCurrentDutchPrice(uint256 tokenId) public view returns (uint256) {
    DutchAuction storage a = dutchAuctions[tokenId];
    if (block.timestamp <= a.startTime) return a.startPrice;
    uint256 elapsed = block.timestamp - a.startTime;
    if (elapsed >= a.duration) return a.reserveFloor;

    uint256 totalDrop = a.startPrice - a.reserveFloor;
    uint256 currentDrop = (totalDrop * elapsed) / a.duration;
    return a.startPrice - currentDrop;
}

function buyDutchItem(uint256 tokenId) external payable nonReentrant {
    uint256 currentPrice = getCurrentDutchPrice(tokenId);
    require(msg.value >= currentPrice, "Bid below current decay price");
    // Settle purchase and refund excess
}`,
    unitTests: [
      { name: 'test_dutch_price_decay_slope()', description: 'Validates accurate linear descent at 25%, 50%, and 75% elapsed timestamps', status: 'passed', gasUsed: 31200 },
      { name: 'test_reserve_floor_never_breached()', description: 'Ensures price remains clamped at reserveFloor after expiration', status: 'passed', gasUsed: 24800 },
      { name: 'test_buyer_excess_refund()', description: 'Verifies buyer is immediately refunded difference if msg.value exceeds current decay price', status: 'passed', gasUsed: 52100 },
    ],
  },
  {
    id: 'feat-lazy-minting',
    title: 'Off-Chain EIP-712 Lazy Minting Voucher',
    eipStandard: 'EIP-712 Typed Structured Signatures',
    category: 'Scalability',
    summary: 'Creators sign an EIP-712 cryptographic voucher off-chain without spending any gas. The NFT is minted on-chain only when the buyer executes the purchase transaction.',
    enabled: true,
    gasImpact: '-85% creator minting gas saved',
    solidityCode: `// EIP-712 Lazy Minting Voucher
struct NFTVoucher {
    uint256 tokenId;
    uint256 minPrice;
    string uri;
    string secretCid;
    bytes signature;
}

bytes32 public constant VOUCHER_TYPEHASH = keccak256(
    "NFTVoucher(uint256 tokenId,uint256 minPrice,string uri,string secretCid)"
);

function redeemLazyMint(
    NFTVoucher calldata voucher,
    address creator
) external payable nonReentrant returns (uint256) {
    bytes32 digest = _hashTypedDataV4(keccak256(abi.encode(
        VOUCHER_TYPEHASH,
        voucher.tokenId,
        voucher.minPrice,
        keccak256(bytes(voucher.uri)),
        keccak256(bytes(voucher.secretCid))
    )));

    address signer = ECDSA.recover(digest, voucher.signature);
    require(signer == creator, "Invalid cryptographic voucher signer");
    require(msg.value >= voucher.minPrice, "Insufficient funds to redeem voucher");

    _safeMint(msg.sender, voucher.tokenId);
    _setTokenURI(voucher.tokenId, voucher.uri);
    return voucher.tokenId;
}`,
    unitTests: [
      { name: 'test_eip712_signature_recovery()', description: 'Verifies valid voucher signature recovers correct creator address', status: 'passed', gasUsed: 49800 },
      { name: 'test_tampered_voucher_revert()', description: 'Reverts if voucher payload parameters are modified post-signature', status: 'passed', gasUsed: 27600 },
      { name: 'test_replay_attack_prevention()', description: 'Ensures a redeemed voucher cannot be used twice to double-mint', status: 'passed', gasUsed: 44200 },
    ],
  },
  {
    id: 'feat-soulbound-pass',
    title: 'Soulbound Non-Transferable License Passes',
    eipStandard: 'ERC-5192 Minimal Soulbound NFTs',
    category: 'Access Control',
    summary: 'Restricts content credential transferability so that access licenses cannot be resold or transferred away from the original verified licensee.',
    enabled: false,
    gasImpact: '-3,200 gas (no transfer logic)',
    solidityCode: `// ERC-5192 Soulbound Restriction
interface IERC5192 {
    event Locked(uint256 tokenId);
    event Unlocked(uint256 tokenId);
    function locked(uint256 tokenId) external view returns (bool);
}

mapping(uint256 => bool) private _isLocked;

function locked(uint256 tokenId) external view override returns (bool) {
    require(_ownerOf(tokenId) != address(0), "Token does not exist");
    return _isLocked[tokenId];
}

function _update(address to, uint256 tokenId, address auth) internal override returns (address) {
    address from = _ownerOf(tokenId);
    if (from != address(0) && to != address(0) && _isLocked[tokenId]) {
        revert("ERC5192: Soulbound token cannot be transferred");
    }
    return super._update(to, tokenId, auth);
}`,
    unitTests: [
      { name: 'test_mint_to_soulbound_licensee()', description: 'Verifies successful minting and lock event emission', status: 'passed', gasUsed: 38200 },
      { name: 'test_transfer_revert_when_locked()', description: 'Ensures transferFrom() and safeTransferFrom() revert with ERC5192 custom error', status: 'passed', gasUsed: 22100 },
    ],
  },
  {
    id: 'feat-timelock-governance',
    title: 'UUPS Upgradeability with 48h Timelock',
    eipStandard: 'ERC-1822 UUPS + OpenZeppelin TimelockController',
    category: 'Security',
    summary: 'Decentralizes protocol control by forcing any smart contract logic upgrade or fee parameter shift through a mandatory 48-hour delay window.',
    enabled: false,
    gasImpact: 'Slight deployment overhead',
    solidityCode: `// UUPS Upgradeability & Timelock Guard
import "@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol";

contract MarketplaceV2 is UUPSUpgradeable, OwnableUpgradeable {
    uint256 public constant TIMELOCK_DELAY = 48 hours;
    address public timelockController;

    function _authorizeUpgrade(address newImplementation) internal override {
        require(msg.sender == timelockController, "Only timelock can authorize upgrades");
    }
}`,
    unitTests: [
      { name: 'test_timelock_delay_enforcement()', description: 'Reverts upgrade attempts executed prior to 48h schedule', status: 'passed', gasUsed: 41800 },
      { name: 'test_unauthorized_upgrade_block()', description: 'Blocks non-timelock deployer accounts from executing upgrades', status: 'passed', gasUsed: 28400 },
    ],
  },
];
