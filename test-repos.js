// Test script to check repository data
async function testRepositories() {
  try {
    console.log('🔍 Testing repository API...')
    
    const response = await fetch('/api/repositories')
    const repos = await response.json()
    
    console.log(`📊 Found ${repos.length} repositories:`)
    
    repos.forEach((repo, index) => {
      console.log(`${index + 1}. ${repo.full_name} (${repo.name})`)
      console.log(`   Owner: ${repo.owner.login}`)
      console.log(`   URL: ${repo.html_url}`)
      console.log('')
    })
    
    // Check for the specific repository
    const targetRepo = repos.find(r => r.name === 'ulimate-blueprint-pilot')
    if (targetRepo) {
      console.log('✅ Found target repository:')
      console.log(`   Full name: ${targetRepo.full_name}`)
      console.log(`   Expected URL: /${targetRepo.full_name}`)
    } else {
      console.log('❌ Target repository not found in list')
    }
    
  } catch (error) {
    console.error('❌ Error testing repositories:', error)
  }
}

// Run the test
testRepositories() 