// Domain Availability Checker for Pledgr
// This script checks domain availability using a simple method

const domainOptions = [
    'pledgr.com',
    'pledgr.net',
    'pledgr.org',
    'pledgr.io',
    'pledgr.co',
    'pledgr.app',
    'pledgr.art',
    'pledgr.creators',
    'pledgr.support',
    'pledgr.fund',
    'pledgr.me',
    'pledgr.tech',
    'pledgr.digital',
    'pledgr.space',
    'pledgr.world',
    'pledgr.studio',
    'pledgr.works',
    'pledgr.media',
    'pledgr.creative',
    'pledgr.artists'
];

// Alternative names
const alternativeNames = [
    'pledgeart.com',
    'pledgeart.net',
    'pledgeart.org',
    'pledgeart.io',
    'pledgeart.co',
    'pledgeart.app',
    'pledgeart.art',
    'pledgeart.creators',
    'pledgeart.support',
    'pledgeart.fund',
    'pledgeart.me',
    'pledgeart.tech',
    'pledgeart.digital',
    'pledgeart.space',
    'pledgeart.world',
    'pledgeart.studio',
    'pledgeart.works',
    'pledgeart.media',
    'pledgeart.creative',
    'pledgeart.artists'
];

// Creative variations
const creativeVariations = [
    'pledgrr.com',
    'pledgrr.net',
    'pledgrr.org',
    'pledgrr.io',
    'pledgrr.co',
    'pledgrr.app',
    'pledgrr.art',
    'pledgrr.creators',
    'pledgrr.support',
    'pledgrr.fund',
    'pledgrr.me',
    'pledgrr.tech',
    'pledgrr.digital',
    'pledgrr.space',
    'pledgrr.world',
    'pledgrr.studio',
    'pledgrr.works',
    'pledgrr.media',
    'pledgrr.creative',
    'pledgrr.artists'
];

// Short variations
const shortVariations = [
    'plgr.com',
    'plgr.net',
    'plgr.org',
    'plgr.io',
    'plgr.co',
    'plgr.app',
    'plgr.art',
    'plgr.creators',
    'plgr.support',
    'plgr.fund',
    'plgr.me',
    'plgr.tech',
    'plgr.digital',
    'plgr.space',
    'plgr.world',
    'plgr.studio',
    'plgr.works',
    'plgr.media',
    'plgr.creative',
    'plgr.artists'
];

// Check domain availability using DNS lookup
async function checkDomainAvailability(domain) {
    try {
        // This is a simplified check - in reality you'd use a proper domain API
        const response = await fetch(`https://dns.google/resolve?name=${domain}`);
        const data = await response.json();
        
        // If no answer, domain might be available
        return data.Answer === undefined || data.Answer.length === 0;
    } catch (error) {
        console.log(`Error checking ${domain}:`, error.message);
        return false;
    }
}

// Display results in a nice format
function displayResults(availableDomains, category) {
    console.log(`\n🎯 ${category}:`);
    console.log('='.repeat(50));
    
    if (availableDomains.length === 0) {
        console.log('❌ No available domains found');
    } else {
        availableDomains.forEach(domain => {
            console.log(`✅ ${domain} - Available!`);
        });
    }
}

// Main function to check all domains
async function checkAllDomains() {
    console.log('🔍 Checking domain availability for Pledgr...\n');
    
    const allDomains = [
        { list: domainOptions, name: 'Primary Pledgr Domains' },
        { list: alternativeNames, name: 'Alternative Names' },
        { list: creativeVariations, name: 'Creative Variations' },
        { list: shortVariations, name: 'Short Variations' }
    ];
    
    for (const category of allDomains) {
        const available = [];
        
        for (const domain of category.list) {
            const isAvailable = await checkDomainAvailability(domain);
            if (isAvailable) {
                available.push(domain);
            }
            // Small delay to avoid rate limiting
            await new Promise(resolve => setTimeout(resolve, 100));
        }
        
        displayResults(available, category.name);
    }
    
    console.log('\n💡 Recommendation:');
    console.log('1. Check .com domains first (most recognized)');
    console.log('2. Consider .art, .creators, or .support for niche appeal');
    console.log('3. .io domains are popular with tech companies');
    console.log('4. .co domains are good alternatives to .com');
    
    console.log('\n🔗 Domain Registrars to Check:');
    console.log('- Namecheap.com (often cheaper)');
    console.log('- GoDaddy.com (popular)');
    console.log('- Google Domains (clean interface)');
    console.log('- Cloudflare Domains (good security)');
}

// Manual domain check function
async function checkSpecificDomain(domain) {
    console.log(`🔍 Checking ${domain}...`);
    const isAvailable = await checkDomainAvailability(domain);
    
    if (isAvailable) {
        console.log(`✅ ${domain} appears to be available!`);
        console.log('💡 Double-check on a domain registrar before purchasing.');
    } else {
        console.log(`❌ ${domain} appears to be taken.`);
        console.log('💡 Try variations or different TLDs.');
    }
}

// Export functions for use
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { checkAllDomains, checkSpecificDomain };
}

// Run if called directly
if (typeof window === 'undefined') {
    checkAllDomains();
} 