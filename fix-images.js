// Script to fix recipe images with specific, appropriate images
const imageMappings = {
    // Italian Pasta Recipes
    "pasta-carbonara": "https://images.unsplash.com/photo-1621996346565-e3dbc353d2e5?w=800&h=600&fit=crop&crop=center", // Carbonara pasta
    "vegetarian-pasta": "https://images.unsplash.com/photo-1551183053-bf91a1d81141?w=800&h=600&fit=crop&crop=center", // Tomato pasta
    "pasta-alfredo": "https://images.unsplash.com/photo-1621996346565-e3dbc353d2e5?w=800&h=600&fit=crop&crop=center", // Creamy pasta
    "spaghetti-bolognese": "https://images.unsplash.com/photo-1621996346565-e3dbc353d2e5?w=800&h=600&fit=crop&crop=center", // Meat sauce pasta
    
    // Italian Pizza Recipes
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

console.log("Image mappings created for", Object.keys(imageMappings).length, "recipes");
