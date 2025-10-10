import { Card, CardContent, CardFooter } from "./ui/card";
import { Button } from "./ui/button";
import { Plus } from "lucide-react";

interface DishCardProps {
  id: string;
  name: string;
  description: string;
  price: number;
  original_price?: number;
  category?: string;
  categories?: string[];
  image_url: string;
  onAddToCart: (dish: any) => void;
  onClick?: () => void;
}

const DishCard = ({ id, name, description, price, original_price, category, categories, image_url, onAddToCart, onClick }: DishCardProps) => {
  const hasDiscount = original_price && original_price > price;
  const discountPercentage = hasDiscount 
    ? Math.round(((original_price - price) / original_price) * 100)
    : 0;

  // Get display categories (use new format if available, fallback to old)
  const displayCategories = categories && categories.length > 0 ? categories : (category ? [category] : []);

  return (
    <Card className="overflow-hidden shadow-card hover:shadow-glow transition-all duration-300 group">
      <div 
        className="relative overflow-hidden h-48 cursor-pointer"
        onClick={onClick}
      >
        <img
          src={image_url}
          alt={name}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
        {hasDiscount && (
          <div className="absolute top-2 right-2 bg-red-500 text-white px-2 py-1 rounded-full text-xs font-bold">
            {discountPercentage}% OFF
          </div>
        )}
      </div>
      <CardContent className="p-4">
        {displayCategories.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-2">
            {displayCategories.map((cat, index) => (
              <span 
                key={index}
                className="inline-block px-2 py-0.5 bg-primary/10 text-primary rounded-full text-xs font-medium"
              >
                {cat}
              </span>
            ))}
          </div>
        )}
        <h3 className="font-semibold text-lg mb-1">{name}</h3>
        <p className="text-sm text-muted-foreground line-clamp-2 mb-2">{description}</p>
        <div className="flex items-center gap-2">
          {hasDiscount && (
            <span className="text-sm text-gray-400 line-through">
              ₹{original_price.toFixed(2)}
            </span>
          )}
          <p className="text-xl font-bold text-primary">₹{price.toFixed(2)}</p>
        </div>
      </CardContent>
      <CardFooter className="p-4 pt-0">
        <Button
          className="w-full bg-gradient-hero hover:opacity-90"
          onClick={() => onAddToCart({ id, name, price, image_url })}
        >
          <Plus className="w-4 h-4 mr-2" />
          Add to Cart
        </Button>
      </CardFooter>
    </Card>
  );
};

export default DishCard;
