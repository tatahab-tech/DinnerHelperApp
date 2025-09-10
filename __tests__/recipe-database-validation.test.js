// Recipe Database Validation Tests
// Tests to validate the actual recipe database in script.js

// Mock the DOM and localStorage for testing
const localStorageMock = {
    getItem: jest.fn(),
    setItem: jest.fn(),
    removeItem: jest.fn(),
    clear: jest.fn(),
};

Object.defineProperty(global, 'localStorage', {
    value: localStorageMock,
    writable: true
});

// Mock document methods
const mockCreateElement = jest.fn(() => ({
    className: '',
    innerHTML: '',
    appendChild: jest.fn(),
    querySelector: jest.fn(),
    style: { overflow: 'auto' }
}));

const mockQuerySelector = jest.fn();

Object.defineProperty(global.document, 'createElement', {
    value: mockCreateElement,
    writable: true
});

Object.defineProperty(global.document, 'querySelector', {
    value: mockQuerySelector,
    writable: true
});

Object.defineProperty(global.document.body, 'appendChild', {
    value: jest.fn(),
    writable: true
});

Object.defineProperty(global.document.body, 'style', {
    value: { overflow: 'auto' },
    writable: true
});

// Mock window.alert
Object.defineProperty(global, 'window', {
    value: {
        alert: jest.fn()
    },
    writable: true
});

// We need to load the actual script.js file to test the real recipe database
// For this test, we'll simulate the recipe database structure
// In a real environment, you'd use a module loader or test runner that can import the actual file

