// Test script to verify Keystatic Cloud setup
// Run with: node test-keystatic-setup.js

console.log('🔍 Checking Keystatic Cloud Configuration...\n');

// Check environment variables
const requiredEnvVars = [
  'KEYSTATIC_SECRET',
  'KEYSTATIC_GITHUB_CLIENT_ID', 
  'KEYSTATIC_GITHUB_CLIENT_SECRET',
  'NEXT_PUBLIC_BASE_URL'
];

let missingVars = [];

requiredEnvVars.forEach(varName => {
  const value = process.env[varName];
  if (!value || value.includes('your-') || value.includes('here')) {
    missingVars.push(varName);
    console.log(`❌ ${varName}: Missing or placeholder value`);
  } else {
    console.log(`✅ ${varName}: Set (${value.substring(0, 10)}...)`);
  }
});

console.log('\n📋 Setup Status:');

if (missingVars.length === 0) {
  console.log('✅ All environment variables are configured!');
  console.log('\n🚀 Next steps:');
  console.log('1. Make sure your GitHub OAuth app callback URL is set to:');
  console.log(`   ${process.env.NEXT_PUBLIC_BASE_URL}/api/keystatic/cloud/oauth/callback`);
  console.log('2. Deploy to Vercel with the same environment variables');
  console.log('3. Test by visiting /keystatic on your deployed site');
} else {
  console.log(`❌ Missing ${missingVars.length} environment variable(s):`);
  missingVars.forEach(varName => {
    console.log(`   - ${varName}`);
  });
  console.log('\n📖 Please follow the setup guide in setup-keystatic-cloud.md');
}

console.log('\n🔗 Useful links:');
console.log('- Create GitHub OAuth App: https://github.com/settings/applications/new');
console.log('- Vercel Environment Variables: https://vercel.com/dashboard');
console.log('- Generate secret key: openssl rand -base64 32');