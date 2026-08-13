import { create } from "zustand";
import type { CartItem } from "@/store/useCartStore";

interface CheckoutState {
  open: boolean;
  directItems: CartItem[] | null;
  openCart: () => void;
  openCheckout: (items: CartItem[]) => void;
  close: () => void;
  updateDirectItemQuantity: (productId: string, quantity: number) => void;
  removeDirectItem: (productId: string) => void;
}

export const useCheckoutStore = create<CheckoutState>((set) => ({
  open: false,
  directItems: null,

  openCart: () => set({ open: true, directItems: null }),

  openCheckout: (items) => set({ open: true, directItems: items }),

  updateDirectItemQuantity: (productId, quantity) => {
    set((state) => {
      const directItems = state.directItems ?? [];
      const updated = directItems
        .map((i) =>
          i.productId === productId ? { ...i, quantity } : i
        )
        .filter((i) => i.quantity > 0);

      if (updated.length === 0) {
        return { open: false, directItems: null };
      }
      return { directItems: updated };
    });
  },

  removeDirectItem: (productId) => {
    set((state) => {
      const directItems = state.directItems ?? [];
      const updated = directItems.filter((i) => i.productId !== productId);

      if (updated.length === 0) {
        return { open: false, directItems: null };
      }
      return { directItems: updated };
    });
  },

  close: () => set({ open: false, directItems: null }),
}));