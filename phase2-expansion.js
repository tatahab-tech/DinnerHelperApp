// Phase 2: Continue protein expansion

const fs = require('fs');

// Read the current script.js file
let scriptContent = fs.readFileSync('script.js', 'utf8');

// Find the closing brace of RECIPE_DATABASE
const closingBraceIndex = scriptContent.lastIndexOf('};');

// Phase 2 recipes - continuing the expansion
const phase2Recipes = `
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
    }`;

// Insert the additional recipes before the closing brace
const beforeClosing = scriptContent.substring(0, closingBraceIndex);
const afterClosing = scriptContent.substring(closingBraceIndex);

const newContent = beforeClosing + phase2Recipes + '\n' + afterClosing;

// Write the updated content back to the file
fs.writeFileSync('script.js', newContent, 'utf8');

console.log('Phase 2 of protein expansion completed!');
console.log('Added:');
console.log('- 3 more Fish recipes (Fish Teriyaki, Fish Chowder, Fish Sandwich)');
console.log('- 2 more Pork recipes (Pork Stir Fry, Pork Curry)');
console.log('- 2 more Salmon recipes (Salmon Pasta, Salmon Salad)');
console.log('');
console.log('Updated progress:');
console.log('- Fish: 11/20 recipes (55% complete)');
console.log('- Pork: 7/20 recipes (35% complete)');
console.log('- Salmon: 11/20 recipes (55% complete)');
console.log('');
console.log('Phase 3 will continue with remaining recipes...');
