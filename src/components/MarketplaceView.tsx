import React, { useState } from 'react';
import { NFTContentItem, WalletState, ContentType } from '../types/web3';
import { 
  Lock, 
  Unlock, 
  Download, 
  ExternalLink, 
  Copy, 
  Check, 
  Search, 
  FileText, 
  Music, 
  Box, 
  Palette, 
  Coins, 
  Flame, 
  ArrowRight, 
  X,
  Clock,
  User,
  ShieldCheck,
  CheckCircle2
} from 'lucide-react';

interface MarketplaceViewProps {
  items: NFTContentItem[];
  wallet: WalletState;
  onBuyItem: (item: NFTContentItem) => void;
  onPlaceBid: (item: NFTContentItem, bidAmount: number) => void;
  onOpenMintModal: () => void;
}

export const MarketplaceView: React.FC<MarketplaceViewProps> = ({
  items,
  wallet,
  onBuyItem,
  onPlaceBid,
  onOpenMintModal,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [sortBy, setSortBy] = useState<'recent' | 'price-asc' | 'price-desc'>('recent');
  const [activeItem, setActiveItem] = useState<NFTContentItem | null>(null);
  const [showBuyModal, setShowBuyModal] = useState<boolean>(false);
  const [showBidModal, setShowBidModal] = useState<boolean>(false);
  const [bidInput, setBidInput] = useState<string>('');
  const [copiedKey, setCopiedKey] = useState<boolean>(false);
  const [downloadSuccessMessage, setDownloadSuccessMessage] = useState<string | null>(null);

  // Filter & Sort
  const filteredItems = items.filter((item) => {
    const matchesCategory = selectedCategory === 'all' || item.contentType === selectedCategory;
    const matchesSearch = 
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.creatorName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.tags.some(t => t.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCategory && matchesSearch;
  }).sort((a, b) => {
    if (sortBy === 'price-asc') return a.priceEth - b.priceEth;
    if (sortBy === 'price-desc') return b.priceEth - a.priceEth;
    return b.tokenId - a.tokenId;
  });

  const isOwner = (item: NFTContentItem) => {
    return (
      item.ownerAddress.toLowerCase() === wallet.address.toLowerCase() ||
      wallet.ownedTokenIds.includes(item.tokenId)
    );
  };

  const handleCopyDecryptionKey = (key: string) => {
    navigator.clipboard.writeText(key);
    setCopiedKey(true);
    setTimeout(() => setCopiedKey(false), 2000);
  };

  const handleTriggerDownload = (fileName: string) => {
    // Simulated authenticated IPFS blob download
    const dummyBlob = new Blob([`Aetheria Decrypted Content: ${fileName}\nSigned Token Holder: ${wallet.address}\nVerification Status: EIP-721 Validated`], { type: 'text/plain' });
    const url = URL.createObjectURL(dummyBlob);
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    setDownloadSuccessMessage(`Decrypted & downloaded: ${fileName}`);
    setTimeout(() => setDownloadSuccessMessage(null), 3000);
  };

  const handleConfirmBid = () => {
    if (!activeItem || !activeItem.auction) return;
    const amount = parseFloat(bidInput);
    const minBid = activeItem.auction.highestBid + activeItem.auction.minBidIncrement;
    if (isNaN(amount) || amount < minBid) return;
    if (amount > wallet.balanceEth) return;

    onPlaceBid(activeItem, amount);
    setShowBidModal(false);
    setBidInput('');
  };

  return (
    <div className="space-y-10 pb-16">
      {/* Storefront Hero Section */}
      <section className="relative overflow-hidden rounded-2xl bg-gradient-to-b from-slate-900/90 via-slate-900/60 to-[#080c14] border border-slate-800/80 p-8 md:p-12">
        <div className="absolute top-0 right-0 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 max-w-3xl space-y-4">
          <div className="text-xs font-semibold tracking-wider text-cyan-400 uppercase">
            Decentralized Content Protocol
          </div>
          <h1 className="text-3xl md:text-5xl font-bold tracking-tight text-white" style={{ textWrap: 'balance' }}>
            Token-gated intellectual property with verified on-chain provenance.
          </h1>
          <p className="text-base text-slate-400 leading-relaxed max-w-2xl">
            Publish, collect, and unlock uncompressed audio stems, peer-reviewed cryptographic manuscripts, and production 3D assets. Protected by decentralized access control and EIP-2981 automated creator royalties.
          </p>

          <div className="pt-2 flex flex-wrap items-center gap-4">
            <button
              onClick={() => {
                const el = document.getElementById('collection-grid');
                el?.scrollIntoView({ behavior: 'smooth' });
              }}
              className="px-5 py-2.5 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-semibold text-sm rounded-lg transition-colors flex items-center gap-2 shadow-lg shadow-cyan-500/20 whitespace-nowrap"
            >
              Explore Drops
              <ArrowRight className="w-4 h-4" />
            </button>
            <button
              onClick={onOpenMintModal}
              className="px-5 py-2.5 bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700 text-slate-200 font-medium text-sm rounded-lg transition-colors flex items-center gap-2 whitespace-nowrap"
            >
              Mint New Content NFT
            </button>
          </div>
        </div>
      </section>

      {/* Filter and Search Bar */}
      <div id="collection-grid" className="space-y-6">
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
          {/* Interactive Filter Controls */}
          <div className="flex items-center gap-1.5 p-1 bg-slate-900/80 border border-slate-800 rounded-lg overflow-x-auto">
            <button
              onClick={() => setSelectedCategory('all')}
              className={`px-3.5 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap ${
                selectedCategory === 'all'
                  ? 'bg-slate-800 text-cyan-400 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              All Assets ({items.length})
            </button>
            <button
              onClick={() => setSelectedCategory('audio')}
              className={`px-3.5 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap flex items-center gap-1.5 ${
                selectedCategory === 'audio'
                  ? 'bg-slate-800 text-cyan-400 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Music className="w-3.5 h-3.5" />
              Audio Stems
            </button>
            <button
              onClick={() => setSelectedCategory('research')}
              className={`px-3.5 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap flex items-center gap-1.5 ${
                selectedCategory === 'research'
                  ? 'bg-slate-800 text-cyan-400 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <FileText className="w-3.5 h-3.5" />
              Research
            </button>
            <button
              onClick={() => setSelectedCategory('3d_model')}
              className={`px-3.5 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap flex items-center gap-1.5 ${
                selectedCategory === '3d_model'
                  ? 'bg-slate-800 text-cyan-400 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Box className="w-3.5 h-3.5" />
              3D Assemblies
            </button>
            <button
              onClick={() => setSelectedCategory('visual_art')}
              className={`px-3.5 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap flex items-center gap-1.5 ${
                selectedCategory === 'visual_art'
                  ? 'bg-slate-800 text-cyan-400 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Palette className="w-3.5 h-3.5" />
              Algorithmic Art
            </button>
          </div>

          {/* Search & Sort */}
          <div className="flex items-center gap-3">
            <div className="relative flex-1 md:w-64">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                placeholder="Search drops, creators, tags..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 bg-slate-900/80 border border-slate-800 rounded-lg text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500/80"
              />
            </div>
            <select
              value={sortBy}
              onChange={(e: any) => setSortBy(e.target.value)}
              className="px-3 py-1.5 bg-slate-900/80 border border-slate-800 rounded-lg text-xs text-slate-300 focus:outline-none focus:border-cyan-500/80"
            >
              <option value="recent">Most Recent</option>
              <option value="price-asc">Price: Low to High</option>
              <option value="price-desc">Price: High to Low</option>
            </select>
          </div>
        </div>

        {/* Product Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {filteredItems.map((item) => {
            const owned = isOwner(item);
            return (
              <div
                key={item.id}
                onClick={() => setActiveItem(item)}
                className="group cursor-pointer rounded-xl bg-slate-900/70 border border-slate-800/90 hover:border-slate-700 transition-all duration-200 overflow-hidden flex flex-col hover:-translate-y-1 hover:shadow-xl hover:shadow-black/40"
              >
                {/* Product Image */}
                <div className="relative aspect-[4/3] w-full overflow-hidden bg-slate-950">
                  <img
                    src={item.coverImage}
                    alt={item.title}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                  {/* Token Gate Lock Status Indicator */}
                  <div className="absolute top-3 right-3">
                    {owned ? (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-emerald-950/80 border border-emerald-500/50 text-emerald-300 text-[11px] font-medium backdrop-blur-md">
                        <Unlock className="w-3 h-3" />
                        Decrypted
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-slate-950/80 border border-slate-700/60 text-slate-300 text-[11px] font-medium backdrop-blur-md">
                        <Lock className="w-3 h-3 text-cyan-400" />
                        Token-Gated
                      </span>
                    )}
                  </div>

                  {item.isAuction && (
                    <div className="absolute bottom-3 left-3">
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-amber-950/80 border border-amber-500/50 text-amber-300 text-[11px] font-medium backdrop-blur-md">
                        <Flame className="w-3 h-3 text-amber-400" />
                        Live Auction
                      </span>
                    </div>
                  )}
                </div>

                {/* Card Content */}
                <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                  <div className="space-y-1.5">
                    {/* Unboxed clean metadata with typographic separators */}
                    <div className="flex items-center gap-2 text-xs text-slate-400 uppercase tracking-wider">
                      <span>{item.contentType.replace('_', ' ')}</span>
                      <span aria-hidden="true">·</span>
                      <span>{item.royaltyPercent}% Royalty</span>
                      <span aria-hidden="true">·</span>
                      <span>#{item.tokenId}</span>
                    </div>

                    <h3 className="text-sm font-semibold text-white group-hover:text-cyan-400 transition-colors line-clamp-1">
                      {item.title}
                    </h3>

                    <p className="text-xs text-slate-400 line-clamp-2">
                      {item.description}
                    </p>
                  </div>

                  {/* Creator & Price Footer */}
                  <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between">
                    <div>
                      <span className="text-[11px] text-slate-500">Creator</span>
                      <p className="text-xs font-medium text-slate-300 truncate max-w-[120px]">
                        {item.creatorName}
                      </p>
                    </div>

                    <div className="text-right">
                      <span className="text-[11px] text-slate-500">
                        {item.isAuction ? 'Highest Bid' : 'Price'}
                      </span>
                      <p className="text-sm font-bold font-mono tabular-nums text-white">
                        {item.isAuction && item.auction
                          ? `${item.auction.highestBid} ETH`
                          : `${item.priceEth} ETH`}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Item Detail & Token Gated Secret Vault Modal */}
      {activeItem && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in"
          onClick={() => setActiveItem(null)}
        >
          <div 
            className="w-full max-w-3xl bg-[#0d1424] border border-slate-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between p-5 border-b border-slate-800/80">
              <div className="flex items-center gap-2">
                <span className="text-xs uppercase tracking-wider text-cyan-400 font-semibold">
                  {activeItem.contentType.replace('_', ' ')} NFT · #{activeItem.tokenId}
                </span>
                <span className="text-slate-600">|</span>
                <span className="text-xs font-mono text-slate-400">
                  {activeItem.contractAddress.slice(0, 8)}...{activeItem.contractAddress.slice(-6)}
                </span>
              </div>
              <button
                onClick={() => setActiveItem(null)}
                className="p-1 rounded text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Scrollable Body */}
            <div className="p-6 overflow-y-auto space-y-6">
              {/* Media & Meta Split */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
                <div className="aspect-[4/3] rounded-xl overflow-hidden bg-slate-950 border border-slate-800">
                  <img
                    src={activeItem.coverImage}
                    alt={activeItem.title}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover"
                  />
                </div>

                <div className="space-y-4">
                  <div>
                    <h2 className="text-xl font-bold text-white">
                      {activeItem.title}
                    </h2>
                    <div className="flex items-center gap-2 mt-1.5 text-xs text-slate-400">
                      <span>By {activeItem.creatorName}</span>
                      <span aria-hidden="true">·</span>
                      <span className="font-mono">{activeItem.creatorAddress.slice(0, 6)}...{activeItem.creatorAddress.slice(-4)}</span>
                    </div>
                  </div>

                  <p className="text-xs text-slate-300 leading-relaxed">
                    {activeItem.description}
                  </p>

                  <div className="p-3 rounded-lg bg-slate-900/90 border border-slate-800 space-y-2">
                    <div className="flex justify-between text-xs">
                      <span className="text-slate-400">Current Price</span>
                      <span className="font-mono tabular-nums text-white font-semibold">
                        {activeItem.priceEth} ETH (${activeItem.priceUsdc.toLocaleString()})
                      </span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span className="text-slate-400">Creator Royalty (EIP-2981)</span>
                      <span className="font-mono tabular-nums text-cyan-400 font-semibold">
                        {activeItem.royaltyPercent}% to {activeItem.creatorName}
                      </span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span className="text-slate-400">Current Owner</span>
                      <span className="font-mono tabular-nums text-slate-300">
                        {isOwner(activeItem) ? 'You (Current Wallet)' : `${activeItem.ownerAddress.slice(0, 6)}...${activeItem.ownerAddress.slice(-4)}`}
                      </span>
                    </div>
                  </div>

                  {/* Actions */}
                  {isOwner(activeItem) ? (
                    <div className="p-3 bg-emerald-950/40 border border-emerald-500/40 rounded-lg flex items-center gap-2 text-xs text-emerald-300 font-medium">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                      <span>You hold ownership credentials. Token-gated master payload is decrypted below.</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-3">
                      {activeItem.isAuction ? (
                        <button
                          onClick={() => {
                            setBidInput((activeItem.auction ? activeItem.auction.highestBid + activeItem.auction.minBidIncrement : activeItem.priceEth).toFixed(2));
                            setShowBidModal(true);
                          }}
                          className="flex-1 py-2.5 px-4 bg-amber-500 hover:bg-amber-400 text-slate-950 font-semibold text-xs rounded-lg transition-colors flex items-center justify-center gap-2 shadow-lg shadow-amber-500/20"
                        >
                          <Flame className="w-4 h-4" />
                          Place Bid ({activeItem.auction?.highestBid} ETH current)
                        </button>
                      ) : (
                        <button
                          onClick={() => setShowBuyModal(true)}
                          className="flex-1 py-2.5 px-4 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-semibold text-xs rounded-lg transition-colors flex items-center justify-center gap-2 shadow-lg shadow-cyan-500/20"
                        >
                          <Coins className="w-4 h-4" />
                          Buy Content NFT ({activeItem.priceEth} ETH)
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Token-Gated Content Payload Section */}
              <div className="border-t border-slate-800/80 pt-6 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {isOwner(activeItem) ? (
                      <Unlock className="w-4 h-4 text-emerald-400" />
                    ) : (
                      <Lock className="w-4 h-4 text-cyan-400" />
                    )}
                    <h4 className="text-sm font-semibold text-white">
                      Token-Gated Secret Master Payload
                    </h4>
                  </div>
                  <span className="text-[11px] font-mono text-slate-400">
                    CID: {activeItem.tokenGatedPayload.secretCid.slice(0, 18)}...
                  </span>
                </div>

                {isOwner(activeItem) ? (
                  /* Decrypted Master Access */
                  <div className="p-4 rounded-xl bg-slate-900/90 border border-emerald-500/40 space-y-4">
                    <div>
                      <h5 className="text-xs font-semibold text-emerald-400">
                        {activeItem.tokenGatedPayload.unlockedContent.heading}
                      </h5>
                      <p className="text-xs text-slate-300 mt-1">
                        {activeItem.tokenGatedPayload.unlockedContent.description}
                      </p>
                    </div>

                    {/* Decryption Key & Signature */}
                    <div className="p-3 bg-slate-950 rounded-lg border border-slate-800 flex items-center justify-between">
                      <div>
                        <span className="text-[11px] text-slate-500 block">ECDSA Access Decryption Key</span>
                        <code className="text-xs font-mono text-cyan-300">
                          {activeItem.tokenGatedPayload.decryptionKey}
                        </code>
                      </div>
                      <button
                        onClick={() => handleCopyDecryptionKey(activeItem.tokenGatedPayload.decryptionKey)}
                        className="p-1.5 text-xs text-slate-400 hover:text-white bg-slate-900 hover:bg-slate-800 rounded transition-colors flex items-center gap-1"
                      >
                        {copiedKey ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                        <span>{copiedKey ? 'Copied' : 'Copy Key'}</span>
                      </button>
                    </div>

                    {/* Downloadable Master Files */}
                    <div className="space-y-2">
                      <span className="text-xs font-medium text-slate-400 block">
                        Decrypted Master Assets
                      </span>
                      <div className="space-y-1.5">
                        {activeItem.tokenGatedPayload.unlockedContent.downloadFiles.map((file, idx) => (
                          <div
                            key={idx}
                            className="flex items-center justify-between p-2.5 rounded-lg bg-slate-950/60 border border-slate-800/80 text-xs"
                          >
                            <div className="flex items-center gap-2">
                              <FileText className="w-4 h-4 text-cyan-400 shrink-0" />
                              <div>
                                <span className="text-slate-200 font-medium">{file.name}</span>
                                <span className="text-[11px] text-slate-500 ml-2">
                                  {file.format} · {file.size}
                                </span>
                              </div>
                            </div>
                            <button
                              onClick={() => handleTriggerDownload(file.name)}
                              className="px-2.5 py-1 bg-slate-800 hover:bg-cyan-500 hover:text-slate-950 text-slate-200 rounded font-medium text-xs transition-colors flex items-center gap-1.5"
                            >
                              <Download className="w-3.5 h-3.5" />
                              Download
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>

                    {downloadSuccessMessage && (
                      <div className="p-2.5 bg-emerald-950/60 border border-emerald-500/50 rounded-lg text-xs text-emerald-300 flex items-center gap-2">
                        <Check className="w-3.5 h-3.5" />
                        <span>{downloadSuccessMessage}</span>
                      </div>
                    )}
                  </div>
                ) : (
                  /* Locked State */
                  <div className="p-6 rounded-xl bg-slate-950/70 border border-slate-800/80 text-center space-y-3">
                    <div className="w-10 h-10 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center mx-auto text-slate-400">
                      <Lock className="w-5 h-5 text-cyan-400" />
                    </div>
                    <div className="max-w-md mx-auto">
                      <p className="text-xs text-slate-300">
                        {activeItem.tokenGatedPayload.lockedMessage}
                      </p>
                      <p className="text-[11px] text-slate-500 mt-1">
                        Encrypted with AES-256-GCM. Unlocking requires verified ERC-721 token balance on smart contract {activeItem.contractAddress.slice(0, 8)}...
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Buy Confirmation Modal */}
      {showBuyModal && activeItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-md bg-[#0d1424] border border-slate-800 rounded-xl p-6 text-slate-200 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="text-base font-semibold text-white">Confirm Content Purchase</h3>
              <button 
                onClick={() => setShowBuyModal(false)}
                className="p-1 rounded text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-3 rounded-lg bg-slate-900/90 border border-slate-800 flex items-center gap-3">
              <img
                src={activeItem.coverImage}
                alt={activeItem.title}
                referrerPolicy="no-referrer"
                className="w-14 h-14 rounded-lg object-cover bg-slate-950"
              />
              <div className="min-w-0 flex-1">
                <h4 className="text-xs font-semibold text-white truncate">{activeItem.title}</h4>
                <p className="text-[11px] text-slate-400">Token ID: #{activeItem.tokenId}</p>
                <p className="text-xs font-mono font-bold text-cyan-400 mt-0.5">{activeItem.priceEth} ETH</p>
              </div>
            </div>

            {/* Financial Settlement Breakdown */}
            <div className="space-y-2 text-xs">
              <div className="flex justify-between text-slate-400">
                <span>Item Subtotal</span>
                <span className="font-mono tabular-nums text-white">{activeItem.priceEth} ETH</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Creator Royalty ({activeItem.royaltyPercent}%)</span>
                <span className="font-mono tabular-nums text-emerald-400">
                  +{(activeItem.priceEth * (activeItem.royaltyPercent / 100)).toFixed(4)} ETH
                </span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Marketplace Protocol Fee (1.5%)</span>
                <span className="font-mono tabular-nums text-slate-400">
                  +{(activeItem.priceEth * 0.015).toFixed(4)} ETH
                </span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Estimated Network Gas</span>
                <span className="font-mono tabular-nums text-slate-400">~0.0024 ETH</span>
              </div>
              <div className="pt-2 border-t border-slate-800 flex justify-between font-semibold text-sm">
                <span className="text-white">Total Amount</span>
                <span className="font-mono tabular-nums text-cyan-300">
                  {(activeItem.priceEth + 0.0024).toFixed(4)} ETH
                </span>
              </div>
            </div>

            {wallet.balanceEth < activeItem.priceEth ? (
              <div className="p-3 bg-rose-950/50 border border-rose-500/40 rounded-lg text-xs text-rose-300">
                Insufficient wallet balance. You have {wallet.balanceEth.toFixed(4)} ETH. Please use the Faucet in Wallet settings.
              </div>
            ) : (
              <button
                onClick={() => {
                  onBuyItem(activeItem);
                  setShowBuyModal(false);
                }}
                className="w-full py-2.5 bg-gradient-to-r from-cyan-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-slate-950 font-bold text-xs rounded-lg transition-all shadow-lg shadow-cyan-500/20"
              >
                Sign & Execute Buy Transaction
              </button>
            )}
          </div>
        </div>
      )}

      {/* Place Bid Modal */}
      {showBidModal && activeItem && activeItem.auction && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-md bg-[#0d1424] border border-slate-800 rounded-xl p-6 text-slate-200 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="text-base font-semibold text-white">Place Auction Bid</h3>
              <button 
                onClick={() => setShowBidModal(false)}
                className="p-1 rounded text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-2 text-xs">
              <div className="flex justify-between text-slate-400">
                <span>Current Highest Bid</span>
                <span className="font-mono tabular-nums text-white font-semibold">{activeItem.auction.highestBid} ETH</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Minimum Required Bid</span>
                <span className="font-mono tabular-nums text-cyan-400 font-semibold">
                  {(activeItem.auction.highestBid + activeItem.auction.minBidIncrement).toFixed(2)} ETH
                </span>
              </div>
            </div>

            <div>
              <label className="text-xs text-slate-400 block mb-1.5">Your Bid Amount (ETH)</label>
              <div className="relative">
                <input
                  type="number"
                  step="0.05"
                  value={bidInput}
                  onChange={(e) => setBidInput(e.target.value)}
                  className="w-full p-2.5 bg-slate-900 border border-slate-800 rounded-lg text-sm text-white font-mono focus:outline-none focus:border-cyan-500"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-500 font-mono">
                  ETH
                </span>
              </div>
            </div>

            <button
              onClick={handleConfirmBid}
              disabled={parseFloat(bidInput) < (activeItem.auction.highestBid + activeItem.auction.minBidIncrement)}
              className="w-full py-2.5 bg-amber-500 hover:bg-amber-400 disabled:opacity-40 text-slate-950 font-bold text-xs rounded-lg transition-colors shadow-lg shadow-amber-500/20"
            >
              Sign & Place Bid
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
