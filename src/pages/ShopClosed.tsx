import { Clock, Phone, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const ShopClosed = () => {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <div className="max-w-2xl w-full text-center space-y-8">
        <div className="w-24 h-24 bg-gradient-hero rounded-full flex items-center justify-center mx-auto animate-pulse">
          <Clock className="w-12 h-12 text-primary-foreground" />
        </div>
        
        <div className="space-y-4">
          <h1 className="text-4xl md:text-5xl font-bold">We're Currently Closed</h1>
          <p className="text-xl text-muted-foreground">
            Sorry for the inconvenience. SRK House is closed at the moment.
          </p>
          <p className="text-lg text-muted-foreground">
            Please check back during our operating hours or contact us for more information.
          </p>
        </div>

        <div className="bg-card rounded-lg p-8 shadow-elegant space-y-6">
          <h2 className="text-2xl font-bold">Contact Information</h2>
          
          <div className="flex flex-col md:flex-row gap-6 justify-center">
            <div className="flex items-center space-x-3">
              <Phone className="w-6 h-6 text-primary" />
              <div className="text-left">
                <p className="font-semibold">Phone</p>
                <p className="text-sm text-muted-foreground">+91 98765 43210</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <Mail className="w-6 h-6 text-primary" />
              <div className="text-left">
                <p className="font-semibold">Email</p>
                <p className="text-sm text-muted-foreground">contact@srkhouse.com</p>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t">
            <p className="text-sm text-muted-foreground">Regular Hours: Mon - Sun, 8:00 AM - 11:00 PM</p>
          </div>
        </div>

        <Button asChild size="lg" className="bg-gradient-hero">
          <Link to="/">
            Refresh to Check Status
          </Link>
        </Button>

        <footer className="pt-12">
          <p className="text-muted-foreground">
            © 2025 SRK House | Made with ❤️ by{" "}
            <span className="font-semibold">Finitix</span>
          </p>
        </footer>
      </div>
    </div>
  );
};

export default ShopClosed;
