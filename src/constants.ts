import { 
  LayoutDashboard, 
  Users, 
  ShoppingBag, 
  Store, 
  RefreshCcw, 
  Key, 
  Calculator, 
  FileText, 
  Receipt, 
  Folder, 
  FileSpreadsheet, 
  PenTool, 
  Package, 
  Factory, 
  Settings, 
  Truck, 
  ShieldCheck, 
  UserPlus, 
  Calendar, 
  Star, 
  ClipboardCheck, 
  Car, 
  BarChart3, 
  Ticket, 
  MessageSquare, 
  Layers, 
  Clock, 
  LucideIcon,
  Boxes,
  Zap,
  Compass,
  Coins
} from 'lucide-react';

import { 
  AssetItem, 
  AutomationWorkflow, 
  CurrencyRate, 
  SalesForecastQuarter,
  Organization
} from './types';

export interface AppModule {
  id: string;
  name: string;
  icon: LucideIcon;
  category: 'Sales' | 'Finance' | 'Inventory' | 'HR' | 'Marketing' | 'Operations' | 'Productivity';
  description: string;
}

export const APP_MODULES: AppModule[] = [
  { id: 'dashboard', name: 'Executive Hub', icon: LayoutDashboard, category: 'Operations', description: 'Real-time KPIs, revenue trajectory, and core operations' },
  { id: 'crm', name: 'CRM & Pipeline', icon: Users, category: 'Sales', description: 'Track leads, contacts, and AI-driven forecasting' },
  { id: 'finance', name: 'Finance & Treasury', icon: Calculator, category: 'Finance', description: 'Invoices, expenses, multi-currency ledgers, and tax' },
  { id: 'inventory', name: 'Inventory & Stock', icon: Package, category: 'Inventory', description: 'Stock, SKUs, predictive restocking, and logistics' },
  { id: 'assets', name: 'Asset Tracking', icon: Boxes, category: 'Operations', description: 'Non-monetary assets, fleet, equipment, IP, and grants' },
  { id: 'sales', name: 'Sales Orders', icon: ShoppingBag, category: 'Sales', description: 'Quotations, sales orders, and fulfillment dispatch' },
  { id: 'automation', name: 'Automation Engine', icon: Zap, category: 'Operations', description: 'Event-driven no-code workflow triggers and actions' },
  { id: 'users', name: 'Team & RBAC', icon: ShieldCheck, category: 'HR', description: 'Centralized employee roster and granular security' },
  { id: 'integrations', name: 'Integrations', icon: Layers, category: 'Operations', description: 'Payment gateways, ERP APIs, and webhook relays' },
  { id: 'roadmap', name: 'Odoo Moat & Roadmap', icon: Compass, category: 'Operations', description: 'Executive status, competitive moat, and MVP sprint plan' },
];

export const PLANS = [
  {
    id: 'starter',
    name: 'Foundation Core',
    price: 0,
    features: ['Executive Dashboard', 'CRM & Pipeline', 'Invoicing & Expenses', 'Local Sandbox'],
    description: 'Essential core for early ventures and SMEs'
  },
  {
    id: 'business',
    name: 'Professional',
    price: 79,
    features: ['All Core Modules', 'ARIS AI Automation', 'Inventory & Sales', 'Multi-User RBAC'],
    description: 'Advanced operations for growing enterprises'
  },
  {
    id: 'enterprise',
    name: 'Enterprise Matrix',
    price: 249,
    features: ['Unlimited Tenants', 'Full SOC2 Auditing', 'Dedicated ARIS Copilot', 'Priority SLA'],
    description: 'Complete scalable business operating system'
  }
];

export const SAMPLE_ORGANIZATIONS: Organization[] = [
  {
    id: 'org-1',
    name: 'Valorniq Technologies Inc',
    tenantId: 'org_valorniq_001',
    domain: 'valorniq.cloud',
    plan: 'Enterprise',
    currency: 'USD',
    entityType: 'Enterprise',
    supportedCurrencies: ['USD', 'EUR', 'GBP', 'CAD'],
    ownerId: 'usr-1'
  },
  {
    id: 'org-2',
    name: 'Apex Industrial Dynamics',
    tenantId: 'org_apex_industries_002',
    domain: 'apexindustrial.io',
    plan: 'Scale',
    currency: 'EUR',
    entityType: 'Corporation',
    supportedCurrencies: ['EUR', 'USD', 'JPY', 'CHF'],
    ownerId: 'usr-2'
  },
  {
    id: 'org-3',
    name: 'Beacon Global Relief & Hope',
    tenantId: 'org_beacon_nonprofit_003',
    domain: 'beaconglobal.org',
    plan: 'Enterprise',
    currency: 'USD',
    entityType: 'Nonprofit',
    taxExemptionStatus: '501(c)(3) Public Charity',
    supportedCurrencies: ['USD', 'EUR', 'GBP', 'CHF'],
    ownerId: 'usr-1'
  }
];

