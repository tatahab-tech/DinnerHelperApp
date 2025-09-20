// Phase 3: Continue protein expansion - focus on Shrimp, Tofu, and Bacon

const fs = require('fs');

// Read the current script.js file
let scriptContent = fs.readFileSync('script.js', 'utf8');

// Find the closing brace of RECIPE_DATABASE
const closingBraceIndex = scriptContent.lastIndexOf('};');

// Phase 3 recipes - Shrimp, Tofu, Bacon expansion
const phase3Recipes = `
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
    }`;

// Insert the additional recipes before the closing brace
const beforeClosing = scriptContent.substring(0, closingBraceIndex);
const afterClosing = scriptContent.substring(closingBraceIndex);

const newContent = beforeClosing + phase3Recipes + '\n' + afterClosing;

// Write the updated content back to the file
fs.writeFileSync('script.js', newContent, 'utf8');

console.log('Phase 3 of protein expansion completed!');
console.log('Added:');
console.log('- 2 more Fish recipes (Fish Ceviche, Fish Paella)');
console.log('- 2 more Shrimp recipes (Shrimp Scampi, Shrimp Curry)');
console.log('- 2 more Tofu recipes (Tofu Stir Fry, Tofu Curry)');
console.log('- 2 more Bacon recipes (Bacon Carbonara, Bacon Quiche)');
console.log('');
console.log('Updated progress:');
console.log('- Fish: 13/20 recipes (65% complete)');
console.log('- Shrimp: 10/20 recipes (50% complete)');
console.log('- Tofu: 7/20 recipes (35% complete)');
console.log('- Bacon: 10/20 recipes (50% complete)');
console.log('');
console.log('Phase 4 will complete the remaining recipes...');
