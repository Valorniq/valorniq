import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";
import cors from "cors";
import { cert, getApps, initializeApp as initializeAdminApp } from "firebase-admin/app";
import { getAuth as getAdminAuth } from "firebase-admin/auth";

dotenv.config();

const app = express();
const PORT = Number(process.env.PORT || 3000);

const allowedOrigins = (process.env.CORS_ORIGINS || "http://localhost:3000,http://localhost:5173")
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) return callback(null, true);
    return callback(new Error("Origin not allowed by CORS."));
  },
  credentials: false,
}));
app.use(express.json({ limit: "1mb" }));

function getAdminAuthIfConfigured() {
  const raw = process.env.FIREBASE_SERVICE_ACCOUNT_JSON;
  if (!raw) return null;

  if (getApps().length === 0) {
    const serviceAccount = JSON.parse(raw);
    initializeAdminApp({ credential: cert(serviceAccount) });
  }
  return getAdminAuth();
}

async function requireApiUser(req: express.Request, res: express.Response, next: express.NextFunction) {
  const authorization = req.header("Authorization");
  const adminAuth = getAdminAuthIfConfigured();

  if (!adminAuth) {
    if (process.env.NODE_ENV !== "production" && process.env.ALLOW_DEV_API_WITHOUT_AUTH === "true") {
      return next();
    }
    return res.status(503).json({ error: "Backend authentication is not configured." });
  }

  if (!authorization?.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Authentication required." });
  }

  try {
    const token = authorization.slice("Bearer ".length);
    const decoded = await adminAuth.verifyIdToken(token);
    res.locals.firebaseUser = decoded;
    return next();
  } catch {
    return res.status(401).json({ error: "Invalid or expired authentication token." });
  }
}