export const SAMPLE_USERS = [
  {
    id: 'usr-1',
    name: 'Alex Vance',
    email: 'alex.vance@valorniq.com',
    role: 'Admin' as const,
    status: 'Active',
    lastActive: 'Just Now',
    device: 'MacBook Pro · macOS 15.2 (TLS 1.3)',
    location: 'San Francisco, CA',
    mfaEnabled: true,
    ownerId: 'usr-1'
  },
  {
    id: 'usr-2',
    name: 'Sarah Jenkins',
    email: 'sarah.j@valorniq.com',
    role: 'Manager' as const,
    status: 'Active',
    lastActive: '14 mins ago',
    device: 'ThinkPad X1 · Fedora Linux',
    location: 'Austin, TX',
    mfaEnabled: true,
    ownerId: 'usr-1'
  },
  {
    id: 'usr-3',
    name: 'Liam Chen',
    email: 'liam.chen@valorniq.com',
    role: 'Contributor' as const,
    status: 'Active',
    lastActive: '1 hour ago',
    device: 'Dell XPS 15 · Windows 11',
    location: 'Seattle, WA',
    mfaEnabled: false,
    ownerId: 'usr-1'
  }
];

export const SAMPLE_COMPANIES = [
  {
    id: 'comp-1',
    name: 'Acme Global Systems',
    domain: 'acmeglobal.com',
    industry: 'Enterprise Software',
    size: '1,500 - 5,000 employees',
    revenue: '45,000,000',
    ownerId: 'usr-1'
  },
  {
    id: 'comp-2',
    name: 'Oracle Systems Partner Group',
    domain: 'oracle-partner.net',
    industry: 'Cloud Architecture',
    size: '10,000+ employees',
    revenue: '180,000,000',
    ownerId: 'usr-1'
  },
  {
    id: 'comp-3',
    name: 'Stripe Network Labs',
    domain: 'stripenet.io',
    industry: 'Financial Infrastructure',
    size: '2,500 - 5,000 employees',
    revenue: '92,000,000',
    ownerId: 'usr-1'
  }
];

export const SAMPLE_CONTACTS = [
  {
    id: 'cnt-1',
    name: 'Elena Rostova',
    email: 'elena.rostova@acmeglobal.com',
    phone: '+1 (415) 890-2194',
    company: 'Acme Global Systems',
    role: 'VP Procurement & Tech Ops',
    status: 'Active' as const,
    createdAt: '2026-08-12',
    ownerId: 'usr-1'
  },
  {
    id: 'cnt-2',
    name: 'Marcus Brody',
    email: 'mbrody@oracle-partner.net',
    phone: '+1 (512) 349-1120',
    company: 'Oracle Systems Partner Group',
    role: 'Principal Partner Architect',
    status: 'Active' as const,
    createdAt: '2026-08-20',
    ownerId: 'usr-1'
  },
  {
    id: 'cnt-3',
    name: 'Chloe Tanaka',
    email: 'ctanaka@stripenet.io',
    phone: '+1 (206) 745-9801',
    company: 'Stripe Network Labs',
    role: 'Director of Platform Engineering',
    status: 'Active' as const,
    createdAt: '2026-08-28',
    ownerId: 'usr-1'
  }
];

