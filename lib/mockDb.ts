import { randomUUID } from "crypto";
import {
  Category,
  MenuItem,
  Order,
  OrderItem,
  OrderItemStatus,
  OrderStatus,
  PaymentMethod,
  Role,
  StockItem,
  Tab,
  TabStatus,
  Table,
  TableStatus,
  Waiter
} from "@prisma/client";
import {
  DashboardMetrics,
  ProductsReport,
  SalesReport,
  WaitersReport
} from "@/types";
import { generateSequentialCode } from "@/lib/utils";
import { CategoryCreateInput, CategoryUpdateInput } from "@/lib/validations/category";
import { MenuItemCreateInput, MenuItemUpdateInput } from "@/lib/validations/menuItem";
import { OrderCreateInput, OrderStatusInput } from "@/lib/validations/order";
import { StockItemCreateInput, StockItemUpdateInput } from "@/lib/validations/stockItem";
import { TabCloseInput } from "@/lib/validations/tab";
import { TableCreateInput, TableUpdateInput } from "@/lib/validations/table";
import { WaiterCreateInput, WaiterUpdateInput } from "@/lib/validations/waiter";

type MockUser = {
  id: string;
  email: string;
  password: string;
  name: string;
  role: Role;
  restaurantId: string;
};

type MenuItemIngredientRecord = {
  menuItemId: string;
  stockItemId: string;
  quantity: number;
};

type MenuItemFilter = {
  categoryId?: string;
  isAvailable?: boolean;
  search?: string;
};

type TabFilter = {
  status?: TabStatus;
  waiterId?: string;
  startDate?: Date;
  endDate?: Date;
  search?: string;
};

type OrderFilter = {
  status?: OrderStatus;
  tabId?: string;
  startDate?: Date;
  endDate?: Date;
};

class MockDatabase {
  private restaurantId = "clrest0000000000000000000";
  private users: Array<MockUser>;
  private categories: Array<Category>;
  private menuItems: Array<MenuItem>;
  private menuItemIngredients: Array<MenuItemIngredientRecord>;
  private stockItems: Array<StockItem>;
  private tables: Array<Table>;
  private waiters: Array<Waiter>;
  private tabs: Array<Tab>;
  private orders: Array<Order>;
  private orderItems: Array<OrderItem>;
  private activeUserId: string;
  private counter = 0;

