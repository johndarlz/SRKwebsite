import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { getCart, getCartTotal, clearCart, getCartCount } from "@/lib/cart";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const Checkout = () => {
  const navigate = useNavigate();
  const cart = getCart();
  const total = getCartTotal(cart);
  const cartCount = getCartCount(cart);
  
  const [deliveryType, setDeliveryType] = useState<string>("");
  const [gate, setGate] = useState<string>("");
  const [phone, setPhone] = useState("");
  const [studentName, setStudentName] = useState("");
  const [name, setName] = useState("");
  const [address1, setAddress1] = useState("");
  const [address2, setAddress2] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [pincode, setPincode] = useState("");
  const [loading, setLoading] = useState(false);

  const generateOrderId = () => {
    return `SRK${Math.floor(10000 + Math.random() * 90000)}`;
  };

  const handlePlaceOrder = async () => {
    if (!deliveryType) {
      toast.error('Please select a delivery option');
      return;
    }

    if (!phone) {
      toast.error('Please enter your mobile number');
      return;
    }

    if (deliveryType === 'university' && (!gate || !studentName)) {
      toast.error('Please fill all required fields');
      return;
    }

    if (deliveryType === 'address' && (!name || !address1 || !city || !state || !pincode)) {
      toast.error('Please fill all address fields');
      return;
    }

    setLoading(true);

    try {
      const orderId = generateOrderId();
      const deliveryDetails = deliveryType === 'university' 
        ? { gate, location: 'Chandigarh University', studentName }
        : { name, address1, address2, city, state, pincode };

      const { error } = await supabase
        .from('orders')
        .insert([{
          order_id: orderId,
          items: cart as any,
          customer_name: deliveryType === 'university' ? studentName : name,
          customer_phone: phone,
          delivery_type: deliveryType,
          delivery_details: deliveryDetails as any,
          total: total
        }]);

      if (error) throw error;

      clearCart();
      navigate(`/order-confirmation?orderId=${orderId}`);
      toast.success('Order placed successfully!');
    } catch (error) {
      console.error('Error placing order:', error);
      toast.error('Failed to place order. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (cart.length === 0) {
    navigate('/menu');
    return null;
  }

  return (
    <div className="min-h-screen bg-background pb-20 md:pb-0">
      <Navbar cartCount={cartCount} />
      
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl md:text-4xl font-bold mb-8">Checkout</h1>
        
        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <Card className="p-6">
              <h2 className="text-xl font-bold mb-6">Delivery Details</h2>
              
              <div className="space-y-6">
                <div>
                  <Label>Delivery Option *</Label>
                  <Select value={deliveryType} onValueChange={setDeliveryType}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select delivery option" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="university">Chandigarh University</SelectItem>
                      <SelectItem value="address">Add Address</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {deliveryType === 'university' && (
                  <>
                    <div>
                      <Label>Select Gate *</Label>
                      <Select value={gate} onValueChange={setGate}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select gate" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="gate1">Gate 1</SelectItem>
                          <SelectItem value="gate2">Gate 2</SelectItem>
                          <SelectItem value="gate3">Gate 3</SelectItem>
                          <SelectItem value="gate4">Gate 4</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label>Student Name *</Label>
                      <Input
                        placeholder="Enter your name"
                        value={studentName}
                        onChange={(e) => setStudentName(e.target.value)}
                      />
                    </div>
                    <div>
                      <Label>Mobile Number *</Label>
                      <Input
                        type="tel"
                        placeholder="Enter your mobile number"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                      />
                    </div>
                  </>
                )}

                {deliveryType === 'address' && (
                  <>
                    <div>
                      <Label>Full Name *</Label>
                      <Input
                        placeholder="Enter your name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                      />
                    </div>
                    <div>
                      <Label>Mobile Number *</Label>
                      <Input
                        type="tel"
                        placeholder="Enter your mobile number"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                      />
                    </div>
                    <div>
                      <Label>Address Line 1 *</Label>
                      <Input
                        placeholder="House/Flat No., Building Name"
                        value={address1}
                        onChange={(e) => setAddress1(e.target.value)}
                      />
                    </div>
                    <div>
                      <Label>Address Line 2</Label>
                      <Input
                        placeholder="Street, Area, Landmark (Optional)"
                        value={address2}
                        onChange={(e) => setAddress2(e.target.value)}
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label>City *</Label>
                        <Input
                          placeholder="City"
                          value={city}
                          onChange={(e) => setCity(e.target.value)}
                        />
                      </div>
                      <div>
                        <Label>State *</Label>
                        <Input
                          placeholder="State"
                          value={state}
                          onChange={(e) => setState(e.target.value)}
                        />
                      </div>
                    </div>
                    <div>
                      <Label>Pincode *</Label>
                      <Input
                        placeholder="Pincode"
                        value={pincode}
                        onChange={(e) => setPincode(e.target.value)}
                      />
                    </div>
                  </>
                )}
              </div>
            </Card>
          </div>
          
          <div>
            <Card className="p-6 sticky top-20">
              <h2 className="text-xl font-bold mb-4">Order Summary</h2>
              <div className="space-y-2 mb-4">
                {cart.map((item) => (
                  <div key={item.id} className="flex justify-between text-sm">
                    <span>{item.name} x{item.quantity}</span>
                    <span>₹{(item.price * item.quantity).toFixed(2)}</span>
                  </div>
                ))}
                <div className="border-t pt-2 mt-2">
                  <div className="flex justify-between font-bold text-lg">
                    <span>Total</span>
                    <span className="text-primary">₹{total.toFixed(2)}</span>
                  </div>
                </div>
              </div>
              <Button
                className="w-full bg-gradient-hero hover:opacity-90"
                size="lg"
                onClick={handlePlaceOrder}
                disabled={loading}
              >
                {loading ? 'Placing Order...' : 'Place Order (Cash on Delivery)'}
              </Button>
            </Card>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default Checkout;
