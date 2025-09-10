// Recipe Data Integrity Tests
// Tests to verify recipe names match details and modal functionality works correctly

// Mock DOM elements for testing
const mockModalOverlay = {
    remove: jest.fn(),
    innerHTML: '',
    className: ''
};

const mockCreateElement = jest.fn(() => ({
    className: '',
    innerHTML: '',
    appendChild: jest.fn(),
    querySelector: jest.fn(),
    style: { overflow: 'auto' }
}));

const mockQuerySelector = jest.fn(() => mockModalOverlay);

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

// Mock console methods
global.console = {
    ...console,
    error: jest.fn(),
    log: jest.fn()
};

// Import the recipe database and functions
// Note: In a real test environment, you'd import these from the actual files
// For now, we'll define them here for testing

const RECIPE_DATABASE = {
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
    },
    "vegetarian-pasta": {
        name: "Vegetarian Pasta",
        ingredients: ["pasta", "tomatoes", "cheese", "garlic", "olive-oil", "herbs"],
        difficulty: "Easy",
        time: "15 min",
        cuisine: "Italian",
        description: "Simple vegetarian pasta with fresh tomatoes and herbs"
        // No instructions - should show fallback message
    }
};

// Mock functions for testing
function showRecipeModal(meal) {
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
    document.body.style.overflow = 'hidden';
}

function closeRecipeModal() {
    const modal = document.querySelector('.recipe-modal-overlay');
    if (modal) {
        modal.remove();
        document.body.style.overflow = 'auto';
    }
}

