import '../styles/Pizza.css';
import '../styles/Modal.css';
import { useState, useEffect } from 'react';
import { useCart } from '../hooks/useCart';

export function PizzaCard({ pizza, pizzaIndex, setIndexPizzaOpen }) {
  return (
    <button className="pizza-card" onClick={() => {console.log(`Открыта ${pizzaIndex}`); setIndexPizzaOpen(pizzaIndex)}}>
      <img 
        src={`http://localhost:8000${pizza.image_url}`}
        alt={pizza.name}
      />
      <h3>{pizza.name}</h3>
      <p>{pizza.price} ₽</p>
    </button>
  );
}

export function PizzaModal({ pizza, setIndexPizzaOpen}) {
  const [pizzaDescription, setPizzaDescription] = useState(null);
  const { addToCart } = useCart();

  useEffect(() => {
    fetch(`http://localhost:8000/pizzas/${pizza.id}`)
      .then((res) => res.json())
      .then((data) => setPizzaDescription(data));
  }, []);

  return (
    <div className='modal-overlay' onClick={() => setIndexPizzaOpen(null)}>
      <button 
        className="pizza-close-button"
      >
        ×
      </button>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <h2>{pizza.name}</h2>
        <img 
          src={`http://localhost:8000${pizza.image_url}`}
          alt={pizza.name}
        />
        <p>Описание:</p>
        <p>{pizzaDescription}</p>
        <button onClick={() => {addToCart(pizza); setIndexPizzaOpen(null)}} >В корзину за {pizza.price} ₽</button>
      </div>
    </div>
  );
}