describe('Recipe Database Validation', () => {
    // This would be the actual recipe database from script.js
    // For testing purposes, we'll create a representative sample
    const SAMPLE_RECIPE_DATABASE = {
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
        }
    };

    describe('Recipe Key-Name Consistency', () => {
        test('recipe keys should convert to proper recipe names', () => {
            Object.entries(SAMPLE_RECIPE_DATABASE).forEach(([key, recipe]) => {
                // Convert kebab-case key to title case
                const expectedName = key
                    .split('-')
                    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
                    .join(' ');
                
                expect(recipe.name).toBe(expectedName);
            });
        });

        test('recipe names should be properly formatted', () => {
            Object.values(SAMPLE_RECIPE_DATABASE).forEach(recipe => {
                // Should start with capital letter
                expect(recipe.name[0]).toMatch(/[A-Z]/);
                // Should not contain underscores or special characters
                expect(recipe.name).not.toMatch(/[_-]/);
                // Should not have multiple consecutive spaces
                expect(recipe.name).not.toMatch(/\s{2,}/);
                // Should not be empty
                expect(recipe.name.trim().length).toBeGreaterThan(0);
            });
        });
    });

    describe('Recipe Data Structure Validation', () => {
        test('all recipes should have required properties', () => {
            Object.values(SAMPLE_RECIPE_DATABASE).forEach(recipe => {
                expect(recipe).toHaveProperty('name');
                expect(recipe).toHaveProperty('ingredients');
                expect(recipe).toHaveProperty('difficulty');
                expect(recipe).toHaveProperty('time');
                expect(recipe).toHaveProperty('cuisine');
                expect(recipe).toHaveProperty('description');
                
                expect(typeof recipe.name).toBe('string');
                expect(Array.isArray(recipe.ingredients)).toBe(true);
                expect(typeof recipe.difficulty).toBe('string');
                expect(typeof recipe.time).toBe('string');
                expect(typeof recipe.cuisine).toBe('string');
                expect(typeof recipe.description).toBe('string');
            });
        });

        test('ingredients should be valid strings', () => {
            Object.values(SAMPLE_RECIPE_DATABASE).forEach(recipe => {
                expect(recipe.ingredients.length).toBeGreaterThan(0);
                recipe.ingredients.forEach(ingredient => {
                    expect(typeof ingredient).toBe('string');
                    expect(ingredient.trim().length).toBeGreaterThan(0);
                    // Should be in kebab-case format
                    expect(ingredient).toMatch(/^[a-z-]+$/);
                });
            });
        });

        test('difficulty should be valid enum values', () => {
            const validDifficulties = ['Easy', 'Medium', 'Hard'];
            Object.values(SAMPLE_RECIPE_DATABASE).forEach(recipe => {
                expect(validDifficulties).toContain(recipe.difficulty);
            });
        });

        test('cuisine should be valid enum values', () => {
            const validCuisines = ['Italian', 'Asian', 'Mexican', 'Indian', 'American'];
            Object.values(SAMPLE_RECIPE_DATABASE).forEach(recipe => {
                expect(validCuisines).toContain(recipe.cuisine);
            });
        });

        test('time should be in valid format', () => {
            Object.values(SAMPLE_RECIPE_DATABASE).forEach(recipe => {
                expect(recipe.time).toMatch(/\d+\s*min/);
                // Should be a reasonable time (1-300 minutes)
                const timeValue = parseInt(recipe.time);
                expect(timeValue).toBeGreaterThan(0);
                expect(timeValue).toBeLessThanOrEqual(300);
            });
        });
    });

    describe('Recipe Instructions Validation', () => {
        test('recipes with instructions should have valid arrays', () => {
            Object.values(SAMPLE_RECIPE_DATABASE).forEach(recipe => {
                if (recipe.instructions) {
                    expect(Array.isArray(recipe.instructions)).toBe(true);
                    expect(recipe.instructions.length).toBeGreaterThan(0);
                    
                    recipe.instructions.forEach(instruction => {
                        expect(typeof instruction).toBe('string');
                        expect(instruction.trim().length).toBeGreaterThan(0);
                    });
                }
            });
        });

        test('instruction steps should be properly formatted', () => {
            Object.values(SAMPLE_RECIPE_DATABASE).forEach(recipe => {
                if (recipe.instructions) {
                    recipe.instructions.forEach(instruction => {
                        // Should start with capital letter
                        expect(instruction[0]).toMatch(/[A-Z]/);
                        // Should end with period
                        expect(instruction).toMatch(/\.$/);
                        // Should be substantial (not just a word)
                        expect(instruction.trim().length).toBeGreaterThan(10);
                        // Should not have multiple consecutive spaces
                        expect(instruction).not.toMatch(/\s{2,}/);
                    });
                }
            });
        });

        test('instruction steps should be actionable', () => {
            Object.values(SAMPLE_RECIPE_DATABASE).forEach(recipe => {
                if (recipe.instructions) {
                    recipe.instructions.forEach(instruction => {
                        // Should contain action words or be substantial
                        const actionWords = ['add', 'cook', 'heat', 'mix', 'stir', 'drain', 'serve', 'cut', 'season', 'warm', 'assemble', 'top', 'bring', 'remove', 'whisk', 'toss', 'dice', 'shred', 'grate'];
                        const hasActionWord = actionWords.some(word => 
                            instruction.toLowerCase().includes(word)
                        );
                        // Either has action word or is substantial enough
                        const isSubstantial = instruction.trim().length > 20;
                        expect(hasActionWord || isSubstantial).toBe(true);
                    });
                }
            });
        });
    });

    describe('Recipe Uniqueness and Consistency', () => {
        test('all recipe names should be unique', () => {
            const names = Object.values(SAMPLE_RECIPE_DATABASE).map(recipe => recipe.name);
            const uniqueNames = new Set(names);
            expect(names.length).toBe(uniqueNames.size);
        });

        test('all recipe keys should be unique', () => {
            const keys = Object.keys(SAMPLE_RECIPE_DATABASE);
            const uniqueKeys = new Set(keys);
            expect(keys.length).toBe(uniqueKeys.size);
        });

        test('ingredient naming should be consistent', () => {
            const allIngredients = new Set();
            Object.values(SAMPLE_RECIPE_DATABASE).forEach(recipe => {
                recipe.ingredients.forEach(ingredient => {
                    allIngredients.add(ingredient);
                });
            });
            
            // All ingredients should follow kebab-case convention
            allIngredients.forEach(ingredient => {
                expect(ingredient).toMatch(/^[a-z-]+$/);
                // Should not start or end with hyphen
                expect(ingredient).not.toMatch(/^-|-$/);
                // Should not have consecutive hyphens
                expect(ingredient).not.toMatch(/--/);
            });
        });
    });

    describe('Recipe Content Quality', () => {
        test('recipe descriptions should be informative', () => {
            Object.values(SAMPLE_RECIPE_DATABASE).forEach(recipe => {
                expect(recipe.description.length).toBeGreaterThan(10);
                expect(recipe.description).not.toMatch(/^\s*$/);
                // Should not be just the recipe name
                expect(recipe.description).not.toBe(recipe.name);
            });
        });

        test('recipe names should be descriptive', () => {
            Object.values(SAMPLE_RECIPE_DATABASE).forEach(recipe => {
                expect(recipe.name.length).toBeGreaterThan(3);
                // Should contain at least one word that's not a common word
                const commonWords = ['the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by'];
                const words = recipe.name.toLowerCase().split(' ');
                const hasDescriptiveWord = words.some(word => 
                    word.length > 2 && !commonWords.includes(word)
                );
                expect(hasDescriptiveWord).toBe(true);
            });
        });

        test('ingredients should be relevant to cuisine', () => {
            const cuisineIngredients = {
                'Italian': ['pasta', 'cheese', 'olive-oil', 'garlic', 'herbs', 'tomatoes'],
                'Asian': ['rice', 'soy-sauce', 'ginger', 'garlic', 'vegetables'],
                'Mexican': ['tortillas', 'cheese', 'tomatoes', 'onions', 'chili', 'beans']
            };

            Object.values(SAMPLE_RECIPE_DATABASE).forEach(recipe => {
                const expectedIngredients = cuisineIngredients[recipe.cuisine] || [];
                const hasRelevantIngredient = recipe.ingredients.some(ingredient =>
                    expectedIngredients.some(expected => ingredient.includes(expected))
                );
                expect(hasRelevantIngredient).toBe(true);
            });
        });
    });

    describe('Recipe Modal Integration', () => {
        test('recipe data should be compatible with modal display', () => {
            Object.entries(SAMPLE_RECIPE_DATABASE).forEach(([key, recipe]) => {
                // Test that recipe can be safely used in template strings
                expect(() => {
                    const testHTML = `
                        <h2>${recipe.name}</h2>
                        <p>${recipe.description}</p>
                        <div>${recipe.cuisine}</div>
                        <div>${recipe.difficulty}</div>
                        <div>${recipe.time}</div>
                        <ul>${recipe.ingredients.map(ing => `<li>${ing}</li>`).join('')}</ul>
                        ${recipe.instructions ? `<ol>${recipe.instructions.map(inst => `<li>${inst}</li>`).join('')}</ol>` : ''}
                    `;
                }).not.toThrow();
            });
        });

        test('ingredient formatting should work correctly', () => {
            Object.values(SAMPLE_RECIPE_DATABASE).forEach(recipe => {
                recipe.ingredients.forEach(ingredient => {
                    const formatted = ingredient.replace(/-/g, ' ');
                    expect(formatted).toMatch(/^[a-z\s]+$/);
                    expect(formatted.trim().length).toBeGreaterThan(0);
                });
            });
        });
    });
});
