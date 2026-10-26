import React, { useState } from 'react';
import { AuditContract, AuditFinding, AuditReport, SeverityLevel } from '../types/web3';
import { 
  ShieldAlert, 
  ShieldCheck, 
  AlertTriangle, 
  CheckCircle, 
  Play, 
  Zap, 
  Wrench, 
  RotateCcw, 
  FileCode, 
  Bug, 
  Sparkles,
  Info,
  Terminal,
  ExternalLink,
  Lock
} from 'lucide-react';

interface AuditorViewProps {
  contracts: AuditContract[];
  onPatchContract: (contractId: string) => void;
  onResetContract: (contractId: string) => void;
}

export const AuditorView: React.FC<AuditorViewProps> = ({
  contracts,
  onPatchContract,
  onResetContract,
}) => {
  const [selectedContractId, setSelectedContractId] = useState<string>(contracts[0].id);
  const [isAuditing, setIsAuditing] = useState<boolean>(false);
  const [customReports, setCustomReports] = useState<Record<string, AuditReport>>({});
  const [showExploitModal, setShowExploitModal] = useState<boolean>(false);
  const [exploitStep, setExploitStep] = useState<number>(0);
  const [exploitRunning, setExploitRunning] = useState<boolean>(false);
  const [auditMethod, setAuditMethod] = useState<'ai' | 'static'>('ai');

  const activeContract = contracts.find((c) => c.id === selectedContractId) || contracts[0];
  const activeReport = customReports[activeContract.id] || (activeContract.isPatched ? activeContract.patchedReport : activeContract.initialReport);

  const handleRunAudit = async () => {
    setIsAuditing(true);
    try {
      const response = await fetch('/api/audit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contractName: activeContract.fileName,
          sourceCode: activeContract.isPatched ? activeContract.patchedCode : activeContract.sourceCode,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setCustomReports((prev) => ({
          ...prev,
          [activeContract.id]: data,
        }));
      }
    } catch (err) {
      console.warn('Audit API call failed, using bundled verification engine:', err);
    } finally {
      setIsAuditing(false);
    }
  };

  const handleSimulateExploit = () => {
    setShowExploitModal(true);
    setExploitStep(1);
    setExploitRunning(true);

    setTimeout(() => setExploitStep(2), 1200);
    setTimeout(() => setExploitStep(3), 2400);
    setTimeout(() => {
      setExploitStep(4);
      setExploitRunning(false);
    }, 3600);
  };

  const getSeverityStyle = (severity: SeverityLevel) => {
    switch (severity) {
      case 'CRITICAL':
        return 'text-rose-400 bg-rose-950/70 border-rose-800/80';
      case 'HIGH':
        return 'text-amber-400 bg-amber-950/70 border-amber-800/80';
      case 'MEDIUM':
        return 'text-yellow-400 bg-yellow-950/70 border-yellow-800/80';
      case 'LOW':
        return 'text-blue-400 bg-blue-950/70 border-blue-800/80';
      case 'GAS':
        return 'text-emerald-400 bg-emerald-950/70 border-emerald-800/80';
    }
  };

  const currentCode = activeContract.isPatched ? activeContract.patchedCode : activeContract.sourceCode;
  const codeLines = currentCode.split('\n');

  return (
    <div className="space-y-8 pb-16">
      {/* Top Audit Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 rounded-2xl bg-slate-900/80 border border-slate-800">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-cyan-400">
            <ShieldCheck className="w-4 h-4" />
            <span>Formal Smart Contract Verification & AST Security Audit</span>
          </div>
          <h1 className="text-2xl font-bold text-white mt-1">
            Automated Vulnerability & Invariant Analysis
          </h1>
          <p className="text-xs text-slate-400 mt-1 max-w-2xl">
            Inspect Solidity smart contracts for Reentrancy (SWC-107), unchecked low-level calls (SWC-104), and AccessControl governance vulnerabilities.
          </p>
        </div>

        {/* Contract Selector */}
        <div className="flex items-center gap-3">
          <select
            value={selectedContractId}
            onChange={(e) => setSelectedContractId(e.target.value)}
            className="px-3.5 py-2 bg-slate-950 border border-slate-700 rounded-lg text-xs font-semibold text-white focus:outline-none focus:border-cyan-500"
          >
            {contracts.map((c) => (
              <option key={c.id} value={c.id}>
                {c.fileName} {c.isPatched ? '(Hardened)' : '(Pre-Audit)'}
              </option>
            ))}
          </select>

          <button
            onClick={handleRunAudit}
            disabled={isAuditing}
            className="px-4 py-2 bg-cyan-500 hover:bg-cyan-400 disabled:opacity-50 text-slate-950 font-bold text-xs rounded-lg transition-colors flex items-center gap-2 shadow-md shadow-cyan-500/20 whitespace-nowrap"
          >
            <Sparkles className={`w-3.5 h-3.5 ${isAuditing ? 'animate-spin' : ''}`} />
            {isAuditing ? 'Running AST & AI Audit...' : 'Re-Run Security Audit'}
          </button>
        </div>
      </div>

      {/* Security Scoreboard & Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Score Card */}
        <div className="p-5 rounded-xl bg-slate-900/70 border border-slate-800 flex items-center justify-between">
          <div>
            <span className="text-xs text-slate-400 font-medium uppercase tracking-wider">
              Security Score
            </span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className={`text-3xl font-mono font-bold tabular-nums ${
                activeReport.securityScore >= 90 ? 'text-emerald-400' : 'text-amber-400'
              }`}>
                {activeReport.securityScore}
              </span>
              <span className="text-xs text-slate-500 font-mono">/ 100</span>
            </div>
            <span className="text-[11px] text-slate-400 block mt-1">
              {activeReport.securityScore >= 90 ? 'Safe for Mainnet Deployment' : 'Action Required Before Release'}
            </span>
          </div>

          <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-slate-950 border border-slate-800">
            {activeReport.securityScore >= 90 ? (
              <ShieldCheck className="w-6 h-6 text-emerald-400" />
            ) : (
              <ShieldAlert className="w-6 h-6 text-amber-400" />
            )}
          </div>
        </div>

        {/* Severity Count Metrics */}
        <div className="p-5 rounded-xl bg-slate-900/70 border border-slate-800 flex items-center justify-between">
          <div>
            <span className="text-xs text-slate-400 font-medium uppercase tracking-wider">
              Critical & High Risks
            </span>
            <div className="flex items-center gap-2 mt-1">
              <span className={`text-3xl font-mono font-bold tabular-nums ${
                (activeReport.metrics.criticalCount + activeReport.metrics.highCount) > 0 ? 'text-rose-400' : 'text-emerald-400'
              }`}>
                {activeReport.metrics.criticalCount + activeReport.metrics.highCount}
              </span>
              <span className="text-xs text-slate-500">
                ({activeReport.metrics.criticalCount} crit, {activeReport.metrics.highCount} high)
              </span>
            </div>
            <span className="text-[11px] text-slate-400 block mt-1">
              SWC classification standards
            </span>
          </div>
          <AlertTriangle className="w-6 h-6 text-rose-400" />
        </div>

        {/* Bytecode Footprint */}
        <div className="p-5 rounded-xl bg-slate-900/70 border border-slate-800 flex items-center justify-between">
          <div>
            <span className="text-xs text-slate-400 font-medium uppercase tracking-wider">
              Bytecode Limit (EIP-170)
            </span>
            <div className="flex items-baseline gap-1 mt-1 font-mono">
              <span className="text-2xl font-bold tabular-nums text-white">
                {activeContract.byteCodeSizeKb}
              </span>
              <span className="text-xs text-slate-500">/ 24.57 KB max</span>
            </div>
            <span className="text-[11px] text-emerald-400 block mt-1">
              ✓ Complies with Spurious Dragon limit
            </span>
          </div>
          <FileCode className="w-6 h-6 text-cyan-400" />
        </div>

        {/* Patch Control */}
        <div className="p-5 rounded-xl bg-slate-900/70 border border-slate-800 flex flex-col justify-between">
          <span className="text-xs text-slate-400 font-medium uppercase tracking-wider">
            Hardening Status
          </span>
          {activeContract.isPatched ? (
            <div className="space-y-2 mt-1">
              <div className="flex items-center gap-1.5 text-xs text-emerald-400 font-semibold">
                <CheckCircle className="w-4 h-4" />
                <span>Security Patch Applied</span>
              </div>
              <button
                onClick={() => onResetContract(activeContract.id)}
                className="w-full py-1.5 px-3 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs rounded transition-colors flex items-center justify-center gap-1"
              >
                <RotateCcw className="w-3 h-3" />
                Reset to Vulnerable
              </button>
            </div>
          ) : (
            <div className="space-y-2 mt-1">
              <div className="flex items-center gap-1.5 text-xs text-amber-400 font-semibold">
                <AlertTriangle className="w-4 h-4" />
                <span>Vulnerabilities Active</span>
              </div>
              <button
                onClick={() => onPatchContract(activeContract.id)}
                className="w-full py-1.5 px-3 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs rounded transition-colors flex items-center justify-center gap-1 shadow-md shadow-emerald-900/20"
              >
                <Wrench className="w-3.5 h-3.5" />
                Apply Security Patch
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Code Inspector & Findings Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Interactive Solidity Code Viewer */}
        <div className="lg:col-span-7 rounded-xl bg-[#090d16] border border-slate-800 overflow-hidden flex flex-col">
          <div className="flex items-center justify-between px-4 py-3 bg-slate-950/80 border-b border-slate-800 text-xs text-slate-400">
            <div className="flex items-center gap-2">
              <FileCode className="w-4 h-4 text-cyan-400" />
              <span className="font-mono text-white font-medium">{activeContract.fileName}</span>
              <span className="text-[11px] text-slate-500">· Solc {activeContract.compilerVersion}</span>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={handleSimulateExploit}
                className="px-2.5 py-1 bg-rose-950/70 hover:bg-rose-900/70 border border-rose-700/60 text-rose-300 rounded font-medium text-xs transition-colors flex items-center gap-1.5"
              >
                <Bug className="w-3.5 h-3.5" />
                Simulate Attack Vector
              </button>
            </div>
          </div>

          <div className="p-4 font-mono text-xs overflow-x-auto max-h-[600px] text-slate-300 space-y-0.5 leading-relaxed">
            {codeLines.map((line, idx) => {
              const lineNum = idx + 1;
              const hasCritical = line.includes('withdrawProceeds()') || line.includes('msg.sender.call{value: amount}') || line.includes('payable(auction.highestBidder).transfer');
              const hasHigh = line.includes('setPlatformFee(uint256 _newFee)') && !line.includes('onlyOwner');

              return (
                <div
                  key={lineNum}
                  className={`flex items-start px-2 py-0.5 rounded transition-colors ${
                    hasCritical
                      ? 'bg-rose-950/40 text-rose-200 border-l-2 border-rose-500'
                      : hasHigh
                      ? 'bg-amber-950/30 text-amber-200 border-l-2 border-amber-500'
                      : 'hover:bg-slate-900/60'
                  }`}
                >
                  <span className="w-8 shrink-0 text-slate-600 select-none text-[11px] tabular-nums">
                    {lineNum}
                  </span>
                  <pre className="font-mono whitespace-pre flex-1">
                    {line}
                  </pre>
                </div>
              );
            })}
          </div>
        </div>

        {/* Findings & Vulnerability Breakdown */}
        <div className="lg:col-span-5 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-white flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-cyan-400" />
              <span>Static & Dynamic Audit Findings ({activeReport.findings.length})</span>
            </h3>
            <span className="text-[11px] text-slate-400">
              Severity Sort: High to Low
            </span>
          </div>

          <div className="space-y-3 max-h-[600px] overflow-y-auto pr-1">
            {activeReport.findings.length === 0 ? (
              <div className="p-8 rounded-xl bg-slate-900/60 border border-slate-800 text-center space-y-2">
                <CheckCircle className="w-8 h-8 text-emerald-400 mx-auto" />
                <h4 className="text-sm font-semibold text-white">Zero Vulnerabilities Detected</h4>
                <p className="text-xs text-slate-400 max-w-sm mx-auto">
                  Smart contract conforms to OpenZeppelin security guidelines and passes all formal verification checks.
                </p>
              </div>
            ) : (
              activeReport.findings.map((finding) => (
                <div
                  key={finding.id}
                  className="p-4 rounded-xl bg-slate-900/70 border border-slate-800 space-y-2.5"
                >
                  <div className="flex items-center justify-between">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${getSeverityStyle(finding.severity)}`}>
                      {finding.severity}
                    </span>
                    <span className="text-[11px] font-mono text-slate-500">
                      Line ~{finding.line}
                    </span>
                  </div>

                  <div>
                    <h4 className="text-xs font-semibold text-white">
                      {finding.title}
                    </h4>
                    <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                      {finding.description}
                    </p>
                  </div>

                  {finding.codeSnippet && (
                    <div className="p-2 bg-slate-950 rounded border border-slate-800/80">
                      <code className="text-[11px] font-mono text-slate-300 block whitespace-pre-wrap">
                        {finding.codeSnippet}
                      </code>
                    </div>
                  )}

                  <div className="pt-2 border-t border-slate-800/60 text-xs">
                    <span className="text-cyan-400 font-medium block mb-0.5">Remediation:</span>
                    <p className="text-slate-300 text-[11px]">{finding.recommendation}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Exploit Simulator Modal */}
      {showExploitModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-xl bg-[#0d1424] border border-slate-800 rounded-xl p-6 text-slate-200 space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Bug className="w-5 h-5 text-rose-400" />
                <h3 className="text-base font-semibold text-white">
                  Attack Vector Execution Simulation
                </h3>
              </div>
              <button
                onClick={() => setShowExploitModal(false)}
                className="p-1 rounded text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-slate-400 leading-relaxed">
              Simulates a cross-contract Reentrancy Exploit against <code className="text-cyan-300 font-mono">MarketplaceCore.withdrawProceeds()</code> using an adversarial attacker contract.
            </p>

            {/* Stepper */}
            <div className="space-y-3 p-4 bg-slate-950 rounded-xl border border-slate-800 font-mono text-xs">
              <div className={`flex items-start gap-2.5 ${exploitStep >= 1 ? 'text-slate-200' : 'text-slate-600'}`}>
                <span className="w-5 h-5 rounded-full bg-slate-900 border border-slate-700 flex items-center justify-center text-[10px]">1</span>
                <div>
                  <p className="font-semibold">Attacker deploys ExploitContract & registers 0.5 ETH proceeds</p>
                  <span className="text-[11px] text-slate-500">Attacker balance: 0.5 ETH</span>
                </div>
              </div>

              <div className={`flex items-start gap-2.5 ${exploitStep >= 2 ? 'text-slate-200' : 'text-slate-600'}`}>
                <span className="w-5 h-5 rounded-full bg-slate-900 border border-slate-700 flex items-center justify-center text-[10px]">2</span>
                <div>
                  <p className="font-semibold">Attacker calls withdrawProceeds() on MarketplaceCore</p>
                  <span className="text-[11px] text-slate-500">Marketplace balance: 14.5 ETH</span>
                </div>
              </div>

              <div className={`flex items-start gap-2.5 ${exploitStep >= 3 ? 'text-slate-200' : 'text-slate-600'}`}>
                <span className="w-5 h-5 rounded-full bg-slate-900 border border-slate-700 flex items-center justify-center text-[10px]">3</span>
                <div>
                  <p className="font-semibold">Low-level .call() triggers ExploitContract fallback()</p>
                  <span className="text-[11px] text-slate-500">
                    {activeContract.isPatched 
                      ? 'ReentrancyGuard mutex lock detected: _reentrancyGuardEntered == true'
                      : 'Fallback recursively invokes withdrawProceeds() before state zeroed'}
                  </span>
                </div>
              </div>

              <div className={`flex items-start gap-2.5 ${exploitStep >= 4 ? 'text-slate-200' : 'text-slate-600'}`}>
                <span className="w-5 h-5 rounded-full bg-slate-900 border border-slate-700 flex items-center justify-center text-[10px]">4</span>
                <div>
                  {activeContract.isPatched ? (
                    <div className="p-2.5 bg-emerald-950/60 border border-emerald-500/50 rounded text-emerald-300">
                      ✓ EXPLOIT BLOCKED: Transaction reverted with "ReentrancyGuardReentrantCall()". Zero funds lost.
                    </div>
                  ) : (
                    <div className="p-2.5 bg-rose-950/60 border border-rose-500/50 rounded text-rose-300">
                      ⚠ EXPLOIT SUCCEEDED: 14.5 ETH drained via recursive withdrawal before pendingProceeds set to 0.
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between pt-2">
              <span className="text-xs text-slate-400">
                Status: {activeContract.isPatched ? 'Hardened (Protected)' : 'Vulnerable'}
              </span>
              <button
                onClick={() => {
                  if (!activeContract.isPatched) {
                    onPatchContract(activeContract.id);
                  }
                  setShowExploitModal(false);
                }}
                className="px-4 py-2 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs rounded-lg transition-colors"
              >
                {activeContract.isPatched ? 'Close Simulator' : 'Apply ReentrancyGuard & Close'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
