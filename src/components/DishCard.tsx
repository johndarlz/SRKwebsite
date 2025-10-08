import { Card, CardContent, CardFooter } from "./ui/card";
import { Button } from "./ui/button";
import { Plus } from "lucide-react";

interface DishCardProps {
  id: string;
  name: string;
  description: string;
  price: number;
  image_url: string;
  onAddToCart: (dish: any) => void;
}

const DishCard = ({ id, name, description, price, image_url, onAddToCart }: DishCardProps) => {
  return (
    <Card className="overflow-hidden shadow-card hover:shadow-glow transition-all duration-300 group">
      <div className="relative overflow-hidden h-48">
        <img
          src={image_url}
          alt={name}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
      </div>
      <CardContent className="p-4">
        <h3 className="font-semibold text-lg mb-1">{name}</h3>
        <p className="text-sm text-muted-foreground line-clamp-2 mb-2">{description}</p>
        <p className="text-xl font-bold text-primary">₹{price}</p>
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
