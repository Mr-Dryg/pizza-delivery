import { useState } from 'react';
import './App.css';

export function AuthButton({setIsModalOpen}) {
  return (
    <button 
      className="auth-button"
      onClick={() => setIsModalOpen(true)}
    >
      Войти
    </button>
  );
}

export function AuthModal({setIsModalOpen}) {
  const [email, setEmail] = useState(null);
  const [password, setPassword] = useState(null);

  const handleEmailChange = (event) => {
    setEmail(event.target.value);
  };

  const handlePasswordChange = (event) => {
    setPassword(event.target.value);
  };

  const handleSignIn = async (event) => {
    event.preventDefault();

    try {
      const response = await fetch('/api/sign-in', {  // заменить endpoint
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ name, email })
      });

      if (response.ok) {
        console.log('Данные успешно отправлены!');
        setName('');
        setEmail('');
      } else {
        console.error('Ошибка при отправке данных:', response.status);
      }
    } catch (error) {
      console.error('Ошибка сети:', error);
    }
  };

  return (
    <div className="modal-overlay" onClick={() => setIsModalOpen(false)}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <h2>Вход</h2>
        <form>
          <input type="text" value={email} placeholder="Email" onChange={handleEmailChange} />
          <input type="password" value={password} placeholder="Пароль" onChange={handlePasswordChange} />
          <button type="submit" onSubmit={handleSignIn} >Войти</button>
          <button type="button" >Зарегистрироваться</button>
        </form>
      </div>
      <button 
        className="close-button"
        onClick={() => setIsModalOpen(false)}
      >
        ×
      </button>
    </div>
  );
}
