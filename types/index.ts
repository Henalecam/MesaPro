import {
  Order,
  OrderItem,
  OrderStatus,
  PaymentMethod,
  Tab,
  TabStatus,
  Table,
  TableStatus
} from "@prisma/client";

export type ApiSuccess<T> = {
  success: true;
  data: T;
};

export type ApiError = {
  success: false;
  error: string;
};

export type ApiResponse<T> = ApiSuccess<T> | ApiError;

export type DashboardMetrics = {
  salesToday: number;
  salesWeek: number;
  salesMonth: number;
  ordersCount: number;
  averageTicket: number;
  occupiedTables: number;
  salesChart: Array<{ date: string; value: number }>;
  topProducts: Array<{ name: string; quantity: number; total: number }>;
  topWaiters: Array<{ name: string; total: number }>;
  lowStockAlerts: Array<{ name: string; quantity: number; minQuantity: number }>;
  staleTabs: Array<{ code: string; tableNumber: number; openedAt: Date }>;
};

export type TableWithTab = Table & {
  tabs: Array<Tab>;
};

export type TabWithRelations = Tab & {
  table: Table;
  orders: Array<
    Order & {
      items: Array<OrderItem>;
    }
  >;
};

export type OrderWithRelations = Order & {
  tab: Tab & {
    table: Table;
  };
  items: Array<OrderItem>;
};

export type StatusColorMap = Record<
  TableStatus | TabStatus | OrderStatus,
  string
>;

export type SelectOption = {
  label: string;
  value: string;
};

export type PaginatedResult<T> = {
  items: Array<T>;
  total: number;
};

export type SalesReport = {
  totalRevenue: number;
  totalOrders: number;
  averageTicket: number;
  totalsByPayment: Array<{ paymentMethod: PaymentMethod; total: number }>;
  dailyTotals: Array<{ date: string; total: number }>;
  details: Array<{
    tabCode: string;
    tableNumber: number;
    waiterName: string;
    totalAmount: number;
    paymentMethod: PaymentMethod | null;
  }>;
};

export type ProductsReport = {
  items: Array<{
    name: string;
    category: string;
    quantity: number;
    total: number;
  }>;
};

export type WaitersReport = {
  items: Array<{
    waiterName: string;
    tabsCount: number;
    total: number;
    averageTicket: number;
  }>;
};
