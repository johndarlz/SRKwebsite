export interface CartItem {
  id: string;
  name: string;
  price: number;
  image_url: string;
  quantity: number;
}

export const getCart = (): CartItem[] => {
  const cart = localStorage.getItem('cart');
  return cart ? JSON.parse(cart) : [];
};

export const saveCart = (cart: CartItem[]) => {
  localStorage.setItem('cart', JSON.stringify(cart));
};

export const addToCart = (dish: { id: string; name: string; price: number; image_url: string }) => {
  const cart = getCart();
  const existingItem = cart.find(item => item.id === dish.id);
  
  if (existingItem) {
    existingItem.quantity += 1;
  } else {
    cart.push({ ...dish, quantity: 1 });
  }
  
  saveCart(cart);
  return cart;
};

export const updateCartItemQuantity = (id: string, quantity: number) => {
  const cart = getCart();
  const item = cart.find(item => item.id === id);
  
  if (item) {
    if (quantity <= 0) {
      const updatedCart = cart.filter(item => item.id !== id);
      saveCart(updatedCart);
      return updatedCart;
    }
    item.quantity = quantity;
    saveCart(cart);
  }
  
  return cart;
};

export const removeFromCart = (id: string) => {
  const cart = getCart();
  const updatedCart = cart.filter(item => item.id !== id);
  saveCart(updatedCart);
  return updatedCart;
};

export const clearCart = () => {
  localStorage.removeItem('cart');
};

export const getCartTotal = (cart: CartItem[]) => {
  return cart.reduce((total, item) => total + (item.price * item.quantity), 0);
};

export const getCartCount = (cart: CartItem[]) => {
  return cart.reduce((count, item) => count + item.quantity, 0);
};