// Available structured tools for ARIS Copilot with Harvard Accounting & Math Core
const arisTools = [
  {
    functionDeclarations: [
      {
        name: "calculate_financial_metrics",
        description: "Executes Harvard Business School financial statement ratio analysis (DuPont 3-way ROE, Current Ratio, Quick Ratio, Working Capital, Gross/Net Margins, Cash Conversion Cycle).",
        parameters: {
          type: Type.OBJECT,
          properties: {
            analysisType: { 
              type: Type.STRING, 
              description: "Type of analysis: 'dupont_roe', 'liquidity_ratios', 'profitability_margins', 'cash_conversion_cycle', 'working_capital'" 
            },
            revenue: { type: Type.NUMBER, description: "Total period revenue in USD" },
            netIncome: { type: Type.NUMBER, description: "Net income in USD" },
            totalAssets: { type: Type.NUMBER, description: "Total balance sheet assets in USD" },
            equity: { type: Type.NUMBER, description: "Shareholders' equity in USD" },
            cash: { type: Type.NUMBER, description: "Cash and cash equivalents" },
            receivables: { type: Type.NUMBER, description: "Accounts receivable" },
            currentLiabilities: { type: Type.NUMBER, description: "Current liabilities" }
          },
          required: ["analysisType"]
        }
      },
      {
        name: "calculate_depreciation_schedule",
        description: "Computes periodic depreciation schedules for capital and non-monetary assets using Straight-Line, Double-Declining Balance (DDB), or MACRS.",
        parameters: {
          type: Type.OBJECT,
          properties: {
            assetName: { type: Type.STRING, description: "Name or tag of the fixed/capital asset" },
            method: { 
              type: Type.STRING, 
              description: "Depreciation method: 'straight_line' or 'double_declining_balance'" 
            },
            cost: { type: Type.NUMBER, description: "Initial acquisition cost in USD" },
            salvageValue: { type: Type.NUMBER, description: "Residual salvage value at end of useful life" },
            usefulLifeYears: { type: Type.INTEGER, description: "Estimated useful lifespan in years" }
          },
          required: ["assetName", "method", "cost", "usefulLifeYears"]
        }
      },
      {
        name: "generate_journal_entry",
        description: "Drafts a formal GAAP / IFRS double-entry journal entry with verified debit/credit parity and accounting equation impact.",
        parameters: {
          type: Type.OBJECT,
          properties: {
            transactionTitle: { type: Type.STRING, description: "Description of the economic transaction" },
            standard: { type: Type.STRING, description: "Applicable GAAP/IFRS standard (e.g., 'ASC 606', 'ASC 842', 'ASC 360')" },
            debitAccount: { type: Type.STRING, description: "Account title to debit (Dr.)" },
            creditAccount: { type: Type.STRING, description: "Account title to credit (Cr.)" },
            amount: { type: Type.NUMBER, description: "Transaction value in USD" },
            economicRationale: { type: Type.STRING, description: "Harvard accounting justification and accounting equation effect" }
          },
          required: ["transactionTitle", "debitAccount", "creditAccount", "amount"]
        }
      },
      {
        name: "evaluate_dcf_valuation",
        description: "Performs Discounted Cash Flow (DCF), Net Present Value (NPV), and capital budgeting valuation.",
        parameters: {
          type: Type.OBJECT,
          properties: {
            initialOutlay: { type: Type.NUMBER, description: "Initial capital expenditure or investment outlay" },
            discountRate: { type: Type.NUMBER, description: "Discount rate or WACC (e.g. 0.08 for 8%)" },
            cashFlows: { 
              type: Type.ARRAY, 
              items: { type: Type.NUMBER }, 
              description: "Array of projected undiscounted cash flows across future periods" 
            },
            terminalGrowthRate: { type: Type.NUMBER, description: "Perpetual terminal growth rate (e.g. 0.02 for 2%)" }
          },
          required: ["initialOutlay", "discountRate", "cashFlows"]
        }
      },
      {
        name: "calculate_break_even_cvp",
        description: "Computes Cost-Volume-Profit (CVP) break-even units, break-even revenue, contribution margin, and margin of safety.",
        parameters: {
          type: Type.OBJECT,
          properties: {
            fixedCosts: { type: Type.NUMBER, description: "Total fixed overhead and operating expenses" },
            unitPrice: { type: Type.NUMBER, description: "Selling price per unit in USD" },
            variableCostPerUnit: { type: Type.NUMBER, description: "Direct variable cost per unit in USD" }
          },
          required: ["fixedCosts", "unitPrice", "variableCostPerUnit"]
        }
      },
      {
        name: "create_lead",
        description: "Creates a new business opportunity or lead in the CRM pipeline.",
        parameters: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING, description: "Title of the opportunity or contract" },
            company: { type: Type.STRING, description: "Company name" },
            contactName: { type: Type.STRING, description: "Name of the primary contact person" },
            email: { type: Type.STRING, description: "Email of the contact" },
            value: { type: Type.NUMBER, description: "Estimated deal value in USD" },
            confidence: { type: Type.NUMBER, description: "Win probability confidence score from 0 to 100" }
          },
          required: ["title", "company", "value"]
        }
      },
      {
        name: "update_lead_stage",
        description: "Updates an existing lead stage in the sales pipeline.",
        parameters: {
          type: Type.OBJECT,
          properties: {
            leadId: { type: Type.STRING, description: "ID of the lead to update" },
            newStage: { 
              type: Type.STRING, 
              description: "Target stage: 'Lead', 'Contacted', 'Qualified', 'Proposal', 'Negotiation', 'Won', 'Lost'" 
            }
          },
          required: ["leadId", "newStage"]
        }
      },
      {
        name: "create_contact",
        description: "Adds a verified customer or business contact to the CRM Contacts ledger.",
        parameters: {
          type: Type.OBJECT,
          properties: {
            name: { type: Type.STRING, description: "Full name of the contact" },
            email: { type: Type.STRING, description: "Work email address" },
            company: { type: Type.STRING, description: "Associated company or employer" },
            role: { type: Type.STRING, description: "Job title or position" },
            phone: { type: Type.STRING, description: "Contact phone number" }
          },
          required: ["name", "email", "company"]
        }
      },
      {
        name: "draft_invoice",
        description: "Drafts a new enterprise invoice statement for a client.",
        parameters: {
          type: Type.OBJECT,
          properties: {
            clientName: { type: Type.STRING, description: "Client or company name to bill" },
            clientEmail: { type: Type.STRING, description: "Billing email" },
            amount: { type: Type.NUMBER, description: "Total billing amount in USD" },
            dueDate: { type: Type.STRING, description: "Payment due date (YYYY-MM-DD)" },
            description: { type: Type.STRING, description: "Description of goods or services delivered" }
          },
          required: ["clientName", "amount", "dueDate", "description"]
        }
      },
      {
        name: "create_product",
        description: "Registers a new inventory product SKU in stock tracking.",
        parameters: {
          type: Type.OBJECT,
          properties: {
            name: { type: Type.STRING, description: "Product name" },
            sku: { type: Type.STRING, description: "Stock Keeping Unit unique code" },
            price: { type: Type.NUMBER, description: "Unit sales price in USD" },
            stock: { type: Type.INTEGER, description: "Initial stock level count" },
            category: { type: Type.STRING, description: "Product category" }
          },
          required: ["name", "sku", "price", "stock"]
        }
      }
    ]
  }
];