export const SAMPLE_LEADS = [
  {
    id: 'lead-1',
    title: 'Enterprise Multi-Cloud Infrastructure Suite',
    company: 'Acme Global Systems',
    contactName: 'Elena Rostova',
    email: 'elena.rostova@acmeglobal.com',
    value: 78000,
    stage: 'Qualified' as const,
    confidence: 85,
    assignedTo: 'Sarah Jenkins',
    createdAt: '2026-08-14',
    ownerId: 'usr-1'
  },
  {
    id: 'lead-2',
    title: 'Oracle Systems Architecture Expansion',
    company: 'Oracle Systems Partner Group',
    contactName: 'Marcus Brody',
    email: 'mbrody@oracle-partner.net',
    value: 65000,
    stage: 'Proposal' as const,
    confidence: 70,
    assignedTo: 'Alex Vance',
    createdAt: '2026-08-21',
    ownerId: 'usr-1'
  },
  {
    id: 'lead-3',
    title: 'Fintech Processing Node Integration',
    company: 'Stripe Network Labs',
    contactName: 'Chloe Tanaka',
    email: 'ctanaka@stripenet.io',
    value: 120000,
    stage: 'Won' as const,
    confidence: 100,
    assignedTo: 'Sarah Jenkins',
    createdAt: '2026-08-25',
    ownerId: 'usr-1'
  },
  {
    id: 'lead-4',
    title: 'Automated Supply Chain Intelligence',
    company: 'Kestrel Logistics',
    contactName: 'David Kestrel',
    email: 'dkestrel@kestrel-freight.com',
    value: 34000,
    stage: 'Lead' as const,
    confidence: 40,
    assignedTo: 'Liam Chen',
    createdAt: '2026-09-01',
    ownerId: 'usr-1'
  }
];

export const SAMPLE_CUSTOMERS = [
  {
    id: 'cust-1',
    name: 'Acme Global Systems',
    email: 'procurement@acmeglobal.com',
    phone: '+1 (415) 890-2194',
    status: 'active' as const,
    company: 'Acme Global Systems',
    ownerId: 'usr-1',
    createdAt: '2026-08-01'
  },
  {
    id: 'cust-2',
    name: 'Stripe Network Labs',
    email: 'billing@stripenet.io',
    phone: '+1 (206) 745-9801',
    status: 'active' as const,
    company: 'Stripe Network Labs',
    ownerId: 'usr-1',
    createdAt: '2026-08-05'
  }
];

export const SAMPLE_PRODUCTS = [
  {
    id: 'prod-1',
    name: 'Valorniq Enterprise Core (Annual Node)',
    sku: 'SKU-VAL-COR-01',
    price: 12500,
    stock: 45,
    category: 'Software License',
    ownerId: 'usr-1',
    createdAt: '2026-08-01'
  },
  {
    id: 'prod-2',
    name: 'Dedicated AI Inference Co-Pilot Appliance',
    sku: 'SKU-VAL-HW-APL',
    price: 4800,
    stock: 8, // Low stock threshold!
    category: 'Hardware Appliance',
    ownerId: 'usr-1',
    createdAt: '2026-08-05'
  },
  {
    id: 'prod-3',
    name: 'SOC2 & HIPAA Compliance Connector',
    sku: 'SKU-VAL-SOC-CON',
    price: 2400,
    stock: 80,
    category: 'Security Plugin',
    ownerId: 'usr-1',
    createdAt: '2026-08-10'
  }
];

export const SAMPLE_SALES_ORDERS = [
  {
    id: 'so-1001',
    orderNumber: 'SO-1001',
    customerId: 'cust-2',
    customerName: 'Stripe Network Labs',
    items: [
      { productId: 'prod-1', productName: 'Valorniq Enterprise Core (Annual Node)', quantity: 2, price: 12500 },
      { productId: 'prod-3', productName: 'SOC2 & HIPAA Compliance Connector', quantity: 1, price: 2400 }
    ],
    totalValue: 27400,
    status: 'confirmed' as const,
    orderDate: '2026-08-26',
    createdAt: '2026-08-26',
    ownerId: 'usr-1'
  },
  {
    id: 'so-1002',
    orderNumber: 'SO-1002',
    customerId: 'cust-1',
    customerName: 'Acme Global Systems',
    items: [
      { productId: 'prod-2', productName: 'Dedicated AI Inference Co-Pilot Appliance', quantity: 2, price: 4800 }
    ],
    totalValue: 9600,
    status: 'shipped' as const,
    orderDate: '2026-08-29',
    createdAt: '2026-08-29',
    ownerId: 'usr-1'
  }
];

