import { useEffect, useState } from "react";
import { useSearchParams, Link, useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle } from "lucide-react";

const OrderConfirmation = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const orderId = searchParams.get('orderId');

  const handleTrackOrder = () => {
    if (orderId) {
      navigate(`/track-order?orderId=${orderId}`);
    }
  };

  return (
    <div className="min-h-screen bg-background pb-20 md:pb-0">
      <Navbar cartCount={0} />
      
      <div className="container mx-auto px-4 py-16">
        <Card className="max-w-2xl mx-auto p-8 text-center">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-12 h-12 text-green-600" />
          </div>
          
          <h1 className="text-3xl md:text-4xl font-bold mb-4">
            Order Placed Successfully!
          </h1>
          
          <p className="text-lg text-muted-foreground mb-6">
            Thank you for your order. Your delicious food will be on its way soon!
          </p>
          
          <div className="bg-accent/50 rounded-lg p-6 mb-6">
            <p className="text-sm text-muted-foreground mb-2">Your Order ID</p>
            <p className="text-2xl font-bold text-primary">{orderId}</p>
          </div>
          
          <p className="text-muted-foreground mb-8">
            Track your order anytime using your Order ID
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button onClick={handleTrackOrder} className="bg-gradient-hero">
              Track Order
            </Button>
            <Button asChild variant="outline">
              <Link to="/menu">
                Continue Shopping
              </Link>
            </Button>
          </div>
        </Card>
      </div>

      <Footer />
    </div>
  );
};

export default OrderConfirmation;