// ARIS AI Assistant Server-side Endpoint (handles both /api/chat and /api/aris/chat)
app.post(["/api/chat", "/api/aris/chat"], requireApiUser, async (req, res) => {
  try {
    const message = req.body.message || req.body.prompt;
    const history = req.body.history || [];
    const context = req.body.context || {};

    if (!message) {
      return res.status(400).json({ error: "Empty prompt message parameter" });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return res.json({
        text: `**ARIS Offline Mode:** The AI provider is not configured on the backend. Local analytical tools may still be available in the browser.`,
        reply: `**ARIS Offline Mode:** The AI provider is not configured on the backend. Local analytical tools may still be available in the browser.`,
        toolCalls: [],
        toolCall: null
      });
    }

    // Lazy initialization of GoogleGenAI SDK
    const ai = new GoogleGenAI({
      apiKey: apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-valorniq'
        }
      }
    });

    const systemInstruction = `You are ARIS (Autonomous Resource Intelligence System), the chief financial architect and executive AI intelligence copilot of Valorniq 3.0 (competing with Odoo, NetSuite, and Workday).

ACADEMIC CREDENTIALS & PEDIGREE:
- You hold the equivalent of a Harvard Business School MBA with High Distinction (Baker Scholar), specializing in Financial and Managerial Accounting, Corporate Finance, and Financial Statement Analysis.
- You possess mastery of US GAAP (FASB Accounting Standards Codification) and IFRS (International Financial Reporting Standards).
- You are an expert in forensic accounting, COSO Internal Control frameworks, and SOX 404 compliance.
- You possess world-class mathematical and quantitative analytical skills: Time Value of Money (TVM), Discounted Cash Flows (DCF), DuPont 3-way and 5-way decomposition, Cost-Volume-Profit (CVP) analysis, regression forecasting, and multi-currency capital asset depreciation schedules.

CORE HARVARD ACCOUNTING LAWS & OPERATIONAL PRINCIPLES:
1. THE FUNDAMENTAL ACCOUNTING EQUATION IS SACROSANCT:
   Assets = Liabilities + Shareholders' Equity
   Every transaction must balance in debits and credits: Sum(Debits) = Sum(Credits).
   When presenting transactions, provide clear T-Account or tabular journal entries with Account Name, Classification (Asset/Liability/Equity/Revenue/Expense), Dr. amount, Cr. amount, and economic rationale.

2. THREE FINANCIAL STATEMENTS INTERCONNECTION:
   - Income Statement: Revenue recognition under ASC 606 (5-step framework: Contract, Performance Obligations, Transaction Price, Allocation, Satisfaction), Expense matching principle, Cost of Goods Sold (COGS), Operating Income (EBIT), and Net Income.
   - Balance Sheet: Clear delineation of Current vs. Non-Current Assets (Cash, AR, Inventory, PP&E), Current vs. Long-Term Liabilities (AP, Accrued Expenses, Long-term Debt), and Equity (Paid-in Capital, Retained Earnings).
   - Statement of Cash Flows: Direct and Indirect methods; reconciling Net Income to Cash from Operations (non-cash adjustments like Depreciation & Amortization, changes in working capital: Delta AR, Delta Inventory, Delta AP), Cash from Investing (CapEx), and Cash from Financing.

3. FINANCIAL RATIO & PERFORMANCE METRICS RIGOR:
   - DuPont ROE Analysis: Return on Equity = Net Profit Margin (Net Income / Revenue) * Asset Turnover (Revenue / Total Assets) * Financial Leverage (Total Assets / Equity).
   - Liquidity: Current Ratio (CA / CL), Quick / Acid-Test Ratio ((Cash + Marketable Securities + AR) / CL), Cash Ratio.
   - Solvency: Debt-to-Equity, Times Interest Earned (TIE = EBIT / Interest).
   - Efficiency: Days Sales Outstanding (DSO), Days Inventory Outstanding (DIO), Days Payable Outstanding (DPO), and Cash Conversion Cycle (CCC = DIO + DSO - DPO).

4. MANAGERIAL & COST ACCOUNTING:
   - Contribution Margin (CM = Price - Variable Cost), Contribution Margin Ratio (CMR = CM / Price).
   - Break-Even Analysis in units (FC / CM) and dollars (FC / CMR), Margin of Safety.
   - Capital budgeting: DCF, Net Present Value (NPV), Internal Rate of Return (IRR), Hurdle Rate comparisons.

5. ASSET & DEPRECIATION RIGOR:
   - Straight-Line: (Cost - Salvage) / Useful Life
   - Double-Declining Balance (DDB): (2 / Useful Life) * Beginning Book Value (never depreciating below salvage value)
   - Sum-of-the-Years'-Digits (SYD) & MACRS.

ACTIVE TENANT REAL-TIME DATA CONTEXT:
- Organization: ${context?.organization || "Valorniq Enterprise Tenant"}
- Active Module: ${context?.currentModule || "dashboard"}
- Open Leads Count: ${context?.leadsCount || context?.totalDeals || 0}
- Pipeline Quota Value: $${(context?.pipelineValue || 0).toLocaleString()}
- Invoiced Revenue (Settled): $${(context?.totalRevenue || 0).toLocaleString()}
- Inbound Receivables (Pending): $${(context?.pendingReceivables || 0).toLocaleString()}
- Cash Balances: Checking $${(context?.checkingBalance || 145000).toLocaleString()}, Savings $${(context?.savingsBalance || 350000).toLocaleString()}
- Inventory Products: ${context?.productsCount || context?.totalProducts || 0}
- Stock Valuation: $${(context?.inventoryValue || 0).toLocaleString()}
- Capital Assets Logged: ${context?.assetsCount || 0}

DETAILED RECORDS:
PIPELINES: ${context?.leadsData || "See context counts"}
INVOICES: ${context?.invoicesData || "See context counts"}
EXPENSES: ${context?.expensesData || "See context counts"}
PRODUCTS: ${context?.productsData || "See context counts"}

COMMUNICATION STYLE:
- Tone: Clear, concise, analytical, and professional. Explain complex ideas in plain language. Never pretend to be a licensed accountant, attorney, auditor, or financial adviser.
- Format: Present complex calculations in structured Markdown tables, step-by-step mathematical proofs, and concise executive takeaways.
- Tool Invocations: When asked to calculate ratios, depreciation, DCF, CVP, draft invoices, or create leads, invoke the appropriate structured tool call to maintain system ledger integrity.`;

    const contents: any[] = [];

    // Include recent history if provided
    if (Array.isArray(history)) {
      for (const h of history.slice(-6)) {
        contents.push({
          role: h.role === 'model' ? 'model' : 'user',
          parts: [{ text: h.text || '' }]
        });
      }
    }

    contents.push({
      role: "user",
      parts: [{ text: message }]
    });

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: contents,
      config: {
        systemInstruction: systemInstruction,
        tools: arisTools
      }
    });

    // Extract text and function call invocations
    let text = response.text || "";
    const toolCalls: any[] = [];

    if (response.functionCalls && response.functionCalls.length > 0) {
      for (const call of response.functionCalls) {
        toolCalls.push({
          name: call.name,
          args: call.args || {},
          status: 'pending'
        });
      }
    }

    res.json({
      text: text,
      reply: text,
      toolCalls: toolCalls,
      toolCall: toolCalls[0] || null
    });

  } catch (err: any) {
    console.error("Gemini server proxy issue:", err);
    res.status(500).json({ 
      error: "Failed to communicate with AI server", 
      details: process.env.NODE_ENV === "production" ? undefined : err?.message,
      text: "I encountered a communication error connecting to the neural reasoning service. Please check your network and API key settings.",
      reply: "I encountered a communication error connecting to the neural reasoning service. Please check your network and API key settings."
    });
  }
});

