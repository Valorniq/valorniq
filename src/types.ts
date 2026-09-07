export type EntityType = 'Corporation' | 'Enterprise' | 'SME' | 'Nonprofit';

export interface Organization {
  id: string;
  name: string;
  tenantId: string;
  domain?: string;
  plan?: 'Starter' | 'Scale' | 'Enterprise';
  currency?: string;
  entityType?: EntityType;
  taxExemptionStatus?: string;
  supportedCurrencies?: string[];
  ownerId?: string;
  createdAt?: string;
}

export interface Contact {
  id: string;
  name: string;
  email: string;
  phone: string;
  company: string;
  role: string;
  status: 'Active' | 'Inactive';
  createdAt: string;
  ownerId?: string;
  updatedAt?: string;
}

export interface Company {
  id: string;
  name: string;
  domain: string;
  industry: string;
  size: string;
  revenue: string;
  ownerId?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface Lead {
  id: string;
  title: string;
  company: string;
  contactName: string;
  email: string;
  value: number;
  stage: 'Lead' | 'Contacted' | 'Qualified' | 'Proposal' | 'Negotiation' | 'Won' | 'Lost';
  confidence: number;
  assignedTo: string;
  createdAt: string;
  ownerId?: string;
  updatedAt?: string;
}

export interface InvoiceItem {
  description: string;
  quantity: number;
  unitPrice: number;
}

export interface Invoice {
  id: string;
  invoiceNumber: string;
  clientName: string;
  clientEmail: string;
  amount: number;
  status: 'Paid' | 'Pending' | 'Overdue' | 'Draft';
  dueDate: string;
  issuedDate: string;
  items: InvoiceItem[];
  ownerId?: string;
  updatedAt?: string;
}

export interface Expense {
  id: string;
  merchant: string;
  category: 'Software' | 'Marketing' | 'Office' | 'Compliance' | 'Travel' | 'Operations';
  amount: number;
  date: string;
  reference: string;
  status: 'Approved' | 'Pending' | 'Rejected';
  ownerId?: string;
  updatedAt?: string;
}

export interface AccountBalance {
  checking: number;
  savings: number;
  receivables: number;
  payables: number;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'Admin' | 'Manager' | 'Contributor';
  avatar?: string;
  status: string;
  lastActive: string;
  device: string;
  location: string;
  mfaEnabled: boolean;
  ownerId?: string;
  createdAt?: string;
}

export interface ActivityLog {
  id: string;
  user: string;
  action: string;
  timestamp: string;
  module: 'CRM' | 'Finance' | 'User' | 'System' | 'Inventory' | 'Sales' | 'AI';
  details: string;
  ownerId?: string;
}

export interface AlertNotification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'warning' | 'success';
  module: string;
  timestamp: string;
  read: boolean;
  ownerId?: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
  timestamp: string;
  toolCalls?: Array<{
    name: string;
    args: Record<string, any>;
    status?: 'pending' | 'executed' | 'rejected';
    result?: string;
  }>;
  suggestedActions?: { label: string; action: string }[];
}

export interface TenantConfig {
  name: string;
  logoUrl?: string;
  primaryColor: string;
  domain: string;
  mfaRequired: boolean;
  sessionTimeout: number;
}

export interface DashboardCustomSettings {
  showNetProfit: boolean;
  showReceivables: boolean;
  showPipeline: boolean;
  showCustomers: boolean;
  chartType: 'Line' | 'Area' | 'Bar' | 'DualLine';
  crmGoalTarget: number;
  refreshInterval: string;
}

export type CustomerStatus = 'active' | 'inactive';
export type OrderStatus = 'draft' | 'confirmed' | 'shipped' | 'cancelled';

export interface Customer {
  id: string;
  name: string;
  email: string;
  phone?: string;
  status: CustomerStatus;
  address?: string;
  company?: string;
  ownerId?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface Product {
  id: string;
  name: string;
  sku: string;
  price: number;
  stock: number;
  category?: string;
  ownerId?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface OrderItem {
  productId: string;
  productName?: string;
  quantity: number;
  price: number;
}

export interface SalesOrder {
  id: string;
  orderNumber?: string;
  customerId: string;
  customerName?: string;
  items: OrderItem[];
  totalValue: number;
  status: OrderStatus;
  ownerId?: string;
  orderDate: string;
  createdAt?: string;
  updatedAt?: string;
}

export type AssetCategory = 
  | 'Equipment & Fleet' 
  | 'Digital & IP Licenses'
  | 'Real Estate & Facilities' 
  | 'In-Kind Contribution / Grant' 
  | 'Financial & Treasury Asset' 
  | 'Proprietary Technology';

export type AssetCondition = 'Excellent' | 'Good' | 'Fair' | 'Under Maintenance' | 'Decommissioned';

export interface AssetItem {
  id: string;
  name: string;
  tagNumber: string;
  category: AssetCategory;
  isNonMonetary: boolean;
  acquisitionDate: string;
  valuationCurrency: string;
  acquisitionCost: number;
  fairMarketValue: number;
  depreciationMethod: 'Straight-Line' | 'Declining Balance' | 'None (In-Kind / Land)' | 'Fair Value Revaluation';
  depreciationRatePercent: number;
  accumulatedDepreciation: number;
  currentBookValue: number;
  location: string;
  custodian: string;
  condition: AssetCondition;
  grantOrDonorReference?: string;
  notes?: string;
  ownerId?: string;
  updatedAt?: string;
}

export interface AutomationWorkflow {
  id: string;
  name: string;
  triggerEvent: string;
  triggerModule: 'CRM' | 'Finance' | 'Inventory' | 'Assets' | 'HR' | 'Sales';
  conditionDescription: string;
  actions: string[];
  isActive: boolean;
  executionCount: number;
  lastTriggered?: string;
}

export interface CurrencyRate {
  code: string;
  symbol: string;
  name: string;
  rateToUSD: number;
}

export interface SalesForecastQuarter {
  quarter: string;
  weightedPipeline: number;
  bestCase: number;
  commitTarget: number;
  predictedWon: number;
  aiConfidenceScore: number;
  keyDeals: string[];
}

