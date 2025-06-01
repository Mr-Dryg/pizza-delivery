export default class PizzaToppings {
  constructor(allToppings) {
    this.bitToppings = 0;
    this.allToppings = allToppings || {};
  }

  setToppings(newBitToppings) {
    this.bitToppings = newBitToppings;
  }

  // Добавить ингредиенты (принимает массив ID)
  addToppings(addedToppings) {
    addedToppings.forEach(id => {
      this.bitToppings = this.bitToppings | (1 << id);
    });
    return this;
  }

  // Удалить ингредиенты (принимает массив ID)
  removeToppings(removedToppings) {
    removedToppings.forEach(id => {
      this.bitToppings = this.bitToppings & ~(1 << id);
    });
    return this;
  }

  // Получить список ингредиентов
  getToppings(available = true) {
    return Object.keys(this.allToppings)
      .map(Number)
      .filter(id => {
        const isSet = (this.bitToppings & (1 << id)) !== 0;
        return available ? isSet : !isSet;
      })
      .map(id => ({
        id,
        ...this.allToppings[id],
        name: this.allToppings[id][0],
        price: this.allToppings[id][1]
      }));
  }

  // Проверить, содержит ли конкретный ингредиент
  hasTopping(id) {
    return (this.bitToppings & (1 << id)) !== 0;
  }

  // Очистить все ингредиенты
  clearAll() {
    this.bitToppings = 0;
    return this;
  }
}
