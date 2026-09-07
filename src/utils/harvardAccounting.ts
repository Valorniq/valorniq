/**
 * Harvard Business School Financial & Managerial Accounting Core Engine
 * Rigorous mathematical and accounting frameworks for Valorniq ARIS AI
 * Compliant with US GAAP (FASB ASC) & IFRS (IASB) standards.
 */

export interface JournalLine {
  account: string;
  debit: number;
  credit: number;
  classification: 'Asset' | 'Liability' | 'Equity' | 'Revenue' | 'Expense';
  rationale: string;
}

export interface JournalEntryResult {
  title: string;
  date: string;
  standard: string;
  lines: JournalLine[];
  totalDebit: number;
  totalCredit: number;
  isBalanced: boolean;
  accountingEquationEffect: {
    assetsChange: number;
    liabilitiesChange: number;
    equityChange: number;
  };
  executiveMemo: string;
}

export interface DepreciationYear {
  year: number;
  beginningBookValue: number;
  depreciationExpense: number;
  accumulatedDepreciation: number;
  endingBookValue: number;
}

export interface DepreciationSchedule {
  assetName: string;
  cost: number;
  salvageValue: number;
  usefulLife: number;
  method: 'Straight-Line' | 'Double-Declining-Balance' | 'Sum-of-Years-Digits' | 'MACRS-5Yr';
  schedule: DepreciationYear[];
  totalDepreciation: number;
}

export interface DuPontAnalysisResult {
  netProfitMargin: number; // Net Income / Revenue
  assetTurnover: number;   // Revenue / Total Assets
  financialLeverage: number; // Total Assets / Equity
  roe: number;             // Return on Equity
  netIncome: number;
  revenue: number;
  totalAssets: number;
  equity: number;
  insights: string[];
}

export interface FinancialRatiosResult {
  currentRatio: number;
  quickRatio: number;
  cashRatio: number;
  workingCapital: number;
  grossMarginPercent: number;
  operatingMarginPercent: number;
  netMarginPercent: number;
  debtToEquity: number;
  daysSalesOutstanding: number;
  cashConversionCycle: number;
  assessment: string;
}

export interface BreakEvenAnalysisResult {
  unitPrice: number;
  variableCostPerUnit: number;
  fixedCosts: number;
  contributionMargin: number;
  contributionMarginRatio: number;
  breakEvenUnits: number;
  breakEvenRevenue: number;
  marginOfSafetyUnits?: number;
  marginOfSafetyRevenue?: number;
}

export interface DCFValuationResult {
  discountRate: number; // WACC
  initialOutlay: number;
  projectedCashFlows: { year: number; undiscounted: number; discounted: number }[];
  pvOfCashFlows: number;
  terminalValue?: number;
  pvOfTerminalValue?: number;
  netPresentValue: number;
  profitabilityIndex: number;
  verdict: 'Accretive (Accept)' | 'Dilutive (Reject)' | 'Marginal';
}

/**
 * Perform DuPont 3-Way Analysis of Return on Equity (ROE)
 * ROE = (Net Profit Margin) * (Asset Turnover) * (Equity Multiplier)
 */
