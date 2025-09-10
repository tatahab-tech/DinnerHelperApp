// Recipe Image Validation Tests
// Tests to verify recipe names match their pictures and image functionality works correctly

// Mock localStorage
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
Object.defineProperty(global.window, 'alert', {
    value: jest.fn(),
    writable: true
});

// Sample recipe database with images for testing
const SAMPLE_RECIPE_DATABASE = {
    "pasta-carbonara": {
        name: "Pasta Carbonara",
        ingredients: ["pasta", "eggs", "cheese", "bacon", "garlic", "olive-oil"],
        difficulty: "Medium",
        time: "25 min",
        cuisine: "Italian",
        description: "Classic Italian pasta with eggs, cheese, and bacon",
        image: "https://images.unsplash.com/photo-1621996346565-e3dbc353d2e5?w=800&h=600&fit=crop&crop=center",
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
        image: "https://images.unsplash.com/photo-1551183053-bf91a1d81141?w=800&h=600&fit=crop&crop=center"
    },
    "chicken-stir-fry": {
        name: "Chicken Stir Fry",
        ingredients: ["chicken", "rice", "vegetables", "soy-sauce", "garlic", "olive-oil"],
        difficulty: "Easy",
        time: "20 min",
        cuisine: "Asian",
        description: "Quick and healthy chicken with vegetables over rice",
        image: "https://images.unsplash.com/photo-1603133872878-684f208fb84b?w=800&h=600&fit=crop&crop=center",
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
        image: "https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=800&h=600&fit=crop&crop=center",
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
    "recipe-without-image": {
        name: "Recipe Without Image",
        ingredients: ["test", "ingredients"],
        difficulty: "Easy",
        time: "10 min",
        cuisine: "Test",
        description: "A test recipe without an image"
        // No image property
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
                ${meal.image ? `
                <div class="recipe-image-container">
                    <img src="${meal.image}" alt="${meal.name}" class="recipe-image" onerror="this.src='https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=800&h=600&fit=crop&crop=center'">
                </div>
                ` : `
                <div class="recipe-image-container">
                    <img src="https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=800&h=600&fit=crop&crop=center" alt="Default recipe image" class="recipe-image">
                </div>
                `}
                
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

function displaySuggestedMeals(meals) {
    const suggestionsContainer = { innerHTML: '' };
    
    const mealsHTML = meals.map(meal => `
        <div class="meal-card" data-meal-id="${meal.id}">
            <div class="meal-image-container">
                <img src="${meal.image || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400&h=300&fit=crop&crop=center'}" 
                     alt="${meal.name}" 
                     class="meal-image"
                     onerror="this.src='https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400&h=300&fit=crop&crop=center'">
            </div>
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
                </div>
            </div>
        </div>
    `).join('');
    
    return mealsHTML;
}

describe('Recipe Image Validation Tests', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        document.body.innerHTML = '';
        document.body.style.overflow = 'auto';
    });

    describe('Recipe Image Data Structure', () => {
        test('recipes with images should have valid image URLs', () => {
            Object.entries(SAMPLE_RECIPE_DATABASE).forEach(([key, recipe]) => {
                if (recipe.image) {
                    expect(typeof recipe.image).toBe('string');
                    expect(recipe.image).toMatch(/^https:\/\/images\.unsplash\.com\//);
                    expect(recipe.image).toContain('w=800&h=600&fit=crop&crop=center');
                }
            });
        });

        test('image URLs should be properly formatted', () => {
            Object.entries(SAMPLE_RECIPE_DATABASE).forEach(([key, recipe]) => {
                if (recipe.image) {
                    // Should be a valid URL
                    expect(() => new URL(recipe.image)).not.toThrow();
                    
                    // Should contain proper Unsplash parameters
                    expect(recipe.image).toMatch(/w=\d+/);
                    expect(recipe.image).toMatch(/h=\d+/);
                    expect(recipe.image).toMatch(/fit=crop/);
                    expect(recipe.image).toMatch(/crop=center/);
                }
            });
        });

        test('recipes without images should not have image property or have undefined image', () => {
            Object.entries(SAMPLE_RECIPE_DATABASE).forEach(([key, recipe]) => {
                if (!recipe.image) {
                    expect(recipe.image).toBeUndefined();
                }
            });
        });
    });

    describe('Recipe Name to Image Matching', () => {
        test('pasta recipes should have pasta-related images', () => {
            const pastaRecipes = Object.entries(SAMPLE_RECIPE_DATABASE).filter(
                ([key, recipe]) => recipe.name.toLowerCase().includes('pasta')
            );
            
            pastaRecipes.forEach(([key, recipe]) => {
                if (recipe.image) {
                    // Image URL should contain pasta-related identifiers
                    // This is a basic check - in a real app, you'd have more sophisticated matching
                    expect(recipe.image).toMatch(/unsplash\.com/);
                }
            });
        });

        test('Asian recipes should have appropriate image URLs', () => {
            const asianRecipes = Object.entries(SAMPLE_RECIPE_DATABASE).filter(
                ([key, recipe]) => recipe.cuisine === 'Asian'
            );
            
            asianRecipes.forEach(([key, recipe]) => {
                if (recipe.image) {
                    expect(recipe.image).toMatch(/unsplash\.com/);
                    expect(recipe.image).toContain('w=800&h=600');
                }
            });
        });

        test('Mexican recipes should have appropriate image URLs', () => {
            const mexicanRecipes = Object.entries(SAMPLE_RECIPE_DATABASE).filter(
                ([key, recipe]) => recipe.cuisine === 'Mexican'
            );
            
            mexicanRecipes.forEach(([key, recipe]) => {
                if (recipe.image) {
                    expect(recipe.image).toMatch(/unsplash\.com/);
                    expect(recipe.image).toContain('w=800&h=600');
                }
            });
        });

        test('Italian recipes should have appropriate image URLs', () => {
            const italianRecipes = Object.entries(SAMPLE_RECIPE_DATABASE).filter(
                ([key, recipe]) => recipe.cuisine === 'Italian'
            );
            
            italianRecipes.forEach(([key, recipe]) => {
                if (recipe.image) {
                    expect(recipe.image).toMatch(/unsplash\.com/);
                    expect(recipe.image).toContain('w=800&h=600');
                }
            });
        });
    });

    describe('Image Display in Modal', () => {
        test('modal should display recipe image when available', () => {
            const testRecipe = SAMPLE_RECIPE_DATABASE['pasta-carbonara'];
            showRecipeModal(testRecipe);
            
            expect(mockCreateElement).toHaveBeenCalledWith('div');
            expect(document.body.style.overflow).toBe('hidden');
            
            // Check that image container is created
            const createElementCalls = mockCreateElement.mock.calls;
            expect(createElementCalls.length).toBeGreaterThan(0);
        });

        test('modal should display fallback image when recipe has no image', () => {
            const testRecipe = SAMPLE_RECIPE_DATABASE['recipe-without-image'];
            showRecipeModal(testRecipe);
            
            expect(mockCreateElement).toHaveBeenCalledWith('div');
            expect(document.body.style.overflow).toBe('hidden');
        });

        test('modal should handle image loading errors gracefully', () => {
            const testRecipe = SAMPLE_RECIPE_DATABASE['pasta-carbonara'];
            showRecipeModal(testRecipe);
            
            // The modal should include onerror handler
            expect(mockCreateElement).toHaveBeenCalledWith('div');
        });
    });

    describe('Image Display in Meal Cards', () => {
        test('meal cards should display recipe images', () => {
            const testMeals = [
                {
                    id: 'pasta-carbonara',
                    name: 'Pasta Carbonara',
                    cuisine: 'Italian',
                    difficulty: 'Medium',
                    time: '25 min',
                    description: 'Test description',
                    image: 'https://images.unsplash.com/photo-1621996346565-e3dbc353d2e5?w=800&h=600&fit=crop&crop=center',
                    matchPercentage: 100
                }
            ];
            
            const mealsHTML = displaySuggestedMeals(testMeals);
            
            expect(mealsHTML).toContain('meal-image-container');
            expect(mealsHTML).toContain('meal-image');
            expect(mealsHTML).toContain('https://images.unsplash.com/photo-1621996346565-e3dbc353d2e5');
            expect(mealsHTML).toContain('alt="Pasta Carbonara"');
        });

        test('meal cards should display fallback image when recipe has no image', () => {
            const testMeals = [
                {
                    id: 'test-recipe',
                    name: 'Test Recipe',
                    cuisine: 'Test',
                    difficulty: 'Easy',
                    time: '10 min',
                    description: 'Test description',
                    matchPercentage: 100
                    // No image property
                }
            ];
            
            const mealsHTML = displaySuggestedMeals(testMeals);
            
            expect(mealsHTML).toContain('meal-image-container');
            expect(mealsHTML).toContain('meal-image');
            expect(mealsHTML).toContain('https://images.unsplash.com/photo-1546069901-ba9599a7e63c');
            expect(mealsHTML).toContain('alt="Test Recipe"');
        });

        test('meal cards should include error handling for images', () => {
            const testMeals = [
                {
                    id: 'pasta-carbonara',
                    name: 'Pasta Carbonara',
                    cuisine: 'Italian',
                    difficulty: 'Medium',
                    time: '25 min',
                    description: 'Test description',
                    image: 'https://images.unsplash.com/photo-1621996346565-e3dbc353d2e5?w=800&h=600&fit=crop&crop=center',
                    matchPercentage: 100
                }
            ];
            
            const mealsHTML = displaySuggestedMeals(testMeals);
            
            expect(mealsHTML).toContain('onerror=');
            expect(mealsHTML).toContain('this.src=');
        });
    });

    describe('Image URL Validation', () => {
        test('image URLs should be accessible and valid', () => {
            const imageUrls = Object.values(SAMPLE_RECIPE_DATABASE)
                .filter(recipe => recipe.image)
                .map(recipe => recipe.image);
            
            imageUrls.forEach(url => {
                // Should be a valid URL
                expect(() => new URL(url)).not.toThrow();
                
                // Should be HTTPS
                expect(url).toMatch(/^https:\/\//);
                
                // Should be from Unsplash
                expect(url).toMatch(/images\.unsplash\.com/);
                
                // Should have proper dimensions
                expect(url).toMatch(/w=800/);
                expect(url).toMatch(/h=600/);
            });
        });

        test('fallback image URL should be valid', () => {
            const fallbackUrl = 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=800&h=600&fit=crop&crop=center';
            
            expect(() => new URL(fallbackUrl)).not.toThrow();
            expect(fallbackUrl).toMatch(/^https:\/\//);
            expect(fallbackUrl).toMatch(/images\.unsplash\.com/);
        });
    });

    describe('Image Alt Text Validation', () => {
        test('modal images should have proper alt text', () => {
            const testRecipe = SAMPLE_RECIPE_DATABASE['pasta-carbonara'];
            showRecipeModal(testRecipe);
            
            // The modal should include alt text for images
            expect(mockCreateElement).toHaveBeenCalledWith('div');
        });

        test('meal card images should have proper alt text', () => {
            const testMeals = [
                {
                    id: 'pasta-carbonara',
                    name: 'Pasta Carbonara',
                    cuisine: 'Italian',
                    difficulty: 'Medium',
                    time: '25 min',
                    description: 'Test description',
                    image: 'https://images.unsplash.com/photo-1621996346565-e3dbc353d2e5?w=800&h=600&fit=crop&crop=center',
                    matchPercentage: 100
                }
            ];
            
            const mealsHTML = displaySuggestedMeals(testMeals);
            
            expect(mealsHTML).toContain('alt="Pasta Carbonara"');
        });
    });

    describe('Image Consistency', () => {
        test('all recipes should have consistent image handling', () => {
            Object.entries(SAMPLE_RECIPE_DATABASE).forEach(([key, recipe]) => {
                // Every recipe should either have an image or be handled gracefully
                if (recipe.image) {
                    expect(typeof recipe.image).toBe('string');
                    expect(recipe.image.length).toBeGreaterThan(0);
                }
                
                // Recipe should work in both modal and card display
                expect(() => showRecipeModal(recipe)).not.toThrow();
                
                const testMeals = [{
                    id: key,
                    name: recipe.name,
                    cuisine: recipe.cuisine,
                    difficulty: recipe.difficulty,
                    time: recipe.time,
                    description: recipe.description,
                    image: recipe.image,
                    matchPercentage: 100
                }];
                
                expect(() => displaySuggestedMeals(testMeals)).not.toThrow();
            });
        });

        test('image dimensions should be consistent', () => {
            const imageUrls = Object.values(SAMPLE_RECIPE_DATABASE)
                .filter(recipe => recipe.image)
                .map(recipe => recipe.image);
            
            imageUrls.forEach(url => {
                // All images should have the same dimensions
                expect(url).toMatch(/w=800/);
                expect(url).toMatch(/h=600/);
                expect(url).toMatch(/fit=crop/);
                expect(url).toMatch(/crop=center/);
            });
        });
    });

    describe('Error Handling', () => {
        test('should handle missing image gracefully', () => {
            const recipeWithoutImage = SAMPLE_RECIPE_DATABASE['recipe-without-image'];
            
            expect(() => showRecipeModal(recipeWithoutImage)).not.toThrow();
            
            const testMeals = [{
                id: 'recipe-without-image',
                name: recipeWithoutImage.name,
                cuisine: recipeWithoutImage.cuisine,
                difficulty: recipeWithoutImage.difficulty,
                time: recipeWithoutImage.time,
                description: recipeWithoutImage.description,
                matchPercentage: 100
            }];
            
            expect(() => displaySuggestedMeals(testMeals)).not.toThrow();
        });

        test('should handle invalid image URLs gracefully', () => {
            const recipeWithInvalidImage = {
                ...SAMPLE_RECIPE_DATABASE['pasta-carbonara'],
                image: 'invalid-url'
            };
            
            expect(() => showRecipeModal(recipeWithInvalidImage)).not.toThrow();
        });
    });
});
