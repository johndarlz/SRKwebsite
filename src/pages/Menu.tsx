import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import DishCard from "@/components/DishCard";
import ProductDetailModal from "@/components/ProductDetailModal";
import { Button } from "@/components/ui/button";
import { addToCart, getCart, getCartCount } from "@/lib/cart";
import { toast } from "sonner";

const categories = ["All", "Breakfast", "Lunch", "Dinner", "Biryani", "Sweets", "Beverages"];

const Menu = () => {
  const [dishes, setDishes] = useState<any[]>([]);
  const [filteredDishes, setFilteredDishes] = useState<any[]>([]);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [cartCount, setCartCount] = useState(0);
  const [selectedDish, setSelectedDish] = useState<any>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    fetchDishes();
    setCartCount(getCartCount(getCart()));
  }, []);

  useEffect(() => {
    if (selectedCategory === "All") {
      setFilteredDishes(dishes);
    } else {
      setFilteredDishes(dishes.filter(dish => {
        // Check if dish has multiple categories (new format)
        if (dish.categories && Array.isArray(dish.categories)) {
          return dish.categories.includes(selectedCategory);
        }
        // Fallback to single category (old format)
        return dish.category === selectedCategory;
      }));
    }
  }, [selectedCategory, dishes]);

  const fetchDishes = async () => {
    const { data, error } = await supabase
      .from('dishes')
      .select('*')
      .eq('in_stock', true)
      .order('category');
    
    if (error) {
      console.error('Error fetching dishes:', error);
      toast.error('Failed to load menu');
      return;
    }
    
    setDishes(data || []);
    setFilteredDishes(data || []);
  };

  const handleAddToCart = (dish: any) => {
    addToCart(dish);
    setCartCount(getCartCount(getCart()));
  };

  const handleDishClick = (dish: any) => {
    setSelectedDish(dish);
    setIsModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-background pb-20 md:pb-0">
      <Navbar cartCount={cartCount} />
      
      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Our Menu</h1>
          <p className="text-muted-foreground text-lg">
            Discover our delicious South Indian specialties
          </p>
        </div>

        {/* Category Filter */}
        <div className="flex flex-wrap justify-center gap-2 mb-8">
          {categories.map((category) => (
            <Button
              key={category}
              variant={selectedCategory === category ? "default" : "outline"}
              onClick={() => setSelectedCategory(category)}
              className={selectedCategory === category ? "bg-primary" : ""}
            >
              {category}
            </Button>
          ))}
        </div>

        {/* Dishes Grid */}
        {filteredDishes.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredDishes.map((dish) => (
              <DishCard
                key={dish.id}
                {...dish}
                onAddToCart={handleAddToCart}
                onClick={() => handleDishClick(dish)}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-muted-foreground text-lg">No dishes found in this category.</p>
          </div>
        )}
      </div>

      <Footer />

      <ProductDetailModal
        dish={selectedDish}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onAddToCart={handleAddToCart}
      />
    </div>
  );
};

export default Menu;
