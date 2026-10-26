import React, { useState } from 'react';
import { ContentType, NFTContentItem, WalletState } from '../types/web3';
import { X, Upload, Sparkles, Lock, ShieldCheck, Terminal, FileCode, CheckCircle2 } from 'lucide-react';

interface MintModalProps {
  isOpen: boolean;
  onClose: () => void;
  wallet: WalletState;
  onMintSuccess: (newItem: NFTContentItem) => void;
}

export const MintModal: React.FC<MintModalProps> = ({
  isOpen,
  onClose,
  wallet,
  onMintSuccess,
}) => {
  const [title, setTitle] = useState('');
  const [contentType, setContentType] = useState<ContentType>('audio');
  const [description, setDescription] = useState('');
  const [priceEth, setPriceEth] = useState('0.50');
  const [royaltyPercent, setRoyaltyPercent] = useState('7.5');
  const [secretFileName, setSecretFileName] = useState('master_audio_multitrack_stems.wav');
  const [isMinting, setIsMinting] = useState(false);
  const [coverUrl, setCoverUrl] = useState('/src/assets/images/nft_cyber_audio_matrix_1793010944101.jpg');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title) return;

    setIsMinting(true);

    setTimeout(() => {
      const randomTokenId = Math.floor(Math.random() * 800) + 500;
      const randomCid = 'ipfs://bafybeic' + Math.random().toString(36).substring(2, 12) + '7yv5e4g5r4p6';
      const randomKey = '0x' + Array.from({ length: 40 }, () => Math.floor(Math.random() * 16).toString(16)).join('');

      const newItem: NFTContentItem = {
        id: `nft-${Date.now()}`,
        tokenId: randomTokenId,
        contractAddress: '0x3Af42F7969E3a954B514f7d49826d9c6eC229081',
        title: title,
        contentType: contentType,
        creatorName: wallet.ensName || 'You (Verified Creator)',
        creatorAddress: wallet.address,
        ownerAddress: wallet.address,
        priceEth: parseFloat(priceEth) || 0.5,
        priceUsdc: (parseFloat(priceEth) || 0.5) * 2900,
        coverImage: coverUrl,
        description: description || 'Exclusive creator publication minted on Aetheria Protocol with token-gated master payload access.',
        tags: [contentType.toUpperCase(), 'Decentralized IP', 'Master Files'],
        royaltyPercent: parseFloat(royaltyPercent) || 5.0,
        tokenStandard: 'ERC-721',
        isAuction: false,
        tokenGatedPayload: {
          isLocked: false, // Owned by creator
          secretCid: randomCid,
          decryptionKey: randomKey,
          lockedMessage: `Token-gated master content files locked to NFT #${randomTokenId} holders.`,
          unlockedContent: {
            heading: `${title} — Master Asset Vault`,
            description: 'You are the registered creator & holder of this token. Full uncompressed assets decrypted.',
            downloadFiles: [
              {
                name: secretFileName || 'master_archive.zip',
                size: '142.8 MB',
                format: 'Uncompressed Master Master File',
                hash: 'Qm' + Math.random().toString(36).substring(2, 20),
              },
              {
                name: 'Commercial_Rights_Grant.pdf',
                size: '2.1 MB',
                format: 'EIP-712 Signed Commercial License',
                hash: 'Qm' + Math.random().toString(36).substring(2, 20),
              },
            ],
            secretKeySnippet: `AES-256::${randomKey.slice(0, 16)}`,
            rawTextExcerpt: `Authentic Creator Attestation for Token #${randomTokenId} signed by ${wallet.address}.`,
          },
        },
        mintedAt: '2026-10-26',
        viewsCount: 1,
        likesCount: 1,
      };

      onMintSuccess(newItem);
      setIsMinting(false);
      onClose();
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
      <div 
        className="w-full max-w-xl bg-[#0d1424] border border-slate-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <Terminal className="w-5 h-5 text-cyan-400" />
            <h3 className="text-base font-semibold text-white">
              Mint Content NFT & Attest Secret Payload
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-4 text-xs">
          <div>
            <label className="text-slate-400 font-medium block mb-1">Content Title</label>
            <input
              type="text"
              required
              placeholder="e.g. Neural Echoes — Master Stem Archive"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full p-2.5 bg-slate-900 border border-slate-700 rounded-lg text-white text-xs focus:outline-none focus:border-cyan-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-slate-400 font-medium block mb-1">Content Category</label>
              <select
                value={contentType}
                onChange={(e: any) => {
                  setContentType(e.target.value);
                  if (e.target.value === 'research') {
                    setCoverUrl('/src/assets/images/nft_crypto_research_codex_1793010944587.jpg');
                    setSecretFileName('research_manuscript_complete.pdf');
                  } else if (e.target.value === '3d_model') {
                    setCoverUrl('/src/assets/images/nft_hyperion_mech_render_1793010945934.jpg');
                    setSecretFileName('3d_rigged_cad_assembly.fbx');
                  } else if (e.target.value === 'visual_art') {
                    setCoverUrl('/src/assets/images/nft_aurora_algorithmic_canvas_1793010944086.jpg');
                    setSecretFileName('16k_master_canvas_archive.tiff');
                  } else {
                    setCoverUrl('/src/assets/images/nft_cyber_audio_matrix_1793010944101.jpg');
                    setSecretFileName('master_audio_multitrack_stems.wav');
                  }
                }}
                className="w-full p-2.5 bg-slate-900 border border-slate-700 rounded-lg text-white text-xs focus:outline-none focus:border-cyan-500"
              >
                <option value="audio">Audio Stems & Music Masters</option>
                <option value="research">Academic & zk Research</option>
                <option value="3d_model">3D Assembly & Game Assets</option>
                <option value="visual_art">Algorithmic & Generative Art</option>
                <option value="code_license">Developer Software License</option>
              </select>
            </div>

            <div>
              <label className="text-slate-400 font-medium block mb-1">Listing Price (ETH)</label>
              <input
                type="number"
                step="0.01"
                min="0.01"
                value={priceEth}
                onChange={(e) => setPriceEth(e.target.value)}
                className="w-full p-2.5 bg-slate-900 border border-slate-700 rounded-lg text-white text-xs font-mono focus:outline-none focus:border-cyan-500"
              />
            </div>
          </div>

          <div>
            <label className="text-slate-400 font-medium block mb-1">Public Description & Abstract</label>
            <textarea
              rows={3}
              placeholder="Describe the public overview of your content..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full p-2.5 bg-slate-900 border border-slate-700 rounded-lg text-white text-xs focus:outline-none focus:border-cyan-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-slate-400 font-medium block mb-1">Creator Royalty (EIP-2981 %)</label>
              <input
                type="number"
                step="0.5"
                min="0"
                max="15"
                value={royaltyPercent}
                onChange={(e) => setRoyaltyPercent(e.target.value)}
                className="w-full p-2.5 bg-slate-900 border border-slate-700 rounded-lg text-white text-xs font-mono focus:outline-none focus:border-cyan-500"
              />
              <span className="text-[11px] text-slate-500 mt-1 block">5.0% - 10.0% standard</span>
            </div>

            <div>
              <label className="text-slate-400 font-medium block mb-1">Token Standard</label>
              <div className="p-2.5 bg-slate-950 border border-slate-800 rounded-lg text-white text-xs font-mono">
                ERC-721 + EIP-2981
              </div>
            </div>
          </div>

          {/* Token-Gated Master Asset Attestation */}
          <div className="p-4 rounded-xl bg-slate-950 border border-cyan-500/40 space-y-3">
            <div className="flex items-center gap-2">
              <Lock className="w-4 h-4 text-cyan-400" />
              <span className="font-semibold text-white">Token-Gated Secret Master Payload</span>
            </div>
            <p className="text-[11px] text-slate-400">
              Files uploaded here will be encrypted using client-side AES-256 and pinned to IPFS. Only verified token holders can decrypt and download.
            </p>

            <div>
              <label className="text-[11px] text-slate-400 block mb-1">Encrypted Master File Name</label>
              <input
                type="text"
                value={secretFileName}
                onChange={(e) => setSecretFileName(e.target.value)}
                className="w-full p-2 bg-slate-900 border border-slate-700 rounded text-slate-200 font-mono text-xs focus:outline-none focus:border-cyan-500"
              />
            </div>
          </div>

          {/* Gas & Fee Notice */}
          <div className="p-3 bg-slate-900/60 rounded-lg border border-slate-800 text-[11px] text-slate-400 flex items-center justify-between">
            <span>Estimated Minting Gas: ~114,200 gas</span>
            <span className="font-mono text-cyan-300">~0.0018 ETH</span>
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={isMinting}
              className="w-full py-2.5 bg-gradient-to-r from-cyan-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-slate-950 font-bold text-xs rounded-lg transition-all shadow-lg shadow-cyan-500/20 flex items-center justify-center gap-2"
            >
              {isMinting ? (
                <>
                  <Sparkles className="w-3.5 h-3.5 animate-spin" />
                  <span>Encrypting Payload & Minting Token...</span>
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Sign & Mint Content NFT</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
