// Enhanced artist data with pledge levels
const artists = [
    {
        id: 1,
        name: "Sarah Chen",
        category: "visual",
        title: "Digital Art Collection",
        description: "Creating a series of digital artworks exploring themes of nature and technology.",
        image: "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=400&h=300&fit=crop&crop=face",
        profileImage: "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face",
        pledged: 2450,
        goal: 3000,
        supporters: 89,
        daysLeft: 12,
        monthlyPledges: 0,
        pledgeLevels: [
            {
                id: 1,
                name: "Digital Supporter",
                amount: 5,
                description: "Access to digital wallpapers and early previews",
                benefits: ["Digital wallpapers", "Early previews", "Monthly newsletter"],
                supporters: 45
            },
            {
                id: 2,
                name: "Art Collector",
                amount: 15,
                description: "Digital prints + behind-the-scenes content",
                benefits: ["Digital prints", "Behind-the-scenes videos", "Exclusive Discord access"],
                supporters: 23
            },
            {
                id: 3,
                name: "Patron",
                amount: 25,
                description: "Signed limited edition prints + personal thank you",
                benefits: ["Signed prints", "Personal thank you video", "Monthly Q&A sessions"],
                supporters: 12
            },
            {
                id: 4,
                name: "VIP Patron",
                amount: 50,
                description: "Original artwork + exclusive workshops",
                benefits: ["Original artwork", "Exclusive workshops", "Priority commission slots"],
                supporters: 9
            }
        ]
    },
    {
        id: 2,
        name: "Marcus Rodriguez",
        category: "music",
        title: "Jazz Fusion Album",
        description: "Recording my debut jazz fusion album featuring local musicians and original compositions.",
        image: "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=400&h=300&fit=crop",
        profileImage: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face",
        pledged: 1850,
        goal: 5000,
        supporters: 156,
        daysLeft: 8,
        monthlyPledges: 0,
        pledgeLevels: [
            {
                id: 1,
                name: "Music Lover",
                amount: 8,
                description: "Digital downloads of all releases",
                benefits: ["Digital downloads", "Early access to tracks", "Monthly playlist"],
                supporters: 67
            },
            {
                id: 2,
                name: "Concert Goer",
                amount: 20,
                description: "CDs + exclusive live recordings",
                benefits: ["Physical CDs", "Live recordings", "Concert updates"],
                supporters: 34
            },
            {
                id: 3,
                name: "Jazz Enthusiast",
                amount: 35,
                description: "Vinyl records + studio session access",
                benefits: ["Vinyl records", "Studio session access", "Personal thank you"],
                supporters: 28
            },
            {
                id: 4,
                name: "Ultimate Fan",
                amount: 75,
                description: "Private concert + meet & greet",
                benefits: ["Private concert", "Meet & greet", "Exclusive merchandise"],
                supporters: 27
            }
        ]
    },
    {
        id: 3,
        name: "Emma Thompson",
        category: "writing",
        title: "Sci-Fi Novel Series",
        description: "Writing a trilogy of science fiction novels set in a post-climate change world.",
        image: "https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=400&h=300&fit=crop",
        profileImage: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face",
        pledged: 3200,
        goal: 2500,
        supporters: 203,
        daysLeft: 15,
        rewards: [
            { amount: 20, description: "E-book of the first novel" },
            { amount: 45, description: "Paperback + signed bookplate" },
            { amount: 120, description: "Hardcover trilogy set + character sketches" }
        ]
    },
    {
        id: 4,
        name: "David Kim",
        category: "film",
        title: "Short Film: 'Echoes'",
        description: "A psychological thriller short film exploring themes of memory and identity.",
        image: "https://images.unsplash.com/photo-1489599830792-4b3b4c0b0c0c?w=400&h=300&fit=crop",
        profileImage: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop&crop=face",
        pledged: 890,
        goal: 2000,
        supporters: 67,
        daysLeft: 5,
        rewards: [
            { amount: 35, description: "Digital download of the film" },
            { amount: 80, description: "Blu-ray + director's commentary" },
            { amount: 200, description: "Executive producer credit + set visit" }
        ]
    },
    {
        id: 5,
        name: "Lisa Park",
        category: "visual",
        title: "Interactive Art Installation",
        description: "Creating an immersive art installation using light, sound, and motion sensors.",
        image: "https://images.unsplash.com/photo-1541961017774-22349e4a1262?w=400&h=300&fit=crop",
        profileImage: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&h=150&fit=crop&crop=face",
        pledged: 4200,
        goal: 6000,
        supporters: 134,
        daysLeft: 20,
        rewards: [
            { amount: 40, description: "Virtual tour of the installation" },
            { amount: 100, description: "Private viewing session" },
            { amount: 300, description: "Custom interactive piece for your home" }
        ]
    },
    {
        id: 6,
        name: "Alex Johnson",
        category: "music",
        title: "Classical Piano Album",
        description: "Recording a classical piano album featuring works by Chopin and original compositions.",
        image: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400&h=300&fit=crop",
        profileImage: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150&h=150&fit=crop&crop=face",
        pledged: 3100,
        goal: 4000,
        supporters: 178,
        daysLeft: 10,
        rewards: [
            { amount: 25, description: "Digital album download" },
            { amount: 60, description: "CD + handwritten thank you note" },
            { amount: 150, description: "Vinyl + private piano lesson" }
        ]
    }
];