export function calculateDuPontROE(
  netIncome: number,
  revenue: number,
  totalAssets: number,
  equity: number
): DuPontAnalysisResult {
  const safeRev = revenue > 0 ? revenue : 1;
  const safeAssets = totalAssets > 0 ? totalAssets : 1;
  const safeEquity = equity > 0 ? equity : 1;

  const netProfitMargin = (netIncome / safeRev) * 100;
  const assetTurnover = revenue / safeAssets;
  const financialLeverage = totalAssets / safeEquity;
  const roe = (netIncome / safeEquity) * 100;

  const insights: string[] = [];
  if (netProfitMargin < 15) {
    insights.push("Operating efficiency / net margin is below Harvard benchmark 15%; investigate pricing leverage and SG&A cost controls.");
  } else {
    insights.push("Robust net profit margin demonstrates superior value capture and pricing power.");
  }

  if (assetTurnover < 1.0) {
    insights.push("Asset turnover under 1.0x indicates potential asset underutilization or high capital intensity.");
  } else {
    insights.push(`Healthy asset turnover of ${assetTurnover.toFixed(2)}x indicates productive deployment of operating assets.`);
  }

  if (financialLeverage > 2.5) {
    insights.push("Financial leverage exceeds 2.5x; high debt amplification increases financial risk profile.");
  } else {
    insights.push("Conservative capital structure provides strong solvency cushion against macro shocks.");
  }

  return {
    netProfitMargin,
    assetTurnover,
    financialLeverage,
    roe,
    netIncome,
    revenue,
    totalAssets,
    equity,
    insights
  };
}

/**
 * Generate Comparative Depreciation Schedules
 * Supports Straight-Line and Double-Declining-Balance (DDB)
 */
export function calculateDepreciation(
  assetName: string,
  cost: number,
  salvageValue: number,
  usefulLife: number,
  method: 'Straight-Line' | 'Double-Declining-Balance' = 'Straight-Line'
): DepreciationSchedule {
  const schedule: DepreciationYear[] = [];
  let currentBookValue = cost;
  let accumulated = 0;

  if (method === 'Straight-Line') {
    const annualExpense = Math.max(0, (cost - salvageValue) / Math.max(1, usefulLife));
    for (let yr = 1; yr <= usefulLife; yr++) {
      const exp = yr === usefulLife ? currentBookValue - salvageValue : Math.min(annualExpense, currentBookValue - salvageValue);
      accumulated += exp;
      const ending = cost - accumulated;
      schedule.push({
        year: yr,
        beginningBookValue: currentBookValue,
        depreciationExpense: exp,
        accumulatedDepreciation: accumulated,
        endingBookValue: ending
      });
      currentBookValue = ending;
    }
  } else {
    // Double Declining Balance: Rate = 2 / N
    const ddbRate = 2 / usefulLife;
    for (let yr = 1; yr <= usefulLife; yr++) {
      let exp = currentBookValue * ddbRate;
      // DDB cannot depreciate below salvage value
      if (currentBookValue - exp < salvageValue) {
        exp = Math.max(0, currentBookValue - salvageValue);
      }
      accumulated += exp;
      const ending = cost - accumulated;
      schedule.push({
        year: yr,
        beginningBookValue: currentBookValue,
        depreciationExpense: exp,
        accumulatedDepreciation: accumulated,
        endingBookValue: ending
      });
      currentBookValue = ending;
      if (currentBookValue <= salvageValue) break;
    }
  }

  return {
    assetName,
    cost,
    salvageValue,
    usefulLife,
    method,
    schedule,
    totalDepreciation: accumulated
  };
}

/**
 * Calculate Comprehensive Financial Ratios (GAAP & HBS Standards)
 */