export const SAMPLE_INVOICES = [
  {
    id: 'inv-1',
    invoiceNumber: '10482',
    clientName: 'Stripe Network Labs',
    clientEmail: 'billing@stripenet.io',
    amount: 27400,
    status: 'Paid' as const,
    dueDate: '2026-09-15',
    issuedDate: '2026-08-26',
    items: [
      { description: 'Valorniq Enterprise Core (2 Annual Nodes)', quantity: 2, unitPrice: 12500 },
      { description: 'SOC2 & HIPAA Compliance Connector', quantity: 1, unitPrice: 2400 }
    ],
    ownerId: 'usr-1'
  },
  {
    id: 'inv-2',
    invoiceNumber: '10483',
    clientName: 'Acme Global Systems',
    clientEmail: 'billing@acmeglobal.com',
    amount: 32500,
    status: 'Pending' as const,
    dueDate: '2026-09-28',
    issuedDate: '2026-08-29',
    items: [
      { description: 'Enterprise Architecture Consulting & Dedicated Nodes', quantity: 1, unitPrice: 32500 }
    ],
    ownerId: 'usr-1'
  },
  {
    id: 'inv-3',
    invoiceNumber: '10484',
    clientName: 'Oracle Systems Partner Group',
    clientEmail: 'billing@oracle-partner.net',
    amount: 14200,
    status: 'Pending' as const,
    dueDate: '2026-10-05',
    issuedDate: '2026-09-02',
    items: [
      { description: 'API Connector Gateway Retainer', quantity: 1, unitPrice: 14200 }
    ],
    ownerId: 'usr-1'
  }
];

export const SAMPLE_EXPENSES = [
  {
    id: 'exp-1',
    merchant: 'Google Cloud Platform (Compute & Spanner)',
    category: 'Software' as const,
    amount: 4850,
    date: '2026-08-30',
    reference: 'GCP-INV-8910',
    status: 'Approved' as const,
    ownerId: 'usr-1'
  },
  {
    id: 'exp-2',
    merchant: 'Cloudflare Zero Trust & Enterprise SSL',
    category: 'Compliance' as const,
    amount: 1200,
    date: '2026-09-01',
    reference: 'CF-SEC-4412',
    status: 'Approved' as const,
    ownerId: 'usr-1'
  },
  {
    id: 'exp-3',
    merchant: 'Anthropic & OpenAI Model API Gateway',
    category: 'Software' as const,
    amount: 2150,
    date: '2026-09-02',
    reference: 'AI-TOK-9921',
    status: 'Pending' as const,
    ownerId: 'usr-1'
  },
  {
    id: 'exp-4',
    merchant: 'TechOps Global Offsite Summit',
    category: 'Travel' as const,
    amount: 3400,
    date: '2026-09-03',
    reference: 'TRV-FLT-2104',
    status: 'Pending' as const,
    ownerId: 'usr-1'
  }
];

export const SAMPLE_BALANCES = {
  checking: 284500,
  savings: 450000,
  receivables: 46700,
  payables: 5550
};

export const SAMPLE_ACTIVITY_LOGS = [
  {
    id: 'log-1',
    user: 'Alex Vance',
    action: 'Signed and confirmed Sales Order #SO-1001 for Stripe Network Labs',
    timestamp: '12 mins ago',
    module: 'Sales' as const,
    details: 'Valuation: $27,400',
    ownerId: 'usr-1'
  },
  {
    id: 'log-2',
    user: 'Sarah Jenkins',
    action: 'Moved Oracle Systems opportunity to Proposal stage',
    timestamp: '42 mins ago',
    module: 'CRM' as const,
    details: 'Valuation: $65,000 (Confidence: 70%)',
    ownerId: 'usr-1'
  },
  {
    id: 'log-3',
    user: 'Alex Vance',
    action: 'Approved operating expense GCP-INV-8910',
    timestamp: '2 hours ago',
    module: 'Finance' as const,
    details: 'Cloud Infrastructure Outflow: $4,850',
    ownerId: 'usr-1'
  },
  {
    id: 'log-4',
    user: 'ARIS Auto-Agent',
    action: 'Dispatched inventory low-stock alert for SKU-VAL-HW-APL',
    timestamp: '4 hours ago',
    module: 'AI' as const,
    details: 'Remaining units: 8 (Threshold: 10)',
    ownerId: 'usr-1'
  },
  {
    id: 'log-5',
    user: 'Liam Chen',
    action: 'Enrolled new compliance audit node (SOC2 Type II)',
    timestamp: 'Yesterday',
    module: 'System' as const,
    details: 'Verified tenant boundary org_valorniq_001',
    ownerId: 'usr-1'
  }
];

