import React, { useState } from 'react';
import { Header } from './components/Header';
import { MarketplaceView } from './components/MarketplaceView';
import { AuditorView } from './components/AuditorView';
import { FeatureStudioView } from './components/FeatureStudioView';
import { MainnetPipelineView } from './components/MainnetPipelineView';
import { WalletModal } from './components/WalletModal';
import { MintModal } from './components/MintModal';
import { 
  NFTContentItem, 
  WalletState, 
  AuditContract, 
  FeatureModule, 
  DeployedContract 
} from './types/web3';
import { INITIAL_NFT_ITEMS, INITIAL_FEATURE_MODULES, SUPPORTED_CHAINS } from './data/mockData';
import { INITIAL_CONTRACTS } from './data/contracts';
import { Check, Info } from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState<'marketplace' | 'auditor' | 'features' | 'pipeline'>('marketplace');

  // Wallet State
  const [wallet, setWallet] = useState<WalletState>({
    isConnected: true,
    address: '0x71C94a6b16e8A91Fe1308a404Fe17E8687f8649b',
    ensName: 'soundarchitect.eth',
    chainId: 1,
    networkName: 'Ethereum Mainnet',
    balanceEth: 4.85,
    balanceUsdc: 14250,
    ownedTokenIds: [104], // Alice owns item #104
  });

  // NFT Items
  const [items, setItems] = useState<NFTContentItem[]>(INITIAL_NFT_ITEMS);

  // Contracts
  const [contracts, setContracts] = useState<AuditContract[]>(INITIAL_CONTRACTS);

  // Modular Features
  const [features, setFeatures] = useState<FeatureModule[]>(INITIAL_FEATURE_MODULES);

  // Deployed Contracts & Active Contract
  const [deployedHistory, setDeployedHistory] = useState<DeployedContract[]>([
    {
      timestamp: Date.now() - 86400000 * 3,
      contractName: 'ERC721ContentToken',
      address: '0x3Af42F7969E3a954B514f7d49826d9c6eC229081',
      txHash: '0x9a8b7c6d5e4f3a2b1c0d9e8f7a6b5c4d3e2f1a0b9c8d7e6f5a4b3c2d1e0f8190',
      chainId: 1,
      chainName: 'Ethereum Mainnet',
      gasUsed: 1420100,
      deployer: '0x71C94a6b16e8A91Fe1308a404Fe17E8687f8649b',
    },
  ]);
  const [activeDeployedContractAddress, setActiveDeployedContractAddress] = useState<string>(
    '0x3Af42F7969E3a954B514f7d49826d9c6eC229081'
  );

  // Modals
  const [isWalletModalOpen, setIsWalletModalOpen] = useState<boolean>(false);
  const [isMintModalOpen, setIsMintModalOpen] = useState<boolean>(false);

  // Toast notifications
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Switch Wallet Account Persona
  const handleSwitchAccount = (address: string, ensName: string) => {
    setWallet((prev) => {
      // Find items owned by this address
      const owned = items
        .filter((i) => i.ownerAddress.toLowerCase() === address.toLowerCase())
        .map((i) => i.tokenId);

      return {
        ...prev,
        address,
        ensName,
        ownedTokenIds: owned,
      };
    });
    showToast(`Switched account to ${ensName || address.slice(0, 8)}...`);
  };

  // Switch Network
  const handleSwitchNetwork = (chainId: number) => {
    const chain = SUPPORTED_CHAINS.find((c) => c.id === chainId) || SUPPORTED_CHAINS[0];
    setWallet((prev) => ({
      ...prev,
      chainId,
      networkName: chain.name,
    }));
    showToast(`Switched network to ${chain.name}`);
  };

  // Faucet
  const handleFundFaucet = () => {
    setWallet((prev) => ({
      ...prev,
      balanceEth: prev.balanceEth + 2.0,
      balanceUsdc: prev.balanceUsdc + 5000,
    }));
    showToast('Faucet claimed: +2.0 ETH and +5,000 USDC added to wallet!');
  };

  // Buy NFT Item
  const handleBuyItem = (item: NFTContentItem) => {
    if (wallet.balanceEth < item.priceEth) {
      showToast('Insufficient ETH balance for purchase.');
      return;
    }

    setWallet((prev) => ({
      ...prev,
      balanceEth: prev.balanceEth - item.priceEth - 0.0024,
      ownedTokenIds: [...prev.ownedTokenIds, item.tokenId],
    }));

    setItems((prev) =>
      prev.map((i) =>
        i.id === item.id
          ? {
              ...i,
              ownerAddress: wallet.address,
              tokenGatedPayload: {
                ...i.tokenGatedPayload,
                isLocked: false,
              },
            }
          : i
      )
    );

    showToast(`Purchased "${item.title}". Token #${item.tokenId} decrypted in your vault!`);
  };

  // Place Bid on Auction
  const handlePlaceBid = (item: NFTContentItem, bidAmount: number) => {
    if (wallet.balanceEth < bidAmount) {
      showToast('Insufficient ETH balance for bid.');
      return;
    }

    setWallet((prev) => ({
      ...prev,
      balanceEth: prev.balanceEth - bidAmount,
    }));

    setItems((prev) =>
      prev.map((i) => {
        if (i.id === item.id && i.auction) {
          const newBid = {
            bidder: wallet.ensName || `${wallet.address.slice(0, 6)}...${wallet.address.slice(-4)}`,
            amount: bidAmount,
            timestamp: Date.now(),
            txHash: `0x${Math.random().toString(16).substring(2, 10)}...${Math.random().toString(16).substring(2, 6)}`,
          };
          return {
            ...i,
            auction: {
              ...i.auction,
              highestBid: bidAmount,
              highestBidder: wallet.address,
              bidCount: i.auction.bidCount + 1,
              bids: [newBid, ...i.auction.bids],
            },
          };
        }
        return i;
      })
    );

    showToast(`Bid of ${bidAmount} ETH placed successfully on "${item.title}"!`);
  };

  // Mint Content NFT
  const handleMintSuccess = (newItem: NFTContentItem) => {
    setItems((prev) => [newItem, ...prev]);
    setWallet((prev) => ({
      ...prev,
      ownedTokenIds: [...prev.ownedTokenIds, newItem.tokenId],
      balanceEth: prev.balanceEth - 0.0018,
    }));
    showToast(`Minted "${newItem.title}" (#${newItem.tokenId}). Token-gated master payload active!`);
    setActiveTab('marketplace');
  };

  // Patch Contract
  const handlePatchContract = (contractId: string) => {
    setContracts((prev) =>
      prev.map((c) =>
        c.id === contractId
          ? {
              ...c,
              isPatched: true,
            }
          : c
      )
    );
    showToast('Applied ReentrancyGuard mutex & Checks-Effects-Interactions patch. Security score: 98/100!');
  };

  // Reset Contract to Vulnerable
  const handleResetContract = (contractId: string) => {
    setContracts((prev) =>
      prev.map((c) =>
        c.id === contractId
          ? {
              ...c,
              isPatched: false,
            }
          : c
      )
    );
    showToast('Reset contract to vulnerable pre-audit state.');
  };

  // Toggle Feature Module
  const handleToggleFeature = (featureId: string) => {
    setFeatures((prev) =>
      prev.map((f) =>
        f.id === featureId
          ? {
              ...f,
              enabled: !f.enabled,
            }
          : f
      )
    );
  };

  // Deploy Contract to Mainnet
  const handleDeployContract = (newDeployment: DeployedContract) => {
    setDeployedHistory((prev) => [newDeployment, ...prev]);
    setActiveDeployedContractAddress(newDeployment.address);
    showToast(`Contract deployed to ${newDeployment.chainName}! Address: ${newDeployment.address}`);
  };

  return (
    <div className="min-h-screen bg-[#080c14] text-slate-100 flex flex-col selection:bg-cyan-500/30 selection:text-cyan-200">
      {/* Top Bar Navigation */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        wallet={wallet}
        onOpenWalletModal={() => setIsWalletModalOpen(true)}
        onOpenMintModal={() => setIsMintModalOpen(true)}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 pt-6">
        {activeTab === 'marketplace' && (
          <MarketplaceView
            items={items}
            wallet={wallet}
            onBuyItem={handleBuyItem}
            onPlaceBid={handlePlaceBid}
            onOpenMintModal={() => setIsMintModalOpen(true)}
          />
        )}

        {activeTab === 'auditor' && (
          <AuditorView
            contracts={contracts}
            onPatchContract={handlePatchContract}
            onResetContract={handleResetContract}
          />
        )}

        {activeTab === 'features' && (
          <FeatureStudioView
            features={features}
            onToggleFeature={handleToggleFeature}
          />
        )}

        {activeTab === 'pipeline' && (
          <MainnetPipelineView
            wallet={wallet}
            contracts={contracts}
            onDeployContract={handleDeployContract}
            deployedHistory={deployedHistory}
            activeDeployedContractAddress={activeDeployedContractAddress}
            onSetActiveContract={(addr) => {
              setActiveDeployedContractAddress(addr);
              showToast(`Updated active marketplace contract to ${addr}`);
            }}
            onNavigateToAuditor={() => setActiveTab('auditor')}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-900 bg-[#060910] py-6 px-6 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="font-semibold text-slate-400">Aetheria Protocol</span>
            <span aria-hidden="true">·</span>
            <span>EIP-721 Token-Gated Content Standard</span>
            <span aria-hidden="true">·</span>
            <span>EIP-2981 Creator Royalties</span>
          </div>
          <div className="flex items-center gap-4 text-[11px] text-slate-500">
            <span>Solc 0.8.24 via-IR</span>
            <span aria-hidden="true">·</span>
            <span>OpenZeppelin Contracts v5.0</span>
          </div>
        </div>
      </footer>

      {/* Modals */}
      <WalletModal
        isOpen={isWalletModalOpen}
        onClose={() => setIsWalletModalOpen(false)}
        wallet={wallet}
        onSwitchAccount={handleSwitchAccount}
        onSwitchNetwork={handleSwitchNetwork}
        onFundFaucet={handleFundFaucet}
      />

      <MintModal
        isOpen={isMintModalOpen}
        onClose={() => setIsMintModalOpen(false)}
        wallet={wallet}
        onMintSuccess={handleMintSuccess}
      />

      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 p-3.5 bg-slate-900/95 border border-cyan-500/50 rounded-xl shadow-2xl text-xs text-white flex items-center gap-2.5 backdrop-blur-md animate-in slide-in-from-bottom-3 duration-200">
          <Check className="w-4 h-4 text-cyan-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}
    </div>
  );
}
