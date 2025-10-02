import { SUBSCRIPTION_PLANS } from "@/constants/Items";
import { create } from "zustand";

interface CartState {
  oneTimeItems: string[];
  subscriptionItems: string[];
  isCartOpen: boolean;
  addToCart: (id: string, isSubscription?: boolean) => void;
  removeFromCart: (id: string, isSubscription?: boolean) => void;
  clearCart: () => void;
  initializeCart: (oneTimeItems: string[], subscriptionItems: string[]) => void;
  setCartOpen: (open: boolean) => void;
  getCartItems: () => { oneTimeItems: string[]; subscriptionItems: string[] };
}

const useCartStore = create<CartState>((set, get) => ({
  oneTimeItems: [],
  subscriptionItems: [],
  isCartOpen: false,
  addToCart: (id, isSubscription = false) =>
    set((state) => {
      if (isSubscription) {
        // Check if we're adding a different type of subscription
        const existingSubscription = state.subscriptionItems[0];
        if (existingSubscription) {
          // Get the interval of the existing subscription
          const existingPlan = SUBSCRIPTION_PLANS.find(plan => plan.id === existingSubscription);
          const newPlan = SUBSCRIPTION_PLANS.find(plan => plan.id === id);
          
          // If they're different types (monthly vs yearly), replace the existing one
          if (existingPlan && newPlan && existingPlan.interval !== newPlan.interval) {
            const newSubscriptionItems = [id];
            localStorage.setItem("subscriptionItems", JSON.stringify(newSubscriptionItems));
            return { subscriptionItems: newSubscriptionItems };
          }
          // If they're the same type, don't add duplicates
          if (!state.subscriptionItems.includes(id)) {
            const newSubscriptionItems = [...state.subscriptionItems, id];
            localStorage.setItem("subscriptionItems", JSON.stringify(newSubscriptionItems));
            return { subscriptionItems: newSubscriptionItems };
          }
        } else {
          // No existing subscription, add the new one
          const newSubscriptionItems = [id];
          localStorage.setItem("subscriptionItems", JSON.stringify(newSubscriptionItems));
          return { subscriptionItems: newSubscriptionItems };
        }
      } else {
        if (!state.oneTimeItems.includes(id)) {
          const newOneTimeItems = [...state.oneTimeItems, id];
          localStorage.setItem("oneTimeItems", JSON.stringify(newOneTimeItems));
          return { oneTimeItems: newOneTimeItems };
        }
      }
      return state;
    }),
  removeFromCart: (id, isSubscription = false) =>
    set((state) => {
      if (isSubscription) {
        const newSubscriptionItems = state.subscriptionItems.filter((itemId) => itemId !== id);
        localStorage.setItem("subscriptionItems", JSON.stringify(newSubscriptionItems));
        return { subscriptionItems: newSubscriptionItems };
      } else {
        const newOneTimeItems = state.oneTimeItems.filter((itemId) => itemId !== id);
        localStorage.setItem("oneTimeItems", JSON.stringify(newOneTimeItems));
        return { oneTimeItems: newOneTimeItems };
      }
    }),
  clearCart: () => {
    localStorage.removeItem("oneTimeItems");
    localStorage.removeItem("subscriptionItems");
    set({ oneTimeItems: [], subscriptionItems: [] });
  },
  initializeCart: (oneTimeItems, subscriptionItems) => 
    set({ oneTimeItems, subscriptionItems }),
  setCartOpen: (open) => set({ isCartOpen: open }),
  getCartItems: () => {
    return {
      oneTimeItems: get().oneTimeItems,
      subscriptionItems: get().subscriptionItems
    };
  },
}));

export default useCartStore;