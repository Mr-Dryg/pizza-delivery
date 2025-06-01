import { useState, useCallback, useEffect } from 'react';
import { useCart } from '../hooks/useCart.js';
import '../styles/Checkout.css';
import config from '../config.js';
import { AuthModal } from './Auth.jsx';

export const formatPhoneNumber = (input) => {
  // Очищаем от всех символов, кроме цифр и +
  let cleanValue = input.replace(/[^\d+]/g, '');
  
  // Определяем префикс
  let prefix = '';
  if (cleanValue.startsWith('+7')) {
    prefix = '+7';
    cleanValue = cleanValue.substring(2);
  } else if (cleanValue.startsWith('7')) {
    prefix = '+7';
    cleanValue = cleanValue.substring(1);
  } else if (cleanValue.startsWith('8')) {
    prefix = '8';
    cleanValue = cleanValue.substring(1);
  } else if (cleanValue) {
    prefix = '+7';
  }

  // Ограничиваем длину номера (10 цифр без префикса)
  if (cleanValue.length > 10) {
    cleanValue = cleanValue.substring(0, 10);
  }

  // Форматируем номер
  let formattedValue = prefix;
  if (cleanValue.length > 0) {
    formattedValue += ` ${cleanValue.substring(0, 3)}`;
  }
  if (cleanValue.length > 3) {
    formattedValue += ` ${cleanValue.substring(3, 6)}`;
  }
  if (cleanValue.length > 6) {
    formattedValue += ` ${cleanValue.substring(6, 8)}`;
  }
  if (cleanValue.length > 8) {
    formattedValue += `-${cleanValue.substring(8)}`;
  }

  return formattedValue;
};