export function calculateFinancialRatios(params: {
  cash: number;
  receivables: number;
  inventory: number;
  currentLiabilities: number;
  totalDebt: number;
  equity: number;
  revenue: number;
  cogs: number;
  operatingExpenses: number;
  netIncome: number;
}): FinancialRatiosResult {
  const {
    cash,
    receivables,
    inventory,
    currentLiabilities,
    totalDebt,
    equity,
    revenue,
    cogs,
    operatingExpenses,
    netIncome
  } = params;

  const currentAssets = cash + receivables + inventory;
  const safeCL = currentLiabilities > 0 ? currentLiabilities : 1;
  const safeRev = revenue > 0 ? revenue : 1;

  const currentRatio = currentAssets / safeCL;
  const quickRatio = (cash + receivables) / safeCL;
  const cashRatio = cash / safeCL;
  const workingCapital = currentAssets - currentLiabilities;

  const grossMarginPercent = ((revenue - cogs) / safeRev) * 100;
  const operatingProfit = revenue - cogs - operatingExpenses;
  const operatingMarginPercent = (operatingProfit / safeRev) * 100;
  const netMarginPercent = (netIncome / safeRev) * 100;

  const safeEquity = equity > 0 ? equity : 1;
  const debtToEquity = totalDebt / safeEquity;

  const dso = (receivables / safeRev) * 365;
  // Approximating DPO at 30 days and DIO at 45 days for CCC
  const dio = inventory > 0 && cogs > 0 ? (inventory / cogs) * 365 : 30;
  const dpo = 30;
  const ccc = dio + dso - dpo;

  let assessment = "Sound solvency and liquidity posture.";
  if (quickRatio < 1.0) {
    assessment = "Caution: Quick Ratio < 1.0 implies immediate obligations exceed liquid cash & receivables without relying on inventory liquidation.";
  } else if (quickRatio > 2.5) {
    assessment = "Exceptionally high liquidity buffer; management may consider deploying idle cash into accretive R&D or expansion.";
  }

  return {
    currentRatio,
    quickRatio,
    cashRatio,
    workingCapital,
    grossMarginPercent,
    operatingMarginPercent,
    netMarginPercent,
    debtToEquity,
    daysSalesOutstanding: dso,
    cashConversionCycle: ccc,
    assessment
  };
}

/**
 * Calculate Cost-Volume-Profit (CVP) & Break-Even Metrics
 */
export function calculateBreakEven(
  fixedCosts: number,
  unitPrice: number,
  variableCostPerUnit: number
): BreakEvenAnalysisResult {
  const contributionMargin = unitPrice - variableCostPerUnit;
  const contributionMarginRatio = unitPrice > 0 ? contributionMargin / unitPrice : 0;
  const breakEvenUnits = contributionMargin > 0 ? Math.ceil(fixedCosts / contributionMargin) : Infinity;
  const breakEvenRevenue = contributionMarginRatio > 0 ? fixedCosts / contributionMarginRatio : Infinity;

  return {
    unitPrice,
    variableCostPerUnit,
    fixedCosts,
    contributionMargin,
    contributionMarginRatio,
    breakEvenUnits,
    breakEvenRevenue
  };
}

/**
 * Perform Discounted Cash Flow (DCF) & Net Present Value (NPV) Valuation
 */
export function calculateDCFValuation(
  initialOutlay: number,
  cashFlows: number[],
  discountRate: number,
  terminalGrowthRate: number = 0.02
): DCFValuationResult {
  let pvOfCashFlows = 0;
  const projected = cashFlows.map((cf, idx) => {
    const yr = idx + 1;
    const discounted = cf / Math.pow(1 + discountRate, yr);
    pvOfCashFlows += discounted;
    return {
      year: yr,
      undiscounted: cf,
      discounted: Math.round(discounted)
    };
  });

  // Terminal Value (Gordon Growth Model)
  const lastCF = cashFlows[cashFlows.length - 1] || 0;
  let terminalValue = 0;
  let pvOfTerminalValue = 0;
  if (discountRate > terminalGrowthRate && lastCF > 0) {
    terminalValue = (lastCF * (1 + terminalGrowthRate)) / (discountRate - terminalGrowthRate);
    pvOfTerminalValue = terminalValue / Math.pow(1 + discountRate, cashFlows.length);
  }

  const netPresentValue = Math.round(pvOfCashFlows + pvOfTerminalValue - initialOutlay);
  const totalPV = pvOfCashFlows + pvOfTerminalValue;
  const profitabilityIndex = initialOutlay > 0 ? totalPV / initialOutlay : 1;

  let verdict: DCFValuationResult['verdict'] = 'Marginal';
  if (netPresentValue > 0) verdict = 'Accretive (Accept)';
  else if (netPresentValue < 0) verdict = 'Dilutive (Reject)';

  return {
    discountRate,
    initialOutlay,
    projectedCashFlows: projected,
    pvOfCashFlows: Math.round(pvOfCashFlows),
    terminalValue: Math.round(terminalValue),
    pvOfTerminalValue: Math.round(pvOfTerminalValue),
    netPresentValue,
    profitabilityIndex: Number(profitabilityIndex.toFixed(2)),
    verdict
  };
}