// Specifications document blueprint download endpoint
app.get("/api/download-blueprint", requireApiUser, (req, res) => {
  const blueprintData = {
    platform: "VALORNIQ Enterprise ERP + CRM Architecture Blueprint",
    version: "3.0.0-PROD",
    vision: "Modular, AI-enhanced business operating system replacing fragmented SaaS stacks.",
    architecture: {
      frontend: "React 19 + TypeScript + Tailwind CSS",
      backend: "Express API + Domain Services Layer",
      persistence: "Firestore Normalized Independent Collections + Ownership Isolation",
      ai: "ARIS Copilot with Structured Function Calling & Real-Time Context Grounding",
      security: "Multi-tenant RBAC, Cryptographic Tenant Isolation, FIPS-compliant audit trails"
    },
    modules: [
      { name: "Executive Hub", description: "Real-time KPIs, SVG financial curves, and boardroom slide deck compiler" },
      { name: "CRM Engine", description: "Companies, contacts, deal pipeline stages, and CSV bulk import/export" },
      { name: "Finance & Ledgers", description: "Invoices, cost centers, accounts balances, and P&L statements" },
      { name: "Inventory Control", description: "Products, SKUs, real-time stock levels, and replenishment alerts" },
      { name: "Sales Orders", description: "Order fulfillment, customer mappings, and manifest generation" },
      { name: "Identity & RBAC", description: "Team rosters, granular permission matrices, and device auditing" },
      { name: "ARIS AI Business Layer", description: "Structured function calls for authorized pipeline and invoice actions" }
    ]
  };
  res.setHeader("Content-Disposition", "attachment; filename=valorniq_platform_blueprint.json");
  res.setHeader("Content-Type", "application/json");
  res.json(blueprintData);
});

async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa"
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Valorniq enterprise platform running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
