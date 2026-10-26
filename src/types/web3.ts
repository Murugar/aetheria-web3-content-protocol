export type ContentType = 'audio' | 'research' | '3d_model' | 'visual_art' | 'code_license';

export interface TokenGatedPayload {
  isLocked: boolean;
  secretCid: string;
  decryptionKey: string;
  lockedMessage: string;
  unlockedContent: {
    heading: string;
    description: string;
    downloadFiles: Array<{
      name: string;
      size: string;
      format: string;
      hash: string;
    }>;
    secretKeySnippet?: string;
    rawTextExcerpt?: string;
  };
}

export interface AuctionDetails {
  highestBid: number;
  highestBidder?: string;
  reservePrice: number;
  minBidIncrement: number;
  endsAt: number; // timestamp
  bidCount: number;
  bids: Array<{
    bidder: string;
    amount: number;
    timestamp: number;
    txHash: string;
  }>;
}

export interface NFTContentItem {
  id: string;
  tokenId: number;
  contractAddress: string;
  title: string;
  contentType: ContentType;
  creatorName: string;
  creatorAddress: string;
  ownerAddress: string;
  priceEth: number;
  priceUsdc: number;
  coverImage: string;
  description: string;
  tags: string[];
  royaltyPercent: number; // EIP-2981 percentage, e.g. 5.0
  tokenStandard: 'ERC-721' | 'ERC-1155';
  isAuction: boolean;
  auction?: AuctionDetails;
  tokenGatedPayload: TokenGatedPayload;
  mintedAt: string;
  viewsCount: number;
  likesCount: number;
}

export interface WalletState {
  isConnected: boolean;
  address: string;
  ensName?: string;
  chainId: number;
  networkName: string;
  balanceEth: number;
  balanceUsdc: number;
  ownedTokenIds: number[];
}

export type SeverityLevel = 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW' | 'GAS';

export interface AuditFinding {
  id: string;
  title: string;
  severity: SeverityLevel;
  line: number;
  description: string;
  recommendation: string;
  codeSnippet: string;
}

export interface AuditReport {
  contractName: string;
  securityScore: number;
  summary: string;
  metrics: {
    criticalCount: number;
    highCount: number;
    mediumCount: number;
    lowCount: number;
    gasCount: number;
  };
  findings: AuditFinding[];
  mainnetReadiness: {
    isReady: boolean;
    blockingIssues: string[];
  };
}

export interface AuditContract {
  id: string;
  name: string;
  fileName: string;
  description: string;
  sourceCode: string;
  patchedCode: string;
  isPatched: boolean;
  byteCodeSizeKb: number;
  compilerVersion: string;
  initialReport: AuditReport;
  patchedReport: AuditReport;
}

export interface FeatureModule {
  id: string;
  title: string;
  eipStandard: string;
  category: 'Security' | 'Monetization' | 'Access Control' | 'Scalability';
  summary: string;
  enabled: boolean;
  gasImpact: string;
  solidityCode: string;
  unitTests: Array<{
    name: string;
    description: string;
    status: 'idle' | 'running' | 'passed' | 'failed';
    gasUsed?: number;
  }>;
}

export interface ChainConfig {
  id: number;
  name: string;
  symbol: string;
  rpcUrl: string;
  blockExplorer: string;
  iconColor: string;
  avgGasGwei: number;
}

export interface DeployedContract {
  timestamp: number;
  contractName: string;
  address: string;
  txHash: string;
  chainId: number;
  chainName: string;
  gasUsed: number;
  deployer: string;
}
