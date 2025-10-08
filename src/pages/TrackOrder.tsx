import { useState } from "react";
import Navbar from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Package, Clock, Truck, CheckCircle } from "lucide-react";

const TrackOrder = () => {
  const [orderId, setOrderId] = useState("");
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const handleTrackOrder = async () => {
    if (!orderId.trim()) {
      toast.error('Please enter your order ID');
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .eq('order_id', orderId.toUpperCase())
        .single();

      if (error) throw error;

      if (!data) {
        toast.error('Order not found');
        setOrder(null);
        return;
      }

      setOrder(data);
    } catch (error) {
      console.error('Error tracking order:', error);
      toast.error('Order not found. Please check your Order ID.');
      setOrder(null);
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Pending':
        return <Clock className="w-8 h-8 text-yellow-500" />;
      case 'Cooking':
        return <Package className="w-8 h-8 text-orange-500" />;
      case 'Out for Delivery':
        return <Truck className="w-8 h-8 text-blue-500" />;
      case 'Delivered':
        return <CheckCircle className="w-8 h-8 text-green-500" />;
      default:
        return <Clock className="w-8 h-8 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'Cooking':
        return 'bg-orange-100 text-orange-800';
      case 'Out for Delivery':
        return 'bg-blue-100 text-blue-800';
      case 'Delivered':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="min-h-screen bg-background pb-20 md:pb-0">
      <Navbar />
      
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <h1 className="text-3xl md:text-4xl font-bold mb-8 text-center">Track Your Order</h1>
          
          <Card className="p-6 mb-8">
            <Label htmlFor="orderId">Enter Order ID</Label>
            <div className="flex gap-2 mt-2">
              <Input
                id="orderId"
                placeholder="e.g., SRK12345"
                value={orderId}
                onChange={(e) => setOrderId(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleTrackOrder()}
              />
              <Button
                onClick={handleTrackOrder}
                disabled={loading}
                className="bg-gradient-hero"
              >
                {loading ? 'Tracking...' : 'Track'}
              </Button>
            </div>
          </Card>

          {order && (
            <Card className="p-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <p className="text-sm text-muted-foreground">Order ID</p>
                  <p className="text-xl font-bold">{order.order_id}</p>
                </div>
                <div className={`px-4 py-2 rounded-full font-semibold ${getStatusColor(order.status)}`}>
                  {order.status}
                </div>
              </div>

              <div className="flex justify-center mb-8">
                {getStatusIcon(order.status)}
              </div>

              <div className="space-y-4 mb-6">
                <div className="border-b pb-4">
                  <h3 className="font-semibold mb-2">Order Items</h3>
                  {order.items.map((item: any, index: number) => (
                    <div key={index} className="flex justify-between text-sm">
                      <span>{item.name} x{item.quantity}</span>
                      <span>₹{(item.price * item.quantity).toFixed(2)}</span>
                    </div>
                  ))}
                </div>

                <div className="border-b pb-4">
                  <h3 className="font-semibold mb-2">Delivery Details</h3>
                  <p className="text-sm text-muted-foreground">
                    {order.delivery_type === 'university' 
                      ? `Chandigarh University - ${order.delivery_details.gate.replace('gate', 'Gate ')}`
                      : `${order.delivery_details.address1}, ${order.delivery_details.city}, ${order.delivery_details.state} - ${order.delivery_details.pincode}`
                    }
                  </p>
                  <p className="text-sm text-muted-foreground mt-1">
                    Phone: {order.customer_phone}
                  </p>
                </div>

                <div className="flex justify-between items-center">
                  <span className="font-semibold">Total Amount</span>
                  <span className="text-xl font-bold text-primary">₹{order.total.toFixed(2)}</span>
                </div>
              </div>

              <div className="bg-accent/30 rounded-lg p-4">
                <p className="text-sm text-center">
                  {order.status === 'Delivered' 
                    ? '✅ Your order has been delivered. Enjoy your meal!'
                    : order.status === 'Out for Delivery'
                    ? '🚚 Your order is on the way!'
                    : order.status === 'Cooking'
                    ? '👨‍🍳 Your delicious food is being prepared!'
                    : '⏳ Your order has been received and will be processed soon.'
                  }
                </p>
              </div>
            </Card>
          )}
        </div>
      </div>

      <footer className="bg-primary text-primary-foreground py-8 mt-16">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="grid md:grid-cols-3 gap-8 mb-6">
              <div>
                <h3 className="font-semibold mb-2">Contact</h3>
                <p className="text-sm">Phone: +91 98765 43210</p>
                <p className="text-sm">Email: contact@srkhouse.com</p>
              </div>
              <div>
                <h3 className="font-semibold mb-2">Location</h3>
                <p className="text-sm">Near Chandigarh University</p>
                <p className="text-sm">Punjab, India</p>
              </div>
              <div>
                <h3 className="font-semibold mb-2">Hours</h3>
                <p className="text-sm">Mon - Sun</p>
                <p className="text-sm">8:00 AM - 11:00 PM</p>
              </div>
            </div>
            <div className="text-center border-t border-primary-foreground/20 pt-6">
              <p className="text-lg">
                © 2025 SRK House | Made with ❤️ by{" "}
                <span className="font-semibold">Finitix</span>
              </p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default TrackOrder;
