import '../styles/Pizza.css';
import '../styles/Modal.css';
import { useState, useEffect } from 'react';
import { useCart } from '../hooks/useCart';
import config from '../config.js';

export function PizzaCard({ pizza, pizzaIndex, setIndexPizzaOpen }) {
  return (
    <button className="pizza-card" onClick={() => {console.log(`Открыта ${pizzaIndex}`); setIndexPizzaOpen(pizzaIndex)}}>
      <img 
        src={`${config.API_URL}${pizza.image}`}
        alt={pizza.name}
      />
      <h3>{pizza.name}</h3>
      <p>{pizza.cost} ₽</p>
    </button>
  );
}

export function PizzaModal({ pizza, setIndexPizzaOpen}) {
  const { addToCart } = useCart();

  return (
    <div className='modal-overlay' onClick={() => setIndexPizzaOpen(null)}>
      <button 
        className="pizza-close-button"
      >
        ×
      </button>
      <div className="pizza-modal-content" onClick={(e) => e.stopPropagation()}>
        <h2>{pizza.name}</h2>
        <img 
          src={`${config.API_URL}${pizza.image}`}
          alt={pizza.name}
        />
        <p>Описание:</p>
        <p>{pizza.description}</p>
        <button onClick={() => {addToCart(pizza); setIndexPizzaOpen(null)}} >В корзину за {pizza.cost} ₽</button>
      </div>
    </div>
  );
}
