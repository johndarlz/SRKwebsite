const Footer = () => {
  return (
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
              <a 
                href="https://finitix.vercel.app/" 
                target="_blank" 
                rel="noopener noreferrer"
                className="font-semibold hover:underline cursor-pointer transition-all"
              >
                Finitix
              </a>
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