// Platform fee percentage
const PLATFORM_FEE_PERCENTAGE = 5;

// Payment processing simulation
class PaymentProcessor {
    static async processPledge(artistId, pledgeLevelId, paymentMethod) {
        const artist = artists.find(a => a.id === artistId);
        const pledgeLevel = artist.pledgeLevels.find(p => p.id === pledgeLevelId);
        
        if (!artist || !pledgeLevel) {
            throw new Error('Invalid artist or pledge level');
        }
        
        // Calculate fees
        const pledgeAmount = pledgeLevel.amount;
        const platformFee = (pledgeAmount * PLATFORM_FEE_PERCENTAGE) / 100;
        const artistReceives = pledgeAmount - platformFee;
        
        // Simulate payment processing
        const paymentResult = await this.simulatePayment(pledgeAmount, paymentMethod);
        
        if (paymentResult.success) {
            // Update artist stats
            artist.pledged += pledgeAmount;
            artist.supporters += 1;
            pledgeLevel.supporters += 1;
            
            return {
                success: true,
                transactionId: paymentResult.transactionId,
                amount: pledgeAmount,
                platformFee: platformFee,
                artistReceives: artistReceives,
                message: `Successfully pledged $${pledgeAmount} to ${artist.name}`
            };
        } else {
            throw new Error(paymentResult.error);
        }
    }
    
    static async simulatePayment(amount, paymentMethod) {
        // Simulate API call delay
        await new Promise(resolve => setTimeout(resolve, 1500));
        
        // Simulate payment success (90% success rate)
        const success = Math.random() > 0.1;
        
        if (success) {
            return {
                success: true,
                transactionId: 'txn_' + Math.random().toString(36).substr(2, 9),
                amount: amount
            };
        } else {
            return {
                success: false,
                error: 'Payment failed. Please try again.'
            };
        }
    }
}

