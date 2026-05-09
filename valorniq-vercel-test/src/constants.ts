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
  BookOpen, 
  MessageCircle,
  LucideIcon
} from 'lucide-react';

export interface AppModule {
  id: string;
  name: string;
  icon: LucideIcon;
  category: 'Sales' | 'Finance' | 'Inventory' | 'HR' | 'Marketing' | 'Operations' | 'Productivity';
  description: string;
}

export const APP_MODULES: AppModule[] = [
  { id: 'crm', name: 'CRM', icon: Users, category: 'Sales', description: 'Track leads and close opportunities' },
  { id: 'sales', name: 'Sales', icon: ShoppingBag, category: 'Sales', description: 'Quotations, orders, and invoices' },
  { id: 'pos', name: 'Point of Sale', icon: Store, category: 'Sales', description: 'Shops and restaurants' },
  { id: 'subscriptions', name: 'Subscriptions', icon: RefreshCcw, category: 'Sales', description: 'Recurring invoices and renewals' },
  { id: 'rental', name: 'Rental', icon: Key, category: 'Sales', description: 'Contracts, deliveries, and returns' },
  
  { id: 'accounting', name: 'Accounting', icon: Calculator, category: 'Finance', description: 'Financial and analytic accounting' },
  { id: 'invoicing', name: 'Invoicing', icon: FileText, category: 'Finance', description: 'Invoices and payments' },
  { id: 'expenses', name: 'Expenses', icon: Receipt, category: 'Finance', description: 'Employee expense management' },
  
  { id: 'documents', name: 'Documents', icon: Folder, category: 'Productivity', description: 'Document management' },
  { id: 'spreadsheets', name: 'Spreadsheets', icon: FileSpreadsheet, category: 'Productivity', description: 'Spreadsheet-style documents' },
  { id: 'sign', name: 'Sign', icon: PenTool, category: 'Productivity', description: 'Online document signing' },
  
  { id: 'inventory', name: 'Inventory', icon: Package, category: 'Inventory', description: 'Stock and logistics' },
  { id: 'manufacturing', name: 'Manufacturing', icon: Factory, category: 'Inventory', description: 'Manufacturing orders and BOMs' },
  { id: 'plm', name: 'PLM', icon: Settings, category: 'Inventory', description: 'Product lifecycle management' },
  { id: 'purchase', name: 'Purchase', icon: Truck, category: 'Inventory', description: 'Purchase orders and tenders' },
  { id: 'maintenance', name: 'Maintenance', icon: Settings, category: 'Operations', description: 'Equipment tracking and repair' },
  { id: 'quality', name: 'Quality', icon: ShieldCheck, category: 'Operations', description: 'Product quality control' },
  
  { id: 'employees', name: 'Employees', icon: Users, category: 'HR', description: 'Centralized employee information' },
  { id: 'recruitment', name: 'Recruitment', icon: UserPlus, category: 'HR', description: 'Hiring pipelines' },
  { id: 'timeoff', name: 'Time Off', icon: Calendar, category: 'HR', description: 'PTO and leave requests' },
  { id: 'appraisals', name: 'Appraisals', icon: Star, category: 'HR', description: 'Employee evaluations' },
  { id: 'referral', name: 'Referral', icon: UserPlus, category: 'HR', description: 'Job referrals' },
  { id: 'fleet', name: 'Fleet', icon: Car, category: 'HR', description: 'Vehicle and cost tracking' },
  
  { id: 'marketing', name: 'Marketing Analytics', icon: BarChart3, category: 'Marketing', description: 'Email, SMS, and Social Marketing metrics' },
  { id: 'events', name: 'Events', icon: Ticket, category: 'Marketing', description: 'Publish events and sell tickets' },
  { id: 'survey', name: 'Survey', icon: MessageSquare, category: 'Marketing', description: 'Live or shared surveys' },
  
  { id: 'project', name: 'Project', icon: Layers, category: 'Operations', description: 'Plan and organize projects' },
  { id: 'scheduler', name: 'Scheduler', icon: Clock, category: 'Operations', description: 'Employee schedules' },
  { id: 'appointments', name: 'Appointments', icon: Calendar, category: 'Operations', description: 'Booking meetings' },
  { id: 'requests', name: 'Requests', icon: ClipboardCheck, category: 'Operations', description: 'Approval requests' },
];

export const PLANS = [
  {
    id: 'free',
    name: 'Standard',
    price: 0,
    features: ['Dashboard', 'CRM', 'Invoicing'],
    description: 'Essential core for small teams'
  },
  {
    id: 'business',
    name: 'Business',
    price: 49,
    features: 'all_sales_finance',
    description: 'Advanced sales and financial tools'
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    price: 199,
    features: 'full_access',
    description: 'Complete cross-region neural sync OS'
  }
];

export const WIDGETS = [
  { id: 'leads_metric', name: 'Open Leads', type: 'metric', category: 'CRM' },
  { id: 'sales_velocity', name: 'Sales Velocity', type: 'chart', category: 'Sales' },
  { id: 'inventory_alerts', name: 'Inventory Alerts', type: 'list', category: 'Inventory' },
  { id: 'unpaid_invoices', name: 'Unpaid Invoices', type: 'metric', category: 'Invoicing' },
  { id: 'pending_approvals', name: 'Pending Approvals', type: 'list', category: 'Requests' },
  { id: 'active_projects', name: 'Active Projects', type: 'list', category: 'Project' },
  { id: 'subscription_renewals', name: 'Renewals', type: 'metric', category: 'Subscriptions' },
  { id: 'timeoff_requests', name: 'Time Off', type: 'list', category: 'HR' },
];


