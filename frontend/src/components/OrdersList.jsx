import React, { useState, useEffect } from 'react';
import '../styles/OrdersList.css';
import '../styles/Order.css'
import config from '../config.js';
import PizzaToppings from '../models/PizzaToppings.js';

function Order({ selectedOrderId, setSelectedOrderId, toppings }) {
  const [order, setOrder] = useState({});
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const response = await fetch(`${config.API_URL}/api/orders/${selectedOrderId}`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('jwtToken')}`,
            'Content-Type': 'application/json'
          }
        });
        const data = await response.json();
        if (!response.ok) {
          throw new Error(data.detail);
        }
        setOrder(data);
      } catch (err) {
        setError(err.message);
      }
    };

    if (selectedOrderId) {
      fetchOrders();
    }
  }, [selectedOrderId]);

  if (!selectedOrderId) {
    return null;
  }

  if (error) return (
    <div className="order-overlay" onClick={() => setSelectedOrderId(null)}>
      <div className="orders-content">
        <div className="error-state">Ошибка: {error}</div>
      </div>
    </div>
  );

  return (
    <div className="order-overlay" onClick={() => setSelectedOrderId(null)}>
      <button 
        className="order-close-button"
        onClick={(e) => {
          e.stopPropagation();
          setSelectedOrderId(null);
        }}
      >
        ×
      </button>
      <div className="order-content" onClick={(e) => e.stopPropagation()}>
        <h2>Заказ {order.order_id}</h2>
        
        <div className="order-details">
          <div className="order-section">
            <h3>Детали доставки</h3>
            <p><strong>Адрес:</strong> {order.delivery?.address}</p>
            <p><strong>Дата:</strong> {order.delivery?.date}</p>
            <p><strong>Время:</strong> {order.delivery?.time}</p>
          </div>
          
          <div className="order-section">
            <h3>Состав заказа</h3>
            <div className="products-list">
              {order.products?.map(product => {
                const toppingsManager = new PizzaToppings(toppings);
                toppingsManager.bitToppings = product.toppings;
                const selectedToppings = toppingsManager.getToppings(true);
                return (
                  <div key={`${product.pizza_id}-${product.size}-${product.toppings}`} className="product-item">
                    <img 
                      src={`http://127.0.0.1:8000${product.image_url}`}
                      alt={product.name} 
                      className="product-image"
                    />
                    <div className="product-info">
                      <h4>
                        {product.name} ({
                          product.size === 'small' ? 'Маленькая' :
                          product.size === 'medium' ? 'Средняя' : 'Большая'
                        })
                      </h4>
                      {selectedToppings.length > 0 && (
                        <p className="cart-item-toppings">
                          Добавки: {selectedToppings.map(t => t.name).join(', ')}
                        </p>
                      )}
                      <p>{product.quantity} × {product.price.toLocaleString('ru-RU')} ₽</p>
                    </div>
                    <div className="product-total">
                      {(product.quantity * product.price).toLocaleString('ru-RU')} ₽
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
        <div className="order-total">
          <h3>Итого</h3>
          <p>{order.price?.toLocaleString('ru-RU')} ₽</p>
        </div>
      </div>
    </div>
  );
}

export function OrdersList({ isOrdersListOpen, setIsOrdersListOpen, toppings }) {
  const [orders, setOrders] = useState([]);
  const [selectedOrderId, setSelectedOrderId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const response = await fetch(`${config.API_URL}/api/orders`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('jwtToken')}`,
            'Content-Type': 'application/json'
          }
        });
        const data = await response.json();
        if (!response.ok) {
          throw new Error(data.detail);
        }
        console.log(data);
        setOrders(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (isOrdersListOpen) {
      fetchOrders();
    }
  }, [isOrdersListOpen]);

  useEffect(() => {
    if (isOrdersListOpen) {
      const scrollY = window.scrollY;
      document.body.classList.add("body-no-scroll");
      document.body.style.top = `-${scrollY}px`;

      return () => {
        document.body.classList.remove("body-no-scroll");
        window.scrollTo(0, parseInt(document.body.style.top || "0") * -1);
        document.body.style.top = "";
      };
    }
  }, [isOrdersListOpen]);

  if (!isOrdersListOpen) {
    return null;
  }

  if (loading) return (
    <div className='modal-overlay' onClick={() => setIsOrdersListOpen(false)}>
      <div className="orders-content">
        <div className="loading-state">Загрузка данных...</div>
      </div>
    </div>
  );

  if (error) return (
    <div className='modal-overlay' onClick={() => setIsOrdersListOpen(false)}>
      <div className="orders-content">
        <div className="error-state">Ошибка: {error}</div>
      </div>
    </div>
  );

  return (
    <>
      {isOrdersListOpen && (
        <div className='modal-overlay' onClick={() => setIsOrdersListOpen(false)}>
          <button 
            className="orders-list-close-button"
            onClick={(e) => {
              e.stopPropagation();
              setIsOrdersListOpen(false);
            }}
          >
            ×
          </button>
          <div className="orders-content" onClick={(e) => e.stopPropagation()}>
            <h2 className="orders-header">История заказов</h2>
            <div style={{"overflowY": "auto", "height": "87vh"}}>
              <div className="table-container">
                <table className="orders-table">
                  <thead>
                    <tr>
                      <th className="table-header">Номер заказа</th>
                      <th className="table-header">Статус заказа</th>
                      <th className="table-header">Дата</th>
                      <th className="table-header">Цена</th>
                    </tr>
                  </thead>
                  <tbody>
                    {orders.map((order) => (
                      <tr 
                        key={order.order_id}
                        className={`table-row ${selectedOrderId === order.order_id ? 'selected-row' : ''}`}
                        onClick={() => setSelectedOrderId(order.order_id)}
                      >
                        <td className="table-cell">{order.order_id}</td>
                        <td className="table-cell">{order.order_status}</td>
                        <td className="table-cell">{order.delivery.date}</td>
                        <td className="table-cell price-cell">
                          {order.price.toLocaleString('ru-RU')} ₽
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {selectedOrderId && (
        <Order 
          selectedOrderId={selectedOrderId} 
          setSelectedOrderId={setSelectedOrderId} 
          toppings={toppings}
        />
      )}
    </>
  );
}