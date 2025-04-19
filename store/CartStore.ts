import { create } from 'zustand';
import toast from 'react-hot-toast';

export interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
}

interface CartStore {
  items: CartItem[];
  addItem: (item: Omit<CartItem, 'quantity'>) => void;
  removeItem: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  clearCart: () => void;
  total: number;
}

export const useCartStore = create<CartStore>((set, get) => ({
  items: [],
  
  addItem: (item) => {
    set((state) => {
      const existingItem = state.items.find((i) => i.id === item.id);
      if (existingItem) {
        toast.success(`Added another ${item.name} to cart`);
        return {
          items: state.items.map((i) =>
            i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i
          ),
        };
      }
      toast.success(`${item.name} added to cart`);
      return { items: [...state.items, { ...item, quantity: 1 }] };
    });
  },
  
  removeItem: (id) => {
    set((state) => ({
      items: state.items.filter((item) => item.id !== id),
    }));
    toast.success('Item removed from cart');
  },
  
  updateQuantity: (id, quantity) => {
    set((state) => ({
      items: quantity === 0 
        ? state.items.filter(item => item.id !== id)
        : state.items.map((item) =>
            item.id === id ? { ...item, quantity } : item
          ),
    }));
  },
  
  clearCart: () => {
    set({ items: [] });
    toast.success('Cart cleared');
  },
  
  get total() {
    const items = get().items;
    return items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  },
}));