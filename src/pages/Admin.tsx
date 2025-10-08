import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Package, Plus, TrendingUp, Upload, Store, Trash2 } from "lucide-react";

const Admin = () => {
  const navigate = useNavigate();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState("");
  const [orders, setOrders] = useState<any[]>([]);
  const [dishes, setDishes] = useState<any[]>([]);
  const [stats, setStats] = useState({ total: 0, pending: 0, delivered: 0 });
  const [isShopOpen, setIsShopOpen] = useState(true);
  
  // Add Dish Form
  const [dishName, setDishName] = useState("");
  const [dishCategory, setDishCategory] = useState("");
  const [dishPrice, setDishPrice] = useState("");
  const [dishImage, setDishImage] = useState<File | null>(null);
  const [dishDescription, setDishDescription] = useState("");
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    const auth = sessionStorage.getItem('adminAuth');
    if (auth === 'true') {
      setIsAuthenticated(true);
      fetchOrders();
      fetchDishes();
      fetchShopStatus();
    }
  }, []);

  const handleLogin = () => {
    if (password === 'Admin@1234') {
      setIsAuthenticated(true);
      sessionStorage.setItem('adminAuth', 'true');
      toast.success('Login successful!');
      fetchOrders();
      fetchDishes();
      fetchShopStatus();
    } else {
      toast.error('Invalid password');
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    sessionStorage.removeItem('adminAuth');
    toast.success('Logged out successfully');
  };

  const fetchShopStatus = async () => {
    const { data, error } = await supabase
      .from('shop_settings')
      .select('is_open')
      .single();
    
    if (!error && data) {
      setIsShopOpen(data.is_open);
    }
  };

  const handleShopToggle = async (checked: boolean) => {
    const { error } = await supabase
      .from('shop_settings')
      .update({ is_open: checked, updated_at: new Date().toISOString() })
      .eq('id', (await supabase.from('shop_settings').select('id').single()).data?.id);

    if (error) {
      console.error('Error updating shop status:', error);
      toast.error('Failed to update shop status');
      return;
    }

    setIsShopOpen(checked);
    toast.success(checked ? 'Shop is now OPEN' : 'Shop is now CLOSED');
  };

  const fetchOrders = async () => {
    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('Error fetching orders:', error);
      return;
    }
    
    setOrders(data || []);
    
    const total = data?.length || 0;
    const pending = data?.filter(o => o.status === 'Pending').length || 0;
    const delivered = data?.filter(o => o.status === 'Delivered').length || 0;
    
    setStats({ total, pending, delivered });
  };

  const fetchDishes = async () => {
    const { data, error } = await supabase
      .from('dishes')
      .select('*')
      .order('category');
    
    if (error) {
      console.error('Error fetching dishes:', error);
      return;
    }
    
    setDishes(data || []);
  };

  const handleImageUpload = async (file: File): Promise<string | null> => {
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random().toString(36).substring(2)}-${Date.now()}.${fileExt}`;
      const filePath = fileName;

      const { error: uploadError } = await supabase.storage
        .from('dish-images')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data } = supabase.storage
        .from('dish-images')
        .getPublicUrl(filePath);

      return data.publicUrl;
    } catch (error) {
      console.error('Error uploading image:', error);
      toast.error('Failed to upload image');
      return null;
    }
  };

  const handleAddDish = async () => {
    if (!dishName || !dishCategory || !dishPrice || !dishImage) {
      toast.error('Please fill all required fields and upload an image');
      return;
    }

    setUploading(true);

    const imageUrl = await handleImageUpload(dishImage);
    if (!imageUrl) {
      setUploading(false);
      return;
    }

    const { error } = await supabase
      .from('dishes')
      .insert([{
        name: dishName,
        category: dishCategory,
        price: parseFloat(dishPrice),
        image_url: imageUrl,
        description: dishDescription,
        in_stock: true
      }]);

    if (error) {
      console.error('Error adding dish:', error);
      toast.error('Failed to add dish');
      setUploading(false);
      return;
    }

    toast.success('Dish added successfully!');
    setDishName('');
    setDishCategory('');
    setDishPrice('');
    setDishImage(null);
    setDishDescription('');
    setUploading(false);
    fetchDishes();
  };

  const handleToggleStock = async (dishId: string, currentStatus: boolean) => {
    const { error } = await supabase
      .from('dishes')
      .update({ in_stock: !currentStatus })
      .eq('id', dishId);

    if (error) {
      console.error('Error updating stock:', error);
      toast.error('Failed to update stock status');
      return;
    }

    toast.success(!currentStatus ? 'Dish is now in stock' : 'Dish marked as out of stock');
    fetchDishes();
  };

  const handleDeleteDish = async (dishId: string) => {
    if (!confirm('Are you sure you want to delete this dish?')) return;

    const { error } = await supabase
      .from('dishes')
      .delete()
      .eq('id', dishId);

    if (error) {
      console.error('Error deleting dish:', error);
      toast.error('Failed to delete dish');
      return;
    }

    toast.success('Dish deleted successfully');
    fetchDishes();
  };

  const handleUpdateOrderStatus = async (orderId: string, newStatus: string) => {
    const { error } = await supabase
      .from('orders')
      .update({ status: newStatus })
      .eq('id', orderId);

    if (error) {
      console.error('Error updating order:', error);
      toast.error('Failed to update order status');
      return;
    }

    toast.success('Order status updated!');
    fetchOrders();
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-background pb-20 md:pb-0">
        <Navbar />
        
        <div className="container mx-auto px-4 py-16">
          <Card className="max-w-md mx-auto p-8">
            <h1 className="text-2xl font-bold mb-6 text-center">Admin Login</h1>
            <div className="space-y-4">
              <div>
                <Label>Password</Label>
                <Input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleLogin()}
                  placeholder="Enter admin password"
                />
              </div>
              <Button
                className="w-full bg-gradient-hero"
                onClick={handleLogin}
              >
                Login
              </Button>
              
            </div>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-20 md:pb-0">
      <Navbar />
      
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl md:text-4xl font-bold">Admin Dashboard</h1>
          <Button variant="outline" onClick={handleLogout}>
            Logout
          </Button>
        </div>

        {/* Shop Status Toggle */}
        <Card className="p-6 mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Store className="w-6 h-6 text-primary" />
              <div>
                <h3 className="font-semibold text-lg">Shop Status</h3>
                <p className="text-sm text-muted-foreground">
                  {isShopOpen ? 'Shop is currently open' : 'Shop is currently closed'}
                </p>
              </div>
            </div>
            <Switch
              checked={isShopOpen}
              onCheckedChange={handleShopToggle}
            />
          </div>
        </Card>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Orders</p>
                <p className="text-3xl font-bold">{stats.total}</p>
              </div>
              <Package className="w-10 h-10 text-primary" />
            </div>
          </Card>
          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Pending Orders</p>
                <p className="text-3xl font-bold text-yellow-600">{stats.pending}</p>
              </div>
              <TrendingUp className="w-10 h-10 text-yellow-600" />
            </div>
          </Card>
          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Delivered</p>
                <p className="text-3xl font-bold text-green-600">{stats.delivered}</p>
              </div>
              <Package className="w-10 h-10 text-green-600" />
            </div>
          </Card>
        </div>

        <Tabs defaultValue="orders" className="space-y-6">
          <TabsList className="grid w-full max-w-md grid-cols-3">
            <TabsTrigger value="orders">Orders</TabsTrigger>
            <TabsTrigger value="add-dish">Add Dish</TabsTrigger>
            <TabsTrigger value="manage-dishes">Manage Dishes</TabsTrigger>
          </TabsList>

          <TabsContent value="orders" className="space-y-4">
            <h2 className="text-2xl font-bold mb-4">All Orders</h2>
            {orders.map((order) => (
              <Card key={order.id} className="p-6">
                <div className="space-y-4">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                      <p className="text-sm text-muted-foreground">Order ID</p>
                      <p className="font-bold text-lg">{order.order_id}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Select
                        value={order.status}
                        onValueChange={(value) => handleUpdateOrderStatus(order.id, value)}
                      >
                        <SelectTrigger className="w-[180px]">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Pending">Pending</SelectItem>
                          <SelectItem value="Cooking">Cooking</SelectItem>
                          <SelectItem value="Out for Delivery">Out for Delivery</SelectItem>
                          <SelectItem value="Delivered">Delivered</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm font-semibold mb-1">Customer</p>
                      <p className="text-sm">{order.customer_name}</p>
                      <p className="text-sm text-muted-foreground">{order.customer_phone}</p>
                    </div>
                    <div>
                      <p className="text-sm font-semibold mb-1">Delivery</p>
                      <p className="text-sm">
                        {order.delivery_type === 'university' 
                          ? `CU - ${order.delivery_details.gate?.replace('gate', 'Gate ')}`
                          : `${order.delivery_details.city}, ${order.delivery_details.state}`
                        }
                      </p>
                    </div>
                  </div>

                  <div>
                    <p className="text-sm font-semibold mb-1">Items</p>
                    {order.items.map((item: any, idx: number) => (
                      <p key={idx} className="text-sm">
                        {item.name} x{item.quantity} - ₹{(item.price * item.quantity).toFixed(2)}
                      </p>
                    ))}
                  </div>

                  <div className="flex justify-between items-center border-t pt-4">
                    <span className="font-semibold">Total</span>
                    <span className="text-xl font-bold text-primary">₹{order.total.toFixed(2)}</span>
                  </div>
                </div>
              </Card>
            ))}
          </TabsContent>

          <TabsContent value="add-dish">
            <Card className="p-6 max-w-2xl">
              <h2 className="text-2xl font-bold mb-6">Add New Dish</h2>
              <div className="space-y-4">
                <div>
                  <Label>Dish Name *</Label>
                  <Input
                    value={dishName}
                    onChange={(e) => setDishName(e.target.value)}
                    placeholder="e.g., Masala Dosa"
                  />
                </div>

                <div>
                  <Label>Category *</Label>
                  <Select value={dishCategory} onValueChange={setDishCategory}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Breakfast">Breakfast</SelectItem>
                      <SelectItem value="Lunch">Lunch</SelectItem>
                      <SelectItem value="Dinner">Dinner</SelectItem>
                      <SelectItem value="Biryani">Biryani</SelectItem>
                      <SelectItem value="Sweets">Sweets</SelectItem>
                      <SelectItem value="Beverages">Beverages</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>Price (₹) *</Label>
                  <Input
                    type="number"
                    value={dishPrice}
                    onChange={(e) => setDishPrice(e.target.value)}
                    placeholder="e.g., 80.00"
                  />
                </div>

                <div>
                  <Label>Upload Image *</Label>
                  <div className="mt-2">
                    <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer hover:bg-accent/50">
                      <div className="flex flex-col items-center justify-center pt-5 pb-6">
                        <Upload className="w-8 h-8 mb-2 text-muted-foreground" />
                        <p className="text-sm text-muted-foreground">
                          {dishImage ? dishImage.name : 'Click to upload dish image'}
                        </p>
                      </div>
                      <input
                        type="file"
                        className="hidden"
                        accept="image/*"
                        onChange={(e) => setDishImage(e.target.files?.[0] || null)}
                      />
                    </label>
                  </div>
                </div>

                <div>
                  <Label>Description</Label>
                  <Input
                    value={dishDescription}
                    onChange={(e) => setDishDescription(e.target.value)}
                    placeholder="Brief description of the dish"
                  />
                </div>

                <Button
                  className="w-full bg-gradient-hero"
                  onClick={handleAddDish}
                  disabled={uploading}
                >
                  <Plus className="w-4 h-4 mr-2" />
                  {uploading ? 'Adding Dish...' : 'Add Dish'}
                </Button>
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="manage-dishes" className="space-y-4">
            <h2 className="text-2xl font-bold mb-4">Manage Dishes</h2>
            <div className="grid gap-4">
              {dishes.map((dish) => (
                <Card key={dish.id} className="p-4">
                  <div className="flex items-center gap-4">
                    <img 
                      src={dish.image_url} 
                      alt={dish.name}
                      className="w-20 h-20 object-cover rounded-lg"
                    />
                    <div className="flex-1">
                      <h3 className="font-semibold">{dish.name}</h3>
                      <p className="text-sm text-muted-foreground">{dish.category}</p>
                      <p className="text-sm font-bold text-primary">₹{dish.price}</p>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="flex items-center space-x-2">
                        <Label htmlFor={`stock-${dish.id}`} className="text-sm">
                          {dish.in_stock ? 'In Stock' : 'Out of Stock'}
                        </Label>
                        <Switch
                          id={`stock-${dish.id}`}
                          checked={dish.in_stock}
                          onCheckedChange={() => handleToggleStock(dish.id, dish.in_stock)}
                        />
                      </div>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleDeleteDish(dish.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>
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

export default Admin;
