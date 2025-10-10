import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Star, ShoppingCart } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface Review {
  id: string;
  customer_name: string;
  rating: number;
  review_text: string;
  created_at: string;
}

interface ProductDetailModalProps {
  dish: any;
  isOpen: boolean;
  onClose: () => void;
  onAddToCart: (dish: any) => void;
}

const ProductDetailModal = ({ dish, isOpen, onClose, onAddToCart }: ProductDetailModalProps) => {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [customerName, setCustomerName] = useState("");
  const [rating, setRating] = useState(5);
  const [reviewText, setReviewText] = useState("");
  const [hoveredRating, setHoveredRating] = useState(0);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen && dish) {
      fetchReviews();
    }
  }, [isOpen, dish]);

  const fetchReviews = async () => {
    if (!dish) return;
    
    const { data, error } = await supabase
      .from('reviews')
      .select('*')
      .eq('dish_id', dish.id)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching reviews:', error);
      return;
    }

    setReviews(data || []);
  };

  const handleSubmitReview = async () => {
    if (!customerName.trim()) {
      toast.error('Please enter your name');
      return;
    }

    setLoading(true);
    const { error } = await supabase
      .from('reviews')
      .insert([{
        dish_id: dish.id,
        customer_name: customerName,
        rating: rating,
        review_text: reviewText.trim() || null
      }]);

    if (error) {
      console.error('Error submitting review:', error);
      toast.error('Failed to submit review');
      setLoading(false);
      return;
    }

    toast.success('Review submitted successfully!');
    setCustomerName("");
    setRating(5);
    setReviewText("");
    fetchReviews();
    setLoading(false);
  };

  const calculateAverageRating = () => {
    if (reviews.length === 0) return 0;
    const sum = reviews.reduce((acc, review) => acc + review.rating, 0);
    return (sum / reviews.length).toFixed(1);
  };

  const renderStars = (rating: number, interactive: boolean = false, onRate?: (rating: number) => void) => {
    return (
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`w-5 h-5 ${
              star <= (interactive ? (hoveredRating || rating) : rating)
                ? 'fill-yellow-400 text-yellow-400'
                : 'text-gray-300'
            } ${interactive ? 'cursor-pointer' : ''}`}
            onClick={() => interactive && onRate && onRate(star)}
            onMouseEnter={() => interactive && setHoveredRating(star)}
            onMouseLeave={() => interactive && setHoveredRating(0)}
          />
        ))}
      </div>
    );
  };

  if (!dish) return null;

  const hasDiscount = dish.original_price && dish.original_price > dish.price;
  const discountPercentage = hasDiscount 
    ? Math.round(((dish.original_price - dish.price) / dish.original_price) * 100)
    : 0;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">{dish.name}</DialogTitle>
        </DialogHeader>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Left Side - Image */}
          <div className="space-y-4">
            <div className="relative">
              <img
                src={dish.image_url}
                alt={dish.name}
                className="w-full h-96 object-cover rounded-lg"
              />
              {hasDiscount && (
                <div className="absolute top-4 right-4 bg-red-500 text-white px-3 py-1 rounded-full font-bold">
                  {discountPercentage}% OFF
                </div>
              )}
            </div>
          </div>

          {/* Right Side - Details */}
          <div className="space-y-4">
            <div>
              {/* Display multiple categories */}
              <div className="flex flex-wrap gap-2 mb-3">
                {(dish.categories && dish.categories.length > 0 
                  ? dish.categories 
                  : dish.category ? [dish.category] : []
                ).map((cat: string, index: number) => (
                  <span 
                    key={index}
                    className="inline-block px-3 py-1 bg-primary/10 text-primary rounded-full text-sm font-semibold"
                  >
                    {cat}
                  </span>
                ))}
              </div>
              
              <div className="flex items-center gap-3 mb-2">
                {hasDiscount && (
                  <span className="text-2xl text-gray-400 line-through">
                    ₹{dish.original_price.toFixed(2)}
                  </span>
                )}
                <span className="text-3xl font-bold text-primary">
                  ₹{dish.price.toFixed(2)}
                </span>
              </div>

              {reviews.length > 0 && (
                <div className="flex items-center gap-2 mb-3">
                  {renderStars(Math.round(parseFloat(calculateAverageRating())))}
                  <span className="text-sm text-muted-foreground">
                    {calculateAverageRating()} ({reviews.length} {reviews.length === 1 ? 'review' : 'reviews'})
                  </span>
                </div>
              )}

              <p className="text-muted-foreground">{dish.description}</p>
            </div>

            <Button
              onClick={() => {
                onAddToCart(dish);
                toast.success(`${dish.name} added to cart!`);
              }}
              className="w-full bg-gradient-hero"
              size="lg"
            >
              <ShoppingCart className="w-5 h-5 mr-2" />
              Add to Cart
            </Button>

            {/* Write Review Section */}
            <div className="border-t pt-4">
              <h3 className="text-lg font-semibold mb-3">Write a Review</h3>
              <div className="space-y-3">
                <div>
                  <Label htmlFor="customerName">Your Name *</Label>
                  <Input
                    id="customerName"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    placeholder="Enter your name"
                  />
                </div>

                <div>
                  <Label>Rating *</Label>
                  {renderStars(rating, true, setRating)}
                </div>

                <div>
                  <Label htmlFor="reviewText">Your Review (Optional)</Label>
                  <Textarea
                    id="reviewText"
                    value={reviewText}
                    onChange={(e) => setReviewText(e.target.value)}
                    placeholder="Share your experience..."
                    rows={3}
                  />
                </div>

                <Button
                  onClick={handleSubmitReview}
                  disabled={loading}
                  className="w-full"
                >
                  {loading ? 'Submitting...' : 'Submit Review'}
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Reviews Section */}
        <div className="border-t pt-6 mt-6">
          <h3 className="text-xl font-semibold mb-4">
            Customer Reviews ({reviews.length})
          </h3>
          
          {reviews.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">
              No reviews yet. Be the first to review this dish!
            </p>
          ) : (
            <div className="space-y-4">
              {reviews.map((review) => (
                <div key={review.id} className="border rounded-lg p-4">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <p className="font-semibold">{review.customer_name}</p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(review.created_at).toLocaleDateString('en-IN', {
                          day: '2-digit',
                          month: 'short',
                          year: 'numeric'
                        })}
                      </p>
                    </div>
                    {renderStars(review.rating)}
                  </div>
                  {review.review_text && (
                    <p className="text-sm text-muted-foreground">{review.review_text}</p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ProductDetailModal;
