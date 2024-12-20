import { create } from "zustand";

interface CartState {
  cartItems: string[];
  isCartOpen: boolean;
  addToCart: (id: string) => void;
  removeFromCart: (id: string) => void;
  clearCart: () => void;
  initializeCart: (items: string[]) => void;
  setCartOpen: (open: boolean) => void; 
}

const useCartStore = create<CartState>((set) => ({
  cartItems: [],
  isCartOpen: false,
  addToCart: (id) =>
    set((state) => {
      if (!state.cartItems.includes(id)) {
        const newCartItems = [...state.cartItems, id];
        localStorage.setItem("cartItems", JSON.stringify(newCartItems));
        return { cartItems: newCartItems };
      }
      return state;
    }),
  removeFromCart: (id) =>
    set((state) => {
      const newCartItems = state.cartItems.filter((itemId) => itemId !== id);
      localStorage.setItem("cartItems", JSON.stringify(newCartItems));
      return { cartItems: newCartItems };
    }),
  clearCart: () => {
    localStorage.removeItem("cartItems");
    set({ cartItems: [] });
  },
  initializeCart: (items) => set({ cartItems: items }),
  setCartOpen: (open) => set({ isCartOpen: open }),
}));

export default useCartStore;