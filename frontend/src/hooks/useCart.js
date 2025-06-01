import { useSelector, useDispatch } from 'react-redux';
import { addToCart, removeFromCart, updateQuantity, clearCart } from '../store/slices/cartSlice.js';

export function useCart() {
  const { cart, totalNumber, totalPrice } = useSelector((state) => state.cart);
  const dispatch = useDispatch();

  return {
    cart,
    totalPrice,
    totalNumber,
    addToCart: (product) => dispatch(addToCart(product)),
    removeFromCart: (product) => dispatch(removeFromCart(product)),
    updateQuantity: (product, newQuantity) => 
      dispatch(updateQuantity({ product, newQuantity })),
    clearCart: () => dispatch(clearCart()),
  };
}