// Dinner Helper App JavaScript

// DOM elements
const saveButton = document.getElementById('saveBtn');
const savedIngredientsList = document.getElementById('savedIngredientsList');
const checkboxes = document.querySelectorAll('input[type="checkbox"]');
const suggestMealsButton = document.getElementById('suggestMealsBtn');

// Storage key for localStorage
const STORAGE_KEY = 'dinnerHelperIngredients';

// Initialize the app when the page loads
document.addEventListener('DOMContentLoaded', function() {
    loadSavedIngredients();
    setupEventListeners();
});

// Set up event listeners
function setupEventListeners() {
    saveButton.addEventListener('click', saveIngredients);
    suggestMealsButton.addEventListener('click', suggestMeals);
}

// Load saved ingredients from localStorage and update UI
function loadSavedIngredients() {
    try {
        const savedIngredients = JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
        
        // Check the corresponding checkboxes
        checkboxes.forEach(checkbox => {
            const ingredient = checkbox.getAttribute('data-ingredient');
            if (savedIngredients.includes(ingredient)) {
                checkbox.checked = true;
            }
        });
        
        // Display saved ingredients
        displaySavedIngredients(savedIngredients);
    } catch (error) {
        console.error('Error loading saved ingredients:', error);
        displaySavedIngredients([]);
    }
}

// Save ingredients to localStorage and update display
function saveIngredients() {
    const checkedIngredients = [];
    
    // Collect all checked ingredients
    checkboxes.forEach(checkbox => {
        if (checkbox.checked) {
            const ingredient = checkbox.getAttribute('data-ingredient');
            checkedIngredients.push(ingredient);
        }
    });
    
    try {
        // Save to localStorage
        localStorage.setItem(STORAGE_KEY, JSON.stringify(checkedIngredients));
        
        // Update display
        displaySavedIngredients(checkedIngredients);
        
        // Show success feedback
        showSuccessMessage();
    } catch (error) {
        console.error('Error saving ingredients:', error);
        showErrorMessage();
    }
}

// Display saved ingredients in the list section
function displaySavedIngredients(ingredients) {
    const listContainer = savedIngredientsList;
    
    if (ingredients.length === 0) {
        listContainer.innerHTML = '<p class="no-ingredients">No ingredients saved yet. Check some boxes and click "Save My Ingredients"!</p>';
        return;
    }
    
    // Create ingredient items
    const ingredientItems = ingredients.map(ingredient => {
        const capitalizedIngredient = ingredient.charAt(0).toUpperCase() + ingredient.slice(1);
        return `<span class="ingredient-item">${capitalizedIngredient}</span>`;
    }).join('');
    
    listContainer.innerHTML = ingredientItems;
}


// Show success message when ingredients are saved
function showSuccessMessage() {
    const originalText = saveButton.textContent;
    saveButton.textContent = 'Saved! ✓';
    saveButton.style.background = 'linear-gradient(135deg, #48bb78 0%, #38a169 100%)';
    
    setTimeout(() => {
        saveButton.textContent = originalText;
        saveButton.style.background = 'linear-gradient(135deg, #48bb78 0%, #38a169 100%)';
    }, 2000);
}

// Show error message if saving fails
function showErrorMessage() {
    const originalText = saveButton.textContent;
    saveButton.textContent = 'Error! Try again';
    saveButton.style.background = 'linear-gradient(135deg, #e53e3e 0%, #c53030 100%)';
    
    setTimeout(() => {
        saveButton.textContent = originalText;
        saveButton.style.background = 'linear-gradient(135deg, #48bb78 0%, #38a169 100%)';
    }, 3000);
}

// Utility function to get all available ingredients (for future use)
function getAllIngredients() {
    return Array.from(checkboxes).map(checkbox => checkbox.getAttribute('data-ingredient'));
}

// Utility function to clear all saved ingredients (for debugging/testing)
function clearSavedIngredients() {
    localStorage.removeItem(STORAGE_KEY);
    checkboxes.forEach(checkbox => checkbox.checked = false);
    displaySavedIngredients([]);
}

// Spoonacular API Configuration
const SPOONACULAR_API_KEY = 'YOUR_API_KEY_HERE'; // Replace with your actual API key
const SPOONACULAR_BASE_URL = 'https://api.spoonacular.com/recipes';

// API Functions
async function searchRecipesByIngredients(ingredients, cuisine = '', diet = '', number = 10) {
    try {
        const ingredientsString = ingredients.join(',+');
        const url = `${SPOONACULAR_BASE_URL}/findByIngredients?apiKey=${SPOONACULAR_API_KEY}&ingredients=${ingredientsString}&number=${number}&cuisine=${cuisine}&diet=${diet}`;
        
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Error fetching recipes:', error);
        return [];
    }
}

async function getRecipeDetails(recipeId) {
    try {
        const url = `${SPOONACULAR_BASE_URL}/${recipeId}/information?apiKey=${SPOONACULAR_API_KEY}`;
        
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Error fetching recipe details:', error);
        return null;
    }
}

async function searchRecipes(query, cuisine = '', diet = '', number = 10) {
    try {
        const url = `${SPOONACULAR_BASE_URL}/search?apiKey=${SPOONACULAR_API_KEY}&query=${query}&cuisine=${cuisine}&diet=${diet}&number=${number}`;
        
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        return data.results || [];
    } catch (error) {
        console.error('Error searching recipes:', error);
        return [];
    }
}

// Convert Spoonacular recipe to our format
function convertSpoonacularRecipe(spoonacularRecipe) {
    return {
        id: spoonacularRecipe.id.toString(),
        name: spoonacularRecipe.title,
        cuisine: spoonacularRecipe.cuisines ? spoonacularRecipe.cuisines[0] : 'Unknown',
        difficulty: 'Medium', // Spoonacular doesn't provide difficulty
        time: spoonacularRecipe.readyInMinutes ? `${spoonacularRecipe.readyInMinutes} min` : 'Unknown',
        description: spoonacularRecipe.summary ? spoonacularRecipe.summary.replace(/<[^>]*>/g, '') : 'Delicious recipe',
        ingredients: spoonacularRecipe.usedIngredients ? 
            spoonacularRecipe.usedIngredients.map(ing => ing.name.toLowerCase().replace(/\s+/g, '-')) : [],
        missingIngredients: spoonacularRecipe.missedIngredients ? 
            spoonacularRecipe.missedIngredients.map(ing => ing.name.toLowerCase().replace(/\s+/g, '-')) : [],
        instructions: spoonacularRecipe.analyzedInstructions ? 
            spoonacularRecipe.analyzedInstructions[0]?.steps?.map(step => step.step) : []
    };
}

