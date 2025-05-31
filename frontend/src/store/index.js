import { configureStore } from '@reduxjs/toolkit';
import cartReducer, { cartMiddleware } from './slices/cartSlice.js';

export const store = configureStore({
  reducer: {
    cart: cartReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(cartMiddleware),
});

// Синхронизация между вкладками
window.addEventListener('storage', (e) => {
  if (e.key === 'cart') {
    store.dispatch({ type: 'cart/replaceCart', payload: JSON.parse(e.newValue) });
  }
});