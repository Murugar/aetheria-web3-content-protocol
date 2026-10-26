import React from 'react';
import { WalletState } from '../types/web3';
import { SUPPORTED_CHAINS } from '../data/mockData';
import { X, Check, Copy, ExternalLink, RefreshCw, PlusCircle, UserCheck } from 'lucide-react';

interface WalletModalProps {
  isOpen: boolean;
  onClose: () => void;
  wallet: WalletState;
  onSwitchAccount: (address: string, ensName: string) => void;
  onSwitchNetwork: (chainId: number) => void;
  onFundFaucet: () => void;
}

const PRESET_ACCOUNTS = [
  {
    name: 'Alice (Sound Producer)',
    ens: 'soundarchitect.eth',
    address: '0x71C94a6b16e8A91Fe1308a404Fe17E8687f8649b',
    role: 'Creator & Sound Engineer',
  },
  {
    name: 'Dr. Elena (zk Researcher)',
    ens: 'elenavance.eth',
    address: '0x94B8f0E72C411e7456d354a8C42E8D3970E91523',
    role: 'Cryptographer & Author',
  },
  {
    name: 'Bob (Protocol Collector)',
    ens: 'bobcollector.eth',
    address: '0x5B38Da6a701c568545dCfcB03FcB875f56beddC4',
    role: 'Active Market Collector',
  },
];

export const WalletModal: React.FC<WalletModalProps> = ({
  isOpen,
  onClose,
  wallet,
  onSwitchAccount,
  onSwitchNetwork,
  onFundFaucet,
}) => {
  const [copied, setCopied] = React.useState(false);
  const [isFunding, setIsFunding] = React.useState(false);

  if (!isOpen) return null;

  const handleCopy = () => {
    navigator.clipboard.writeText(wallet.address);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleFaucet = () => {
    setIsFunding(true);
    setTimeout(() => {
      onFundFaucet();
      setIsFunding(false);
    }, 600);
  };

  const currentChain = SUPPORTED_CHAINS.find(c => c.id === wallet.chainId) || SUPPORTED_CHAINS[0];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        className="w-full max-w-md bg-[#0d1424] border border-slate-800 rounded-xl shadow-2xl p-6 text-slate-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800/80">
          <div className="flex items-center gap-2">
            <UserCheck className="w-5 h-5 text-cyan-400" />
            <h3 className="text-base font-semibold text-white">Web3 Wallet & Account Manager</h3>
          </div>
          <button 
            onClick={onClose}
            className="p-1 rounded-md text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Current Account Card */}
        <div className="mt-4 p-4 rounded-lg bg-slate-900/90 border border-slate-800">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
            <span>Connected Account</span>
            <span className="text-emerald-400 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
              Active
            </span>
          </div>
          <div className="flex items-center justify-between mt-1">
            <span className="font-mono text-sm text-white font-medium">
              {wallet.address.slice(0, 10)}...{wallet.address.slice(-8)}
            </span>
            <div className="flex items-center gap-1.5">
              <button
                onClick={handleCopy}
                className="p-1.5 text-xs text-slate-400 hover:text-cyan-400 hover:bg-slate-800 rounded transition-colors"
                title="Copy Address"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              </button>
              <a
                href={`${currentChain.blockExplorer}/address/${wallet.address}`}
                target="_blank"
                rel="noreferrer"
                className="p-1.5 text-xs text-slate-400 hover:text-cyan-400 hover:bg-slate-800 rounded transition-colors"
                title="View on Explorer"
              >
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>

          {/* Balances */}
          <div className="mt-3 pt-3 border-t border-slate-800/60 grid grid-cols-2 gap-3">
            <div>
              <span className="text-[11px] text-slate-400">ETH Balance</span>
              <p className="font-mono tabular-nums text-base font-semibold text-white mt-0.5">
                {wallet.balanceEth.toFixed(4)} <span className="text-xs text-slate-400 font-normal">ETH</span>
              </p>
            </div>
            <div>
              <span className="text-[11px] text-slate-400">USDC Balance</span>
              <p className="font-mono tabular-nums text-base font-semibold text-white mt-0.5">
                ${wallet.balanceUsdc.toLocaleString()} <span className="text-xs text-slate-400 font-normal">USDC</span>
              </p>
            </div>
          </div>

          {/* Faucet Trigger */}
          <div className="mt-3.5">
            <button
              onClick={handleFaucet}
              disabled={isFunding}
              className="w-full py-2 px-3 bg-gradient-to-r from-cyan-600 to-indigo-600 hover:from-cyan-500 hover:to-indigo-500 text-white rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 shadow-md shadow-cyan-900/20 transition-all disabled:opacity-50"
            >
              {isFunding ? (
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <PlusCircle className="w-3.5 h-3.5" />
              )}
              {isFunding ? 'Minting Testnet Tokens...' : 'Faucet: Claim +2.0 ETH & +5,000 USDC'}
            </button>
          </div>
        </div>

        {/* Network Switcher */}
        <div className="mt-5">
          <label className="text-xs font-medium text-slate-400 uppercase tracking-wider block mb-2">
            Target Chain Network
          </label>
          <div className="grid grid-cols-1 gap-1.5">
            {SUPPORTED_CHAINS.map((chain) => (
              <button
                key={chain.id}
                onClick={() => onSwitchNetwork(chain.id)}
                className={`flex items-center justify-between p-2.5 rounded-lg border text-xs font-medium transition-all ${
                  wallet.chainId === chain.id
                    ? 'bg-slate-800/90 border-cyan-500/80 text-white shadow-sm'
                    : 'bg-slate-900/50 border-slate-800/80 text-slate-300 hover:bg-slate-800/50 hover:text-white'
                }`}
              >
                <div className="flex items-center gap-2">
                  <span
                    className="w-2.5 h-2.5 rounded-full"
                    style={{ backgroundColor: chain.iconColor }}
                  />
                  <span>{chain.name}</span>
                </div>
                <div className="flex items-center gap-2 font-mono text-[11px] text-slate-400">
                  <span>~{chain.avgGasGwei} Gwei</span>
                  {wallet.chainId === chain.id && (
                    <Check className="w-3.5 h-3.5 text-cyan-400" />
                  )}
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Switch Persona / Role */}
        <div className="mt-5">
          <label className="text-xs font-medium text-slate-400 uppercase tracking-wider block mb-2">
            Switch Wallet Persona
          </label>
          <div className="space-y-1.5">
            {PRESET_ACCOUNTS.map((acc) => {
              const isActive = wallet.address.toLowerCase() === acc.address.toLowerCase();
              return (
                <button
                  key={acc.address}
                  onClick={() => onSwitchAccount(acc.address, acc.ens)}
                  className={`w-full flex items-center justify-between p-2.5 rounded-lg border text-left text-xs transition-all ${
                    isActive
                      ? 'bg-cyan-950/40 border-cyan-500/60 text-white'
                      : 'bg-slate-900/40 border-slate-800/80 text-slate-300 hover:bg-slate-800/60'
                  }`}
                >
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="font-semibold text-slate-100">{acc.name}</span>
                      <span className="text-[11px] text-slate-400 font-mono">({acc.ens})</span>
                    </div>
                    <span className="text-[11px] text-slate-400">{acc.role}</span>
                  </div>
                  <div className="font-mono text-[11px] text-slate-400">
                    {acc.address.slice(0, 6)}...{acc.address.slice(-4)}
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
