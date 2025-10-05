export interface CartItemResponse {
  id: number;
  itemId: number;
  quantity: number;
  note?: string | null;
  item: {
    id: number;
    name: string;
    desc?: string | null;
    price: number;
    image?: string | null;
    categoryId?: number | null;
  };
  createdAt: string;
  updatedAt: string;
}

export interface CartListResponse {
  items: CartItemResponse[];
  totals: {
    count: number; // total lines
    qty: number; // sum of quantities
    amount: number; // sum of quantity * item.price
  };
}
