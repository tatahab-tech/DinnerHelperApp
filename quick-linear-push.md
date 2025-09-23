# 🚀 Quick Linear Push - 3 Easy Steps

## Step 1: Get Your Linear API Key (2 minutes)
1. Go to [Linear Settings > API](https://linear.app/settings/api)
2. Click "Create API Key"
3. Copy the key (starts with `lin_api_...`)

## Step 2: Get Your Team ID (1 minute)
1. Go to your Linear workspace
2. Look at the URL: `https://linear.app/your-team-name/...`
3. Or go to Settings > General > Team ID

## Step 3: Run This Command
```bash
cd /Users/tatiana/Desktop/DinnerHelperApp
LINEAR_API_KEY='your_key_here' TEAM_ID='your_team_id_here' ./push-to-linear-now.sh
```

## 🎯 That's It!
All 10 tasks will be automatically created in Linear with:
- ✅ Complete descriptions
- ✅ Proper priorities
- ✅ Technical details
- ✅ Issue IDs for tracking

## 📋 Alternative: Manual Import
If you prefer, use `linear-import-optimized.json` with Linear's import feature.

**Ready to push all 10 DinnerHelperApp tasks to Linear!** 🚀
