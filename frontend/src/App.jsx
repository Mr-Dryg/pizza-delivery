import { Provider } from 'react-redux';
import { store } from './store';
import { useState, useEffect } from 'react';
import { AuthButton, AuthModal, LogOutButton } from './components/Auth.jsx';
import { PizzaCard, PizzaModal } from "./components/Pizza.jsx";
import { CartButton, Cart } from "./components/Cart.jsx";
import './styles/App.css';

export default function App() {
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [pizzas, setPizzas] = useState([]);
  const pizzaRows = [];
  const [indexPizzaOpen, setIndexPizzaOpen] = useState(null);
  const [isCartOpen, setIsCartOpen] = useState(false);


  useEffect(() => {
    fetch("http://localhost:8000/pizzas/")
      .then((res) => res.json())
      .then((data) => setPizzas(data));
  }, []);

  const PIZZAS_PER_ROW = 4;
  for (let i = 0; i < pizzas.length; i += PIZZAS_PER_ROW) {
    pizzaRows.push(pizzas.slice(i, i + PIZZAS_PER_ROW));
  }

  return (
    <Provider store={store}>
      {isLoggedIn ?(
        <LogOutButton setIsLoggedIn={setIsLoggedIn}/>
      ):(
        <AuthButton setIsAuthModalOpen={setIsAuthModalOpen}/>
      )}
      {isAuthModalOpen && (<AuthModal setIsAuthModalOpen={setIsAuthModalOpen} setIsLoggedIn={setIsLoggedIn}/>)}
      <div className="pizza-container">
        {pizzaRows.map((row, rowIndex) => (
          <div key={`row-${rowIndex}`} className="pizza-row">
            {row.map((pizza, pizzaIndex) => (
              <PizzaCard
                key={pizza.id}
                pizza={pizza}
                pizzaIndex={pizzaIndex + rowIndex * PIZZAS_PER_ROW}
                // pizzaIndex={0}
                setIndexPizzaOpen={setIndexPizzaOpen}
              />
            ))}
          </div>
        ))}
      </div>
      {indexPizzaOpen != null && (
        <PizzaModal pizza={pizzas[indexPizzaOpen]} setIndexPizzaOpen={setIndexPizzaOpen} />
      )}
      <CartButton setIsCartOpen={setIsCartOpen} />
      <Cart isCartOpen={isCartOpen} setIsCartOpen={setIsCartOpen}/>
    </Provider>
  );
}