// Creator Dashboard functionality
class CreatorDashboard {
    static openDashboard(artistId) {
        const artist = artists.find(a => a.id === artistId);
        if (!artist) return;
        
        const dashboardHTML = `
            <div class="dashboard-modal">
                <div class="dashboard-header">
                    <h2>Creator Dashboard - ${artist.name}</h2>
                    <button class="btn-close" onclick="CreatorDashboard.closeDashboard()">×</button>
                </div>
                
                <div class="dashboard-content">
                    <div class="dashboard-stats">
                        <div class="stat-card">
                            <h3>$${artist.pledged.toLocaleString()}</h3>
                            <p>Total Pledged</p>
                        </div>
                        <div class="stat-card">
                            <h3>${artist.supporters}</h3>
                            <p>Supporters</p>
                        </div>
                        <div class="stat-card">
                            <h3>$${((artist.pledged * (100 - PLATFORM_FEE_PERCENTAGE)) / 100).toLocaleString()}</h3>
                            <p>You Receive</p>
                        </div>
                        <div class="stat-card">
                            <h3>${artist.daysLeft}</h3>
                            <p>Days Left</p>
                        </div>
                    </div>
                    
                    <div class="dashboard-sections">
                        <div class="section">
                            <h3>Pledge Levels</h3>
                            <div class="pledge-levels-manager">
                                ${artist.pledgeLevels.map(level => `
                                    <div class="pledge-level-item">
                                        <div class="level-info">
                                            <h4>${level.name} - $${level.amount}/month</h4>
                                            <p>${level.description}</p>
                                            <span class="supporters-count">${level.supporters} supporters</span>
                                        </div>
                                        <div class="level-actions">
                                            <button class="btn-edit" onclick="CreatorDashboard.editPledgeLevel(${artist.id}, ${level.id})">Edit</button>
                                            <button class="btn-delete" onclick="CreatorDashboard.deletePledgeLevel(${artist.id}, ${level.id})">Delete</button>
                                        </div>
                                    </div>
                                `).join('')}
                                <button class="btn-add-level" onclick="CreatorDashboard.addPledgeLevel(${artist.id})">
                                    <i class="fas fa-plus"></i> Add New Pledge Level
                                </button>
                            </div>
                        </div>
                        
                        <div class="section">
                            <h3>Recent Pledges</h3>
                            <div class="recent-pledges">
                                <div class="pledge-item">
                                    <div class="pledge-info">
                                        <strong>John D.</strong>
                                        <span>Pledged $25 to Patron level</span>
                                        <small>2 hours ago</small>
                                    </div>
                                    <span class="pledge-amount">$25</span>
                                </div>
                                <div class="pledge-item">
                                    <div class="pledge-info">
                                        <strong>Sarah M.</strong>
                                        <span>Pledged $15 to Art Collector level</span>
                                        <small>1 day ago</small>
                                    </div>
                                    <span class="pledge-amount">$15</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        // Create modal for dashboard
        const modal = document.createElement('div');
        modal.id = 'creatorDashboardModal';
        modal.className = 'modal';
        modal.innerHTML = dashboardHTML;
        document.body.appendChild(modal);
        
        openModal('creatorDashboardModal');
    }
    
    static closeDashboard() {
        const modal = document.getElementById('creatorDashboardModal');
        if (modal) {
            modal.remove();
        }
    }
    
    static editPledgeLevel(artistId, levelId) {
        const artist = artists.find(a => a.id === artistId);
        const level = artist.pledgeLevels.find(l => l.id === levelId);
        
        const editHTML = `
            <div class="edit-level-modal">
                <h3>Edit Pledge Level</h3>
                <form class="pledge-level-form">
                    <div class="form-group">
                        <label>Level Name</label>
                        <input type="text" value="${level.name}" id="levelName">
                    </div>
                    <div class="form-group">
                        <label>Amount ($/month)</label>
                        <input type="number" value="${level.amount}" id="levelAmount" min="1">
                    </div>
                    <div class="form-group">
                        <label>Description</label>
                        <textarea id="levelDescription">${level.description}</textarea>
                    </div>
                    <div class="form-group">
                        <label>Benefits (one per line)</label>
                        <textarea id="levelBenefits">${level.benefits.join('\n')}</textarea>
                    </div>
                    <div class="form-actions">
                        <button type="button" class="btn-secondary" onclick="CreatorDashboard.closeEditModal()">Cancel</button>
                        <button type="submit" class="btn-primary">Save Changes</button>
                    </div>
                </form>
            </div>
        `;
        
        // Show edit modal
        const editModal = document.createElement('div');
        editModal.id = 'editLevelModal';
        editModal.className = 'modal';
        editModal.innerHTML = editHTML;
        document.body.appendChild(editModal);
        
        openModal('editLevelModal');
    }
    
    static closeEditModal() {
        const modal = document.getElementById('editLevelModal');
        if (modal) {
            modal.remove();
        }
    }
}

// DOM elements
const artistsGrid = document.getElementById('artistsGrid');
const filterButtons = document.querySelectorAll('.filter-btn');
const navLinks = document.querySelectorAll('.nav-link');
const navToggle = document.querySelector('.nav-toggle');
const navMenu = document.querySelector('.nav-menu');

// Initialize the app
document.addEventListener('DOMContentLoaded', function() {
    loadArtists();
    setupEventListeners();
    setupSmoothScrolling();
    setupMobileMenu();
});

// Load artists into the grid
function loadArtists(category = 'all') {
    const filteredArtists = category === 'all' 
        ? artists 
        : artists.filter(artist => artist.category === category);
    
    artistsGrid.innerHTML = '';
    
    filteredArtists.forEach(artist => {
        const artistCard = createArtistCard(artist);
        artistsGrid.appendChild(artistCard);
    });
}

// Create artist card element
function createArtistCard(artist) {
    const progress = (artist.pledged / artist.goal) * 100;
    const isFunded = artist.pledged >= artist.goal;
    
    const card = document.createElement('div');
    card.className = 'artist-card';
    card.onclick = () => openArtistModal(artist);
    
    card.innerHTML = `
        <img src="${artist.image}" alt="${artist.name}" class="artist-image">
        <div class="artist-info">
            <span class="artist-category">${getCategoryName(artist.category)}</span>
            <h3>${artist.name}</h3>
            <p>${artist.title}</p>
            <div class="artist-progress">
                <p>$${artist.pledged.toLocaleString()} of $${artist.goal.toLocaleString()}</p>
                <div class="progress-bar">
                    <div class="progress" style="width: ${Math.min(progress, 100)}%"></div>
                </div>
                <p>${artist.supporters} supporters • ${artist.daysLeft} days left</p>
            </div>
            <div class="artist-actions">
                <button class="btn-pledge" onclick="event.stopPropagation(); openPledgeModal(${artist.id})">
                    ${isFunded ? 'Support' : 'Pledge'}
                </button>
                <button class="btn-view" onclick="event.stopPropagation(); openArtistModal(${artist})">
                    View Project
                </button>
            </div>
        </div>
    `;
    
    return card;
}

// Get category display name
function getCategoryName(category) {
    const categories = {
        'music': 'Music',
        'visual': 'Visual Arts',
        'writing': 'Writing',
        'film': 'Film'
    };
    return categories[category] || category;
}

// Setup event listeners
function setupEventListeners() {
    // Filter buttons
    filterButtons.forEach(button => {
        button.addEventListener('click', () => {
            // Remove active class from all buttons
            filterButtons.forEach(btn => btn.classList.remove('active'));
            // Add active class to clicked button
            button.classList.add('active');
            // Load filtered artists
            const category = button.dataset.category;
            loadArtists(category);
        });
    });
    
    // Form submissions
    document.querySelectorAll('.auth-form').forEach(form => {
        form.addEventListener('submit', handleFormSubmit);
    });
    
    // Modal close on outside click
    window.addEventListener('click', (e) => {
        if (e.target.classList.contains('modal')) {
            closeModal(e.target.id);
        }
    });
}

// Handle form submissions
function handleFormSubmit(e) {
    e.preventDefault();
    const formData = new FormData(e.target);
    
    // Simulate form processing
    const submitButton = e.target.querySelector('button[type="submit"]');
    const originalText = submitButton.textContent;
    submitButton.textContent = 'Processing...';
    submitButton.disabled = true;
    
    setTimeout(() => {
        alert('Thank you! Your submission has been received.');
        closeModal(e.target.closest('.modal').id);
        submitButton.textContent = originalText;
        submitButton.disabled = false;
        e.target.reset();
    }, 1500);
}

// Modal functions
function openModal(modalId) {
    const modal = document.getElementById(modalId);
    modal.style.display = 'block';
    document.body.style.overflow = 'hidden';
}

function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    modal.style.display = 'none';
    document.body.style.overflow = 'auto';
}

function switchModal(fromModalId, toModalId) {
    closeModal(fromModalId);
    openModal(toModalId);
}

// Enhanced artist modal with pledge levels
function openArtistModal(artist) {
    const modalContent = document.getElementById('artistModalContent');
    
    modalContent.innerHTML = `
        <div class="artist-modal-content">
            <div class="artist-modal-header">
                <img src="${artist.profileImage}" alt="${artist.name}" class="artist-profile-image">
                <div class="artist-header-info">
                    <h3>${artist.name}</h3>
                    <p class="artist-category">${getCategoryName(artist.category)}</p>
                    <div class="artist-stats">
                        <span>${artist.supporters} supporters</span>
                        <span>$${artist.pledged.toLocaleString()} pledged</span>
                    </div>
                </div>
                <button class="btn-creator-dashboard" onclick="CreatorDashboard.openDashboard(${artist.id})">
                    <i class="fas fa-cog"></i> Creator Dashboard
                </button>
            </div>
            
            <div class="artist-modal-body">
                <div class="artist-description">
                    <h4>About This Project</h4>
                    <p>${artist.description}</p>
                </div>
                
                <div class="pledge-levels-section">
                    <h4>Choose Your Pledge Level</h4>
                    <div class="pledge-levels-grid">
                        ${artist.pledgeLevels.map(level => `
                            <div class="pledge-level-card" onclick="selectPledgeLevel(${artist.id}, ${level.id})">
                                <div class="level-header">
                                    <h5>${level.name}</h5>
                                    <span class="level-amount">$${level.amount}/month</span>
                                </div>
                                <p class="level-description">${level.description}</p>
                                <div class="level-benefits">
                                    ${level.benefits.map(benefit => `
                                        <div class="benefit-item">
                                            <i class="fas fa-check"></i>
                                            <span>${benefit}</span>
                                        </div>
                                    `).join('')}
                                </div>
                                <div class="level-supporters">
                                    <span>${level.supporters} supporters</span>
                                </div>
                            </div>
                        `).join('')}
                    </div>
                </div>
                
                <div class="payment-section" id="paymentSection" style="display: none;">
                    <h4>Complete Your Pledge</h4>
                    <div class="selected-level-info" id="selectedLevelInfo"></div>
                    
                    <form class="payment-form" id="paymentForm">
                        <div class="form-group">
                            <label>Card Number</label>
                            <input type="text" placeholder="1234 5678 9012 3456" required>
                        </div>
                        <div class="form-row">
                            <div class="form-group">
                                <label>Expiry Date</label>
                                <input type="text" placeholder="MM/YY" required>
                            </div>
                            <div class="form-group">
                                <label>CVV</label>
                                <input type="text" placeholder="123" required>
                            </div>
                        </div>
                        <div class="form-group">
                            <label>Name on Card</label>
                            <input type="text" placeholder="John Doe" required>
                        </div>
                        
                        <div class="fee-breakdown">
                            <div class="fee-item">
                                <span>Pledge Amount:</span>
                                <span id="pledgeAmount">$0</span>
                            </div>
                            <div class="fee-item">
                                <span>Platform Fee (${PLATFORM_FEE_PERCENTAGE}%):</span>
                                <span id="platformFee">$0</span>
                            </div>
                            <div class="fee-item total">
                                <span>Total:</span>
                                <span id="totalAmount">$0</span>
                            </div>
                        </div>
                        
                        <button type="submit" class="btn-primary btn-large">
                            <i class="fas fa-lock"></i>
                            Complete Pledge
                        </button>
                    </form>
                </div>
            </div>
        </div>
    `;
    
    openModal('artistModal');
}

// Select pledge level
function selectPledgeLevel(artistId, levelId) {
    const artist = artists.find(a => a.id === artistId);
    const level = artist.pledgeLevels.find(l => l.id === levelId);
    
    if (!artist || !level) return;
    
    // Update selected level display
    const selectedLevelInfo = document.getElementById('selectedLevelInfo');
    const paymentSection = document.getElementById('paymentSection');
    
    selectedLevelInfo.innerHTML = `
        <div class="selected-level">
            <h5>${level.name}</h5>
            <p>${level.description}</p>
            <span class="amount">$${level.amount}/month</span>
        </div>
    `;
    
    // Update fee breakdown
    const pledgeAmount = level.amount;
    const platformFee = (pledgeAmount * PLATFORM_FEE_PERCENTAGE) / 100;
    const totalAmount = pledgeAmount + platformFee;
    
    document.getElementById('pledgeAmount').textContent = `$${pledgeAmount}`;
    document.getElementById('platformFee').textContent = `$${platformFee.toFixed(2)}`;
    document.getElementById('totalAmount').textContent = `$${totalAmount.toFixed(2)}`;
    
    // Show payment section
    paymentSection.style.display = 'block';
    
    // Scroll to payment section
    paymentSection.scrollIntoView({ behavior: 'smooth' });
    
    // Setup payment form
    setupPaymentForm(artistId, levelId);
}

// Setup payment form
function setupPaymentForm(artistId, levelId) {
    const form = document.getElementById('paymentForm');
    
    form.onsubmit = async (e) => {
        e.preventDefault();
        
        const submitButton = form.querySelector('button[type="submit"]');
        const originalText = submitButton.innerHTML;
        
        submitButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Processing...';
        submitButton.disabled = true;
        
        try {
            const result = await PaymentProcessor.processPledge(artistId, levelId, {
                cardNumber: form.querySelector('input[placeholder*="Card Number"]').value,
                expiryDate: form.querySelector('input[placeholder*="MM/YY"]').value,
                cvv: form.querySelector('input[placeholder*="CVV"]').value,
                name: form.querySelector('input[placeholder*="John Doe"]').value
            });
            
            // Show success message
            showSuccessMessage(result.message);
            
            // Close modal after delay
            setTimeout(() => {
                closeModal('artistModal');
                // Refresh artist display
                loadArtists();
            }, 2000);
            
        } catch (error) {
            showErrorMessage(error.message);
        } finally {
            submitButton.innerHTML = originalText;
            submitButton.disabled = false;
        }
    };
}

// Show success message
function showSuccessMessage(message) {
    const successDiv = document.createElement('div');
    successDiv.className = 'success-message';
    successDiv.innerHTML = `
        <i class="fas fa-check-circle"></i>
        <span>${message}</span>
    `;
    
    document.body.appendChild(successDiv);
    
    setTimeout(() => {
        successDiv.remove();
    }, 5000);
}

// Show error message
function showErrorMessage(message) {
    const errorDiv = document.createElement('div');
    errorDiv.className = 'error-message';
    errorDiv.innerHTML = `
        <i class="fas fa-exclamation-circle"></i>
        <span>${message}</span>
    `;
    
    document.body.appendChild(errorDiv);
    
    setTimeout(() => {
        errorDiv.remove();
    }, 5000);
}

// Open pledge modal
function openPledgeModal(artistId) {
    const artist = artists.find(a => a.id === artistId);
    if (artist) {
        openArtistModal(artist);
    }
}

// Smooth scrolling
function setupSmoothScrolling() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });
}

// Scroll to section
function scrollToSection(sectionId) {
    const section = document.getElementById(sectionId);
    if (section) {
        section.scrollIntoView({
            behavior: 'smooth',
            block: 'start'
        });
    }
}

// Mobile menu
function setupMobileMenu() {
    navToggle.addEventListener('click', () => {
        navMenu.classList.toggle('active');
        navToggle.classList.toggle('active');
    });
    
    // Close mobile menu when clicking on a link
    navLinks.forEach(link => {
        link.addEventListener('click', () => {
            navMenu.classList.remove('active');
            navToggle.classList.remove('active');
        });
    });
}

// Navigation active state
window.addEventListener('scroll', () => {
    const sections = document.querySelectorAll('section[id]');
    const navLinks = document.querySelectorAll('.nav-link');
    
    let current = '';
    sections.forEach(section => {
        const sectionTop = section.offsetTop;
        const sectionHeight = section.clientHeight;
        if (scrollY >= (sectionTop - 200)) {
            current = section.getAttribute('id');
        }
    });
    
    navLinks.forEach(link => {
        link.classList.remove('active');
        if (link.getAttribute('href') === `#${current}`) {
            link.classList.add('active');
        }
    });
});

