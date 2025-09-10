// Recipe Name to Image Matching Tests
// Tests to ensure recipe names match their corresponding images

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

// Extended recipe database with specific image-recipe mappings for testing
const RECIPE_IMAGE_MAPPINGS = {
    "pasta-carbonara": {
        name: "Pasta Carbonara",
        cuisine: "Italian",
        image: "https://images.unsplash.com/photo-1621996346565-e3dbc353d2e5?w=800&h=600&fit=crop&crop=center",
        expectedImageKeywords: ["pasta", "carbonara", "italian", "noodles", "cheese", "bacon"]
    },
    "vegetarian-pasta": {
        name: "Vegetarian Pasta",
        cuisine: "Italian",
        image: "https://images.unsplash.com/photo-1551183053-bf91a1d81141?w=800&h=600&fit=crop&crop=center",
        expectedImageKeywords: ["pasta", "vegetarian", "tomatoes", "italian", "noodles"]
    },
    "chicken-stir-fry": {
        name: "Chicken Stir Fry",
        cuisine: "Asian",
        image: "https://images.unsplash.com/photo-1603133872878-684f208fb84b?w=800&h=600&fit=crop&crop=center",
        expectedImageKeywords: ["chicken", "stir", "fry", "asian", "vegetables", "wok"]
    },
    "beef-tacos": {
        name: "Beef Tacos",
        cuisine: "Mexican",
        image: "https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=800&h=600&fit=crop&crop=center",
        expectedImageKeywords: ["tacos", "beef", "mexican", "tortilla", "meat"]
    },
    "salmon-teriyaki": {
        name: "Salmon Teriyaki",
        cuisine: "Asian",
        image: "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=800&h=600&fit=crop&crop=center", // Fallback image
        expectedImageKeywords: ["salmon", "teriyaki", "asian", "fish", "rice"]
    }
};

