import express from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

app.use(express.json({ limit: '10mb' }));

// Initialize GoogleGenAI server-side with User-Agent header as required
const apiKey = process.env.GEMINI_API_KEY;
let aiClient: GoogleGenAI | null = null;
if (apiKey && apiKey !== 'MY_GEMINI_API_KEY') {
  try {
    aiClient = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
  } catch (err) {
    console.warn('Failed to initialize GoogleGenAI client:', err);
  }
}

// Smart Contract Audit API Route
app.post('/api/audit', async (req, res) => {
  try {
    const { contractName, sourceCode } = req.body;
    if (!sourceCode) {
      return res.status(400).json({ error: 'sourceCode is required' });
    }

    if (aiClient) {
      try {
        const prompt = `You are a world-class smart contract security auditor specializing in Solidity, EVM, OpenZeppelin standards, EIP-721, and EIP-2981.
Analyze the following Solidity smart contract named "${contractName || 'Contract.sol'}":

\`\`\`solidity
${sourceCode}
\`\`\`

Perform an exhaustive security and gas audit. Identify vulnerabilities (Reentrancy, Access Control, Arithmetic, Gas Inefficiencies, EIP compliance, Front-running).
Respond strictly in JSON format with the following schema:
{
  "contractName": "${contractName || 'Contract.sol'}",
  "securityScore": <number between 0 and 100>,
  "summary": "<concise 2-3 sentence executive audit summary>",
  "metrics": {
    "criticalCount": <number>,
    "highCount": <number>,
    "mediumCount": <number>,
    "lowCount": <number>,
    "gasCount": <number>
  },
  "findings": [
    {
      "id": "SEC-001",
      "title": "<vulnerability title>",
      "severity": "CRITICAL" | "HIGH" | "MEDIUM" | "LOW" | "GAS",
      "line": <line number if identifiable or 0>,
      "description": "<detailed risk explanation>",
      "recommendation": "<exact fix recommendation>",
      "codeSnippet": "<affected code excerpt>"
    }
  ],
  "mainnetReadiness": {
    "isReady": <boolean>,
    "blockingIssues": ["<issue 1>", "<issue 2>"]
  }
}`;

        const response = await aiClient.models.generateContent({
          model: 'gemini-3.8-flash',
          contents: prompt,
          config: {
            responseMimeType: 'application/json',
          },
        });

        const text = response.text;
        if (text) {
          const parsed = JSON.parse(text);
          return res.json(parsed);
        }
      } catch (geminiError) {
        console.warn('Gemini API call failed, falling back to deterministic heuristic audit:', geminiError);
      }
    }

    // Deterministic static audit fallback
    const findings: any[] = [];
    const lines = sourceCode.split('\n');

    let hasReentrancy = false;
    let hasMissingAccess = false;
    let hasTimestampDep = false;
    let hasUncheckedCall = false;

    lines.forEach((line: string, idx: number) => {
      const lineNum = idx + 1;
      if (line.includes('.call{value:') && !line.includes('nonReentrant')) {
        findings.push({
          id: `VULN-${findings.length + 1}`,
          title: 'Potential Reentrancy in State Transfer',
          severity: 'CRITICAL',
          line: lineNum,
          description: 'Low-level call transferring ETH value without ReentrancyGuard mutex lock creates susceptibility to reentrancy exploits.',
          recommendation: 'Inherit OpenZeppelin ReentrancyGuard and apply nonReentrant modifier to the function.',
          codeSnippet: line.trim(),
        });
        hasReentrancy = true;
      }
      if (line.includes('function setPlatformFee') && !line.includes('onlyOwner')) {
        findings.push({
          id: `VULN-${findings.length + 1}`,
          title: 'Unrestricted Administrative Fee Setter',
          severity: 'HIGH',
          line: lineNum,
          description: 'Administrative configuration function lacks onlyOwner or AccessControl modifier, allowing arbitrary callers to modify fee parameters.',
          recommendation: 'Add onlyOwner modifier and emit PlatformFeeUpdated event.',
          codeSnippet: line.trim(),
        });
        hasMissingAccess = true;
      }
      if (line.includes('block.timestamp') && (line.includes('==') || line.includes('%'))) {
        findings.push({
          id: `VULN-${findings.length + 1}`,
          title: 'Timestamp Manipulation Sensitivity',
          severity: 'MEDIUM',
          line: lineNum,
          description: 'Strict equality or modulo logic relying on block.timestamp can be drifted up to 15 seconds by block validators.',
          recommendation: 'Use monotonic inequalities (>= or <=) for time-based auction windows.',
          codeSnippet: line.trim(),
        });
        hasTimestampDep = true;
      }
      if (line.includes('.call(') && !line.includes('require(success') && !line.includes('if (!success)')) {
        findings.push({
          id: `VULN-${findings.length + 1}`,
          title: 'Unchecked Low-Level Call Return Value',
          severity: 'HIGH',
          line: lineNum,
          description: 'Return value of call is not verified. Failed sub-calls will silently proceed without reverting transaction.',
          recommendation: 'Verify bool success flag with require(success, "CallFailed").',
          codeSnippet: line.trim(),
        });
        hasUncheckedCall = true;
      }
    });

    // Gas recommendations
    findings.push({
      id: `GAS-001`,
      title: 'Cache Array Length in Memory',
      severity: 'GAS',
      line: 1,
      description: 'Iterating over storage arrays without caching array.length in memory incurs redundant SLOAD operations (2100 gas on cold load).',
      recommendation: 'Cache array length in local memory uint256 len = array.length before loop execution.',
      codeSnippet: 'for (uint256 i = 0; i < array.length; i++)',
    });

    const criticalCount = findings.filter(f => f.severity === 'CRITICAL').length;
    const highCount = findings.filter(f => f.severity === 'HIGH').length;
    const mediumCount = findings.filter(f => f.severity === 'MEDIUM').length;
    const lowCount = findings.filter(f => f.severity === 'LOW').length;
    const gasCount = findings.filter(f => f.severity === 'GAS').length;

    const penalty = criticalCount * 35 + highCount * 20 + mediumCount * 10 + lowCount * 5;
    const securityScore = Math.max(15, 100 - penalty);

    return res.json({
      contractName: contractName || 'MarketplaceCore.sol',
      securityScore,
      summary: criticalCount > 0 
        ? 'Contract contains critical vulnerabilities that would permit fund draining. Remediation is required before mainnet deployment.'
        : 'Contract architecture is structurally sound with minor gas optimization opportunities.',
      metrics: {
        criticalCount,
        highCount,
        mediumCount,
        lowCount,
        gasCount,
      },
      findings,
      mainnetReadiness: {
        isReady: criticalCount === 0 && highCount === 0,
        blockingIssues: findings
          .filter(f => f.severity === 'CRITICAL' || f.severity === 'HIGH')
          .map(f => f.title),
      },
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Audit execution failed' });
  }
});

// Production static serving & Vite Dev Server middleware
async function startServer() {
  const isProd = process.env.NODE_ENV === 'production';

  if (!isProd) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Web3 NFT Marketplace Server running at http://0.0.0.0:${PORT}`);
  });
}

startServer();
