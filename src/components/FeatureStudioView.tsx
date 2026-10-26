import React, { useState } from 'react';
import { FeatureModule } from '../types/web3';
import { 
  Sparkles, 
  Terminal, 
  Play, 
  CheckCircle, 
  Copy, 
  Check, 
  Download, 
  Layers, 
  Sliders, 
  Code2, 
  ShieldCheck,
  RefreshCw,
  Cpu
} from 'lucide-react';

interface FeatureStudioViewProps {
  features: FeatureModule[];
  onToggleFeature: (featureId: string) => void;
}

export const FeatureStudioView: React.FC<FeatureStudioViewProps> = ({
  features,
  onToggleFeature,
}) => {
  const [selectedFeatureId, setSelectedFeatureId] = useState<string>(features[0].id);
  const [testLogs, setTestLogs] = useState<string[]>([]);
  const [isRunningTests, setIsRunningTests] = useState<boolean>(false);
  const [copiedCode, setCopiedCode] = useState<boolean>(false);

  const activeFeature = features.find((f) => f.id === selectedFeatureId) || features[0];
  const enabledCount = features.filter((f) => f.enabled).length;

  const handleRunAllTests = () => {
    setIsRunningTests(true);
    setTestLogs([
      '[FORGE] Compiling 6 files with Solc 0.8.24 via-ir...',
      '[FORGE] Compiler run completed in 340ms (0 errors, 0 warnings)',
      '------------------------------------------------------------',
    ]);

    let logIndex = 0;
    const allTests = features
      .filter((f) => f.enabled)
      .flatMap((f) => f.unitTests);

    const interval = setInterval(() => {
      if (logIndex < allTests.length) {
        const test = allTests[logIndex];
        setTestLogs((prev) => [
          ...prev,
          `[PASS] ${test.name} (gas: ${test.gasUsed || 34500})`,
          `       └─ ${test.description}`,
        ]);
        logIndex++;
      } else {
        clearInterval(interval);
        setTestLogs((prev) => [
          ...prev,
          '------------------------------------------------------------',
          `Suite result: ok. ${allTests.length} passed; 0 failed; 0 ignored; finished in 48ms`,
          'Bytecode gas optimization index: A+ (via-ir runs=200)',
        ]);
        setIsRunningTests(false);
      }
    }, 280);
  };

  const generateSynthesizedContract = () => {
    const enabledFeatures = features.filter((f) => f.enabled);
    return `// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/interfaces/IERC2981.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/Ownable2Step.sol";
import "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";

/**
 * @title AetheriaProtocolExtended (Synthesized Protocol Engine)
 * @notice Compiled with ${enabledFeatures.length} modular feature extensions.
 */
contract AetheriaProtocolExtended is ERC721URIStorage, ReentrancyGuard, Ownable2Step {
    using ECDSA for bytes32;

    uint256 private _nextTokenId;
    string public baseContentGatewayUri;

    event ContentCreated(uint256 indexed tokenId, address indexed creator);

    constructor(string memory uri) 
        ERC721("Aetheria Content Protocol", "AETH") 
        Ownable(msg.sender) 
    {
        baseContentGatewayUri = uri;
    }

${enabledFeatures.map(f => f.solidityCode).join('\n\n')}

    function supportsInterface(bytes4 interfaceId)
        public
        view
        virtual
        override(ERC721URIStorage)
        returns (bool)
    {
        return super.supportsInterface(interfaceId);
    }
}`;
  };

  const synthesizedCode = generateSynthesizedContract();

  const handleCopyCode = () => {
    navigator.clipboard.writeText(synthesizedCode);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const handleDownloadSol = () => {
    const blob = new Blob([synthesizedCode], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'AetheriaProtocolExtended.sol';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-8 pb-16">
      {/* Studio Header */}
      <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-cyan-400">
            <Sliders className="w-4 h-4" />
            <span>Modular Smart Contract Extension Engine</span>
          </div>
          <h1 className="text-2xl font-bold text-white mt-1">
            Feature Synthesis & Unit Test Studio
          </h1>
          <p className="text-xs text-slate-400 mt-1 max-w-2xl">
            Configure dynamic Dutch auctions, multi-recipient royalty splits, off-chain EIP-712 lazy minting, and soulbound credentials. The protocol compiler synthesizes production Solidity bytecode.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleRunAllTests}
            disabled={isRunningTests}
            className="px-4 py-2 bg-gradient-to-r from-cyan-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 disabled:opacity-50 text-slate-950 font-bold text-xs rounded-lg transition-all flex items-center gap-2 shadow-md shadow-cyan-500/20 whitespace-nowrap"
          >
            <Play className={`w-3.5 h-3.5 fill-current ${isRunningTests ? 'animate-spin' : ''}`} />
            {isRunningTests ? 'Executing Unit Tests...' : 'Run Test Suite (Foundry)'}
          </button>
        </div>
      </div>

      {/* Feature Selector & Configurator */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Feature Modules List */}
        <div className="lg:col-span-5 space-y-3">
          <div className="flex items-center justify-between text-xs text-slate-400 px-1">
            <span>Modular Extensions ({enabledCount} / {features.length} Active)</span>
            <span>Toggle to Synthesize</span>
          </div>

          <div className="space-y-2.5">
            {features.map((feature) => {
              const isSelected = feature.id === selectedFeatureId;
              return (
                <div
                  key={feature.id}
                  onClick={() => setSelectedFeatureId(feature.id)}
                  className={`p-4 rounded-xl border text-xs cursor-pointer transition-all ${
                    isSelected
                      ? 'bg-slate-900/90 border-cyan-500/80 shadow-md shadow-cyan-950/40'
                      : 'bg-slate-900/40 border-slate-800/80 hover:bg-slate-900/70 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-mono text-cyan-400">
                      {feature.eipStandard}
                    </span>
                    {/* Toggle Switch */}
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onToggleFeature(feature.id);
                      }}
                      className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                        feature.enabled ? 'bg-cyan-500' : 'bg-slate-700'
                      }`}
                    >
                      <span
                        className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-slate-950 shadow ring-0 transition duration-200 ease-in-out ${
                          feature.enabled ? 'translate-x-4' : 'translate-x-0'
                        }`}
                      />
                    </button>
                  </div>

                  <h3 className="text-sm font-semibold text-white mt-1.5">
                    {feature.title}
                  </h3>
                  <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                    {feature.summary}
                  </p>

                  <div className="flex items-center justify-between mt-3 pt-2.5 border-t border-slate-800/70 text-[11px]">
                    <span className="text-slate-500">Gas Impact</span>
                    <span className="font-mono tabular-nums text-slate-300">
                      {feature.gasImpact}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: Code Generator & Unit Test Console */}
        <div className="lg:col-span-7 space-y-6">
          {/* Synthesized Solidity Code Preview */}
          <div className="rounded-xl bg-[#090d16] border border-slate-800 overflow-hidden flex flex-col">
            <div className="flex items-center justify-between px-4 py-3 bg-slate-950/80 border-b border-slate-800 text-xs">
              <div className="flex items-center gap-2">
                <Code2 className="w-4 h-4 text-cyan-400" />
                <span className="font-mono text-white font-medium">AetheriaProtocolExtended.sol</span>
                <span className="text-slate-500 font-mono">({enabledCount} modules merged)</span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={handleCopyCode}
                  className="px-2.5 py-1 bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white rounded text-xs transition-colors flex items-center gap-1"
                >
                  {copiedCode ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedCode ? 'Copied' : 'Copy'}</span>
                </button>
                <button
                  onClick={handleDownloadSol}
                  className="px-2.5 py-1 bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white rounded text-xs transition-colors flex items-center gap-1"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download .sol</span>
                </button>
              </div>
            </div>

            <div className="p-4 font-mono text-xs overflow-x-auto max-h-[380px] text-slate-300 leading-relaxed">
              <pre className="whitespace-pre">
                {synthesizedCode}
              </pre>
            </div>
          </div>

          {/* Unit Test Execution Terminal */}
          <div className="rounded-xl bg-slate-950 border border-slate-800 overflow-hidden">
            <div className="flex items-center justify-between px-4 py-2.5 bg-slate-900/80 border-b border-slate-800 text-xs">
              <div className="flex items-center gap-2">
                <Terminal className="w-4 h-4 text-emerald-400" />
                <span className="font-mono text-slate-200">Foundry Test Runner Console</span>
              </div>
              <span className="text-[11px] font-mono text-slate-500">solc 0.8.24 via-ir</span>
            </div>

            <div className="p-4 font-mono text-xs text-slate-300 min-h-[160px] max-h-[220px] overflow-y-auto space-y-1">
              {testLogs.length === 0 ? (
                <div className="text-slate-500 italic">
                  No active test run. Click "Run Test Suite (Foundry)" above to simulate automated regression testing and gas validation.
                </div>
              ) : (
                testLogs.map((log, i) => (
                  <div
                    key={i}
                    className={`${
                      log.includes('[PASS]')
                        ? 'text-emerald-400'
                        : log.includes('Suite result')
                        ? 'text-cyan-400 font-bold'
                        : 'text-slate-400'
                    }`}
                  >
                    {log}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
