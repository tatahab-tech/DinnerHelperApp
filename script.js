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

// Recipe Database - 150 recipes across 5 cuisines (30 each)
// This will be replaced with API calls
const RECIPE_DATABASE = {
    // ITALIAN CUISINE (30 recipes)
    "pasta-carbonara": {
        name: "Pasta Carbonara",
        ingredients: ["pasta", "eggs", "cheese", "bacon", "garlic", "olive-oil"],
        difficulty: "Medium",
        time: "25 min",
        cuisine: "Italian",
        description: "Classic Italian pasta with eggs, cheese, and bacon",
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
        ingredients: ["pasta", "tomatoes", "cheese", "garlic", "olive-oil", "herbs"],
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
        ingredients: ["pasta", "cheese", "butter", "garlic", "milk", "herbs"],
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
        ingredients: ["bread", "cheese", "tomatoes", "vegetables", "olive-oil", "herbs"],
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
        ingredients: ["pasta", "beef", "tomatoes", "onions", "garlic", "olive-oil", "herbs"],
        difficulty: "Medium",
        time: "45 min",
        cuisine: "Italian",
        description: "Rich meat sauce with spaghetti and fresh herbs",
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
        ingredients: ["bread", "cheese", "tomatoes", "olive-oil", "herbs", "garlic"],
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
        ingredients: ["chicken", "cheese", "bread", "tomatoes", "olive-oil", "garlic", "herbs"],
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
        ingredients: ["rice", "mushrooms", "cheese", "onions", "garlic", "olive-oil", "herbs"],
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
        ingredients: ["pasta", "beef", "cheese", "tomatoes", "onions", "garlic", "herbs"],
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
        ingredients: ["pasta", "cheese", "butter", "garlic", "milk", "herbs", "olive-oil"],
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
        ingredients: ["bread", "tomatoes", "garlic", "olive-oil", "herbs", "onions"],
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
        ingredients: ["chicken", "mushrooms", "wine", "butter", "garlic", "olive-oil", "herbs"],
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
        ingredients: ["pasta", "tomatoes", "garlic", "olive-oil", "herbs", "chili", "onions"],
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
        ingredients: ["eggplant", "cheese", "tomatoes", "bread", "olive-oil", "garlic", "herbs"],
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
        ingredients: ["beef", "wine", "tomatoes", "onions", "garlic", "olive-oil", "herbs"],
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
        ingredients: ["potatoes", "flour", "cheese", "tomatoes", "garlic", "olive-oil", "herbs"],
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
        ingredients: ["pasta", "cheese", "pepper", "olive-oil", "butter"],
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
        ingredients: ["chicken", "lemon", "capers", "butter", "garlic", "olive-oil", "herbs"],
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
        ingredients: ["vegetables", "tomatoes", "beans", "pasta", "onions", "garlic", "olive-oil", "herbs"],
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
        ingredients: ["eggs", "cheese", "coffee", "cocoa", "sugar", "ladyfingers"],
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
        ingredients: ["pasta", "tomatoes", "olives", "capers", "garlic", "olive-oil", "herbs"],
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
        ingredients: ["chicken", "prosciutto", "sage", "cheese", "wine", "butter", "olive-oil"],
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
        ingredients: ["rice", "saffron", "cheese", "onions", "butter", "wine", "olive-oil"],
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
        ingredients: ["pasta", "vegetables", "cheese", "garlic", "olive-oil", "herbs", "cream"],
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
        ingredients: ["chicken", "tomatoes", "mushrooms", "onions", "garlic", "olive-oil", "herbs", "wine"],
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
        ingredients: ["pasta", "garlic", "olive-oil", "chili", "herbs", "parsley"],
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
        ingredients: ["chicken", "lemon", "wine", "butter", "garlic", "olive-oil", "herbs", "eggs"],
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
        ingredients: ["pasta", "clams", "garlic", "olive-oil", "white-wine", "herbs", "chili"],
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
        ingredients: ["chicken", "sausage", "peppers", "onions", "garlic", "olive-oil", "herbs", "wine"],
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
        ingredients: ["pasta", "basil", "cheese", "garlic", "olive-oil", "pine-nuts"],
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
        ingredients: ["chicken", "bread", "cheese", "eggs", "olive-oil", "lemon", "arugula"],
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
        ingredients: ["chicken", "rice", "vegetables", "soy-sauce", "garlic", "olive-oil"],
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
        ingredients: ["salmon", "rice", "soy-sauce", "garlic", "ginger", "honey"],
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
        ingredients: ["beef", "rice", "vegetables", "soy-sauce", "garlic", "ginger"],
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
        ingredients: ["chicken", "rice", "eggs", "vegetables", "soy-sauce", "garlic", "ginger", "olive-oil"],
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
        ingredients: ["beef", "broccoli", "rice", "soy-sauce", "garlic", "ginger", "olive-oil"],
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
        ingredients: ["chicken", "noodles", "eggs", "vegetables", "soy-sauce", "garlic", "ginger"],
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
        ingredients: ["vegetables", "rice", "soy-sauce", "garlic", "ginger", "olive-oil", "tofu"],
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
        ingredients: ["chicken", "peanuts", "vegetables", "soy-sauce", "garlic", "ginger", "chili", "rice"],
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
        ingredients: ["beef", "noodles", "vegetables", "soy-sauce", "garlic", "ginger", "olive-oil"],
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
        ingredients: ["chicken", "wonton-wrappers", "vegetables", "soy-sauce", "garlic", "ginger", "sesame-oil"],
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
        ingredients: ["beef", "rice", "soy-sauce", "garlic", "ginger", "honey", "sesame-oil", "vegetables"],
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
        ingredients: ["chicken", "noodles", "eggs", "vegetables", "soy-sauce", "garlic", "lime", "peanuts"],
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
        ingredients: ["vegetables", "rice-paper", "soy-sauce", "garlic", "ginger", "mint", "cilantro"],
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
        ingredients: ["chicken", "rice", "onions", "garlic", "ginger", "yogurt", "spices", "saffron"],
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
        ingredients: ["beef", "noodles", "onions", "garlic", "ginger", "cinnamon", "star-anise", "vegetables"],
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
        ingredients: ["chicken", "rice", "tomatoes", "onions", "garlic", "ginger", "yogurt", "spices", "cream"],
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
        ingredients: ["rice", "vegetables", "coconut-milk", "curry-powder", "onions", "garlic"],
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
        ingredients: ["chicken", "rice", "nori", "vegetables", "soy-sauce", "ginger", "wasabi"],
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
        ingredients: ["beef", "rice", "vegetables", "soy-sauce", "garlic", "ginger", "honey", "olive-oil"],
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
        ingredients: ["chicken", "vegetables", "tofu", "noodles", "soy-sauce", "garlic", "ginger", "mushrooms"],
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
        ingredients: ["beef", "vegetables", "tofu", "noodles", "soy-sauce", "sugar", "mirin", "mushrooms"],
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
        ingredients: ["chicken", "miso-paste", "tofu", "vegetables", "garlic", "ginger", "seaweed"],
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
        ingredients: ["beef", "noodles", "eggs", "vegetables", "soy-sauce", "garlic", "ginger", "miso-paste"],
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
        ingredients: ["chicken", "rice", "vegetables", "soy-sauce", "garlic", "ginger", "chili", "honey"],
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
        ingredients: ["vegetables", "rice", "eggs", "soy-sauce", "garlic", "ginger", "olive-oil", "tofu"],
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
        ingredients: ["chicken", "peanut-butter", "soy-sauce", "garlic", "ginger", "lime", "coconut-milk", "rice"],
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
        ingredients: ["beef", "udon-noodles", "vegetables", "soy-sauce", "garlic", "ginger", "mushrooms", "dashi"],
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
        ingredients: ["chicken", "rice", "vegetables", "eggs", "soy-sauce", "garlic", "sesame-oil", "gochujang"],
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
        ingredients: ["vegetables", "flour", "eggs", "soy-sauce", "ginger", "rice", "tempura-batter"],
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
        ingredients: ["chicken", "rice", "eggs", "vegetables", "soy-sauce", "garlic", "fish-sauce", "lime"],
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
        ingredients: ["beef", "noodles", "vegetables", "soy-sauce", "garlic", "ginger", "oyster-sauce", "olive-oil"],
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
        ingredients: ["chicken", "noodles", "miso-paste", "vegetables", "garlic", "ginger", "eggs", "seaweed"],
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
        ingredients: ["vegetables", "rice", "nori", "soy-sauce", "ginger", "wasabi", "sesame-seeds", "avocado"],
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
        ingredients: ["beef", "tortillas", "cheese", "tomatoes", "lettuce", "onions"],
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
        ingredients: ["chicken", "tortillas", "cheese", "vegetables", "olive-oil", "garlic"],
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
        ingredients: ["tortillas", "beans", "rice", "cheese", "vegetables", "onions", "garlic"],
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
        ingredients: ["beef", "tortillas", "cheese", "tomatoes", "onions", "garlic", "chili"],
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
        ingredients: ["chicken", "tortillas", "vegetables", "onions", "garlic", "olive-oil", "lime"],
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
        ingredients: ["tortilla-chips", "cheese", "beans", "tomatoes", "onions", "jalapenos", "olive-oil"],
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
        ingredients: ["beef", "tortillas", "cheese", "beans", "onions", "garlic", "olive-oil"],
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
        ingredients: ["chicken", "tortillas", "beans", "lettuce", "tomatoes", "cheese", "onions"],
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
        ingredients: ["corn-husks", "masa", "vegetables", "cheese", "onions", "garlic", "chili"],
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
        ingredients: ["beef", "rice", "beans", "lettuce", "tomatoes", "cheese", "onions", "avocado"],
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
        ingredients: ["chicken", "hominy", "vegetables", "onions", "garlic", "chili", "lime"],
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
        ingredients: ["poblano-peppers", "cheese", "eggs", "flour", "tomatoes", "onions", "garlic"],
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
        ingredients: ["beef", "tortillas", "onions", "garlic", "lime", "orange", "cinnamon"],
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
        ingredients: ["chicken", "chocolate", "chili", "onions", "garlic", "almonds", "cinnamon", "rice"],
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
        ingredients: ["eggs", "tortillas", "beans", "tomatoes", "onions", "garlic", "chili", "cheese"],
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
        ingredients: ["beef", "tortillas", "onions", "garlic", "lime", "cinnamon", "cloves", "rice"],
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
        ingredients: ["chicken", "masa", "beans", "lettuce", "tomatoes", "cheese", "onions", "olive-oil"],
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
        ingredients: ["tortillas", "beans", "cheese", "vegetables", "onions", "garlic", "olive-oil"],
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
        ingredients: ["beef", "eggs", "onions", "garlic", "tomatoes", "chili", "tortillas"],
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
        ingredients: ["chicken", "orange-juice", "lime", "achiote", "onions", "garlic", "tortillas"],
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
        ingredients: ["masa", "beans", "cheese", "vegetables", "onions", "garlic", "olive-oil"],
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
        ingredients: ["beef", "bread", "lettuce", "tomatoes", "onions", "cheese", "avocado", "mayo"],
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
        ingredients: ["chicken", "corn", "cheese", "chili", "lime", "mayo", "cilantro", "tortillas"],
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
        ingredients: ["avocado", "tomatoes", "onions", "lime", "garlic", "cilantro", "chili", "tortilla-chips"],
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
        ingredients: ["beef", "chili", "garlic", "vinegar", "paprika", "tortillas", "eggs", "onions"],
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
        ingredients: ["chicken", "lime", "garlic", "onions", "chili", "olive-oil", "rice", "vegetables"],
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
        ingredients: ["beans", "onions", "garlic", "chili", "olive-oil", "cilantro", "lime", "rice"],
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
        ingredients: ["beef", "lime", "garlic", "onions", "chili", "olive-oil", "tortillas", "cilantro"],
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
        ingredients: ["chicken", "tomatoes", "olives", "capers", "onions", "garlic", "olive-oil", "rice"],
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
        ingredients: ["tomatillos", "chili", "onions", "garlic", "cilantro", "lime", "tortilla-chips"],
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
        ingredients: ["beef", "hominy", "onions", "garlic", "chili", "lime", "cilantro", "tortillas"],
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
        ingredients: ["chicken", "poblano-peppers", "walnuts", "cheese", "pomegranate", "onions", "garlic"],
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
        ingredients: ["rice", "tomatoes", "onions", "garlic", "olive-oil", "chili", "cilantro", "vegetables"],
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
        ingredients: ["rice", "vegetables", "coconut-milk", "curry-powder", "onions", "garlic"],
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
        ingredients: ["chicken", "rice", "tomatoes", "onions", "garlic", "ginger", "yogurt", "spices", "cream"],
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
        ingredients: ["beef", "rice", "onions", "garlic", "ginger", "yogurt", "spices", "saffron"],
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
        ingredients: ["lentils", "rice", "onions", "garlic", "ginger", "spices", "tomatoes", "cilantro"],
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
        ingredients: ["chicken", "rice", "tomatoes", "onions", "garlic", "ginger", "yogurt", "spices", "cream"],
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
        ingredients: ["beef", "rice", "onions", "garlic", "ginger", "vinegar", "spices", "chili", "potatoes"],
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
        ingredients: ["potatoes", "flour", "vegetables", "onions", "garlic", "ginger", "spices", "oil"],
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
        ingredients: ["chicken", "rice", "onions", "garlic", "ginger", "yogurt", "spices", "cream", "almonds"],
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
        ingredients: ["beef", "rice", "onions", "garlic", "ginger", "tomatoes", "spices", "peas"],
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
        ingredients: ["paneer", "spinach", "rice", "onions", "garlic", "ginger", "spices", "cream"],
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
        ingredients: ["chicken", "rice", "onions", "garlic", "ginger", "yogurt", "spices", "tomatoes"],
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
        ingredients: ["beef", "rice", "onions", "garlic", "ginger", "spices", "chili", "coconut-milk"],
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
        ingredients: ["chickpeas", "rice", "onions", "garlic", "ginger", "tomatoes", "spices", "cilantro"],
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
        ingredients: ["chicken", "rice", "vegetables", "onions", "garlic", "ginger", "spices", "tomatoes"],
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
        ingredients: ["beef", "rice", "lentils", "vegetables", "onions", "garlic", "ginger", "spices"],
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
        ingredients: ["eggplant", "rice", "onions", "garlic", "ginger", "tomatoes", "spices", "cilantro"],
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
        ingredients: ["chicken", "spinach", "rice", "onions", "garlic", "ginger", "spices", "cream"],
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
        ingredients: ["beef", "rice", "onions", "garlic", "ginger", "spices", "chili", "vegetables"],
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
        ingredients: ["potatoes", "cauliflower", "rice", "onions", "garlic", "ginger", "spices", "cilantro"],
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
        ingredients: ["chicken", "rice", "tomatoes", "onions", "garlic", "ginger", "spices", "butter", "cream"],
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
        ingredients: ["beef", "rice", "onions", "garlic", "ginger", "tomatoes", "spices", "chili", "cilantro"],
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
        ingredients: ["kidney-beans", "rice", "onions", "garlic", "ginger", "tomatoes", "spices", "cilantro"],
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
        ingredients: ["chicken", "rice", "onions", "garlic", "ginger", "spices", "coconut", "curry-leaves"],
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
        ingredients: ["beef", "rice", "onions", "garlic", "ginger", "yogurt", "spices", "cream", "cashews"],
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
        ingredients: ["paneer", "peas", "rice", "onions", "garlic", "ginger", "tomatoes", "spices", "cream"],
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
        ingredients: ["chicken", "rice", "onions", "garlic", "ginger", "spices", "tomatoes", "cilantro"],
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
        ingredients: ["beef", "rice", "onions", "garlic", "ginger", "spices", "cream", "cashews", "coconut"],
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
        ingredients: ["black-lentils", "rice", "onions", "garlic", "ginger", "spices", "cream", "butter"],
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
        ingredients: ["chicken", "rice", "onions", "garlic", "ginger", "pickle-spices", "tomatoes", "cilantro"],
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
        ingredients: ["beef", "rice", "onions", "garlic", "ginger", "spices", "wheat-flour", "cilantro"],
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
        ingredients: ["yogurt", "rice", "onions", "garlic", "ginger", "spices", "chickpea-flour", "cilantro"],
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
        ingredients: ["chicken", "rice", "onions", "garlic", "ginger", "spices", "fenugreek-leaves", "tomatoes"],
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
        ingredients: ["beef", "rice", "lentils", "onions", "garlic", "ginger", "spices", "vegetables"],
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
        ingredients: ["tomatoes", "rice", "onions", "garlic", "ginger", "spices", "tamarind", "cilantro"],
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
        ingredients: ["chicken", "lettuce", "tomatoes", "cheese", "olive-oil", "lemon"],
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
        ingredients: ["beef", "bread", "lettuce", "tomatoes", "onions", "cheese", "pickles"],
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
        ingredients: ["lettuce", "cheese", "bread", "olive-oil", "lemon", "garlic", "parmesan"],
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
        ingredients: ["chicken", "flour", "eggs", "bread", "vegetables", "olive-oil", "herbs"],
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
        ingredients: ["beef", "eggs", "bread", "onions", "garlic", "ketchup", "vegetables"],
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
        ingredients: ["pasta", "cheese", "milk", "butter", "flour", "bread", "herbs"],
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
        ingredients: ["chicken", "vegetables", "flour", "butter", "milk", "onions", "garlic", "herbs"],
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
        ingredients: ["beef", "beans", "tomatoes", "onions", "garlic", "chili", "cheese", "bread"],
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
        ingredients: ["bread", "cheese", "butter", "tomatoes", "herbs"],
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
        ingredients: ["chicken", "butter", "hot-sauce", "garlic", "vegetables", "blue-cheese"],
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
        ingredients: ["beef", "butter", "garlic", "herbs", "vegetables", "olive-oil", "potatoes"],
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
        ingredients: ["vegetables", "beans", "bread", "lettuce", "tomatoes", "onions", "cheese"],
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
        ingredients: ["chicken", "flour", "eggs", "bread", "olive-oil", "vegetables"],
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
        ingredients: ["beef", "bread", "tomatoes", "onions", "garlic", "ketchup", "vegetables"],
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
        ingredients: ["lettuce", "cheese", "eggs", "tomatoes", "avocado", "onions", "olive-oil"],
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
        ingredients: ["chicken", "flour", "butter", "milk", "herbs", "vegetables"],
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
        ingredients: ["beef", "onions", "garlic", "barbecue-sauce", "vegetables", "herbs"],
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
        ingredients: ["tomatoes", "flour", "eggs", "bread", "olive-oil", "herbs"],
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
        ingredients: ["chicken", "rice", "vegetables", "onions", "garlic", "okra", "herbs", "flour"],
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
        ingredients: ["beef", "barbecue-sauce", "bread", "onions", "garlic", "vegetables"],
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
        ingredients: ["cornmeal", "flour", "eggs", "milk", "butter", "vegetables"],
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
        ingredients: ["chicken", "rice", "vegetables", "onions", "garlic", "herbs", "tomatoes"],
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
        ingredients: ["beef", "bread", "cheese", "onions", "peppers", "mushrooms", "olive-oil"],
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
        ingredients: ["sour-cream", "herbs", "garlic", "onions", "vegetables", "chips"],
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
        ingredients: ["chicken", "cheese", "hot-sauce", "cream-cheese", "bread", "vegetables"],
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
        ingredients: ["beef", "cabbage", "potatoes", "onions", "garlic", "herbs", "vegetables"],
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
        ingredients: ["eggs", "mayo", "mustard", "herbs", "paprika", "vegetables"],
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
        ingredients: ["chicken", "potatoes", "onions", "garlic", "milk", "butter", "herbs", "bread"],
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
        ingredients: ["beef", "eggs", "bread", "onions", "garlic", "herbs", "tomatoes", "pasta"],
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
        ingredients: ["sweet-potatoes", "marshmallows", "brown-sugar", "butter", "nuts", "herbs"],
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

function findMatchingMeals(availableIngredients) {
    const suggestions = [];
    
    Object.keys(RECIPE_DATABASE).forEach(recipeId => {
        const recipe = RECIPE_DATABASE[recipeId];
        const matchingIngredients = recipe.ingredients.filter(ingredient => 
            availableIngredients.includes(ingredient)
        );
        
        const matchPercentage = (matchingIngredients.length / recipe.ingredients.length) * 100;
        
        if (matchPercentage >= 50) { // Suggest if at least 50% of ingredients match
            suggestions.push({
                id: recipeId,
                ...recipe,
                matchPercentage: Math.round(matchPercentage),
                missingIngredients: recipe.ingredients.filter(ingredient => 
                    !availableIngredients.includes(ingredient)
                )
            });
        }
    });
    
    // Sort by match percentage (highest first)
    return suggestions.sort((a, b) => b.matchPercentage - a.matchPercentage);
}

function displaySuggestedMeals(meals) {
    const suggestionsContainer = document.getElementById('mealSuggestions');
    
    if (meals.length === 0) {
        suggestionsContainer.innerHTML = `
            <div class="no-suggestions">
                <h3>No meal suggestions available</h3>
                <p>Try adding more ingredients to get better suggestions!</p>
            </div>
        `;
        return;
    }
    
    const mealsHTML = meals.map(meal => `
        <div class="meal-card" data-meal-id="${meal.id}">
            <div class="meal-content">
                <div class="meal-header">
                    <h3 class="meal-name">${meal.name}</h3>
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
                                const isAvailable = !meal.missingIngredients.includes(ingredient);
                                return `<span class="ingredient-tag ${isAvailable ? 'available' : 'missing'}">${ingredient.replace('-', ' ')}</span>`;
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
    
    suggestionsContainer.innerHTML = mealsHTML;
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
    let mealName = '';
    
    // Check if it's an API recipe (numeric ID) or static recipe (string ID)
    if (!isNaN(mealId)) {
        // API recipe - get name from converted recipe
        // We need to find the meal name from the displayed meals
        const mealCards = document.querySelectorAll('.meal-card');
        for (let card of mealCards) {
            if (card.getAttribute('data-meal-id') === mealId.toString()) {
                const nameElement = card.querySelector('.meal-name');
                if (nameElement) {
                    mealName = nameElement.textContent;
                    break;
                }
            }
        }
    } else {
        // Static recipe - get name from database
        const meal = RECIPE_DATABASE[mealId];
        if (meal) {
            mealName = meal.name;
        } else {
            showErrorMessage('Recipe not found.');
            return;
        }
    }
    
    if (mealName) {
        // Create Google search URL with recipe name + "recipe"
        const searchQuery = encodeURIComponent(`${mealName} recipe`);
        const googleSearchUrl = `https://www.google.com/search?q=${searchQuery}`;
        window.open(googleSearchUrl, '_blank');
    } else {
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
                <h2>${meal.name}</h2>
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
                        ${meal.ingredients.map(ingredient => `<li>${ingredient.replace(/-/g, ' ')}</li>`).join('')}
                    </ul>
                </div>
                
                ${meal.instructions ? `
                <div class="recipe-section">
                    <h3>Cooking Instructions</h3>
                    <ol class="instructions-list">
                        ${meal.instructions.map(instruction => `<li>${instruction}</li>`).join('')}
                    </ol>
                </div>
                ` : `
                <div class="recipe-section">
                    <h3>Cooking Instructions</h3>
                    <p class="no-instructions">Detailed cooking instructions coming soon! This recipe uses standard cooking techniques for ${meal.cuisine} cuisine.</p>
                </div>
                `}
                
                <div class="recipe-actions">
                    <button class="select-meal-btn" onclick="selectMeal('${meal.name.replace(/'/g, "\\'")}'); closeRecipeModal();">Select This Recipe</button>
                    <button class="close-modal-btn" onclick="closeRecipeModal()">Close</button>
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
