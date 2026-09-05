import { create } from "zustand";

export type QuoteProduct = {
  productId: string;
  name: string;
  price: number | null;
  imageUrl: string | null;
};

interface QuoteState {
  open: boolean;
  product: QuoteProduct | null;
  quantity: number;
  openQuote: (product: QuoteProduct, quantity?: number) => void;
  setQuantity: (quantity: number) => void;
  close: () => void;
}

export const useQuoteStore = create<QuoteState>((set) => ({
  open: false,
  product: null,
  quantity: 1,

  openQuote: (product, quantity = 1) =>
    set({ open: true, product, quantity: Math.max(1, quantity) }),

  setQuantity: (quantity) =>
    set({ quantity: Math.max(1, quantity) }),

  close: () => set({ open: false, product: null, quantity: 1 }),
}));