// Recipe Database - 178+ recipes across 10+ cuisines
// This will be replaced with API calls
const RECIPE_DATABASE = {
    // ITALIAN CUISINE (30 recipes)
    "pasta-carbonara": {
        name: "Pasta Carbonara",
        ingredients: [
        { name: "pasta", quantity: "400g" },
        { name: "eggs", quantity: "3 large" },
        { name: "cheese", quantity: "200g grated" },
        { name: "bacon", quantity: "150g" },
        { name: "garlic", quantity: "3 cloves" },
        { name: "olive-oil", quantity: "3 tbsp" }
    ],
        difficulty: "Medium",
        time: "25 min",
        cuisine: "Italian",
        description: "Classic Italian pasta with eggs, cheese, and bacon",
        image: "https://images.unsplash.com/photo-1621996346565-e3dbc353d2e5?w=400&h=300&fit=crop&crop=center",
        instructions: [
            "Bring a large pot of salted water to boil and cook pasta according to package directions until al dente.",
            "While pasta cooks, cut bacon into small pieces and cook in a large skillet over medium heat until crispy.",
            "Remove bacon from skillet and set aside, leaving the fat in the pan.",
            "Add minced garlic to the bacon fat and cook for 1 minute until fragrant.",
            "In a bowl, whisk together eggs and grated cheese until well combined.",
            "Drain pasta, reserving 1 cup of pasta water.",
            "Add hot pasta to the skillet with garlic and bacon fat, tossing to combine.",
            "Remove skillet from heat and quickly add the egg-cheese mixture, tossing constantly.",
            "Add reserved pasta water gradually while tossing until sauce is creamy.",
            "Add cooked bacon back to the pasta and toss to combine.",
            "Season with salt and black pepper to taste.",
            "Serve immediately with extra grated cheese on top."
        ]
    },
    "vegetarian-pasta": {
        name: "Vegetarian Pasta",
        ingredients: [
        { name: "pasta", quantity: "400g" },
        { name: "tomatoes", quantity: "400g" },
        { name: "cheese", quantity: "200g grated" },
        { name: "garlic", quantity: "3 cloves" },
        { name: "olive-oil", quantity: "3 tbsp" },
        { name: "herbs", quantity: "2 tsp" }
    ],
        difficulty: "Easy",
        time: "15 min",
        cuisine: "Italian",
        description: "Simple vegetarian pasta with fresh tomatoes and herbs",
        instructions: [
            "Bring a large pot of salted water to boil and cook pasta according to package directions until al dente.",
            "While pasta cooks, heat olive oil in a large skillet over medium heat.",
            "Add minced garlic and cook for 1 minute until fragrant.",
            "Add diced tomatoes and cook for 3-4 minutes until they start to break down.",
            "Season with salt, pepper, and dried herbs.",
            "Drain pasta and add to the skillet with tomato mixture.",
            "Toss everything together and add grated cheese.",
            "Cook for 1-2 minutes until cheese melts and pasta is well coated.",
            "Garnish with fresh herbs and serve immediately."
        ]
    },
    "pasta-alfredo": {
        name: "Pasta Alfredo",
        ingredients: [
        { name: "pasta", quantity: "400g" },
        { name: "cheese", quantity: "200g grated" },
        { name: "butter", quantity: "100g" },
        { name: "garlic", quantity: "3 cloves" },
        { name: "milk", quantity: "300ml" },
        { name: "herbs", quantity: "2 tsp" }
    ],
        difficulty: "Easy",
        time: "20 min",
        cuisine: "Italian",
        description: "Creamy pasta with parmesan cheese sauce",
        instructions: [
            "Bring a large pot of salted water to boil and cook pasta according to package directions until al dente.",
            "While pasta cooks, melt butter in a large skillet over medium heat.",
            "Add minced garlic and cook for 1 minute until fragrant.",
            "Add milk and bring to a gentle simmer.",
            "Gradually add grated cheese, stirring constantly until melted and smooth.",
            "Season with salt, pepper, and herbs.",
            "Drain pasta and add to the sauce.",
            "Toss pasta with sauce until well coated.",
            "Cook for 1-2 minutes until sauce thickens slightly.",
            "Serve immediately with extra cheese and herbs on top."
        ]
    },
    "vegetarian-pizza": {
        name: "Vegetarian Pizza",
        ingredients: [
        { name: "bread", quantity: "to taste" },
        { name: "cheese", quantity: "200g grated" },
        { name: "tomatoes", quantity: "400g" },
        { name: "vegetables", quantity: "to taste" },
        { name: "olive-oil", quantity: "3 tbsp" },
        { name: "herbs", quantity: "2 tsp" }
    ],
        difficulty: "Easy",
        time: "30 min",
        cuisine: "Italian",
        description: "Homemade pizza with fresh vegetables and herbs",
        instructions: [
            "Preheat oven to 450°F (230°C).",
            "Roll out pizza dough on a floured surface to desired thickness.",
            "Place dough on a greased baking sheet or pizza stone.",
            "Brush dough with olive oil and spread tomato sauce evenly.",
            "Sprinkle grated cheese over the sauce.",
            "Add sliced vegetables (bell peppers, mushrooms, onions, etc.) on top.",
            "Season with salt, pepper, and dried herbs.",
            "Bake for 12-15 minutes until crust is golden and cheese is bubbly.",
            "Remove from oven and let cool for 2-3 minutes.",
            "Garnish with fresh herbs, slice, and serve hot."
        ]
    },
    "spaghetti-bolognese": {
        name: "Spaghetti Bolognese",
        ingredients: [
        { name: "pasta", quantity: "400g" },
        { name: "beef", quantity: "500g" },
        { name: "tomatoes", quantity: "400g" },
        { name: "onions", quantity: "2 medium" },
        { name: "garlic", quantity: "3 cloves" },
        { name: "olive-oil", quantity: "3 tbsp" },
        { name: "herbs", quantity: "2 tsp" }
    ],
        difficulty: "Medium",
        time: "45 min",
        cuisine: "Italian",
        description: "Rich meat sauce with spaghetti and fresh herbs",
        image: "https://images.unsplash.com/photo-1551892374-ecf8754cf8b0?w=400&h=300&fit=crop&crop=center",
        instructions: [
            "Heat olive oil in a large pot over medium heat.",
            "Add diced onions and cook for 5 minutes until softened.",
            "Add minced garlic and cook for 1 minute until fragrant.",
            "Add ground beef and cook, breaking it up, until browned.",
            "Add canned tomatoes, breaking them up with a spoon.",
            "Season with salt, pepper, and dried herbs.",
            "Simmer sauce for 30-40 minutes, stirring occasionally.",
            "Meanwhile, cook spaghetti according to package directions.",
            "Drain pasta and serve with bolognese sauce on top.",
            "Garnish with fresh herbs and grated cheese."
        ]
    },
    "margherita-pizza": {
        name: "Margherita Pizza",
        ingredients: [
        { name: "bread", quantity: "to taste" },
        { name: "cheese", quantity: "200g grated" },
        { name: "tomatoes", quantity: "400g" },
        { name: "olive-oil", quantity: "3 tbsp" },
        { name: "herbs", quantity: "2 tsp" },
        { name: "garlic", quantity: "3 cloves" }
    ],
        difficulty: "Easy",
        time: "25 min",
        cuisine: "Italian",
        description: "Classic pizza with tomato, mozzarella, and basil",
        instructions: [
            "Preheat oven to 475°F (245°C).",
            "Roll out pizza dough and place on a greased baking sheet.",
            "Brush dough with olive oil and minced garlic.",
            "Spread tomato sauce evenly over the dough.",
            "Tear fresh mozzarella into pieces and distribute over sauce.",
            "Add sliced tomatoes and fresh basil leaves.",
            "Drizzle with olive oil and season with salt and pepper.",
            "Bake for 10-12 minutes until crust is golden and cheese is melted.",
            "Remove from oven and let cool for 2 minutes.",
            "Slice and serve immediately."
        ]
    },
    "chicken-parmesan": {
        name: "Chicken Parmesan",
        ingredients: [
        { name: "chicken", quantity: "500g" },
        { name: "cheese", quantity: "200g grated" },
        { name: "bread", quantity: "to taste" },
        { name: "tomatoes", quantity: "400g" },
        { name: "olive-oil", quantity: "3 tbsp" },
        { name: "garlic", quantity: "3 cloves" },
        { name: "herbs", quantity: "2 tsp" }
    ],
        difficulty: "Medium",
        time: "40 min",
        cuisine: "Italian",
        description: "Breaded chicken with marinara sauce and melted cheese",
        instructions: [
            "Preheat oven to 400°F (200°C).",
            "Pound chicken breasts to even thickness.",
            "Season chicken with salt and pepper.",
            "Dredge chicken in flour, then beaten eggs, then breadcrumbs.",
            "Heat olive oil in a large skillet over medium-high heat.",
            "Cook chicken for 3-4 minutes per side until golden brown.",
            "Place chicken in a baking dish.",
            "Top with marinara sauce and grated cheese.",
            "Bake for 15-20 minutes until cheese is melted and bubbly.",
            "Garnish with fresh herbs and serve over pasta."
        ]
    },
    "risotto-mushroom": {
        name: "Mushroom Risotto",
        ingredients: [
        { name: "rice", quantity: "300g" },
        { name: "mushrooms", quantity: "300g" },
        { name: "cheese", quantity: "200g grated" },
        { name: "onions", quantity: "2 medium" },
        { name: "garlic", quantity: "3 cloves" },
        { name: "olive-oil", quantity: "3 tbsp" },
        { name: "herbs", quantity: "2 tsp" }
    ],
        difficulty: "Hard",
        time: "35 min",
        cuisine: "Italian",
        description: "Creamy rice dish with wild mushrooms and parmesan",
        instructions: [
            "Heat vegetable or chicken broth in a saucepan and keep warm.",
            "Heat olive oil in a large skillet over medium heat.",
            "Add diced onions and cook for 5 minutes until softened.",
            "Add minced garlic and sliced mushrooms, cook for 5 minutes.",
            "Add arborio rice and stir for 2 minutes until lightly toasted.",
            "Add wine and stir until absorbed.",
            "Add warm broth one ladle at a time, stirring constantly.",
            "Continue adding broth and stirring for 18-20 minutes.",
            "Stir in grated cheese and herbs.",
            "Season with salt and pepper, serve immediately."
        ]
    },
    "lasagna": {
        name: "Lasagna",
        ingredients: [
        { name: "pasta", quantity: "400g" },
        { name: "beef", quantity: "500g" },
        { name: "cheese", quantity: "200g grated" },
        { name: "tomatoes", quantity: "400g" },
        { name: "onions", quantity: "2 medium" },
        { name: "garlic", quantity: "3 cloves" },
        { name: "herbs", quantity: "2 tsp" }
    ],
        difficulty: "Hard",
        time: "60 min",
        cuisine: "Italian",
        description: "Layered pasta dish with meat sauce and cheese",
        instructions: [
            "Preheat oven to 375°F (190°C).",
            "Cook lasagna noodles according to package directions until al dente.",
            "Prepare your meat sauce and cheese mixture.",
            "In a baking dish, layer noodles, sauce, and cheese.",
            "Repeat layers, ending with cheese on top.",
            "Cover with foil and bake for 25 minutes.",
            "Remove foil and bake for another 25 minutes until bubbly.",
            "Let rest for 10 minutes before serving."
        ]
    },
    "fettuccine-alfredo": {
        name: "Fettuccine Alfredo",
        ingredients: [
        { name: "pasta", quantity: "400g" },
        { name: "cheese", quantity: "200g grated" },
        { name: "butter", quantity: "100g" },
        { name: "garlic", quantity: "3 cloves" },
        { name: "milk", quantity: "300ml" },
        { name: "herbs", quantity: "2 tsp" },
        { name: "olive-oil", quantity: "3 tbsp" }
    ],
        difficulty: "Easy",
        time: "20 min",
        cuisine: "Italian",
        description: "Wide pasta with creamy alfredo sauce",
        instructions: [
            "Bring a large pot of salted water to boil and cook pasta according to package directions until al dente.",
            "While pasta cooks, prepare the sauce in a large skillet over medium heat.",
            "Add your main ingredients and cook until heated through.",
            "Season with salt, pepper, and herbs to taste.",
            "Drain pasta and add to the skillet with sauce.",
            "Toss everything together until well combined.",
            "Serve immediately with grated cheese on top."
        ]
    },
    "bruschetta": {
        name: "Bruschetta",
        ingredients: [
        { name: "bread", quantity: "to taste" },
        { name: "tomatoes", quantity: "400g" },
        { name: "garlic", quantity: "3 cloves" },
        { name: "olive-oil", quantity: "3 tbsp" },
        { name: "herbs", quantity: "2 tsp" },
        { name: "onions", quantity: "2 medium" }
    ],
        difficulty: "Easy",
        time: "15 min",
        cuisine: "Italian",
        description: "Toasted bread with fresh tomato and herb topping",
        instructions: [
            "Preheat oven to 400°F (200°C).",
            "Slice bread and brush with olive oil.",
            "Toast bread in oven for 5-7 minutes until golden.",
            "Mix diced tomatoes with garlic, herbs, and olive oil.",
            "Season with salt and pepper.",
            "Top toasted bread with tomato mixture.",
            "Drizzle with balsamic vinegar and serve immediately."
        ]
    },
    "chicken-marsala": {
        name: "Chicken Marsala",
        ingredients: [
        { name: "chicken", quantity: "500g" },
        { name: "mushrooms", quantity: "300g" },
        { name: "wine", quantity: "150ml" },
        { name: "butter", quantity: "100g" },
        { name: "garlic", quantity: "3 cloves" },
        { name: "olive-oil", quantity: "3 tbsp" },
        { name: "herbs", quantity: "2 tsp" }
    ],
        difficulty: "Medium",
        time: "30 min",
        cuisine: "Italian",
        description: "Chicken in marsala wine sauce with mushrooms",
        instructions: [
            "Preheat oven to 400°F (200°C).",
            "Season chicken with salt, pepper, and herbs.",
            "Heat olive oil in a large skillet over medium-high heat.",
            "Cook chicken for 3-4 minutes per side until golden brown.",
            "Transfer to a baking dish and add sauce.",
            "Bake for 15-20 minutes until chicken is cooked through.",
            "Garnish with fresh herbs and serve."
        ]
    },
    "penne-arrabbiata": {
        name: "Penne Arrabbiata",
        ingredients: [
        { name: "pasta", quantity: "400g" },
        { name: "tomatoes", quantity: "400g" },
        { name: "garlic", quantity: "3 cloves" },
        { name: "olive-oil", quantity: "3 tbsp" },
        { name: "herbs", quantity: "2 tsp" },
        { name: "chili", quantity: "to taste" },
        { name: "onions", quantity: "2 medium" }
    ],
        difficulty: "Easy",
        time: "20 min",
        cuisine: "Italian",
        description: "Spicy pasta with tomato and chili sauce",
        instructions: [
            "Bring a large pot of salted water to boil and cook pasta according to package directions until al dente.",
            "While pasta cooks, prepare the sauce in a large skillet over medium heat.",
            "Add your main ingredients and cook until heated through.",
            "Season with salt, pepper, and herbs to taste.",
            "Drain pasta and add to the skillet with sauce.",
            "Toss everything together until well combined.",
            "Serve immediately with grated cheese on top."
        ]
    },
    "eggplant-parmesan": {
        name: "Eggplant Parmesan",
        ingredients: [
        { name: "eggplant", quantity: "1 large" },
        { name: "cheese", quantity: "200g grated" },
        { name: "tomatoes", quantity: "400g" },
        { name: "bread", quantity: "to taste" },
        { name: "olive-oil", quantity: "3 tbsp" },
        { name: "garlic", quantity: "3 cloves" },
        { name: "herbs", quantity: "2 tsp" }
    ],
        difficulty: "Medium",
        time: "45 min",
        cuisine: "Italian",
        description: "Breaded eggplant with marinara and cheese",
        instructions: [
            "Gather all ingredients and prepare your workspace.",
            "Follow the recipe steps in order.",
            "Taste and adjust seasoning as needed.",
            "Cook until ingredients are properly heated through.",
            "Serve immediately while hot.",
            "Garnish with fresh herbs if desired."
        ]
    },
    "osso-buco": {
        name: "Osso Buco",
        ingredients: [
        { name: "beef", quantity: "500g" },
        { name: "wine", quantity: "150ml" },
        { name: "tomatoes", quantity: "400g" },
        { name: "onions", quantity: "2 medium" },
        { name: "garlic", quantity: "3 cloves" },
        { name: "olive-oil", quantity: "3 tbsp" },
        { name: "herbs", quantity: "2 tsp" }
    ],
        difficulty: "Hard",
        time: "90 min",
        cuisine: "Italian",
        description: "Braised veal shanks with vegetables and wine",
        instructions: [
            "Gather all ingredients and prepare your workspace.",
            "Follow the recipe steps in order.",
            "Taste and adjust seasoning as needed.",
            "Cook until ingredients are properly heated through.",
            "Serve immediately while hot.",
            "Garnish with fresh herbs if desired."
        ]
    },
    "gnocchi": {
        name: "Gnocchi",
        ingredients: [
        { name: "potatoes", quantity: "1kg" },
        { name: "flour", quantity: "200g" },
        { name: "cheese", quantity: "200g grated" },
        { name: "tomatoes", quantity: "400g" },
        { name: "garlic", quantity: "3 cloves" },
        { name: "olive-oil", quantity: "3 tbsp" },
        { name: "herbs", quantity: "2 tsp" }
    ],
        difficulty: "Hard",
        time: "50 min",
        cuisine: "Italian",
        description: "Potato dumplings with tomato sauce",
        instructions: [
            "Gather all ingredients and prepare your workspace.",
            "Follow the recipe steps in order.",
            "Taste and adjust seasoning as needed.",
            "Cook until ingredients are properly heated through.",
            "Serve immediately while hot.",
            "Garnish with fresh herbs if desired."
        ]
    },
    "cacio-e-pepe": {
        name: "Cacio e Pepe",
        ingredients: [
        { name: "pasta", quantity: "400g" },
        { name: "cheese", quantity: "200g grated" },
        { name: "pepper", quantity: "1/2 tsp" },
        { name: "olive-oil", quantity: "3 tbsp" },
        { name: "butter", quantity: "100g" }
    ],
        difficulty: "Medium",
        time: "15 min",
        cuisine: "Italian",
        description: "Simple pasta with cheese and black pepper",
        instructions: [
            "Gather all ingredients and prepare your workspace.",
            "Follow the recipe steps in order.",
            "Taste and adjust seasoning as needed.",
            "Cook until ingredients are properly heated through.",
            "Serve immediately while hot.",
            "Garnish with fresh herbs if desired."
        ]
    },
    "chicken-piccata": {
        name: "Chicken Piccata",
        ingredients: [
        { name: "chicken", quantity: "500g" },
        { name: "lemon", quantity: "to taste" },
        { name: "capers", quantity: "to taste" },
        { name: "butter", quantity: "100g" },
        { name: "garlic", quantity: "3 cloves" },
        { name: "olive-oil", quantity: "3 tbsp" },
        { name: "herbs", quantity: "2 tsp" }
    ],
        difficulty: "Medium",
        time: "25 min",
        cuisine: "Italian",
        description: "Chicken in lemon and caper sauce",
        instructions: [
            "Preheat oven to 400°F (200°C).",
            "Season chicken with salt, pepper, and herbs.",
            "Heat olive oil in a large skillet over medium-high heat.",
            "Cook chicken for 3-4 minutes per side until golden brown.",
            "Transfer to a baking dish and add sauce.",
            "Bake for 15-20 minutes until chicken is cooked through.",
            "Garnish with fresh herbs and serve."
        ]
    },
    "minestrone": {
        name: "Minestrone Soup",
        ingredients: [
        { name: "vegetables", quantity: "to taste" },
        { name: "tomatoes", quantity: "400g" },
        { name: "beans", quantity: "to taste" },
        { name: "pasta", quantity: "400g" },
        { name: "onions", quantity: "2 medium" },
        { name: "garlic", quantity: "3 cloves" },
        { name: "olive-oil", quantity: "3 tbsp" },
        { name: "herbs", quantity: "2 tsp" }
    ],
        difficulty: "Easy",
        time: "40 min",
        cuisine: "Italian",
        description: "Hearty vegetable soup with pasta and beans",
        instructions: [
            "Heat olive oil in a large pot over medium heat.",
            "Add onions and cook until softened.",
            "Add garlic and cook for 1 minute until fragrant.",
            "Add vegetables and cook for 5 minutes.",
            "Add broth and bring to a boil.",
            "Reduce heat and simmer for 20-30 minutes.",
            "Season with salt, pepper, and herbs.",
            "Serve hot with grated cheese on top."
        ]
    },
    "tiramisu": {
        name: "Tiramisu",
        ingredients: [
        { name: "eggs", quantity: "3 large" },
        { name: "cheese", quantity: "200g grated" },
        { name: "coffee", quantity: "to taste" },
        { name: "cocoa", quantity: "to taste" },
        { name: "sugar", quantity: "2 tbsp" },
        { name: "ladyfingers", quantity: "to taste" }
    ],
        difficulty: "Hard",
        time: "120 min",
        cuisine: "Italian",
        description: "Classic Italian dessert with coffee and mascarpone",
        instructions: [
            "Brew strong coffee and let cool.",
            "Separate eggs and beat yolks with sugar until pale.",
            "Add mascarpone cheese and mix until smooth.",
            "Beat egg whites until stiff peaks form.",
            "Fold egg whites into mascarpone mixture.",
            "Dip ladyfingers in coffee and layer in dish.",
            "Spread half the mascarpone mixture over ladyfingers.",
            "Repeat layers and dust with cocoa powder.",
            "Refrigerate for at least 4 hours before serving."
        ]
    },
    "pasta-puttanesca": {
        name: "Pasta Puttanesca",
        ingredients: [
        { name: "pasta", quantity: "400g" },
        { name: "tomatoes", quantity: "400g" },
        { name: "olives", quantity: "to taste" },
        { name: "capers", quantity: "to taste" },
        { name: "garlic", quantity: "3 cloves" },
        { name: "olive-oil", quantity: "3 tbsp" },
        { name: "herbs", quantity: "2 tsp" }
    ],
        difficulty: "Easy",
        time: "20 min",
        cuisine: "Italian",
        description: "Spicy pasta with olives, capers, and anchovies",
        instructions: [
            "Bring a large pot of salted water to boil and cook pasta according to package directions until al dente.",
            "While pasta cooks, prepare the sauce in a large skillet over medium heat.",
            "Add your main ingredients and cook until heated through.",
            "Season with salt, pepper, and herbs to taste.",
            "Drain pasta and add to the skillet with sauce.",
            "Toss everything together until well combined.",
            "Serve immediately with grated cheese on top."
        ]
    },
    "chicken-saltimbocca": {
        name: "Chicken Saltimbocca",
        ingredients: [
        { name: "chicken", quantity: "500g" },
        { name: "prosciutto", quantity: "to taste" },
        { name: "sage", quantity: "to taste" },
        { name: "cheese", quantity: "200g grated" },
        { name: "wine", quantity: "150ml" },
        { name: "butter", quantity: "100g" },
        { name: "olive-oil", quantity: "3 tbsp" }
    ],
        difficulty: "Medium",
        time: "30 min",
        cuisine: "Italian",
        description: "Chicken wrapped with prosciutto and sage",
        instructions: [
            "Preheat oven to 400°F (200°C).",
            "Season chicken with salt, pepper, and herbs.",
            "Heat olive oil in a large skillet over medium-high heat.",
            "Cook chicken for 3-4 minutes per side until golden brown.",
            "Transfer to a baking dish and add sauce.",
            "Bake for 15-20 minutes until chicken is cooked through.",
            "Garnish with fresh herbs and serve."
        ]
    },
    "risotto-milanese": {
        name: "Risotto Milanese",
        ingredients: [
        { name: "rice", quantity: "300g" },
        { name: "saffron", quantity: "to taste" },
        { name: "cheese", quantity: "200g grated" },
        { name: "onions", quantity: "2 medium" },
        { name: "butter", quantity: "100g" },
        { name: "wine", quantity: "150ml" },
        { name: "olive-oil", quantity: "3 tbsp" }
    ],
        difficulty: "Hard",
        time: "30 min",
        cuisine: "Italian",
        description: "Saffron risotto from Milan",
        instructions: [
            "Heat vegetable or chicken broth in a saucepan and keep warm.",
            "Heat olive oil in a large skillet over medium heat.",
            "Add diced onions and cook for 5 minutes until softened.",
            "Add minced garlic and cook for 1 minute until fragrant.",
            "Add arborio rice and stir for 2 minutes until lightly toasted.",
            "Add wine and stir until absorbed.",
            "Add warm broth one ladle at a time, stirring constantly.",
            "Continue adding broth and stirring for 18-20 minutes.",
            "Stir in grated cheese and herbs.",
            "Season with salt and pepper, serve immediately."
        ]
    },
    "pasta-primavera": {
        name: "Pasta Primavera",
        ingredients: [
        { name: "pasta", quantity: "400g" },
        { name: "vegetables", quantity: "to taste" },
        { name: "cheese", quantity: "200g grated" },
        { name: "garlic", quantity: "3 cloves" },
        { name: "olive-oil", quantity: "3 tbsp" },
        { name: "herbs", quantity: "2 tsp" },
        { name: "cream", quantity: "to taste" }
    ],
        difficulty: "Easy",
        time: "25 min",
        cuisine: "Italian",
        description: "Pasta with spring vegetables",
        instructions: [
            "Bring a large pot of salted water to boil and cook pasta according to package directions until al dente.",
            "While pasta cooks, prepare the sauce in a large skillet over medium heat.",
            "Add your main ingredients and cook until heated through.",
            "Season with salt, pepper, and herbs to taste.",
            "Drain pasta and add to the skillet with sauce.",
            "Toss everything together until well combined.",
            "Serve immediately with grated cheese on top."
        ]
    },
    "chicken-cacciatore": {
        name: "Chicken Cacciatore",
        ingredients: [
        { name: "chicken", quantity: "500g" },
        { name: "tomatoes", quantity: "400g" },
        { name: "mushrooms", quantity: "300g" },
        { name: "onions", quantity: "2 medium" },
        { name: "garlic", quantity: "3 cloves" },
        { name: "olive-oil", quantity: "3 tbsp" },
        { name: "herbs", quantity: "2 tsp" },
        { name: "wine", quantity: "150ml" }
    ],
        difficulty: "Medium",
        time: "50 min",
        cuisine: "Italian",
        description: "Hunter-style chicken with vegetables",
        instructions: [
            "Preheat oven to 400°F (200°C).",
            "Season chicken with salt, pepper, and herbs.",
            "Heat olive oil in a large skillet over medium-high heat.",
            "Cook chicken for 3-4 minutes per side until golden brown.",
            "Transfer to a baking dish and add sauce.",
            "Bake for 15-20 minutes until chicken is cooked through.",
            "Garnish with fresh herbs and serve."
        ]
    },
    "pasta-aglio-olio": {
        name: "Pasta Aglio e Olio",
        ingredients: [
        { name: "pasta", quantity: "400g" },
        { name: "garlic", quantity: "3 cloves" },
        { name: "olive-oil", quantity: "3 tbsp" },
        { name: "chili", quantity: "to taste" },
        { name: "herbs", quantity: "2 tsp" },
        { name: "parsley", quantity: "1/4 cup" }
    ],
        difficulty: "Easy",
        time: "15 min",
        cuisine: "Italian",
        description: "Simple pasta with garlic and oil",
        instructions: [
            "Bring a large pot of salted water to boil and cook pasta according to package directions until al dente.",
            "While pasta cooks, prepare the sauce in a large skillet over medium heat.",
            "Add your main ingredients and cook until heated through.",
            "Season with salt, pepper, and herbs to taste.",
            "Drain pasta and add to the skillet with sauce.",
            "Toss everything together until well combined.",
            "Serve immediately with grated cheese on top."
        ]
    },
    "chicken-francese": {
        name: "Chicken Francese",
        ingredients: [
        { name: "chicken", quantity: "500g" },
        { name: "lemon", quantity: "to taste" },
        { name: "wine", quantity: "150ml" },
        { name: "butter", quantity: "100g" },
        { name: "garlic", quantity: "3 cloves" },
        { name: "olive-oil", quantity: "3 tbsp" },
        { name: "herbs", quantity: "2 tsp" },
        { name: "eggs", quantity: "3 large" }
    ],
        difficulty: "Medium",
        time: "30 min",
        cuisine: "Italian",
        description: "Chicken in lemon and white wine sauce",
        instructions: [
            "Preheat oven to 400°F (200°C).",
            "Season chicken with salt, pepper, and herbs.",
            "Heat olive oil in a large skillet over medium-high heat.",
            "Cook chicken for 3-4 minutes per side until golden brown.",
            "Transfer to a baking dish and add sauce.",
            "Bake for 15-20 minutes until chicken is cooked through.",
            "Garnish with fresh herbs and serve."
        ]
    },
    "pasta-vongole": {
        name: "Pasta Vongole",
        ingredients: [
        { name: "pasta", quantity: "400g" },
        { name: "clams", quantity: "to taste" },
        { name: "garlic", quantity: "3 cloves" },
        { name: "olive-oil", quantity: "3 tbsp" },
        { name: "white-wine", quantity: "150ml" },
        { name: "herbs", quantity: "2 tsp" },
        { name: "chili", quantity: "to taste" }
    ],
        difficulty: "Medium",
        time: "25 min",
        cuisine: "Italian",
        description: "Pasta with clams in white wine sauce",
        instructions: [
            "Bring a large pot of salted water to boil and cook pasta according to package directions until al dente.",
            "While pasta cooks, prepare the sauce in a large skillet over medium heat.",
            "Add your main ingredients and cook until heated through.",
            "Season with salt, pepper, and herbs to taste.",
            "Drain pasta and add to the skillet with sauce.",
            "Toss everything together until well combined.",
            "Serve immediately with grated cheese on top."
        ]
    },
    "chicken-scarpariello": {
        name: "Chicken Scarpariello",
        ingredients: [
        { name: "chicken", quantity: "500g" },
        { name: "sausage", quantity: "300g" },
        { name: "peppers", quantity: "to taste" },
        { name: "onions", quantity: "2 medium" },
        { name: "garlic", quantity: "3 cloves" },
        { name: "olive-oil", quantity: "3 tbsp" },
        { name: "herbs", quantity: "2 tsp" },
        { name: "wine", quantity: "150ml" }
    ],
        difficulty: "Medium",
        time: "45 min",
        cuisine: "Italian",
        description: "Chicken and sausage with peppers",
        instructions: [
            "Preheat oven to 400°F (200°C).",
            "Season chicken with salt, pepper, and herbs.",
            "Heat olive oil in a large skillet over medium-high heat.",
            "Cook chicken for 3-4 minutes per side until golden brown.",
            "Transfer to a baking dish and add sauce.",
            "Bake for 15-20 minutes until chicken is cooked through.",
            "Garnish with fresh herbs and serve."
        ]
    },
    "pasta-pesto": {
        name: "Pasta Pesto",
        ingredients: [
        { name: "pasta", quantity: "400g" },
        { name: "basil", quantity: "1/4 cup" },
        { name: "cheese", quantity: "200g grated" },
        { name: "garlic", quantity: "3 cloves" },
        { name: "olive-oil", quantity: "3 tbsp" },
        { name: "pine-nuts", quantity: "to taste" }
    ],
        difficulty: "Easy",
        time: "20 min",
        cuisine: "Italian",
        description: "Pasta with fresh basil pesto sauce",
        instructions: [
            "Bring a large pot of salted water to boil and cook pasta according to package directions until al dente.",
            "While pasta cooks, prepare the sauce in a large skillet over medium heat.",
            "Add your main ingredients and cook until heated through.",
            "Season with salt, pepper, and herbs to taste.",
            "Drain pasta and add to the skillet with sauce.",
            "Toss everything together until well combined.",
            "Serve immediately with grated cheese on top."
        ]
    },
    "chicken-milanese": {
        name: "Chicken Milanese",
        ingredients: [
        { name: "chicken", quantity: "500g" },
        { name: "bread", quantity: "to taste" },
        { name: "cheese", quantity: "200g grated" },
        { name: "eggs", quantity: "3 large" },
        { name: "olive-oil", quantity: "3 tbsp" },
        { name: "lemon", quantity: "to taste" },
        { name: "arugula", quantity: "to taste" }
    ],
        difficulty: "Medium",
        time: "30 min",
        cuisine: "Italian",
        description: "Breaded chicken cutlet with arugula salad",
        instructions: [
            "Preheat oven to 400°F (200°C).",
            "Season chicken with salt, pepper, and herbs.",
            "Heat olive oil in a large skillet over medium-high heat.",
            "Cook chicken for 3-4 minutes per side until golden brown.",
            "Transfer to a baking dish and add sauce.",
            "Bake for 15-20 minutes until chicken is cooked through.",
            "Garnish with fresh herbs and serve."
        ]
    },

    // ASIAN CUISINE (30 recipes)
    "chicken-stir-fry": {
        name: "Chicken Stir Fry",
        ingredients: [
        { name: "chicken", quantity: "500g" },
        { name: "rice", quantity: "300g" },
        { name: "vegetables", quantity: "to taste" },
        { name: "soy-sauce", quantity: "3 tbsp" },
        { name: "garlic", quantity: "3 cloves" },
        { name: "olive-oil", quantity: "3 tbsp" }
    ],
        difficulty: "Easy",
        time: "20 min",
        cuisine: "Asian",
        description: "Quick and healthy chicken with vegetables over rice",
        instructions: [
            "Cut chicken into bite-sized pieces and season with salt and pepper.",
            "Heat oil in a large wok or skillet over high heat.",
            "Add chicken and cook for 3-4 minutes until golden and cooked through.",
            "Remove chicken from pan and set aside.",
            "Add more oil to the pan and add minced garlic, cooking for 30 seconds.",
            "Add mixed vegetables and stir-fry for 3-4 minutes until crisp-tender.",
            "Return chicken to the pan with vegetables.",
            "Add soy sauce and toss everything together for 1-2 minutes.",
            "Serve immediately over cooked rice.",
            "Garnish with sesame seeds or green onions if desired."
        ]
    },
    "salmon-teriyaki": {
        name: "Salmon Teriyaki",
        ingredients: [
        { name: "salmon", quantity: "600g" },
        { name: "rice", quantity: "300g" },
        { name: "soy-sauce", quantity: "3 tbsp" },
        { name: "garlic", quantity: "3 cloves" },
        { name: "ginger", quantity: "1 tbsp" },
        { name: "honey", quantity: "2 tbsp" }
    ],
        difficulty: "Medium",
        time: "25 min",
        cuisine: "Asian",
        description: "undefined",
        instructions: [
            "Gather all ingredients and prepare your workspace.",
            "Follow the recipe steps in order.",
            "Taste and adjust seasoning as needed.",
            "Cook until ingredients are properly heated through.",
            "Serve immediately while hot.",
            "Garnish with fresh herbs if desired."
        ]
    },
    "beef-stir-fry": {
        name: "Beef Stir Fry",
        ingredients: [
        { name: "beef", quantity: "500g" },
        { name: "rice", quantity: "300g" },
        { name: "vegetables", quantity: "to taste" },
        { name: "soy-sauce", quantity: "3 tbsp" },
        { name: "garlic", quantity: "3 cloves" },
        { name: "ginger", quantity: "1 tbsp" }
    ],
        difficulty: "Medium",
        time: "25 min",
        cuisine: "Asian",
        description: "Tender beef strips with mixed vegetables over rice",
        instructions: [
            "Heat oil in a large wok or skillet over high heat.",
            "Add protein and cook until almost done, then remove from pan.",
            "Add vegetables and stir-fry for 2-3 minutes until crisp-tender.",
            "Add sauce and return protein to the pan.",
            "Toss everything together and cook for 1-2 minutes.",
            "Serve immediately over rice or noodles."
        ]
    },
    "chicken-fried-rice": {
        name: "Chicken Fried Rice",
        ingredients: [
        { name: "chicken", quantity: "500g" },
        { name: "rice", quantity: "300g" },
        { name: "eggs", quantity: "3 large" },
        { name: "vegetables", quantity: "to taste" },
        { name: "soy-sauce", quantity: "3 tbsp" },
        { name: "garlic", quantity: "3 cloves" },
        { name: "ginger", quantity: "1 tbsp" },
        { name: "olive-oil", quantity: "3 tbsp" }
    ],
        difficulty: "Easy",
        time: "20 min",
        cuisine: "Asian",
        description: "Classic fried rice with chicken and vegetables",
        instructions: [
            "Heat oil in a large wok or skillet over high heat.",
            "Add protein and cook until almost done, then remove from pan.",
            "Add vegetables and stir-fry for 2-3 minutes until crisp-tender.",
            "Add sauce and return protein to the pan.",
            "Toss everything together and cook for 1-2 minutes.",
            "Serve immediately over rice or noodles."
        ]
    },
    "beef-broccoli": {
        name: "Beef and Broccoli",
        ingredients: [
        { name: "beef", quantity: "500g" },
        { name: "broccoli", quantity: "300g" },
        { name: "rice", quantity: "300g" },
        { name: "soy-sauce", quantity: "3 tbsp" },
        { name: "garlic", quantity: "3 cloves" },
        { name: "ginger", quantity: "1 tbsp" },
        { name: "olive-oil", quantity: "3 tbsp" }
    ],
        difficulty: "Easy",
        time: "25 min",
        cuisine: "Asian",
        description: "Tender beef with fresh broccoli in savory sauce",
        instructions: [
            "Gather all ingredients and prepare your workspace.",
            "Follow the recipe steps in order.",
            "Taste and adjust seasoning as needed.",
            "Cook until ingredients are properly heated through.",
            "Serve immediately while hot.",
            "Garnish with fresh herbs if desired."
        ]
    },
    "chicken-ramen": {
        name: "Chicken Ramen",
        ingredients: [
        { name: "chicken", quantity: "500g" },
        { name: "noodles", quantity: "to taste" },
        { name: "eggs", quantity: "3 large" },
        { name: "vegetables", quantity: "to taste" },
        { name: "soy-sauce", quantity: "3 tbsp" },
        { name: "garlic", quantity: "3 cloves" },
        { name: "ginger", quantity: "1 tbsp" }
    ],
        difficulty: "Medium",
        time: "30 min",
        cuisine: "Asian",
        description: "Rich chicken broth with noodles and vegetables",
        instructions: [
            "Bring broth to a boil in a large pot.",
            "Add protein and cook until done.",
            "Add vegetables and cook for 2-3 minutes.",
            "Add noodles and cook according to package directions.",
            "Season with soy sauce and other seasonings.",
            "Serve hot with garnishes."
        ]
    },
    "vegetable-stir-fry": {
        name: "Vegetable Stir Fry",
        ingredients: [
        { name: "vegetables", quantity: "to taste" },
        { name: "rice", quantity: "300g" },
        { name: "soy-sauce", quantity: "3 tbsp" },
        { name: "garlic", quantity: "3 cloves" },
        { name: "ginger", quantity: "1 tbsp" },
        { name: "olive-oil", quantity: "3 tbsp" },
        { name: "tofu", quantity: "to taste" }
    ],
        difficulty: "Easy",
        time: "15 min",
        cuisine: "Asian",
        description: "Fresh vegetables stir-fried with tofu",
        instructions: [
            "Heat oil in a large wok or skillet over high heat.",
            "Add protein and cook until almost done, then remove from pan.",
            "Add vegetables and stir-fry for 2-3 minutes until crisp-tender.",
            "Add sauce and return protein to the pan.",
            "Toss everything together and cook for 1-2 minutes.",
            "Serve immediately over rice or noodles."
        ]
    },
    "chicken-kung-pao": {
        name: "Chicken Kung Pao",
        ingredients: [
        { name: "chicken", quantity: "500g" },
        { name: "peanuts", quantity: "to taste" },
        { name: "vegetables", quantity: "to taste" },
        { name: "soy-sauce", quantity: "3 tbsp" },
        { name: "garlic", quantity: "3 cloves" },
        { name: "ginger", quantity: "1 tbsp" },
        { name: "chili", quantity: "to taste" },
        { name: "rice", quantity: "300g" }
    ],
        difficulty: "Medium",
        time: "25 min",
        cuisine: "Asian",
        description: "Spicy chicken with peanuts and vegetables",
        instructions: [
            "Gather all ingredients and prepare your workspace.",
            "Follow the recipe steps in order.",
            "Taste and adjust seasoning as needed.",
            "Cook until ingredients are properly heated through.",
            "Serve immediately while hot.",
            "Garnish with fresh herbs if desired."
        ]
    },
    "beef-lo-mein": {
        name: "Beef Lo Mein",
        ingredients: [
        { name: "beef", quantity: "500g" },
        { name: "noodles", quantity: "to taste" },
        { name: "vegetables", quantity: "to taste" },
        { name: "soy-sauce", quantity: "3 tbsp" },
        { name: "garlic", quantity: "3 cloves" },
        { name: "ginger", quantity: "1 tbsp" },
        { name: "olive-oil", quantity: "3 tbsp" }
    ],
        difficulty: "Easy",
        time: "20 min",
        cuisine: "Asian",
        description: "Soft noodles with beef and vegetables",
        instructions: [
            "Gather all ingredients and prepare your workspace.",
            "Follow the recipe steps in order.",
            "Taste and adjust seasoning as needed.",
            "Cook until ingredients are properly heated through.",
            "Serve immediately while hot.",
            "Garnish with fresh herbs if desired."
        ]
    },
    "chicken-dumplings": {
        name: "Chicken Dumplings",
        ingredients: [
        { name: "chicken", quantity: "500g" },
        { name: "wonton-wrappers", quantity: "to taste" },
        { name: "vegetables", quantity: "to taste" },
        { name: "soy-sauce", quantity: "3 tbsp" },
        { name: "garlic", quantity: "3 cloves" },
        { name: "ginger", quantity: "1 tbsp" },
        { name: "sesame-oil", quantity: "to taste" }
    ],
        difficulty: "Hard",
        time: "45 min",
        cuisine: "Asian",
        description: "Handmade dumplings with chicken filling",
        instructions: [
            "Gather all ingredients and prepare your workspace.",
            "Follow the recipe steps in order.",
            "Taste and adjust seasoning as needed.",
            "Cook until ingredients are properly heated through.",
            "Serve immediately while hot.",
            "Garnish with fresh herbs if desired."
        ]
    },
    "beef-bulgogi": {
        name: "Beef Bulgogi",
        ingredients: [
        { name: "beef", quantity: "500g" },
        { name: "rice", quantity: "300g" },
        { name: "soy-sauce", quantity: "3 tbsp" },
        { name: "garlic", quantity: "3 cloves" },
        { name: "ginger", quantity: "1 tbsp" },
        { name: "honey", quantity: "2 tbsp" },
        { name: "sesame-oil", quantity: "to taste" },
        { name: "vegetables", quantity: "to taste" }
    ],
        difficulty: "Medium",
        time: "30 min",
        cuisine: "Asian",
        description: "Korean marinated beef with rice",
        instructions: [
            "Gather all ingredients and prepare your workspace.",
            "Follow the recipe steps in order.",
            "Taste and adjust seasoning as needed.",
            "Cook until ingredients are properly heated through.",
            "Serve immediately while hot.",
            "Garnish with fresh herbs if desired."
        ]
    },
    "chicken-pad-thai": {
        name: "Chicken Pad Thai",
        ingredients: [
        { name: "chicken", quantity: "500g" },
        { name: "noodles", quantity: "to taste" },
        { name: "eggs", quantity: "3 large" },
        { name: "vegetables", quantity: "to taste" },
        { name: "soy-sauce", quantity: "3 tbsp" },
        { name: "garlic", quantity: "3 cloves" },
        { name: "lime", quantity: "to taste" },
        { name: "peanuts", quantity: "to taste" }
    ],
        difficulty: "Medium",
        time: "25 min",
        cuisine: "Asian",
        description: "Thai stir-fried noodles with chicken",
        instructions: [
            "Gather all ingredients and prepare your workspace.",
            "Follow the recipe steps in order.",
            "Taste and adjust seasoning as needed.",
            "Cook until ingredients are properly heated through.",
            "Serve immediately while hot.",
            "Garnish with fresh herbs if desired."
        ]
    },
    "vegetable-spring-rolls": {
        name: "Vegetable Spring Rolls",
        ingredients: [
        { name: "vegetables", quantity: "to taste" },
        { name: "rice-paper", quantity: "to taste" },
        { name: "soy-sauce", quantity: "3 tbsp" },
        { name: "garlic", quantity: "3 cloves" },
        { name: "ginger", quantity: "1 tbsp" },
        { name: "mint", quantity: "to taste" },
        { name: "cilantro", quantity: "1/4 cup" }
    ],
        difficulty: "Medium",
        time: "35 min",
        cuisine: "Asian",
        description: "Fresh spring rolls with vegetables and herbs",
        instructions: [
            "Gather all ingredients and prepare your workspace.",
            "Follow the recipe steps in order.",
            "Taste and adjust seasoning as needed.",
            "Cook until ingredients are properly heated through.",
            "Serve immediately while hot.",
            "Garnish with fresh herbs if desired."
        ]
    },
    "chicken-biryani": {
        name: "Chicken Biryani",
        ingredients: [
        { name: "chicken", quantity: "500g" },
        { name: "rice", quantity: "300g" },
        { name: "onions", quantity: "2 medium" },
        { name: "garlic", quantity: "3 cloves" },
        { name: "ginger", quantity: "1 tbsp" },
        { name: "yogurt", quantity: "200ml" },
        { name: "spices", quantity: "to taste" },
        { name: "saffron", quantity: "to taste" }
    ],
        difficulty: "Hard",
        time: "60 min",
        cuisine: "Asian",
        description: "Fragrant spiced rice with chicken",
        instructions: [
            "Gather all ingredients and prepare your workspace.",
            "Follow the recipe steps in order.",
            "Taste and adjust seasoning as needed.",
            "Cook until ingredients are properly heated through.",
            "Serve immediately while hot.",
            "Garnish with fresh herbs if desired."
        ]
    },
    "beef-pho": {
        name: "Beef Pho",
        ingredients: [
        { name: "beef", quantity: "500g" },
        { name: "noodles", quantity: "to taste" },
        { name: "onions", quantity: "2 medium" },
        { name: "garlic", quantity: "3 cloves" },
        { name: "ginger", quantity: "1 tbsp" },
        { name: "cinnamon", quantity: "to taste" },
        { name: "star-anise", quantity: "to taste" },
        { name: "vegetables", quantity: "to taste" }
    ],
        difficulty: "Hard",
        time: "90 min",
        cuisine: "Asian",
        description: "Vietnamese beef noodle soup",
        instructions: [
            "Gather all ingredients and prepare your workspace.",
            "Follow the recipe steps in order.",
            "Taste and adjust seasoning as needed.",
            "Cook until ingredients are properly heated through.",
            "Serve immediately while hot.",
            "Garnish with fresh herbs if desired."
        ]
    },
    "chicken-tikka-masala": {
        name: "Chicken Tikka Masala",
        ingredients: [
        { name: "chicken", quantity: "500g" },
        { name: "rice", quantity: "300g" },
        { name: "tomatoes", quantity: "400g" },
        { name: "onions", quantity: "2 medium" },
        { name: "garlic", quantity: "3 cloves" },
        { name: "ginger", quantity: "1 tbsp" },
        { name: "yogurt", quantity: "200ml" },
        { name: "spices", quantity: "to taste" },
        { name: "cream", quantity: "to taste" }
    ],
        difficulty: "Medium",
        time: "45 min",
        cuisine: "Asian",
        description: "Creamy spiced chicken with rice",
        instructions: [
            "Gather all ingredients and prepare your workspace.",
            "Follow the recipe steps in order.",
            "Taste and adjust seasoning as needed.",
            "Cook until ingredients are properly heated through.",
            "Serve immediately while hot.",
            "Garnish with fresh herbs if desired."
        ]
    },
    "vegetable-curry": {
        name: "Vegetable Curry",
        ingredients: [
        { name: "rice", quantity: "300g" },
        { name: "vegetables", quantity: "to taste" },
        { name: "coconut-milk", quantity: "to taste" },
        { name: "curry-powder", quantity: "to taste" },
        { name: "onions", quantity: "2 medium" },
        { name: "garlic", quantity: "3 cloves" }
    ],
        difficulty: "Medium",
        time: "35 min",
        cuisine: "Asian",
        description: "Creamy vegetable curry with aromatic spices",
        instructions: [
            "Heat oil in a large pot over medium heat.",
            "Add onions and cook until softened.",
            "Add garlic, ginger, and curry spices, cook for 1 minute.",
            "Add protein and cook until browned.",
            "Add coconut milk and bring to a simmer.",
            "Add vegetables and simmer for 15-20 minutes.",
            "Season with salt and serve over rice."
        ]
    },
    "chicken-sushi": {
        name: "Chicken Sushi",
        ingredients: [
        { name: "chicken", quantity: "500g" },
        { name: "rice", quantity: "300g" },
        { name: "nori", quantity: "to taste" },
        { name: "vegetables", quantity: "to taste" },
        { name: "soy-sauce", quantity: "3 tbsp" },
        { name: "ginger", quantity: "1 tbsp" },
        { name: "wasabi", quantity: "to taste" }
    ],
        difficulty: "Hard",
        time: "50 min",
        cuisine: "Asian",
        description: "Hand-rolled sushi with chicken",
        instructions: [
            "Cook sushi rice according to package directions.",
            "Season rice with rice vinegar, sugar, and salt.",
            "Let rice cool to room temperature.",
            "Prepare your fillings and slice thinly.",
            "Place nori on bamboo mat and spread rice evenly.",
            "Add fillings and roll tightly.",
            "Slice into pieces and serve with soy sauce."
        ]
    },
    "beef-mongolian": {
        name: "Beef Mongolian",
        ingredients: [
        { name: "beef", quantity: "500g" },
        { name: "rice", quantity: "300g" },
        { name: "vegetables", quantity: "to taste" },
        { name: "soy-sauce", quantity: "3 tbsp" },
        { name: "garlic", quantity: "3 cloves" },
        { name: "ginger", quantity: "1 tbsp" },
        { name: "honey", quantity: "2 tbsp" },
        { name: "olive-oil", quantity: "3 tbsp" }
    ],
        difficulty: "Easy",
        time: "20 min",
        cuisine: "Asian",
        description: "Sweet and savory beef with vegetables",
        instructions: [
            "Gather all ingredients and prepare your workspace.",
            "Follow the recipe steps in order.",
            "Taste and adjust seasoning as needed.",
            "Cook until ingredients are properly heated through.",
            "Serve immediately while hot.",
            "Garnish with fresh herbs if desired."
        ]
    },
    "chicken-hot-pot": {
        name: "Chicken Hot Pot",
        ingredients: [
        { name: "chicken", quantity: "500g" },
        { name: "vegetables", quantity: "to taste" },
        { name: "tofu", quantity: "to taste" },
        { name: "noodles", quantity: "to taste" },
        { name: "soy-sauce", quantity: "3 tbsp" },
        { name: "garlic", quantity: "3 cloves" },
        { name: "ginger", quantity: "1 tbsp" },
        { name: "mushrooms", quantity: "300g" }
    ],
        difficulty: "Easy",
        time: "30 min",
        cuisine: "Asian",
        description: "Hearty soup with chicken and vegetables",
        instructions: [
            "Gather all ingredients and prepare your workspace.",
            "Follow the recipe steps in order.",
            "Taste and adjust seasoning as needed.",
            "Cook until ingredients are properly heated through.",
            "Serve immediately while hot.",
            "Garnish with fresh herbs if desired."
        ]
    },
    "beef-sukiyaki": {
        name: "Beef Sukiyaki",
        ingredients: [
        { name: "beef", quantity: "500g" },
        { name: "vegetables", quantity: "to taste" },
        { name: "tofu", quantity: "to taste" },
        { name: "noodles", quantity: "to taste" },
        { name: "soy-sauce", quantity: "3 tbsp" },
        { name: "sugar", quantity: "2 tbsp" },
        { name: "mirin", quantity: "to taste" },
        { name: "mushrooms", quantity: "300g" }
    ],
        difficulty: "Medium",
        time: "25 min",
        cuisine: "Asian",
        description: "Japanese hot pot with beef and vegetables",
        instructions: [
            "Gather all ingredients and prepare your workspace.",
            "Follow the recipe steps in order.",
            "Taste and adjust seasoning as needed.",
            "Cook until ingredients are properly heated through.",
            "Serve immediately while hot.",
            "Garnish with fresh herbs if desired."
        ]
    },
    "chicken-miso-soup": {
        name: "Chicken Miso Soup",
        ingredients: [
        { name: "chicken", quantity: "500g" },
        { name: "miso-paste", quantity: "to taste" },
        { name: "tofu", quantity: "to taste" },
        { name: "vegetables", quantity: "to taste" },
        { name: "garlic", quantity: "3 cloves" },
        { name: "ginger", quantity: "1 tbsp" },
        { name: "seaweed", quantity: "to taste" }
    ],
        difficulty: "Easy",
        time: "20 min",
        cuisine: "Asian",
        description: "Traditional Japanese soup with chicken",
        instructions: [
            "Bring broth to a boil in a large pot.",
            "Add protein and cook until done.",
            "Add vegetables and cook for 2-3 minutes.",
            "Add noodles and cook according to package directions.",
            "Season with soy sauce and other seasonings.",
            "Serve hot with garnishes."
        ]
    },
    "beef-ramen": {
        name: "Beef Ramen",
        ingredients: [
        { name: "beef", quantity: "500g" },
        { name: "noodles", quantity: "to taste" },
        { name: "eggs", quantity: "3 large" },
        { name: "vegetables", quantity: "to taste" },
        { name: "soy-sauce", quantity: "3 tbsp" },
        { name: "garlic", quantity: "3 cloves" },
        { name: "ginger", quantity: "1 tbsp" },
        { name: "miso-paste", quantity: "to taste" }
    ],
        difficulty: "Medium",
        time: "35 min",
        cuisine: "Asian",
        description: "Rich beef broth with ramen noodles",
        instructions: [
            "Bring broth to a boil in a large pot.",
            "Add protein and cook until done.",
            "Add vegetables and cook for 2-3 minutes.",
            "Add noodles and cook according to package directions.",
            "Season with soy sauce and other seasonings.",
            "Serve hot with garnishes."
        ]
    },
    "chicken-general-tsos": {
        name: "Chicken General Tso's",
        ingredients: [
        { name: "chicken", quantity: "500g" },
        { name: "rice", quantity: "300g" },
        { name: "vegetables", quantity: "to taste" },
        { name: "soy-sauce", quantity: "3 tbsp" },
        { name: "garlic", quantity: "3 cloves" },
        { name: "ginger", quantity: "1 tbsp" },
        { name: "chili", quantity: "to taste" },
        { name: "honey", quantity: "2 tbsp" }
    ],
        difficulty: "Medium",
        time: "30 min",
        cuisine: "Asian",
        description: "Sweet and spicy chicken with rice",
        instructions: [
            "Gather all ingredients and prepare your workspace.",
            "Follow the recipe steps in order.",
            "Taste and adjust seasoning as needed.",
            "Cook until ingredients are properly heated through.",
            "Serve immediately while hot.",
            "Garnish with fresh herbs if desired."
        ]
    },
    "vegetable-fried-rice": {
        name: "Vegetable Fried Rice",
        ingredients: [
        { name: "vegetables", quantity: "to taste" },
        { name: "rice", quantity: "300g" },
        { name: "eggs", quantity: "3 large" },
        { name: "soy-sauce", quantity: "3 tbsp" },
        { name: "garlic", quantity: "3 cloves" },
        { name: "ginger", quantity: "1 tbsp" },
        { name: "olive-oil", quantity: "3 tbsp" },
        { name: "tofu", quantity: "to taste" }
    ],
        difficulty: "Easy",
        time: "15 min",
        cuisine: "Asian",
        description: "Classic fried rice with mixed vegetables",
        instructions: [
            "Heat oil in a large wok or skillet over high heat.",
            "Add protein and cook until almost done, then remove from pan.",
            "Add vegetables and stir-fry for 2-3 minutes until crisp-tender.",
            "Add sauce and return protein to the pan.",
            "Toss everything together and cook for 1-2 minutes.",
            "Serve immediately over rice or noodles."
        ]
    },
    "chicken-satay": {
        name: "Chicken Satay",
        ingredients: [
        { name: "chicken", quantity: "500g" },
        { name: "peanut-butter", quantity: "to taste" },
        { name: "soy-sauce", quantity: "3 tbsp" },
        { name: "garlic", quantity: "3 cloves" },
        { name: "ginger", quantity: "1 tbsp" },
        { name: "lime", quantity: "to taste" },
        { name: "coconut-milk", quantity: "to taste" },
        { name: "rice", quantity: "300g" }
    ],
        difficulty: "Medium",
        time: "40 min",
        cuisine: "Asian",
        description: "Grilled chicken skewers with peanut sauce",
        instructions: [
            "Gather all ingredients and prepare your workspace.",
            "Follow the recipe steps in order.",
            "Taste and adjust seasoning as needed.",
            "Cook until ingredients are properly heated through.",
            "Serve immediately while hot.",
            "Garnish with fresh herbs if desired."
        ]
    },
    "beef-udon": {
        name: "Beef Udon",
        ingredients: [
        { name: "beef", quantity: "500g" },
        { name: "udon-noodles", quantity: "to taste" },
        { name: "vegetables", quantity: "to taste" },
        { name: "soy-sauce", quantity: "3 tbsp" },
        { name: "garlic", quantity: "3 cloves" },
        { name: "ginger", quantity: "1 tbsp" },
        { name: "mushrooms", quantity: "300g" },
        { name: "dashi", quantity: "to taste" }
    ],
        difficulty: "Easy",
        time: "25 min",
        cuisine: "Asian",
        description: "Thick noodles with beef and vegetables",
        instructions: [
            "Gather all ingredients and prepare your workspace.",
            "Follow the recipe steps in order.",
            "Taste and adjust seasoning as needed.",
            "Cook until ingredients are properly heated through.",
            "Serve immediately while hot.",
            "Garnish with fresh herbs if desired."
        ]
    },
    "chicken-bibimbap": {
        name: "Chicken Bibimbap",
        ingredients: [
        { name: "chicken", quantity: "500g" },
        { name: "rice", quantity: "300g" },
        { name: "vegetables", quantity: "to taste" },
        { name: "eggs", quantity: "3 large" },
        { name: "soy-sauce", quantity: "3 tbsp" },
        { name: "garlic", quantity: "3 cloves" },
        { name: "sesame-oil", quantity: "to taste" },
        { name: "gochujang", quantity: "to taste" }
    ],
        difficulty: "Medium",
        time: "30 min",
        cuisine: "Asian",
        description: "Korean mixed rice bowl with chicken",
        instructions: [
            "Gather all ingredients and prepare your workspace.",
            "Follow the recipe steps in order.",
            "Taste and adjust seasoning as needed.",
            "Cook until ingredients are properly heated through.",
            "Serve immediately while hot.",
            "Garnish with fresh herbs if desired."
        ]
    },
    "vegetable-tempura": {
        name: "Vegetable Tempura",
        ingredients: [
        { name: "vegetables", quantity: "to taste" },
        { name: "flour", quantity: "200g" },
        { name: "eggs", quantity: "3 large" },
        { name: "soy-sauce", quantity: "3 tbsp" },
        { name: "ginger", quantity: "1 tbsp" },
        { name: "rice", quantity: "300g" },
        { name: "tempura-batter", quantity: "to taste" }
    ],
        difficulty: "Medium",
        time: "30 min",
        cuisine: "Asian",
        description: "Light and crispy battered vegetables",
        instructions: [
            "Gather all ingredients and prepare your workspace.",
            "Follow the recipe steps in order.",
            "Taste and adjust seasoning as needed.",
            "Cook until ingredients are properly heated through.",
            "Serve immediately while hot.",
            "Garnish with fresh herbs if desired."
        ]
    },
    "chicken-kao-pad": {
        name: "Chicken Kao Pad",
        ingredients: [
        { name: "chicken", quantity: "500g" },
        { name: "rice", quantity: "300g" },
        { name: "eggs", quantity: "3 large" },
        { name: "vegetables", quantity: "to taste" },
        { name: "soy-sauce", quantity: "3 tbsp" },
        { name: "garlic", quantity: "3 cloves" },
        { name: "fish-sauce", quantity: "to taste" },
        { name: "lime", quantity: "to taste" }
    ],
        difficulty: "Easy",
        time: "20 min",
        cuisine: "Asian",
        description: "Thai fried rice with chicken",
        instructions: [
            "Gather all ingredients and prepare your workspace.",
            "Follow the recipe steps in order.",
            "Taste and adjust seasoning as needed.",
            "Cook until ingredients are properly heated through.",
            "Serve immediately while hot.",
            "Garnish with fresh herbs if desired."
        ]
    },
    "beef-chow-mein": {
        name: "Beef Chow Mein",
        ingredients: [
        { name: "beef", quantity: "500g" },
        { name: "noodles", quantity: "to taste" },
        { name: "vegetables", quantity: "to taste" },
        { name: "soy-sauce", quantity: "3 tbsp" },
        { name: "garlic", quantity: "3 cloves" },
        { name: "ginger", quantity: "1 tbsp" },
        { name: "oyster-sauce", quantity: "to taste" },
        { name: "olive-oil", quantity: "3 tbsp" }
    ],
        difficulty: "Easy",
        time: "20 min",
        cuisine: "Asian",
        description: "Stir-fried noodles with beef and vegetables",
        instructions: [
            "Gather all ingredients and prepare your workspace.",
            "Follow the recipe steps in order.",
            "Taste and adjust seasoning as needed.",
            "Cook until ingredients are properly heated through.",
            "Serve immediately while hot.",
            "Garnish with fresh herbs if desired."
        ]
    },
    "chicken-miso-ramen": {
        name: "Chicken Miso Ramen",
        ingredients: [
        { name: "chicken", quantity: "500g" },
        { name: "noodles", quantity: "to taste" },
        { name: "miso-paste", quantity: "to taste" },
        { name: "vegetables", quantity: "to taste" },
        { name: "garlic", quantity: "3 cloves" },
        { name: "ginger", quantity: "1 tbsp" },
        { name: "eggs", quantity: "3 large" },
        { name: "seaweed", quantity: "to taste" }
    ],
        difficulty: "Medium",
        time: "35 min",
        cuisine: "Asian",
        description: "Rich miso ramen with chicken",
        instructions: [
            "Bring broth to a boil in a large pot.",
            "Add protein and cook until done.",
            "Add vegetables and cook for 2-3 minutes.",
            "Add noodles and cook according to package directions.",
            "Season with soy sauce and other seasonings.",
            "Serve hot with garnishes."
        ]
    },
    "vegetable-sushi-bowl": {
        name: "Vegetable Sushi Bowl",
        ingredients: [
        { name: "vegetables", quantity: "to taste" },
        { name: "rice", quantity: "300g" },
        { name: "nori", quantity: "to taste" },
        { name: "soy-sauce", quantity: "3 tbsp" },
        { name: "ginger", quantity: "1 tbsp" },
        { name: "wasabi", quantity: "to taste" },
        { name: "sesame-seeds", quantity: "to taste" },
        { name: "avocado", quantity: "to taste" }
    ],
        difficulty: "Easy",
        time: "25 min",
        cuisine: "Asian",
        description: "Deconstructed sushi with fresh vegetables",
        instructions: [
            "Cook sushi rice according to package directions.",
            "Season rice with rice vinegar, sugar, and salt.",
            "Let rice cool to room temperature.",
            "Prepare your fillings and slice thinly.",
            "Place nori on bamboo mat and spread rice evenly.",
            "Add fillings and roll tightly.",
            "Slice into pieces and serve with soy sauce."
        ]
    },

    // MEXICAN CUISINE (30 recipes)
    "beef-tacos": {
        name: "Beef Tacos",
        ingredients: [
        { name: "beef", quantity: "500g" },
        { name: "tortillas", quantity: "to taste" },
        { name: "cheese", quantity: "200g grated" },
        { name: "tomatoes", quantity: "400g" },
        { name: "lettuce", quantity: "to taste" },
        { name: "onions", quantity: "2 medium" }
    ],
        difficulty: "Easy",
        time: "30 min",
        cuisine: "Mexican",
        description: "Spicy ground beef tacos with fresh toppings",
        instructions: [
            "Heat a large skillet over medium-high heat.",
            "Add ground beef and cook, breaking it up with a spoon, until browned and cooked through.",
            "Season beef with salt, pepper, and taco seasoning mix.",
            "Drain excess fat from the beef.",
            "Warm tortillas in a dry skillet or microwave for 30 seconds.",
            "Dice tomatoes and onions, shred lettuce, and grate cheese.",
            "Assemble tacos by placing beef in the center of each tortilla.",
            "Top with cheese, tomatoes, lettuce, and onions.",
            "Add hot sauce or salsa if desired.",
            "Serve immediately while warm."
        ]
    },
    "chicken-quesadillas": {
        name: "Chicken Quesadillas",
        ingredients: [
        { name: "chicken", quantity: "500g" },
        { name: "tortillas", quantity: "to taste" },
        { name: "cheese", quantity: "200g grated" },
        { name: "vegetables", quantity: "to taste" },
        { name: "olive-oil", quantity: "3 tbsp" },
        { name: "garlic", quantity: "3 cloves" }
    ],
        difficulty: "Easy",
        time: "20 min",
        cuisine: "Mexican",
        description: "undefined",
        instructions: [
            "Gather all ingredients and prepare your workspace.",
            "Follow the recipe steps in order.",
            "Taste and adjust seasoning as needed.",
            "Cook until ingredients are properly heated through.",
            "Serve immediately while hot.",
            "Garnish with fresh herbs if desired."
        ]
    },
    "vegetarian-burritos": {
        name: "Vegetarian Burritos",
        ingredients: [
        { name: "tortillas", quantity: "to taste" },
        { name: "beans", quantity: "to taste" },
        { name: "rice", quantity: "300g" },
        { name: "cheese", quantity: "200g grated" },
        { name: "vegetables", quantity: "to taste" },
        { name: "onions", quantity: "2 medium" },
        { name: "garlic", quantity: "3 cloves" }
    ],
        difficulty: "Easy",
        time: "25 min",
        cuisine: "Mexican",
        description: "Large tortillas filled with beans and vegetables",
        instructions: [
            "Heat tortillas to make them pliable.",
            "Warm your filling ingredients in a skillet.",
            "Place filling in the center of each tortilla.",
            "Add cheese and other toppings.",
            "Fold the sides in and roll up tightly.",
            "Optional: Heat in a skillet to crisp the outside.",
            "Serve immediately."
        ]
    },
    "beef-enchiladas": {
        name: "Beef Enchiladas",
        ingredients: [
        { name: "beef", quantity: "500g" },
        { name: "tortillas", quantity: "to taste" },
        { name: "cheese", quantity: "200g grated" },
        { name: "tomatoes", quantity: "400g" },
        { name: "onions", quantity: "2 medium" },
        { name: "garlic", quantity: "3 cloves" },
        { name: "chili", quantity: "to taste" }
    ],
        difficulty: "Medium",
        time: "40 min",
        cuisine: "Mexican",
        description: "Rolled tortillas with beef and cheese sauce",
        instructions: [
            "Preheat oven to 350°F (175°C).",
            "Warm tortillas to make them pliable.",
            "Fill tortillas with your filling mixture.",
            "Roll up and place seam-side down in a baking dish.",
            "Pour sauce over the enchiladas.",
            "Top with cheese.",
            "Bake for 20-25 minutes until bubbly.",
            "Garnish and serve hot."
        ]
    },
    "chicken-fajitas": {
        name: "Chicken Fajitas",
        ingredients: [
        { name: "chicken", quantity: "500g" },
        { name: "tortillas", quantity: "to taste" },
        { name: "vegetables", quantity: "to taste" },
        { name: "onions", quantity: "2 medium" },
        { name: "garlic", quantity: "3 cloves" },
        { name: "olive-oil", quantity: "3 tbsp" },
        { name: "lime", quantity: "to taste" }
    ],
        difficulty: "Easy",
        time: "25 min",
        cuisine: "Mexican",
        description: "Sizzling chicken with peppers and onions",
        instructions: [
            "Gather all ingredients and prepare your workspace.",
            "Follow the recipe steps in order.",
            "Taste and adjust seasoning as needed.",
            "Cook until ingredients are properly heated through.",
            "Serve immediately while hot.",
            "Garnish with fresh herbs if desired."
        ]
    },
    "vegetarian-nachos": {
        name: "Vegetarian Nachos",
        ingredients: [
        { name: "tortilla-chips", quantity: "to taste" },
        { name: "cheese", quantity: "200g grated" },
        { name: "beans", quantity: "to taste" },
        { name: "tomatoes", quantity: "400g" },
        { name: "onions", quantity: "2 medium" },
        { name: "jalapenos", quantity: "to taste" },
        { name: "olive-oil", quantity: "3 tbsp" }
    ],
        difficulty: "Easy",
        time: "15 min",
        cuisine: "Mexican",
        description: "Loaded tortilla chips with cheese and beans",
        instructions: [
            "Gather all ingredients and prepare your workspace.",
            "Follow the recipe steps in order.",
            "Taste and adjust seasoning as needed.",
            "Cook until ingredients are properly heated through.",
            "Serve immediately while hot.",
            "Garnish with fresh herbs if desired."
        ]
    },
    "beef-chimichangas": {
        name: "Beef Chimichangas",
        ingredients: [
        { name: "beef", quantity: "500g" },
        { name: "tortillas", quantity: "to taste" },
        { name: "cheese", quantity: "200g grated" },
        { name: "beans", quantity: "to taste" },
        { name: "onions", quantity: "2 medium" },
        { name: "garlic", quantity: "3 cloves" },
        { name: "olive-oil", quantity: "3 tbsp" }
    ],
        difficulty: "Medium",
        time: "35 min",
        cuisine: "Mexican",
        description: "Deep-fried burritos with beef filling",
        instructions: [
            "Gather all ingredients and prepare your workspace.",
            "Follow the recipe steps in order.",
            "Taste and adjust seasoning as needed.",
            "Cook until ingredients are properly heated through.",
            "Serve immediately while hot.",
            "Garnish with fresh herbs if desired."
        ]
    },
    "chicken-tostadas": {
        name: "Chicken Tostadas",
        ingredients: [
        { name: "chicken", quantity: "500g" },
        { name: "tortillas", quantity: "to taste" },
        { name: "beans", quantity: "to taste" },
        { name: "lettuce", quantity: "to taste" },
        { name: "tomatoes", quantity: "400g" },
        { name: "cheese", quantity: "200g grated" },
        { name: "onions", quantity: "2 medium" }
    ],
        difficulty: "Easy",
        time: "20 min",
        cuisine: "Mexican",
        description: "Crispy tortillas topped with chicken and vegetables",
        instructions: [
            "Gather all ingredients and prepare your workspace.",
            "Follow the recipe steps in order.",
            "Taste and adjust seasoning as needed.",
            "Cook until ingredients are properly heated through.",
            "Serve immediately while hot.",
            "Garnish with fresh herbs if desired."
        ]
    },
    "vegetarian-tamales": {
        name: "Vegetarian Tamales",
        ingredients: [
        { name: "corn-husks", quantity: "to taste" },
        { name: "masa", quantity: "to taste" },
        { name: "vegetables", quantity: "to taste" },
        { name: "cheese", quantity: "200g grated" },
        { name: "onions", quantity: "2 medium" },
        { name: "garlic", quantity: "3 cloves" },
        { name: "chili", quantity: "to taste" }
    ],
        difficulty: "Hard",
        time: "90 min",
        cuisine: "Mexican",
        description: "Steamed corn dough with vegetable filling",
        instructions: [
            "Gather all ingredients and prepare your workspace.",
            "Follow the recipe steps in order.",
            "Taste and adjust seasoning as needed.",
            "Cook until ingredients are properly heated through.",
            "Serve immediately while hot.",
            "Garnish with fresh herbs if desired."
        ]
    },
    "beef-burrito-bowl": {
        name: "Beef Burrito Bowl",
        ingredients: [
        { name: "beef", quantity: "500g" },
        { name: "rice", quantity: "300g" },
        { name: "beans", quantity: "to taste" },
        { name: "lettuce", quantity: "to taste" },
        { name: "tomatoes", quantity: "400g" },
        { name: "cheese", quantity: "200g grated" },
        { name: "onions", quantity: "2 medium" },
        { name: "avocado", quantity: "to taste" }
    ],
        difficulty: "Easy",
        time: "25 min",
        cuisine: "Mexican",
        description: "Deconstructed burrito in a bowl",
        instructions: [
            "Heat tortillas to make them pliable.",
            "Warm your filling ingredients in a skillet.",
            "Place filling in the center of each tortilla.",
            "Add cheese and other toppings.",
            "Fold the sides in and roll up tightly.",
            "Optional: Heat in a skillet to crisp the outside.",
            "Serve immediately."
        ]
    },
    "chicken-posole": {
        name: "Chicken Posole",
        ingredients: [
        { name: "chicken", quantity: "500g" },
        { name: "hominy", quantity: "to taste" },
        { name: "vegetables", quantity: "to taste" },
        { name: "onions", quantity: "2 medium" },
        { name: "garlic", quantity: "3 cloves" },
        { name: "chili", quantity: "to taste" },
        { name: "lime", quantity: "to taste" }
    ],
        difficulty: "Medium",
        time: "45 min",
        cuisine: "Mexican",
        description: "Traditional Mexican soup with chicken and hominy",
        instructions: [
            "Gather all ingredients and prepare your workspace.",
            "Follow the recipe steps in order.",
            "Taste and adjust seasoning as needed.",
            "Cook until ingredients are properly heated through.",
            "Serve immediately while hot.",
            "Garnish with fresh herbs if desired."
        ]
    },
    "vegetarian-chiles-rellenos": {
        name: "Vegetarian Chiles Rellenos",
        ingredients: [
        { name: "poblano-peppers", quantity: "to taste" },
        { name: "cheese", quantity: "200g grated" },
        { name: "eggs", quantity: "3 large" },
        { name: "flour", quantity: "200g" },
        { name: "tomatoes", quantity: "400g" },
        { name: "onions", quantity: "2 medium" },
        { name: "garlic", quantity: "3 cloves" }
    ],
        difficulty: "Hard",
        time: "60 min",
        cuisine: "Mexican",
        description: "Stuffed peppers with cheese and tomato sauce",
        instructions: [
            "Gather all ingredients and prepare your workspace.",
            "Follow the recipe steps in order.",
            "Taste and adjust seasoning as needed.",
            "Cook until ingredients are properly heated through.",
            "Serve immediately while hot.",
            "Garnish with fresh herbs if desired."
        ]
    },
    "beef-carnitas": {
        name: "Beef Carnitas",
        ingredients: [
        { name: "beef", quantity: "500g" },
        { name: "tortillas", quantity: "to taste" },
        { name: "onions", quantity: "2 medium" },
        { name: "garlic", quantity: "3 cloves" },
        { name: "lime", quantity: "to taste" },
        { name: "orange", quantity: "to taste" },
        { name: "cinnamon", quantity: "to taste" }
    ],
        difficulty: "Medium",
        time: "120 min",
        cuisine: "Mexican",
        description: "Slow-cooked beef with citrus and spices",
        instructions: [
            "Gather all ingredients and prepare your workspace.",
            "Follow the recipe steps in order.",
            "Taste and adjust seasoning as needed.",
            "Cook until ingredients are properly heated through.",
            "Serve immediately while hot.",
            "Garnish with fresh herbs if desired."
        ]
    },
    "chicken-mole": {
        name: "Chicken Mole",
        ingredients: [
        { name: "chicken", quantity: "500g" },
        { name: "chocolate", quantity: "to taste" },
        { name: "chili", quantity: "to taste" },
        { name: "onions", quantity: "2 medium" },
        { name: "garlic", quantity: "3 cloves" },
        { name: "almonds", quantity: "to taste" },
        { name: "cinnamon", quantity: "to taste" },
        { name: "rice", quantity: "300g" }
    ],
        difficulty: "Hard",
        time: "90 min",
        cuisine: "Mexican",
        description: "Chicken in rich chocolate and chili sauce",
        instructions: [
            "Gather all ingredients and prepare your workspace.",
            "Follow the recipe steps in order.",
            "Taste and adjust seasoning as needed.",
            "Cook until ingredients are properly heated through.",
            "Serve immediately while hot.",
            "Garnish with fresh herbs if desired."
        ]
    },
    "vegetarian-huevos-rancheros": {
        name: "Vegetarian Huevos Rancheros",
        ingredients: [
        { name: "eggs", quantity: "3 large" },
        { name: "tortillas", quantity: "to taste" },
        { name: "beans", quantity: "to taste" },
        { name: "tomatoes", quantity: "400g" },
        { name: "onions", quantity: "2 medium" },
        { name: "garlic", quantity: "3 cloves" },
        { name: "chili", quantity: "to taste" },
        { name: "cheese", quantity: "200g grated" }
    ],
        difficulty: "Easy",
        time: "20 min",
        cuisine: "Mexican",
        description: "Fried eggs with beans and salsa",
        instructions: [
            "Gather all ingredients and prepare your workspace.",
            "Follow the recipe steps in order.",
            "Taste and adjust seasoning as needed.",
            "Cook until ingredients are properly heated through.",
            "Serve immediately while hot.",
            "Garnish with fresh herbs if desired."
        ]
    },
    "beef-barbacoa": {
        name: "Beef Barbacoa",
        ingredients: [
        { name: "beef", quantity: "500g" },
        { name: "tortillas", quantity: "to taste" },
        { name: "onions", quantity: "2 medium" },
        { name: "garlic", quantity: "3 cloves" },
        { name: "lime", quantity: "to taste" },
        { name: "cinnamon", quantity: "to taste" },
        { name: "cloves", quantity: "to taste" },
        { name: "rice", quantity: "300g" }
    ],
        difficulty: "Medium",
        time: "180 min",
        cuisine: "Mexican",
        description: "Slow-cooked beef with Mexican spices",
        instructions: [
            "Gather all ingredients and prepare your workspace.",
            "Follow the recipe steps in order.",
            "Taste and adjust seasoning as needed.",
            "Cook until ingredients are properly heated through.",
            "Serve immediately while hot.",
            "Garnish with fresh herbs if desired."
        ]
    },
    "chicken-sopes": {
        name: "Chicken Sopes",
        ingredients: [
        { name: "chicken", quantity: "500g" },
        { name: "masa", quantity: "to taste" },
        { name: "beans", quantity: "to taste" },
        { name: "lettuce", quantity: "to taste" },
        { name: "tomatoes", quantity: "400g" },
        { name: "cheese", quantity: "200g grated" },
        { name: "onions", quantity: "2 medium" },
        { name: "olive-oil", quantity: "3 tbsp" }
    ],
        difficulty: "Medium",
        time: "40 min",
        cuisine: "Mexican",
        description: "Thick tortillas topped with chicken and beans",
        instructions: [
            "Gather all ingredients and prepare your workspace.",
            "Follow the recipe steps in order.",
            "Taste and adjust seasoning as needed.",
            "Cook until ingredients are properly heated through.",
            "Serve immediately while hot.",
            "Garnish with fresh herbs if desired."
        ]
    },
    "vegetarian-flautas": {
        name: "Vegetarian Flautas",
        ingredients: [
        { name: "tortillas", quantity: "to taste" },
        { name: "beans", quantity: "to taste" },
        { name: "cheese", quantity: "200g grated" },
        { name: "vegetables", quantity: "to taste" },
        { name: "onions", quantity: "2 medium" },
        { name: "garlic", quantity: "3 cloves" },
        { name: "olive-oil", quantity: "3 tbsp" }
    ],
        difficulty: "Medium",
        time: "30 min",
        cuisine: "Mexican",
        description: "Rolled and fried tortillas with bean filling",
        instructions: [
            "Gather all ingredients and prepare your workspace.",
            "Follow the recipe steps in order.",
            "Taste and adjust seasoning as needed.",
            "Cook until ingredients are properly heated through.",
            "Serve immediately while hot.",
            "Garnish with fresh herbs if desired."
        ]
    },
    "beef-machaca": {
        name: "Beef Machaca",
        ingredients: [
        { name: "beef", quantity: "500g" },
        { name: "eggs", quantity: "3 large" },
        { name: "onions", quantity: "2 medium" },
        { name: "garlic", quantity: "3 cloves" },
        { name: "tomatoes", quantity: "400g" },
        { name: "chili", quantity: "to taste" },
        { name: "tortillas", quantity: "to taste" }
    ],
        difficulty: "Easy",
        time: "25 min",
        cuisine: "Mexican",
        description: "Shredded beef with scrambled eggs",
        instructions: [
            "Gather all ingredients and prepare your workspace.",
            "Follow the recipe steps in order.",
            "Taste and adjust seasoning as needed.",
            "Cook until ingredients are properly heated through.",
            "Serve immediately while hot.",
            "Garnish with fresh herbs if desired."
        ]
    },
    "chicken-cochinita-pibil": {
        name: "Chicken Cochinita Pibil",
        ingredients: [
        { name: "chicken", quantity: "500g" },
        { name: "orange-juice", quantity: "to taste" },
        { name: "lime", quantity: "to taste" },
        { name: "achiote", quantity: "to taste" },
        { name: "onions", quantity: "2 medium" },
        { name: "garlic", quantity: "3 cloves" },
        { name: "tortillas", quantity: "to taste" }
    ],
        difficulty: "Medium",
        time: "240 min",
        cuisine: "Mexican",
        description: "Yucatan-style marinated chicken",
        instructions: [
            "Gather all ingredients and prepare your workspace.",
            "Follow the recipe steps in order.",
            "Taste and adjust seasoning as needed.",
            "Cook until ingredients are properly heated through.",
            "Serve immediately while hot.",
            "Garnish with fresh herbs if desired."
        ]
    },
    "vegetarian-papusas": {
        name: "Vegetarian Papusas",
        ingredients: [
        { name: "masa", quantity: "to taste" },
        { name: "beans", quantity: "to taste" },
        { name: "cheese", quantity: "200g grated" },
        { name: "vegetables", quantity: "to taste" },
        { name: "onions", quantity: "2 medium" },
        { name: "garlic", quantity: "3 cloves" },
        { name: "olive-oil", quantity: "3 tbsp" }
    ],
        difficulty: "Medium",
        time: "45 min",
        cuisine: "Mexican",
        description: "Stuffed corn cakes with beans and cheese",
        instructions: [
            "Gather all ingredients and prepare your workspace.",
            "Follow the recipe steps in order.",
            "Taste and adjust seasoning as needed.",
            "Cook until ingredients are properly heated through.",
            "Serve immediately while hot.",
            "Garnish with fresh herbs if desired."
        ]
    },
    "beef-torta": {
        name: "Beef Torta",
        ingredients: [
        { name: "beef", quantity: "500g" },
        { name: "bread", quantity: "to taste" },
        { name: "lettuce", quantity: "to taste" },
        { name: "tomatoes", quantity: "400g" },
        { name: "onions", quantity: "2 medium" },
        { name: "cheese", quantity: "200g grated" },
        { name: "avocado", quantity: "to taste" },
        { name: "mayo", quantity: "to taste" }
    ],
        difficulty: "Easy",
        time: "20 min",
        cuisine: "Mexican",
        description: "Mexican sandwich with beef and vegetables",
        instructions: [
            "Gather all ingredients and prepare your workspace.",
            "Follow the recipe steps in order.",
            "Taste and adjust seasoning as needed.",
            "Cook until ingredients are properly heated through.",
            "Serve immediately while hot.",
            "Garnish with fresh herbs if desired."
        ]
    },
    "chicken-elote": {
        name: "Chicken Elote",
        ingredients: [
        { name: "chicken", quantity: "500g" },
        { name: "corn", quantity: "to taste" },
        { name: "cheese", quantity: "200g grated" },
        { name: "chili", quantity: "to taste" },
        { name: "lime", quantity: "to taste" },
        { name: "mayo", quantity: "to taste" },
        { name: "cilantro", quantity: "1/4 cup" },
        { name: "tortillas", quantity: "to taste" }
    ],
        difficulty: "Easy",
        time: "25 min",
        cuisine: "Mexican",
        description: "Grilled corn with chicken and Mexican spices",
        instructions: [
            "Gather all ingredients and prepare your workspace.",
            "Follow the recipe steps in order.",
            "Taste and adjust seasoning as needed.",
            "Cook until ingredients are properly heated through.",
            "Serve immediately while hot.",
            "Garnish with fresh herbs if desired."
        ]
    },
    "vegetarian-guacamole": {
        name: "Vegetarian Guacamole",
        ingredients: [
        { name: "avocado", quantity: "to taste" },
        { name: "tomatoes", quantity: "400g" },
        { name: "onions", quantity: "2 medium" },
        { name: "lime", quantity: "to taste" },
        { name: "garlic", quantity: "3 cloves" },
        { name: "cilantro", quantity: "1/4 cup" },
        { name: "chili", quantity: "to taste" },
        { name: "tortilla-chips", quantity: "to taste" }
    ],
        difficulty: "Easy",
        time: "15 min",
        cuisine: "Mexican",
        description: "Fresh avocado dip with vegetables",
        instructions: [
            "Gather all ingredients and prepare your workspace.",
            "Follow the recipe steps in order.",
            "Taste and adjust seasoning as needed.",
            "Cook until ingredients are properly heated through.",
            "Serve immediately while hot.",
            "Garnish with fresh herbs if desired."
        ]
    },
    "beef-chorizo": {
        name: "Beef Chorizo",
        ingredients: [
        { name: "beef", quantity: "500g" },
        { name: "chili", quantity: "to taste" },
        { name: "garlic", quantity: "3 cloves" },
        { name: "vinegar", quantity: "2 tbsp" },
        { name: "paprika", quantity: "1 tsp" },
        { name: "tortillas", quantity: "to taste" },
        { name: "eggs", quantity: "3 large" },
        { name: "onions", quantity: "2 medium" }
    ],
        difficulty: "Medium",
        time: "30 min",
        cuisine: "Mexican",
        description: "Spicy Mexican sausage with eggs",
        instructions: [
            "Gather all ingredients and prepare your workspace.",
            "Follow the recipe steps in order.",
            "Taste and adjust seasoning as needed.",
            "Cook until ingredients are properly heated through.",
            "Serve immediately while hot.",
            "Garnish with fresh herbs if desired."
        ]
    },
    "chicken-pollo-asado": {
        name: "Chicken Pollo Asado",
        ingredients: [
        { name: "chicken", quantity: "500g" },
        { name: "lime", quantity: "to taste" },
        { name: "garlic", quantity: "3 cloves" },
        { name: "onions", quantity: "2 medium" },
        { name: "chili", quantity: "to taste" },
        { name: "olive-oil", quantity: "3 tbsp" },
        { name: "rice", quantity: "300g" },
        { name: "vegetables", quantity: "to taste" }
    ],
        difficulty: "Easy",
        time: "35 min",
        cuisine: "Mexican",
        description: "Grilled chicken with Mexican marinade",
        instructions: [
            "Gather all ingredients and prepare your workspace.",
            "Follow the recipe steps in order.",
            "Taste and adjust seasoning as needed.",
            "Cook until ingredients are properly heated through.",
            "Serve immediately while hot.",
            "Garnish with fresh herbs if desired."
        ]
    },
    "vegetarian-frijoles": {
        name: "Vegetarian Frijoles",
        ingredients: [
        { name: "beans", quantity: "to taste" },
        { name: "onions", quantity: "2 medium" },
        { name: "garlic", quantity: "3 cloves" },
        { name: "chili", quantity: "to taste" },
        { name: "olive-oil", quantity: "3 tbsp" },
        { name: "cilantro", quantity: "1/4 cup" },
        { name: "lime", quantity: "to taste" },
        { name: "rice", quantity: "300g" }
    ],
        difficulty: "Easy",
        time: "30 min",
        cuisine: "Mexican",
        description: "Refried beans with Mexican spices",
        instructions: [
            "Gather all ingredients and prepare your workspace.",
            "Follow the recipe steps in order.",
            "Taste and adjust seasoning as needed.",
            "Cook until ingredients are properly heated through.",
            "Serve immediately while hot.",
            "Garnish with fresh herbs if desired."
        ]
    },
    "beef-carne-asada": {
        name: "Beef Carne Asada",
        ingredients: [
        { name: "beef", quantity: "500g" },
        { name: "lime", quantity: "to taste" },
        { name: "garlic", quantity: "3 cloves" },
        { name: "onions", quantity: "2 medium" },
        { name: "chili", quantity: "to taste" },
        { name: "olive-oil", quantity: "3 tbsp" },
        { name: "tortillas", quantity: "to taste" },
        { name: "cilantro", quantity: "1/4 cup" }
    ],
        difficulty: "Easy",
        time: "30 min",
        cuisine: "Mexican",
        description: "Grilled beef with Mexican marinade",
        instructions: [
            "Gather all ingredients and prepare your workspace.",
            "Follow the recipe steps in order.",
            "Taste and adjust seasoning as needed.",
            "Cook until ingredients are properly heated through.",
            "Serve immediately while hot.",
            "Garnish with fresh herbs if desired."
        ]
    },
    "chicken-pescado-veracruz": {
        name: "Chicken Pescado Veracruz",
        ingredients: [
        { name: "chicken", quantity: "500g" },
        { name: "tomatoes", quantity: "400g" },
        { name: "olives", quantity: "to taste" },
        { name: "capers", quantity: "to taste" },
        { name: "onions", quantity: "2 medium" },
        { name: "garlic", quantity: "3 cloves" },
        { name: "olive-oil", quantity: "3 tbsp" },
        { name: "rice", quantity: "300g" }
    ],
        difficulty: "Medium",
        time: "40 min",
        cuisine: "Mexican",
        description: "Chicken in Veracruz-style sauce",
        instructions: [
            "Gather all ingredients and prepare your workspace.",
            "Follow the recipe steps in order.",
            "Taste and adjust seasoning as needed.",
            "Cook until ingredients are properly heated through.",
            "Serve immediately while hot.",
            "Garnish with fresh herbs if desired."
        ]
    },
    "vegetarian-salsa-verde": {
        name: "Vegetarian Salsa Verde",
        ingredients: [
        { name: "tomatillos", quantity: "to taste" },
        { name: "chili", quantity: "to taste" },
        { name: "onions", quantity: "2 medium" },
        { name: "garlic", quantity: "3 cloves" },
        { name: "cilantro", quantity: "1/4 cup" },
        { name: "lime", quantity: "to taste" },
        { name: "tortilla-chips", quantity: "to taste" }
    ],
        difficulty: "Easy",
        time: "20 min",
        cuisine: "Mexican",
        description: "Green salsa with tomatillos and herbs",
        instructions: [
            "Gather all ingredients and prepare your workspace.",
            "Follow the recipe steps in order.",
            "Taste and adjust seasoning as needed.",
            "Cook until ingredients are properly heated through.",
            "Serve immediately while hot.",
            "Garnish with fresh herbs if desired."
        ]
    },
    "beef-menudo": {
        name: "Beef Menudo",
        ingredients: [
        { name: "beef", quantity: "500g" },
        { name: "hominy", quantity: "to taste" },
        { name: "onions", quantity: "2 medium" },
        { name: "garlic", quantity: "3 cloves" },
        { name: "chili", quantity: "to taste" },
        { name: "lime", quantity: "to taste" },
        { name: "cilantro", quantity: "1/4 cup" },
        { name: "tortillas", quantity: "to taste" }
    ],
        difficulty: "Hard",
        time: "180 min",
        cuisine: "Mexican",
        description: "Traditional Mexican tripe soup",
        instructions: [
            "Gather all ingredients and prepare your workspace.",
            "Follow the recipe steps in order.",
            "Taste and adjust seasoning as needed.",
            "Cook until ingredients are properly heated through.",
            "Serve immediately while hot.",
            "Garnish with fresh herbs if desired."
        ]
    },
    "chicken-chiles-en-nogada": {
        name: "Chicken Chiles en Nogada",
        ingredients: [
        { name: "chicken", quantity: "500g" },
        { name: "poblano-peppers", quantity: "to taste" },
        { name: "walnuts", quantity: "to taste" },
        { name: "cheese", quantity: "200g grated" },
        { name: "pomegranate", quantity: "to taste" },
        { name: "onions", quantity: "2 medium" },
        { name: "garlic", quantity: "3 cloves" }
    ],
        difficulty: "Hard",
        time: "120 min",
        cuisine: "Mexican",
        description: "Stuffed peppers with walnut sauce",
        instructions: [
            "Gather all ingredients and prepare your workspace.",
            "Follow the recipe steps in order.",
            "Taste and adjust seasoning as needed.",
            "Cook until ingredients are properly heated through.",
            "Serve immediately while hot.",
            "Garnish with fresh herbs if desired."
        ]
    },
    "vegetarian-mexican-rice": {
        name: "Vegetarian Mexican Rice",
        ingredients: [
        { name: "rice", quantity: "300g" },
        { name: "tomatoes", quantity: "400g" },
        { name: "onions", quantity: "2 medium" },
        { name: "garlic", quantity: "3 cloves" },
        { name: "olive-oil", quantity: "3 tbsp" },
        { name: "chili", quantity: "to taste" },
        { name: "cilantro", quantity: "1/4 cup" },
        { name: "vegetables", quantity: "to taste" }
    ],
        difficulty: "Easy",
        time: "25 min",
        cuisine: "Mexican",
        description: "Flavored rice with tomatoes and vegetables",
        instructions: [
            "Gather all ingredients and prepare your workspace.",
            "Follow the recipe steps in order.",
            "Taste and adjust seasoning as needed.",
            "Cook until ingredients are properly heated through.",
            "Serve immediately while hot.",
            "Garnish with fresh herbs if desired."
        ]
    },

    // INDIAN CUISINE (30 recipes)
    "vegetable-curry": {
        name: "Vegetable Curry",
        ingredients: [
        { name: "rice", quantity: "300g" },
        { name: "vegetables", quantity: "to taste" },
        { name: "coconut-milk", quantity: "to taste" },
        { name: "curry-powder", quantity: "to taste" },
        { name: "onions", quantity: "2 medium" },
        { name: "garlic", quantity: "3 cloves" }
    ],
        difficulty: "Medium",
        time: "35 min",
        cuisine: "Indian",
        description: "Creamy vegetable curry with aromatic spices",
        instructions: [
            "Gather all ingredients and prepare your workspace.",
            "Follow the recipe steps in order.",
            "Taste and adjust seasoning as needed.",
            "Cook until ingredients are properly heated through.",
            "Serve immediately while hot.",
            "Garnish with fresh herbs if desired."
        ]
    },
    "chicken-tikka-masala": {
        name: "Chicken Tikka Masala",
        ingredients: [
        { name: "chicken", quantity: "500g" },
        { name: "rice", quantity: "300g" },
        { name: "tomatoes", quantity: "400g" },
        { name: "onions", quantity: "2 medium" },
        { name: "garlic", quantity: "3 cloves" },
        { name: "ginger", quantity: "1 tbsp" },
        { name: "yogurt", quantity: "200ml" },
        { name: "spices", quantity: "to taste" },
        { name: "cream", quantity: "to taste" }
    ],
        difficulty: "Medium",
        time: "45 min",
        cuisine: "Indian",
        description: "Creamy spiced chicken with rice",
        instructions: [
            "Gather all ingredients and prepare your workspace.",
            "Follow the recipe steps in order.",
            "Taste and adjust seasoning as needed.",
            "Cook until ingredients are properly heated through.",
            "Serve immediately while hot.",
            "Garnish with fresh herbs if desired."
        ]
    },
    "beef-biryani": {
        name: "Beef Biryani",
        ingredients: [
        { name: "beef", quantity: "500g" },
        { name: "rice", quantity: "300g" },
        { name: "onions", quantity: "2 medium" },
        { name: "garlic", quantity: "3 cloves" },
        { name: "ginger", quantity: "1 tbsp" },
        { name: "yogurt", quantity: "200ml" },
        { name: "spices", quantity: "to taste" },
        { name: "saffron", quantity: "to taste" }
    ],
        difficulty: "Hard",
        time: "60 min",
        cuisine: "Indian",
        description: "Fragrant spiced rice with beef",
        instructions: [
            "Gather all ingredients and prepare your workspace.",
            "Follow the recipe steps in order.",
            "Taste and adjust seasoning as needed.",
            "Cook until ingredients are properly heated through.",
            "Serve immediately while hot.",
            "Garnish with fresh herbs if desired."
        ]
    },
    "vegetarian-dal": {
        name: "Vegetarian Dal",
        ingredients: [
        { name: "lentils", quantity: "to taste" },
        { name: "rice", quantity: "300g" },
        { name: "onions", quantity: "2 medium" },
        { name: "garlic", quantity: "3 cloves" },
        { name: "ginger", quantity: "1 tbsp" },
        { name: "spices", quantity: "to taste" },
        { name: "tomatoes", quantity: "400g" },
        { name: "cilantro", quantity: "1/4 cup" }
    ],
        difficulty: "Easy",
        time: "30 min",
        cuisine: "Indian",
        description: "Spiced lentil curry with rice",
        instructions: [
            "Gather all ingredients and prepare your workspace.",
            "Follow the recipe steps in order.",
            "Taste and adjust seasoning as needed.",
            "Cook until ingredients are properly heated through.",
            "Serve immediately while hot.",
            "Garnish with fresh herbs if desired."
        ]
    },
    "chicken-butter-chicken": {
        name: "Chicken Butter Chicken",
        ingredients: [
        { name: "chicken", quantity: "500g" },
        { name: "rice", quantity: "300g" },
        { name: "tomatoes", quantity: "400g" },
        { name: "onions", quantity: "2 medium" },
        { name: "garlic", quantity: "3 cloves" },
        { name: "ginger", quantity: "1 tbsp" },
        { name: "yogurt", quantity: "200ml" },
        { name: "spices", quantity: "to taste" },
        { name: "cream", quantity: "to taste" }
    ],
        difficulty: "Medium",
        time: "40 min",
        cuisine: "Indian",
        description: "Creamy tomato-based chicken curry",
        instructions: [
            "Gather all ingredients and prepare your workspace.",
            "Follow the recipe steps in order.",
            "Taste and adjust seasoning as needed.",
            "Cook until ingredients are properly heated through.",
            "Serve immediately while hot.",
            "Garnish with fresh herbs if desired."
        ]
    },
    "beef-vindaloo": {
        name: "Beef Vindaloo",
        ingredients: [
        { name: "beef", quantity: "500g" },
        { name: "rice", quantity: "300g" },
        { name: "onions", quantity: "2 medium" },
        { name: "garlic", quantity: "3 cloves" },
        { name: "ginger", quantity: "1 tbsp" },
        { name: "vinegar", quantity: "2 tbsp" },
        { name: "spices", quantity: "to taste" },
        { name: "chili", quantity: "to taste" },
        { name: "potatoes", quantity: "1kg" }
    ],
        difficulty: "Hard",
        time: "90 min",
        cuisine: "Indian",
        description: "Spicy beef curry with potatoes",
        instructions: [
            "Gather all ingredients and prepare your workspace.",
            "Follow the recipe steps in order.",
            "Taste and adjust seasoning as needed.",
            "Cook until ingredients are properly heated through.",
            "Serve immediately while hot.",
            "Garnish with fresh herbs if desired."
        ]
    },
    "vegetarian-samosa": {
        name: "Vegetarian Samosa",
        ingredients: [
        { name: "potatoes", quantity: "1kg" },
        { name: "flour", quantity: "200g" },
        { name: "vegetables", quantity: "to taste" },
        { name: "onions", quantity: "2 medium" },
        { name: "garlic", quantity: "3 cloves" },
        { name: "ginger", quantity: "1 tbsp" },
        { name: "spices", quantity: "to taste" },
        { name: "oil", quantity: "to taste" }
    ],
        difficulty: "Medium",
        time: "45 min",
        cuisine: "Indian",
        description: "Fried pastries with spiced vegetable filling",
        instructions: [
            "Gather all ingredients and prepare your workspace.",
            "Follow the recipe steps in order.",
            "Taste and adjust seasoning as needed.",
            "Cook until ingredients are properly heated through.",
            "Serve immediately while hot.",
            "Garnish with fresh herbs if desired."
        ]
    },
    "chicken-korma": {
        name: "Chicken Korma",
        ingredients: [
        { name: "chicken", quantity: "500g" },
        { name: "rice", quantity: "300g" },
        { name: "onions", quantity: "2 medium" },
        { name: "garlic", quantity: "3 cloves" },
        { name: "ginger", quantity: "1 tbsp" },
        { name: "yogurt", quantity: "200ml" },
        { name: "spices", quantity: "to taste" },
        { name: "cream", quantity: "to taste" },
        { name: "almonds", quantity: "to taste" }
    ],
        difficulty: "Medium",
        time: "50 min",
        cuisine: "Indian",
        description: "Mild creamy chicken curry with nuts",
        instructions: [
            "Gather all ingredients and prepare your workspace.",
            "Follow the recipe steps in order.",
            "Taste and adjust seasoning as needed.",
            "Cook until ingredients are properly heated through.",
            "Serve immediately while hot.",
            "Garnish with fresh herbs if desired."
        ]
    },
    "beef-keema": {
        name: "Beef Keema",
        ingredients: [
        { name: "beef", quantity: "500g" },
        { name: "rice", quantity: "300g" },
        { name: "onions", quantity: "2 medium" },
        { name: "garlic", quantity: "3 cloves" },
        { name: "ginger", quantity: "1 tbsp" },
        { name: "tomatoes", quantity: "400g" },
        { name: "spices", quantity: "to taste" },
        { name: "peas", quantity: "to taste" }
    ],
        difficulty: "Easy",
        time: "35 min",
        cuisine: "Indian",
        description: "Spiced ground beef with peas",
        instructions: [
            "Gather all ingredients and prepare your workspace.",
            "Follow the recipe steps in order.",
            "Taste and adjust seasoning as needed.",
            "Cook until ingredients are properly heated through.",
            "Serve immediately while hot.",
            "Garnish with fresh herbs if desired."
        ]
    },
    "vegetarian-palak-paneer": {
        name: "Vegetarian Palak Paneer",
        ingredients: [
        { name: "paneer", quantity: "to taste" },
        { name: "spinach", quantity: "200g" },
        { name: "rice", quantity: "300g" },
        { name: "onions", quantity: "2 medium" },
        { name: "garlic", quantity: "3 cloves" },
        { name: "ginger", quantity: "1 tbsp" },
        { name: "spices", quantity: "to taste" },
        { name: "cream", quantity: "to taste" }
    ],
        difficulty: "Medium",
        time: "40 min",
        cuisine: "Indian",
        description: "Cottage cheese in spinach curry",
        instructions: [
            "Gather all ingredients and prepare your workspace.",
            "Follow the recipe steps in order.",
            "Taste and adjust seasoning as needed.",
            "Cook until ingredients are properly heated through.",
            "Serve immediately while hot.",
            "Garnish with fresh herbs if desired."
        ]
    },
    "chicken-rogan-josh": {
        name: "Chicken Rogan Josh",
        ingredients: [
        { name: "chicken", quantity: "500g" },
        { name: "rice", quantity: "300g" },
        { name: "onions", quantity: "2 medium" },
        { name: "garlic", quantity: "3 cloves" },
        { name: "ginger", quantity: "1 tbsp" },
        { name: "yogurt", quantity: "200ml" },
        { name: "spices", quantity: "to taste" },
        { name: "tomatoes", quantity: "400g" }
    ],
        difficulty: "Medium",
        time: "55 min",
        cuisine: "Indian",
        description: "Aromatic chicken curry with yogurt",
        instructions: [
            "Gather all ingredients and prepare your workspace.",
            "Follow the recipe steps in order.",
            "Taste and adjust seasoning as needed.",
            "Cook until ingredients are properly heated through.",
            "Serve immediately while hot.",
            "Garnish with fresh herbs if desired."
        ]
    },
    "beef-madras": {
        name: "Beef Madras",
        ingredients: [
        { name: "beef", quantity: "500g" },
        { name: "rice", quantity: "300g" },
        { name: "onions", quantity: "2 medium" },
        { name: "garlic", quantity: "3 cloves" },
        { name: "ginger", quantity: "1 tbsp" },
        { name: "spices", quantity: "to taste" },
        { name: "chili", quantity: "to taste" },
        { name: "coconut-milk", quantity: "to taste" }
    ],
        difficulty: "Hard",
        time: "75 min",
        cuisine: "Indian",
        description: "Spicy beef curry from Madras",
        instructions: [
            "Gather all ingredients and prepare your workspace.",
            "Follow the recipe steps in order.",
            "Taste and adjust seasoning as needed.",
            "Cook until ingredients are properly heated through.",
            "Serve immediately while hot.",
            "Garnish with fresh herbs if desired."
        ]
    },
    "vegetarian-chana-masala": {
        name: "Vegetarian Chana Masala",
        ingredients: [
        { name: "chickpeas", quantity: "to taste" },
        { name: "rice", quantity: "300g" },
        { name: "onions", quantity: "2 medium" },
        { name: "garlic", quantity: "3 cloves" },
        { name: "ginger", quantity: "1 tbsp" },
        { name: "tomatoes", quantity: "400g" },
        { name: "spices", quantity: "to taste" },
        { name: "cilantro", quantity: "1/4 cup" }
    ],
        difficulty: "Easy",
        time: "30 min",
        cuisine: "Indian",
        description: "Spiced chickpea curry",
        instructions: [
            "Gather all ingredients and prepare your workspace.",
            "Follow the recipe steps in order.",
            "Taste and adjust seasoning as needed.",
            "Cook until ingredients are properly heated through.",
            "Serve immediately while hot.",
            "Garnish with fresh herbs if desired."
        ]
    },
    "chicken-jalfrezi": {
        name: "Chicken Jalfrezi",
        ingredients: [
        { name: "chicken", quantity: "500g" },
        { name: "rice", quantity: "300g" },
        { name: "vegetables", quantity: "to taste" },
        { name: "onions", quantity: "2 medium" },
        { name: "garlic", quantity: "3 cloves" },
        { name: "ginger", quantity: "1 tbsp" },
        { name: "spices", quantity: "to taste" },
        { name: "tomatoes", quantity: "400g" }
    ],
        difficulty: "Medium",
        time: "35 min",
        cuisine: "Indian",
        description: "Stir-fried chicken with vegetables",
        instructions: [
            "Gather all ingredients and prepare your workspace.",
            "Follow the recipe steps in order.",
            "Taste and adjust seasoning as needed.",
            "Cook until ingredients are properly heated through.",
            "Serve immediately while hot.",
            "Garnish with fresh herbs if desired."
        ]
    },
    "beef-dhansak": {
        name: "Beef Dhansak",
        ingredients: [
        { name: "beef", quantity: "500g" },
        { name: "rice", quantity: "300g" },
        { name: "lentils", quantity: "to taste" },
        { name: "vegetables", quantity: "to taste" },
        { name: "onions", quantity: "2 medium" },
        { name: "garlic", quantity: "3 cloves" },
        { name: "ginger", quantity: "1 tbsp" },
        { name: "spices", quantity: "to taste" }
    ],
        difficulty: "Hard",
        time: "120 min",
        cuisine: "Indian",
        description: "Parsi-style beef with lentils",
        instructions: [
            "Gather all ingredients and prepare your workspace.",
            "Follow the recipe steps in order.",
            "Taste and adjust seasoning as needed.",
            "Cook until ingredients are properly heated through.",
            "Serve immediately while hot.",
            "Garnish with fresh herbs if desired."
        ]
    },
    "vegetarian-baingan-bharta": {
        name: "Vegetarian Baingan Bharta",
        ingredients: [
        { name: "eggplant", quantity: "1 large" },
        { name: "rice", quantity: "300g" },
        { name: "onions", quantity: "2 medium" },
        { name: "garlic", quantity: "3 cloves" },
        { name: "ginger", quantity: "1 tbsp" },
        { name: "tomatoes", quantity: "400g" },
        { name: "spices", quantity: "to taste" },
        { name: "cilantro", quantity: "1/4 cup" }
    ],
        difficulty: "Medium",
        time: "45 min",
        cuisine: "Indian",
        description: "Smoky roasted eggplant curry",
        instructions: [
            "Gather all ingredients and prepare your workspace.",
            "Follow the recipe steps in order.",
            "Taste and adjust seasoning as needed.",
            "Cook until ingredients are properly heated through.",
            "Serve immediately while hot.",
            "Garnish with fresh herbs if desired."
        ]
    },
    "chicken-saag": {
        name: "Chicken Saag",
        ingredients: [
        { name: "chicken", quantity: "500g" },
        { name: "spinach", quantity: "200g" },
        { name: "rice", quantity: "300g" },
        { name: "onions", quantity: "2 medium" },
        { name: "garlic", quantity: "3 cloves" },
        { name: "ginger", quantity: "1 tbsp" },
        { name: "spices", quantity: "to taste" },
        { name: "cream", quantity: "to taste" }
    ],
        difficulty: "Medium",
        time: "40 min",
        cuisine: "Indian",
        description: "Chicken in spiced spinach curry",
        instructions: [
            "Gather all ingredients and prepare your workspace.",
            "Follow the recipe steps in order.",
            "Taste and adjust seasoning as needed.",
            "Cook until ingredients are properly heated through.",
            "Serve immediately while hot.",
            "Garnish with fresh herbs if desired."
        ]
    },
    "beef-phall": {
        name: "Beef Phall",
        ingredients: [
        { name: "beef", quantity: "500g" },
        { name: "rice", quantity: "300g" },
        { name: "onions", quantity: "2 medium" },
        { name: "garlic", quantity: "3 cloves" },
        { name: "ginger", quantity: "1 tbsp" },
        { name: "spices", quantity: "to taste" },
        { name: "chili", quantity: "to taste" },
        { name: "vegetables", quantity: "to taste" }
    ],
        difficulty: "Hard",
        time: "60 min",
        cuisine: "Indian",
        description: "Extremely spicy beef curry",
        instructions: [
            "Gather all ingredients and prepare your workspace.",
            "Follow the recipe steps in order.",
            "Taste and adjust seasoning as needed.",
            "Cook until ingredients are properly heated through.",
            "Serve immediately while hot.",
            "Garnish with fresh herbs if desired."
        ]
    },
    "vegetarian-aloo-gobi": {
        name: "Vegetarian Aloo Gobi",
        ingredients: [
        { name: "potatoes", quantity: "1kg" },
        { name: "cauliflower", quantity: "to taste" },
        { name: "rice", quantity: "300g" },
        { name: "onions", quantity: "2 medium" },
        { name: "garlic", quantity: "3 cloves" },
        { name: "ginger", quantity: "1 tbsp" },
        { name: "spices", quantity: "to taste" },
        { name: "cilantro", quantity: "1/4 cup" }
    ],
        difficulty: "Easy",
        time: "30 min",
        cuisine: "Indian",
        description: "Spiced potatoes and cauliflower",
        instructions: [
            "Gather all ingredients and prepare your workspace.",
            "Follow the recipe steps in order.",
            "Taste and adjust seasoning as needed.",
            "Cook until ingredients are properly heated through.",
            "Serve immediately while hot.",
            "Garnish with fresh herbs if desired."
        ]
    },
    "chicken-makhani": {
        name: "Chicken Makhani",
        ingredients: [
        { name: "chicken", quantity: "500g" },
        { name: "rice", quantity: "300g" },
        { name: "tomatoes", quantity: "400g" },
        { name: "onions", quantity: "2 medium" },
        { name: "garlic", quantity: "3 cloves" },
        { name: "ginger", quantity: "1 tbsp" },
        { name: "spices", quantity: "to taste" },
        { name: "butter", quantity: "100g" },
        { name: "cream", quantity: "to taste" }
    ],
        difficulty: "Medium",
        time: "45 min",
        cuisine: "Indian",
        description: "Buttery chicken curry",
        instructions: [
            "Gather all ingredients and prepare your workspace.",
            "Follow the recipe steps in order.",
            "Taste and adjust seasoning as needed.",
            "Cook until ingredients are properly heated through.",
            "Serve immediately while hot.",
            "Garnish with fresh herbs if desired."
        ]
    },
    "beef-karahi": {
        name: "Beef Karahi",
        ingredients: [
        { name: "beef", quantity: "500g" },
        { name: "rice", quantity: "300g" },
        { name: "onions", quantity: "2 medium" },
        { name: "garlic", quantity: "3 cloves" },
        { name: "ginger", quantity: "1 tbsp" },
        { name: "tomatoes", quantity: "400g" },
        { name: "spices", quantity: "to taste" },
        { name: "chili", quantity: "to taste" },
        { name: "cilantro", quantity: "1/4 cup" }
    ],
        difficulty: "Medium",
        time: "40 min",
        cuisine: "Indian",
        description: "Spicy beef curry cooked in karahi",
        instructions: [
            "Gather all ingredients and prepare your workspace.",
            "Follow the recipe steps in order.",
            "Taste and adjust seasoning as needed.",
            "Cook until ingredients are properly heated through.",
            "Serve immediately while hot.",
            "Garnish with fresh herbs if desired."
        ]
    },
    "vegetarian-rajma": {
        name: "Vegetarian Rajma",
        ingredients: [
        { name: "kidney-beans", quantity: "to taste" },
        { name: "rice", quantity: "300g" },
        { name: "onions", quantity: "2 medium" },
        { name: "garlic", quantity: "3 cloves" },
        { name: "ginger", quantity: "1 tbsp" },
        { name: "tomatoes", quantity: "400g" },
        { name: "spices", quantity: "to taste" },
        { name: "cilantro", quantity: "1/4 cup" }
    ],
        difficulty: "Easy",
        time: "35 min",
        cuisine: "Indian",
        description: "Spiced kidney bean curry",
        instructions: [
            "Gather all ingredients and prepare your workspace.",
            "Follow the recipe steps in order.",
            "Taste and adjust seasoning as needed.",
            "Cook until ingredients are properly heated through.",
            "Serve immediately while hot.",
            "Garnish with fresh herbs if desired."
        ]
    },
    "chicken-chettinad": {
        name: "Chicken Chettinad",
        ingredients: [
        { name: "chicken", quantity: "500g" },
        { name: "rice", quantity: "300g" },
        { name: "onions", quantity: "2 medium" },
        { name: "garlic", quantity: "3 cloves" },
        { name: "ginger", quantity: "1 tbsp" },
        { name: "spices", quantity: "to taste" },
        { name: "coconut", quantity: "to taste" },
        { name: "curry-leaves", quantity: "to taste" }
    ],
        difficulty: "Hard",
        time: "65 min",
        cuisine: "Indian",
        description: "Spicy chicken curry from Chettinad",
        instructions: [
            "Gather all ingredients and prepare your workspace.",
            "Follow the recipe steps in order.",
            "Taste and adjust seasoning as needed.",
            "Cook until ingredients are properly heated through.",
            "Serve immediately while hot.",
            "Garnish with fresh herbs if desired."
        ]
    },
    "beef-korma": {
        name: "Beef Korma",
        ingredients: [
        { name: "beef", quantity: "500g" },
        { name: "rice", quantity: "300g" },
        { name: "onions", quantity: "2 medium" },
        { name: "garlic", quantity: "3 cloves" },
        { name: "ginger", quantity: "1 tbsp" },
        { name: "yogurt", quantity: "200ml" },
        { name: "spices", quantity: "to taste" },
        { name: "cream", quantity: "to taste" },
        { name: "cashews", quantity: "to taste" }
    ],
        difficulty: "Medium",
        time: "55 min",
        cuisine: "Indian",
        description: "Mild creamy beef curry",
        instructions: [
            "Gather all ingredients and prepare your workspace.",
            "Follow the recipe steps in order.",
            "Taste and adjust seasoning as needed.",
            "Cook until ingredients are properly heated through.",
            "Serve immediately while hot.",
            "Garnish with fresh herbs if desired."
        ]
    },
    "vegetarian-matar-paneer": {
        name: "Vegetarian Matar Paneer",
        ingredients: [
        { name: "paneer", quantity: "to taste" },
        { name: "peas", quantity: "to taste" },
        { name: "rice", quantity: "300g" },
        { name: "onions", quantity: "2 medium" },
        { name: "garlic", quantity: "3 cloves" },
        { name: "ginger", quantity: "1 tbsp" },
        { name: "tomatoes", quantity: "400g" },
        { name: "spices", quantity: "to taste" },
        { name: "cream", quantity: "to taste" }
    ],
        difficulty: "Easy",
        time: "30 min",
        cuisine: "Indian",
        description: "Cottage cheese and peas curry",
        instructions: [
            "Gather all ingredients and prepare your workspace.",
            "Follow the recipe steps in order.",
            "Taste and adjust seasoning as needed.",
            "Cook until ingredients are properly heated through.",
            "Serve immediately while hot.",
            "Garnish with fresh herbs if desired."
        ]
    },
    "chicken-dopiaza": {
        name: "Chicken Dopiaza",
        ingredients: [
        { name: "chicken", quantity: "500g" },
        { name: "rice", quantity: "300g" },
        { name: "onions", quantity: "2 medium" },
        { name: "garlic", quantity: "3 cloves" },
        { name: "ginger", quantity: "1 tbsp" },
        { name: "spices", quantity: "to taste" },
        { name: "tomatoes", quantity: "400g" },
        { name: "cilantro", quantity: "1/4 cup" }
    ],
        difficulty: "Medium",
        time: "45 min",
        cuisine: "Indian",
        description: "Chicken curry with double onions",
        instructions: [
            "Gather all ingredients and prepare your workspace.",
            "Follow the recipe steps in order.",
            "Taste and adjust seasoning as needed.",
            "Cook until ingredients are properly heated through.",
            "Serve immediately while hot.",
            "Garnish with fresh herbs if desired."
        ]
    },
    "beef-malai": {
        name: "Beef Malai",
        ingredients: [
        { name: "beef", quantity: "500g" },
        { name: "rice", quantity: "300g" },
        { name: "onions", quantity: "2 medium" },
        { name: "garlic", quantity: "3 cloves" },
        { name: "ginger", quantity: "1 tbsp" },
        { name: "spices", quantity: "to taste" },
        { name: "cream", quantity: "to taste" },
        { name: "cashews", quantity: "to taste" },
        { name: "coconut", quantity: "to taste" }
    ],
        difficulty: "Medium",
        time: "50 min",
        cuisine: "Indian",
        description: "Creamy beef curry with nuts",
        instructions: [
            "Gather all ingredients and prepare your workspace.",
            "Follow the recipe steps in order.",
            "Taste and adjust seasoning as needed.",
            "Cook until ingredients are properly heated through.",
            "Serve immediately while hot.",
            "Garnish with fresh herbs if desired."
        ]
    },
    "vegetarian-dal-makhani": {
        name: "Vegetarian Dal Makhani",
        ingredients: [
        { name: "black-lentils", quantity: "to taste" },
        { name: "rice", quantity: "300g" },
        { name: "onions", quantity: "2 medium" },
        { name: "garlic", quantity: "3 cloves" },
        { name: "ginger", quantity: "1 tbsp" },
        { name: "spices", quantity: "to taste" },
        { name: "cream", quantity: "to taste" },
        { name: "butter", quantity: "100g" }
    ],
        difficulty: "Hard",
        time: "120 min",
        cuisine: "Indian",
        description: "Creamy black lentil curry",
        instructions: [
            "Gather all ingredients and prepare your workspace.",
            "Follow the recipe steps in order.",
            "Taste and adjust seasoning as needed.",
            "Cook until ingredients are properly heated through.",
            "Serve immediately while hot.",
            "Garnish with fresh herbs if desired."
        ]
    },
    "chicken-achari": {
        name: "Chicken Achari",
        ingredients: [
        { name: "chicken", quantity: "500g" },
        { name: "rice", quantity: "300g" },
        { name: "onions", quantity: "2 medium" },
        { name: "garlic", quantity: "3 cloves" },
        { name: "ginger", quantity: "1 tbsp" },
        { name: "pickle-spices", quantity: "to taste" },
        { name: "tomatoes", quantity: "400g" },
        { name: "cilantro", quantity: "1/4 cup" }
    ],
        difficulty: "Medium",
        time: "40 min",
        cuisine: "Indian",
        description: "Chicken curry with pickle spices",
        instructions: [
            "Gather all ingredients and prepare your workspace.",
            "Follow the recipe steps in order.",
            "Taste and adjust seasoning as needed.",
            "Cook until ingredients are properly heated through.",
            "Serve immediately while hot.",
            "Garnish with fresh herbs if desired."
        ]
    },
    "beef-nihari": {
        name: "Beef Nihari",
        ingredients: [
        { name: "beef", quantity: "500g" },
        { name: "rice", quantity: "300g" },
        { name: "onions", quantity: "2 medium" },
        { name: "garlic", quantity: "3 cloves" },
        { name: "ginger", quantity: "1 tbsp" },
        { name: "spices", quantity: "to taste" },
        { name: "wheat-flour", quantity: "to taste" },
        { name: "cilantro", quantity: "1/4 cup" }
    ],
        difficulty: "Hard",
        time: "180 min",
        cuisine: "Indian",
        description: "Slow-cooked beef stew",
        instructions: [
            "Gather all ingredients and prepare your workspace.",
            "Follow the recipe steps in order.",
            "Taste and adjust seasoning as needed.",
            "Cook until ingredients are properly heated through.",
            "Serve immediately while hot.",
            "Garnish with fresh herbs if desired."
        ]
    },
    "vegetarian-kadhi": {
        name: "Vegetarian Kadhi",
        ingredients: [
        { name: "yogurt", quantity: "200ml" },
        { name: "rice", quantity: "300g" },
        { name: "onions", quantity: "2 medium" },
        { name: "garlic", quantity: "3 cloves" },
        { name: "ginger", quantity: "1 tbsp" },
        { name: "spices", quantity: "to taste" },
        { name: "chickpea-flour", quantity: "to taste" },
        { name: "cilantro", quantity: "1/4 cup" }
    ],
        difficulty: "Easy",
        time: "25 min",
        cuisine: "Indian",
        description: "Yogurt-based curry with rice",
        instructions: [
            "Gather all ingredients and prepare your workspace.",
            "Follow the recipe steps in order.",
            "Taste and adjust seasoning as needed.",
            "Cook until ingredients are properly heated through.",
            "Serve immediately while hot.",
            "Garnish with fresh herbs if desired."
        ]
    },
    "chicken-methi": {
        name: "Chicken Methi",
        ingredients: [
        { name: "chicken", quantity: "500g" },
        { name: "rice", quantity: "300g" },
        { name: "onions", quantity: "2 medium" },
        { name: "garlic", quantity: "3 cloves" },
        { name: "ginger", quantity: "1 tbsp" },
        { name: "spices", quantity: "to taste" },
        { name: "fenugreek-leaves", quantity: "to taste" },
        { name: "tomatoes", quantity: "400g" }
    ],
        difficulty: "Medium",
        time: "35 min",
        cuisine: "Indian",
        description: "Chicken curry with fenugreek leaves",
        instructions: [
            "Gather all ingredients and prepare your workspace.",
            "Follow the recipe steps in order.",
            "Taste and adjust seasoning as needed.",
            "Cook until ingredients are properly heated through.",
            "Serve immediately while hot.",
            "Garnish with fresh herbs if desired."
        ]
    },
    "beef-khichdi": {
        name: "Beef Khichdi",
        ingredients: [
        { name: "beef", quantity: "500g" },
        { name: "rice", quantity: "300g" },
        { name: "lentils", quantity: "to taste" },
        { name: "onions", quantity: "2 medium" },
        { name: "garlic", quantity: "3 cloves" },
        { name: "ginger", quantity: "1 tbsp" },
        { name: "spices", quantity: "to taste" },
        { name: "vegetables", quantity: "to taste" }
    ],
        difficulty: "Easy",
        time: "40 min",
        cuisine: "Indian",
        description: "One-pot rice and lentil dish with beef",
        instructions: [
            "Gather all ingredients and prepare your workspace.",
            "Follow the recipe steps in order.",
            "Taste and adjust seasoning as needed.",
            "Cook until ingredients are properly heated through.",
            "Serve immediately while hot.",
            "Garnish with fresh herbs if desired."
        ]
    },
    "vegetarian-rasam": {
        name: "Vegetarian Rasam",
        ingredients: [
        { name: "tomatoes", quantity: "400g" },
        { name: "rice", quantity: "300g" },
        { name: "onions", quantity: "2 medium" },
        { name: "garlic", quantity: "3 cloves" },
        { name: "ginger", quantity: "1 tbsp" },
        { name: "spices", quantity: "to taste" },
        { name: "tamarind", quantity: "to taste" },
        { name: "cilantro", quantity: "1/4 cup" }
    ],
        difficulty: "Easy",
        time: "20 min",
        cuisine: "Indian",
        description: "Spicy tomato soup with rice",
        instructions: [
            "Gather all ingredients and prepare your workspace.",
            "Follow the recipe steps in order.",
            "Taste and adjust seasoning as needed.",
            "Cook until ingredients are properly heated through.",
            "Serve immediately while hot.",
            "Garnish with fresh herbs if desired."
        ]
    },

    // AMERICAN CUISINE (30 recipes)
    "chicken-salad": {
        name: "Chicken Salad",
        ingredients: [
        { name: "chicken", quantity: "500g" },
        { name: "lettuce", quantity: "to taste" },
        { name: "tomatoes", quantity: "400g" },
        { name: "cheese", quantity: "200g grated" },
        { name: "olive-oil", quantity: "3 tbsp" },
        { name: "lemon", quantity: "to taste" }
    ],
        difficulty: "Easy",
        time: "15 min",
        cuisine: "American",
        description: "Fresh chicken salad with mixed greens",
        instructions: [
            "Wash and dry all vegetables thoroughly.",
            "Chop vegetables into bite-sized pieces.",
            "Prepare your protein if using.",
            "Make dressing by whisking ingredients together.",
            "Combine all ingredients in a large bowl.",
            "Toss with dressing just before serving.",
            "Season with salt and pepper to taste."
        ]
    },
    "beef-burger": {
        name: "Beef Burger",
        ingredients: [
        { name: "beef", quantity: "500g" },
        { name: "bread", quantity: "to taste" },
        { name: "lettuce", quantity: "to taste" },
        { name: "tomatoes", quantity: "400g" },
        { name: "onions", quantity: "2 medium" },
        { name: "cheese", quantity: "200g grated" },
        { name: "pickles", quantity: "to taste" }
    ],
        difficulty: "Easy",
        time: "25 min",
        cuisine: "American",
        description: "Classic beef burger with fresh toppings",
        instructions: [
            "Preheat grill or heat a large skillet over medium-high heat.",
            "Form ground meat into patties and season with salt and pepper.",
            "Cook patties for 4-5 minutes per side until desired doneness.",
            "Toast buns if desired.",
            "Assemble burgers with patties and toppings.",
            "Serve immediately with your favorite sides."
        ]
    },
    "vegetarian-caesar-salad": {
        name: "Vegetarian Caesar Salad",
        ingredients: [
        { name: "lettuce", quantity: "to taste" },
        { name: "cheese", quantity: "200g grated" },
        { name: "bread", quantity: "to taste" },
        { name: "olive-oil", quantity: "3 tbsp" },
        { name: "lemon", quantity: "to taste" },
        { name: "garlic", quantity: "3 cloves" },
        { name: "parmesan", quantity: "100g grated" }
    ],
        difficulty: "Easy",
        time: "15 min",
        cuisine: "American",
        description: "Classic Caesar salad with croutons",
        instructions: [
            "Wash and dry all vegetables thoroughly.",
            "Chop vegetables into bite-sized pieces.",
            "Prepare your protein if using.",
            "Make dressing by whisking ingredients together.",
            "Combine all ingredients in a large bowl.",
            "Toss with dressing just before serving.",
            "Season with salt and pepper to taste."
        ]
    },
    "chicken-fried-chicken": {
        name: "Chicken Fried Chicken",
        ingredients: [
        { name: "chicken", quantity: "500g" },
        { name: "flour", quantity: "200g" },
        { name: "eggs", quantity: "3 large" },
        { name: "bread", quantity: "to taste" },
        { name: "vegetables", quantity: "to taste" },
        { name: "olive-oil", quantity: "3 tbsp" },
        { name: "herbs", quantity: "2 tsp" }
    ],
        difficulty: "Medium",
        time: "35 min",
        cuisine: "American",
        description: "Breaded and fried chicken cutlets",
        instructions: [
            "Season chicken pieces with salt and pepper.",
            "Dredge chicken in flour, then beaten eggs, then breadcrumbs.",
            "Heat oil in a large skillet over medium-high heat.",
            "Fry chicken for 6-8 minutes per side until golden and cooked through.",
            "Drain on paper towels.",
            "Serve hot with your favorite sides."
        ]
    },
    "beef-meatloaf": {
        name: "Beef Meatloaf",
        ingredients: [
        { name: "beef", quantity: "500g" },
        { name: "eggs", quantity: "3 large" },
        { name: "bread", quantity: "to taste" },
        { name: "onions", quantity: "2 medium" },
        { name: "garlic", quantity: "3 cloves" },
        { name: "ketchup", quantity: "to taste" },
        { name: "vegetables", quantity: "to taste" }
    ],
        difficulty: "Medium",
        time: "60 min",
        cuisine: "American",
        description: "Traditional meatloaf with vegetables",
        instructions: [
            "Preheat oven to 350°F (175°C).",
            "Mix ground meat with breadcrumbs, eggs, and seasonings.",
            "Shape into a loaf and place in a greased baking dish.",
            "Bake for 45-60 minutes until cooked through.",
            "Let rest for 10 minutes before slicing.",
            "Serve with your favorite sauce."
        ]
    },
    "vegetarian-mac-and-cheese": {
        name: "Vegetarian Mac and Cheese",
        ingredients: [
        { name: "pasta", quantity: "400g" },
        { name: "cheese", quantity: "200g grated" },
        { name: "milk", quantity: "300ml" },
        { name: "butter", quantity: "100g" },
        { name: "flour", quantity: "200g" },
        { name: "bread", quantity: "to taste" },
        { name: "herbs", quantity: "2 tsp" }
    ],
        difficulty: "Easy",
        time: "30 min",
        cuisine: "American",
        description: "Creamy macaroni and cheese",
        instructions: [
            "Gather all ingredients and prepare your workspace.",
            "Follow the recipe steps in order.",
            "Taste and adjust seasoning as needed.",
            "Cook until ingredients are properly heated through.",
            "Serve immediately while hot.",
            "Garnish with fresh herbs if desired."
        ]
    },
    "chicken-pot-pie": {
        name: "Chicken Pot Pie",
        ingredients: [
        { name: "chicken", quantity: "500g" },
        { name: "vegetables", quantity: "to taste" },
        { name: "flour", quantity: "200g" },
        { name: "butter", quantity: "100g" },
        { name: "milk", quantity: "300ml" },
        { name: "onions", quantity: "2 medium" },
        { name: "garlic", quantity: "3 cloves" },
        { name: "herbs", quantity: "2 tsp" }
    ],
        difficulty: "Hard",
        time: "75 min",
        cuisine: "American",
        description: "Savory pie with chicken and vegetables",
        instructions: [
            "Gather all ingredients and prepare your workspace.",
            "Follow the recipe steps in order.",
            "Taste and adjust seasoning as needed.",
            "Cook until ingredients are properly heated through.",
            "Serve immediately while hot.",
            "Garnish with fresh herbs if desired."
        ]
    },
    "beef-chili": {
        name: "Beef Chili",
        ingredients: [
        { name: "beef", quantity: "500g" },
        { name: "beans", quantity: "to taste" },
        { name: "tomatoes", quantity: "400g" },
        { name: "onions", quantity: "2 medium" },
        { name: "garlic", quantity: "3 cloves" },
        { name: "chili", quantity: "to taste" },
        { name: "cheese", quantity: "200g grated" },
        { name: "bread", quantity: "to taste" }
    ],
        difficulty: "Easy",
        time: "45 min",
        cuisine: "American",
        description: "Hearty beef and bean chili",
        instructions: [
            "Gather all ingredients and prepare your workspace.",
            "Follow the recipe steps in order.",
            "Taste and adjust seasoning as needed.",
            "Cook until ingredients are properly heated through.",
            "Serve immediately while hot.",
            "Garnish with fresh herbs if desired."
        ]
    },
    "vegetarian-grilled-cheese": {
        name: "Vegetarian Grilled Cheese",
        ingredients: [
        { name: "bread", quantity: "to taste" },
        { name: "cheese", quantity: "200g grated" },
        { name: "butter", quantity: "100g" },
        { name: "tomatoes", quantity: "400g" },
        { name: "herbs", quantity: "2 tsp" }
    ],
        difficulty: "Easy",
        time: "10 min",
        cuisine: "American",
        description: "Classic grilled cheese sandwich",
        instructions: [
            "Gather all ingredients and prepare your workspace.",
            "Follow the recipe steps in order.",
            "Taste and adjust seasoning as needed.",
            "Cook until ingredients are properly heated through.",
            "Serve immediately while hot.",
            "Garnish with fresh herbs if desired."
        ]
    },
    "chicken-wings": {
        name: "Chicken Wings",
        ingredients: [
        { name: "chicken", quantity: "500g" },
        { name: "butter", quantity: "100g" },
        { name: "hot-sauce", quantity: "to taste" },
        { name: "garlic", quantity: "3 cloves" },
        { name: "vegetables", quantity: "to taste" },
        { name: "blue-cheese", quantity: "to taste" }
    ],
        difficulty: "Easy",
        time: "40 min",
        cuisine: "American",
        description: "Spicy buffalo chicken wings",
        instructions: [
            "Gather all ingredients and prepare your workspace.",
            "Follow the recipe steps in order.",
            "Taste and adjust seasoning as needed.",
            "Cook until ingredients are properly heated through.",
            "Serve immediately while hot.",
            "Garnish with fresh herbs if desired."
        ]
    },
    "beef-steak": {
        name: "Beef Steak",
        ingredients: [
        { name: "beef", quantity: "500g" },
        { name: "butter", quantity: "100g" },
        { name: "garlic", quantity: "3 cloves" },
        { name: "herbs", quantity: "2 tsp" },
        { name: "vegetables", quantity: "to taste" },
        { name: "olive-oil", quantity: "3 tbsp" },
        { name: "potatoes", quantity: "1kg" }
    ],
        difficulty: "Medium",
        time: "25 min",
        cuisine: "American",
        description: "Grilled beef steak with sides",
        instructions: [
            "Gather all ingredients and prepare your workspace.",
            "Follow the recipe steps in order.",
            "Taste and adjust seasoning as needed.",
            "Cook until ingredients are properly heated through.",
            "Serve immediately while hot.",
            "Garnish with fresh herbs if desired."
        ]
    },
    "vegetarian-veggie-burger": {
        name: "Vegetarian Veggie Burger",
        ingredients: [
        { name: "vegetables", quantity: "to taste" },
        { name: "beans", quantity: "to taste" },
        { name: "bread", quantity: "to taste" },
        { name: "lettuce", quantity: "to taste" },
        { name: "tomatoes", quantity: "400g" },
        { name: "onions", quantity: "2 medium" },
        { name: "cheese", quantity: "200g grated" }
    ],
        difficulty: "Medium",
        time: "35 min",
        cuisine: "American",
        description: "Plant-based burger with vegetables",
        instructions: [
            "Preheat grill or heat a large skillet over medium-high heat.",
            "Form ground meat into patties and season with salt and pepper.",
            "Cook patties for 4-5 minutes per side until desired doneness.",
            "Toast buns if desired.",
            "Assemble burgers with patties and toppings.",
            "Serve immediately with your favorite sides."
        ]
    },
    "chicken-nuggets": {
        name: "Chicken Nuggets",
        ingredients: [
        { name: "chicken", quantity: "500g" },
        { name: "flour", quantity: "200g" },
        { name: "eggs", quantity: "3 large" },
        { name: "bread", quantity: "to taste" },
        { name: "olive-oil", quantity: "3 tbsp" },
        { name: "vegetables", quantity: "to taste" }
    ],
        difficulty: "Easy",
        time: "30 min",
        cuisine: "American",
        description: "Breaded chicken nuggets",
        instructions: [
            "Gather all ingredients and prepare your workspace.",
            "Follow the recipe steps in order.",
            "Taste and adjust seasoning as needed.",
            "Cook until ingredients are properly heated through.",
            "Serve immediately while hot.",
            "Garnish with fresh herbs if desired."
        ]
    },
    "beef-sloppy-joes": {
        name: "Beef Sloppy Joes",
        ingredients: [
        { name: "beef", quantity: "500g" },
        { name: "bread", quantity: "to taste" },
        { name: "tomatoes", quantity: "400g" },
        { name: "onions", quantity: "2 medium" },
        { name: "garlic", quantity: "3 cloves" },
        { name: "ketchup", quantity: "to taste" },
        { name: "vegetables", quantity: "to taste" }
    ],
        difficulty: "Easy",
        time: "25 min",
        cuisine: "American",
        description: "Sloppy beef sandwich filling",
        instructions: [
            "Gather all ingredients and prepare your workspace.",
            "Follow the recipe steps in order.",
            "Taste and adjust seasoning as needed.",
            "Cook until ingredients are properly heated through.",
            "Serve immediately while hot.",
            "Garnish with fresh herbs if desired."
        ]
    },
    "vegetarian-cobb-salad": {
        name: "Vegetarian Cobb Salad",
        ingredients: [
        { name: "lettuce", quantity: "to taste" },
        { name: "cheese", quantity: "200g grated" },
        { name: "eggs", quantity: "3 large" },
        { name: "tomatoes", quantity: "400g" },
        { name: "avocado", quantity: "to taste" },
        { name: "onions", quantity: "2 medium" },
        { name: "olive-oil", quantity: "3 tbsp" }
    ],
        difficulty: "Easy",
        time: "20 min",
        cuisine: "American",
        description: "Classic Cobb salad without meat",
        instructions: [
            "Wash and dry all vegetables thoroughly.",
            "Chop vegetables into bite-sized pieces.",
            "Prepare your protein if using.",
            "Make dressing by whisking ingredients together.",
            "Combine all ingredients in a large bowl.",
            "Toss with dressing just before serving.",
            "Season with salt and pepper to taste."
        ]
    },
    "chicken-biscuits": {
        name: "Chicken Biscuits",
        ingredients: [
        { name: "chicken", quantity: "500g" },
        { name: "flour", quantity: "200g" },
        { name: "butter", quantity: "100g" },
        { name: "milk", quantity: "300ml" },
        { name: "herbs", quantity: "2 tsp" },
        { name: "vegetables", quantity: "to taste" }
    ],
        difficulty: "Medium",
        time: "45 min",
        cuisine: "American",
        description: "Southern-style chicken and biscuits",
        instructions: [
            "Gather all ingredients and prepare your workspace.",
            "Follow the recipe steps in order.",
            "Taste and adjust seasoning as needed.",
            "Cook until ingredients are properly heated through.",
            "Serve immediately while hot.",
            "Garnish with fresh herbs if desired."
        ]
    },
    "beef-brisket": {
        name: "Beef Brisket",
        ingredients: [
        { name: "beef", quantity: "500g" },
        { name: "onions", quantity: "2 medium" },
        { name: "garlic", quantity: "3 cloves" },
        { name: "barbecue-sauce", quantity: "to taste" },
        { name: "vegetables", quantity: "to taste" },
        { name: "herbs", quantity: "2 tsp" }
    ],
        difficulty: "Hard",
        time: "240 min",
        cuisine: "American",
        description: "Slow-smoked beef brisket",
        instructions: [
            "Gather all ingredients and prepare your workspace.",
            "Follow the recipe steps in order.",
            "Taste and adjust seasoning as needed.",
            "Cook until ingredients are properly heated through.",
            "Serve immediately while hot.",
            "Garnish with fresh herbs if desired."
        ]
    },
    "vegetarian-fried-green-tomatoes": {
        name: "Vegetarian Fried Green Tomatoes",
        ingredients: [
        { name: "tomatoes", quantity: "400g" },
        { name: "flour", quantity: "200g" },
        { name: "eggs", quantity: "3 large" },
        { name: "bread", quantity: "to taste" },
        { name: "olive-oil", quantity: "3 tbsp" },
        { name: "herbs", quantity: "2 tsp" }
    ],
        difficulty: "Medium",
        time: "30 min",
        cuisine: "American",
        description: "Southern fried green tomatoes",
        instructions: [
            "Gather all ingredients and prepare your workspace.",
            "Follow the recipe steps in order.",
            "Taste and adjust seasoning as needed.",
            "Cook until ingredients are properly heated through.",
            "Serve immediately while hot.",
            "Garnish with fresh herbs if desired."
        ]
    },
    "chicken-gumbo": {
        name: "Chicken Gumbo",
        ingredients: [
        { name: "chicken", quantity: "500g" },
        { name: "rice", quantity: "300g" },
        { name: "vegetables", quantity: "to taste" },
        { name: "onions", quantity: "2 medium" },
        { name: "garlic", quantity: "3 cloves" },
        { name: "okra", quantity: "to taste" },
        { name: "herbs", quantity: "2 tsp" },
        { name: "flour", quantity: "200g" }
    ],
        difficulty: "Hard",
        time: "90 min",
        cuisine: "American",
        description: "Louisiana-style chicken gumbo",
        instructions: [
            "Gather all ingredients and prepare your workspace.",
            "Follow the recipe steps in order.",
            "Taste and adjust seasoning as needed.",
            "Cook until ingredients are properly heated through.",
            "Serve immediately while hot.",
            "Garnish with fresh herbs if desired."
        ]
    },
    "beef-pulled-pork": {
        name: "Beef Pulled Beef",
        ingredients: [
        { name: "beef", quantity: "500g" },
        { name: "barbecue-sauce", quantity: "to taste" },
        { name: "bread", quantity: "to taste" },
        { name: "onions", quantity: "2 medium" },
        { name: "garlic", quantity: "3 cloves" },
        { name: "vegetables", quantity: "to taste" }
    ],
        difficulty: "Medium",
        time: "180 min",
        cuisine: "American",
        description: "Slow-cooked pulled beef sandwich",
        instructions: [
            "Gather all ingredients and prepare your workspace.",
            "Follow the recipe steps in order.",
            "Taste and adjust seasoning as needed.",
            "Cook until ingredients are properly heated through.",
            "Serve immediately while hot.",
            "Garnish with fresh herbs if desired."
        ]
    },
    "vegetarian-cornbread": {
        name: "Vegetarian Cornbread",
        ingredients: [
        { name: "cornmeal", quantity: "to taste" },
        { name: "flour", quantity: "200g" },
        { name: "eggs", quantity: "3 large" },
        { name: "milk", quantity: "300ml" },
        { name: "butter", quantity: "100g" },
        { name: "vegetables", quantity: "to taste" }
    ],
        difficulty: "Easy",
        time: "30 min",
        cuisine: "American",
        description: "Southern-style cornbread",
        instructions: [
            "Gather all ingredients and prepare your workspace.",
            "Follow the recipe steps in order.",
            "Taste and adjust seasoning as needed.",
            "Cook until ingredients are properly heated through.",
            "Serve immediately while hot.",
            "Garnish with fresh herbs if desired."
        ]
    },
    "chicken-jambalaya": {
        name: "Chicken Jambalaya",
        ingredients: [
        { name: "chicken", quantity: "500g" },
        { name: "rice", quantity: "300g" },
        { name: "vegetables", quantity: "to taste" },
        { name: "onions", quantity: "2 medium" },
        { name: "garlic", quantity: "3 cloves" },
        { name: "herbs", quantity: "2 tsp" },
        { name: "tomatoes", quantity: "400g" }
    ],
        difficulty: "Medium",
        time: "50 min",
        cuisine: "American",
        description: "Louisiana rice dish with chicken",
        instructions: [
            "Gather all ingredients and prepare your workspace.",
            "Follow the recipe steps in order.",
            "Taste and adjust seasoning as needed.",
            "Cook until ingredients are properly heated through.",
            "Serve immediately while hot.",
            "Garnish with fresh herbs if desired."
        ]
    },
    "beef-philly-cheesesteak": {
        name: "Beef Philly Cheesesteak",
        ingredients: [
        { name: "beef", quantity: "500g" },
        { name: "bread", quantity: "to taste" },
        { name: "cheese", quantity: "200g grated" },
        { name: "onions", quantity: "2 medium" },
        { name: "peppers", quantity: "to taste" },
        { name: "mushrooms", quantity: "300g" },
        { name: "olive-oil", quantity: "3 tbsp" }
    ],
        difficulty: "Easy",
        time: "20 min",
        cuisine: "American",
        description: "Philadelphia-style beef sandwich",
        instructions: [
            "Gather all ingredients and prepare your workspace.",
            "Follow the recipe steps in order.",
            "Taste and adjust seasoning as needed.",
            "Cook until ingredients are properly heated through.",
            "Serve immediately while hot.",
            "Garnish with fresh herbs if desired."
        ]
    },
    "vegetarian-ranch-dip": {
        name: "Vegetarian Ranch Dip",
        ingredients: [
        { name: "sour-cream", quantity: "to taste" },
        { name: "herbs", quantity: "2 tsp" },
        { name: "garlic", quantity: "3 cloves" },
        { name: "onions", quantity: "2 medium" },
        { name: "vegetables", quantity: "to taste" },
        { name: "chips", quantity: "to taste" }
    ],
        difficulty: "Easy",
        time: "10 min",
        cuisine: "American",
        description: "Creamy ranch dip with vegetables",
        instructions: [
            "Gather all ingredients and prepare your workspace.",
            "Follow the recipe steps in order.",
            "Taste and adjust seasoning as needed.",
            "Cook until ingredients are properly heated through.",
            "Serve immediately while hot.",
            "Garnish with fresh herbs if desired."
        ]
    },
    "chicken-buffalo-dip": {
        name: "Chicken Buffalo Dip",
        ingredients: [
        { name: "chicken", quantity: "500g" },
        { name: "cheese", quantity: "200g grated" },
        { name: "hot-sauce", quantity: "to taste" },
        { name: "cream-cheese", quantity: "to taste" },
        { name: "bread", quantity: "to taste" },
        { name: "vegetables", quantity: "to taste" }
    ],
        difficulty: "Easy",
        time: "25 min",
        cuisine: "American",
        description: "Spicy chicken and cheese dip",
        instructions: [
            "Gather all ingredients and prepare your workspace.",
            "Follow the recipe steps in order.",
            "Taste and adjust seasoning as needed.",
            "Cook until ingredients are properly heated through.",
            "Serve immediately while hot.",
            "Garnish with fresh herbs if desired."
        ]
    },
    "beef-corned-beef": {
        name: "Beef Corned Beef",
        ingredients: [
        { name: "beef", quantity: "500g" },
        { name: "cabbage", quantity: "to taste" },
        { name: "potatoes", quantity: "1kg" },
        { name: "onions", quantity: "2 medium" },
        { name: "garlic", quantity: "3 cloves" },
        { name: "herbs", quantity: "2 tsp" },
        { name: "vegetables", quantity: "to taste" }
    ],
        difficulty: "Medium",
        time: "180 min",
        cuisine: "American",
        description: "Traditional corned beef and cabbage",
        instructions: [
            "Gather all ingredients and prepare your workspace.",
            "Follow the recipe steps in order.",
            "Taste and adjust seasoning as needed.",
            "Cook until ingredients are properly heated through.",
            "Serve immediately while hot.",
            "Garnish with fresh herbs if desired."
        ]
    },
    "vegetarian-deviled-eggs": {
        name: "Vegetarian Deviled Eggs",
        ingredients: [
        { name: "eggs", quantity: "3 large" },
        { name: "mayo", quantity: "to taste" },
        { name: "mustard", quantity: "to taste" },
        { name: "herbs", quantity: "2 tsp" },
        { name: "paprika", quantity: "1 tsp" },
        { name: "vegetables", quantity: "to taste" }
    ],
        difficulty: "Easy",
        time: "30 min",
        cuisine: "American",
        description: "Classic deviled eggs appetizer",
        instructions: [
            "Gather all ingredients and prepare your workspace.",
            "Follow the recipe steps in order.",
            "Taste and adjust seasoning as needed.",
            "Cook until ingredients are properly heated through.",
            "Serve immediately while hot.",
            "Garnish with fresh herbs if desired."
        ]
    },
    "chicken-clam-chowder": {
        name: "Chicken Clam Chowder",
        ingredients: [
        { name: "chicken", quantity: "500g" },
        { name: "potatoes", quantity: "1kg" },
        { name: "onions", quantity: "2 medium" },
        { name: "garlic", quantity: "3 cloves" },
        { name: "milk", quantity: "300ml" },
        { name: "butter", quantity: "100g" },
        { name: "herbs", quantity: "2 tsp" },
        { name: "bread", quantity: "to taste" }
    ],
        difficulty: "Medium",
        time: "45 min",
        cuisine: "American",
        description: "Creamy chicken chowder soup",
        instructions: [
            "Gather all ingredients and prepare your workspace.",
            "Follow the recipe steps in order.",
            "Taste and adjust seasoning as needed.",
            "Cook until ingredients are properly heated through.",
            "Serve immediately while hot.",
            "Garnish with fresh herbs if desired."
        ]
    },
    "beef-meatballs": {
        name: "Beef Meatballs",
        ingredients: [
        { name: "beef", quantity: "500g" },
        { name: "eggs", quantity: "3 large" },
        { name: "bread", quantity: "to taste" },
        { name: "onions", quantity: "2 medium" },
        { name: "garlic", quantity: "3 cloves" },
        { name: "herbs", quantity: "2 tsp" },
        { name: "tomatoes", quantity: "400g" },
        { name: "pasta", quantity: "400g" }
    ],
        difficulty: "Medium",
        time: "40 min",
        cuisine: "American",
        description: "Italian-style beef meatballs",
        instructions: [
            "Gather all ingredients and prepare your workspace.",
            "Follow the recipe steps in order.",
            "Taste and adjust seasoning as needed.",
            "Cook until ingredients are properly heated through.",
            "Serve immediately while hot.",
            "Garnish with fresh herbs if desired."
        ]
    },
    "vegetarian-sweet-potato-casserole": {
        name: "Vegetarian Sweet Potato Casserole",
        ingredients: [
        { name: "sweet-potatoes", quantity: "to taste" },
        { name: "marshmallows", quantity: "to taste" },
        { name: "brown-sugar", quantity: "to taste" },
        { name: "butter", quantity: "100g" },
        { name: "nuts", quantity: "100g" },
        { name: "herbs", quantity: "2 tsp" }
    ],
        difficulty: "Easy",
        time: "60 min",
        cuisine: "American",
        description: "Sweet potato casserole with marshmallows",
        instructions: [
            "Gather all ingredients and prepare your workspace.",
            "Follow the recipe steps in order.",
            "Taste and adjust seasoning as needed.",
            "Cook until ingredients are properly heated through.",
            "Serve immediately while hot.",
            "Garnish with fresh herbs if desired."
        ]
    },

    // INDIAN CUISINE (20 recipes)
    "chicken-curry": {
        name: "Chicken Curry",
        ingredients: [
            { name: "chicken", quantity: "500g" },
            { name: "onions", quantity: "2 medium" },
            { name: "garlic", quantity: "4 cloves" },
            { name: "ginger", quantity: "2 tbsp" },
            { name: "tomatoes", quantity: "400g" },
            { name: "coconut-milk", quantity: "400ml" },
            { name: "curry-powder", quantity: "2 tbsp" },
            { name: "rice", quantity: "300g" }
        ],
        difficulty: "Medium",
        time: "45 min",
        cuisine: "Indian",
        description: "Aromatic chicken curry with coconut milk and spices",
        image: "https://images.unsplash.com/photo-1565557623262-b51c2513a641?w=400&h=300&fit=crop&crop=center",
        instructions: [
            "Heat oil in a large pot over medium heat.",
            "Add diced onions and cook until softened, about 5 minutes.",
            "Add minced garlic and ginger, cook for 1 minute until fragrant.",
            "Add curry powder and cook for 30 seconds until aromatic.",
            "Add diced tomatoes and cook until they break down, about 8 minutes.",
            "Add chicken pieces and cook until browned on all sides.",
            "Pour in coconut milk and bring to a simmer.",
            "Reduce heat and simmer for 20-25 minutes until chicken is cooked through.",
            "Season with salt and pepper to taste.",
            "Serve over cooked rice with fresh cilantro."
        ]
    },
    "vegetable-biryani": {
        name: "Vegetable Biryani",
        ingredients: [
            { name: "rice", quantity: "400g basmati" },
            { name: "vegetables", quantity: "500g mixed" },
            { name: "onions", quantity: "2 large" },
            { name: "garlic", quantity: "4 cloves" },
            { name: "ginger", quantity: "2 tbsp" },
            { name: "yogurt", quantity: "200ml" },
            { name: "biryani-spices", quantity: "2 tbsp" },
            { name: "saffron", quantity: "pinch" }
        ],
        difficulty: "Hard",
        time: "90 min",
        cuisine: "Indian",
        description: "Fragrant rice dish with mixed vegetables and aromatic spices",
        image: "https://images.unsplash.com/photo-1563379091339-03246963d96a?w=400&h=300&fit=crop&crop=center",
        instructions: [
            "Soak basmati rice for 30 minutes, then drain.",
            "Heat oil in a heavy-bottomed pot over medium heat.",
            "Add sliced onions and fry until golden brown and crispy.",
            "Remove half the onions and set aside for garnish.",
            "Add ginger-garlic paste to remaining onions, cook for 2 minutes.",
            "Add mixed vegetables and cook for 5 minutes.",
            "Add yogurt and biryani spice mix, cook for 3 minutes.",
            "Layer the partially cooked rice over the vegetables.",
            "Sprinkle saffron soaked in warm milk over rice.",
            "Cover and cook on low heat for 45 minutes.",
            "Let it rest for 10 minutes before serving.",
            "Garnish with reserved fried onions and fresh mint."
        ]
    },
    "dal-tadka": {
        name: "Dal Tadka",
        ingredients: [
            { name: "lentils", quantity: "300g" },
            { name: "onions", quantity: "1 medium" },
            { name: "garlic", quantity: "4 cloves" },
            { name: "ginger", quantity: "1 tbsp" },
            { name: "tomatoes", quantity: "200g" },
            { name: "cumin-seeds", quantity: "1 tsp" },
            { name: "turmeric", quantity: "1/2 tsp" },
            { name: "ghee", quantity: "2 tbsp" }
        ],
        difficulty: "Easy",
        time: "35 min",
        cuisine: "Indian",
        description: "Comforting lentil curry with aromatic tempering",
        image: "https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=400&h=300&fit=crop&crop=center",
        instructions: [
            "Rinse lentils and cook with water and turmeric until soft.",
            "Heat ghee in a pan over medium heat.",
            "Add cumin seeds and let them splutter.",
            "Add minced garlic and ginger, cook for 1 minute.",
            "Add diced onions and cook until golden.",
            "Add chopped tomatoes and cook until mushy.",
            "Pour this tempering over the cooked lentils.",
            "Simmer for 10 minutes, stirring occasionally.",
            "Season with salt and garnish with cilantro.",
            "Serve hot with rice or Indian bread."
        ]
    },

    // FRENCH CUISINE (20 recipes)
    "coq-au-vin": {
        name: "Coq au Vin",
        ingredients: [
            { name: "chicken", quantity: "1 whole" },
            { name: "wine", quantity: "750ml red" },
            { name: "bacon", quantity: "200g" },
            { name: "mushrooms", quantity: "300g" },
            { name: "onions", quantity: "12 pearl" },
            { name: "garlic", quantity: "4 cloves" },
            { name: "herbs", quantity: "bouquet garni" },
            { name: "butter", quantity: "50g" }
        ],
        difficulty: "Hard",
        time: "120 min",
        cuisine: "French",
        description: "Classic French braised chicken in red wine",
        image: "https://images.unsplash.com/photo-1574894709920-11b28e7367e3?w=400&h=300&fit=crop&crop=center",
        instructions: [
            "Cut chicken into pieces and season with salt and pepper.",
            "Cook bacon in a large pot until crispy, remove and set aside.",
            "Brown chicken pieces in the bacon fat until golden.",
            "Remove chicken and add pearl onions, cook until browned.",
            "Add garlic and cook for 1 minute.",
            "Return chicken and bacon to pot.",
            "Add red wine and bouquet garni.",
            "Bring to a boil, then simmer covered for 1 hour.",
            "Add mushrooms and cook for 30 minutes more.",
            "Thicken sauce with butter if desired.",
            "Remove bouquet garni and serve hot.",
            "Traditionally served with crusty bread or potatoes."
        ]
    },
    "beef-bourguignon": {
        name: "Beef Bourguignon",
        ingredients: [
            { name: "beef", quantity: "1kg chuck" },
            { name: "wine", quantity: "750ml red" },
            { name: "bacon", quantity: "200g" },
            { name: "carrots", quantity: "3 large" },
            { name: "onions", quantity: "2 medium" },
            { name: "mushrooms", quantity: "300g" },
            { name: "garlic", quantity: "4 cloves" },
            { name: "flour", quantity: "3 tbsp" }
        ],
        difficulty: "Hard",
        time: "150 min",
        cuisine: "French",
        description: "Slow-braised beef in red wine with vegetables",
        image: "https://images.unsplash.com/photo-1603360946369-dc9bb6258143?w=400&h=300&fit=crop&crop=center",
        instructions: [
            "Cut beef into large cubes and season with salt and pepper.",
            "Cook bacon until crispy, remove and set aside.",
            "Brown beef cubes in batches in the bacon fat.",
            "Remove beef and add diced onions and carrots.",
            "Cook vegetables until softened, about 5 minutes.",
            "Sprinkle flour over vegetables and cook for 2 minutes.",
            "Add red wine and scrape up browned bits.",
            "Return beef and bacon to pot with herbs.",
            "Cover and braise in oven at 325°F for 2 hours.",
            "Add mushrooms in the last 30 minutes.",
            "Adjust seasoning and serve with mashed potatoes.",
            "Garnish with fresh parsley."
        ]
    },
    "tandoori-chicken": {
        name: "Tandoori Chicken",
        ingredients: [
            { name: "chicken", quantity: "1 whole" },
            { name: "yogurt", quantity: "200ml" },
            { name: "garlic", quantity: "6 cloves" },
            { name: "ginger", quantity: "2 tbsp" },
            { name: "tandoori-spices", quantity: "3 tbsp" },
            { name: "lemon", quantity: "2 pieces" },
            { name: "onions", quantity: "1 large" },
            { name: "cilantro", quantity: "fresh bunch" }
        ],
        difficulty: "Medium",
        time: "60 min",
        cuisine: "Indian",
        description: "Marinated chicken roasted with aromatic spices",
        image: "https://images.unsplash.com/photo-1599487488170-d11ec9c172f0?w=400&h=300&fit=crop&crop=center",
        instructions: [
            "Cut chicken into pieces and make deep cuts.",
            "Mix yogurt, minced garlic, ginger, and tandoori spices.",
            "Add lemon juice and salt to the marinade.",
            "Coat chicken pieces thoroughly with marinade.",
            "Marinate for at least 2 hours or overnight.",
            "Preheat oven to 450°F (230°C).",
            "Place marinated chicken on a baking tray.",
            "Roast for 25-30 minutes until cooked through.",
            "Garnish with sliced onions and cilantro.",
            "Serve hot with naan bread and mint chutney."
        ]
    },
    "palak-paneer": {
        name: "Palak Paneer",
        ingredients: [
            { name: "spinach", quantity: "500g" },
            { name: "paneer", quantity: "300g" },
            { name: "onions", quantity: "2 medium" },
            { name: "garlic", quantity: "4 cloves" },
            { name: "ginger", quantity: "1 tbsp" },
            { name: "tomatoes", quantity: "200g" },
            { name: "cream", quantity: "100ml" },
            { name: "spices", quantity: "garam masala" }
        ],
        difficulty: "Medium",
        time: "40 min",
        cuisine: "Indian",
        description: "Cottage cheese in creamy spinach gravy",
        image: "https://images.unsplash.com/photo-1631452180519-c014fe946bc7?w=400&h=300&fit=crop&crop=center",
        instructions: [
            "Blanch spinach in boiling water for 2 minutes.",
            "Drain and blend spinach to smooth puree.",
            "Cut paneer into cubes and lightly fry.",
            "Heat oil and sauté onions until golden.",
            "Add ginger-garlic paste and cook for 2 minutes.",
            "Add chopped tomatoes and cook until soft.",
            "Add spinach puree and simmer for 10 minutes.",
            "Add fried paneer cubes to the gravy.",
            "Stir in cream and garam masala.",
            "Serve hot with rice or Indian bread."
        ]
    },

    // THAI CUISINE (5 recipes)
    "pad-thai": {
        name: "Pad Thai",
        ingredients: [
            { name: "noodles", quantity: "300g rice" },
            { name: "shrimp", quantity: "300g" },
            { name: "eggs", quantity: "2 large" },
            { name: "bean-sprouts", quantity: "200g" },
            { name: "garlic", quantity: "3 cloves" },
            { name: "fish-sauce", quantity: "3 tbsp" },
            { name: "tamarind", quantity: "2 tbsp" },
            { name: "peanuts", quantity: "100g crushed" }
        ],
        difficulty: "Medium",
        time: "30 min",
        cuisine: "Thai",
        description: "Classic Thai stir-fried noodles with shrimp",
        image: "https://images.unsplash.com/photo-1559314809-0f31657def5e?w=400&h=300&fit=crop&crop=center",
        instructions: [
            "Soak rice noodles in warm water until soft.",
            "Heat oil in a large wok over high heat.",
            "Add minced garlic and stir-fry for 30 seconds.",
            "Add shrimp and cook until pink and cooked through.",
            "Push ingredients to one side of wok.",
            "Scramble eggs on empty side of wok.",
            "Add drained noodles and toss everything together.",
            "Add fish sauce and tamarind paste.",
            "Add bean sprouts and stir-fry for 2 minutes.",
            "Garnish with crushed peanuts and serve immediately."
        ]
    },
    "green-curry": {
        name: "Thai Green Curry",
        ingredients: [
            { name: "chicken", quantity: "500g" },
            { name: "coconut-milk", quantity: "400ml" },
            { name: "green-curry-paste", quantity: "3 tbsp" },
            { name: "vegetables", quantity: "300g mixed" },
            { name: "fish-sauce", quantity: "2 tbsp" },
            { name: "basil", quantity: "fresh leaves" },
            { name: "lime", quantity: "1 piece" },
            { name: "rice", quantity: "300g jasmine" }
        ],
        difficulty: "Easy",
        time: "25 min",
        cuisine: "Thai",
        description: "Creamy coconut curry with green chilies",
        image: "https://images.unsplash.com/photo-1455619452474-d2be8b1e70cd?w=400&h=300&fit=crop&crop=center",
        instructions: [
            "Heat thick coconut milk in a large pot.",
            "Add green curry paste and fry for 2 minutes.",
            "Add chicken pieces and cook until sealed.",
            "Add remaining coconut milk and bring to simmer.",
            "Add vegetables and cook for 10 minutes.",
            "Season with fish sauce and palm sugar.",
            "Add fresh basil leaves and lime juice.",
            "Simmer for 2 more minutes.",
            "Taste and adjust seasoning.",
            "Serve hot over jasmine rice."
        ]
    },

    // JAPANESE CUISINE (5 recipes)
    "chicken-teriyaki": {
        name: "Chicken Teriyaki",
        ingredients: [
            { name: "chicken", quantity: "600g thighs" },
            { name: "soy-sauce", quantity: "4 tbsp" },
            { name: "mirin", quantity: "3 tbsp" },
            { name: "sugar", quantity: "2 tbsp" },
            { name: "ginger", quantity: "1 tbsp" },
            { name: "garlic", quantity: "2 cloves" },
            { name: "rice", quantity: "300g" },
            { name: "sesame-seeds", quantity: "1 tbsp" }
        ],
        difficulty: "Easy",
        time: "25 min",
        cuisine: "Japanese",
        description: "Sweet and savory glazed chicken",
        image: "https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=400&h=300&fit=crop&crop=center",
        instructions: [
            "Cut chicken into bite-sized pieces.",
            "Mix soy sauce, mirin, and sugar for teriyaki sauce.",
            "Heat oil in a large skillet over medium-high heat.",
            "Add chicken and cook until golden brown.",
            "Add minced ginger and garlic, cook for 1 minute.",
            "Pour teriyaki sauce over chicken.",
            "Simmer until sauce thickens and glazes chicken.",
            "Cook until chicken is cooked through.",
            "Sprinkle with sesame seeds.",
            "Serve over steamed rice."
        ]
    },
    "salmon-teriyaki": {
        name: "Salmon Teriyaki",
        ingredients: [
            { name: "salmon", quantity: "600g fillets" },
            { name: "soy-sauce", quantity: "4 tbsp" },
            { name: "mirin", quantity: "3 tbsp" },
            { name: "honey", quantity: "2 tbsp" },
            { name: "ginger", quantity: "1 tbsp" },
            { name: "garlic", quantity: "2 cloves" },
            { name: "rice", quantity: "300g" },
            { name: "scallions", quantity: "2 pieces" }
        ],
        difficulty: "Easy",
        time: "20 min",
        cuisine: "Japanese",
        description: "Glazed salmon with sweet teriyaki sauce",
        image: "https://images.unsplash.com/photo-1467003909585-2f8a72700288?w=400&h=300&fit=crop&crop=center",
        instructions: [
            "Pat salmon fillets dry and season with salt.",
            "Mix soy sauce, mirin, and honey for glaze.",
            "Heat oil in a large skillet over medium-high heat.",
            "Cook salmon skin-side up for 4 minutes.",
            "Flip salmon and cook for 3 more minutes.",
            "Add minced ginger and garlic to pan.",
            "Pour teriyaki glaze over salmon.",
            "Cook until glaze thickens, about 2 minutes.",
            "Garnish with sliced scallions.",
            "Serve immediately over steamed rice."
        ]
    },

    // MIDDLE EASTERN CUISINE (5 recipes)
    "hummus": {
        name: "Classic Hummus",
        ingredients: [
            { name: "chickpeas", quantity: "400g cooked" },
            { name: "tahini", quantity: "3 tbsp" },
            { name: "lemon", quantity: "2 pieces juiced" },
            { name: "garlic", quantity: "3 cloves" },
            { name: "olive-oil", quantity: "4 tbsp" },
            { name: "cumin", quantity: "1 tsp" },
            { name: "paprika", quantity: "for garnish" },
            { name: "parsley", quantity: "fresh" }
        ],
        difficulty: "Easy",
        time: "15 min",
        cuisine: "Middle Eastern",
        description: "Creamy chickpea dip with tahini and lemon",
        image: "https://images.unsplash.com/photo-1571197119282-7c4b999c9616?w=400&h=300&fit=crop&crop=center",
        instructions: [
            "Drain and rinse cooked chickpeas.",
            "Add chickpeas to food processor.",
            "Add tahini, lemon juice, and minced garlic.",
            "Process until smooth and creamy.",
            "Add cold water gradually while processing.",
            "Season with salt and cumin.",
            "Transfer to serving bowl.",
            "Drizzle with olive oil.",
            "Sprinkle with paprika and parsley.",
            "Serve with pita bread or vegetables."
        ]
    },
    "falafel": {
        name: "Falafel",
        ingredients: [
            { name: "chickpeas", quantity: "400g dried" },
            { name: "onions", quantity: "1 medium" },
            { name: "garlic", quantity: "4 cloves" },
            { name: "parsley", quantity: "1 cup fresh" },
            { name: "cumin", quantity: "2 tsp" },
            { name: "coriander", quantity: "1 tsp" },
            { name: "flour", quantity: "2 tbsp" },
            { name: "oil", quantity: "for frying" }
        ],
        difficulty: "Medium",
        time: "45 min",
        cuisine: "Middle Eastern",
        description: "Deep-fried chickpea balls with herbs and spices",
        image: "https://images.unsplash.com/photo-1593504049359-74330189a345?w=400&h=300&fit=crop&crop=center",
        instructions: [
            "Soak dried chickpeas overnight, then drain.",
            "Add chickpeas to food processor and pulse.",
            "Add onion, garlic, and parsley.",
            "Add cumin, coriander, salt, and pepper.",
            "Process until mixture is coarse, not smooth.",
            "Add flour and mix well.",
            "Refrigerate mixture for 1 hour.",
            "Form mixture into small balls.",
            "Heat oil to 350°F and fry falafel until golden.",
            "Serve hot with tahini sauce and pita."
        ]
    },

    // GERMAN CUISINE (5 recipes)
    "schnitzel": {
        name: "Wiener Schnitzel",
        ingredients: [
            { name: "veal", quantity: "4 cutlets" },
            { name: "flour", quantity: "100g" },
            { name: "eggs", quantity: "2 large" },
            { name: "breadcrumbs", quantity: "200g" },
            { name: "butter", quantity: "100g" },
            { name: "lemon", quantity: "2 pieces" },
            { name: "parsley", quantity: "fresh" },
            { name: "potatoes", quantity: "600g" }
        ],
        difficulty: "Medium",
        time: "40 min",
        cuisine: "German",
        description: "Breaded and pan-fried veal cutlets",
        image: "https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=400&h=300&fit=crop&crop=center",
        instructions: [
            "Pound veal cutlets to 1/4 inch thickness.",
            "Season cutlets with salt and pepper.",
            "Set up breading station: flour, beaten eggs, breadcrumbs.",
            "Dredge each cutlet in flour, then egg, then breadcrumbs.",
            "Heat butter in large skillet over medium-high heat.",
            "Fry schnitzels for 2-3 minutes per side until golden.",
            "Remove and drain on paper towels.",
            "Serve immediately with lemon wedges.",
            "Garnish with fresh parsley.",
            "Traditionally served with boiled potatoes."
        ]
    },
    "sauerbraten": {
        name: "Sauerbraten",
        ingredients: [
            { name: "beef", quantity: "1.5kg roast" },
            { name: "vinegar", quantity: "500ml" },
            { name: "wine", quantity: "250ml red" },
            { name: "onions", quantity: "2 large" },
            { name: "carrots", quantity: "2 medium" },
            { name: "bay-leaves", quantity: "3 pieces" },
            { name: "juniper-berries", quantity: "10 pieces" },
            { name: "gingersnaps", quantity: "6 cookies" }
        ],
        difficulty: "Hard",
        time: "240 min",
        cuisine: "German",
        description: "Traditional German pot roast in sweet-sour sauce",
        image: "https://images.unsplash.com/photo-1574894709920-11b28e7367e3?w=400&h=300&fit=crop&crop=center",
        instructions: [
            "Marinate beef in vinegar, wine, and spices for 3 days.",
            "Remove beef from marinade and pat dry.",
            "Strain and reserve marinade.",
            "Brown beef on all sides in a heavy pot.",
            "Add strained marinade to pot.",
            "Cover and braise in oven at 325°F for 3 hours.",
            "Remove beef and strain cooking liquid.",
            "Crush gingersnaps and add to liquid.",
            "Simmer until sauce thickens.",
            "Slice beef and serve with sauce.",
            "Traditionally served with red cabbage and dumplings."
        ]
    },

    // RUSSIAN CUISINE (5 recipes)
    "beef-stroganoff": {
        name: "Beef Stroganoff",
        ingredients: [
            { name: "beef", quantity: "600g strips" },
            { name: "mushrooms", quantity: "300g" },
            { name: "onions", quantity: "1 large" },
            { name: "sour-cream", quantity: "200ml" },
            { name: "flour", quantity: "2 tbsp" },
            { name: "butter", quantity: "50g" },
            { name: "beef-stock", quantity: "300ml" },
            { name: "noodles", quantity: "400g egg" }
        ],
        difficulty: "Medium",
        time: "35 min",
        cuisine: "Russian",
        description: "Tender beef in creamy mushroom sauce",
        image: "https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=400&h=300&fit=crop&crop=center",
        instructions: [
            "Cut beef into thin strips and season with salt and pepper.",
            "Heat butter in a large skillet over high heat.",
            "Brown beef strips quickly and remove from pan.",
            "Add sliced onions and mushrooms to same pan.",
            "Cook until vegetables are softened.",
            "Sprinkle flour over vegetables and stir.",
            "Gradually add beef stock, stirring constantly.",
            "Return beef to pan and simmer for 10 minutes.",
            "Stir in sour cream and heat through.",
            "Serve over cooked egg noodles."
        ]
    },
    "borscht": {
        name: "Borscht",
        ingredients: [
            { name: "beets", quantity: "4 large" },
            { name: "cabbage", quantity: "300g" },
            { name: "carrots", quantity: "2 medium" },
            { name: "onions", quantity: "1 large" },
            { name: "garlic", quantity: "3 cloves" },
            { name: "beef-stock", quantity: "1.5L" },
            { name: "sour-cream", quantity: "200ml" },
            { name: "dill", quantity: "fresh" }
        ],
        difficulty: "Medium",
        time: "90 min",
        cuisine: "Russian",
        description: "Traditional beetroot soup with sour cream",
        image: "https://images.unsplash.com/photo-1547592166-23ac45744acd?w=400&h=300&fit=crop&crop=center",
        instructions: [
            "Peel and grate fresh beets.",
            "Dice onions, carrots, and cabbage.",
            "Heat oil in a large pot over medium heat.",
            "Sauté onions until translucent.",
            "Add carrots and cook for 5 minutes.",
            "Add grated beets and cook for 10 minutes.",
            "Add beef stock and bring to boil.",
            "Add cabbage and simmer for 30 minutes.",
            "Season with salt, pepper, and minced garlic.",
            "Serve hot with a dollop of sour cream and fresh dill."
        ]
    },

    // ADDITIONAL FISH RECIPES (6 recipes)
    "fish-and-chips": {
        name: "Fish and Chips",
        ingredients: [
            { name: "fish", quantity: "600g white fish" },
            { name: "potatoes", quantity: "800g" },
            { name: "flour", quantity: "200g" },
            { name: "eggs", quantity: "2 large" },
            { name: "breadcrumbs", quantity: "150g" },
            { name: "oil", quantity: "for frying" },
            { name: "lemon", quantity: "2 pieces" },
            { name: "herbs", quantity: "tartar sauce" }
        ],
        difficulty: "Medium",
        time: "45 min",
        cuisine: "British",
        description: "Classic battered fish with crispy chips",
        image: "https://images.unsplash.com/photo-1544943910-4c1dc44aab44?w=400&h=300&fit=crop&crop=center",
        instructions: [
            "Cut fish into portions and season with salt and pepper.",
            "Cut potatoes into thick chips and soak in water.",
            "Make batter with flour, eggs, and cold water.",
            "Heat oil to 350°F for deep frying.",
            "Dry fish and dip in batter.",
            "Fry fish until golden brown and crispy.",
            "Fry chips until golden and crispy.",
            "Drain on paper towels.",
            "Serve immediately with lemon wedges.",
            "Traditionally served with mushy peas and tartar sauce."
        ]
    },
    "fish-tacos": {
        name: "Fish Tacos",
        ingredients: [
            { name: "fish", quantity: "500g white fish" },
            { name: "tortillas", quantity: "8 small" },
            { name: "cabbage", quantity: "200g shredded" },
            { name: "lime", quantity: "3 pieces" },
            { name: "cilantro", quantity: "fresh bunch" },
            { name: "avocado", quantity: "2 pieces" },
            { name: "chili", quantity: "1 jalapeño" },
            { name: "sour-cream", quantity: "100ml" }
        ],
        difficulty: "Easy",
        time: "25 min",
        cuisine: "Mexican",
        description: "Grilled fish in soft tacos with fresh toppings",
        image: "https://images.unsplash.com/photo-1565299507177-b0ac66763828?w=400&h=300&fit=crop&crop=center",
        instructions: [
            "Season fish fillets with lime juice and spices.",
            "Heat grill or skillet over medium-high heat.",
            "Cook fish for 3-4 minutes per side until flaky.",
            "Warm tortillas in a dry skillet.",
            "Flake fish into bite-sized pieces.",
            "Assemble tacos with fish, cabbage, and avocado.",
            "Top with cilantro and jalapeño.",
            "Serve with lime wedges and sour cream.",
            "Add hot sauce if desired.",
            "Serve immediately while fish is hot."
        ]
    },
    "fish-curry": {
        name: "Fish Curry",
        ingredients: [
            { name: "fish", quantity: "600g firm fish" },
            { name: "coconut-milk", quantity: "400ml" },
            { name: "onions", quantity: "2 medium" },
            { name: "garlic", quantity: "4 cloves" },
            { name: "ginger", quantity: "2 tbsp" },
            { name: "tomatoes", quantity: "300g" },
            { name: "curry-powder", quantity: "2 tbsp" },
            { name: "rice", quantity: "300g" }
        ],
        difficulty: "Medium",
        time: "35 min",
        cuisine: "Indian",
        description: "Spicy fish curry in coconut milk",
        image: "https://images.unsplash.com/photo-1565557623262-b51c2513a641?w=400&h=300&fit=crop&crop=center",
        instructions: [
            "Cut fish into large chunks and marinate with turmeric.",
            "Heat oil in a large pan over medium heat.",
            "Add diced onions and cook until golden.",
            "Add ginger-garlic paste and cook for 2 minutes.",
            "Add curry powder and cook until fragrant.",
            "Add chopped tomatoes and cook until soft.",
            "Pour in coconut milk and bring to simmer.",
            "Gently add fish pieces and cook for 10 minutes.",
            "Season with salt and garnish with cilantro.",
            "Serve hot over steamed rice."
        ]
    },
    "fish-cakes": {
        name: "Fish Cakes",
        ingredients: [
            { name: "fish", quantity: "500g cooked fish" },
            { name: "potatoes", quantity: "400g mashed" },
            { name: "eggs", quantity: "1 large" },
            { name: "onions", quantity: "1 small" },
            { name: "herbs", quantity: "parsley & dill" },
            { name: "breadcrumbs", quantity: "100g" },
            { name: "flour", quantity: "50g" },
            { name: "oil", quantity: "for frying" }
        ],
        difficulty: "Medium",
        time: "40 min",
        cuisine: "British",
        description: "Pan-fried fish cakes with herbs",
        image: "https://images.unsplash.com/photo-1544943910-4c1dc44aab44?w=400&h=300&fit=crop&crop=center",
        instructions: [
            "Flake cooked fish, removing any bones.",
            "Mix fish with mashed potatoes.",
            "Add beaten egg, minced onion, and herbs.",
            "Season with salt and pepper.",
            "Shape mixture into 8 patties.",
            "Coat each patty in flour, then breadcrumbs.",
            "Heat oil in a large skillet.",
            "Fry fish cakes for 3-4 minutes per side until golden.",
            "Drain on paper towels.",
            "Serve hot with lemon and salad."
        ]
    },
    "fish-pie": {
        name: "Fish Pie",
        ingredients: [
            { name: "fish", quantity: "600g mixed fish" },
            { name: "potatoes", quantity: "800g" },
            { name: "milk", quantity: "500ml" },
            { name: "butter", quantity: "75g" },
            { name: "flour", quantity: "50g" },
            { name: "eggs", quantity: "3 hard-boiled" },
            { name: "herbs", quantity: "parsley" },
            { name: "cheese", quantity: "100g grated" }
        ],
        difficulty: "Hard",
        time: "75 min",
        cuisine: "British",
        description: "Creamy fish pie with mashed potato topping",
        image: "https://images.unsplash.com/photo-1544943910-4c1dc44aab44?w=400&h=300&fit=crop&crop=center",
        instructions: [
            "Preheat oven to 400°F (200°C).",
            "Poach fish in milk until just cooked.",
            "Remove fish and strain milk, reserving both.",
            "Make white sauce with butter, flour, and fish milk.",
            "Flake fish and mix with sauce and chopped eggs.",
            "Add herbs and season with salt and pepper.",
            "Transfer mixture to baking dish.",
            "Top with mashed potatoes and grated cheese.",
            "Bake for 25-30 minutes until golden.",
            "Serve hot with green vegetables."
        ]
    },

    // ADDITIONAL PORK RECIPES (18 more needed)
    "pork-chops": {
        name: "Pork Chops",
        ingredients: [
            { name: "pork", quantity: "4 thick chops" },
            { name: "garlic", quantity: "4 cloves" },
            { name: "herbs", quantity: "rosemary & thyme" },
            { name: "olive-oil", quantity: "3 tbsp" },
            { name: "butter", quantity: "50g" },
            { name: "onions", quantity: "1 medium" },
            { name: "potatoes", quantity: "600g" },
            { name: "wine", quantity: "150ml white" }
        ],
        difficulty: "Medium",
        time: "35 min",
        cuisine: "American",
        description: "Juicy pan-seared pork chops with herbs",
        image: "https://images.unsplash.com/photo-1529692236671-f1f6cf9683ba?w=400&h=300&fit=crop&crop=center",
        instructions: [
            "Season pork chops with salt, pepper, and herbs.",
            "Heat olive oil in a large skillet over medium-high heat.",
            "Sear pork chops for 4-5 minutes per side until golden.",
            "Remove chops and add butter to pan.",
            "Add minced garlic and sliced onions.",
            "Cook until onions are caramelized.",
            "Add white wine and scrape up browned bits.",
            "Return pork chops to pan.",
            "Cover and cook for 10 minutes until done.",
            "Serve with roasted potatoes and pan sauce."
        ]
    },
    "pork-tenderloin": {
        name: "Pork Tenderloin",
        ingredients: [
            { name: "pork", quantity: "800g tenderloin" },
            { name: "garlic", quantity: "4 cloves" },
            { name: "herbs", quantity: "sage & rosemary" },
            { name: "honey", quantity: "3 tbsp" },
            { name: "soy-sauce", quantity: "2 tbsp" },
            { name: "ginger", quantity: "1 tbsp" },
            { name: "vegetables", quantity: "400g root" },
            { name: "olive-oil", quantity: "3 tbsp" }
        ],
        difficulty: "Medium",
        time: "50 min",
        cuisine: "American",
        description: "Roasted pork tenderloin with honey glaze",
        image: "https://images.unsplash.com/photo-1544943910-4c1dc44aab44?w=400&h=300&fit=crop&crop=center",
        instructions: [
            "Preheat oven to 425°F (220°C).",
            "Season pork tenderloin with salt and pepper.",
            "Mix honey, soy sauce, and minced ginger for glaze.",
            "Heat oil in oven-safe skillet over high heat.",
            "Sear tenderloin on all sides until browned.",
            "Brush with honey glaze.",
            "Add root vegetables around pork.",
            "Roast in oven for 20-25 minutes.",
            "Rest for 5 minutes before slicing.",
            "Serve with roasted vegetables and pan juices."
        ]
    },

    // ADDITIONAL SALMON RECIPES (4 more recipes)
    "salmon-grilled": {
        name: "Grilled Salmon",
        ingredients: [
            { name: "salmon", quantity: "600g fillets" },
            { name: "lemon", quantity: "2 pieces" },
            { name: "garlic", quantity: "3 cloves" },
            { name: "herbs", quantity: "dill & parsley" },
            { name: "olive-oil", quantity: "3 tbsp" },
            { name: "vegetables", quantity: "asparagus" },
            { name: "butter", quantity: "50g" },
            { name: "capers", quantity: "2 tbsp" }
        ],
        difficulty: "Easy",
        time: "20 min",
        cuisine: "Mediterranean",
        description: "Simple grilled salmon with lemon and herbs",
        image: "https://images.unsplash.com/photo-1467003909585-2f8a72700288?w=400&h=300&fit=crop&crop=center",
        instructions: [
            "Preheat grill to medium-high heat.",
            "Pat salmon fillets dry and season with salt and pepper.",
            "Brush with olive oil and minced garlic.",
            "Grill salmon for 4-5 minutes per side.",
            "Meanwhile, steam asparagus until tender.",
            "Make lemon butter sauce with herbs and capers.",
            "Check salmon is cooked through but still moist.",
            "Serve immediately with lemon butter sauce.",
            "Garnish with fresh herbs.",
            "Accompany with grilled vegetables."
        ]
    },
    "salmon-baked": {
        name: "Baked Salmon",
        ingredients: [
            { name: "salmon", quantity: "800g whole side" },
            { name: "lemon", quantity: "2 pieces" },
            { name: "garlic", quantity: "4 cloves" },
            { name: "herbs", quantity: "rosemary & thyme" },
            { name: "olive-oil", quantity: "4 tbsp" },
            { name: "potatoes", quantity: "600g baby" },
            { name: "vegetables", quantity: "mixed" },
            { name: "butter", quantity: "75g" }
        ],
        difficulty: "Easy",
        time: "35 min",
        cuisine: "Mediterranean",
        description: "Oven-baked salmon with roasted vegetables",
        image: "https://images.unsplash.com/photo-1467003909585-2f8a72700288?w=400&h=300&fit=crop&crop=center",
        instructions: [
            "Preheat oven to 400°F (200°C).",
            "Place salmon on a baking sheet lined with foil.",
            "Drizzle with olive oil and lemon juice.",
            "Season with salt, pepper, and minced garlic.",
            "Arrange baby potatoes and vegetables around salmon.",
            "Dot with butter and fresh herbs.",
            "Bake for 20-25 minutes until salmon flakes easily.",
            "Check vegetables are tender.",
            "Serve immediately with lemon wedges.",
            "Garnish with fresh herbs."
        ]
    }
}
};

