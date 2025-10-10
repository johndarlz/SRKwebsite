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
import { Package, Plus, TrendingUp, Upload, Store, Trash2, DollarSign, Calendar, BarChart3, Check, X } from "lucide-react";

const Admin = () => {
  const navigate = useNavigate();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState("");
  const [orders, setOrders] = useState<any[]>([]);
  const [dishes, setDishes] = useState<any[]>([]);
  const [stats, setStats] = useState({ total: 0, pending: 0, delivered: 0, todayRevenue: 0 });
  const [isShopOpen, setIsShopOpen] = useState(true);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [dailyRevenues, setDailyRevenues] = useState<any[]>([]);
  const [analysisFilter, setAnalysisFilter] = useState("7days");
  const [customStartDate, setCustomStartDate] = useState("");
  const [customEndDate, setCustomEndDate] = useState("");
  
  // Add Dish Form
  const [dishName, setDishName] = useState("");
  const [dishCategory, setDishCategory] = useState("");
  const [dishCategories, setDishCategories] = useState<string[]>([]);
  const [dishOriginalPrice, setDishOriginalPrice] = useState("");
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
      fetchDailyRevenues();
      checkAndStoreDailyRevenue();
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
      fetchDailyRevenues();
      checkAndStoreDailyRevenue();
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
    
    // Calculate today's revenue only
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayRevenue = data?.filter(o => {
      if (o.status !== 'Delivered') return false;
      const orderDate = new Date(o.created_at);
      orderDate.setHours(0, 0, 0, 0);
      return orderDate.getTime() === today.getTime();
    }).reduce((sum, o) => sum + o.total, 0) || 0;
    
    setStats({ total, pending, delivered, todayRevenue });
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
    if (!dishName || dishCategories.length === 0 || !dishPrice || !dishImage) {
      toast.error('Please fill all required fields, select at least one category, and upload an image');
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
        category: dishCategories[0], // Keep first category for backward compatibility
        categories: dishCategories, // New array field
        original_price: dishOriginalPrice ? parseFloat(dishOriginalPrice) : null,
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
    setDishCategories([]);
    setDishOriginalPrice('');
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

  const fetchDailyRevenues = async () => {
    const { data, error } = await supabase
      .from('daily_revenues')
      .select('*')
      .order('date', { ascending: false });
    
    if (error) {
      console.error('Error fetching daily revenues:', error);
      return;
    }
    
    setDailyRevenues(data || []);
  };

  const checkAndStoreDailyRevenue = async () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayStr = today.toISOString().split('T')[0];
    
    // Check if today's revenue is already stored
    const { data: existingRevenue } = await supabase
      .from('daily_revenues')
      .select('*')
      .eq('date', todayStr)
      .single();
    
    if (!existingRevenue) {
      // Get yesterday's delivered orders
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);
      const yesterdayStr = yesterday.toISOString().split('T')[0];
      
      const { data: yesterdayOrders } = await supabase
        .from('orders')
        .select('*')
        .eq('status', 'Delivered')
        .gte('created_at', yesterdayStr)
        .lt('created_at', todayStr);
      
      if (yesterdayOrders && yesterdayOrders.length > 0) {
        const revenue = yesterdayOrders.reduce((sum, o) => sum + o.total, 0);
        
        await supabase
          .from('daily_revenues')
          .insert([{
            date: yesterdayStr,
            revenue: revenue,
            orders_count: yesterdayOrders.length
          }]);
        
        fetchDailyRevenues();
      }
    }
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

    // Show appropriate success message based on status
    if (newStatus === 'Rejected') {
      toast.error('❌ Order rejected');
    } else if (newStatus === 'Cooking') {
      toast.success('✅ Order accepted!');
    } else if (newStatus === 'Delivered') {
      toast.success('✅ Order marked as delivered!');
    } else {
      toast.success('Order status updated!');
    }
    
    fetchOrders();
  };

  const getTodayRevenueData = () => {
    // Get today's delivered orders count
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayOrders = orders.filter(o => {
      if (o.status !== 'Delivered') return false;
      const orderDate = new Date(o.created_at);
      orderDate.setHours(0, 0, 0, 0);
      return orderDate.getTime() === today.getTime();
    });
    
    return {
      id: 'today',
      date: today.toISOString().split('T')[0],
      revenue: stats.todayRevenue,
      orders_count: todayOrders.length,
      isToday: true
    };
  };

  const getFilteredRevenues = () => {
    const now = new Date();
    let filteredData = [...dailyRevenues];
    
    switch (analysisFilter) {
      case '7days':
        const sevenDaysAgo = new Date(now);
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
        filteredData = dailyRevenues.filter(r => new Date(r.date) >= sevenDaysAgo);
        break;
      case '6months':
        const sixMonthsAgo = new Date(now);
        sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
        filteredData = dailyRevenues.filter(r => new Date(r.date) >= sixMonthsAgo);
        break;
      case '1year':
        const oneYearAgo = new Date(now);
        oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);
        filteredData = dailyRevenues.filter(r => new Date(r.date) >= oneYearAgo);
        break;
      case 'custom':
        if (customStartDate || customEndDate) {
          filteredData = dailyRevenues.filter(r => {
            const date = new Date(r.date);
            if (customStartDate && date < new Date(customStartDate)) return false;
            if (customEndDate && date > new Date(customEndDate)) return false;
            return true;
          });
        }
        break;
    }
    
    // Add today's data at the beginning
    const todayData = getTodayRevenueData();
    return [todayData, ...filteredData];
  };

  const calculateTotalRevenue = (revenues: any[]) => {
    return revenues.reduce((sum, r) => sum + r.revenue, 0);
  };

  const calculateTotalOrders = (revenues: any[]) => {
    return revenues.reduce((sum, r) => sum + r.orders_count, 0);
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
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
          <Card className="p-6 bg-gradient-to-r from-green-500 to-emerald-600 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm opacity-90">Today's Revenue</p>
                <p className="text-3xl font-bold">₹{stats.todayRevenue.toFixed(2)}</p>
              </div>
              <DollarSign className="w-10 h-10 opacity-80" />
            </div>
          </Card>
        </div>

        <Tabs defaultValue="orders" className="space-y-6">
          <TabsList className="grid w-full max-w-3xl grid-cols-5">
            <TabsTrigger value="orders">New Orders</TabsTrigger>
            <TabsTrigger value="complete-orders">All Orders</TabsTrigger>
            <TabsTrigger value="payment-analysis">Payment Analysis</TabsTrigger>
            <TabsTrigger value="add-dish">Add Dish</TabsTrigger>
            <TabsTrigger value="manage-dishes">Manage Dishes</TabsTrigger>
          </TabsList>

          <TabsContent value="orders" className="space-y-4">
            <h2 className="text-2xl font-bold mb-4">New Orders (Pending & In Progress)</h2>
            {orders.filter(order => order.status !== 'Delivered' && order.status !== 'Rejected').map((order) => (
              <Card key={order.id} className="p-6">
                <div className="space-y-4">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                      <p className="text-sm text-muted-foreground">Order ID</p>
                      <p className="font-bold text-lg">{order.order_id}</p>
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                      {order.status === 'Pending' && (
                        <>
                          <Button
                            size="sm"
                            variant="default"
                            className="bg-green-600 hover:bg-green-700"
                            onClick={() => handleUpdateOrderStatus(order.id, 'Cooking')}
                          >
                            <Check className="w-4 h-4 mr-1" />
                            Accept
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => handleUpdateOrderStatus(order.id, 'Rejected')}
                          >
                            <X className="w-4 h-4 mr-1" />
                            Reject
                          </Button>
                        </>
                      )}
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
                          <SelectItem value="Rejected">Rejected</SelectItem>
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

          <TabsContent value="complete-orders" className="space-y-4">
            <div className="flex flex-col md:flex-row gap-4 mb-6">
              <div className="flex-1">
                <h2 className="text-2xl font-bold mb-4">All Orders (Delivered, Rejected & All)</h2>
              </div>
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-muted-foreground" />
                  <div className="flex flex-col">
                    <Label className="text-xs mb-1">Start Date</Label>
                    <Input
                      type="date"
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                      className="w-full md:w-auto"
                    />
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-muted-foreground" />
                  <div className="flex flex-col">
                    <Label className="text-xs mb-1">End Date</Label>
                    <Input
                      type="date"
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                      className="w-full md:w-auto"
                    />
                  </div>
                </div>
                {(startDate || endDate) && (
                  <Button
                    variant="outline"
                    onClick={() => {
                      setStartDate("");
                      setEndDate("");
                    }}
                    className="self-end"
                  >
                    Clear Filters
                  </Button>
                )}
              </div>
            </div>
            
            {orders
              .filter(order => {
                // Show all orders, but apply date filter if set
                if (startDate || endDate) {
                  const orderDate = new Date(order.created_at);
                  const start = startDate ? new Date(startDate) : null;
                  const end = endDate ? new Date(endDate) : null;
                  
                  if (start && orderDate < start) return false;
                  if (end) {
                    const endOfDay = new Date(end);
                    endOfDay.setHours(23, 59, 59, 999);
                    if (orderDate > endOfDay) return false;
                  }
                }
                
                return true;
              })
              .map((order) => (
              <Card key={order.id} className={`p-6 ${
                order.status === 'Delivered' ? 'border-green-200 bg-green-50/50' : 
                order.status === 'Rejected' ? 'border-red-200 bg-red-50/50' : 
                'border-blue-200 bg-blue-50/50'
              }`}>
                <div className="space-y-4">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                      <p className="text-sm text-muted-foreground">Order ID</p>
                      <p className="font-bold text-lg">{order.order_id}</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {new Date(order.created_at).toLocaleDateString('en-IN', {
                          day: '2-digit',
                          month: 'short',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`px-4 py-2 rounded-lg font-semibold ${
                        order.status === 'Delivered' ? 'bg-green-600 text-white' :
                        order.status === 'Rejected' ? 'bg-red-600 text-white' :
                        order.status === 'Out for Delivery' ? 'bg-blue-600 text-white' :
                        order.status === 'Cooking' ? 'bg-orange-600 text-white' :
                        'bg-yellow-600 text-white'
                      }`}>
                        {order.status}
                      </span>
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
                    <span className={`text-xl font-bold ${
                      order.status === 'Delivered' ? 'text-green-600' :
                      order.status === 'Rejected' ? 'text-red-600' :
                      'text-primary'
                    }`}>₹{order.total.toFixed(2)}</span>
                  </div>
                </div>
              </Card>
            ))}
            
            {orders.filter(order => {
              // Show all orders with date filter
              if (startDate || endDate) {
                const orderDate = new Date(order.created_at);
                const start = startDate ? new Date(startDate) : null;
                const end = endDate ? new Date(endDate) : null;
                
                if (start && orderDate < start) return false;
                if (end) {
                  const endOfDay = new Date(end);
                  endOfDay.setHours(23, 59, 59, 999);
                  if (orderDate > endOfDay) return false;
                }
              }
              
              return true;
            }).length === 0 && (
              <Card className="p-8 text-center">
                <Package className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
                <p className="text-lg text-muted-foreground">No orders found</p>
                {(startDate || endDate) && (
                  <p className="text-sm text-muted-foreground mt-2">Try adjusting the date filters</p>
                )}
              </Card>
            )}
          </TabsContent>

          <TabsContent value="payment-analysis" className="space-y-6">
            <div className="flex flex-col md:flex-row gap-4 mb-6 items-start md:items-center justify-between">
              <h2 className="text-2xl font-bold">Payment Analysis</h2>
              <div className="flex flex-wrap gap-2">
                <Button
                  variant={analysisFilter === '7days' ? 'default' : 'outline'}
                  onClick={() => setAnalysisFilter('7days')}
                  size="sm"
                >
                  Last 7 Days
                </Button>
                <Button
                  variant={analysisFilter === '6months' ? 'default' : 'outline'}
                  onClick={() => setAnalysisFilter('6months')}
                  size="sm"
                >
                  Last 6 Months
                </Button>
                <Button
                  variant={analysisFilter === '1year' ? 'default' : 'outline'}
                  onClick={() => setAnalysisFilter('1year')}
                  size="sm"
                >
                  Last 1 Year
                </Button>
                <Button
                  variant={analysisFilter === 'custom' ? 'default' : 'outline'}
                  onClick={() => setAnalysisFilter('custom')}
                  size="sm"
                >
                  Custom Range
                </Button>
              </div>
            </div>

            {analysisFilter === 'custom' && (
              <Card className="p-4">
                <div className="flex flex-col md:flex-row gap-4">
                  <div className="flex-1">
                    <Label className="text-xs mb-1">Start Date</Label>
                    <Input
                      type="date"
                      value={customStartDate}
                      onChange={(e) => setCustomStartDate(e.target.value)}
                    />
                  </div>
                  <div className="flex-1">
                    <Label className="text-xs mb-1">End Date</Label>
                    <Input
                      type="date"
                      value={customEndDate}
                      onChange={(e) => setCustomEndDate(e.target.value)}
                    />
                  </div>
                  {(customStartDate || customEndDate) && (
                    <Button
                      variant="outline"
                      onClick={() => {
                        setCustomStartDate("");
                        setCustomEndDate("");
                      }}
                      className="self-end"
                    >
                      Clear
                    </Button>
                  )}
                </div>
              </Card>
            )}

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card className="p-6 bg-gradient-to-br from-blue-500 to-blue-600 text-white">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm opacity-90">Total Revenue</p>
                    <p className="text-3xl font-bold">₹{calculateTotalRevenue(getFilteredRevenues()).toFixed(2)}</p>
                  </div>
                  <DollarSign className="w-10 h-10 opacity-80" />
                </div>
              </Card>
              <Card className="p-6 bg-gradient-to-br from-purple-500 to-purple-600 text-white">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm opacity-90">Total Orders</p>
                    <p className="text-3xl font-bold">{calculateTotalOrders(getFilteredRevenues())}</p>
                  </div>
                  <Package className="w-10 h-10 opacity-80" />
                </div>
              </Card>
              <Card className="p-6 bg-gradient-to-br from-orange-500 to-orange-600 text-white">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm opacity-90">Average Order Value</p>
                    <p className="text-3xl font-bold">
                      ₹{calculateTotalOrders(getFilteredRevenues()) > 0 
                        ? (calculateTotalRevenue(getFilteredRevenues()) / calculateTotalOrders(getFilteredRevenues())).toFixed(2)
                        : '0.00'
                      }
                    </p>
                  </div>
                  <BarChart3 className="w-10 h-10 opacity-80" />
                </div>
              </Card>
            </div>

            {/* Daily Revenue Table */}
            <Card className="p-6">
              <h3 className="text-xl font-bold mb-4">Daily Revenue Breakdown</h3>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-3 px-4 font-semibold">Date</th>
                      <th className="text-left py-3 px-4 font-semibold">Orders</th>
                      <th className="text-left py-3 px-4 font-semibold">Revenue</th>
                      <th className="text-left py-3 px-4 font-semibold">Avg Order</th>
                    </tr>
                  </thead>
                  <tbody>
                    {getFilteredRevenues().map((revenue) => (
                      <tr key={revenue.id} className={`border-b hover:bg-accent/50 ${revenue.isToday ? 'bg-green-50' : ''}`}>
                        <td className="py-3 px-4">
                          {revenue.isToday && (
                            <span className="inline-block px-2 py-1 text-xs font-semibold text-white bg-green-600 rounded mr-2">
                              TODAY
                            </span>
                          )}
                          {new Date(revenue.date).toLocaleDateString('en-IN', {
                            day: '2-digit',
                            month: 'short',
                            year: 'numeric'
                          })}
                        </td>
                        <td className="py-3 px-4">{revenue.orders_count}</td>
                        <td className="py-3 px-4 font-semibold text-green-600">₹{revenue.revenue.toFixed(2)}</td>
                        <td className="py-3 px-4">₹{revenue.orders_count > 0 ? (revenue.revenue / revenue.orders_count).toFixed(2) : '0.00'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {getFilteredRevenues().length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">
                    <BarChart3 className="w-16 h-16 mx-auto mb-4 opacity-50" />
                    <p>No revenue data available for the selected period</p>
                  </div>
                )}
              </div>
            </Card>

            {/* Revenue Graph */}
            <Card className="p-6">
              <h3 className="text-xl font-bold mb-4">Revenue Trend</h3>
              <div className="space-y-2">
                {getFilteredRevenues().length > 0 ? (
                  <>
                    {(() => {
                      const revenues = getFilteredRevenues();
                      const maxRevenue = Math.max(...revenues.map(r => r.revenue));
                      return revenues.map((revenue) => (
                        <div key={revenue.id} className="space-y-1">
                          <div className="flex items-center justify-between text-sm">
                            <span className="font-medium min-w-[100px]">
                              {revenue.isToday ? (
                                <span className="text-green-600 font-semibold">Today</span>
                              ) : (
                                new Date(revenue.date).toLocaleDateString('en-IN', {
                                  day: '2-digit',
                                  month: 'short'
                                })
                              )}
                            </span>
                            <span className="text-muted-foreground text-xs">
                              {revenue.orders_count} orders
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <div className="flex-1 bg-gray-200 rounded-full h-8 overflow-hidden">
                              <div
                                className={`h-full flex items-center justify-end pr-3 text-white text-sm font-semibold transition-all duration-500 ${
                                  revenue.isToday 
                                    ? 'bg-gradient-to-r from-green-500 to-emerald-600' 
                                    : 'bg-gradient-to-r from-blue-500 to-blue-600'
                                }`}
                                style={{
                                  width: `${maxRevenue > 0 ? (revenue.revenue / maxRevenue) * 100 : 0}%`,
                                  minWidth: revenue.revenue > 0 ? '60px' : '0'
                                }}
                              >
                                {revenue.revenue > 0 && `₹${revenue.revenue.toFixed(0)}`}
                              </div>
                            </div>
                            <span className="text-sm font-bold text-primary min-w-[80px] text-right">
                              ₹{revenue.revenue.toFixed(2)}
                            </span>
                          </div>
                        </div>
                      ));
                    })()}
                  </>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <BarChart3 className="w-16 h-16 mx-auto mb-4 opacity-50" />
                    <p>No revenue data available for the selected period</p>
                  </div>
                )}
              </div>
            </Card>
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
                  <Label>Categories * (Select multiple)</Label>
                  <div className="flex flex-wrap gap-2 p-3 border rounded-md min-h-[42px]">
                    {['Breakfast', 'Lunch', 'Dinner', 'Biryani', 'Sweets', 'Beverages'].map((cat) => (
                      <button
                        key={cat}
                        type="button"
                        onClick={() => {
                          if (dishCategories.includes(cat)) {
                            setDishCategories(dishCategories.filter(c => c !== cat));
                          } else {
                            setDishCategories([...dishCategories, cat]);
                          }
                        }}
                        className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                          dishCategories.includes(cat)
                            ? 'bg-primary text-primary-foreground'
                            : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
                        }`}
                      >
                        {cat}
                      </button>
                    ))}
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    Selected: {dishCategories.length > 0 ? dishCategories.join(', ') : 'None'}
                  </p>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Label>Original Price (₹)</Label>
                    <Input
                      type="number"
                      value={dishOriginalPrice}
                      onChange={(e) => setDishOriginalPrice(e.target.value)}
                      placeholder="e.g., 300.00"
                    />
                    <p className="text-xs text-muted-foreground mt-1">Leave empty if no discount</p>
                  </div>
                  <div>
                    <Label>Selling Price (₹) *</Label>
                    <Input
                      type="number"
                      value={dishPrice}
                      onChange={(e) => setDishPrice(e.target.value)}
                      placeholder="e.g., 180.00"
                    />
                    <p className="text-xs text-muted-foreground mt-1">Actual price customers pay</p>
                  </div>
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
