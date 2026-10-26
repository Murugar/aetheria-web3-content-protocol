import React, { useState } from 'react';
import { ChainConfig, DeployedContract, WalletState, AuditContract } from '../types/web3';
import { SUPPORTED_CHAINS } from '../data/mockData';
import { 
  Rocket, 
  CheckCircle2, 
  XCircle, 
  AlertTriangle, 
  ExternalLink, 
  Download, 
  Copy, 
  Check, 
  RefreshCw, 
  Terminal, 
  ShieldCheck, 
  Cpu, 
  CheckCircle,
  Clock,
  ArrowRight
} from 'lucide-react';

interface MainnetPipelineViewProps {
  wallet: WalletState;
  contracts: AuditContract[];
  onDeployContract: (newDeployment: DeployedContract) => void;
  deployedHistory: DeployedContract[];
  activeDeployedContractAddress: string;
  onSetActiveContract: (address: string) => void;
  onNavigateToAuditor: () => void;
}

export const MainnetPipelineView: React.FC<MainnetPipelineViewProps> = ({
  wallet,
  contracts,
  onDeployContract,
  deployedHistory,
  activeDeployedContractAddress,
  onSetActiveContract,
  onNavigateToAuditor,
}) => {
  const [selectedChainId, setSelectedChainId] = useState<number>(wallet.chainId);
  const [protocolFeeInput, setProtocolFeeInput] = useState<number>(150); // 1.5%
  const [multiSigAddress, setMultiSigAddress] = useState<string>('0x71C94a6b16e8A91Fe1308a404Fe17E8687f8649b');
  const [isSimulating, setIsSimulating] = useState<boolean>(false);
  const [simulationPassed, setSimulationPassed] = useState<boolean | null>(null);
  const [isDeploying, setIsDeploying] = useState<boolean>(false);
  const [deploymentResult, setDeploymentResult] = useState<DeployedContract | null>(null);
  const [copiedAddress, setCopiedAddress] = useState<boolean>(false);
  const [copiedAbi, setCopiedAbi] = useState<boolean>(false);

  const selectedChain = SUPPORTED_CHAINS.find((c) => c.id === selectedChainId) || SUPPORTED_CHAINS[0];

  // Audit status check
  const marketplaceContract = contracts.find((c) => c.id === 'marketplace-core') || contracts[0];
  const auditPassed = marketplaceContract.isPatched;

  // Pre-flight checklist items
  const checklist = [
    {
      id: 'chk-audit',
      title: 'Security Audit Clearance',
      description: 'Zero Critical or High severity vulnerabilities detected in smart contract code.',
      passed: auditPassed,
      actionText: auditPassed ? 'Passed' : 'Remediation Required',
      onFix: auditPassed ? undefined : onNavigateToAuditor,
    },
    {
      id: 'chk-bytecode',
      title: 'EIP-170 Code Size Limit (24.576 KB)',
      description: 'Compiled bytecode size is 19.42 KB (within safety threshold of 24.576 KB).',
      passed: true,
      actionText: 'Passed (19.42 KB)',
    },
    {
      id: 'chk-compiler',
      title: 'Compiler & Optimizer Profile',
      description: 'Solc 0.8.24 via-IR enabled with 200 optimizer runs configured.',
      passed: true,
      actionText: 'Verified (via-IR)',
    },
    {
      id: 'chk-governance',
      title: 'Multi-Sig & Timelock Access Control',
      description: 'Ownable2Step and TimelockController configured for admin parameter changes.',
      passed: true,
      actionText: 'Configured',
    },
    {
      id: 'chk-interfaces',
      title: 'Standard ERC & EIP Invariant Tests',
      description: 'ERC-721, EIP-2981, and ERC-165 interface identifiers registered and tested.',
      passed: true,
      actionText: 'Passed',
    },
  ];

  const allChecksPassed = checklist.every((c) => c.passed);

  const handleRunSimulation = () => {
    setIsSimulating(true);
    setSimulationPassed(null);
    setTimeout(() => {
      setIsSimulating(false);
      setSimulationPassed(allChecksPassed);
    }, 1200);
  };

  const handleExecuteDeployment = () => {
    if (!allChecksPassed) return;
    setIsDeploying(true);

    setTimeout(() => {
      // Generate deterministic mock address
      const randomHex = Math.random().toString(16).substring(2, 10);
      const newAddress = `0x3Af42F${randomHex}9081`;
      const newTxHash = `0x9a8b7c6d5e4f3a2b1c0d9e8f7a6b5c4d3e2f1a0b9c8d7e6f5a4b3c2d1e0f${randomHex}`;

      const newDeployment: DeployedContract = {
        timestamp: Date.now(),
        contractName: 'AetheriaProtocolExtended',
        address: newAddress,
        txHash: newTxHash,
        chainId: selectedChain.id,
        chainName: selectedChain.name,
        gasUsed: 1845200,
        deployer: wallet.address,
      };

      onDeployContract(newDeployment);
      setDeploymentResult(newDeployment);
      setIsDeploying(false);
    }, 2000);
  };

  const handleCopyAddress = (addr: string) => {
    navigator.clipboard.writeText(addr);
    setCopiedAddress(true);
    setTimeout(() => setCopiedAddress(false), 2000);
  };

  const handleExportAbi = () => {
    const dummyAbi = [
      {
        "inputs": [],
        "name": "withdrawProceeds",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
      },
      {
        "inputs": [{ "name": "listingId", "type": "bytes32" }],
        "name": "buyItem",
        "outputs": [],
        "stateMutability": "payable",
        "type": "function"
      },
      {
        "inputs": [
          { "name": "tokenId", "type": "uint256" },
          { "name": "salePrice", "type": "uint256" }
        ],
        "name": "royaltyInfo",
        "outputs": [
          { "name": "receiver", "type": "address" },
          { "name": "royaltyAmount", "type": "uint256" }
        ],
        "stateMutability": "view",
        "type": "function"
      }
    ];

    const blob = new Blob([JSON.stringify(dummyAbi, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'AetheriaProtocolABI.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    setCopiedAbi(true);
    setTimeout(() => setCopiedAbi(false), 2000);
  };

  return (
    <div className="space-y-8 pb-16">
      {/* Top Banner */}
      <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-cyan-400">
            <Rocket className="w-4 h-4" />
            <span>Mainnet Deployment & Pre-Flight Verification</span>
          </div>
          <h1 className="text-2xl font-bold text-white mt-1">
            Production Release Pipeline
          </h1>
          <p className="text-xs text-slate-400 mt-1 max-w-2xl">
            Validate formal invariants, EIP-170 bytecode limits, and deploy audited protocol contracts to Ethereum Mainnet or Layer 2s with verified ABI artifacts.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleExportAbi}
            className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 text-xs font-medium rounded-lg transition-colors flex items-center gap-1.5 whitespace-nowrap"
          >
            <Download className="w-3.5 h-3.5 text-cyan-400" />
            <span>{copiedAbi ? 'ABI Exported' : 'Export Verified ABI'}</span>
          </button>
        </div>
      </div>

      {/* Pre-Flight Verification Checklist */}
      <div className="p-6 rounded-2xl bg-slate-900/70 border border-slate-800 space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div>
            <h2 className="text-base font-bold text-white">Pre-Flight Security & Invariant Checklist</h2>
            <p className="text-xs text-slate-400">Mandatory criteria before broadcasting deployment transactions</p>
          </div>
          <span className={`text-xs font-semibold px-2.5 py-1 rounded border ${
            allChecksPassed 
              ? 'text-emerald-400 bg-emerald-950/60 border-emerald-500/50' 
              : 'text-amber-400 bg-amber-950/60 border-amber-500/50'
          }`}>
            {allChecksPassed ? '✓ Ready for Mainnet' : '⚠ Action Items Remaining'}
          </span>
        </div>

        <div className="space-y-2.5">
          {checklist.map((item) => (
            <div
              key={item.id}
              className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800/80 flex items-center justify-between gap-4 text-xs"
            >
              <div className="flex items-start gap-3">
                {item.passed ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                ) : (
                  <XCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                )}
                <div>
                  <h3 className="font-semibold text-white">{item.title}</h3>
                  <p className="text-[11px] text-slate-400 mt-0.5">{item.description}</p>
                </div>
              </div>

              <div className="shrink-0 flex items-center gap-2">
                {item.onFix ? (
                  <button
                    onClick={item.onFix}
                    className="px-3 py-1 bg-amber-500 hover:bg-amber-400 text-slate-950 font-semibold text-xs rounded transition-colors whitespace-nowrap"
                  >
                    Fix in Auditor →
                  </button>
                ) : (
                  <span className={`font-mono text-[11px] ${item.passed ? 'text-emerald-400' : 'text-rose-400'}`}>
                    {item.actionText}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Deployment Configuration & Executor */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left: Deployment Parameters */}
        <div className="lg:col-span-6 p-6 rounded-2xl bg-slate-900/70 border border-slate-800 space-y-5">
          <h3 className="text-sm font-bold text-white uppercase tracking-wider text-slate-300">
            Target Chain & Constructor Parameters
          </h3>

          <div>
            <label className="text-xs text-slate-400 block mb-1.5 font-medium">Deployment Network</label>
            <select
              value={selectedChainId}
              onChange={(e) => setSelectedChainId(parseInt(e.target.value, 10))}
              className="w-full p-2.5 bg-slate-950 border border-slate-700 rounded-lg text-xs font-semibold text-white focus:outline-none focus:border-cyan-500"
            >
              {SUPPORTED_CHAINS.map((chain) => (
                <option key={chain.id} value={chain.id}>
                  {chain.name} (Chain ID: {chain.id}) — ~{chain.avgGasGwei} Gwei
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs text-slate-400 block mb-1.5 font-medium">Platform Fee (Basis Points)</label>
              <input
                type="number"
                value={protocolFeeInput}
                onChange={(e) => setProtocolFeeInput(parseInt(e.target.value, 10))}
                className="w-full p-2.5 bg-slate-950 border border-slate-700 rounded-lg text-xs font-mono text-white focus:outline-none focus:border-cyan-500"
              />
              <span className="text-[11px] text-slate-500 mt-1 block">150 bps = 1.5%</span>
            </div>

            <div>
              <label className="text-xs text-slate-400 block mb-1.5 font-medium">Deployer Account</label>
              <div className="p-2.5 bg-slate-950 border border-slate-800 rounded-lg text-xs font-mono text-slate-300 truncate">
                {wallet.address}
              </div>
              <span className="text-[11px] text-slate-500 mt-1 block">Current Wallet</span>
            </div>
          </div>

          <div>
            <label className="text-xs text-slate-400 block mb-1.5 font-medium">Multi-Sig / Timelock Admin</label>
            <input
              type="text"
              value={multiSigAddress}
              onChange={(e) => setMultiSigAddress(e.target.value)}
              className="w-full p-2.5 bg-slate-950 border border-slate-700 rounded-lg text-xs font-mono text-white focus:outline-none focus:border-cyan-500"
            />
            <span className="text-[11px] text-slate-500 mt-1 block">Gnosis Safe or 48-Hour Timelock Address</span>
          </div>

          {/* Gas & Fee Estimation */}
          <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 space-y-2 text-xs">
            <div className="flex justify-between text-slate-400">
              <span>Estimated Deployment Gas</span>
              <span className="font-mono tabular-nums text-white">1,845,200 gas</span>
            </div>
            <div className="flex justify-between text-slate-400">
              <span>Gas Price on {selectedChain.name}</span>
              <span className="font-mono tabular-nums text-white">{selectedChain.avgGasGwei} Gwei</span>
            </div>
            <div className="pt-2 border-t border-slate-800 flex justify-between font-semibold">
              <span className="text-slate-300">Total Deployment Cost</span>
              <span className="font-mono tabular-nums text-cyan-300">
                ~{(1845200 * selectedChain.avgGasGwei * 1e-9).toFixed(5)} {selectedChain.symbol}
              </span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-3 pt-2">
            <button
              onClick={handleRunSimulation}
              disabled={isSimulating}
              className="flex-1 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs rounded-lg transition-colors flex items-center justify-center gap-1.5"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isSimulating ? 'animate-spin' : ''}`} />
              {isSimulating ? 'Running Local Fork Simulation...' : 'Dry-Run Simulation'}
            </button>

            <button
              onClick={handleExecuteDeployment}
              disabled={!allChecksPassed || isDeploying}
              className="flex-1 py-2.5 bg-gradient-to-r from-cyan-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 disabled:opacity-40 text-slate-950 font-bold text-xs rounded-lg transition-all shadow-lg shadow-cyan-500/20 flex items-center justify-center gap-2 whitespace-nowrap"
            >
              <Rocket className={`w-4 h-4 ${isDeploying ? 'animate-bounce' : ''}`} />
              {isDeploying ? 'Broadcasting Tx to Mempool...' : `Deploy to ${selectedChain.name}`}
            </button>
          </div>

          {simulationPassed !== null && (
            <div className={`p-3 rounded-lg border text-xs flex items-center gap-2 ${
              simulationPassed 
                ? 'bg-emerald-950/60 border-emerald-500/40 text-emerald-300' 
                : 'bg-rose-950/60 border-rose-500/40 text-rose-300'
            }`}>
              {simulationPassed ? (
                <>
                  <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Dry-run simulation succeeded on local EVM fork. All state transitions validated without reverts.</span>
                </>
              ) : (
                <>
                  <XCircle className="w-4 h-4 text-rose-400 shrink-0" />
                  <span>Dry-run aborted: Unresolved high/critical audit issues exist. Please apply security patches first.</span>
                </>
              )}
            </div>
          )}
        </div>

        {/* Right: Live Deployment Result & History */}
        <div className="lg:col-span-6 space-y-6">
          {/* Active Contract Info */}
          <div className="p-6 rounded-2xl bg-slate-900/70 border border-slate-800 space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs uppercase tracking-wider text-cyan-400 font-semibold">
                Active Protocol Contract
              </span>
              <span className="text-[11px] text-emerald-400 font-mono flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                Live on Chain
              </span>
            </div>

            <div className="p-3 bg-slate-950 rounded-lg border border-slate-800 flex items-center justify-between">
              <div>
                <span className="text-[11px] text-slate-500 block">Contract Address</span>
                <code className="text-xs font-mono text-white">
                  {activeDeployedContractAddress}
                </code>
              </div>
              <button
                onClick={() => handleCopyAddress(activeDeployedContractAddress)}
                className="p-1.5 text-xs text-slate-400 hover:text-white bg-slate-900 hover:bg-slate-800 rounded transition-colors"
                title="Copy Address"
              >
                {copiedAddress ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              </button>
            </div>

            {deploymentResult && (
              <div className="p-4 rounded-xl bg-emerald-950/40 border border-emerald-500/40 space-y-2.5 text-xs animate-in fade-in">
                <div className="flex items-center gap-2 text-emerald-400 font-bold">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Mainnet Deployment Confirmed!</span>
                </div>
                <div className="text-slate-300 space-y-1">
                  <p><span className="text-slate-500">Transaction Hash:</span> <code className="font-mono text-xs text-cyan-300">{deploymentResult.txHash.slice(0, 20)}...</code></p>
                  <p><span className="text-slate-500">Gas Used:</span> <span className="font-mono tabular-nums">{deploymentResult.gasUsed.toLocaleString()}</span></p>
                  <p><span className="text-slate-500">Target Network:</span> {deploymentResult.chainName}</p>
                </div>
                <button
                  onClick={() => onSetActiveContract(deploymentResult.address)}
                  className="mt-2 w-full py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs rounded transition-colors"
                >
                  Set as Active Marketplace Protocol
                </button>
              </div>
            )}
          </div>

          {/* Deployment History Table */}
          <div className="p-6 rounded-2xl bg-slate-900/70 border border-slate-800 space-y-4">
            <h4 className="text-sm font-bold text-white">Deployment Registry History</h4>
            <div className="space-y-2 overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-300">
                <thead>
                  <tr className="border-b border-slate-800 text-[11px] text-slate-500 uppercase tracking-wider">
                    <th className="pb-2 font-medium">Contract</th>
                    <th className="pb-2 font-medium">Network</th>
                    <th className="pb-2 font-medium">Address</th>
                    <th className="pb-2 font-medium text-right">Gas</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 font-mono">
                  {deployedHistory.map((item, idx) => (
                    <tr key={idx} className="hover:bg-slate-900/40">
                      <td className="py-2.5 font-sans font-medium text-white">{item.contractName}</td>
                      <td className="py-2.5 font-sans text-slate-400">{item.chainName}</td>
                      <td className="py-2.5 text-cyan-400">
                        {item.address.slice(0, 6)}...{item.address.slice(-4)}
                      </td>
                      <td className="py-2.5 text-right tabular-nums text-slate-400">
                        {item.gasUsed.toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
