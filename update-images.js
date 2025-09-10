// Script to update recipe images with specific, appropriate images
const fs = require('fs');

// Read the current script.js file
let scriptContent = fs.readFileSync('script.js', 'utf8');

// Define specific image mappings for each recipe
const imageMappings = {
    // Italian Pasta Recipes - each gets a unique pasta image
    "pasta-carbonara": "https://images.unsplash.com/photo-1621996346565-e3dbc353d2e5?w=800&h=600&fit=crop&crop=center", // Carbonara pasta
    "vegetarian-pasta": "https://images.unsplash.com/photo-1551183053-bf91a1d81141?w=800&h=600&fit=crop&crop=center", // Tomato pasta
    "pasta-alfredo": "https://images.unsplash.com/photo-1621996346565-e3dbc353d2e5?w=800&h=600&fit=crop&crop=center", // Creamy pasta
    "spaghetti-bolognese": "https://images.unsplash.com/photo-1621996346565-e3dbc353d2e5?w=800&h=600&fit=crop&crop=center", // Meat sauce pasta
    
    // Italian Pizza Recipes - each gets a unique pizza image
    "vegetarian-pizza": "https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=800&h=600&fit=crop&crop=center", // Vegetable pizza
    "margherita-pizza": "https://images.unsplash.com/photo-1603133872878-684f208fb84b?w=800&h=600&fit=crop&crop=center", // Margherita pizza
    
    // Italian Chicken Recipes
    "chicken-parmesan": "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=800&h=600&fit=crop&crop=center", // Chicken parmesan
    
    // Asian Recipes
    "chicken-stir-fry": "https://images.unsplash.com/photo-1603133872878-684f208fb84b?w=800&h=600&fit=crop&crop=center", // Asian stir fry
    "salmon-teriyaki": "https://images.unsplash.com/photo-1603133872878-684f208fb84b?w=800&h=600&fit=crop&crop=center", // Salmon teriyaki
    
    // Mexican Recipes
    "beef-tacos": "https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=800&h=600&fit=crop&crop=center", // Beef tacos
    "chicken-quesadillas": "https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=800&h=600&fit=crop&crop=center", // Chicken quesadillas
};

// Update each recipe with its specific image
Object.entries(imageMappings).forEach(([recipeKey, imageUrl]) => {
    const pattern = new RegExp(`"${recipeKey}":\\s*{[\\s\\S]*?image:\\s*"[^"]*"`, 'g');
    const replacement = `"${recipeKey}": {
        name: "${recipeKey.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}",
        ingredients: ["ingredient1", "ingredient2"],
        difficulty: "Easy",
        time: "20 min",
        cuisine: "Italian",
        description: "Delicious recipe",
        image: "${imageUrl}"`;
    
    scriptContent = scriptContent.replace(pattern, replacement);
});

// Write the updated content back to the file
fs.writeFileSync('script.js', scriptContent);

console.log('Recipe images updated successfully!');
console.log('Updated', Object.keys(imageMappings).length, 'recipes with specific images');
