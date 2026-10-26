import React from 'react';
import { WalletState } from '../types/web3';
import { Shield, Sparkles, Terminal, Rocket, Layers, ChevronDown } from 'lucide-react';

interface HeaderProps {
  activeTab: 'marketplace' | 'auditor' | 'features' | 'pipeline';
  setActiveTab: (tab: 'marketplace' | 'auditor' | 'features' | 'pipeline') => void;
  wallet: WalletState;
  onOpenWalletModal: () => void;
  onOpenMintModal: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  wallet,
  onOpenWalletModal,
  onOpenMintModal,
}) => {
  return (
    <header className="sticky top-0 z-40 bg-[#080c14]/90 backdrop-blur-md border-b border-slate-800/80 px-6 py-3.5">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-8">
        {/* Zone 1: Brand title, one line wordmark */}
        <div 
          onClick={() => setActiveTab('marketplace')}
          className="flex items-center gap-2.5 cursor-pointer shrink-0 group"
        >
          <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-cyan-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-cyan-500/20 group-hover:shadow-cyan-500/40 transition-all">
            <Layers className="w-4 h-4 text-white" />
          </div>
          <span className="text-lg font-bold tracking-tight text-white whitespace-nowrap">
            Aetheria Protocol
          </span>
        </div>

        {/* Zone 2: 4 nav links, 1-2 word labels, single line */}
        <nav className="hidden md:flex items-center gap-7 text-sm font-medium">
          <button
            onClick={() => setActiveTab('marketplace')}
            className={`whitespace-nowrap transition-colors py-1 relative ${
              activeTab === 'marketplace'
                ? 'text-cyan-400 font-semibold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Marketplace
            {activeTab === 'marketplace' && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-cyan-400 rounded-full" />
            )}
          </button>

          <button
            onClick={() => setActiveTab('auditor')}
            className={`whitespace-nowrap transition-colors py-1 relative flex items-center gap-1.5 ${
              activeTab === 'auditor'
                ? 'text-cyan-400 font-semibold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Shield className="w-3.5 h-3.5" />
            Contract Auditor
            {activeTab === 'auditor' && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-cyan-400 rounded-full" />
            )}
          </button>

          <button
            onClick={() => setActiveTab('features')}
            className={`whitespace-nowrap transition-colors py-1 relative flex items-center gap-1.5 ${
              activeTab === 'features'
                ? 'text-cyan-400 font-semibold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            Feature Studio
            {activeTab === 'features' && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-cyan-400 rounded-full" />
            )}
          </button>

          <button
            onClick={() => setActiveTab('pipeline')}
            className={`whitespace-nowrap transition-colors py-1 relative flex items-center gap-1.5 ${
              activeTab === 'pipeline'
                ? 'text-cyan-400 font-semibold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Rocket className="w-3.5 h-3.5" />
            Mainnet Pipeline
            {activeTab === 'pipeline' && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-cyan-400 rounded-full" />
            )}
          </button>
        </nav>

        {/* Zone 3: 1 primary action */}
        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={onOpenMintModal}
            className="hidden sm:inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-medium text-slate-300 bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700/70 rounded-lg transition-colors whitespace-nowrap"
          >
            <Terminal className="w-3.5 h-3.5 text-cyan-400" />
            Mint Content
          </button>

          <button
            onClick={onOpenWalletModal}
            className="flex items-center gap-2 px-3.5 py-1.5 text-xs font-medium text-white bg-slate-900 hover:bg-slate-850 border border-slate-700 hover:border-slate-600 rounded-lg transition-all shadow-sm whitespace-nowrap"
          >
            <span className="w-2 h-2 rounded-full bg-emerald-400" />
            <span className="font-mono tabular-nums text-slate-200">
              {wallet.address.slice(0, 6)}...{wallet.address.slice(-4)}
            </span>
            <span className="text-slate-500">|</span>
            <span className="font-mono tabular-nums text-cyan-300 font-semibold">
              {wallet.balanceEth.toFixed(2)} ETH
            </span>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
          </button>
        </div>
      </div>
    </header>
  );
};
