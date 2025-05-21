import { useState } from 'react';
import {AuthButton, AuthModal} from './Auth.jsx';
import './App.css';

export default function App() {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <div className="app">
      <AuthButton setIsModalOpen={setIsModalOpen}/>
      {isModalOpen && (<AuthModal setIsModalOpen={setIsModalOpen}/>)}
    </div>
  );
}
