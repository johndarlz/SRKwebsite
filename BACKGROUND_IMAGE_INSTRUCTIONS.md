# Background Image Setup Instructions

## Important: Save the Biryani Image

To complete the background image setup, you need to save the uploaded biryani image:

1. **Save the image you uploaded** as `biryani-background.jpg`
2. **Location**: Place it in `src/assets/biryani-background.jpg`
3. The image should be the one showing the biryani dish with rice and side dishes on a wooden board

## What Was Changed

The following updates have been made to your application:

### 1. Index.tsx (Homepage)
- Added import for the new background image
- Applied the biryani image as a full-page background with:
  - `bg-cover` - covers the entire area
  - `bg-center` - centers the image
  - `bg-fixed` - creates a parallax effect when scrolling
  - Dark overlay for better text readability

### 2. Section Styling
- **Features Section**: Added `bg-card/90 backdrop-blur-md` for semi-transparent white background
- **Popular Dishes Section**: Added `bg-background/95 backdrop-blur-sm` for readability
- **About Section**: Added `bg-card/90 backdrop-blur-md` for consistency

## Result

The homepage now features:
- Beautiful biryani background image across the entire page
- Fixed background that creates a parallax scrolling effect
- Semi-transparent sections that allow the background to show through while keeping content readable
- Professional backdrop blur effects for modern aesthetics

## Next Steps

After saving the image to `src/assets/biryani-background.jpg`, the application will automatically use it as the background.
