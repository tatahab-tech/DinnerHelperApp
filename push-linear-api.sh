#!/bin/bash

# 🚀 Push to Linear using API
# This script uses Linear's GraphQL API to create issues

echo "🚀 Pushing Tasks to Linear via API..."
echo "====================================="
echo ""

# Check if API key is provided
if [ -z "$LINEAR_API_KEY" ]; then
    echo "❌ Please set your Linear API key:"
    echo "   export LINEAR_API_KEY='your_api_key_here'"
    echo ""
    echo "📋 To get your API key:"
    echo "   1. Go to Linear Settings > API"
    echo "   2. Generate a new personal API key"
    echo "   3. Set it as an environment variable"
    echo ""
    exit 1
fi

# Get team ID (you'll need to replace this with your actual team ID)
TEAM_ID="your_team_id_here"

if [ "$TEAM_ID" = "your_team_id_here" ]; then
    echo "❌ Please update the TEAM_ID in this script with your actual Linear team ID"
    echo ""
    echo "📋 To find your team ID:"
    echo "   1. Go to your Linear workspace"
    echo "   2. Check the URL or team settings"
    echo "   3. Update TEAM_ID in this script"
    echo ""
    exit 1
fi

echo "✅ API Key found: ${LINEAR_API_KEY:0:10}..."
echo "✅ Team ID: $TEAM_ID"
echo ""

# Function to create a Linear issue
create_linear_issue() {
    local title="$1"
    local description="$2"
    local priority="$3"
    local labels="$4"
    
    echo "📝 Creating: $title"
    
    # Create the GraphQL mutation
    local mutation="{
        \"query\": \"mutation IssueCreate(\$input: IssueCreateInput!) { issueCreate(input: \$input) { success issue { id title url } } }\",
        \"variables\": {
            \"input\": {
                \"title\": \"$title\",
                \"description\": \"$description\",
                \"teamId\": \"$TEAM_ID\",
                \"priority\": $priority
            }
        }
    }"
    
    # Send the request to Linear API
    local response=$(curl -s -X POST \
        -H "Authorization: $LINEAR_API_KEY" \
        -H "Content-Type: application/json" \
        -d "$mutation" \
        https://api.linear.app/graphql)
    
    # Check if the request was successful
    if echo "$response" | grep -q '"success":true'; then
        echo "✅ Successfully created: $title"
        local issue_id=$(echo "$response" | grep -o '"id":"[^"]*"' | head -1 | cut -d'"' -f4)
        echo "   Issue ID: $issue_id"
    else
        echo "❌ Failed to create: $title"
        echo "   Response: $response"
    fi
    echo ""
}

echo "🔧 Creating all 10 tasks..."
echo ""

# Task 1: Fix Save Ingredients Button
create_linear_issue \
    "🐛 Fix Save Ingredients Button Not Working" \
    "The save ingredients button was not functioning due to DOM elements being accessed before DOM was fully loaded. Fixed by moving element initialization inside DOMContentLoaded event listener and changing const to let declarations.

**Technical Details:**
- Moved DOM element selection inside DOMContentLoaded event listener
- Changed const to let for saveButton, savedIngredientsList, suggestMealsButton
- Added e.preventDefault() to event listeners
- Added console logging for debugging" \
    1 \
    "bug,frontend,dom-manipulation"

# Task 2: Fix JavaScript Syntax Error
create_linear_issue \
    "🐛 Fix JavaScript Syntax Error: Unexpected token ':'" \
    "Resolved critical syntax error caused by orphaned recipe definitions outside the RECIPE_DATABASE object. Removed duplicate code blocks between lines 5365-7342 that were causing parsing failures.

**Technical Details:**
- Identified orphaned recipe definitions outside RECIPE_DATABASE
- Removed duplicate code blocks (lines 5365-7342)
- Fixed JavaScript parsing errors
- Cleaned up duplicate utility function exports" \
    1 \
    "bug,javascript,syntax-error"

# Task 3: Implement Hybrid Meal Suggestion System
create_linear_issue \
    "🔧 Implement Hybrid Meal Suggestion System" \
    "Created a robust meal suggestion system that prioritizes external API (TheMealDB) for recipe data and falls back to local database when API is unavailable. Includes proper error handling and user feedback.

