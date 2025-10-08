import Navbar from "@/components/Navbar";
import { getCartCount, getCart } from "@/lib/cart";
import { useState, useEffect } from "react";
import { Phone, Mail, MapPin, Clock } from "lucide-react";

const About = () => {
  const [cartCount, setCartCount] = useState(0);

  useEffect(() => {
    setCartCount(getCartCount(getCart()));
  }, []);

  return (
    <div className="min-h-screen bg-background pb-20 md:pb-0">
      <Navbar cartCount={cartCount} />
      
      <div className="container mx-auto px-4 py-12">
        <h1 className="text-4xl md:text-5xl font-bold mb-8 text-center">About SRK House</h1>
        
        <div className="max-w-4xl mx-auto space-y-12">
          {/* About Content */}
          <section className="space-y-6">
            <div className="bg-card rounded-lg p-8 shadow-elegant">
              <h2 className="text-2xl font-bold mb-4">Our Story</h2>
              <p className="text-lg text-muted-foreground mb-4">
                Welcome to SRK House, where we bring you the authentic flavors of South India. 
                Our passion is to serve traditional dishes made with love and the finest ingredients.
              </p>
              <p className="text-lg text-muted-foreground mb-4">
                From crispy dosas to aromatic biryanis, each dish is crafted to perfection, 
                delivering an unforgettable culinary experience right to your doorstep.
              </p>
              <p className="text-lg text-muted-foreground">
                We take pride in using authentic recipes passed down through generations, 
                combined with the freshest ingredients to create dishes that remind you of home.
              </p>
            </div>

            <div className="bg-card rounded-lg p-8 shadow-elegant">
              <h2 className="text-2xl font-bold mb-4">Our Commitment</h2>
              <ul className="space-y-3 text-lg text-muted-foreground">
                <li className="flex items-start">
                  <span className="text-primary mr-2">•</span>
                  <span>100% authentic South Indian recipes</span>
                </li>
                <li className="flex items-start">
                  <span className="text-primary mr-2">•</span>
                  <span>Fresh ingredients sourced daily</span>
                </li>
                <li className="flex items-start">
                  <span className="text-primary mr-2">•</span>
                  <span>Hygienic food preparation</span>
                </li>
                <li className="flex items-start">
                  <span className="text-primary mr-2">•</span>
                  <span>Fast and reliable delivery</span>
                </li>
                <li className="flex items-start">
                  <span className="text-primary mr-2">•</span>
                  <span>Customer satisfaction guaranteed</span>
                </li>
              </ul>
            </div>
          </section>

          {/* Contact Information */}
          <section className="bg-gradient-hero rounded-lg p-8 text-primary-foreground">
            <h2 className="text-2xl font-bold mb-6 text-center">Contact Us</h2>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="flex items-start space-x-3">
                <Phone className="w-6 h-6 flex-shrink-0 mt-1" />
                <div>
                  <p className="font-semibold">Phone</p>
                  <p>+91 98765 43210</p>
                  <p>+91 98765 43211</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <Mail className="w-6 h-6 flex-shrink-0 mt-1" />
                <div>
                  <p className="font-semibold">Email</p>
                  <p>contact@srkhouse.com</p>
                  <p>orders@srkhouse.com</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <MapPin className="w-6 h-6 flex-shrink-0 mt-1" />
                <div>
                  <p className="font-semibold">Location</p>
                  <p>Near Chandigarh University</p>
                  <p>Punjab, India</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <Clock className="w-6 h-6 flex-shrink-0 mt-1" />
                <div>
                  <p className="font-semibold">Hours</p>
                  <p>Mon - Sun: 8:00 AM - 11:00 PM</p>
                  <p>(Check website for today's status)</p>
                </div>
              </div>
            </div>
          </section>
        </div>
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

export default About;
