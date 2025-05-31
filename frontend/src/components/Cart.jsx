import { useState, useEffect, useCallback  } from 'react';
import { useCart } from '../hooks/useCart.js';
import '../styles/Cart.css';
import config from '../config.js';

export function Cart({ isCartOpen, setIsCartOpen, setIsOrderStarted }) {
  const { cart, removeFromCart, updateQuantity, totalNumber, totalPrice, clearCart } = useCart();
  const [localQuantities, setLocalQuantities] = useState({});

  // Инициализируем локальные количества при открытии корзины
  useEffect(() => {
    if (isCartOpen) {
      const initialQuantities = {};
      cart.forEach(item => {
        initialQuantities[item.pizza_id] = item.quantity;
      });
      setLocalQuantities(initialQuantities);
    }
  }, [isCartOpen, cart]);

  // Дебаунс для обновления количества
  const debouncedUpdateQuantity = useCallback(
    debounce((pizza_id, quantity) => {
      updateQuantity(pizza_id, quantity);
    }, 300),
    [updateQuantity]
  );

  const handleQuantityChange = (pizza_id, newQuantity) => {
    // Сначала обновляем локальное состояние
    setLocalQuantities(prev => ({
      ...prev,
      [pizza_id]: newQuantity
    }));
    
    // Затем запускаем дебаунсированное обновление
    debouncedUpdateQuantity(pizza_id, newQuantity);
  };

  useEffect(() => {
    if (isCartOpen) {
      const scrollY = window.scrollY;
      document.body.classList.add("body-no-scroll");
      document.body.style.top = `-${scrollY}px`;

      return () => {
        document.body.classList.remove("body-no-scroll");
        window.scrollTo(0, parseInt(document.body.style.top || "0") * -1);
        document.body.style.top = "";
      };
    }
  }, [isCartOpen]);

  if (!isCartOpen) {
    return null;
  }

  return (
    <div className='cart-overlay' onClick={() => setIsCartOpen(false)}>
      <button className="cart-close-button">×</button>
      <div className="cart-content" onClick={(e) => e.stopPropagation()}>
        <button onClick={clearCart}>Очистить корзину</button>
        <div className="cart-body">
          <h1>{totalNumber} товаров за {totalPrice} ₽</h1>
          <ul className="cart">
            {cart.map(item => (
              <li key={item.pizza_id}>
                <h2 className='flex-header'>
                  <img 
                    src={`${config.API_URL}${item.image}`}
                    alt={item.name}
                  />
                  {item.name} ({item.cost} ₽)
                  <input
                    className='quantity-input'
                    type="number"
                    defaultValue={item.quantity || localQuantities[item.pizza_id]}
                    onBlur={(e) => handleQuantityChange(item.pizza_id, +e.target.value)}
                    min="1"
                  />
                </h2>
                <button onClick={() => removeFromCart(item.pizza_id)}>
                  Удалить
                </button>
              </li>
            ))}
          </ul>
        </div>
        <div className='cart-footer'>
          <p>{totalPrice} ₽</p>
          <button
            className='to-order-button'
            onClick={() => totalNumber && setIsOrderStarted(true)}
          >Заказать</button>
        </div>
      </div>
    </div>
  );
}

// Вспомогательная функция дебаунса
function debounce(func, delay) {
  let timeoutId;
  return function(...args) {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => {
      func.apply(this, args);
    }, delay);
  };
}

export function CartButton({ setIsCartOpen }) {
  const { totalNumber, totalPrice } = useCart();

  return (
    <button
      className="cart-button"
      onClick={() => setIsCartOpen(true)}
      aria-label="Открыть корзину"
    >
      <h2>Корзина | {totalNumber}</h2>
      <p>{totalPrice} ₽</p>
    </button>
  );
}