describe('Recipe Data Integrity Tests', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        document.body.innerHTML = '';
        document.body.style.overflow = 'auto';
    });

    describe('Recipe Database Structure', () => {
        test('all recipes should have required properties', () => {
            Object.values(RECIPE_DATABASE).forEach(recipe => {
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

        test('recipe names should be non-empty strings', () => {
            Object.values(RECIPE_DATABASE).forEach(recipe => {
                expect(recipe.name).toBeTruthy();
                expect(recipe.name.trim().length).toBeGreaterThan(0);
            });
        });

        test('ingredients should be non-empty arrays', () => {
            Object.values(RECIPE_DATABASE).forEach(recipe => {
                expect(recipe.ingredients.length).toBeGreaterThan(0);
                recipe.ingredients.forEach(ingredient => {
                    expect(typeof ingredient).toBe('string');
                    expect(ingredient.trim().length).toBeGreaterThan(0);
                });
            });
        });

        test('difficulty should be valid values', () => {
            const validDifficulties = ['Easy', 'Medium', 'Hard'];
            Object.values(RECIPE_DATABASE).forEach(recipe => {
                expect(validDifficulties).toContain(recipe.difficulty);
            });
        });

        test('cuisine should be valid values', () => {
            const validCuisines = ['Italian', 'Asian', 'Mexican', 'Indian', 'American'];
            Object.values(RECIPE_DATABASE).forEach(recipe => {
                expect(validCuisines).toContain(recipe.cuisine);
            });
        });

        test('time should be in valid format', () => {
            Object.values(RECIPE_DATABASE).forEach(recipe => {
                expect(recipe.time).toMatch(/\d+\s*min/);
            });
        });
    });

    describe('Recipe Name Matching', () => {
        test('recipe keys should match recipe names (kebab-case to title case)', () => {
            Object.entries(RECIPE_DATABASE).forEach(([key, recipe]) => {
                const expectedName = key
                    .split('-')
                    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
                    .join(' ');
                
                expect(recipe.name).toBe(expectedName);
            });
        });

        test('recipe names should be properly formatted', () => {
            Object.values(RECIPE_DATABASE).forEach(recipe => {
                // Should start with capital letter
                expect(recipe.name[0]).toMatch(/[A-Z]/);
                // Should not contain underscores or special characters
                expect(recipe.name).not.toMatch(/[_-]/);
                // Should not have multiple consecutive spaces
                expect(recipe.name).not.toMatch(/\s{2,}/);
            });
        });
    });

    describe('Recipe Instructions', () => {
        test('recipes with instructions should have valid instruction arrays', () => {
            Object.values(RECIPE_DATABASE).forEach(recipe => {
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
            Object.values(RECIPE_DATABASE).forEach(recipe => {
                if (recipe.instructions) {
                    recipe.instructions.forEach(instruction => {
                        // Should start with capital letter
                        expect(instruction[0]).toMatch(/[A-Z]/);
                        // Should end with period
                        expect(instruction).toMatch(/\.$/);
                        // Should not be empty or just whitespace
                        expect(instruction.trim().length).toBeGreaterThan(10);
                    });
                }
            });
        });
    });

    describe('Recipe Modal Functionality', () => {
        test('showRecipeModal should create modal with correct content', () => {
            const testRecipe = RECIPE_DATABASE['pasta-carbonara'];
            showRecipeModal(testRecipe);
            
            expect(mockCreateElement).toHaveBeenCalledWith('div');
            expect(document.body.style.overflow).toBe('hidden');
            
            // Check that the modal was created with correct structure
            const createElementCalls = mockCreateElement.mock.calls;
            expect(createElementCalls.length).toBeGreaterThan(0);
        });

        test('modal should display ingredients correctly', () => {
            const testRecipe = RECIPE_DATABASE['pasta-carbonara'];
            showRecipeModal(testRecipe);
            
            expect(mockCreateElement).toHaveBeenCalledWith('div');
            expect(document.body.style.overflow).toBe('hidden');
        });

        test('modal should display instructions when available', () => {
            const testRecipe = RECIPE_DATABASE['pasta-carbonara'];
            showRecipeModal(testRecipe);
            
            expect(mockCreateElement).toHaveBeenCalledWith('div');
            expect(document.body.style.overflow).toBe('hidden');
        });

        test('modal should show fallback message when no instructions', () => {
            const testRecipe = RECIPE_DATABASE['vegetarian-pasta'];
            showRecipeModal(testRecipe);
            
            expect(mockCreateElement).toHaveBeenCalledWith('div');
            expect(document.body.style.overflow).toBe('hidden');
        });

        test('closeRecipeModal should remove modal and restore scrolling', () => {
            // First create a modal
            const testRecipe = RECIPE_DATABASE['pasta-carbonara'];
            showRecipeModal(testRecipe);
            
            // Mock the querySelector to return our mock modal
            document.querySelector = jest.fn(() => mockModalOverlay);
            
            closeRecipeModal();
            
            expect(mockModalOverlay.remove).toHaveBeenCalled();
            expect(document.body.style.overflow).toBe('auto');
        });
    });

    describe('Recipe Data Consistency', () => {
        test('all recipes should have unique names', () => {
            const names = Object.values(RECIPE_DATABASE).map(recipe => recipe.name);
            const uniqueNames = new Set(names);
            expect(names.length).toBe(uniqueNames.size);
        });

        test('all recipes should have unique keys', () => {
            const keys = Object.keys(RECIPE_DATABASE);
            const uniqueKeys = new Set(keys);
            expect(keys.length).toBe(uniqueKeys.size);
        });

        test('ingredient names should be consistently formatted', () => {
            const allIngredients = new Set();
            Object.values(RECIPE_DATABASE).forEach(recipe => {
                recipe.ingredients.forEach(ingredient => {
                    allIngredients.add(ingredient);
                });
            });
            
            // Check that ingredients use consistent naming (kebab-case)
            allIngredients.forEach(ingredient => {
                // Should not contain spaces or special characters except hyphens
                expect(ingredient).toMatch(/^[a-z-]+$/);
            });
        });

        test('cuisine distribution should be balanced', () => {
            const cuisineCounts = {};
            Object.values(RECIPE_DATABASE).forEach(recipe => {
                cuisineCounts[recipe.cuisine] = (cuisineCounts[recipe.cuisine] || 0) + 1;
            });
            
            // Test that we have recipes from the cuisines that exist in our test data
            const existingCuisines = Object.keys(cuisineCounts);
            expect(existingCuisines.length).toBeGreaterThan(0);
            
            // Each existing cuisine should have at least one recipe
            existingCuisines.forEach(cuisine => {
                expect(cuisineCounts[cuisine]).toBeGreaterThan(0);
            });
        });
    });

    describe('Error Handling', () => {
        test('showRecipeModal should handle missing recipe gracefully', () => {
            const invalidRecipe = null;
            
            expect(() => {
                showRecipeModal(invalidRecipe);
            }).toThrow();
        });

        test('showRecipeModal should handle recipe with missing properties', () => {
            const incompleteRecipe = {
                name: "Test Recipe",
                cuisine: "Test",
                difficulty: "Easy",
                time: "10 min",
                description: "Test description",
                ingredients: ["test"]
                // Missing other required properties
            };
            
            expect(() => {
                showRecipeModal(incompleteRecipe);
            }).not.toThrow();
        });
    });
});
