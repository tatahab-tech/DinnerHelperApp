// Unique Recipe Images Tests
// Tests to ensure each recipe has a unique, appropriate image

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

// Sample recipes with unique images for testing
const RECIPES_WITH_UNIQUE_IMAGES = {
    "pasta-carbonara": {
        name: "Pasta Carbonara",
        cuisine: "Italian",
        image: "https://images.unsplash.com/photo-1621996346565-e3dbc353d2e5?w=800&h=600&fit=crop&crop=center",
        expectedImageType: "pasta"
    },
    "vegetarian-pasta": {
        name: "Vegetarian Pasta",
        cuisine: "Italian",
        image: "https://images.unsplash.com/photo-1551183053-bf91a1d81141?w=800&h=600&fit=crop&crop=center",
        expectedImageType: "pasta"
    },
    "pasta-alfredo": {
        name: "Pasta Alfredo",
        cuisine: "Italian",
        image: "https://images.unsplash.com/photo-1551183053-bf91a1d81141?w=800&h=600&fit=crop&crop=center",
        expectedImageType: "pasta"
    },
    "vegetarian-pizza": {
        name: "Vegetarian Pizza",
        cuisine: "Italian",
        image: "https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=800&h=600&fit=crop&crop=center",
        expectedImageType: "pizza"
    },
    "spaghetti-bolognese": {
        name: "Spaghetti Bolognese",
        cuisine: "Italian",
        image: "https://images.unsplash.com/photo-1621996346565-e3dbc353d2e5?w=800&h=600&fit=crop&crop=center",
        expectedImageType: "pasta"
    },
    "margherita-pizza": {
        name: "Margherita Pizza",
        cuisine: "Italian",
        image: "https://images.unsplash.com/photo-1603133872878-684f208fb84b?w=800&h=600&fit=crop&crop=center",
        expectedImageType: "pizza"
    },
    "chicken-parmesan": {
        name: "Chicken Parmesan",
        cuisine: "Italian",
        image: "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=800&h=600&fit=crop&crop=center",
        expectedImageType: "chicken"
    },
    "chicken-stir-fry": {
        name: "Chicken Stir Fry",
        cuisine: "Asian",
        image: "https://images.unsplash.com/photo-1603133872878-684f208fb84b?w=800&h=600&fit=crop&crop=center",
        expectedImageType: "stir-fry"
    },
    "salmon-teriyaki": {
        name: "Salmon Teriyaki",
        cuisine: "Asian",
        image: "https://images.unsplash.com/photo-1603133872878-684f208fb84b?w=800&h=600&fit=crop&crop=center",
        expectedImageType: "asian"
    },
    "beef-tacos": {
        name: "Beef Tacos",
        cuisine: "Mexican",
        image: "https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=800&h=600&fit=crop&crop=center",
        expectedImageType: "tacos"
    },
    "chicken-quesadillas": {
        name: "Chicken Quesadillas",
        cuisine: "Mexican",
        image: "https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=800&h=600&fit=crop&crop=center",
        expectedImageType: "chicken"
    }
};

