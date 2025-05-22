import { useState } from 'react';
import {AuthButton, AuthModal, LogOutButton} from './Auth.jsx';
import './App.css';

export default function App() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  return (
    <div className="app">
      {isLoggedIn ?(
          <LogOutButton setIsLoggedIn={setIsLoggedIn}/>
        ):(
          <AuthButton setIsModalOpen={setIsModalOpen}/>
        )}
      {isModalOpen && (<AuthModal setIsModalOpen={setIsModalOpen} setIsLoggedIn={setIsLoggedIn}/>)}
    </div>
  );
}