/**
 * Generate Structured Double-Entry Journal Entry with Balance Test
 */
export function generateJournalEntry(
  scenario: string,
  amount: number,
  counterparty: string = "Client"
): JournalEntryResult {
  const lower = scenario.toLowerCase();
  let title = "Standard Business Transaction";
  let standard = "US GAAP (ASC Core) & IFRS Framework";
  let lines: JournalLine[] = [];
  let memo = "";

  if (lower.includes('invoice') || lower.includes('sale') || lower.includes('revenue')) {
    title = `Billed Enterprise Services - ${counterparty}`;
    standard = "ASC 606 Revenue from Contracts with Customers";
    lines = [
      {
        account: "Accounts Receivable (1100)",
        debit: amount,
        credit: 0,
        classification: "Asset",
        rationale: "Unconditional contractual right to consideration for fulfilled performance obligations."
      },
      {
        account: "Service Revenue (4000)",
        debit: 0,
        credit: amount,
        classification: "Revenue",
        rationale: "Recognized over time / point in time as performance obligation is satisfied."
      }
    ];
    memo = `Recognized $${amount.toLocaleString()} in revenue under ASC 606 with corresponding asset creation in Accounts Receivable. Increases Net Assets and Retained Earnings.`;
  } else if (lower.includes('cash received') || lower.includes('collected') || lower.includes('payment received')) {
    title = `Collected Receivable from ${counterparty}`;
    standard = "ASC 310 Receivables & Cash Flow Recognition";
    lines = [
      {
        account: "Cash & Cash Equivalents (1010)",
        debit: amount,
        credit: 0,
        classification: "Asset",
        rationale: "Inflow of liquid funds."
      },
      {
        account: "Accounts Receivable (1100)",
        debit: 0,
        credit: amount,
        classification: "Asset",
        rationale: "Extinguishment of outstanding customer receivable upon settlement."
      }
    ];
    memo = `Asset reallocation: Increases Cash and decreases Accounts Receivable by $${amount.toLocaleString()}. No change to Net Income or Total Assets.`;
  } else if (lower.includes('capital') || lower.includes('equipment') || lower.includes('asset purchase')) {
    title = `Capital Asset Acquisition - ${counterparty}`;
    standard = "ASC 360 Property, Plant, and Equipment (PP&E)";
    lines = [
      {
        account: "Equipment & Capital Assets (1500)",
        debit: amount,
        credit: 0,
        classification: "Asset",
        rationale: "Capitalized acquisition cost of non-monetary asset providing future economic benefit."
      },
      {
        account: "Accounts Payable / Cash (2010)",
        debit: 0,
        credit: amount,
        classification: "Liability",
        rationale: "Incurred liability or cash outflow for acquired capital equipment."
      }
    ];
    memo = `Capitalized expenditure: Assets increase by $${amount.toLocaleString()} in PP&E, offset by current liabilities. Subject to future depreciation matching.`;
  } else if (lower.includes('depreciation')) {
    title = "Periodic Depreciation Amortization";
    standard = "ASC 360 & IAS 16 Depreciation Matching Principle";
    lines = [
      {
        account: "Depreciation Expense (5100)",
        debit: amount,
        credit: 0,
        classification: "Expense",
        rationale: "Systematic and rational allocation of asset cost to operating period."
      },
      {
        account: "Accumulated Depreciation (1590 - Contra-Asset)",
        debit: 0,
        credit: amount,
        classification: "Asset",
        rationale: "Contra-asset reducing the net carrying book value of fixed assets."
      }
    ];
    memo = `Non-cash expense: Decreases Net Income and Net PP&E by $${amount.toLocaleString()}. Added back to Net Income on Statement of Cash Flows (Indirect Method).`;
  } else {
    // Default Operating Expense Accrual
    title = `Operating Expense Accrual - ${counterparty}`;
    standard = "ASC 720 Other Expenses & Matching Principle";
    lines = [
      {
        account: "Operating Expenses (5000)",
        debit: amount,
        credit: 0,
        classification: "Expense",
        rationale: "Recognized in period incurred matching revenue generation."
      },
      {
        account: "Accounts Payable (2010)",
        debit: 0,
        credit: amount,
        classification: "Liability",
        rationale: "Current obligation to remit payment within trade terms."
      }
    ];
    memo = `Expenses increase by $${amount.toLocaleString()}, increasing current liabilities and reducing Retained Earnings.`;
  }

  const totalDebit = lines.reduce((s, l) => s + l.debit, 0);
  const totalCredit = lines.reduce((s, l) => s + l.credit, 0);
  const isBalanced = Math.abs(totalDebit - totalCredit) < 0.01;

  let assetsChange = 0;
  let liabilitiesChange = 0;
  let equityChange = 0;

  lines.forEach(l => {
    if (l.classification === 'Asset') assetsChange += (l.debit - l.credit);
    if (l.classification === 'Liability') liabilitiesChange += (l.credit - l.debit);
    if (l.classification === 'Revenue') equityChange += (l.credit - l.debit);
    if (l.classification === 'Expense') equityChange -= (l.debit - l.credit);
  });

  return {
    title,
    date: new Date().toISOString().split('T')[0],
    standard,
    lines,
    totalDebit,
    totalCredit,
    isBalanced,
    accountingEquationEffect: {
      assetsChange,
      liabilitiesChange,
      equityChange
    },
    executiveMemo: memo
  };
}