export const SAMPLE_ALERTS = [
  {
    id: 'alt-1',
    title: 'Low Inventory Stock Warning',
    message: 'Dedicated AI Inference Appliance (SKU-VAL-HW-APL) has only 8 units left in stock.',
    type: 'warning' as const,
    module: 'Inventory',
    timestamp: '4 hours ago',
    read: false,
    ownerId: 'usr-1'
  },
  {
    id: 'alt-2',
    title: 'High-Value Opportunity Ready for Review',
    message: 'Oracle Systems Partner Group expansion opportunity is valued at $65,000.',
    type: 'info' as const,
    module: 'CRM',
    timestamp: '6 hours ago',
    read: false,
    ownerId: 'usr-1'
  }
];

export const SAMPLE_ASSETS: AssetItem[] = [
  {
    id: 'ast-1',
    name: 'Electric Logistics Transport Fleet (Unit 101-104)',
    tagNumber: 'AST-FLT-8091',
    category: 'Equipment & Fleet',
    isNonMonetary: true,
    acquisitionDate: '2025-04-10',
    valuationCurrency: 'USD',
    acquisitionCost: 185000,
    fairMarketValue: 158000,
    depreciationMethod: 'Straight-Line',
    depreciationRatePercent: 15,
    accumulatedDepreciation: 27750,
    currentBookValue: 157250,
    location: 'Austin Hub / Fleet Depot 2',
    custodian: 'Sarah Jenkins (Ops)',
    condition: 'Excellent',
    notes: '4-vehicle EV fleet utilized for multi-regional logistics delivery.',
    ownerId: 'usr-1'
  },
  {
    id: 'ast-2',
    name: 'Neural Optimizer Enterprise IP & Model Weights',
    tagNumber: 'AST-IP-4412',
    category: 'Proprietary Technology',
    isNonMonetary: true,
    acquisitionDate: '2025-01-15',
    valuationCurrency: 'USD',
    acquisitionCost: 320000,
    fairMarketValue: 490000,
    depreciationMethod: 'Straight-Line',
    depreciationRatePercent: 10,
    accumulatedDepreciation: 32000,
    currentBookValue: 288000,
    location: 'US-East Isolated Vault',
    custodian: 'Liam Chen (Tech)',
    condition: 'Excellent',
    notes: 'Core algorithmic property and embedded AI model weights for ARIS copilot.',
    ownerId: 'usr-1'
  },
  {
    id: 'ast-3',
    name: 'Mobile Ultrasound Field Diagnostics (In-Kind Grant)',
    tagNumber: 'AST-NPO-1029',
    category: 'In-Kind Contribution / Grant',
    isNonMonetary: true,
    acquisitionDate: '2026-02-01',
    valuationCurrency: 'USD',
    acquisitionCost: 95000,
    fairMarketValue: 92000,
    depreciationMethod: 'None (In-Kind / Land)',
    depreciationRatePercent: 0,
    accumulatedDepreciation: 0,
    currentBookValue: 92000,
    location: 'Nonprofit Field Operations / Sector 4',
    custodian: 'Elena Rostova (Aid Director)',
    condition: 'Good',
    grantOrDonorReference: 'Global Health Consortium Grant #GHC-2026-A9',
    notes: 'Donated specialized medical asset categorized as non-monetary asset in-kind.',
    ownerId: 'usr-1'
  },
  {
    id: 'ast-4',
    name: 'High-Density Server Microgrid & Backup Battery Pack',
    tagNumber: 'AST-FAC-3301',
    category: 'Real Estate & Facilities',
    isNonMonetary: true,
    acquisitionDate: '2024-11-20',
    valuationCurrency: 'USD',
    acquisitionCost: 140000,
    fairMarketValue: 122000,
    depreciationMethod: 'Declining Balance',
    depreciationRatePercent: 20,
    accumulatedDepreciation: 36400,
    currentBookValue: 103600,
    location: 'San Francisco Tech Facility',
    custodian: 'Alex Vance (Admin)',
    condition: 'Good',
    notes: 'Zero-downtime microgrid facility backup infrastructure for on-premise compute nodes.',
    ownerId: 'usr-1'
  },
  {
    id: 'ast-5',
    name: 'Multi-Currency Foreign Exchange Liquidity Reserve',
    tagNumber: 'AST-TRS-9904',
    category: 'Financial & Treasury Asset',
    isNonMonetary: false,
    acquisitionDate: '2026-01-01',
    valuationCurrency: 'EUR',
    acquisitionCost: 200000,
    fairMarketValue: 218500,
    depreciationMethod: 'Fair Value Revaluation',
    depreciationRatePercent: 0,
    accumulatedDepreciation: 0,
    currentBookValue: 218500,
    location: 'European Central Clearing Node',
    custodian: 'Treasury Officer',
    condition: 'Excellent',
    notes: 'Corporate treasury reserve held in EUR and GBP to buffer currency volatility.',
    ownerId: 'usr-1'
  }
];

