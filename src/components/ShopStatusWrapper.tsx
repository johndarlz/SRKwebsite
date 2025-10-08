import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import ShopClosed from "@/pages/ShopClosed";

interface ShopStatusWrapperProps {
  children: React.ReactNode;
}

const ShopStatusWrapper = ({ children }: ShopStatusWrapperProps) => {
  const [isShopOpen, setIsShopOpen] = useState<boolean | null>(null);
  const location = useLocation();
  
  // Don't check shop status for admin or shop-closed routes
  const isAdminRoute = location.pathname === '/admin';

  useEffect(() => {
    if (!isAdminRoute) {
      checkShopStatus();
    }
  }, [isAdminRoute]);

  const checkShopStatus = async () => {
    const { data, error } = await supabase
      .from('shop_settings')
      .select('is_open')
      .single();
    
    if (!error && data) {
      setIsShopOpen(data.is_open);
    } else {
      setIsShopOpen(true); // Default to open if there's an error
    }
  };

  // Don't block admin route
  if (isAdminRoute) {
    return <>{children}</>;
  }

  // Show loading state
  if (isShopOpen === null) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-pulse text-muted-foreground">Loading...</div>
      </div>
    );
  }

  // Show closed page if shop is closed
  if (!isShopOpen) {
    return <ShopClosed />;
  }

  return <>{children}</>;
};

export default ShopStatusWrapper;