  constructor() {
    const now = new Date();
    const minute = 60 * 1000;
    const hour = 60 * minute;
    const day = 24 * hour;
    const hashedPassword = "$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZGHFQUNBM8DT6vKrrO5ObUvGi4Zra";

    const categoryIds = [
      "clcat00000000000000000001",
      "clcat00000000000000000002",
      "clcat00000000000000000003"
    ];
    const stockItemIds = [
      "clstk00000000000000000001",
      "clstk00000000000000000002",
      "clstk00000000000000000003",
      "clstk00000000000000000004",
      "clstk00000000000000000005",
      "clstk00000000000000000006"
    ];
    const menuItemIds = [
      "clmni00000000000000000001",
      "clmni00000000000000000002",
      "clmni00000000000000000003",
      "clmni00000000000000000004",
      "clmni00000000000000000005",
      "clmni00000000000000000006"
    ];
    const tableIds = [
      "cltbl00000000000000000001",
      "cltbl00000000000000000002",
      "cltbl00000000000000000003",
      "cltbl00000000000000000004",
      "cltbl00000000000000000005"
    ];
    const waiterIds = [
      "clwtr00000000000000000001",
      "clwtr00000000000000000002",
      "clwtr00000000000000000003"
    ];
    const tabIds = [
      "cltab00000000000000000001",
      "cltab00000000000000000002",
      "cltab00000000000000000003",
      "cltab00000000000000000004",
      "cltab00000000000000000005"
    ];
    const orderIds = [
      "clord00000000000000000001",
      "clord00000000000000000002",
      "clord00000000000000000003",
      "clord00000000000000000004"
    ];
    const orderItemIds = [
      "cloit00000000000000000001",
      "cloit00000000000000000002",
      "cloit00000000000000000003",
      "cloit00000000000000000004",
      "cloit00000000000000000005",
      "cloit00000000000000000006",
      "cloit00000000000000000007",
      "cloit00000000000000000008"
    ];

    this.users = [
      {
        id: "clusr00000000000000000001",
        email: "admin@mock.com",
        password: hashedPassword,
        name: "Administrador Mock",
        role: "ADMIN",
        restaurantId: this.restaurantId
      },
      {
        id: "clusr00000000000000000002",
        email: "garcom@mock.com",
        password: hashedPassword,
        name: "Carlos Atendimento",
        role: "WAITER",
        restaurantId: this.restaurantId
      },
      {
        id: "clusr00000000000000000003",
        email: "cozinha@mock.com",
        password: hashedPassword,
        name: "Maria Cozinha",
        role: "KITCHEN",
        restaurantId: this.restaurantId
      }
    ];
    this.activeUserId = this.users[0].id;

    this.categories = [
      {
        id: categoryIds[0],
        name: "Entradas",
        description: "Opções para começar",
        order: 1,
        isActive: true,
        restaurantId: this.restaurantId,
        createdAt: new Date(now.getTime() - 15 * day),
        updatedAt: new Date(now.getTime() - 15 * day)
      },
      {
        id: categoryIds[1],
        name: "Pratos Principais",
        description: "Clássicos da casa",
        order: 2,
        isActive: true,
        restaurantId: this.restaurantId,
        createdAt: new Date(now.getTime() - 12 * day),
        updatedAt: new Date(now.getTime() - 3 * day)
      },
      {
        id: categoryIds[2],
        name: "Sobremesas",
        description: "Doces especiais",
        order: 3,
        isActive: true,
        restaurantId: this.restaurantId,
        createdAt: new Date(now.getTime() - 10 * day),
        updatedAt: new Date(now.getTime() - 5 * day)
      }
    ];

    this.stockItems = [
      {
        id: stockItemIds[0],
        name: "Farinha de Trigo",
        unit: "kg",
        quantity: 18,
        minQuantity: 8,
        cost: 4.5,
        isActive: true,
        restaurantId: this.restaurantId,
        createdAt: new Date(now.getTime() - 20 * day),
        updatedAt: new Date(now.getTime() - 2 * day)
      },
      {
        id: stockItemIds[1],
        name: "Queijo Parmesão",
        unit: "kg",
        quantity: 6,
        minQuantity: 10,
        cost: 45,
        isActive: true,
        restaurantId: this.restaurantId,
        createdAt: new Date(now.getTime() - 18 * day),
        updatedAt: new Date(now.getTime() - day)
      },
      {
        id: stockItemIds[2],
        name: "Tomate Italiano",
        unit: "kg",
        quantity: 14,
        minQuantity: 6,
        cost: 8,
        isActive: true,
        restaurantId: this.restaurantId,
        createdAt: new Date(now.getTime() - 18 * day),
        updatedAt: new Date(now.getTime() - day)
      },
      {
        id: stockItemIds[3],
        name: "Carne Bovina Premium",
        unit: "kg",
        quantity: 12,
        minQuantity: 5,
        cost: 72,
        isActive: true,
        restaurantId: this.restaurantId,
        createdAt: new Date(now.getTime() - 14 * day),
        updatedAt: new Date(now.getTime() - 3 * day)
      },
      {
        id: stockItemIds[4],
        name: "Alface Americana",
        unit: "kg",
        quantity: 3,
        minQuantity: 5,
        cost: 6,
        isActive: true,
        restaurantId: this.restaurantId,
        createdAt: new Date(now.getTime() - 7 * day),
        updatedAt: new Date(now.getTime() - 2 * day)
      },
      {
        id: stockItemIds[5],
        name: "Chocolate Amargo",
        unit: "kg",
        quantity: 9,
        minQuantity: 4,
        cost: 38,
        isActive: true,
        restaurantId: this.restaurantId,
        createdAt: new Date(now.getTime() - 9 * day),
        updatedAt: new Date(now.getTime() - 2 * day)
      }
    ];

    this.menuItems = [
      {
        id: menuItemIds[0],
        name: "Bruschetta Clássica",
        description: "Pão italiano com tomates temperados",
        price: 18,
        image: null,
        isAvailable: true,
        preparationTime: 10,
        categoryId: categoryIds[0],
        restaurantId: this.restaurantId,
        createdAt: new Date(now.getTime() - 14 * day),
        updatedAt: new Date(now.getTime() - 4 * day)
      },
      {
        id: menuItemIds[1],
        name: "Salada Caesar",
        description: "Alface americana, croutons e molho especial",
        price: 24,
        image: null,
        isAvailable: true,
        preparationTime: 12,
        categoryId: categoryIds[0],
        restaurantId: this.restaurantId,
        createdAt: new Date(now.getTime() - 13 * day),
        updatedAt: new Date(now.getTime() - 3 * day)
      },
      {
        id: menuItemIds[2],
        name: "Risoto de Cogumelos",
        description: "Risoto cremoso com cogumelos frescos",
        price: 48,
        image: null,
        isAvailable: true,
        preparationTime: 25,
        categoryId: categoryIds[1],
        restaurantId: this.restaurantId,
        createdAt: new Date(now.getTime() - 12 * day),
        updatedAt: new Date(now.getTime() - 2 * day)
      },
      {
        id: menuItemIds[3],
        name: "Picanha Grelhada",
        description: "Picanha grelhada com batatas rústicas",
        price: 72,
        image: null,
        isAvailable: true,
        preparationTime: 30,
        categoryId: categoryIds[1],
        restaurantId: this.restaurantId,
        createdAt: new Date(now.getTime() - 11 * day),
        updatedAt: new Date(now.getTime() - 2 * day)
      },
      {
        id: menuItemIds[4],
        name: "Brownie com Sorvete",
        description: "Brownie quente com sorvete de creme",
        price: 28,
        image: null,
        isAvailable: true,
        preparationTime: 8,
        categoryId: categoryIds[2],
        restaurantId: this.restaurantId,
        createdAt: new Date(now.getTime() - 10 * day),
        updatedAt: new Date(now.getTime() - 2 * day)
      },
      {
        id: menuItemIds[5],
        name: "Cheesecake de Frutas Vermelhas",
        description: "Cheesecake com calda de frutas vermelhas",
        price: 32,
        image: null,
        isAvailable: false,
        preparationTime: 15,
        categoryId: categoryIds[2],
        restaurantId: this.restaurantId,
        createdAt: new Date(now.getTime() - 9 * day),
        updatedAt: new Date(now.getTime() - 6 * day)
      }
    ];

    this.menuItemIngredients = [
      {
        menuItemId: menuItemIds[0],
        stockItemId: stockItemIds[1],
        quantity: 0.05
      },
      {
        menuItemId: menuItemIds[0],
        stockItemId: stockItemIds[2],
        quantity: 0.08
      },
      {
        menuItemId: menuItemIds[1],
        stockItemId: stockItemIds[4],
        quantity: 0.12
      },
      {
        menuItemId: menuItemIds[1],
        stockItemId: stockItemIds[1],
        quantity: 0.04
      },
      {
        menuItemId: menuItemIds[2],
        stockItemId: stockItemIds[0],
        quantity: 0.15
      },
      {
        menuItemId: menuItemIds[2],
        stockItemId: stockItemIds[1],
        quantity: 0.06
      },
      {
        menuItemId: menuItemIds[3],
        stockItemId: stockItemIds[3],
        quantity: 0.25
      },
      {
        menuItemId: menuItemIds[4],
        stockItemId: stockItemIds[5],
        quantity: 0.1
      }
    ];

    this.tables = [
      {
        id: tableIds[0],
        number: 1,
        capacity: 4,
        status: "OCCUPIED",
        restaurantId: this.restaurantId,
        createdAt: new Date(now.getTime() - 30 * day),
        updatedAt: new Date(now.getTime() - 30 * minute)
      },
      {
        id: tableIds[1],
        number: 2,
        capacity: 4,
        status: "AVAILABLE",
        restaurantId: this.restaurantId,
        createdAt: new Date(now.getTime() - 28 * day),
        updatedAt: new Date(now.getTime() - 2 * hour)
      },
      {
        id: tableIds[2],
        number: 3,
        capacity: 6,
        status: "RESERVED",
        restaurantId: this.restaurantId,
        createdAt: new Date(now.getTime() - 26 * day),
        updatedAt: new Date(now.getTime() - 3 * hour)
      },
      {
        id: tableIds[3],
        number: 4,
        capacity: 4,
        status: "OCCUPIED",
        restaurantId: this.restaurantId,
        createdAt: new Date(now.getTime() - 25 * day),
        updatedAt: new Date(now.getTime() - 3 * hour)
      },
      {
        id: tableIds[4],
        number: 5,
        capacity: 2,
        status: "AVAILABLE",
        restaurantId: this.restaurantId,
        createdAt: new Date(now.getTime() - 20 * day),
        updatedAt: new Date(now.getTime() - 6 * hour)
      }
    ];

    this.waiters = [
      {
        id: waiterIds[0],
        name: "Carlos Silva",
        phone: "(11) 98765-4321",
        cpf: null,
        isActive: true,
        restaurantId: this.restaurantId,
        createdAt: new Date(now.getTime() - 40 * day),
        updatedAt: new Date(now.getTime() - 2 * day)
      },
      {
        id: waiterIds[1],
        name: "Maria Fernandes",
        phone: "(11) 91234-5678",
        cpf: null,
        isActive: true,
        restaurantId: this.restaurantId,
        createdAt: new Date(now.getTime() - 32 * day),
        updatedAt: new Date(now.getTime() - 3 * day)
      },
      {
        id: waiterIds[2],
        name: "João Ribeiro",
        phone: "(11) 99876-1111",
        cpf: null,
        isActive: true,
        restaurantId: this.restaurantId,
        createdAt: new Date(now.getTime() - 25 * day),
        updatedAt: new Date(now.getTime() - 4 * day)
      }
    ];

    this.tabs = [
      {
        id: tabIds[0],
        code: "C105",
        status: "OPEN",
        openedAt: new Date(now.getTime() - 30 * minute),
        closedAt: null,
        totalAmount: 108,
        paymentMethod: null,
        discount: 0,
        tableId: tableIds[0],
        waiterId: waiterIds[0],
        restaurantId: this.restaurantId,
        createdAt: new Date(now.getTime() - 30 * minute),
        updatedAt: new Date(now.getTime() - 30 * minute)
      },
      {
        id: tabIds[1],
        code: "C104",
        status: "OPEN",
        openedAt: new Date(now.getTime() - 3 * hour),
        closedAt: null,
        totalAmount: 24,
        paymentMethod: null,
        discount: 0,
        tableId: tableIds[3],
        waiterId: waiterIds[1],
        restaurantId: this.restaurantId,
        createdAt: new Date(now.getTime() - 3 * hour),
        updatedAt: new Date(now.getTime() - 2 * hour)
      },
      {
        id: tabIds[2],
        code: "C103",
        status: "CLOSED",
        openedAt: new Date(now.getTime() - day - 2 * hour),
        closedAt: new Date(now.getTime() - day + 45 * minute),
        totalAmount: 224,
        paymentMethod: "CREDIT",
        discount: 0,
        tableId: tableIds[1],
        waiterId: waiterIds[2],
        restaurantId: this.restaurantId,
        createdAt: new Date(now.getTime() - day - 2 * hour),
        updatedAt: new Date(now.getTime() - day + 45 * minute)
      },
      {
        id: tabIds[3],
        code: "C102",
        status: "CLOSED",
        openedAt: new Date(now.getTime() - 4 * day - 3 * hour),
        closedAt: new Date(now.getTime() - 4 * day + 2 * hour),
        totalAmount: 114,
        paymentMethod: "PIX",
        discount: 0,
        tableId: tableIds[2],
        waiterId: waiterIds[0],
        restaurantId: this.restaurantId,
        createdAt: new Date(now.getTime() - 4 * day - 3 * hour),
        updatedAt: new Date(now.getTime() - 4 * day + 2 * hour)
      },
      {
        id: tabIds[4],
        code: "C101",
        status: "CANCELLED",
        openedAt: new Date(now.getTime() - 2 * day),
        closedAt: new Date(now.getTime() - 2 * day + hour),
        totalAmount: 0,
        paymentMethod: null,
        discount: 0,
        tableId: tableIds[4],
        waiterId: waiterIds[1],
        restaurantId: this.restaurantId,
        createdAt: new Date(now.getTime() - 2 * day),
        updatedAt: new Date(now.getTime() - 2 * day + hour)
      }
    ];

    this.orders = [
      {
        id: orderIds[0],
        status: "PREPARING",
        notes: null,
        totalAmount: 108,
        tabId: tabIds[0],
        restaurantId: this.restaurantId,
        createdAt: new Date(now.getTime() - 25 * minute),
        updatedAt: new Date(now.getTime() - 20 * minute)
      },
      {
        id: orderIds[1],
        status: "READY",
        notes: null,
        totalAmount: 24,
        tabId: tabIds[1],
        restaurantId: this.restaurantId,
        createdAt: new Date(now.getTime() - 2.5 * hour),
        updatedAt: new Date(now.getTime() - 2 * hour)
      },
      {
        id: orderIds[2],
        status: "DELIVERED",
        notes: null,
        totalAmount: 224,
        tabId: tabIds[2],
        restaurantId: this.restaurantId,
        createdAt: new Date(now.getTime() - day),
        updatedAt: new Date(now.getTime() - day + 45 * minute)
      },
      {
        id: orderIds[3],
        status: "DELIVERED",
        notes: null,
        totalAmount: 114,
        tabId: tabIds[3],
        restaurantId: this.restaurantId,
        createdAt: new Date(now.getTime() - 4 * day),
        updatedAt: new Date(now.getTime() - 4 * day + 2 * hour)
      }
    ];

    this.orderItems = [
      {
        id: orderItemIds[0],
        quantity: 2,
        unitPrice: 18,
        totalPrice: 36,
        notes: null,
        status: "PREPARING",
        orderId: orderIds[0],
        menuItemId: menuItemIds[0],
        createdAt: new Date(now.getTime() - 25 * minute),
        updatedAt: new Date(now.getTime() - 20 * minute)
      },
      {
        id: orderItemIds[1],
        quantity: 1,
        unitPrice: 72,
        totalPrice: 72,
        notes: null,
        status: "PENDING",
        orderId: orderIds[0],
        menuItemId: menuItemIds[3],
        createdAt: new Date(now.getTime() - 24 * minute),
        updatedAt: new Date(now.getTime() - 24 * minute)
      },
      {
        id: orderItemIds[2],
        quantity: 1,
        unitPrice: 24,
        totalPrice: 24,
        notes: null,
        status: "READY",
        orderId: orderIds[1],
        menuItemId: menuItemIds[1],
        createdAt: new Date(now.getTime() - 2.5 * hour),
        updatedAt: new Date(now.getTime() - 2 * hour)
      },
      {
        id: orderItemIds[3],
        quantity: 2,
        unitPrice: 72,
        totalPrice: 144,
        notes: null,
        status: "DELIVERED",
        orderId: orderIds[2],
        menuItemId: menuItemIds[3],
        createdAt: new Date(now.getTime() - day),
        updatedAt: new Date(now.getTime() - day + 45 * minute)
      },
      {
        id: orderItemIds[4],
        quantity: 1,
        unitPrice: 24,
        totalPrice: 24,
        notes: null,
        status: "DELIVERED",
        orderId: orderIds[2],
        menuItemId: menuItemIds[1],
        createdAt: new Date(now.getTime() - day + 5 * minute),
        updatedAt: new Date(now.getTime() - day + 45 * minute)
      },
      {
        id: orderItemIds[5],
        quantity: 2,
        unitPrice: 28,
        totalPrice: 56,
        notes: null,
        status: "DELIVERED",
        orderId: orderIds[2],
        menuItemId: menuItemIds[4],
        createdAt: new Date(now.getTime() - day + 10 * minute),
        updatedAt: new Date(now.getTime() - day + 45 * minute)
      },
      {
        id: orderItemIds[6],
        quantity: 2,
        unitPrice: 48,
        totalPrice: 96,
        notes: null,
        status: "DELIVERED",
        orderId: orderIds[3],
        menuItemId: menuItemIds[2],
        createdAt: new Date(now.getTime() - 4 * day),
        updatedAt: new Date(now.getTime() - 4 * day + 2 * hour)
      },
      {
        id: orderItemIds[7],
        quantity: 1,
        unitPrice: 18,
        totalPrice: 18,
        notes: null,
        status: "DELIVERED",
        orderId: orderIds[3],
        menuItemId: menuItemIds[0],
        createdAt: new Date(now.getTime() - 4 * day + 10 * minute),
        updatedAt: new Date(now.getTime() - 4 * day + 2 * hour)
      }
    ];
  }