export const SAMPLE_AUTOMATIONS: AutomationWorkflow[] = [
  {
    id: 'wf-1',
    name: 'Opportunity Won -> Auto Generate Invoice & Slack Alert',
    triggerEvent: 'lead.stage_changed == "Won"',
    triggerModule: 'CRM',
    conditionDescription: 'When deal confidence reaches Won and value >= $10,000',
    actions: [
      'Generate draft invoice in Finance module',
      'Notify #sales-wins Slack webhook channel',
      'Assign post-sales onboarding manager'
    ],
    isActive: true,
    executionCount: 28,
    lastTriggered: '3 hours ago'
  },
  {
    id: 'wf-2',
    name: 'Inventory Critical Restock Trigger',
    triggerEvent: 'product.stock <= product.reorderPoint',
    triggerModule: 'Inventory',
    conditionDescription: 'Stock level drops below minimum safe threshold (< 10 units)',
    actions: [
      'Draft Purchase Order (PO) to primary supplier',
      'Dispatch warning alert to Executive Hub',
      'Request ARIS price optimization evaluation'
    ],
    isActive: true,
    executionCount: 14,
    lastTriggered: '4 hours ago'
  },
  {
    id: 'wf-3',
    name: 'Non-Monetary Asset Audit & Depreciation Cycle',
    triggerEvent: 'schedule.quarterly_close',
    triggerModule: 'Assets',
    conditionDescription: 'Quarterly financial ledger depreciation calculation',
    actions: [
      'Recalculate straight-line asset amortization',
      'Generate Asset Custodian verification checklist',
      'Log journal entry into General Ledger'
    ],
    isActive: true,
    executionCount: 6,
    lastTriggered: '2 days ago'
  },
  {
    id: 'wf-4',
    name: 'Invoice Overdue Escalation Relay',
    triggerEvent: 'invoice.dueDate < today && invoice.status == "Pending"',
    triggerModule: 'Finance',
    conditionDescription: 'Invoice payment overdue past 7 calendar days',
    actions: [
      'Send automated gentle payment reminder to client',
      'Flag account status in CRM contact profile',
      'Schedule follow-up task for account representative'
    ],
    isActive: true,
    executionCount: 42,
    lastTriggered: '1 day ago'
  }
];

export const SAMPLE_CURRENCIES: CurrencyRate[] = [
  { code: 'USD', symbol: '$', name: 'US Dollar (Base)', rateToUSD: 1.00 },
  { code: 'EUR', symbol: '€', name: 'Eurozone Euro', rateToUSD: 1.08 },
  { code: 'GBP', symbol: '£', name: 'British Pound', rateToUSD: 1.28 },
  { code: 'JPY', symbol: '¥', name: 'Japanese Yen', rateToUSD: 0.0068 },
  { code: 'CAD', symbol: 'CA$', name: 'Canadian Dollar', rateToUSD: 0.73 },
  { code: 'CHF', symbol: 'Fr', name: 'Swiss Franc', rateToUSD: 1.14 }
];

export const SAMPLE_FORECASTS: SalesForecastQuarter[] = [
  {
    quarter: 'Q3 2026',
    weightedPipeline: 345000,
    bestCase: 420000,
    commitTarget: 290000,
    predictedWon: 312000,
    aiConfidenceScore: 91,
    keyDeals: ['Acme Global Cloud Deployment ($140k)', 'Oracle Systems Partner Group ($65k)']
  },
  {
    quarter: 'Q4 2026',
    weightedPipeline: 480000,
    bestCase: 580000,
    commitTarget: 380000,
    predictedWon: 415000,
    aiConfidenceScore: 84,
    keyDeals: ['Stripe Network Labs Enterprise ($180k)', 'Apex Industrial Dynamics expansion ($120k)']
  },
  {
    quarter: 'Q1 2027',
    weightedPipeline: 520000,
    bestCase: 660000,
    commitTarget: 410000,
    predictedWon: 460000,
    aiConfidenceScore: 78,
    keyDeals: ['Global Health Foundation Grant Program ($195k)']
  }
];