// Meal suggestion functionality
async function suggestMeals() {
    const savedIngredients = JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
    
    if (savedIngredients.length === 0) {
        showNoIngredientsMessage();
        return;
    }
    
    // Show loading message
    const suggestionsContainer = document.getElementById('mealSuggestions');
    suggestionsContainer.innerHTML = `
        <div class="loading-message">
            <h3>Finding recipes for you...</h3>
            <p>Searching through thousands of recipes with matching images!</p>
        </div>
    `;
    
    try {
        // Search for recipes using Spoonacular API
        const spoonacularRecipes = await searchRecipesByIngredients(savedIngredients, '', '', 10);
        
        if (spoonacularRecipes.length === 0) {
            // Fallback to static database if API fails
            const suggestedMeals = findMatchingMeals(savedIngredients);
            displaySuggestedMeals(suggestedMeals);
            return;
        }
        
        // Convert Spoonacular recipes to our format
        const suggestedMeals = spoonacularRecipes.map(convertSpoonacularRecipe);
        
        // Calculate match percentages
        suggestedMeals.forEach(meal => {
            const availableCount = meal.ingredients.length;
            const totalCount = availableCount + meal.missingIngredients.length;
            meal.matchPercentage = Math.round((availableCount / totalCount) * 100);
        });
        
        // Sort by match percentage
        suggestedMeals.sort((a, b) => b.matchPercentage - a.matchPercentage);
        
        displaySuggestedMeals(suggestedMeals);
        
    } catch (error) {
        console.error('Error fetching recipes from API:', error);
        
        // Fallback to static database
        const suggestedMeals = findMatchingMeals(savedIngredients);
        displaySuggestedMeals(suggestedMeals);
        
        // Show error message
        showErrorMessage('Unable to fetch fresh recipes. Showing local recipes instead.');
    }
}

