#!/usr/bin/env node

// 🚀 Push to Linear using Node.js and the JSON file
const fs = require('fs');
const https = require('https');

// Read the JSON file
const tasksData = JSON.parse(fs.readFileSync('linear-import-optimized.json', 'utf8'));

console.log('🚀 Pushing Tasks to Linear...');
console.log('=============================');
console.log('');

// Check for API key
const apiKey = process.env.LINEAR_API_KEY;
const teamId = process.env.TEAM_ID;

if (!apiKey || !teamId) {
    console.log('❌ Missing credentials!');
    console.log('   Set: LINEAR_API_KEY and TEAM_ID environment variables');
    console.log('');
    console.log('📋 Get your credentials:');
    console.log('   1. API Key: Linear Settings > API > Create API Key');
    console.log('   2. Team ID: Linear workspace URL or Settings > General');
    process.exit(1);
}

console.log(`✅ API Key: ${apiKey.substring(0, 10)}...`);
console.log(`✅ Team ID: ${teamId}`);
console.log('');

// Function to create Linear issue
function createLinearIssue(task) {
    return new Promise((resolve, reject) => {
        const mutation = {
            query: `mutation IssueCreate($input: IssueCreateInput!) {
                issueCreate(input: $input) {
                    success
                    issue {
                        id
                        title
                        url
                    }
                }
            }`,
            variables: {
                input: {
                    title: task.title,
                    description: task.description,
                    teamId: teamId,
                    priority: task.priority
                }
            }
        };

        const postData = JSON.stringify(mutation);

        const options = {
            hostname: 'api.linear.app',
            port: 443,
            path: '/graphql',
            method: 'POST',
            headers: {
                'Authorization': apiKey,
                'Content-Type': 'application/json',
                'Content-Length': Buffer.byteLength(postData)
            }
        };

        const req = https.request(options, (res) => {
            let data = '';
            res.on('data', (chunk) => {
                data += chunk;
            });
            res.on('end', () => {
                try {
                    const response = JSON.parse(data);
                    if (response.data && response.data.issueCreate.success) {
                        resolve({
                            success: true,
                            issue: response.data.issueCreate.issue
                        });
                    } else {
                        reject(new Error(JSON.stringify(response)));
                    }
                } catch (e) {
                    reject(new Error(`Parse error: ${e.message}`));
                }
            });
        });

        req.on('error', (e) => {
            reject(new Error(`Request error: ${e.message}`));
        });

        req.write(postData);
        req.end();
    });
}

// Push all tasks
async function pushAllTasks() {
    console.log('🔧 Creating all 10 tasks...');
    console.log('');

    let successCount = 0;
    let failCount = 0;

    for (const task of tasksData.issues) {
        try {
            console.log(`📝 Creating: ${task.title}`);
            const result = await createLinearIssue(task);
            console.log(`✅ Created: ${result.issue.title}`);
            console.log(`   ID: ${result.issue.id}`);
            console.log(`   URL: ${result.issue.url}`);
            console.log('');
            successCount++;
        } catch (error) {
            console.log(`❌ Failed: ${task.title}`);
            console.log(`   Error: ${error.message}`);
            console.log('');
            failCount++;
        }
    }

    console.log('🎯 Push Complete!');
    console.log('=================');
    console.log(`✅ Successfully created: ${successCount} tasks`);
    console.log(`❌ Failed: ${failCount} tasks`);
    console.log('');
    console.log('🚀 Check your Linear workspace to see all created issues!');
}

// Run the push
pushAllTasks().catch(console.error);
