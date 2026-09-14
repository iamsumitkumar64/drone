const BACKEND_URL =
  process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8090';

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  count?: number;
}

export interface Product {
  uuid: string;
  title: string;
  url: string;
  retailer: string;
  category: string;
  stockStatus: 'IN_STOCK' | 'OUT_OF_STOCK' | 'PRE_ORDER' | 'UNKNOWN';
  currentPrice: number;
  currency: string;
  specs: Record<string, any>;
  description?: string;
  imageUrl?: string;
  lastCheckedAt?: string;
  updated_at: string;
}

export interface WatchlistItem {
  uuid: string;
  userId: string;
  productUuid: string;
  notifyTelegram: boolean;
  notifyWeb: boolean;
  targetPrice?: number;
  created_at: string;
  product?: Product;
}

export interface AlertLog {
  uuid: string;
  productUuid: string;
  channel: string;
  recipient: string;
  oldStatus?: string;
  newStatus: string;
  oldPrice?: number;
  newPrice?: number;
  message: string;
  sentAt: string;
}

export interface StockHistoryItem {
  uuid: string;
  productUuid: string;
  oldStatus?: string;
  newStatus: string;
  oldPrice?: number;
  newPrice?: number;
  changeReason?: string;
  created_at: string;
}

export const ApiService = {
  async getProducts(params?: {
    search?: string;
    retailer?: string;
    category?: string;
    stockStatus?: string;
    minPrice?: number;
    maxPrice?: number;
    page?: number;
    limit?: number;
  }): Promise<PaginatedResponse<Product>> {
    const query = new URLSearchParams();
    if (params?.search) query.append('search', params.search);
    if (params?.retailer && params.retailer !== 'all')
      query.append('retailer', params.retailer);
    if (params?.category && params.category !== 'all')
      query.append('category', params.category);
    if (params?.stockStatus && params.stockStatus !== 'all')
      query.append('stockStatus', params.stockStatus);
    if (params?.minPrice !== undefined)
      query.append('minPrice', String(params.minPrice));
    if (params?.maxPrice !== undefined)
      query.append('maxPrice', String(params.maxPrice));
    if (params?.page !== undefined)
      query.append('page', String(params.page));
    if (params?.limit !== undefined)
      query.append('limit', String(params.limit));

    const res = await fetch(`${BACKEND_URL}/product?${query.toString()}`);
    if (!res.ok) throw new Error(`HTTP error ${res.status}`);
    const json = await res.json();
    return {
      data: json.data || [],
      total: json.total ?? (json.data ? json.data.length : 0),
      page: json.page ?? 1,
      limit: json.limit ?? (params?.limit || 12),
      totalPages: json.totalPages ?? 1,
    };
  },

  async addProduct(url: string, category?: string): Promise<Product> {
    const res = await fetch(`${BACKEND_URL}/product`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url, category }),
    });
    if (!res.ok) throw new Error(`HTTP error ${res.status}`);
    const json = await res.json();
    return json.data;
  },

  async getWatchlist(page: number = 1, limit: number = 10): Promise<PaginatedResponse<WatchlistItem>> {
    const query = new URLSearchParams({
      page: String(page),
      limit: String(limit),
    });
    const res = await fetch(`${BACKEND_URL}/watchlist?${query.toString()}`);
    if (!res.ok) throw new Error(`HTTP error ${res.status}`);
    const json = await res.json();
    return {
      data: json.data || [],
      total: json.total ?? (json.data ? json.data.length : 0),
      page: json.page ?? 1,
      limit: json.limit ?? limit,
      totalPages: json.totalPages ?? 1,
    };
  },

  async addToWatchlist(productUuid: string): Promise<any> {
    const res = await fetch(`${BACKEND_URL}/watchlist`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ productUuid }),
    });
    if (!res.ok) throw new Error(`HTTP error ${res.status}`);
    return await res.json();
  },

  async removeFromWatchlist(productUuid: string): Promise<any> {
    const res = await fetch(`${BACKEND_URL}/watchlist/${productUuid}`, {
      method: 'DELETE',
    });
    if (!res.ok) throw new Error(`HTTP error ${res.status}`);
    return await res.json();
  },

  async runMonitoringNow(): Promise<any> {
    const res = await fetch(`${BACKEND_URL}/monitoring/run`, {
      method: 'POST',
    });
    if (!res.ok) throw new Error(`HTTP error ${res.status}`);
    return await res.json();
  },

  async simulateStatusChange(
    productUuid: string,
    targetStatus: string = 'IN_STOCK',
    targetPrice?: number,
  ): Promise<any> {
    const res = await fetch(`${BACKEND_URL}/monitoring/simulate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ productUuid, targetStatus, targetPrice }),
    });
    if (!res.ok) throw new Error(`HTTP error ${res.status}`);
    return await res.json();
  },

  async getAlerts(page: number = 1, limit: number = 10): Promise<PaginatedResponse<AlertLog>> {
    const query = new URLSearchParams({
      page: String(page),
      limit: String(limit),
    });
    const res = await fetch(`${BACKEND_URL}/monitoring/alerts?${query.toString()}`);
    if (!res.ok) throw new Error(`HTTP error ${res.status}`);
    const json = await res.json();
    return {
      data: json.data || [],
      total: json.total ?? (json.data ? json.data.length : 0),
      page: json.page ?? 1,
      limit: json.limit ?? limit,
      totalPages: json.totalPages ?? 1,
    };
  },

  async getHistory(page: number = 1, limit: number = 10): Promise<PaginatedResponse<StockHistoryItem>> {
    const query = new URLSearchParams({
      page: String(page),
      limit: String(limit),
    });
    const res = await fetch(`${BACKEND_URL}/monitoring/history?${query.toString()}`);
    if (!res.ok) throw new Error(`HTTP error ${res.status}`);
    const json = await res.json();
    return {
      data: json.data || [],
      total: json.total ?? (json.data ? json.data.length : 0),
      page: json.page ?? 1,
      limit: json.limit ?? limit,
      totalPages: json.totalPages ?? 1,
    };
  },

  async sendChatMessage(message: string): Promise<any> {
    const res = await fetch(`${BACKEND_URL}/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message }),
    });
    if (!res.ok) throw new Error(`HTTP error ${res.status}`);
    const json = await res.json();
    return json.data;
  },
};