// Helper function to handle ingredient name variations for dominant matching
function getIngredientVariations(ingredient) {
    const variations = [ingredient.toLowerCase()];
    
    // Add common variations
    const variationMap = {
        'beef': ['beef', 'steak'],
        'chicken': ['chicken', 'poultry'],
        'fish': ['fish', 'salmon', 'tuna', 'cod'],
        'shrimp': ['shrimp', 'prawns'],
        'pasta': ['pasta', 'spaghetti', 'penne', 'linguine', 'fettuccine'],
        'rice': ['rice', 'risotto', 'pilaf'],
        'potatoes': ['potato', 'potatoes'],
        'tomatoes': ['tomato', 'tomatoes'],
        'mushrooms': ['mushroom', 'mushrooms'],
        'onions': ['onion', 'onions'],
        'bell-peppers': ['pepper', 'peppers'],
        'noodles': ['noodle', 'noodles', 'ramen', 'udon'],
        'bread': ['bread', 'toast', 'sandwich'],
        'eggs': ['egg', 'eggs', 'omelette', 'frittata']
    };
    
    if (variationMap[ingredient]) {
        return variationMap[ingredient];
    }
    
    return variations;
}

function findMatchingMeals(availableIngredients) {
    const suggestions = [];
    
    // MAIN INGREDIENT CATEGORIES - recipes only shown if user has at least one from these categories
    const MAIN_INGREDIENT_CATEGORIES = {
        // Proteins
        proteins: ['chicken', 'beef', 'pork', 'fish', 'shrimp', 'salmon', 'bacon', 'tofu', 'veal', 'paneer'],
        
        // Carbs & Grains
        carbs: ['rice', 'pasta', 'bread', 'noodles', 'tortillas', 'flour', 'quinoa', 'oats', 'barley', 'couscous', 'wonton-wrappers', 'hominy', 'lentils'],
        
        // Vegetables
        vegetables: ['potatoes', 'tomatoes', 'onions', 'garlic', 'carrots', 'bell-peppers', 'mushrooms', 'spinach', 'broccoli', 'lettuce', 'avocado', 'vegetables', 'eggplant', 'beets', 'cabbage']
    
    // FISH RECIPES (15 more to reach 20 total)
    "fish-stew": {
        name: "Fish Stew",
        ingredients: [
            { name: "fish", quantity: "700g mixed fish" },
            { name: "tomatoes", quantity: "400g" },
            { name: "onions", quantity: "2 medium" },
            { name: "garlic", quantity: "4 cloves" },
            { name: "herbs", quantity: "bay leaves" },
            { name: "wine", quantity: "200ml white" },
            { name: "potatoes", quantity: "400g" },
            { name: "olive-oil", quantity: "4 tbsp" }
        ],
        difficulty: "Medium",
        time: "45 min",
        cuisine: "Mediterranean",
        description: "Hearty Mediterranean fish stew",
        image: "https://images.unsplash.com/photo-1544943910-4c1dc44aab44?w=400&h=300&fit=crop&crop=center",
        instructions: [
            "Heat olive oil in a large pot over medium heat.",
            "Add diced onions and cook until softened.",
            "Add minced garlic and cook for 1 minute.",
            "Add chopped tomatoes and herbs.",
            "Pour in white wine and simmer for 5 minutes.",
            "Add diced potatoes and enough water to cover.",
            "Simmer for 15 minutes until potatoes are tender.",
            "Add fish pieces and cook for 8-10 minutes.",
            "Season with salt and pepper.",
            "Serve hot with crusty bread."
        ]
    },
    "fish-soup": {
        name: "Fish Soup",
        ingredients: [
            { name: "fish", quantity: "500g fish fillets" },
            { name: "vegetables", quantity: "300g mixed" },
            { name: "onions", quantity: "1 large" },
            { name: "garlic", quantity: "3 cloves" },
            { name: "herbs", quantity: "bay leaves" },
            { name: "wine", quantity: "150ml white" },
            { name: "tomatoes", quantity: "200g" },
            { name: "olive-oil", quantity: "3 tbsp" }
        ],
        difficulty: "Medium",
        time: "40 min",
        cuisine: "French",
        description: "Clear fish soup with vegetables",
        image: "https://images.unsplash.com/photo-1547592166-23ac45744acd?w=400&h=300&fit=crop&crop=center",
        instructions: [
            "Heat olive oil in a large pot over medium heat.",
            "Sauté diced onions until translucent.",
            "Add garlic and cook for 1 minute.",
            "Add tomatoes and cook until soft.",
            "Add fish stock and white wine.",
            "Add mixed vegetables and simmer for 15 minutes.",
            "Add fish fillets and cook for 8 minutes.",
            "Season with salt, pepper, and herbs.",
            "Serve hot with fresh herbs.",
            "Accompany with crusty bread."
        ]
    },
    "fish-pasta": {
        name: "Fish Pasta",
        ingredients: [
            { name: "fish", quantity: "500g white fish" },
            { name: "pasta", quantity: "400g linguine" },
            { name: "tomatoes", quantity: "300g cherry" },
            { name: "garlic", quantity: "4 cloves" },
            { name: "herbs", quantity: "basil & parsley" },
            { name: "wine", quantity: "150ml white" },
            { name: "olive-oil", quantity: "4 tbsp" },
            { name: "lemon", quantity: "1 piece" }
        ],
        difficulty: "Easy",
        time: "25 min",
        cuisine: "Italian",
        description: "Light pasta with flaked fish and herbs",
        image: "https://images.unsplash.com/photo-1621996346565-e3dbc353d2e5?w=400&h=300&fit=crop&crop=center",
        instructions: [
            "Cook pasta according to package directions.",
            "Heat olive oil in a large pan.",
            "Add minced garlic and cook for 1 minute.",
            "Add cherry tomatoes and cook until soft.",
            "Add white wine and simmer for 3 minutes.",
            "Add fish pieces and cook until flaky.",
            "Drain pasta and add to the pan.",
            "Toss with lemon juice and fresh herbs.",
            "Season with salt and pepper.",
            "Serve immediately with grated cheese."
        ]
    },
    "fish-grilled": {
        name: "Grilled Fish",
        ingredients: [
            { name: "fish", quantity: "600g whole fish" },
            { name: "lemon", quantity: "2 pieces" },
            { name: "garlic", quantity: "3 cloves" },
            { name: "herbs", quantity: "rosemary & thyme" },
            { name: "olive-oil", quantity: "4 tbsp" },
            { name: "vegetables", quantity: "grilled" },
            { name: "butter", quantity: "50g" },
            { name: "wine", quantity: "100ml white" }
        ],
        difficulty: "Medium",
        time: "30 min",
        cuisine: "Mediterranean",
        description: "Whole grilled fish with herbs and lemon",
        image: "https://images.unsplash.com/photo-1544943910-4c1dc44aab44?w=400&h=300&fit=crop&crop=center",
        instructions: [
            "Preheat grill to medium-high heat.",
            "Clean and score fish on both sides.",
            "Stuff cavity with lemon slices and herbs.",
            "Brush with olive oil and minced garlic.",
            "Season with salt and pepper.",
            "Grill for 6-8 minutes per side.",
            "Baste with wine and butter mixture.",
            "Check fish is cooked through.",
            "Serve with grilled vegetables.",
            "Garnish with fresh herbs and lemon."
        ]
    },

    // PORK RECIPES (16 more to reach 20 total)
    "pork-ribs": {
        name: "Pork Ribs",
        ingredients: [
            { name: "pork", quantity: "1.5kg ribs" },
            { name: "bbq-sauce", quantity: "300ml" },
            { name: "garlic", quantity: "4 cloves" },
            { name: "onions", quantity: "1 large" },
            { name: "herbs", quantity: "paprika & thyme" },
            { name: "honey", quantity: "3 tbsp" },
            { name: "vinegar", quantity: "2 tbsp" },
            { name: "brown-sugar", quantity: "3 tbsp" }
        ],
        difficulty: "Medium",
        time: "120 min",
        cuisine: "American",
        description: "Slow-cooked BBQ pork ribs",
        image: "https://images.unsplash.com/photo-1529692236671-f1f6cf9683ba?w=400&h=300&fit=crop&crop=center",
        instructions: [
            "Preheat oven to 300°F (150°C).",
            "Season ribs with salt, pepper, and paprika.",
            "Wrap ribs in foil and bake for 2 hours.",
            "Meanwhile, make BBQ sauce with remaining ingredients.",
            "Remove ribs from foil and brush with sauce.",
            "Increase oven to 425°F (220°C).",
            "Bake uncovered for 15 minutes until caramelized.",
            "Brush with more sauce halfway through.",
            "Rest for 5 minutes before cutting.",
            "Serve with extra BBQ sauce and coleslaw."
        ]
    },
    "pork-carnitas": {
        name: "Pork Carnitas",
        ingredients: [
            { name: "pork", quantity: "1.2kg shoulder" },
            { name: "onions", quantity: "2 medium" },
            { name: "garlic", quantity: "6 cloves" },
            { name: "lime", quantity: "3 pieces" },
            { name: "orange", quantity: "2 pieces" },
            { name: "cumin", quantity: "2 tsp" },
            { name: "chili", quantity: "2 jalapeños" },
            { name: "tortillas", quantity: "for serving" }
        ],
        difficulty: "Easy",
        time: "180 min",
        cuisine: "Mexican",
        description: "Slow-cooked Mexican pulled pork",
        image: "https://images.unsplash.com/photo-1529692236671-f1f6cf9683ba?w=400&h=300&fit=crop&crop=center",
        instructions: [
            "Cut pork shoulder into large chunks.",
            "Season with salt, pepper, and cumin.",
            "Place in slow cooker with onions and garlic.",
            "Add orange juice, lime juice, and jalapeños.",
            "Cook on low for 6-8 hours until tender.",
            "Remove pork and shred with two forks.",
            "Strain cooking liquid and reduce in a pan.",
            "Mix shredded pork with reduced liquid.",
            "Serve in warm tortillas with toppings.",
            "Garnish with cilantro and lime."
        ]
    },
    "pork-schnitzel": {
        name: "Pork Schnitzel",
        ingredients: [
            { name: "pork", quantity: "4 cutlets" },
            { name: "flour", quantity: "100g" },
            { name: "eggs", quantity: "2 large" },
            { name: "breadcrumbs", quantity: "200g" },
            { name: "butter", quantity: "100g" },
            { name: "lemon", quantity: "2 pieces" },
            { name: "parsley", quantity: "fresh" },
            { name: "potatoes", quantity: "600g" }
        ],
        difficulty: "Medium",
        time: "35 min",
        cuisine: "German",
        description: "Breaded and pan-fried pork cutlets",
        image: "https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=400&h=300&fit=crop&crop=center",
        instructions: [
            "Pound pork cutlets to 1/4 inch thickness.",
            "Season cutlets with salt and pepper.",
            "Set up breading station: flour, beaten eggs, breadcrumbs.",
            "Dredge each cutlet in flour, then egg, then breadcrumbs.",
            "Heat butter in large skillet over medium-high heat.",
            "Fry schnitzels for 2-3 minutes per side until golden.",
            "Remove and drain on paper towels.",
            "Serve immediately with lemon wedges.",
            "Garnish with fresh parsley.",
            "Traditionally served with boiled potatoes."
        ]
    },

    // SALMON RECIPES (14 more to reach 20 total)
    "salmon-sushi": {
        name: "Salmon Sushi",
        ingredients: [
            { name: "salmon", quantity: "400g sashimi grade" },
            { name: "rice", quantity: "300g sushi rice" },
            { name: "nori", quantity: "10 sheets" },
            { name: "wasabi", quantity: "2 tbsp" },
            { name: "soy-sauce", quantity: "for serving" },
            { name: "ginger", quantity: "pickled" },
            { name: "cucumber", quantity: "1 piece" },
            { name: "avocado", quantity: "1 piece" }
        ],
        difficulty: "Hard",
        time: "60 min",
        cuisine: "Japanese",
        description: "Fresh salmon sushi rolls and nigiri",
        image: "https://images.unsplash.com/photo-1553621042-f6e147245754?w=400&h=300&fit=crop&crop=center",
        instructions: [
            "Prepare sushi rice according to package directions.",
            "Let rice cool to room temperature.",
            "Cut salmon into sashimi slices and cubes.",
            "Prepare cucumber and avocado strips.",
            "Place nori sheet on bamboo mat.",
            "Spread rice evenly, leaving 1-inch border.",
            "Add salmon and vegetables in a line.",
            "Roll tightly using bamboo mat.",
            "Cut into 8 pieces with sharp knife.",
            "Serve with wasabi, soy sauce, and pickled ginger."
        ]
    },
    "salmon-cakes": {
        name: "Salmon Cakes",
        ingredients: [
            { name: "salmon", quantity: "500g cooked salmon" },
            { name: "breadcrumbs", quantity: "150g" },
            { name: "eggs", quantity: "2 large" },
            { name: "onions", quantity: "1 small" },
            { name: "herbs", quantity: "dill & parsley" },
            { name: "lemon", quantity: "2 pieces" },
            { name: "mayonnaise", quantity: "3 tbsp" },
            { name: "oil", quantity: "for frying" }
        ],
        difficulty: "Easy",
        time: "30 min",
        cuisine: "American",
        description: "Pan-fried salmon cakes with herbs",
        image: "https://images.unsplash.com/photo-1467003909585-2f8a72700288?w=400&h=300&fit=crop&crop=center",
        instructions: [
            "Flake cooked salmon, removing any bones.",
            "Mix salmon with breadcrumbs and beaten eggs.",
            "Add minced onion, herbs, and lemon zest.",
            "Stir in mayonnaise and lemon juice.",
            "Season with salt and pepper.",
            "Form mixture into 8 patties.",
            "Heat oil in a large skillet over medium heat.",
            "Cook patties for 3-4 minutes per side until golden.",
            "Serve hot with tartar sauce.",
            "Garnish with lemon wedges and fresh dill."
        ]
    },
    "salmon-curry": {
        name: "Salmon Curry",
        ingredients: [
            { name: "salmon", quantity: "600g fillets" },
            { name: "coconut-milk", quantity: "400ml" },
            { name: "onions", quantity: "2 medium" },
            { name: "garlic", quantity: "4 cloves" },
            { name: "ginger", quantity: "2 tbsp" },
            { name: "curry-powder", quantity: "2 tbsp" },
            { name: "tomatoes", quantity: "200g" },
            { name: "rice", quantity: "300g" }
        ],
        difficulty: "Medium",
        time: "35 min",
        cuisine: "Indian",
        description: "Rich salmon curry with coconut milk",
        image: "https://images.unsplash.com/photo-1565557623262-b51c2513a641?w=400&h=300&fit=crop&crop=center",
        instructions: [
            "Cut salmon into large chunks.",
            "Heat oil in a large pan over medium heat.",
            "Add diced onions and cook until golden.",
            "Add ginger-garlic paste and curry powder.",
            "Cook for 2 minutes until fragrant.",
            "Add chopped tomatoes and cook until soft.",
            "Pour in coconut milk and bring to simmer.",
            "Gently add salmon pieces.",
            "Cook for 10-12 minutes until salmon is done.",
            "Serve hot over basmati rice."
        ]
    }

    // MORE FISH RECIPES (continuing to 20 total)
    "fish-teriyaki": {
        name: "Fish Teriyaki",
        ingredients: [
            { name: "fish", quantity: "600g firm fish" },
            { name: "soy-sauce", quantity: "4 tbsp" },
            { name: "mirin", quantity: "3 tbsp" },
            { name: "honey", quantity: "2 tbsp" },
            { name: "ginger", quantity: "1 tbsp" },
            { name: "garlic", quantity: "2 cloves" },
            { name: "rice", quantity: "300g" },
            { name: "sesame-seeds", quantity: "1 tbsp" }
        ],
        difficulty: "Easy",
        time: "25 min",
        cuisine: "Japanese",
        description: "Sweet and savory glazed fish",
        image: "https://images.unsplash.com/photo-1544943910-4c1dc44aab44?w=400&h=300&fit=crop&crop=center",
        instructions: [
            "Cut fish into serving portions.",
            "Mix soy sauce, mirin, and honey for teriyaki sauce.",
            "Heat oil in a large skillet over medium-high heat.",
            "Cook fish for 3-4 minutes per side.",
            "Add minced ginger and garlic, cook for 1 minute.",
            "Pour teriyaki sauce over fish.",
            "Simmer until sauce thickens and glazes fish.",
            "Cook until fish is cooked through.",
            "Sprinkle with sesame seeds.",
            "Serve over steamed rice."
        ]
    },
    "fish-chowder": {
        name: "Fish Chowder",
        ingredients: [
            { name: "fish", quantity: "500g white fish" },
            { name: "potatoes", quantity: "400g diced" },
            { name: "onions", quantity: "1 large" },
            { name: "celery", quantity: "2 stalks" },
            { name: "milk", quantity: "500ml" },
            { name: "butter", quantity: "50g" },
            { name: "flour", quantity: "3 tbsp" },
            { name: "herbs", quantity: "thyme & bay" }
        ],
        difficulty: "Medium",
        time: "40 min",
        cuisine: "American",
        description: "Creamy fish chowder with potatoes",
        image: "https://images.unsplash.com/photo-1547592166-23ac45744acd?w=400&h=300&fit=crop&crop=center",
        instructions: [
            "Cut fish into bite-sized pieces.",
            "Cook diced potatoes in salted water until tender.",
            "In a large pot, melt butter over medium heat.",
            "Sauté diced onions and celery until soft.",
            "Sprinkle flour over vegetables and cook for 2 minutes.",
            "Gradually add milk, stirring constantly.",
            "Add cooked potatoes and herbs.",
            "Simmer for 10 minutes until thickened.",
            "Add fish pieces and cook for 5 minutes.",
            "Season and serve hot with crackers."
        ]
    },
    "fish-sandwich": {
        name: "Fish Sandwich",
        ingredients: [
            { name: "fish", quantity: "4 fillets" },
            { name: "bread", quantity: "8 slices" },
            { name: "lettuce", quantity: "4 leaves" },
            { name: "tomatoes", quantity: "2 medium" },
            { name: "mayonnaise", quantity: "4 tbsp" },
            { name: "lemon", quantity: "1 piece" },
            { name: "herbs", quantity: "tartar sauce" },
            { name: "oil", quantity: "for frying" }
        ],
        difficulty: "Easy",
        time: "20 min",
        cuisine: "American",
        description: "Crispy fish sandwich with fresh toppings",
        image: "https://images.unsplash.com/photo-1544943910-4c1dc44aab44?w=400&h=300&fit=crop&crop=center",
        instructions: [
            "Season fish fillets with salt and pepper.",
            "Heat oil in a large skillet over medium-high heat.",
            "Cook fish for 3-4 minutes per side until golden.",
            "Toast bread slices until lightly golden.",
            "Spread mayonnaise on one side of each bread slice.",
            "Layer lettuce, tomato, and cooked fish.",
            "Add tartar sauce and lemon juice.",
            "Top with second bread slice.",
            "Cut in half and serve immediately.",
            "Serve with pickles and chips."
        ]
    },

    // MORE PORK RECIPES (continuing to 20 total)
    "pork-stir-fry": {
        name: "Pork Stir Fry",
        ingredients: [
            { name: "pork", quantity: "500g strips" },
            { name: "vegetables", quantity: "400g mixed" },
            { name: "soy-sauce", quantity: "3 tbsp" },
            { name: "garlic", quantity: "3 cloves" },
            { name: "ginger", quantity: "1 tbsp" },
            { name: "rice", quantity: "300g" },
            { name: "sesame-oil", quantity: "2 tbsp" },
            { name: "onions", quantity: "1 medium" }
        ],
        difficulty: "Easy",
        time: "20 min",
        cuisine: "Asian",
        description: "Quick pork stir fry with vegetables",
        image: "https://images.unsplash.com/photo-1529692236671-f1f6cf9683ba?w=400&h=300&fit=crop&crop=center",
        instructions: [
            "Cut pork into thin strips and season.",
            "Heat oil in a large wok over high heat.",
            "Add pork and stir-fry for 2-3 minutes.",
            "Remove pork and set aside.",
            "Add vegetables to wok and stir-fry for 3 minutes.",
            "Add garlic and ginger, cook for 1 minute.",
            "Return pork to wok.",
            "Add soy sauce and sesame oil.",
            "Toss everything together for 2 minutes.",
            "Serve immediately over steamed rice."
        ]
    },
    "pork-curry": {
        name: "Pork Curry",
        ingredients: [
            { name: "pork", quantity: "600g cubes" },
            { name: "coconut-milk", quantity: "400ml" },
            { name: "onions", quantity: "2 medium" },
            { name: "garlic", quantity: "4 cloves" },
            { name: "ginger", quantity: "2 tbsp" },
            { name: "curry-powder", quantity: "2 tbsp" },
            { name: "tomatoes", quantity: "300g" },
            { name: "rice", quantity: "300g" }
        ],
        difficulty: "Medium",
        time: "50 min",
        cuisine: "Indian",
        description: "Spicy pork curry with coconut milk",
        image: "https://images.unsplash.com/photo-1565557623262-b51c2513a641?w=400&h=300&fit=crop&crop=center",
        instructions: [
            "Cut pork into bite-sized cubes.",
            "Heat oil in a large pot over medium-high heat.",
            "Brown pork cubes on all sides.",
            "Remove pork and set aside.",
            "Add diced onions and cook until golden.",
            "Add ginger-garlic paste and curry powder.",
            "Cook for 2 minutes until fragrant.",
            "Add tomatoes and cook until soft.",
            "Return pork to pot with coconut milk.",
            "Simmer for 30 minutes until tender."
        ]
    },

    // MORE SALMON RECIPES (continuing to 20 total)
    "salmon-pasta": {
        name: "Salmon Pasta",
        ingredients: [
            { name: "salmon", quantity: "500g fillets" },
            { name: "pasta", quantity: "400g penne" },
            { name: "cream", quantity: "200ml" },
            { name: "garlic", quantity: "3 cloves" },
            { name: "herbs", quantity: "dill & parsley" },
            { name: "lemon", quantity: "1 piece" },
            { name: "onions", quantity: "1 small" },
            { name: "olive-oil", quantity: "3 tbsp" }
        ],
        difficulty: "Easy",
        time: "25 min",
        cuisine: "Italian",
        description: "Creamy pasta with flaked salmon",
        image: "https://images.unsplash.com/photo-1621996346565-e3dbc353d2e5?w=400&h=300&fit=crop&crop=center",
        instructions: [
            "Cook pasta according to package directions.",
            "Season salmon with salt and pepper.",
            "Heat olive oil in a large pan.",
            "Cook salmon for 4 minutes per side.",
            "Remove salmon and flake into chunks.",
            "Add minced garlic and onion to same pan.",
            "Cook for 2 minutes until fragrant.",
            "Add cream and bring to simmer.",
            "Add drained pasta and flaked salmon.",
            "Toss with herbs and lemon juice."
        ]
    },
    "salmon-salad": {
        name: "Salmon Salad",
        ingredients: [
            { name: "salmon", quantity: "400g cooked" },
            { name: "lettuce", quantity: "300g mixed greens" },
            { name: "avocado", quantity: "2 pieces" },
            { name: "tomatoes", quantity: "200g cherry" },
            { name: "cucumber", quantity: "1 large" },
            { name: "lemon", quantity: "2 pieces" },
            { name: "olive-oil", quantity: "4 tbsp" },
            { name: "herbs", quantity: "dill & mint" }
        ],
        difficulty: "Easy",
        time: "15 min",
        cuisine: "Mediterranean",
        description: "Fresh salmon salad with avocado and herbs",
        image: "https://images.unsplash.com/photo-1467003909585-2f8a72700288?w=400&h=300&fit=crop&crop=center",
        instructions: [
            "Flake cooked salmon into bite-sized pieces.",
            "Wash and prepare mixed greens.",
            "Slice avocado, tomatoes, and cucumber.",
            "Arrange greens on serving plates.",
            "Top with salmon, avocado, and vegetables.",
            "Make dressing with lemon juice and olive oil.",
            "Add minced herbs to dressing.",
            "Season dressing with salt and pepper.",
            "Drizzle dressing over salad.",
            "Serve immediately while fresh."
        ]
    }

    // MORE FISH RECIPES (9 more to reach 20)
    "fish-ceviche": {
        name: "Fish Ceviche",
        ingredients: [
            { name: "fish", quantity: "500g white fish" },
            { name: "lime", quantity: "8 pieces" },
            { name: "onions", quantity: "1 red onion" },
            { name: "tomatoes", quantity: "2 medium" },
            { name: "cilantro", quantity: "1 bunch" },
            { name: "chili", quantity: "2 jalapeños" },
            { name: "avocado", quantity: "2 pieces" },
            { name: "olive-oil", quantity: "2 tbsp" }
        ],
        difficulty: "Easy",
        time: "30 min",
        cuisine: "Peruvian",
        description: "Fresh fish cured in lime juice",
        image: "https://images.unsplash.com/photo-1565299507177-b0ac66763828?w=400&h=300&fit=crop&crop=center",
        instructions: [
            "Cut fish into small cubes.",
            "Place fish in glass bowl.",
            "Cover with fresh lime juice.",
            "Let cure for 15-20 minutes until opaque.",
            "Dice red onion, tomatoes, and jalapeños.",
            "Drain excess lime juice from fish.",
            "Mix fish with diced vegetables.",
            "Add chopped cilantro and olive oil.",
            "Season with salt and pepper.",
            "Serve with sliced avocado and tortilla chips."
        ]
    },
    "fish-paella": {
        name: "Fish Paella",
        ingredients: [
            { name: "fish", quantity: "400g mixed seafood" },
            { name: "rice", quantity: "300g bomba rice" },
            { name: "saffron", quantity: "pinch" },
            { name: "garlic", quantity: "4 cloves" },
            { name: "tomatoes", quantity: "2 medium" },
            { name: "onions", quantity: "1 medium" },
            { name: "olive-oil", quantity: "4 tbsp" },
            { name: "fish-stock", quantity: "600ml" }
        ],
        difficulty: "Hard",
        time: "45 min",
        cuisine: "Spanish",
        description: "Traditional Spanish seafood paella",
        image: "https://images.unsplash.com/photo-1534080564583-6be75777b70a?w=400&h=300&fit=crop&crop=center",
        instructions: [
            "Heat olive oil in a large paella pan.",
            "Sauté diced onions until translucent.",
            "Add minced garlic and grated tomatoes.",
            "Cook until tomatoes reduce and darken.",
            "Add rice and stir to coat with sofrito.",
            "Add hot fish stock infused with saffron.",
            "Simmer without stirring for 10 minutes.",
            "Add fish pieces and cook for 8 minutes.",
            "Let rest for 5 minutes before serving.",
            "Garnish with lemon wedges and parsley."
        ]
    },

    // SHRIMP RECIPES (12 more to reach 20 total)
    "shrimp-scampi": {
        name: "Shrimp Scampi",
        ingredients: [
            { name: "shrimp", quantity: "600g large" },
            { name: "pasta", quantity: "400g linguine" },
            { name: "garlic", quantity: "6 cloves" },
            { name: "butter", quantity: "100g" },
            { name: "wine", quantity: "150ml white" },
            { name: "lemon", quantity: "2 pieces" },
            { name: "herbs", quantity: "parsley" },
            { name: "olive-oil", quantity: "3 tbsp" }
        ],
        difficulty: "Easy",
        time: "20 min",
        cuisine: "Italian",
        description: "Garlic butter shrimp with pasta",
        image: "https://images.unsplash.com/photo-1633504581786-316c8002b1b5?w=400&h=300&fit=crop&crop=center",
        instructions: [
            "Cook pasta according to package directions.",
            "Peel and devein shrimp, season with salt and pepper.",
            "Heat olive oil and butter in large skillet.",
            "Add minced garlic and cook for 1 minute.",
            "Add shrimp and cook for 2 minutes per side.",
            "Add white wine and lemon juice.",
            "Simmer for 2 minutes until shrimp are pink.",
            "Add drained pasta and toss to combine.",
            "Add fresh parsley and toss again.",
            "Serve immediately with lemon wedges."
        ]
    },
    "shrimp-curry": {
        name: "Shrimp Curry",
        ingredients: [
            { name: "shrimp", quantity: "600g large" },
            { name: "coconut-milk", quantity: "400ml" },
            { name: "onions", quantity: "2 medium" },
            { name: "garlic", quantity: "4 cloves" },
            { name: "ginger", quantity: "2 tbsp" },
            { name: "curry-powder", quantity: "2 tbsp" },
            { name: "tomatoes", quantity: "200g" },
            { name: "rice", quantity: "300g" }
        ],
        difficulty: "Medium",
        time: "30 min",
        cuisine: "Indian",
        description: "Spicy shrimp curry with coconut milk",
        image: "https://images.unsplash.com/photo-1565557623262-b51c2513a641?w=400&h=300&fit=crop&crop=center",
        instructions: [
            "Peel and devein shrimp, season with salt.",
            "Heat oil in a large pan over medium heat.",
            "Add diced onions and cook until golden.",
            "Add ginger-garlic paste and curry powder.",
            "Cook for 2 minutes until fragrant.",
            "Add chopped tomatoes and cook until soft.",
            "Pour in coconut milk and bring to simmer.",
            "Add shrimp and cook for 5-6 minutes.",
            "Season with salt and garnish with cilantro.",
            "Serve hot over basmati rice."
        ]
    },

    // TOFU RECIPES (15 more to reach 20 total)
    "tofu-stir-fry": {
        name: "Tofu Stir Fry",
        ingredients: [
            { name: "tofu", quantity: "400g firm" },
            { name: "vegetables", quantity: "400g mixed" },
            { name: "soy-sauce", quantity: "3 tbsp" },
            { name: "garlic", quantity: "3 cloves" },
            { name: "ginger", quantity: "1 tbsp" },
            { name: "rice", quantity: "300g" },
            { name: "sesame-oil", quantity: "2 tbsp" },
            { name: "onions", quantity: "1 medium" }
        ],
        difficulty: "Easy",
        time: "25 min",
        cuisine: "Asian",
        description: "Crispy tofu with fresh vegetables",
        image: "https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=400&h=300&fit=crop&crop=center",
        instructions: [
            "Press tofu to remove excess water.",
            "Cut tofu into cubes and season.",
            "Heat oil in a large wok over high heat.",
            "Add tofu and stir-fry until golden.",
            "Remove tofu and set aside.",
            "Add vegetables to wok and stir-fry for 3 minutes.",
            "Add garlic and ginger, cook for 1 minute.",
            "Return tofu to wok.",
            "Add soy sauce and sesame oil.",
            "Serve immediately over steamed rice."
        ]
    },
    "tofu-curry": {
        name: "Tofu Curry",
        ingredients: [
            { name: "tofu", quantity: "400g firm" },
            { name: "coconut-milk", quantity: "400ml" },
            { name: "onions", quantity: "2 medium" },
            { name: "garlic", quantity: "4 cloves" },
            { name: "ginger", quantity: "2 tbsp" },
            { name: "curry-powder", quantity: "2 tbsp" },
            { name: "tomatoes", quantity: "300g" },
            { name: "rice", quantity: "300g" }
        ],
        difficulty: "Medium",
        time: "35 min",
        cuisine: "Indian",
        description: "Creamy tofu curry with aromatic spices",
        image: "https://images.unsplash.com/photo-1565557623262-b51c2513a641?w=400&h=300&fit=crop&crop=center",
        instructions: [
            "Press and cube tofu, then pan-fry until golden.",
            "Heat oil in a large pot over medium heat.",
            "Add diced onions and cook until golden.",
            "Add ginger-garlic paste and curry powder.",
            "Cook for 2 minutes until fragrant.",
            "Add chopped tomatoes and cook until soft.",
            "Pour in coconut milk and bring to simmer.",
            "Add fried tofu cubes.",
            "Simmer for 15 minutes until flavors meld.",
            "Serve hot over basmati rice."
        ]
    },

    // BACON RECIPES (12 more to reach 20 total)
    "bacon-carbonara": {
        name: "Bacon Carbonara",
        ingredients: [
            { name: "bacon", quantity: "200g" },
            { name: "pasta", quantity: "400g spaghetti" },
            { name: "eggs", quantity: "4 large" },
            { name: "cheese", quantity: "150g pecorino" },
            { name: "garlic", quantity: "2 cloves" },
            { name: "black-pepper", quantity: "freshly ground" },
            { name: "olive-oil", quantity: "2 tbsp" },
            { name: "parsley", quantity: "fresh" }
        ],
        difficulty: "Medium",
        time: "20 min",
        cuisine: "Italian",
        description: "Classic Roman pasta with bacon and eggs",
        image: "https://images.unsplash.com/photo-1621996346565-e3dbc353d2e5?w=400&h=300&fit=crop&crop=center",
        instructions: [
            "Cook pasta in salted boiling water until al dente.",
            "Cut bacon into small pieces and cook until crispy.",
            "Remove bacon, leaving fat in pan.",
            "Add minced garlic to bacon fat.",
            "Whisk eggs with grated cheese and black pepper.",
            "Drain pasta, reserving 1 cup pasta water.",
            "Add hot pasta to pan with bacon fat.",
            "Remove from heat and quickly add egg mixture.",
            "Toss rapidly, adding pasta water as needed.",
            "Serve immediately with extra cheese and bacon."
        ]
    },
    "bacon-quiche": {
        name: "Bacon Quiche",
        ingredients: [
            { name: "bacon", quantity: "200g" },
            { name: "eggs", quantity: "6 large" },
            { name: "milk", quantity: "300ml" },
            { name: "cheese", quantity: "150g gruyere" },
            { name: "onions", quantity: "1 medium" },
            { name: "pie-crust", quantity: "1 prepared" },
            { name: "herbs", quantity: "chives" },
            { name: "butter", quantity: "25g" }
        ],
        difficulty: "Medium",
        time: "60 min",
        cuisine: "French",
        description: "Rich bacon and cheese quiche",
        image: "https://images.unsplash.com/photo-1574894709920-11b28e7367e3?w=400&h=300&fit=crop&crop=center",
        instructions: [
            "Preheat oven to 375°F (190°C).",
            "Cook bacon until crispy, then chop.",
            "Sauté diced onions in bacon fat until soft.",
            "Line pie dish with prepared crust.",
            "Sprinkle bacon, onions, and cheese in crust.",
            "Whisk eggs with milk and season.",
            "Pour egg mixture over bacon and cheese.",
            "Sprinkle with fresh chives.",
            "Bake for 35-40 minutes until set.",
            "Cool for 10 minutes before slicing."
        ]
    }
};
    
    // Flatten all main ingredients into one array
    const allMainIngredients = [
        ...MAIN_INGREDIENT_CATEGORIES.proteins,
        ...MAIN_INGREDIENT_CATEGORIES.carbs,
        ...MAIN_INGREDIENT_CATEGORIES.vegetables
    ];
    
    Object.keys(RECIPE_DATABASE).forEach(recipeId => {
        const recipe = RECIPE_DATABASE[recipeId];
        
        // Extract ingredient names from the new object structure
        const recipeIngredientNames = recipe.ingredients.map(ingredient => {
            if (typeof ingredient === 'object' && ingredient.name) {
                return ingredient.name;
            }
            return ingredient; // fallback for old string format
        });
        
        // DOMINANT INGREDIENT PRIORITY SYSTEM
        // Check if recipe contains any main ingredients (proteins, carbs, or vegetables)
        const recipeMainIngredients = recipeIngredientNames.filter(ingredient => 
            allMainIngredients.includes(ingredient)
        );
        
        // Find which main ingredients the user has that match this recipe
        const userMainIngredients = recipeMainIngredients.filter(ingredient => 
            availableIngredients.includes(ingredient)
        );
        
        // Only proceed if user has at least one main ingredient from this recipe
        if (userMainIngredients.length === 0) {
            return; // Skip this recipe - user doesn't have any main ingredients needed
        }
        
        // NEW: DOMINANT INGREDIENT MATCHING
        // Prioritize recipes where the user's selected ingredient is the PRIMARY ingredient
        // The first ingredient in a recipe is typically the main/dominant ingredient
        const recipePrimaryIngredient = recipeIngredientNames[0]; // First ingredient = primary
        const userHasPrimaryIngredient = availableIngredients.includes(recipePrimaryIngredient);
        
        // EXPANDED: Check if user has ANY main ingredient that matches recipe name/ID (not just proteins)
        let isDominantMatch = userHasPrimaryIngredient;
        
        if (!isDominantMatch) {
            // Check if recipe name or ID contains ANY of the user's main ingredients
            const userMainIngredientsAll = availableIngredients.filter(ingredient => 
                allMainIngredients.includes(ingredient)
            );
            
            isDominantMatch = userMainIngredientsAll.some(ingredient => {
                const recipeName = recipe.name.toLowerCase();
                const recipeKey = recipeId.toLowerCase();
                const ingredientName = ingredient.toLowerCase();
                
                // Direct name matching
                if (recipeName.includes(ingredientName) || recipeKey.includes(ingredientName)) {
                    return true;
                }
                
                // Handle special cases and variations
                const ingredientVariations = getIngredientVariations(ingredient);
                return ingredientVariations.some(variation => 
                    recipeName.includes(variation) || recipeKey.includes(variation)
                );
            });
        }
        
        
        // Calculate overall ingredient matching
        const matchingIngredients = recipeIngredientNames.filter(ingredientName => 
            availableIngredients.includes(ingredientName)
        );
        
        let matchPercentage = (matchingIngredients.length / recipeIngredientNames.length) * 100;
        
        // BOOST score for dominant ingredient matches
        if (isDominantMatch) {
            matchPercentage += 15; // Give 15% bonus for dominant ingredient match
        }
        
        // Suggest if at least 50% of ingredients match AND user has main ingredient
        if (matchPercentage >= 50) {
            suggestions.push({
                id: recipeId,
                ...recipe,
                matchPercentage: Math.round(Math.min(matchPercentage, 100)), // Cap at 100%
                isDominantMatch: isDominantMatch,
                primaryIngredient: recipePrimaryIngredient,
                mainIngredientsAvailable: recipeMainIngredients.filter(ingredient => 
                    availableIngredients.includes(ingredient)
                ),
                missingIngredients: recipeIngredientNames.filter(ingredientName => 
                    !availableIngredients.includes(ingredientName)
                )
            });
        }
    });
    
    // Sort by dominant match first, then by match percentage
    return suggestions.sort((a, b) => {
        // First priority: dominant ingredient matches
        if (a.isDominantMatch && !b.isDominantMatch) return -1;
        if (!a.isDominantMatch && b.isDominantMatch) return 1;
        
        // Second priority: match percentage (highest first)
        return b.matchPercentage - a.matchPercentage;
    });
}

