import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Minus, Plus, Trash2, ShoppingBag } from "lucide-react";
import { getCart, updateCartItemQuantity, removeFromCart, getCartTotal, getCartCount } from "@/lib/cart";
import { toast } from "sonner";

const Cart = () => {
  const [cart, setCart] = useState(getCart());
  const navigate = useNavigate();

  useEffect(() => {
    setCart(getCart());
  }, []);

  const handleUpdateQuantity = (id: string, newQuantity: number) => {
    const updatedCart = updateCartItemQuantity(id, newQuantity);
    setCart(updatedCart);
    toast.success('Cart updated');
  };

  const handleRemove = (id: string) => {
    const updatedCart = removeFromCart(id);
    setCart(updatedCart);
    toast.success('Item removed from cart');
  };

  const total = getCartTotal(cart);
  const cartCount = getCartCount(cart);

  if (cart.length === 0) {
    return (
      <div className="min-h-screen bg-background pb-20 md:pb-0">
        <Navbar cartCount={0} />
        <div className="container mx-auto px-4 py-16">
          <Card className="max-w-md mx-auto p-8 text-center">
            <ShoppingBag className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
            <h2 className="text-2xl font-bold mb-2">Your cart is empty</h2>
            <p className="text-muted-foreground mb-6">
              Add some delicious dishes to get started!
            </p>
            <Button onClick={() => navigate('/menu')} className="bg-gradient-hero">
              Browse Menu
            </Button>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-20 md:pb-0">
      <Navbar cartCount={cartCount} />
      
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl md:text-4xl font-bold mb-8">Your Cart</h1>
        
        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-4">
            {cart.map((item) => (
              <Card key={item.id} className="p-4">
                <div className="flex gap-4">
                  <img
                    src={item.image_url}
                    alt={item.name}
                    className="w-24 h-24 object-cover rounded-lg"
                  />
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg mb-1">{item.name}</h3>
                    <p className="text-primary font-bold mb-2">₹{item.price}</p>
                    <div className="flex items-center gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleUpdateQuantity(item.id, item.quantity - 1)}
                      >
                        <Minus className="w-4 h-4" />
                      </Button>
                      <span className="w-12 text-center font-medium">{item.quantity}</span>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleUpdateQuantity(item.id, item.quantity + 1)}
                      >
                        <Plus className="w-4 h-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => handleRemove(item.id)}
                        className="ml-auto"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
          
          <div>
            <Card className="p-6 sticky top-20">
              <h2 className="text-xl font-bold mb-4">Order Summary</h2>
              <div className="space-y-2 mb-4">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span className="font-medium">₹{total.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Delivery</span>
                  <span className="font-medium text-green-600">FREE</span>
                </div>
                <div className="border-t pt-2 mt-2">
                  <div className="flex justify-between">
                    <span className="font-semibold text-lg">Total</span>
                    <span className="font-bold text-xl text-primary">₹{total.toFixed(2)}</span>
                  </div>
                </div>
              </div>
              <Button
                className="w-full bg-gradient-hero hover:opacity-90"
                size="lg"
                onClick={() => navigate('/checkout')}
              >
                Proceed to Checkout
              </Button>
              <p className="text-xs text-center text-muted-foreground mt-4">
                Cash on Delivery Available
              </p>
            </Card>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default Cart;
