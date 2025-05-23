import { useCart } from './useCart';

export function Cart() {
  const { cart, removeFromCart, updateQuantity, totalPrice } = useCart();

  return (
    <div>
      <h2>Корзина</h2>
      {cart.length === 0 ? (
        <p>Корзина пуста</p>
      ) : (
        <ul>
          {cart.map(item => (
            <li key={item.id}>
              <img src={item.image} alt={item.name} width="50" />
              <span>{item.name} (${item.price})</span>
              <input
                type="number"
                value={item.quantity}
                onChange={(e) => updateQuantity(item.id, +e.target.value)}
                min="1"
              />
              <button onClick={() => removeFromCart(item.id)}>
                Удалить
              </button>
            </li>
          ))}
        </ul>
      )}
      <p>Итого: ${totalPrice}</p>
    </div>
  );
}