// Global variable to store all meals for pagination
let allSuggestedMeals = [];
let currentlyDisplayedCount = 0;
const INITIAL_DISPLAY_COUNT = 7;

function displaySuggestedMeals(meals) {
    const suggestionsContainer = document.getElementById('mealSuggestions');
    
    if (meals.length === 0) {
        suggestionsContainer.innerHTML = `
            <div class="no-suggestions">
                <h3>No meal suggestions available</h3>
                <p>To get recipe suggestions, you need at least one <strong>main ingredient</strong>:</p>
                <ul style="text-align: left; margin: 10px 0;">
                    <li><strong>Proteins:</strong> Chicken, Beef, Fish, Tofu, etc.</li>
                    <li><strong>Carbs:</strong> Rice, Pasta, Bread, Noodles, etc.</li>
                    <li><strong>Vegetables:</strong> Potatoes, Tomatoes, Onions, etc.</li>
                </ul>
                <p>Plus at least 50% of the recipe's total ingredients!</p>
            </div>
        `;
        return;
    }
    
    // Store all meals for pagination
    allSuggestedMeals = meals;
    currentlyDisplayedCount = 0;
    
    // Display initial set of meals
    displayMealBatch(INITIAL_DISPLAY_COUNT);
}

function displayMealBatch(count) {
    const suggestionsContainer = document.getElementById('mealSuggestions');
    const mealsToShow = allSuggestedMeals.slice(0, currentlyDisplayedCount + count);
    currentlyDisplayedCount = mealsToShow.length;
    
    const mealsHTML = mealsToShow.map(meal => `
        <div class="meal-card" data-meal-id="${meal.id}">
            <div class="meal-content">
                <div class="meal-header">
                    <div class="meal-name-container">
                        ${meal.image ? `<img src="${meal.image}" alt="${meal.name}" class="meal-image" onerror="this.style.display='none'">` : ''}
                        <h3 class="meal-name">${meal.name}</h3>
                    </div>
                    <div class="meal-match">${meal.matchPercentage}% match</div>
                </div>
                <div class="meal-details">
                    <div class="meal-info">
                        <span class="meal-cuisine">${meal.cuisine}</span>
                        <span class="meal-difficulty">${meal.difficulty}</span>
                        <span class="meal-time">${meal.time}</span>
                    </div>
                    <p class="meal-description">${meal.description}</p>
                    <div class="meal-ingredients">
                        <h4>Ingredients needed:</h4>
                        <div class="ingredients-list">
                            ${meal.ingredients.map(ingredient => {
                                // Handle both object and string ingredient formats
                                const ingredientName = typeof ingredient === 'object' && ingredient.name ? ingredient.name : ingredient;
                                const isAvailable = !meal.missingIngredients.includes(ingredientName);
                                return `<span class="ingredient-tag ${isAvailable ? 'available' : 'missing'}">${ingredientName.replace(/-/g, ' ')}</span>`;
                            }).join('')}
                        </div>
                    </div>
                    ${meal.missingIngredients.length > 0 ? `
                        <div class="missing-ingredients">
                            <h4>Missing ingredients:</h4>
                            <p>${meal.missingIngredients.map(ing => ing.replace('-', ' ')).join(', ')}</p>
                        </div>
                    ` : ''}
                </div>
                <div class="meal-actions">
                    <button class="select-meal-btn" onclick="selectMeal('${meal.id}')">Select This Meal</button>
                    <button class="view-details-btn" onclick="viewMealDetails('${meal.id}')">View Details</button>
                </div>
            </div>
        </div>
    `).join('');
    
    // Add "Show More" button if there are more recipes to show
    const showMoreButton = currentlyDisplayedCount < allSuggestedMeals.length ? `
        <div class="show-more-container">
            <button class="show-more-btn" onclick="showMoreRecipes()">
                Show More Recipes (${allSuggestedMeals.length - currentlyDisplayedCount} remaining)
            </button>
        </div>
    ` : '';
    
    suggestionsContainer.innerHTML = `
        <div class="suggestions-header">
            <h3>Top ${currentlyDisplayedCount} Recipe${currentlyDisplayedCount > 1 ? 's' : ''} for You</h3>
            <p>Showing ${currentlyDisplayedCount} of ${allSuggestedMeals.length} matching recipes</p>
        </div>
        ${mealsHTML}
        ${showMoreButton}
    `;
}