/**
 * Format a Journal Entry as Markdown Table
 */
export function formatJournalEntryMarkdown(entry: JournalEntryResult): string {
  return `### 🏛️ Harvard Accounting Ledger: ${entry.title}
*Standard: ${entry.standard} | Date: ${entry.date}*

| Account Title & Code | Class | Debit (Dr.) | Credit (Cr.) | Economic Rationale |
| :--- | :--- | :---: | :---: | :--- |
${entry.lines.map(l => 
  `| **${l.account}** | ${l.classification} | ${l.debit > 0 ? `$${l.debit.toLocaleString()}` : '—'} | ${l.credit > 0 ? `$${l.credit.toLocaleString()}` : '—'} | ${l.rationale} |`
).join('\n')}
| **Totals** | **Balanced: ${entry.isBalanced ? 'YES ✓' : 'NO ✗'}** | **$${entry.totalDebit.toLocaleString()}** | **$${entry.totalCredit.toLocaleString()}** | **Debits = Credits Parity** |

#### Accounting Equation Nexus ($Assets = Liabilities + Equity$):
- **Δ Assets**: ${entry.accountingEquationEffect.assetsChange >= 0 ? `+$${entry.accountingEquationEffect.assetsChange.toLocaleString()}` : `-$${Math.abs(entry.accountingEquationEffect.assetsChange).toLocaleString()}`}
- **Δ Liabilities**: ${entry.accountingEquationEffect.liabilitiesChange >= 0 ? `+$${entry.accountingEquationEffect.liabilitiesChange.toLocaleString()}` : `-$${Math.abs(entry.accountingEquationEffect.liabilitiesChange).toLocaleString()}`}
- **Δ Equity / Retained Earnings**: ${entry.accountingEquationEffect.equityChange >= 0 ? `+$${entry.accountingEquationEffect.equityChange.toLocaleString()}` : `-$${Math.abs(entry.accountingEquationEffect.equityChange).toLocaleString()}`}

> **Executive Accounting Memo**: ${entry.executiveMemo}`;
}
