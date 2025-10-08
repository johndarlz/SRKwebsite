import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight, Star, Clock, MapPin } from "lucide-react";
import Navbar from "@/components/Navbar";
import DishCard from "@/components/DishCard";
import { supabase } from "@/integrations/supabase/client";
import { addToCart, getCartCount, getCart } from "@/lib/cart";
import { toast } from "sonner";
import biryaniHero from "@/assets/image1.jpg";
import biryaniBackground from "@/assets/image1.jpg";

const Index = () => {
  const [popularDishes, setPopularDishes] = useState<any[]>([]);
  const [cartCount, setCartCount] = useState(0);
  const [isShopOpen, setIsShopOpen] = useState(true);

  useEffect(() => {
    checkShopStatus();
    fetchPopularDishes();
    setCartCount(getCartCount(getCart()));
  }, []);

  const checkShopStatus = async () => {
    const { data, error } = await supabase
      .from('shop_settings')
      .select('is_open')
      .single();
    
    if (!error && data) {
      setIsShopOpen(data.is_open);
    }
  };

  const fetchPopularDishes = async () => {
    const { data, error } = await supabase
      .from('dishes')
      .select('*')
      .limit(6);
    
    if (error) {
      console.error('Error fetching dishes:', error);
      return;
    }
    
    setPopularDishes(data || []);
  };

  const handleAddToCart = (dish: any) => {
    addToCart(dish);
    setCartCount(getCartCount(getCart()));
    toast.success(`${dish.name} added to cart!`);
  };

  return (
    <div 
      className="min-h-screen pb-20 md:pb-0 bg-cover bg-center bg-fixed"
      style={{ 
        backgroundImage: `url(${biryaniBackground})`,
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
        backgroundBlendMode: 'darken'
      }}
    >
      <Navbar cartCount={cartCount} />
      
      {/* Hero Section */}
      <section className="relative h-[500px] md:h-[600px] overflow-hidden">
        <div 
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url(${biryaniHero})` }}
        >
          <div className="absolute inset-0 bg-gradient-to-r from-black/70 to-black/50" />
        </div>
        <div className="relative container mx-auto px-4 h-full flex items-center">
          <div className="max-w-2xl text-primary-foreground animate-fade-in">
            <h1 className="text-4xl md:text-6xl font-bold mb-4">
              SRK House
            </h1>
            <p className="text-xl md:text-2xl mb-6 text-primary-foreground/90">
              Authentic South Indian Taste in Every Bite
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Button size="lg" asChild className="bg-gradient-hero hover:opacity-90 text-lg">
                <Link to="/menu">
                  Explore Menu
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" asChild className="bg-white text-black hover:bg-gray-100 text-lg border-black">
                <Link to="/track-order">
                  Track Order
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-12 bg-card/90 backdrop-blur-md">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="flex items-start space-x-4 animate-fade-in">
              <div className="w-12 h-12 bg-gradient-gold rounded-full flex items-center justify-center flex-shrink-0">
                <Star className="w-6 h-6 text-secondary-foreground" />
              </div>
              <div>
                <h3 className="font-semibold text-lg mb-2">Quality Food</h3>
                <p className="text-muted-foreground">
                  Authentic South Indian recipes made with premium ingredients
                </p>
              </div>
            </div>
            <div className="flex items-start space-x-4 animate-fade-in" style={{ animationDelay: '0.1s' }}>
              <div className="w-12 h-12 bg-gradient-gold rounded-full flex items-center justify-center flex-shrink-0">
                <Clock className="w-6 h-6 text-secondary-foreground" />
              </div>
              <div>
                <h3 className="font-semibold text-lg mb-2">Fast Delivery</h3>
                <p className="text-muted-foreground">
                  Quick and reliable delivery to your doorstep
                </p>
              </div>
            </div>
            <div className="flex items-start space-x-4 animate-fade-in" style={{ animationDelay: '0.2s' }}>
              <div className="w-12 h-12 bg-gradient-gold rounded-full flex items-center justify-center flex-shrink-0">
                <MapPin className="w-6 h-6 text-secondary-foreground" />
              </div>
              <div>
                <h3 className="font-semibold text-lg mb-2">Easy Ordering</h3>
                <p className="text-muted-foreground">
                  Simple checkout with campus and address delivery options
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Popular Dishes Section */}
      <section className="py-16 bg-background/95 backdrop-blur-sm">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Popular Dishes</h2>
            <p className="text-muted-foreground text-lg">
              Taste the best of South Indian cuisine
            </p>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {popularDishes.map((dish) => (
              <DishCard
                key={dish.id}
                {...dish}
                onAddToCart={handleAddToCart}
              />
            ))}
          </div>
          
          <div className="text-center">
            <Button size="lg" asChild variant="outline">
              <Link to="/menu">
                View Full Menu
                <ArrowRight className="ml-2 w-5 h-5" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section className="py-16 bg-card/90 backdrop-blur-md">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-6">About SRK House</h2>
            <p className="text-lg text-muted-foreground mb-4">
              Welcome to SRK House, where we bring you the authentic flavors of South India. 
              Our passion is to serve traditional dishes made with love and the finest ingredients.
            </p>
            <p className="text-lg text-muted-foreground">
              From crispy dosas to aromatic biryanis, each dish is crafted to perfection, 
              delivering an unforgettable culinary experience right to your doorstep.
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
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

export default Index;
