import { useState, useCallback } from 'react';
import { formatPhoneNumber } from './Checkout.jsx';
import '../styles/Auth.css';
import '../styles/Modal.css';
import config from '../config.js';


function LogInModal({ 
  login, 
  password,
  handleLoginChange,
  handlePasswordChange,
  handleLogIn,
  handleSignUp,
  signSuccess,
  signError,
  setSignError,
  handleCloseSuccessMessage
}) {
  return (
    <>
      <h2>Вход</h2>
      <form onSubmit={handleLogIn}>
        <input type="text" value={login} placeholder="Логин, номер телефона или почта" onChange={handleLoginChange} />
        <input type="password" value={password} placeholder="Пароль" onChange={handlePasswordChange} />
        <button type="submit" >Войти</button>
        <button type="button" onClick={handleSignUp} >Зарегистрироваться</button>
      </form>
      {signSuccess && (
        <div className="success-message">
          Авторизация прошла успешно!
          <button onClick={handleCloseSuccessMessage}>Ok</button>
        </div>
      )}
      {signError && (
        <div className="error-message">
          {signError}
          <button onClick={() => setSignError(null)}>Ok</button>
        </div>
      )}
    </>
  );
}

function SignUpModal({
  name,
  login,
  email,
  phone,
  password,
  handleNameChange,
  handleLoginChange,
  handleEmailChange,
  handlePhoneChange,
  handlePasswordChange,
  handleSignUp,
  signSuccess,
  signError,
  setSignError,
  handleCloseSuccessMessage
}) {
  return (
    <>
      <h2>Регистрация</h2>
      <form onSubmit={handleSignUp}>
        <input type="text" value={name} placeholder="Имя" onChange={handleNameChange} />
        <input type="text" value={login} placeholder="Логин" onChange={handleLoginChange} />
        <input type="email" value={email} placeholder="Email" onChange={handleEmailChange} />
        <input type="tel" placeholder='+7 XXX XXX XX-XX'
          value={formatPhoneNumber(phone)}
          onChange={handlePhoneChange}
          onPaste={(e) => {
            e.preventDefault();
            setPhoneNumber(formatPhoneNumber(e.clipboardData.getData('text')));
          }}
        />
        <input type="password" value={password} placeholder="Пароль" onChange={handlePasswordChange} />
        <button type="submit" >Зарегистрироваться</button>
      </form>
      {signSuccess && (
        <div className="success-message">
          Регистрация прошла успешно!
          <button onClick={handleCloseSuccessMessage}>Ok</button>
        </div>
      )}
      {signError && (
        <div className="error-message">
          {signError}
          <button onClick={() => setSignError(null)}>Ok</button>
        </div>
      )}
    </>
  );
}

export function AuthModal({setIsAuthModalOpen, setIsLoggedIn}) {
  const [isLogInModal, setIsLogInModal] = useState(true);
  const [name, setName] = useState('');
  const [login, setLogin] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [signSuccess, setSignSuccess] = useState(false);
  const [signError, setSignError] = useState(null);

  const handleNameChange = useCallback((event) => {
    setName(event.target.value);
  }, []);

  const handleLoginChange = useCallback((event) => {
    setLogin(event.target.value);
  }, []);

  const handleEmailChange = useCallback((event) => {
    setEmail(event.target.value);
  }, []);

  const handlePhoneChange = useCallback((event) => {
    setPhone(event.target.value);
  }, []);

  const handlePasswordChange = useCallback((event) => {
    setPassword(event.target.value);
  }, []);

  const handleLogIn = useCallback(async (event) => {
    event.preventDefault();

    console.log('Вход с:', login, password);
    setSignSuccess(false);
    setSignError(null);

    try {
      const response = await fetch(`${config.API_URL}/api/log-in`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ login, password })
      });

      const data = await response.json();

      if (response.ok) {
        console.log('Данные успешно отправлены!');
        setSignSuccess(true);
        setLogin('');
        setPassword('');
        setIsLoggedIn(true);
        localStorage.setItem('jwtToken', data.token);
        // console.log('JWT', data.token)
      } else {
        console.error('Ошибка при отправке данных:', response.status);
        console.log(data)
        setSignError(data.detail || "Ошибка входа");
      }
    } catch (error) {
      console.error('Ошибка сети:', error);
      setSignError("Ошибка сети. Проверьте подключение к интернету.");
    }
  }, [login, password]);

  const handleSignUp = useCallback(async (event) => {
    event.preventDefault();
    if (isLogInModal) {
      setIsLogInModal(false);
      return;
    }

    console.log('Регистрация с:', name, login, email, password);
    setSignSuccess(false);
    setSignError(null);

    try {
      const response = await fetch(`${config.API_URL}/api/sign-up`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ name, login, email, phone, password })
      });

      const data = await response.json();

      if (response.ok) {
        console.log('Данные успешно отправлены!');
        setSignSuccess(true);
        setName('');
        setLogin('');
        setEmail('');
        setPhone('');
        setPassword('');
        setIsLoggedIn(true);
        localStorage.setItem('jwtToken', data.token);
        // console.log('JWT:', data.token);
      } else {
        console.error('Ошибка при отправке данных:', response.status);
        setSignError(data.detail || "Ошибка регистрации");
      }
    } catch (error) {
      console.error('Ошибка сети:', error);
      setSignError("Ошибка сети. Проверьте подключение к интернету.");
    }
  }, [name, login, email, password, isLogInModal]);

  const handleCloseSuccessMessage = () => {
    setSignSuccess(false);
    setIsAuthModalOpen(false);
  };

  return (
    <div className="modal-overlay" onClick={() => setIsAuthModalOpen(false)}>
      <button 
        className="close-button"
      >
        ×
      </button>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        {isLogInModal ? (
          <LogInModal
            login={login}
            password={password}
            handleLoginChange={handleLoginChange}
            handlePasswordChange={handlePasswordChange}
            handleLogIn={handleLogIn}
            handleSignUp={handleSignUp}
            signSuccess={signSuccess}
            signError={signError}
            setSignError={setSignError}
            handleCloseSuccessMessage={handleCloseSuccessMessage}
          />
        ) : (
          <SignUpModal
            name={name}
            login={login}
            email={email}
            phone={phone}
            password={password}
            handleNameChange={handleNameChange}
            handleLoginChange={handleLoginChange}
            handleEmailChange={handleEmailChange}
            handlePhoneChange={handlePhoneChange}
            handlePasswordChange={handlePasswordChange}
            handleSignUp={handleSignUp}
            signSuccess={signSuccess}
            signError={signError}
            setSignError={setSignError}
            handleCloseSuccessMessage={handleCloseSuccessMessage}
          />
        )}
      </div>
    </div>
  );
}
