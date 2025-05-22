// import React from "react";
// import '../styles/Pizza.css';
import '../styles/Modal.css';

// export function PizzaCard({ pizza, pizzaIndex, setIndexPizzaOpen }) {
//   return (
//     <button className="pizza-card" onClick={() => {console.log(`Открыта ${pizzaIndex}`); setIndexPizzaOpen(pizzaIndex)}}>
//       <img 
//         src={`http://localhost:8000${pizza.image_url}`}
//         alt={pizza.name}
//       />
//       <h3>{pizza.name}</h3>
//       <p>{pizza.price} ₽</p>
//     </button>
//   );
// }

// function Pizza({ pizza }) {
//   return (
//     <>
//       <h2>{pizza.name}</h2>
//       <img 
//         src={`http://localhost:8000${pizza.image_url}`}
//         alt={pizza.name}
//       />
//       <p>{pizza.price} ₽</p>
//     </>
//   );
// }

// export function PizzaModal({ pizza, setIndexPizzaOpen}) {
export function PizzaModal() {
  return (
    <div className='modal-overley' onClick={() => setIndexPizzaOpen(null)}>
      <button 
        className="close-button"
        onClick={() => setIsAuthModalOpen(false)}
      >
        ×
      </button>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        {/* <Pizza pizza={pizza}/> */}
        <h2>djkhbbg</h2>
      </div>
    </div>
  );
}
