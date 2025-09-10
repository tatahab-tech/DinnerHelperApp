# Spoonacular API Setup Guide

## Overview
This app now integrates with the Spoonacular API to provide real recipe data with properly matched images. The API provides access to over 380,000 recipes with high-quality food photography.

## Getting Started

### 1. Get Your API Key
1. Visit [Spoonacular API](https://spoonacular.com/food-api)
2. Sign up for a free account
3. Get your API key from the dashboard
4. Free tier includes 150 requests per day

### 2. Configure the API Key
1. Open `script.js`
2. Find this line:
   ```javascript
   const SPOONACULAR_API_KEY = 'YOUR_API_KEY_HERE';
   ```
3. Replace `'YOUR_API_KEY_HERE'` with your actual API key:
   ```javascript
   const SPOONACULAR_API_KEY = 'your-actual-api-key-here';
   ```

### 3. Test the Integration
1. Open `index.html` in your browser
2. Add some ingredients (e.g., chicken, pasta, tomatoes)
3. Click "Get Meal Suggestions"
4. You should see real recipes with matching images!

## Features

### Real Recipe Data
- **380,000+ recipes** from Spoonacular's database
- **High-quality images** that actually match the recipes
- **Detailed instructions** for cooking
- **Nutritional information** (available in API response)
- **Cuisine filtering** (Italian, Asian, Mexican, etc.)

### Smart Fallback
- If API fails, app falls back to local recipe database
- Graceful error handling with user-friendly messages
- Loading indicators while fetching data

### API Endpoints Used
- `findByIngredients` - Find recipes based on available ingredients
- `getRecipeInformation` - Get detailed recipe information
- `search` - Search recipes by query, cuisine, diet

## API Response Format

The app converts Spoonacular's response to our format:

```javascript
{
    id: "12345",
    name: "Pasta Carbonara",
    image: "https://spoonacular.com/recipeImages/12345-556x370.jpg",
    cuisine: "Italian",
    difficulty: "Medium",
    time: "25 min",
    description: "Classic Italian pasta...",
    ingredients: ["pasta", "eggs", "cheese", "bacon"],
    missingIngredients: ["garlic", "olive-oil"],
    instructions: ["Step 1: Boil pasta...", "Step 2: Cook bacon..."]
}
```

## Troubleshooting

### Common Issues

1. **"Unable to fetch fresh recipes"**
   - Check your API key is correct
   - Verify you have remaining API calls
   - Check browser console for errors

2. **Images not loading**
   - Spoonacular images should load automatically
   - Check internet connection
   - Images have fallback to default

3. **No recipes found**
   - Try different ingredients
   - Check API key and quota
   - App will fallback to local recipes

### API Limits
- **Free tier**: 150 requests per day
- **Paid tiers**: Available for higher limits
- **Rate limiting**: 1 request per second

## Benefits

### For Users
- **Real recipes** with actual cooking instructions
- **Matching images** that show what the dish looks like
- **Fresh content** updated regularly
- **Professional quality** food photography

### For Developers
- **No image management** - API handles all images
- **Scalable** - access to hundreds of thousands of recipes
- **Reliable** - professional API with good uptime
- **Rich data** - detailed recipe information

## Next Steps

1. **Get your API key** from Spoonacular
2. **Update the configuration** in script.js
3. **Test the integration** with different ingredients
4. **Enjoy real recipes** with matching images!

The app will now provide a much better user experience with real recipe data and properly matched images! 🍽️✨
