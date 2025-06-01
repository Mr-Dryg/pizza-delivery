import '../styles/Pizza.css';
import '../styles/Modal.css';
import { useState, useEffect } from 'react';
import { useCart } from '../hooks/useCart';
import config from '../config.js';
import PizzaToppings from '../models/PizzaToppings';

export function PizzaCard({ pizza, pizzaIndex, setIndexPizzaOpen }) {
  return (
    <button className="pizza-card" onClick={() => {console.log(`Открыта ${pizzaIndex}`); setIndexPizzaOpen(pizzaIndex)}}>
      <img 
        src={`${config.API_URL}/${pizza.image}`}
        alt={pizza.name}
      />
      <h3>{pizza.name}</h3>
      <p>{pizza.cost} ₽</p>
    </button>
  );
}

function PizzaSizeSelector({ pizza, sizes, onUpdate }) {
  return (
    <div className="size-selector">
      <h3>Размер пиццы:</h3>
      {Object.entries(sizes).map(([sizeKey, [diameter, multiplier]]) => (
        <label key={sizeKey} className="size-option">
          <input
            type="radio"
            name="size"
            value={sizeKey}
            checked={pizza.size === sizeKey}
            onChange={(e) => onUpdate(e.target.value)}
          />
          <span className="size-label">
            {sizeKey === 'small' && 'Маленькая'}
            {sizeKey === 'medium' && 'Средняя'}
            {sizeKey === 'large' && 'Большая'}
            ({diameter} см) - {Math.round(pizza.def_cost * multiplier)} ₽
          </span>
        </label>
      ))}
    </div>
  );
}

function ToppingsSelector({ all_toppings, onUpdate }) {
  const [toppingsManager] = useState(() => new PizzaToppings(all_toppings));

  const handleToppingChange = (toppingId, isChecked) => {
    if (isChecked) {
      toppingsManager.addToppings([toppingId]);
    } else {
      toppingsManager.removeToppings([toppingId]);
    }

    onUpdate({
      bitmask: toppingsManager.bitToppings,
      list: toppingsManager.getToppings()
    });
  };

  return (
    <div className="toppings-selector">
      <h3 className="toppings-title">Дополнительные ингредиенты:</h3>
      <div className="toppings-scroll-container">
        <div className="toppings-list">
          {Object.entries(all_toppings).map(([id, [name, price]]) => (
            <label key={id} className="topping-item">
              <input
                type="checkbox"
                checked={toppingsManager.hasTopping(Number(id))}
                onChange={(e) => handleToppingChange(Number(id), e.target.checked)}
              />
              <span className="topping-name">{name}</span>
              <span className="topping-price">
                {price > 0 ? `+${price} ₽` : 'Бесплатно'}
              </span>
            </label>
          ))}
        </div>
      </div>
    </div>
  );
}

export function PizzaModal({ pizza, toppings, sizes, setIndexPizzaOpen }) {
  const { addToCart } = useCart();
  const [currentPizza, setCurrentPizza] = useState(() => ({
    ...pizza,
    size: 'medium',
    toppings: 0,
    cost: pizza.def_cost * sizes.medium[1]
  }));
  const [selectedToppings, setSelectedToppings] = useState([]);

  // Функция для полного пересчета цены
  const recalculatePrice = (size, toppingsList) => {
    const basePrice = pizza.def_cost * sizes[size][1];
    const toppingsPrice = toppingsList.reduce((sum, { price }) => sum + price, 0);
    return Math.round(basePrice + toppingsPrice);
  };

  // Общий обработчик изменений
  const handlePizzaUpdate = (updates) => {
    setCurrentPizza(prev => {
      const newPizza = { ...prev, ...updates };
      // Всегда пересчитываем цену на основе актуальных данных
      newPizza.cost = recalculatePrice(
        newPizza.size, 
        updates.toppingsData || selectedToppings
      );
      return newPizza;
    });

    if (updates.toppingsData) {
      setSelectedToppings(updates.toppingsData);
    }
  };

  return (
    <div className='pizza-modal-overlay' onClick={() => setIndexPizzaOpen(null)}>
      <button className="pizza-close-button">×</button>
      <div className="pizza-modal-content" onClick={(e) => e.stopPropagation()}>
        <h2>{currentPizza.name}</h2>
        
        <div className="pizza-modal-main">
          {/* Левая колонка - изображение */}
          <div className="pizza-modal-image">
            <img 
              src={`${config.API_URL}/${currentPizza.image}`} 
              alt={currentPizza.name}
            />
          </div>
          
          {/* Правая колонка - описание и выбор */}
          <div className="pizza-modal-options">
            <div className="pizza-description">
              <p><strong>Описание:</strong></p>
              <p>{currentPizza.description}</p>
            </div>
            
            <PizzaSizeSelector 
              pizza={currentPizza} 
              sizes={sizes} 
              onUpdate={(size) => handlePizzaUpdate({ size })}
            />
          </div>
        </div>
        
        <ToppingsSelector
          all_toppings={toppings} 
          sizes={sizes}
          onUpdate={(toppingsData) => handlePizzaUpdate({ 
            toppings: toppingsData.bitmask,
            toppingsData: toppingsData.list 
          })}
        />
        
        <button
          className="add-to-cart-btn"
          onClick={() => {addToCart(currentPizza); setIndexPizzaOpen(null)}}
        >
          В корзину за {currentPizza.cost} ₽
        </button>
      </div>
    </div>
  );
}