  private clone<T>(value: T): T {
    return structuredClone(value);
  }

  private generateId() {
    const timestamp = Date.now().toString(36).padStart(10, "0");
    const sequence = (this.counter += 1).toString(36).padStart(4, "0");
    const random = randomUUID().replace(/-/g, "").slice(0, 10);
    return `c${timestamp}${sequence}${random}`.slice(0, 25);
  }

  private ensureRestaurant(restaurantId: string) {
    if (restaurantId !== this.restaurantId) {
      throw new Error("Restaurante inválido");
    }
  }

  private startOfDay(date: Date) {
    const d = new Date(date);
    d.setHours(0, 0, 0, 0);
    return d;
  }

  private endOfDay(date: Date) {
    const d = new Date(date);
    d.setHours(23, 59, 59, 999);
    return d;
  }

  private startOfWeek(date: Date) {
    const d = this.startOfDay(date);
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1);
    return new Date(d.setDate(diff));
  }

  private startOfMonth(date: Date) {
    const d = this.startOfDay(date);
    d.setDate(1);
    return d;
  }

  private findCategory(id: string) {
    return this.categories.find((category) => category.id === id);
  }

  private findMenuItem(id: string) {
    return this.menuItems.find((item) => item.id === id);
  }

  private findStockItem(id: string) {
    return this.stockItems.find((item) => item.id === id);
  }

  private findTable(id: string) {
    return this.tables.find((table) => table.id === id);
  }

  private findWaiter(id: string) {
    return this.waiters.find((waiter) => waiter.id === id);
  }

  private findTab(id: string) {
    return this.tabs.find((tab) => tab.id === id);
  }

  private findOrder(id: string) {
    return this.orders.find((order) => order.id === id);
  }

  private getMenuItemIngredients(menuItemId: string) {
    return this.menuItemIngredients.filter(
      (ingredient) => ingredient.menuItemId === menuItemId
    );
  }

  private getOrderItems(orderId: string) {
    return this.orderItems.filter((item) => item.orderId === orderId);
  }

  private buildMenuItem(item: MenuItem) {
    const category = this.findCategory(item.categoryId);
    const ingredients = this.getMenuItemIngredients(item.id).map((ingredient) => {
      const stockItem = this.findStockItem(ingredient.stockItemId);
      if (!stockItem) {
        return null;
      }
      return {
        menuItemId: ingredient.menuItemId,
        stockItemId: ingredient.stockItemId,
        quantity: ingredient.quantity,
        stockItem: this.clone(stockItem)
      };
    });
    return {
      ...this.clone(item),
      category: category ? this.clone(category) : null,
      ingredients: ingredients.filter(Boolean)
    };
  }

  private buildStockItem(item: StockItem) {
    const relations = this.menuItemIngredients
      .filter((ingredient) => ingredient.stockItemId === item.id)
      .map((ingredient) => {
        const menuItem = this.findMenuItem(ingredient.menuItemId);
        if (!menuItem) {
          return null;
        }
        return {
          menuItemId: ingredient.menuItemId,
          stockItemId: ingredient.stockItemId,
          quantity: ingredient.quantity,
          menuItem: this.clone(menuItem)
        };
      });
    return {
      ...this.clone(item),
      menuItems: relations.filter(Boolean)
    };
  }

  private buildOrderWithItems(order: Order) {
    const items = this.getOrderItems(order.id).map((item) => {
      const menuItem = this.findMenuItem(item.menuItemId);
      return {
        ...this.clone(item),
        menuItem: menuItem ? this.clone(menuItem) : null
      };
    });
    return {
      ...this.clone(order),
      items
    };
  }

  private buildOrderWithRelations(order: Order) {
    const tab = this.findTab(order.tabId);
    if (!tab) {
      return null;
    }
    const table = this.findTable(tab.tableId);
    const waiter = this.findWaiter(tab.waiterId);
    return {
      ...this.buildOrderWithItems(order),
      tab: {
        ...this.clone(tab),
        table: table ? this.clone(table) : null,
        waiter: waiter ? this.clone(waiter) : null
      }
    };
  }

  private buildTabWithRelations(tab: Tab) {
    const table = this.findTable(tab.tableId);
    const waiter = this.findWaiter(tab.waiterId);
    const orders = this.orders
      .filter((order) => order.tabId === tab.id)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
      .map((order) => this.buildOrderWithItems(order));
    return {
      ...this.clone(tab),
      table: table ? this.clone(table) : null,
      waiter: waiter ? this.clone(waiter) : null,
      orders
    };
  }

  private recomputeOrder(orderId: string) {
    const order = this.findOrder(orderId);
    if (!order) {
      return;
    }
    const items = this.getOrderItems(orderId);
    const total = items.reduce((acc, item) => {
      if (item.status === "CANCELLED") {
        return acc;
      }
      return acc + item.totalPrice;
    }, 0);
    order.totalAmount = total;
    const allCancelled = items.every((item) => item.status === "CANCELLED");
    const allDelivered = items.every((item) => item.status === "DELIVERED");
    if (allCancelled) {
      order.status = "CANCELLED";
    } else if (allDelivered) {
      order.status = "DELIVERED";
    } else if (items.some((item) => item.status === "PREPARING")) {
      order.status = "PREPARING";
    } else if (items.some((item) => item.status === "READY")) {
      order.status = "READY";
    } else if (items.every((item) => item.status === "PENDING")) {
      order.status = "PENDING";
    } else {
      order.status = "PENDING";
    }
    order.updatedAt = new Date();
  }

  private recomputeTab(tabId: string) {
    const tab = this.findTab(tabId);
    if (!tab) {
      return;
    }
    const orders = this.orders.filter(
      (order) => order.tabId === tabId && order.status !== "CANCELLED"
    );
    tab.totalAmount = orders.reduce((acc, order) => acc + order.totalAmount, 0);
    tab.updatedAt = new Date();
  }

  private deductStockForItem(orderItem: OrderItem) {
    const menuItem = this.findMenuItem(orderItem.menuItemId);
    if (!menuItem) {
      throw new Error("Item do cardápio inválido");
    }
    for (const ingredient of this.getMenuItemIngredients(menuItem.id)) {
      const stockItem = this.findStockItem(ingredient.stockItemId);
      if (!stockItem) {
        throw new Error("Item de estoque inválido");
      }
      const required = ingredient.quantity * orderItem.quantity;
      if (stockItem.quantity < required) {
        throw new Error(`Estoque insuficiente para ${menuItem.name}`);
      }
      stockItem.quantity -= required;
      stockItem.updatedAt = new Date();
    }
  }

  getUserByEmail(email: string) {
    const user = this.users.find((entry) => entry.email === email);
    return user ? this.clone(user) : null;
  }

  getUserById(id: string) {
    const user = this.users.find((entry) => entry.id === id);
    return user ? this.clone(user) : null;
  }

  listUsers() {
    return this.users.map((user) => this.clone(user));
  }

  getActiveUser() {
    const user =
      this.users.find((entry) => entry.id === this.activeUserId) ??
      this.users[0] ??
      null;
    return user ? this.clone(user) : null;
  }

  setActiveUser(id: string) {
    const user = this.users.find((entry) => entry.id === id);
    if (!user) {
      return null;
    }
    this.activeUserId = user.id;
    return this.clone(user);
  }

  listCategories(restaurantId: string) {
    this.ensureRestaurant(restaurantId);
    return this.categories
      .filter((category) => category.restaurantId === restaurantId)
      .sort((a, b) => a.order - b.order)
      .map((category) => ({
        ...this.clone(category),
        menuItems: this.menuItems
          .filter((item) => item.restaurantId === restaurantId && item.categoryId === category.id)
          .map((item) => ({ id: item.id }))
      }));
  }

  getCategoryWithMenuItems(restaurantId: string, id: string) {
    this.ensureRestaurant(restaurantId);
    const category = this.findCategory(id);
    if (!category || category.restaurantId !== restaurantId) {
      return null;
    }
    return {
      ...this.clone(category),
      menuItems: this.menuItems
        .filter((item) => item.restaurantId === restaurantId && item.categoryId === id)
        .map((item) => ({ id: item.id }))
    };
  }

  createCategory(restaurantId: string, data: CategoryCreateInput) {
    this.ensureRestaurant(restaurantId);
    const now = new Date();
    const category: Category = {
      id: this.generateId(),
      name: data.name,
      description: data.description ?? null,
      order: data.order ?? 0,
      isActive: data.isActive ?? true,
      restaurantId,
      createdAt: now,
      updatedAt: now
    };
    this.categories.push(category);
    return this.clone(category);
  }

  updateCategory(restaurantId: string, id: string, data: CategoryUpdateInput) {
    this.ensureRestaurant(restaurantId);
    const category = this.findCategory(id);
    if (!category || category.restaurantId !== restaurantId) {
      return null;
    }
    if (data.name !== undefined) {
      category.name = data.name;
    }
    if (data.description !== undefined) {
      category.description = data.description ?? null;
    }
    if (data.order !== undefined) {
      category.order = data.order;
    }
    if (data.isActive !== undefined) {
      category.isActive = data.isActive;
    }
    category.updatedAt = new Date();
    return this.clone(category);
  }

  deleteCategory(restaurantId: string, id: string) {
    this.ensureRestaurant(restaurantId);
    const index = this.categories.findIndex(
      (category) => category.id === id && category.restaurantId === restaurantId
    );
    if (index === -1) {
      return false;
    }
    this.categories.splice(index, 1);
    return true;
  }

  listMenuItems(restaurantId: string, filter: MenuItemFilter = {}) {
    this.ensureRestaurant(restaurantId);
    const { categoryId, isAvailable, search } = filter;
    return this.menuItems
      .filter((item) => {
        if (item.restaurantId !== restaurantId) {
          return false;
        }
        if (categoryId && item.categoryId !== categoryId) {
          return false;
        }
        if (isAvailable !== undefined && item.isAvailable !== isAvailable) {
          return false;
        }
        if (search) {
          const term = search.toLowerCase();
          if (!item.name.toLowerCase().includes(term)) {
            return false;
          }
        }
        return true;
      })
      .sort((a, b) => a.name.localeCompare(b.name))
      .map((item) => this.buildMenuItem(item));
  }

  getMenuItem(restaurantId: string, id: string) {
    this.ensureRestaurant(restaurantId);
    const item = this.findMenuItem(id);
    if (!item || item.restaurantId !== restaurantId) {
      return null;
    }
    return this.buildMenuItem(item);
  }

  findMenuItemsByIds(restaurantId: string, ids: Array<string>) {
    this.ensureRestaurant(restaurantId);
    return this.menuItems.filter(
      (item) => item.restaurantId === restaurantId && ids.includes(item.id)
    );
  }

  createMenuItem(restaurantId: string, data: MenuItemCreateInput) {
    this.ensureRestaurant(restaurantId);
    const now = new Date();
    const menuItem: MenuItem = {
      id: this.generateId(),
      name: data.name,
      description: data.description ?? null,
      price: data.price,
      image: data.image ?? null,
      isAvailable: data.isAvailable ?? true,
      preparationTime: data.preparationTime,
      categoryId: data.categoryId,
      restaurantId,
      createdAt: now,
      updatedAt: now
    };
    this.menuItems.push(menuItem);
    if (data.ingredients) {
      for (const ingredient of data.ingredients) {
        this.menuItemIngredients.push({
          menuItemId: menuItem.id,
          stockItemId: ingredient.stockItemId,
          quantity: ingredient.quantity
        });
      }
    }
    return this.getMenuItem(restaurantId, menuItem.id);
  }

  updateMenuItem(restaurantId: string, id: string, data: MenuItemUpdateInput) {
    this.ensureRestaurant(restaurantId);
    const menuItem = this.findMenuItem(id);
    if (!menuItem || menuItem.restaurantId !== restaurantId) {
      return null;
    }
    if (data.name !== undefined) {
      menuItem.name = data.name;
    }
    if (data.description !== undefined) {
      menuItem.description = data.description ?? null;
    }
    if (data.price !== undefined) {
      menuItem.price = data.price;
    }
    if (data.image !== undefined) {
      menuItem.image = data.image ?? null;
    }
    if (data.isAvailable !== undefined) {
      menuItem.isAvailable = data.isAvailable;
    }
    if (data.preparationTime !== undefined) {
      menuItem.preparationTime = data.preparationTime;
    }
    if (data.categoryId !== undefined) {
      menuItem.categoryId = data.categoryId;
    }
    menuItem.updatedAt = new Date();
    if (data.ingredients) {
      this.menuItemIngredients = this.menuItemIngredients.filter(
        (ingredient) => ingredient.menuItemId !== id
      );
      for (const ingredient of data.ingredients) {
        this.menuItemIngredients.push({
          menuItemId: id,
          stockItemId: ingredient.stockItemId,
          quantity: ingredient.quantity
        });
      }
    }
    return this.getMenuItem(restaurantId, id);
  }

  deleteMenuItem(restaurantId: string, id: string) {
    this.ensureRestaurant(restaurantId);
    const index = this.menuItems.findIndex(
      (item) => item.id === id && item.restaurantId === restaurantId
    );
    if (index === -1) {
      return false;
    }
    this.menuItems.splice(index, 1);
    this.menuItemIngredients = this.menuItemIngredients.filter(
      (ingredient) => ingredient.menuItemId !== id
    );
    return true;
  }

  listStockItems(restaurantId: string, lowStock = false) {
    this.ensureRestaurant(restaurantId);
    const items = this.stockItems
      .filter((item) => item.restaurantId === restaurantId)
      .sort((a, b) => a.name.localeCompare(b.name))
      .map((item) => this.clone(item));
    if (lowStock) {
      return items.filter((item) => item.quantity < item.minQuantity);
    }
    return items;
  }

  getStockItem(restaurantId: string, id: string) {
    this.ensureRestaurant(restaurantId);
    const item = this.findStockItem(id);
    if (!item || item.restaurantId !== restaurantId) {
      return null;
    }
    return this.buildStockItem(item);
  }

  findStockItemsByIds(restaurantId: string, ids: Array<string>) {
    this.ensureRestaurant(restaurantId);
    return this.stockItems.filter(
      (item) => item.restaurantId === restaurantId && ids.includes(item.id)
    );
  }

  createStockItem(restaurantId: string, data: StockItemCreateInput) {
    this.ensureRestaurant(restaurantId);
    const now = new Date();
    const item: StockItem = {
      id: this.generateId(),
      name: data.name,
      unit: data.unit,
      quantity: data.quantity,
      minQuantity: data.minQuantity,
      cost: data.cost,
      isActive: data.isActive ?? true,
      restaurantId,
      createdAt: now,
      updatedAt: now
    };
    this.stockItems.push(item);
    return this.clone(item);
  }

  updateStockItem(restaurantId: string, id: string, data: StockItemUpdateInput) {
    this.ensureRestaurant(restaurantId);
    const item = this.findStockItem(id);
    if (!item || item.restaurantId !== restaurantId) {
      return null;
    }
    if (data.name !== undefined) {
      item.name = data.name;
    }
    if (data.unit !== undefined) {
      item.unit = data.unit;
    }
    if (data.quantity !== undefined) {
      item.quantity = data.quantity;
    }
    if (data.minQuantity !== undefined) {
      item.minQuantity = data.minQuantity;
    }
    if (data.cost !== undefined) {
      item.cost = data.cost;
    }
    if (data.isActive !== undefined) {
      item.isActive = data.isActive;
    }
    item.updatedAt = new Date();
    return this.clone(item);
  }

  adjustStockItem(restaurantId: string, id: string, quantity: number) {
    this.ensureRestaurant(restaurantId);
    const item = this.findStockItem(id);
    if (!item || item.restaurantId !== restaurantId) {
      return null;
    }
    item.quantity += quantity;
    item.updatedAt = new Date();
    return this.clone(item);
  }

  deleteStockItem(restaurantId: string, id: string) {
    this.ensureRestaurant(restaurantId);
    const index = this.stockItems.findIndex(
      (item) => item.id === id && item.restaurantId === restaurantId
    );
    if (index === -1) {
      return false;
    }
    this.stockItems.splice(index, 1);
    this.menuItemIngredients = this.menuItemIngredients.filter(
      (ingredient) => ingredient.stockItemId !== id
    );
    return true;
  }

  listTables(restaurantId: string, status?: TableStatus) {
    this.ensureRestaurant(restaurantId);
    return this.tables
      .filter((table) => {
        if (table.restaurantId !== restaurantId) {
          return false;
        }
        if (status && table.status !== status) {
          return false;
        }
        return true;
      })
      .sort((a, b) => a.number - b.number)
      .map((table) => ({
        ...this.clone(table),
        tabs: this.tabs
          .filter((tab) => tab.tableId === table.id && tab.status === "OPEN")
          .sort((a, b) => b.openedAt.getTime() - a.openedAt.getTime())
          .map((tab) => this.clone(tab))
      }));
  }

  getTable(restaurantId: string, id: string) {
    this.ensureRestaurant(restaurantId);
    const table = this.findTable(id);
    if (!table || table.restaurantId !== restaurantId) {
      return null;
    }
    return {
      ...this.clone(table),
      tabs: this.tabs
        .filter((tab) => tab.tableId === id && tab.status === "OPEN")
        .map((tab) => this.clone(tab))
    };
  }

  createTable(restaurantId: string, data: TableCreateInput) {
    this.ensureRestaurant(restaurantId);
    const now = new Date();
    const table: Table = {
      id: this.generateId(),
      number: data.number,
      capacity: data.capacity,
      status: "AVAILABLE",
      restaurantId,
      createdAt: now,
      updatedAt: now
    };
    this.tables.push(table);
    return this.clone(table);
  }

  updateTable(restaurantId: string, id: string, data: TableUpdateInput) {
    this.ensureRestaurant(restaurantId);
    const table = this.findTable(id);
    if (!table || table.restaurantId !== restaurantId) {
      return null;
    }
    if (data.number !== undefined) {
      table.number = data.number;
    }
    if (data.capacity !== undefined) {
      table.capacity = data.capacity;
    }
    if (data.status !== undefined) {
      table.status = data.status;
    }
    table.updatedAt = new Date();
    return this.clone(table);
  }

  deleteTable(restaurantId: string, id: string) {
    this.ensureRestaurant(restaurantId);
    const index = this.tables.findIndex(
      (table) => table.id === id && table.restaurantId === restaurantId
    );
    if (index === -1) {
      return false;
    }
    this.tables.splice(index, 1);
    return true;
  }

  countTables(restaurantId: string, status: TableStatus) {
    this.ensureRestaurant(restaurantId);
    return this.tables.filter(
      (table) => table.restaurantId === restaurantId && table.status === status
    ).length;
  }

  listWaiters(restaurantId: string) {
    this.ensureRestaurant(restaurantId);
    const todayStart = this.startOfDay(new Date());
    return this.waiters
      .filter((waiter) => waiter.restaurantId === restaurantId)
      .sort((a, b) => a.name.localeCompare(b.name))
      .map((waiter) => {
        const tabsToday = this.tabs.filter(
          (tab) => tab.waiterId === waiter.id && tab.openedAt >= todayStart
        );
        return {
          ...this.clone(waiter),
          tabs: tabsToday.map((tab) => ({ id: tab.id })),
          tabsToday: tabsToday.length
        };
      });
  }

  getWaiter(restaurantId: string, id: string) {
    this.ensureRestaurant(restaurantId);
    const waiter = this.findWaiter(id);
    if (!waiter || waiter.restaurantId !== restaurantId) {
      return null;
    }
    return this.clone(waiter);
  }

  createWaiter(restaurantId: string, data: WaiterCreateInput) {
    this.ensureRestaurant(restaurantId);
    const now = new Date();
    const waiter: Waiter = {
      id: this.generateId(),
      name: data.name,
      phone: data.phone ?? null,
      cpf: data.cpf ?? null,
      isActive: data.isActive ?? true,
      restaurantId,
      createdAt: now,
      updatedAt: now
    };
    this.waiters.push(waiter);
    return this.clone(waiter);
  }

  updateWaiter(restaurantId: string, id: string, data: WaiterUpdateInput) {
    this.ensureRestaurant(restaurantId);
    const waiter = this.findWaiter(id);
    if (!waiter || waiter.restaurantId !== restaurantId) {
      return null;
    }
    if (data.name !== undefined) {
      waiter.name = data.name;
    }
    if (data.phone !== undefined) {
      waiter.phone = data.phone ?? null;
    }
    if (data.cpf !== undefined) {
      waiter.cpf = data.cpf ?? null;
    }
    if (data.isActive !== undefined) {
      waiter.isActive = data.isActive;
    }
    waiter.updatedAt = new Date();
    return this.clone(waiter);
  }

  deactivateWaiter(restaurantId: string, id: string) {
    this.ensureRestaurant(restaurantId);
    const waiter = this.findWaiter(id);
    if (!waiter || waiter.restaurantId !== restaurantId) {
      return null;
    }
    waiter.isActive = false;
    waiter.updatedAt = new Date();
    return this.clone(waiter);
  }

  listTabs(restaurantId: string, filter: TabFilter = {}) {
    this.ensureRestaurant(restaurantId);
    const { status, waiterId, startDate, endDate, search } = filter;
    return this.tabs
      .filter((tab) => {
        if (tab.restaurantId !== restaurantId) {
          return false;
        }
        if (status && tab.status !== status) {
          return false;
        }
        if (waiterId && tab.waiterId !== waiterId) {
          return false;
        }
        if (search && !tab.code.toLowerCase().includes(search.toLowerCase())) {
          return false;
        }
        if (startDate || endDate) {
          const openedAt = tab.openedAt.getTime();
          if (startDate && openedAt < new Date(startDate).getTime()) {
            return false;
          }
          if (endDate && openedAt > new Date(endDate).getTime()) {
            return false;
          }
        }
        return true;
      })
      .sort((a, b) => b.openedAt.getTime() - a.openedAt.getTime())
      .map((tab) => this.buildTabWithRelations(tab));
  }

  getTabDetails(restaurantId: string, id: string) {
    this.ensureRestaurant(restaurantId);
    const tab = this.findTab(id);
    if (!tab || tab.restaurantId !== restaurantId) {
      return null;
    }
    return this.buildTabWithRelations(tab);
  }

  findLastTab(restaurantId: string) {
    this.ensureRestaurant(restaurantId);
    return this.tabs
      .filter((tab) => tab.restaurantId === restaurantId)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())[0];
  }

  createTab(restaurantId: string, tableId: string, waiterId: string) {
    this.ensureRestaurant(restaurantId);
    const now = new Date();
    const lastTab = this.findLastTab(restaurantId);
    const code = generateSequentialCode(lastTab?.code ?? null, "C");
    const tab: Tab = {
      id: this.generateId(),
      code,
      status: "OPEN",
      openedAt: now,
      closedAt: null,
      totalAmount: 0,
      paymentMethod: null,
      discount: 0,
      tableId,
      waiterId,
      restaurantId,
      createdAt: now,
      updatedAt: now
    };
    this.tabs.push(tab);
    const table = this.findTable(tableId);
    if (table) {
      table.status = "OCCUPIED";
      table.updatedAt = now;
    }
    return this.buildTabWithRelations(tab);
  }

  updateTab(restaurantId: string, id: string, data: { waiterId?: string; discount?: number; status?: TabStatus }) {
    this.ensureRestaurant(restaurantId);
    const tab = this.findTab(id);
    if (!tab || tab.restaurantId !== restaurantId) {
      return null;
    }
    if (data.waiterId !== undefined) {
      tab.waiterId = data.waiterId;
    }
    if (data.discount !== undefined) {
      tab.discount = data.discount;
    }
    if (data.status === "CANCELLED" && tab.status === "OPEN") {
      tab.status = "CANCELLED";
      tab.closedAt = new Date();
      tab.updatedAt = new Date();
      const table = this.findTable(tab.tableId);
      if (table) {
        table.status = "AVAILABLE";
        table.updatedAt = new Date();
      }
    } else {
      tab.updatedAt = new Date();
    }
    return this.clone(tab);
  }

  cancelTab(restaurantId: string, id: string) {
    this.ensureRestaurant(restaurantId);
    const tab = this.findTab(id);
    if (!tab || tab.restaurantId !== restaurantId) {
      return false;
    }
    if (tab.status !== "OPEN") {
      return false;
    }
    tab.status = "CANCELLED";
    tab.closedAt = new Date();
    tab.updatedAt = new Date();
    const table = this.findTable(tab.tableId);
    if (table) {
      table.status = "AVAILABLE";
      table.updatedAt = new Date();
    }
    return true;
  }

  closeTab(restaurantId: string, id: string, data: TabCloseInput) {
    this.ensureRestaurant(restaurantId);
    const tab = this.findTab(id);
    if (!tab || tab.restaurantId !== restaurantId) {
      return null;
    }
    if (tab.status !== "OPEN") {
      throw new Error("Comanda não pode ser fechada");
    }
    const orders = this.orders.filter((order) => order.tabId === id);
    const pending = orders.filter(
      (order) => order.status !== "DELIVERED" && order.status !== "CANCELLED"
    );
    if (pending.length > 0) {
      throw new Error("Existem pedidos pendentes");
    }
    const total = orders.reduce((acc, order) => {
      const itemsTotal = this.getOrderItems(order.id).reduce(
        (sum, item) => sum + item.totalPrice,
        0
      );
      return acc + itemsTotal;
    }, 0);
    let discountValue = data.discountValue ?? 0;
    if (data.discountType === "percentage") {
      discountValue = (total * discountValue) / 100;
    }
    const finalTotal = Math.max(total - discountValue, 0);
    tab.status = "CLOSED";
    tab.discount = discountValue;
    tab.totalAmount = finalTotal;
    tab.paymentMethod = data.paymentMethod;
    tab.closedAt = new Date();
    tab.updatedAt = new Date();
    const table = this.findTable(tab.tableId);
    if (table) {
      table.status = "AVAILABLE";
      table.updatedAt = new Date();
    }
    for (const order of orders) {
      if (order.status === "READY") {
        order.status = "DELIVERED";
        order.updatedAt = new Date();
      }
    }
    return this.buildTabWithRelations(tab);
  }

  listOrders(restaurantId: string, filter: OrderFilter = {}) {
    this.ensureRestaurant(restaurantId);
    const { status, tabId, startDate, endDate } = filter;
    return this.orders
      .filter((order) => {
        if (order.restaurantId !== restaurantId) {
          return false;
        }
        if (status && order.status !== status) {
          return false;
        }
        if (tabId && order.tabId !== tabId) {
          return false;
        }
        if (startDate && order.createdAt < new Date(startDate)) {
          return false;
        }
        if (endDate && order.createdAt > new Date(endDate)) {
          return false;
        }
        return true;
      })
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
      .map((order) => this.buildOrderWithRelations(order))
      .filter((order): order is NonNullable<typeof order> => order !== null);
  }

  getOrderDetails(restaurantId: string, id: string) {
    this.ensureRestaurant(restaurantId);
    const order = this.findOrder(id);
    if (!order || order.restaurantId !== restaurantId) {
      return null;
    }
    return this.buildOrderWithRelations(order);
  }

  createOrder(restaurantId: string, input: OrderCreateInput) {
    this.ensureRestaurant(restaurantId);
    const now = new Date();
    const itemsData = input.items;
    const menuItems = this.findMenuItemsByIds(
      restaurantId,
      itemsData.map((item) => item.menuItemId)
    );
    const orderTotal = itemsData.reduce((acc, item) => {
      const menuItem = menuItems.find((m) => m.id === item.menuItemId);
      if (!menuItem) {
        throw new Error("Item do cardápio inválido");
      }
      return acc + menuItem.price * item.quantity;
    }, 0);
    const order: Order = {
      id: this.generateId(),
      status: "PENDING",
      notes: input.notes ?? null,
      totalAmount: orderTotal,
      tabId: input.tabId,
      restaurantId,
      createdAt: now,
      updatedAt: now
    };
    this.orders.push(order);
    for (const item of itemsData) {
      const menuItem = menuItems.find((m) => m.id === item.menuItemId);
      if (!menuItem) {
        continue;
      }
      this.orderItems.push({
        id: this.generateId(),
        quantity: item.quantity,
        unitPrice: menuItem.price,
        totalPrice: menuItem.price * item.quantity,
        notes: item.notes ?? null,
        status: "PENDING",
        orderId: order.id,
        menuItemId: menuItem.id,
        createdAt: now,
        updatedAt: now
      });
    }
    this.recomputeTab(order.tabId);
    return this.buildOrderWithItems(order);
  }

  cancelOrder(restaurantId: string, id: string) {
    this.ensureRestaurant(restaurantId);
    const order = this.findOrder(id);
    if (!order || order.restaurantId !== restaurantId) {
      return false;
    }
    if (order.status === "DELIVERED") {
      return false;
    }
    const items = this.getOrderItems(id);
    if (items.some((item) => item.status === "DELIVERED")) {
      return false;
    }
    order.status = "CANCELLED";
    order.updatedAt = new Date();
    for (const item of items) {
      item.status = "CANCELLED";
      item.updatedAt = new Date();
    }
    this.recomputeTab(order.tabId);
    return true;
  }

  updateOrderStatus(restaurantId: string, id: string, input: OrderStatusInput) {
    this.ensureRestaurant(restaurantId);
    const order = this.findOrder(id);
    if (!order || order.restaurantId !== restaurantId) {
      return null;
    }
    if (input.itemId) {
      const orderItem = this.orderItems.find(
        (item) => item.id === input.itemId && item.orderId === order.id
      );
      if (!orderItem) {
        throw new Error("Item não encontrado");
      }
      if (input.status === "CANCELLED" && orderItem.status === "DELIVERED") {
        throw new Error("Item entregue não pode ser cancelado");
      }
      if (input.status === "DELIVERED" && orderItem.status !== "DELIVERED") {
        this.deductStockForItem(orderItem);
      }
      orderItem.status = input.status;
      orderItem.updatedAt = new Date();
    } else {
      if (input.status === "DELIVERED") {
        const items = this.getOrderItems(order.id);
        for (const item of items) {
          if (item.status !== "DELIVERED") {
            this.deductStockForItem(item);
          }
          item.status = "DELIVERED";
          item.updatedAt = new Date();
        }
      } else if (input.status === "CANCELLED") {
        const items = this.getOrderItems(order.id);
        if (items.some((item) => item.status === "DELIVERED")) {
          throw new Error("Pedido com itens entregues não pode ser cancelado");
        }
        for (const item of items) {
          item.status = "CANCELLED";
          item.updatedAt = new Date();
        }
      } else {
        const items = this.getOrderItems(order.id);
        for (const item of items) {
          if (item.status !== "CANCELLED") {
            item.status = input.status;
            item.updatedAt = new Date();
          }
        }
      }
      order.status = input.status;
      order.updatedAt = new Date();
    }
    this.recomputeOrder(order.id);
    this.recomputeTab(order.tabId);
    return this.buildOrderWithItems(order);
  }

  getDashboardMetrics(restaurantId: string): DashboardMetrics {
    this.ensureRestaurant(restaurantId);
    const now = new Date();
    const startDay = this.startOfDay(now);
    const endDay = this.endOfDay(now);
    const startWeek = this.startOfWeek(now);
    const startMonth = this.startOfMonth(now);
    const closedTabs = this.tabs.filter(
      (tab) => tab.restaurantId === restaurantId && tab.status === "CLOSED"
    );
    const sumByPeriod = (start: Date, end: Date) =>
      closedTabs.reduce((acc, tab) => {
        if (!tab.closedAt) {
          return acc;
        }
        if (tab.closedAt >= start && tab.closedAt <= end) {
          return acc + tab.totalAmount;
        }
        return acc;
      }, 0);
    const salesToday = sumByPeriod(startDay, endDay);
    const salesWeek = sumByPeriod(startWeek, endDay);
    const salesMonth = sumByPeriod(startMonth, endDay);
    const ordersCount = this.orders.filter((order) => order.restaurantId === restaurantId).length;
    const totalRevenue = closedTabs.reduce((acc, tab) => acc + tab.totalAmount, 0);
    const averageTicket = closedTabs.length > 0 ? totalRevenue / closedTabs.length : 0;
    const occupiedTables = this.countTables(restaurantId, "OCCUPIED");
    const salesChart = Array.from({ length: 7 }).map((_, index) => {
      const date = new Date(startDay);
      date.setDate(startDay.getDate() - (6 - index));
      const dayStart = this.startOfDay(date);
      const dayEnd = this.endOfDay(date);
      const value = sumByPeriod(dayStart, dayEnd);
      return {
        date: dayStart.toISOString().split("T")[0],
        value
      };
    });
    const validOrders = this.orders.filter(
      (order) => order.restaurantId === restaurantId && order.status !== "CANCELLED"
    );
    const orderItems = validOrders.flatMap((order) =>
      this.getOrderItems(order.id).filter((item) => item.status !== "CANCELLED")
    );
    const topProductsMap = new Map<
      string,
      { name: string; quantity: number; total: number }
    >();
    for (const item of orderItems) {
      const menuItem = this.findMenuItem(item.menuItemId);
      if (!menuItem) {
        continue;
      }
      const entry = topProductsMap.get(item.menuItemId) ?? {
        name: menuItem.name,
        quantity: 0,
        total: 0
      };
      entry.quantity += item.quantity;
      entry.total += item.totalPrice;
      topProductsMap.set(item.menuItemId, entry);
    }
    const topProducts = Array.from(topProductsMap.values())
      .sort((a, b) => b.quantity - a.quantity)
      .slice(0, 5);
    const topWaitersMap = new Map<string, { name: string; total: number }>();
    for (const tab of closedTabs) {
      const waiter = this.findWaiter(tab.waiterId);
      if (!waiter) {
        continue;
      }
      const entry = topWaitersMap.get(tab.waiterId) ?? {
        name: waiter.name,
        total: 0
      };
      entry.total += tab.totalAmount;
      topWaitersMap.set(tab.waiterId, entry);
    }
    const topWaiters = Array.from(topWaitersMap.values())
      .sort((a, b) => b.total - a.total)
      .slice(0, 3);
    const lowStockAlerts = this.stockItems
      .filter((item) => item.restaurantId === restaurantId && item.quantity < item.minQuantity)
      .map((item) => ({
        name: item.name,
        quantity: item.quantity,
        minQuantity: item.minQuantity
      }));
    const staleTabs = this.tabs
      .filter(
        (tab) =>
          tab.restaurantId === restaurantId &&
          tab.status === "OPEN" &&
          tab.openedAt < new Date(now.getTime() - 2 * 60 * 60 * 1000)
      )
      .map((tab) => {
        const table = this.findTable(tab.tableId);
        return {
          code: tab.code,
          tableNumber: table ? table.number : 0,
          openedAt: tab.openedAt
        };
      });
    return {
      salesToday,
      salesWeek,
      salesMonth,
      ordersCount,
      averageTicket,
      occupiedTables,
      salesChart,
      topProducts,
      topWaiters,
      lowStockAlerts,
      staleTabs
    };
  }

  getSalesReport(restaurantId: string, startDate?: Date, endDate?: Date): SalesReport {
    this.ensureRestaurant(restaurantId);
    const tabs = this.tabs
      .filter((tab) => {
        if (tab.restaurantId !== restaurantId || tab.status !== "CLOSED") {
          return false;
        }
        if (!tab.closedAt) {
          return false;
        }
        if (startDate && tab.closedAt < startDate) {
          return false;
        }
        if (endDate && tab.closedAt > endDate) {
          return false;
        }
        return true;
      })
      .sort((a, b) => (b.closedAt?.getTime() ?? 0) - (a.closedAt?.getTime() ?? 0));
    const totalRevenue = tabs.reduce((acc, tab) => acc + tab.totalAmount, 0);
    const orders = this.orders.filter(
      (order) => order.restaurantId === restaurantId && tabs.some((tab) => tab.id === order.tabId)
    );
    const totalOrders = orders.length;
    const averageTicket = tabs.length > 0 ? totalRevenue / tabs.length : 0;
    const totalsByPaymentMap = new Map<PaymentMethod, number>();
    for (const tab of tabs) {
      if (!tab.paymentMethod) {
        continue;
      }
      totalsByPaymentMap.set(
        tab.paymentMethod,
        (totalsByPaymentMap.get(tab.paymentMethod) ?? 0) + tab.totalAmount
      );
    }
    const dailyTotalsMap = new Map<string, number>();
    for (const tab of tabs) {
      if (!tab.closedAt) {
        continue;
      }
      const key = tab.closedAt.toISOString().split("T")[0];
      dailyTotalsMap.set(key, (dailyTotalsMap.get(key) ?? 0) + tab.totalAmount);
    }
    const details = tabs.map((tab) => {
      const table = this.findTable(tab.tableId);
      const waiter = this.findWaiter(tab.waiterId);
      return {
        tabCode: tab.code,
        tableNumber: table ? table.number : 0,
        waiterName: waiter ? waiter.name : "",
        totalAmount: tab.totalAmount,
        paymentMethod: tab.paymentMethod
      };
    });
    return {
      totalRevenue,
      totalOrders,
      averageTicket,
      totalsByPayment: Array.from(totalsByPaymentMap.entries()).map(([paymentMethod, total]) => ({
        paymentMethod,
        total
      })),
      dailyTotals: Array.from(dailyTotalsMap.entries())
        .map(([date, total]) => ({ date, total }))
        .sort((a, b) => (a.date > b.date ? 1 : -1)),
      details
    };
  }

  getProductsReport(
    restaurantId: string,
    startDate?: Date,
    endDate?: Date,
    categoryId?: string
  ): ProductsReport {
    this.ensureRestaurant(restaurantId);
    const orders = this.orders.filter((order) => {
      if (order.restaurantId !== restaurantId || order.status === "CANCELLED") {
        return false;
      }
      if (startDate && order.createdAt < startDate) {
        return false;
      }
      if (endDate && order.createdAt > endDate) {
        return false;
      }
      return true;
    });
    const map = new Map<
      string,
      { name: string; category: string; quantity: number; total: number }
    >();
    for (const order of orders) {
      const items = this.getOrderItems(order.id).filter((item) => item.status !== "CANCELLED");
      for (const item of items) {
        const menuItem = this.findMenuItem(item.menuItemId);
        if (!menuItem) {
          continue;
        }
        if (categoryId && menuItem.categoryId !== categoryId) {
          continue;
        }
        const category = this.findCategory(menuItem.categoryId);
        const entry = map.get(item.menuItemId) ?? {
          name: menuItem.name,
          category: category ? category.name : "",
          quantity: 0,
          total: 0
        };
        entry.quantity += item.quantity;
        entry.total += item.totalPrice;
        map.set(item.menuItemId, entry);
      }
    }
    const items = Array.from(map.values()).sort((a, b) => b.quantity - a.quantity);
    return { items };
  }

  getWaitersReport(restaurantId: string, startDate?: Date, endDate?: Date): WaitersReport {
    this.ensureRestaurant(restaurantId);
    const tabs = this.tabs.filter((tab) => {
      if (tab.restaurantId !== restaurantId || tab.status !== "CLOSED") {
        return false;
      }
      if (!tab.closedAt) {
        return false;
      }
      if (startDate && tab.closedAt < startDate) {
        return false;
      }
      if (endDate && tab.closedAt > endDate) {
        return false;
      }
      return true;
    });
    const map = new Map<
      string,
      { waiterName: string; tabsCount: number; total: number }
    >();
    for (const tab of tabs) {
      const waiter = this.findWaiter(tab.waiterId);
      if (!waiter) {
        continue;
      }
      const entry = map.get(tab.waiterId) ?? {
        waiterName: waiter.name,
        tabsCount: 0,
        total: 0
      };
      entry.tabsCount += 1;
      entry.total += tab.totalAmount;
      map.set(tab.waiterId, entry);
    }
    const items = Array.from(map.values()).map((entry) => ({
      waiterName: entry.waiterName,
      tabsCount: entry.tabsCount,
      total: entry.total,
      averageTicket: entry.tabsCount > 0 ? entry.total / entry.tabsCount : 0
    }));
    items.sort((a, b) => b.total - a.total);
    return { items };
  }
}

export const mockDb = new MockDatabase();
