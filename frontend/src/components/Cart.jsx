import { useState, useEffect, useCallback  } from 'react';
import { useCart } from '../hooks/useCart.js';
import '../styles/Cart.css';

export function Cart({ isCartOpen, setIsCartOpen }) {
  const { cart, removeFromCart, updateQuantity, totalNumber, totalPrice } = useCart();
  const [localQuantities, setLocalQuantities] = useState({});

  // Инициализируем локальные количества при открытии корзины
  useEffect(() => {
    if (isCartOpen) {
      const initialQuantities = {};
      cart.forEach(item => {
        initialQuantities[item.id] = item.quantity;
      });
      setLocalQuantities(initialQuantities);
    }
  }, [isCartOpen, cart]);

  // Дебаунс для обновления количества
  const debouncedUpdateQuantity = useCallback(
    debounce((id, quantity) => {
      updateQuantity(id, quantity);
    }, 300),
    [updateQuantity]
  );

  const handleQuantityChange = (id, newQuantity) => {
    // Сначала обновляем локальное состояние
    setLocalQuantities(prev => ({
      ...prev,
      [id]: newQuantity
    }));
    
    // Затем запускаем дебаунсированное обновление
    debouncedUpdateQuantity(id, newQuantity);
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
        <div className="cart-body">
          <h1>{totalNumber} товаров за {totalPrice} ₽</h1>
          <ul className="cart">
            {cart.map(item => (
              <li key={item.id}>
                <h2 className='flex-header'>
                  <img 
                    src={`http://localhost:8000${item.image_url}`}
                    alt={item.name}
                  />
                  {item.name} ({item.price} ₽)
                  <input
                    className='quantity-input'
                    type="number"
                    defaultValue={localQuantities[item.id] || item.quantity}
                    onBlur={(e) => handleQuantityChange(item.id, +e.target.value)}
                    min="1"
                  />
                </h2>
                <button onClick={() => removeFromCart(item.id)}>
                  Удалить
                </button>
              </li>
            ))}
          </ul>
        </div>
        <div className='cart-footer'>
          <p>{totalPrice} ₽</p>
          <button className='to-order-button'>Заказать</button>
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
  // Вариант 1: Используем кастомный хук useCart (рекомендуется)
  const { totalNumber, totalPrice } = useCart();

  // Или Вариант 2: Берём данные напрямую из Redux
  // const { totalNumber, totalPrice } = useSelector((state) => state.cart);

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
