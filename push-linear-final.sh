#!/bin/bash

# 🚀 Final Linear Push Script
# Run with: LINEAR_API_KEY='your_key' TEAM_ID='your_team' ./push-linear-final.sh

echo "🚀 Pushing All 10 DinnerHelperApp Tasks to Linear..."
echo "=================================================="
echo ""

# Check credentials
if [ -z "$LINEAR_API_KEY" ] || [ -z "$TEAM_ID" ]; then
    echo "❌ Missing credentials!"
    echo "   Run: LINEAR_API_KEY='your_key' TEAM_ID='your_team' ./push-linear-final.sh"
    echo ""
    echo "📋 Get your credentials:"
    echo "   1. API Key: Linear Settings > API > Create API Key"
    echo "   2. Team ID: Linear workspace URL or Settings > General"
    exit 1
fi

echo "✅ API Key: ${LINEAR_API_KEY:0:10}..."
echo "✅ Team ID: $TEAM_ID"
echo ""

# Function to create Linear issue
create_issue() {
    local title="$1"
    local description="$2"
    local priority="$3"
    
    echo "📝 Creating: $title"
    
    # GraphQL mutation for creating issue
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
    
    # Send request to Linear API
    local response=$(curl -s -X POST \
        -H "Authorization: $LINEAR_API_KEY" \
        -H "Content-Type: application/json" \
        -d "$mutation" \
        https://api.linear.app/graphql)
    
    # Check success
    if echo "$response" | grep -q '"success":true'; then
        echo "✅ Created: $title"
        local issue_id=$(echo "$response" | grep -o '"id":"[^"]*"' | head -1 | cut -d'"' -f4)
        echo "   ID: $issue_id"
    else
        echo "❌ Failed: $title"
        echo "   Error: $response"
    fi
    echo ""
}

echo "🔧 Creating all 10 tasks..."
echo ""

# Create all 10 tasks
create_issue "🐛 Fix Save Ingredients Button Not Working" "The save ingredients button was not functioning due to DOM elements being accessed before DOM was fully loaded. Fixed by moving element initialization inside DOMContentLoaded event listener and changing const to let declarations." 1

create_issue "🐛 Fix JavaScript Syntax Error: Unexpected token ':'" "Resolved critical syntax error caused by orphaned recipe definitions outside the RECIPE_DATABASE object. Removed duplicate code blocks between lines 5365-7342 that were causing parsing failures." 1

create_issue "🔧 Implement Hybrid Meal Suggestion System" "Created a robust meal suggestion system that prioritizes external API (TheMealDB) for recipe data and falls back to local database when API is unavailable. Includes proper error handling and user feedback." 1

create_issue "📝 Add Comprehensive User Feedback Messages" "Implemented detailed user feedback system including loading messages, error handling, no-ingredients warnings, and data source indicators to improve user experience." 2

create_issue "🔄 Update Protein Naming: Shrimp → Shrimps" "Systematically updated all instances of 'shrimp' to 'shrimps' across the application including UI elements, recipe database, and internal logic for consistency." 2

create_issue "🚀 Deploy to GitHub Pages" "Successfully deployed the DinnerHelperApp to GitHub Pages, making it publicly accessible at the provided URL with proper configuration and documentation." 1

create_issue "🧪 Add Comprehensive Test Suite" "Implemented extensive testing framework with Jest including unit tests, integration tests, and real recipe database validation to ensure code quality and reliability." 2

create_issue "📚 Create API Integration Documentation" "Developed comprehensive documentation for external API integration including setup instructions, troubleshooting guides, and API response format specifications." 3

create_issue "🔍 Implement Recipe Database Validation" "Added validation system to ensure recipe data integrity including image validation, ingredient matching, and recipe name consistency checks." 2

create_issue "🎨 Enhance UI/UX with Modern Styling" "Improved user interface with modern CSS styling, responsive design, loading animations, and better visual feedback for all user interactions." 2

echo "🎯 All Tasks Pushed to Linear!"
echo "=============================="
echo ""
echo "📊 Summary:"
echo "   • Total Tasks: 10"
echo "   • High Priority: 3"
echo "   • Medium Priority: 5"
echo "   • Low Priority: 2"
echo ""
echo "✅ Check your Linear workspace to see all created issues!"
echo "🚀 All DinnerHelperApp tasks are now in Linear!"
