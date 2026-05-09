export type LeadStatus = "new" | "contacted" | "qualified" | "lost";
export type CustomerStatus = "active" | "inactive";
export type OrderStatus = "draft" | "confirmed" | "shipped" | "cancelled";
export type ActivityType = "note" | "call" | "email" | "meeting";

export interface Lead {
  id: string;
  name: string;
  email?: string;
  source?: string;
  status: LeadStatus;
  estimatedValue?: number;
  ownerId: string;
  createdAt: string;
  updatedAt: string;
}

export interface Customer {
  id: string;
  name: string;
  email: string;
  phone?: string;
  status: CustomerStatus;
  address?: string;
  ownerId: string;
  createdAt: string;
  updatedAt: string;
}

export interface Product {
  id: string;
  name: string;
  sku: string;
  price: number;
  stock: number;
  category?: string;
  ownerId: string;
  createdAt: string;
  updatedAt: string;
}

export interface OrderItem {
  productId: string;
  quantity: number;
  price: number;
}

export interface SalesOrder {
  id: string;
  customerId: string;
  items: OrderItem[];
  totalValue: number;
  status: OrderStatus;
  ownerId: string;
  orderDate: string;
  createdAt: string;
  updatedAt: string;
}

export interface Activity {
  id: string;
  relatedId: string;
  relatedType: "lead" | "customer";
  type: ActivityType;
  content: string;
  ownerId: string;
  createdAt: string;
}
