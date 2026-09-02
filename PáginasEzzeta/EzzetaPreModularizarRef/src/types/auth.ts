export interface Address {
  id: string;
  label: string;
  street: string;
  number: string;
  district: string;
  province: string;
  department: string;
  postalCode?: string;
  phone: string;
  isDefault?: boolean;
  createdAt: string;
}

export interface PaymentMethod {
  id: string;
  label: string;
  type: 'credit_card' | 'bank_transfer' | 'cash';
  cardNumber?: string;
  cardHolder?: string;
  bankName?: string;
  accountNumber?: string;
  isDefault?: boolean;
  createdAt: string;
}

export interface PurchaseItem {
  productId: number;
  name: string;
  quantity: number;
  unitPrice: number;
  subtotal: number;
  discount: number;
  total: number;
  size: string;
}

export interface PurchaseOrder {
  id: string;
  date: string;
  time: string;
  createdAt: string;
  items: PurchaseItem[];
  subtotal: number;
  discount: number;
  total: number;
  paymentMethod?: string;
}

export interface WholesaleUser {
  id: string;
  username: string;
  email: string;
  password: string;
  phone: string;
  ruc?: string;
  totalSpent: number;
  purchaseCount: number;
  lastPurchaseAt?: string;
  purchases: PurchaseOrder[];
  createdAt: string;
  estado?: 'activo' | 'inactivo' | 'suspendido';
  suspendUntil?: string | null;
  addresses?: Address[];
  paymentMethods?: PaymentMethod[];
  plan?: string;
  discount?: number;
  planStart?: string;
  planEnd?: string;
  autoRenew?: boolean;
}

export interface Permission {
  [key: string]: unknown;
}

export interface Warehouse {
  [key: string]: unknown;
}

export interface AuthSession {
  user: WholesaleUser;
  profile_data: Record<string, unknown> | null;
  permissions: Permission[];
  permission_codes: string[];
  active_warehouse_id: string | number | null;
  available_warehouses: Warehouse[];
  createdAt: string;
}

export interface RegisterUserInput {
  username: string;
  email: string;
  password: string;
  phone: string;
  ruc?: string;
}

export interface LoginCredentials {
  identifier: string;
  password: string;
}

export interface PurchaseOrderInput {
  items: PurchaseItem[];
  subtotal: number;
  discount: number;
  total: number;
  paymentMethod?: string;
}
