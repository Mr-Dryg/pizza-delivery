import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
// import './index.css'
// import App from './App.jsx'
import { PizzaModal } from "./components/Pizza.jsx";
import { AuthModal } from './Auth.jsx';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    {/* <App /> */}
    <PizzaModal />
    <AuthModal setIsAuthModalOpen={() => {}} setIsLoggedIn={() => {}}/>
  </StrictMode>,
)
