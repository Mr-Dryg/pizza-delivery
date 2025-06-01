import { useState, useEffect, useCallback  } from 'react';
import { useCart } from '../hooks/useCart.js';
import '../styles/Cart.css';
import config from '../config.js';
import PizzaToppings from '../models/PizzaToppings.js';

export function Cart({ isCartOpen, setIsCartOpen, setIsOrderStarted, toppings }) {
  const { cart, removeFromCart, updateQuantity, totalNumber, totalPrice, clearCart } = useCart();
  const [localQuantities, setLocalQuantities] = useState({});

  // Инициализируем локальные количества при открытии корзины
  useEffect(() => {
    if (isCartOpen) {
      const initialQuantities = {};
      cart.forEach(item => {
        initialQuantities[item] = item.quantity;
      });
      setLocalQuantities(initialQuantities);
    }
  }, [isCartOpen, cart]);

  // Дебаунс для обновления количества
  const debouncedUpdateQuantity = useCallback(
    debounce((pizza, quantity) => {
      updateQuantity(pizza, quantity);
    }, 300),
    [updateQuantity]
  );

  const handleQuantityChange = (pizza, newQuantity) => {
    // Сначала обновляем локальное состояние
    setLocalQuantities(prev => ({
      ...prev,
      [pizza]: newQuantity
    }));
    // Затем запускаем дебаунсированное обновление
    debouncedUpdateQuantity(pizza, newQuantity);
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
  <div className="cart-content" onClick={(e) => e.stopPropagation()}>
    <button className="cart-close-button" onClick={() => setIsCartOpen(false)}>×</button>
    
    <div className="cart-header">
      <h2>Корзина</h2>
      <button className="clear-cart-button" onClick={clearCart}>Очистить корзину</button>
    </div>

    <div className="cart-body">
      <div className="cart-summary">
        <p>{totalNumber} {totalNumber === 1 ? 'товар' : totalNumber < 5 ? 'товара' : 'товаров'} на сумму {totalPrice} ₽</p>
      </div>
      
      <ul className="cart-list">
        {cart.map(item => {
          const toppingsManager = new PizzaToppings(toppings);
          toppingsManager.bitToppings = item.toppings;
          const selectedToppings = toppingsManager.getToppings(true);
          const totalPrice = (item.quantity || 1) * item.cost;

          return (
            <li key={`${item.pizza_id}-${item.size}-${item.toppings}`} className="cart-item">
              <img 
                src={`${config.API_URL}/${item.image}`}
                alt={item.name}
                className="cart-item-image"
              />
              
              <div className="cart-item-details">
                <div className="cart-item-info">
                  <h3 className="cart-item-name">{item.name}</h3>
                  <span className="cart-item-size">
                    {item.size === 'small' ? 'Маленькая' : 
                    item.size === 'medium' ? 'Средняя' : 'Большая'}
                  </span>
                </div>
                
                {selectedToppings.length > 0 && (
                  <p className="cart-item-toppings">
                    Добавки: {selectedToppings.map(t => t.name).join(', ')}
                  </p>
                )}
              </div>
              
              <div className="cart-item-controls">
                <input
                  className="cart-item-quantity"
                  type="number"
                  defaultValue={item.quantity}
                  onBlur={(e) => handleQuantityChange(item, +e.target.value)}
                  min="1"
                />
                <span>× {item.cost} ₽</span>
                <span className="cart-item-price">= {totalPrice} ₽</span>
                <button 
                  onClick={() => removeFromCart(item)}
                  className="remove-button"
                >
                  ×
                </button>
              </div>
            </li>
          );
        })}
      </ul>
    </div>

    <div className='cart-footer'>
      <div className="cart-total">
        <span>Итого:</span>
        <span className="total-price">{totalPrice} ₽</span>
      </div>
      <button
        className='to-order-button'
        onClick={() => totalNumber && setIsOrderStarted(true)}
        disabled={!totalNumber}
      >
        Оформить заказ
      </button>
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