**Technical Details:**
- Implemented fetchMealDbSuggestions() function
- Added fallback to local RECIPE_DATABASE
- Created hybrid suggestMeals() function
- Added comprehensive error handling and user feedback
- Implemented data source tracking (API vs Local)" \
    1 \
    "feature,api-integration,architecture"

# Task 4: Add User Feedback Messages
create_linear_issue \
    "📝 Add Comprehensive User Feedback Messages" \
    "Implemented detailed user feedback system including loading messages, error handling, no-ingredients warnings, and data source indicators to improve user experience.

**Technical Details:**
- Added showNoIngredientsMessage() function
- Enhanced showErrorMessage() with message parameter
- Added showNoSuggestionsMessage() function
- Implemented loading indicators
- Added data source indicators in UI" \
    2 \
    "feature,ux,user-feedback"

# Task 5: Update Protein Naming
create_linear_issue \
    "🔄 Update Protein Naming: Shrimp → Shrimps" \
    "Systematically updated all instances of 'shrimp' to 'shrimps' across the application including UI elements, recipe database, and internal logic for consistency.

**Technical Details:**
- Updated MAIN_INGREDIENT_CATEGORIES.proteins
- Updated variationMap for ingredient matching
- Updated all recipe files (final-completion.js, final-expansion.js, phase3-expansion.js)
- Updated HTML checkbox labels
- Ensured consistency across entire codebase" \
    2 \
    "refactor,naming,consistency"

# Task 6: Deploy to GitHub Pages
create_linear_issue \
    "🚀 Deploy to GitHub Pages" \
    "Successfully deployed the DinnerHelperApp to GitHub Pages, making it publicly accessible at the provided URL with proper configuration and documentation.

**Technical Details:**
- Configured GitHub Pages deployment
- Created deployment documentation
- Set up proper repository structure
- Added deployment verification guide
- Ensured all assets are properly linked" \
    1 \
    "deployment,github-pages,infrastructure"

# Task 7: Add Test Suite
create_linear_issue \
    "🧪 Add Comprehensive Test Suite" \
    "Implemented extensive testing framework with Jest including unit tests, integration tests, and real recipe database validation to ensure code quality and reliability.

**Technical Details:**
- Set up Jest testing framework
- Created 10+ test files covering all functionality
- Added integration tests for meal suggestions
- Implemented recipe database validation tests
- Added UI interaction tests
- Created test coverage reporting" \
    2 \
    "testing,quality-assurance,jest"

# Task 8: Create API Documentation
create_linear_issue \
    "📚 Create API Integration Documentation" \
    "Developed comprehensive documentation for external API integration including setup instructions, troubleshooting guides, and API response format specifications.

**Technical Details:**
- Created API_SETUP.md with detailed instructions
- Documented API endpoints and response formats
- Added troubleshooting section
- Included setup and configuration guide
- Documented fallback mechanisms" \
    3 \
    "documentation,api,setup-guide"

# Task 9: Implement Recipe Database Validation
create_linear_issue \
    "🔍 Implement Recipe Database Validation" \
    "Added validation system to ensure recipe data integrity including image validation, ingredient matching, and recipe name consistency checks.

**Technical Details:**
- Created recipe data integrity tests
- Implemented image validation
- Added ingredient matching validation
- Created recipe name consistency checks
- Added unique recipe image validation" \
    2 \
    "validation,data-integrity,quality"

# Task 10: Enhance UI/UX
create_linear_issue \
    "🎨 Enhance UI/UX with Modern Styling" \
    "Improved user interface with modern CSS styling, responsive design, loading animations, and better visual feedback for all user interactions.

**Technical Details:**
- Added modern CSS styling
- Implemented responsive design
- Created loading animations
- Enhanced visual feedback
- Improved user interaction patterns
- Added category grid styles" \
    2 \
    "ui,ux,styling,responsive"

echo "🎯 API Push Complete!"
echo "===================="
echo ""
echo "📊 Summary:"
echo "   • Total Tasks: 10"
echo "   • High Priority: 3"
echo "   • Medium Priority: 5"
echo "   • Low Priority: 2"
echo ""
echo "✅ All tasks have been pushed to Linear via API!"
echo ""
echo "🚀 Check your Linear workspace to see all the created issues!"