// Function to show more recipes
function showMoreRecipes() {
    displayMealBatch(7); // Show 7 more recipes
}

function showNoIngredientsMessage() {
    const suggestionsContainer = document.getElementById('mealSuggestions');
    suggestionsContainer.innerHTML = `
        <div class="no-suggestions">
            <h3>Save your ingredients first!</h3>
            <p>Select the ingredients you have and click "Save My Ingredients" to get meal suggestions.</p>
        </div>
    `;
}

function selectMeal(mealId) {
    console.log('selectMeal called with ID:', mealId);
    let mealName = '';
    
    // Check if it's an API recipe (numeric ID) or static recipe (string ID)
    if (!isNaN(mealId)) {
        console.log('Processing API recipe');
        // API recipe - get name from converted recipe
        // We need to find the meal name from the displayed meals
        const mealCards = document.querySelectorAll('.meal-card');
        console.log('Found meal cards:', mealCards.length);
        for (let card of mealCards) {
            if (card.getAttribute('data-meal-id') === mealId.toString()) {
                const nameElement = card.querySelector('.meal-name');
                if (nameElement) {
                    mealName = nameElement.textContent;
                    console.log('Found meal name from card:', mealName);
                    break;
                }
            }
        }
    } else {
        console.log('Processing static recipe');
        // Static recipe - get name from database
        const meal = RECIPE_DATABASE[mealId];
        if (meal) {
            mealName = meal.name;
            console.log('Found meal name from database:', mealName);
        } else {
            console.log('Recipe not found in database for ID:', mealId);
            showErrorMessage('Recipe not found.');
            return;
        }
    }
    
    if (mealName) {
        // Create Google search URL with recipe name + "recipe"
        const searchQuery = encodeURIComponent(`${mealName} recipe`);
        const googleSearchUrl = `https://www.google.com/search?q=${searchQuery}`;
        console.log('Opening URL:', googleSearchUrl);
        window.open(googleSearchUrl, '_blank');
    } else {
        console.log('No meal name found');
        showErrorMessage('Unable to get recipe name.');
    }
}