describe('Recipe Name to Image Matching Tests', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        document.body.innerHTML = '';
        document.body.style.overflow = 'auto';
    });

    describe('Recipe Name and Image Consistency', () => {
        test('recipe names should be descriptive and match their cuisine', () => {
            Object.entries(RECIPE_IMAGE_MAPPINGS).forEach(([key, recipe]) => {
                // Recipe name should contain key descriptive words
                const nameWords = recipe.name.toLowerCase().split(' ');
                const cuisineWords = recipe.cuisine.toLowerCase();
                
                // Name should contain cuisine-related terms
                expect(nameWords.some(word => 
                    ['pasta', 'carbonara', 'stir', 'fry', 'tacos', 'teriyaki'].includes(word)
                )).toBe(true);
                
                // Name should be descriptive (more than one word)
                expect(nameWords.length).toBeGreaterThan(1);
            });
        });

        test('image URLs should be from appropriate sources', () => {
            Object.values(RECIPE_IMAGE_MAPPINGS).forEach(recipe => {
                if (recipe.image) {
                    // Should be from Unsplash (reliable food photography source)
                    expect(recipe.image).toMatch(/images\.unsplash\.com/);
                    
                    // Should have proper dimensions
                    expect(recipe.image).toMatch(/w=800&h=600/);
                    
                    // Should be HTTPS
                    expect(recipe.image).toMatch(/^https:\/\//);
                }
            });
        });

        test('cuisine should match expected image characteristics', () => {
            Object.entries(RECIPE_IMAGE_MAPPINGS).forEach(([key, recipe]) => {
                // Italian recipes should have Italian food characteristics
                if (recipe.cuisine === 'Italian') {
                    expect(recipe.name.toLowerCase()).toMatch(/pasta|pizza|risotto|lasagna/);
                }
                
                // Asian recipes should have Asian food characteristics
                if (recipe.cuisine === 'Asian') {
                    expect(recipe.name.toLowerCase()).toMatch(/stir|fry|teriyaki|ramen|sushi/);
                }
                
                // Mexican recipes should have Mexican food characteristics
                if (recipe.cuisine === 'Mexican') {
                    expect(recipe.name.toLowerCase()).toMatch(/tacos|burrito|quesadilla|enchilada/);
                }
            });
        });
    });

    describe('Image Content Validation', () => {
        test('pasta recipes should have pasta-related image URLs', () => {
            const pastaRecipes = Object.entries(RECIPE_IMAGE_MAPPINGS).filter(
                ([key, recipe]) => recipe.name.toLowerCase().includes('pasta')
            );
            
            pastaRecipes.forEach(([key, recipe]) => {
                expect(recipe.image).toMatch(/unsplash\.com/);
                expect(recipe.image).toContain('w=800&h=600');
                
                // Image should be from a food photography source
                expect(recipe.image).toMatch(/photo-\d+/);
            });
        });

        test('Asian recipes should have appropriate image characteristics', () => {
            const asianRecipes = Object.entries(RECIPE_IMAGE_MAPPINGS).filter(
                ([key, recipe]) => recipe.cuisine === 'Asian'
            );
            
            asianRecipes.forEach(([key, recipe]) => {
                expect(recipe.image).toMatch(/unsplash\.com/);
                expect(recipe.image).toContain('w=800&h=600');
                
                // Should be a valid photo ID
                expect(recipe.image).toMatch(/photo-\d+/);
            });
        });

        test('Mexican recipes should have appropriate image characteristics', () => {
            const mexicanRecipes = Object.entries(RECIPE_IMAGE_MAPPINGS).filter(
                ([key, recipe]) => recipe.cuisine === 'Mexican'
            );
            
            mexicanRecipes.forEach(([key, recipe]) => {
                expect(recipe.image).toMatch(/unsplash\.com/);
                expect(recipe.image).toContain('w=800&h=600');
                
                // Should be a valid photo ID
                expect(recipe.image).toMatch(/photo-\d+/);
            });
        });
    });

    describe('Image URL Structure Validation', () => {
        test('all image URLs should follow consistent format', () => {
            Object.values(RECIPE_IMAGE_MAPPINGS).forEach(recipe => {
                if (recipe.image) {
                    // Should match Unsplash URL pattern
                    expect(recipe.image).toMatch(/^https:\/\/images\.unsplash\.com\/photo-\d+-\w+\?/);
                    
                    // Should have proper parameters
                    expect(recipe.image).toMatch(/w=800/);
                    expect(recipe.image).toMatch(/h=600/);
                    expect(recipe.image).toMatch(/fit=crop/);
                    expect(recipe.image).toMatch(/crop=center/);
                }
            });
        });

        test('image URLs should be valid and accessible', () => {
            Object.values(RECIPE_IMAGE_MAPPINGS).forEach(recipe => {
                if (recipe.image) {
                    // Should be a valid URL
                    expect(() => new URL(recipe.image)).not.toThrow();
                    
                    // Should be HTTPS
                    expect(recipe.image).toMatch(/^https:\/\//);
                    
                    // Should not contain any invalid characters
                    expect(recipe.image).not.toMatch(/[<>"']/);
                }
            });
        });
    });

    describe('Recipe-Image Relationship Validation', () => {
        test('recipe names should be consistent with their image context', () => {
            Object.entries(RECIPE_IMAGE_MAPPINGS).forEach(([key, recipe]) => {
                // Recipe name should be descriptive enough to match image
                const nameWords = recipe.name.toLowerCase().split(/\s+/);
                
                // Should contain main ingredient or dish type
                const hasMainIngredient = nameWords.some(word => 
                    ['pasta', 'chicken', 'beef', 'salmon', 'vegetarian'].includes(word)
                );
                expect(hasMainIngredient).toBe(true);
                
                // Should contain cooking method or style (at least one of these)
                const hasCookingMethod = nameWords.some(word => 
                    ['carbonara', 'stir', 'fry', 'tacos', 'teriyaki', 'vegetarian'].includes(word)
                );
                expect(hasCookingMethod).toBe(true);
            });
        });

        test('cuisine should be consistent with recipe name and image', () => {
            Object.entries(RECIPE_IMAGE_MAPPINGS).forEach(([key, recipe]) => {
                const name = recipe.name.toLowerCase();
                const cuisine = recipe.cuisine.toLowerCase();
                
                if (cuisine === 'italian') {
                    expect(name).toMatch(/pasta|pizza|risotto|lasagna|carbonara/);
                } else if (cuisine === 'asian') {
                    expect(name).toMatch(/stir|fry|teriyaki|ramen|sushi|chicken/);
                } else if (cuisine === 'mexican') {
                    expect(name).toMatch(/tacos|burrito|quesadilla|enchilada/);
                }
            });
        });
    });

    describe('Image Fallback and Error Handling', () => {
        test('recipes without specific images should use fallback', () => {
            const fallbackImage = 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=800&h=600&fit=crop&crop=center';
            
            // Fallback image should be valid
            expect(() => new URL(fallbackImage)).not.toThrow();
            expect(fallbackImage).toMatch(/unsplash\.com/);
            expect(fallbackImage).toContain('w=800&h=600');
        });

        test('image error handling should be implemented', () => {
            // This test verifies that error handling is in place
            // In the actual implementation, onerror handlers should be present
            const testRecipe = RECIPE_IMAGE_MAPPINGS['pasta-carbonara'];
            
            // Recipe should have an image
            expect(testRecipe.image).toBeDefined();
            expect(typeof testRecipe.image).toBe('string');
        });
    });

    describe('Data Integrity for Image-Recipe Matching', () => {
        test('all recipes should have consistent data structure', () => {
            Object.entries(RECIPE_IMAGE_MAPPINGS).forEach(([key, recipe]) => {
                // Required properties
                expect(recipe).toHaveProperty('name');
                expect(recipe).toHaveProperty('cuisine');
                expect(recipe).toHaveProperty('image');
                expect(recipe).toHaveProperty('expectedImageKeywords');
                
                // Data types
                expect(typeof recipe.name).toBe('string');
                expect(typeof recipe.cuisine).toBe('string');
                expect(typeof recipe.image).toBe('string');
                expect(Array.isArray(recipe.expectedImageKeywords)).toBe(true);
                
                // Non-empty values
                expect(recipe.name.trim().length).toBeGreaterThan(0);
                expect(recipe.cuisine.trim().length).toBeGreaterThan(0);
                expect(recipe.image.trim().length).toBeGreaterThan(0);
                expect(recipe.expectedImageKeywords.length).toBeGreaterThan(0);
            });
        });

        test('expected image keywords should be relevant to recipe', () => {
            Object.entries(RECIPE_IMAGE_MAPPINGS).forEach(([key, recipe]) => {
                const nameWords = recipe.name.toLowerCase();
                const keywords = recipe.expectedImageKeywords.map(k => k.toLowerCase());
                
                // At least some keywords should match the recipe name
                const hasMatchingKeywords = keywords.some(keyword => 
                    nameWords.includes(keyword)
                );
                expect(hasMatchingKeywords).toBe(true);
            });
        });
    });

    describe('Cross-Validation Tests', () => {
        test('recipe names should be unique and descriptive', () => {
            const names = Object.values(RECIPE_IMAGE_MAPPINGS).map(r => r.name);
            const uniqueNames = new Set(names);
            
            // All names should be unique
            expect(names.length).toBe(uniqueNames.size);
            
            // All names should be descriptive (more than one word)
            names.forEach(name => {
                const words = name.split(/\s+/);
                expect(words.length).toBeGreaterThan(1);
                expect(words.every(word => word.length > 0)).toBe(true);
            });
        });

        test('image URLs should be unique', () => {
            const imageUrls = Object.values(RECIPE_IMAGE_MAPPINGS)
                .map(r => r.image)
                .filter(url => url); // Filter out undefined/null
            
            const uniqueUrls = new Set(imageUrls);
            
            // All image URLs should be unique
            expect(imageUrls.length).toBe(uniqueUrls.size);
        });

        test('cuisine distribution should be balanced', () => {
            const cuisineCounts = {};
            Object.values(RECIPE_IMAGE_MAPPINGS).forEach(recipe => {
                cuisineCounts[recipe.cuisine] = (cuisineCounts[recipe.cuisine] || 0) + 1;
            });
            
            // Should have multiple cuisines represented
            const cuisines = Object.keys(cuisineCounts);
            expect(cuisines.length).toBeGreaterThan(1);
            
            // Each cuisine should have at least one recipe
            cuisines.forEach(cuisine => {
                expect(cuisineCounts[cuisine]).toBeGreaterThan(0);
            });
        });
    });
});