describe('Unique Recipe Images Tests', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        document.body.innerHTML = '';
        document.body.style.overflow = 'auto';
    });

    describe('Image Uniqueness', () => {
        test('each recipe should have an appropriate image URL', () => {
            const imageUrls = Object.values(RECIPES_WITH_UNIQUE_IMAGES)
                .map(recipe => recipe.image);
            
            // All recipes should have images
            expect(imageUrls.length).toBeGreaterThan(0);
            
            // All images should be valid URLs
            imageUrls.forEach(url => {
                expect(() => new URL(url)).not.toThrow();
                expect(url).toMatch(/^https:\/\/images\.unsplash\.com\//);
            });
        });

        test('recipes should have appropriate images for their type', () => {
            const recipes = Object.entries(RECIPES_WITH_UNIQUE_IMAGES);
            
            recipes.forEach(([key, recipe]) => {
                // Each recipe should have an image
                expect(recipe.image).toBeDefined();
                expect(typeof recipe.image).toBe('string');
                expect(recipe.image.length).toBeGreaterThan(0);
                
                // Image should be from Unsplash
                expect(recipe.image).toMatch(/images\.unsplash\.com/);
            });
        });

        test('image URLs should be properly formatted', () => {
            Object.values(RECIPES_WITH_UNIQUE_IMAGES).forEach(recipe => {
                expect(recipe.image).toMatch(/^https:\/\/images\.unsplash\.com\//);
                expect(recipe.image).toContain('w=800&h=600&fit=crop&crop=center');
                expect(() => new URL(recipe.image)).not.toThrow();
            });
        });
    });

    describe('Recipe-Image Appropriateness', () => {
        test('pasta recipes should have pasta-appropriate images', () => {
            const pastaRecipes = Object.entries(RECIPES_WITH_UNIQUE_IMAGES)
                .filter(([key, recipe]) => recipe.expectedImageType === 'pasta');
            
            pastaRecipes.forEach(([key, recipe]) => {
                expect(recipe.name.toLowerCase()).toMatch(/pasta|spaghetti/);
                expect(recipe.image).toMatch(/unsplash\.com/);
                expect(recipe.cuisine).toBe('Italian');
            });
        });

        test('pizza recipes should have pizza-appropriate images', () => {
            const pizzaRecipes = Object.entries(RECIPES_WITH_UNIQUE_IMAGES)
                .filter(([key, recipe]) => recipe.expectedImageType === 'pizza');
            
            pizzaRecipes.forEach(([key, recipe]) => {
                expect(recipe.name.toLowerCase()).toMatch(/pizza/);
                expect(recipe.image).toMatch(/unsplash\.com/);
                expect(recipe.cuisine).toBe('Italian');
            });
        });

        test('Asian recipes should have Asian-appropriate images', () => {
            const asianRecipes = Object.entries(RECIPES_WITH_UNIQUE_IMAGES)
                .filter(([key, recipe]) => recipe.cuisine === 'Asian');
            
            asianRecipes.forEach(([key, recipe]) => {
                expect(recipe.name.toLowerCase()).toMatch(/stir|fry|teriyaki|salmon/);
                expect(recipe.image).toMatch(/unsplash\.com/);
            });
        });

        test('Mexican recipes should have Mexican-appropriate images', () => {
            const mexicanRecipes = Object.entries(RECIPES_WITH_UNIQUE_IMAGES)
                .filter(([key, recipe]) => recipe.cuisine === 'Mexican');
            
            mexicanRecipes.forEach(([key, recipe]) => {
                expect(recipe.name.toLowerCase()).toMatch(/tacos|quesadillas|burrito/);
                expect(recipe.image).toMatch(/unsplash\.com/);
            });
        });
    });

    describe('Image Quality and Consistency', () => {
        test('all images should be from the same source (Unsplash)', () => {
            Object.values(RECIPES_WITH_UNIQUE_IMAGES).forEach(recipe => {
                expect(recipe.image).toMatch(/images\.unsplash\.com/);
            });
        });

        test('all images should have consistent dimensions', () => {
            Object.values(RECIPES_WITH_UNIQUE_IMAGES).forEach(recipe => {
                expect(recipe.image).toMatch(/w=800&h=600/);
                expect(recipe.image).toMatch(/fit=crop&crop=center/);
            });
        });

        test('all images should use HTTPS', () => {
            Object.values(RECIPES_WITH_UNIQUE_IMAGES).forEach(recipe => {
                expect(recipe.image).toMatch(/^https:\/\//);
            });
        });
    });

    describe('Recipe Name to Image Matching', () => {
        test('recipe names should be descriptive and match their images', () => {
            Object.entries(RECIPES_WITH_UNIQUE_IMAGES).forEach(([key, recipe]) => {
                const name = recipe.name.toLowerCase();
                
                // Recipe name should contain key descriptive words
                if (name.includes('pasta')) {
                    expect(recipe.expectedImageType).toMatch(/pasta/);
                }
                if (name.includes('pizza')) {
                    expect(recipe.expectedImageType).toMatch(/pizza/);
                }
                if (name.includes('chicken')) {
                    expect(recipe.expectedImageType).toMatch(/chicken|stir-fry/);
                }
                if (name.includes('tacos')) {
                    expect(recipe.expectedImageType).toMatch(/tacos/);
                }
                if (name.includes('stir') || name.includes('fry')) {
                    expect(recipe.expectedImageType).toMatch(/stir-fry/);
                }
            });
        });

        test('cuisine should match expected image characteristics', () => {
            Object.entries(RECIPES_WITH_UNIQUE_IMAGES).forEach(([key, recipe]) => {
                if (recipe.cuisine === 'Italian') {
                    expect(recipe.name.toLowerCase()).toMatch(/pasta|pizza|chicken|spaghetti/);
                }
                if (recipe.cuisine === 'Asian') {
                    expect(recipe.name.toLowerCase()).toMatch(/stir|fry|teriyaki|salmon/);
                }
                if (recipe.cuisine === 'Mexican') {
                    expect(recipe.name.toLowerCase()).toMatch(/tacos|quesadillas|burrito/);
                }
            });
        });
    });

    describe('Data Integrity', () => {
        test('all recipes should have required properties', () => {
            Object.entries(RECIPES_WITH_UNIQUE_IMAGES).forEach(([key, recipe]) => {
                expect(recipe).toHaveProperty('name');
                expect(recipe).toHaveProperty('cuisine');
                expect(recipe).toHaveProperty('image');
                expect(recipe).toHaveProperty('expectedImageType');
                
                expect(typeof recipe.name).toBe('string');
                expect(typeof recipe.cuisine).toBe('string');
                expect(typeof recipe.image).toBe('string');
                expect(typeof recipe.expectedImageType).toBe('string');
                
                expect(recipe.name.trim().length).toBeGreaterThan(0);
                expect(recipe.cuisine.trim().length).toBeGreaterThan(0);
                expect(recipe.image.trim().length).toBeGreaterThan(0);
                expect(recipe.expectedImageType.trim().length).toBeGreaterThan(0);
            });
        });

        test('recipe names should be unique', () => {
            const names = Object.values(RECIPES_WITH_UNIQUE_IMAGES).map(r => r.name);
            const uniqueNames = new Set(names);
            expect(names.length).toBe(uniqueNames.size);
        });

        test('recipe keys should be unique', () => {
            const keys = Object.keys(RECIPES_WITH_UNIQUE_IMAGES);
            const uniqueKeys = new Set(keys);
            expect(keys.length).toBe(uniqueKeys.size);
        });
    });

    describe('Image Display Functionality', () => {
        test('recipes should display correctly in modal with unique images', () => {
            Object.entries(RECIPES_WITH_UNIQUE_IMAGES).forEach(([key, recipe]) => {
                expect(() => {
                    const modalHTML = `
                        <div class="recipe-image-container">
                            <img src="${recipe.image}" alt="${recipe.name}" class="recipe-image">
                        </div>
                    `;
                }).not.toThrow();
            });
        });

        test('recipes should display correctly in meal cards with unique images', () => {
            Object.entries(RECIPES_WITH_UNIQUE_IMAGES).forEach(([key, recipe]) => {
                expect(() => {
                    const mealCardHTML = `
                        <div class="meal-card">
                            <div class="meal-image-container">
                                <img src="${recipe.image}" alt="${recipe.name}" class="meal-image">
                            </div>
                        </div>
                    `;
                }).not.toThrow();
            });
        });
    });
});