async function viewMealDetails(mealId) {
    // Check if it's an API recipe (numeric ID) or static recipe (string ID)
    if (!isNaN(mealId)) {
        // API recipe - fetch full details
        try {
            const recipeDetails = await getRecipeDetails(mealId);
            if (recipeDetails) {
                const convertedRecipe = convertSpoonacularRecipe(recipeDetails);
                showRecipeModal(convertedRecipe);
            } else {
                showErrorMessage('Unable to load recipe details.');
            }
        } catch (error) {
            console.error('Error fetching recipe details:', error);
            showErrorMessage('Unable to load recipe details.');
        }
    } else {
        // Static recipe
        const meal = RECIPE_DATABASE[mealId];
        if (meal) {
            showRecipeModal(meal);
        }
    }
}

function showRecipeModal(meal) {
    // Create modal overlay
    const modalOverlay = document.createElement('div');
    modalOverlay.className = 'recipe-modal-overlay';
    modalOverlay.innerHTML = `
        <div class="recipe-modal">
            <div class="recipe-modal-header">
                <div class="recipe-title-container">
                    ${meal.image ? `<img src="${meal.image}" alt="${meal.name}" class="recipe-image" onerror="this.style.display='none'">` : ''}
                    <h2>${meal.name}</h2>
                </div>
                <button class="close-modal" onclick="closeRecipeModal()">&times;</button>
            </div>
            <div class="recipe-modal-content">
                
                <div class="recipe-info">
                    <div class="recipe-badge ${meal.cuisine.toLowerCase()}">${meal.cuisine}</div>
                    <div class="recipe-badge difficulty-${meal.difficulty.toLowerCase()}">${meal.difficulty}</div>
                    <div class="recipe-badge time">${meal.time}</div>
                </div>
                
                <div class="recipe-description">
                    <p>${meal.description}</p>
                </div>
                
                <div class="recipe-section">
                    <h3>Ingredients</h3>
                    <ul class="ingredients-list">
                        ${meal.ingredients.map(ingredient => {
                            if (typeof ingredient === 'object' && ingredient.name && ingredient.quantity) {
                                return `<li><span class="ingredient-quantity">${ingredient.quantity}</span> <span class="ingredient-name">${ingredient.name.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}</span></li>`;
                            } else {
                                return `<li><span class="ingredient-name">${ingredient.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}</span></li>`;
                            }
                        }).join('')}
                    </ul>
                </div>
                
                <div class="recipe-section">
                    <h3>Instructions</h3>
                    <ol class="instructions-list">
                        ${meal.instructions ? meal.instructions.map(instruction => `<li>${instruction}</li>`).join('') : '<li>No instructions available</li>'}
                    </ol>
                </div>
                
                <div class="recipe-actions">
                    <button class="select-meal-btn" onclick="selectMeal('${meal.id}')">Select This Meal</button>
                    <button class="close-modal-btn" onclick="closeRecipeModal()">Close</button>
                </div>
                </div>
            </div>
        </div>
    `;
    
    document.body.appendChild(modalOverlay);
    document.body.style.overflow = 'hidden'; // Prevent background scrolling
}

function closeRecipeModal() {
    const modal = document.querySelector('.recipe-modal-overlay');
    if (modal) {
        modal.remove();
        document.body.style.overflow = 'auto'; // Restore scrolling
    }
}

// Make utility functions available globally for debugging
window.clearSavedIngredients = clearSavedIngredients;
window.getAllIngredients = getAllIngredients;
window.suggestMeals = suggestMeals;
