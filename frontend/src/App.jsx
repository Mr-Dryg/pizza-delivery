import { Provider } from 'react-redux';
import { store } from './store';
import { useState, useEffect } from 'react';
import { AuthModal } from './components/Auth.jsx';
import { PizzaCard, PizzaModal } from "./components/Pizza.jsx";
import { CartButton, Cart } from "./components/Cart.jsx";
import { Checkout } from './components/Checkout.jsx';
import { OrdersList } from './components/OrdersList.jsx';
import './styles/App.css';
import config from './config.js';

export default function App() {
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [pizzas, setPizzas] = useState([]);
  const pizzaRows = [];
  const [indexPizzaOpen, setIndexPizzaOpen] = useState(null);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isOrderStarted, setIsOrderStarted] = useState(false);
  const [isOrdersListOpen, setIsOrdersListOpen] = useState(false);
  const [toppings, setToppings] = useState({});
  const [sizes, setSizes] = useState({});

  useEffect(() => {
    fetch(`${config.API_URL}/api/menu/1`)
      .then((res) => res.json())
      .then((data) => setPizzas(data));
    
    fetch(`${config.API_URL}/api/menu/toppings`)
      .then((res) => res.json())
      .then((data) => setToppings(data));
    
    fetch(`${config.API_URL}/api/menu/sizes`)
      .then((res) => res.json())
      .then((data) => setSizes(data));
  }, []);

  const PIZZAS_PER_ROW = 4;
  for (let i = 0; i < pizzas.length; i += PIZZAS_PER_ROW) {
    pizzaRows.push(pizzas.slice(i, i + PIZZAS_PER_ROW));
  }

  useEffect(() => {
    console.log("1", isOrderStarted, !isLoggedIn);
    if (isOrderStarted && !isLoggedIn){
      setIsAuthModalOpen(true);
    }
  }, [isOrderStarted]);

  useEffect(() => {
    console.log("2", !isAuthModalOpen);
    if (!isAuthModalOpen && !isLoggedIn) {
      setIsOrderStarted(false);
    }
  }, [isAuthModalOpen])

  return (
    <Provider store={store}>
      <div className='menu'>
        {isLoggedIn ? (
          <>
            <button onClick={() => setIsOrdersListOpen(true)}>История заказов</button>
            <button 
              className="auth-button"
              onClick={() => {setIsLoggedIn(false); localStorage.removeItem('jwtToken');}}
            >
              Выйти
            </button>
          </>
        ):(
          <button 
            className="auth-button"
            onClick={() => setIsAuthModalOpen(true)}
          >
            Войти
          </button>
        )}
      </div>
      {isAuthModalOpen && (
        <AuthModal setIsAuthModalOpen={setIsAuthModalOpen} setIsLoggedIn={setIsLoggedIn}/>
      )}
      <div className="pizza-container">
        {pizzaRows.map((row, rowIndex) => (
          <div key={`row-${rowIndex}`} className="pizza-row">
            {row.map((pizza, pizzaIndex) => (
              <PizzaCard
                key={pizza.pizza_id}
                pizza={pizza}
                pizzaIndex={pizzaIndex + rowIndex * PIZZAS_PER_ROW}
                setIndexPizzaOpen={setIndexPizzaOpen}
              />
            ))}
          </div>
        ))}
      </div>
      {indexPizzaOpen != null && (
        <PizzaModal pizza={pizzas[indexPizzaOpen]} toppings={toppings} sizes={sizes} setIndexPizzaOpen={setIndexPizzaOpen} />
      )}
      <CartButton setIsCartOpen={setIsCartOpen} />
      <Cart isCartOpen={isCartOpen} setIsCartOpen={setIsCartOpen} setIsOrderStarted={setIsOrderStarted} toppings={toppings} />
      {isOrderStarted && isLoggedIn && !isAuthModalOpen && (
        <Checkout setIsOrderStarted={setIsOrderStarted} setIsAuthModalOpen={setIsAuthModalOpen} />
      )}
      <OrdersList isOrdersListOpen={isOrdersListOpen} setIsOrdersListOpen={setIsOrdersListOpen} toppings={toppings} />
    </Provider>
  );
}