export function Checkout({ setIsOrderStarted, setIsAuthModalOpen }) {
  const [orderStatus, setOrderStatus] = useState('checkout'); // checkout -> loading -> (success || error)
  const [orderNumber, setOrderNumber] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const Delivery_Time = 30;

  const { cart, totalNumber, totalPrice, clearCart } = useCart();
  
  const [name, setName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [address, setAddress] = useState('');
  const [time, setTime] = useState('');
  const [errors, setErrors] = useState({
    name: '',
    phoneNumber: '',
    address: '',
    time: ''
  });

  useEffect(() => {
    async function fetchData() {
      try {
        const response = await fetch(`${config.API_URL}/api/me`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('jwtToken')}`
          },
        });

        if (response.status === 401) {
          console.error('Ошибка 401: Требуется авторизация');
          localStorage.removeItem('jwtToken');
          setIsAuthModalOpen(true);
        }

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        // Проверяем Content-Type перед вызовом .json()
        const contentType = response.headers.get('content-type');
        if (!contentType || !contentType.includes('application/json')) {
          throw new TypeError("Ожидался JSON, но получили " + contentType);
        }

        const data = await response.json();

        setName(data.name);
        setPhoneNumber(formatPhoneNumber(data.phone));
        // setAddress(data.address);

      } catch (error) {
        // 8. Обработка ошибок
        setOrderStatus('error');
        setErrorMessage(error.message);
        console.error('Order error:', error);
      }
    }
    fetchData();
  }, [])

  const getCurrentDateTime = () => {
    const now = new Date();
    const minDeliveryTime = new Date(now.getTime() + Delivery_Time * 60000);
    
    return {
      minTime: `${minDeliveryTime.getHours().toString().padStart(2, '0')}:${minDeliveryTime.getMinutes().toString().padStart(2, '0')}`,
      currentTime: `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`
    };
  };

  const { minTime, currentTime } = getCurrentDateTime();

  useEffect(() => {
    setTime(minTime);
  }, [minTime]);

  const handleNameChange = useCallback((event) => {
    setName(event.target.value);
    setErrors(prev => ({ ...prev, name: '' }));
  }, []);

  const handlePhoneNumberChange = useCallback((event) => {
    const input = event.target.value;
    const previousValue = phoneNumber;
    
    // Позволяем удалять символы
    if (input.length < previousValue.length) {
      setPhoneNumber(input);
      return;
    }

    setPhoneNumber(formatPhoneNumber(input));
    setErrors(prev => ({ ...prev, phoneNumber: '' }));
  }, [phoneNumber]);

  const handleAddressChange = useCallback((event) => {
    setAddress(event.target.value);
    setErrors(prev => ({ ...prev, address: '' }));
  }, []);

  const handleTimeChange = useCallback((event) => {
    setTime(event.target.value);
    setErrors(prev => ({ ...prev, time: '' }));
  }, []);

  const validateForm = () => {
    const newErrors = {
      name: '',
      phoneNumber: '',
      address: '',
      time: ''
    };

    let isValid = true;

    if (!name.trim()) {
      newErrors.name = 'Введите имя';
      isValid = false;
    } else if (name.trim().length < 2) {
      newErrors.name = 'Имя слишком короткое';
      isValid = false;
    }

    if (!phoneNumber.trim()) {
      newErrors.phoneNumber = 'Введите номер телефона';
      isValid = false;
    } else {
      // Удаляем все нецифровые символы
      const cleanPhone = phoneNumber.replace(/\D/g, '');
      
      // Проверяем формат: начинается с 8 или 7, затем 10 цифр (итого 11 цифр)
      if (!/^(8|7)\d{10}$/.test(cleanPhone)) {
        newErrors.phoneNumber = 'Введите 11-значный номер в формате: 8XXXXXXXXXX или +7XXXXXXXXXX';
        isValid = false;
      }
    }

    if (!address.trim()) {
      newErrors.address = 'Введите адрес';
      isValid = false;
    }
      
    if (!time) {
      newErrors.time = 'Выберите время';
      isValid = false;
    } else {
      const [hours, minutes] = time.split(':').map(Number);
      const now = new Date();
      const minDeliveryTime = new Date(now.getTime() + Delivery_Time * 60000);
      minDeliveryTime.setSeconds(0, 0);
      
      const selectedTime = new Date();
      selectedTime.setHours(hours, minutes, 0, 0);
      
      if (selectedTime < minDeliveryTime) {
        newErrors.time = `Ближайшее время доставки: ${minDeliveryTime.getHours()}:${minDeliveryTime.getMinutes().toString().padStart(2, '0')}`;
        isValid = false;
      }
    }

    setErrors(newErrors);
    return isValid;
  };

  const makeOrder = async () => {
    // 1. Валидация формы
    if (!validateForm()) return;
    
    // 2. Установка состояния загрузки
    setOrderStatus('loading');
    setErrorMessage('');

    try {
      // 3. Подготовка данных
      const orderData = {
        customer: {
          name: name.trim(),
          phone: phoneNumber.replace(/\D/g, '')
        },
        delivery: {
          address: address.trim(),
          time
        },
        items: cart.map(item => ({
          pizza_id: item.pizza_id,
          pizza_size: item.size,
          pizza_toppings: {
            bit_toppings: item.toppings,
          },
          quantity: item.quantity,
          cost: item.cost
        })),
        price: totalPrice
      };

      // 4. Отправка запроса
      const response = await fetch(`${config.API_URL}/api/make-order`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('jwtToken')}`
        },
        body: JSON.stringify(orderData)
      });

      // 5. Обработка ответа
      const data = await response.json();

      if (response.status === 401) {
        console.error('Ошибка 401: Требуется авторизация');
        localStorage.removeItem('jwtToken');
        setIsAuthModalOpen(true);
      }

      if (!response.ok) {
        throw new Error(data.detail || 'Ошибка сервера');
      }

      // 6. Успешный заказ
      setOrderStatus('success');
      setOrderNumber(data.order_id);
      
      // 7. Очистка корзины (если нужно)
      clearCart();

    } catch (error) {
      // 8. Обработка ошибок
      setOrderStatus('error');
      setErrorMessage(error.message || 'Не удалось оформить заказ');
      console.error('Order error:', error);
    }
  };

  return (
    <div className='modal-overlay' onClick={() => setIsOrderStarted(false)}>
      <button className="checkout-close-button">×</button>
      <div className='checkout-content' onClick={(e) => e.stopPropagation()}>
        {orderStatus === 'checkout' && (
          <>
          <h1>Оформление заказа</h1>
          <div className='checkout-layout'>
            <div className='form-section'>
              <label>
                Имя:
                <input 
                  type="text" 
                  value={name} 
                  placeholder='Иван' 
                  onChange={handleNameChange}
                  className={errors.name ? 'error' : ''}
                />
                {errors.name && <span className="error-message">{errors.name}</span>}
              </label>
              
              <label>
                Номер телефона:
                <input 
                  type="tel" 
                  value={phoneNumber} 
                  placeholder='+7 XXX XXX XX-XX'
                  onChange={handlePhoneNumberChange}
                  onPaste={(e) => {
                    e.preventDefault();
                    const pastedText = e.clipboardData.getData('text');
                    setPhoneNumber(formatPhoneNumber(pastedText));
                  }}
                  className={errors.phoneNumber ? 'error' : ''}
                />
                {errors.phoneNumber && <span className="error-message">{errors.phoneNumber}</span>}
              </label>
              
              <label>
                Адрес:
                <input 
                  type="text" 
                  value={address} 
                  placeholder='г. Москва, ул. Острякова, 15А, под. 1, кв. 13' 
                  onChange={handleAddressChange}
                  className={errors.address ? 'error' : ''}
                />
                {errors.address && <span className="error-message">{errors.address}</span>}
              </label>
              
              <label>
                Время доставки:
                <input 
                  type="time" 
                  value={time} 
                  min={minTime}
                  onChange={handleTimeChange}
                  className={errors.time ? 'error' : ''}
                />
                {errors.time && <span className="error-message">{errors.time}</span>}
                <div className="time-note">
                  Ближайшее время доставки: {minTime}
                </div>
              </label>
            </div>
            
            <div className='summary-section'>
              <h3>{totalNumber} товаров за {totalPrice} ₽</h3>
              <ul style={{"listStyleType":"none", "paddingLeft": "0px", "overflowY": "auto", "height": "50vh"}}>
                {cart.map(item => (
                  <li key={`${item.pizza_id}-${item.size}-${item.toppings}`} className="cart-item">
                    <p>
                      {item.name} {item.quantity} × {item.price} ₽
                    </p>
                  </li>
                ))}
              </ul>
            </div>
          </div>
          
          <div className='actions-section'>
            <button 
              className='back-button' 
              onClick={() => setIsOrderStarted(false)}
            >
              Назад
            </button>
            <button 
              className='submit-button' 
              onClick={makeOrder}
            >
              Оформить заказ на {totalPrice} ₽
            </button>
          </div>
          </>
        )}
        {orderStatus === 'loading' && (
          <div className="order-status loading">
            <div className="spinner"></div>
            <p>Оформляем ваш заказ...</p>
          </div>
        )}
        {orderStatus === 'success' && (
          <div className="order-status success">
            <h3>✅ Заказ успешно оформлен!</h3>
            <p>Номер вашего заказа: <strong>{orderNumber}</strong></p>
            <button 
              onClick={() => setIsOrderStarted(false)}
              className="continue-button"
            >
              Продолжить покупки
            </button>
          </div>
        )}
        {orderStatus === 'error' && (
          <div className="order-status error">
            <h3>❌ Ошибка оформления</h3>
            <p>{errorMessage}</p>
            <button 
              onClick={() => setOrderStatus('checkout')}
              className="retry-button"
            >
              Попробовать снова
            </button>
          </div>
        )}
      </div>
    </div>
  );
}