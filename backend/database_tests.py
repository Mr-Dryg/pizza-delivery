import sqlite3
import random
from datetime import datetime, timedelta
from utils import hash_password

# Подключение к базе данных
def get_db_connection():
    conn = sqlite3.connect('./db/pizza.db')
    conn.row_factory = sqlite3.Row
    return conn

# Генерация случайных данных
def generate_test_data():
    conn = get_db_connection()
    cursor = conn.cursor()
    
    # Очистка таблиц перед заполнением (опционально)
    cursor.execute("DELETE FROM order_content")
    cursor.execute("DELETE FROM order_list")
    cursor.execute("DELETE FROM pizza")
    cursor.execute("DELETE FROM users")
    conn.commit()
    
    # Добавление пользователей
    users = [
        ('Иван Иванов', '1', hash_password('1'), 'ivanov@example.com', '+79161234567'),
        ('Петр Петров', '2', hash_password('2'), 'petrov@example.com', '+79162345678'),
        ('Сидор Сидоров', '3', hash_password('3'), 'sidorov@example.com', '+79163456789'),
        ('Анна Каренина', '4', hash_password('4'), 'akarenina@example.com', '+79164567890'),
        ('Михаил Булгаков', '5', hash_password('5'), 'mbulgakov@example.com', '+79165678901')
    ]
    
    cursor.executemany(
        "INSERT INTO users (name, login, password, email, phone) VALUES (?, ?, ?, ?, ?)",
        users
    )
    conn.commit()
    
    # Добавление пицц
    pizzas = [
        ('Маргарита', 'Классическая пицца с томатным соусом, моцареллой и базиликом', 450.0, True),
        ('Пепперони', 'Пицца с томатным соусом, моцареллой и колбасой пепперони', 550.0, True),
        ('Гавайская', 'Пицца с томатным соусом, моцареллой, ветчиной и ананасами', 500.0, True),
        ('Четыре сыра', 'Пицца с томатным соусом и смесью сыров: моцарелла, горгонзола, пармезан, фета', 600.0, True),
        ('Вегетарианская', 'Пицца с томатным соусом, моцареллой и смесью свежих овощей', 480.0, True),
        ('Мясная', 'Пицца с томатным соусом, моцареллой и ассорти из мясных продуктов', 650.0, True),
        ('Диабло', 'Острая пицца с томатным соусом, моцареллой, пепперони и перцем чили', 580.0, False)
    ]
    
    cursor.executemany(
        "INSERT INTO pizza (name, description, cost, available) VALUES (?, ?, ?, ?)",
        pizzas
    )
    conn.commit()
    
    # Добавление заказов
    statuses = ['Новый', 'Готовится', 'В доставке', 'Доставлен', 'Отменен']
    user_ids = [row[0] for row in cursor.execute("SELECT user_id FROM users").fetchall()]
    pizza_ids = [row[0] for row in cursor.execute("SELECT pizza_id FROM pizza").fetchall()]
    
    for i in range(15):
        user_id = random.choice(user_ids)
        total_cost = round(random.uniform(500, 3000), 2)
        address = f"ул. Тестовая, д. {random.randint(1, 100)}, кв. {random.randint(1, 200)}"
        order_time = (datetime.now() - timedelta(days=random.randint(0, 30))).strftime('%Y-%m-%d %H:%M:%S')
        current_status = random.choice(statuses)
        
        cursor.execute(
            "INSERT INTO order_list (user_id, total_cost, address, order_time, current_status) VALUES (?, ?, ?, ?, ?)",
            (user_id, total_cost, address, order_time, current_status)
        )
        order_id = cursor.lastrowid
        
        # Добавление содержимого заказа
        order_items = random.randint(1, 5)
        selected_pizzas = random.sample(pizza_ids, min(order_items, len(pizza_ids)))
        
        for pizza_id in selected_pizzas:
            pizza_cost = cursor.execute(
                "SELECT cost FROM pizza WHERE pizza_id = ?", 
                (pizza_id,)
            ).fetchone()[0]
            
            toppings = random.randint(0, 3)
            size = random.choice(['small', 'medium', 'large'])
            quantity = random.randint(1, 3)
            item_cost = round(pizza_cost * quantity, 2)
            
            cursor.execute(
                "INSERT INTO order_content (order_id, pizza_id, toppings, size, quantity, item_cost) VALUES (?, ?, ?, ?, ?, ?)",
                (order_id, pizza_id, toppings, size, quantity, item_cost)
            )
    
    conn.commit()
    conn.close()

if __name__ == '__main__':
    generate_test_data()
    print("Тестовые данные успешно добавлены в базу данных!")