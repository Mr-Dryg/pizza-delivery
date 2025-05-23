import { createSlice } from '@reduxjs/toolkit';

// Загрузка из localStorage
const loadCartWithTotals = () => {
  const savedCart = localStorage.getItem('cart');
  if (!savedCart) return { cart: [], totalNumber: 0, totalPrice: 0 };

  const cart = JSON.parse(savedCart);
  return {
    cart,
    totalNumber: cart.reduce((sum, item) => sum + item.quantity, 0),
    totalPrice: cart.reduce((sum, item) => sum + item.price * item.quantity, 0),
  };
};

const initialState = loadCartWithTotals();

const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    // Добавление товара
    addToCart: (state, action) => {
      const product = action.payload;
      const existingItem = state.cart.find(item => item.id === product.id);

      if (existingItem) {
        existingItem.quantity += 1;
      } else {
        state.cart.push({ ...product, quantity: 1 });
      }

      // Обновляем totals
      updateTotals(state);
    },

    // Удаление товара
    removeFromCart: (state, action) => {
      const productId = action.payload;
      state.cart = state.cart.filter(item => item.id !== productId);
      updateTotals(state);
    },

    // Изменение количества
    updateQuantity: (state, action) => {
      const { productId, newQuantity } = action.payload;
      const item = state.cart.find(item => item.id === productId);

      if (item) {
        if (newQuantity < 1) {
          state.cart = state.cart.filter(item => item.id !== productId);
        } else {
          item.quantity = newQuantity;
        }
      }

      updateTotals(state);
    },

    // Очистка корзины
    clearCart: (state) => {
      state.cart = [];
      state.totalNumber = 0;
      state.totalPrice = 0;
    },
  },
});

// Функция для обновления totalNumber и totalPrice
const updateTotals = (state) => {
  state.totalNumber = state.cart.reduce((sum, item) => sum + item.quantity, 0);
  state.totalPrice = state.cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
};

// Middleware для сохранения в localStorage
export const cartMiddleware = (store) => (next) => (action) => {
  const result = next(action);
  if (action.type?.startsWith('cart/')) {
    const { cart } = store.getState().cart;
    localStorage.setItem('cart', JSON.stringify(cart));
  }
  return result;
};

export const { addToCart, removeFromCart, updateQuantity, clearCart } = cartSlice.actions;
export default cartSlice.reducer;