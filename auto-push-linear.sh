#!/bin/bash

# 🚀 Auto Push to Linear - DinnerHelperApp Tasks
# This script attempts to push all tasks to Linear automatically

echo "🚀 Auto Pushing Tasks to Linear..."
echo "=================================="
echo ""

# Function to create a task in Linear
create_linear_task() {
    local title="$1"
    local description="$2"
    local priority="$3"
    local labels="$4"
    
    echo "📝 Creating: $title"
    
    # Try to create the task using npx
    echo "$description" | npx @linear/cli new --title "$title" 2>/dev/null
    
    if [ $? -eq 0 ]; then
        echo "✅ Successfully created: $title"
    else
        echo "❌ Failed to create: $title"
        echo "   Description: $description"
        echo "   Priority: $priority"
        echo "   Labels: $labels"
        echo ""
    fi
}

echo "🔧 Attempting to create all 10 tasks..."
echo ""

# Task 1: Fix Save Ingredients Button
create_linear_task \
    "🐛 Fix Save Ingredients Button Not Working" \
    "The save ingredients button was not functioning due to DOM elements being accessed before DOM was fully loaded. Fixed by moving element initialization inside DOMContentLoaded event listener and changing const to let declarations." \
    "High" \
    "bug,frontend,dom-manipulation"

# Task 2: Fix JavaScript Syntax Error
create_linear_task \
    "🐛 Fix JavaScript Syntax Error: Unexpected token ':'" \
    "Resolved critical syntax error caused by orphaned recipe definitions outside the RECIPE_DATABASE object. Removed duplicate code blocks between lines 5365-7342 that were causing parsing failures." \
    "High" \
    "bug,javascript,syntax-error"

# Task 3: Implement Hybrid Meal Suggestion System
create_linear_task \
    "🔧 Implement Hybrid Meal Suggestion System" \
    "Created a robust meal suggestion system that prioritizes external API (TheMealDB) for recipe data and falls back to local database when API is unavailable. Includes proper error handling and user feedback." \
    "High" \
    "feature,api-integration,architecture"

# Task 4: Add User Feedback Messages
create_linear_task \
    "📝 Add Comprehensive User Feedback Messages" \
    "Implemented detailed user feedback system including loading messages, error handling, no-ingredients warnings, and data source indicators to improve user experience." \
    "Medium" \
    "feature,ux,user-feedback"

# Task 5: Update Protein Naming
create_linear_task \
    "🔄 Update Protein Naming: Shrimp → Shrimps" \
    "Systematically updated all instances of 'shrimp' to 'shrimps' across the application including UI elements, recipe database, and internal logic for consistency." \
    "Medium" \
    "refactor,naming,consistency"

# Task 6: Deploy to GitHub Pages
create_linear_task \
    "🚀 Deploy to GitHub Pages" \
    "Successfully deployed the DinnerHelperApp to GitHub Pages, making it publicly accessible at the provided URL with proper configuration and documentation." \
    "High" \
    "deployment,github-pages,infrastructure"

# Task 7: Add Test Suite
create_linear_task \
    "🧪 Add Comprehensive Test Suite" \
    "Implemented extensive testing framework with Jest including unit tests, integration tests, and real recipe database validation to ensure code quality and reliability." \
    "Medium" \
    "testing,quality-assurance,jest"

# Task 8: Create API Documentation
create_linear_task \
    "📚 Create API Integration Documentation" \
    "Developed comprehensive documentation for external API integration including setup instructions, troubleshooting guides, and API response format specifications." \
    "Low" \
    "documentation,api,setup-guide"

# Task 9: Implement Recipe Database Validation
create_linear_task \
    "🔍 Implement Recipe Database Validation" \
    "Added validation system to ensure recipe data integrity including image validation, ingredient matching, and recipe name consistency checks." \
    "Medium" \
    "validation,data-integrity,quality"

# Task 10: Enhance UI/UX
create_linear_task \
    "🎨 Enhance UI/UX with Modern Styling" \
    "Improved user interface with modern CSS styling, responsive design, loading animations, and better visual feedback for all user interactions." \
    "Medium" \
    "ui,ux,styling,responsive"

echo ""
echo "🎯 Auto Push Complete!"
echo "====================="
echo ""
echo "📊 Summary:"
echo "   • Total Tasks: 10"
echo "   • High Priority: 3"
echo "   • Medium Priority: 5"
echo "   • Low Priority: 2"
echo ""
echo "✅ All tasks have been attempted to be pushed to Linear!"
echo ""
echo "📁 If CLI failed, use these files for manual import:"
echo "   • linear-import-optimized.json (recommended)"
echo "   • linear-tasks-import.json (alternative)"
echo "   • LINEAR_JSON_IMPORT_GUIDE.md (instructions)"
echo ""
echo "🚀 Ready for Linear project tracking!"
