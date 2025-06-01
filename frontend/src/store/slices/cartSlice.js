import { createSlice } from '@reduxjs/toolkit';

// Загрузка из localStorage
const loadCartWithTotals = () => {
  const savedCart = localStorage.getItem('cart');
  if (!savedCart) return { cart: [], totalNumber: 0, totalPrice: 0 };

  const cart = JSON.parse(savedCart);
  return {
    cart,
    totalNumber: cart.reduce((sum, item) => sum + item.quantity, 0),
    totalPrice: cart.reduce((sum, item) => sum + item.cost * item.quantity, 0),
  };
};

const initialState = loadCartWithTotals();

function equal_pizzas({ item, product }) {
  console.log('item: ', item);
  console.log('product: ', product);
  return (
    item.pizza_id === product.pizza_id &&
    item.toppings === product.toppings &&
    item.size === product.size
  );
}

const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    // Добавление товара
    addToCart: (state, action) => {
      const product = action.payload;
      const existingItem = state.cart.find(item => equal_pizzas({ item, product }));

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
      const product = action.payload;
      state.cart = state.cart.filter(item => ! equal_pizzas({ item, product }));
      updateTotals(state);
    },

    // Изменение количества
    updateQuantity: (state, action) => {
      const { product, newQuantity } = action.payload;
      const item = state.cart.find(item => equal_pizzas({ item, product }));

      if (item) {
        if (newQuantity < 1) {
          state.cart = state.cart.filter(item => ! equal_pizzas({ item, product }));
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
  state.totalPrice = state.cart.reduce((sum, item) => sum + item.cost * item.quantity, 0);
};

// cartMiddleware для сохранения в localStorage
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