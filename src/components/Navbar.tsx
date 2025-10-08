import { Link, useLocation } from "react-router-dom";
import { ShoppingCart, Home, UtensilsCrossed, Package, Info } from "lucide-react";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";

interface NavbarProps {
  cartCount?: number;
}

const Navbar = ({ cartCount = 0 }: NavbarProps) => {
  const location = useLocation();
  
  const isActive = (path: string) => location.pathname === path;
  
  return (
    <nav className="sticky top-0 z-50 bg-card border-b shadow-sm">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="flex items-center space-x-2">
            <div className="w-10 h-10 bg-gradient-hero rounded-full flex items-center justify-center">
              <UtensilsCrossed className="w-6 h-6 text-primary-foreground" />
            </div>
            <span className="text-xl font-bold bg-gradient-hero bg-clip-text text-transparent">
              SRK House
            </span>
          </Link>
          
          <div className="hidden md:flex items-center space-x-1">
            <Button
              variant={isActive("/") ? "default" : "ghost"}
              asChild
              className={isActive("/") ? "bg-primary" : ""}
            >
              <Link to="/">
                <Home className="w-4 h-4 mr-2" />
                Home
              </Link>
            </Button>
            <Button
              variant={isActive("/menu") ? "default" : "ghost"}
              asChild
              className={isActive("/menu") ? "bg-primary" : ""}
            >
              <Link to="/menu">
                <UtensilsCrossed className="w-4 h-4 mr-2" />
                Menu
              </Link>
            </Button>
            <Button
              variant={isActive("/track-order") ? "default" : "ghost"}
              asChild
              className={isActive("/track-order") ? "bg-primary" : ""}
            >
              <Link to="/track-order">
                <Package className="w-4 h-4 mr-2" />
                Track Order
              </Link>
            </Button>
            <Button
              variant={isActive("/about") ? "default" : "ghost"}
              asChild
              className={isActive("/about") ? "bg-primary" : ""}
            >
              <Link to="/about">
                <Info className="w-4 h-4 mr-2" />
                About
              </Link>
            </Button>
          </div>
          
          <Button variant="outline" asChild className="relative">
            <Link to="/cart">
              <ShoppingCart className="w-5 h-5" />
              {cartCount > 0 && (
                <Badge className="absolute -top-2 -right-2 bg-secondary text-secondary-foreground">
                  {cartCount}
                </Badge>
              )}
            </Link>
          </Button>
        </div>
        
        {/* Mobile Navigation */}
        <div className="md:hidden fixed bottom-0 left-0 right-0 bg-card border-t shadow-lg z-50">
          <div className="flex justify-around items-center h-16 px-4">
            <Link to="/" className="flex flex-col items-center">
              <Home className={`w-6 h-6 ${isActive("/") ? "text-primary" : "text-muted-foreground"}`} />
              <span className={`text-xs mt-1 ${isActive("/") ? "text-primary" : "text-muted-foreground"}`}>
                Home
              </span>
            </Link>
            <Link to="/menu" className="flex flex-col items-center">
              <UtensilsCrossed className={`w-6 h-6 ${isActive("/menu") ? "text-primary" : "text-muted-foreground"}`} />
              <span className={`text-xs mt-1 ${isActive("/menu") ? "text-primary" : "text-muted-foreground"}`}>
                Menu
              </span>
            </Link>
            <Link to="/cart" className="flex flex-col items-center relative">
              <ShoppingCart className={`w-6 h-6 ${isActive("/cart") ? "text-primary" : "text-muted-foreground"}`} />
              {cartCount > 0 && (
                <Badge className="absolute -top-1 -right-3 bg-secondary text-secondary-foreground text-xs px-1.5 py-0">
                  {cartCount}
                </Badge>
              )}
              <span className={`text-xs mt-1 ${isActive("/cart") ? "text-primary" : "text-muted-foreground"}`}>
                Cart
              </span>
            </Link>
            <Link to="/track-order" className="flex flex-col items-center">
              <Package className={`w-6 h-6 ${isActive("/track-order") ? "text-primary" : "text-muted-foreground"}`} />
              <span className={`text-xs mt-1 ${isActive("/track-order") ? "text-primary" : "text-muted-foreground"}`}>
                Track
              </span>
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