// Add some animations and effects
function addAnimations() {
    // Animate stats on scroll
    const observerOptions = {
        threshold: 0.5,
        rootMargin: '0px 0px -100px 0px'
    };
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, observerOptions);
    
    // Observe elements for animation
    document.querySelectorAll('.step, .stat, .artist-card').forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(30px)';
        el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        observer.observe(el);
    });
}

// Initialize animations
setTimeout(addAnimations, 100);

// Add loading animation
window.addEventListener('load', () => {
    document.body.classList.add('loaded');
});

// Utility functions
function formatCurrency(amount) {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD'
    }).format(amount);
}

function formatNumber(num) {
    return new Intl.NumberFormat('en-US').format(num);
}

// Add some interactive features
document.addEventListener('DOMContentLoaded', () => {
    // Add hover effects to cards
    const cards = document.querySelectorAll('.artist-card');
    cards.forEach(card => {
        card.addEventListener('mouseenter', () => {
            card.style.transform = 'translateY(-10px) scale(1.02)';
        });
        
        card.addEventListener('mouseleave', () => {
            card.style.transform = 'translateY(0) scale(1)';
        });
    });
    
    // Add parallax effect to hero section
    window.addEventListener('scroll', () => {
        const scrolled = window.pageYOffset;
        const hero = document.querySelector('.hero');
        if (hero) {
            const rate = scrolled * -0.5;
            hero.style.transform = `translateY(${rate}px)`;
        }
    });
});

// Add keyboard navigation for modals
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        const openModals = document.querySelectorAll('.modal[style*="block"]');
        openModals.forEach(modal => {
            closeModal(modal.id);
        });
    }
});

// Add touch gestures for mobile
let touchStartY = 0;
let touchEndY = 0;

document.addEventListener('touchstart', (e) => {
    touchStartY = e.changedTouches[0].screenY;
});

document.addEventListener('touchend', (e) => {
    touchEndY = e.changedTouches[0].screenY;
    handleSwipe();
});

function handleSwipe() {
    const swipeThreshold = 50;
    const diff = touchStartY - touchEndY;
    
    if (Math.abs(diff) > swipeThreshold) {
        if (diff > 0) {
            // Swipe up - could be used for navigation
            console.log('Swipe up detected');
        } else {
            // Swipe down - could be used for closing modals
            const openModals = document.querySelectorAll('.modal[style*="block"]');
            openModals.forEach(modal => {
                closeModal(modal.id);
            });
        }
    }
} 