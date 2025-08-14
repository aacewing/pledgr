// User Authentication System
console.log('🚀 Pledgr script loading...');

// Test modal function
window.testModal = function() {
    console.log('Testing modal function...');
    const modal = document.getElementById('signupModal');
    if (modal) {
        console.log('Modal found, opening...');
        modal.style.display = 'block';
    } else {
        console.log('Modal not found!');
    }
};

class UserAuth {
    static currentUser = null;
    static token = localStorage.getItem('pledgr_token');

    // Initialize user system
    static async init() {
        if (this.token) {
            try {
                const apiUrl = window.location.hostname === 'pledgr.art' 
                    ? 'https://pledgr.onrender.com/api/auth/me'
                    : '/api/auth/me';
                
                const response = await fetch(apiUrl, {
                    headers: {
                        'Authorization': `Bearer ${this.token}`
                    }
                });
                
                if (response.ok) {
                    const data = await response.json();
                    this.currentUser = data.user;
                } else {
                    // Token is invalid, clear it
                    this.logout();
                }
            } catch (error) {
                console.log('Backend unavailable, using offline mode');
                // In offline mode, we'll use a demo user
                this.currentUser = {
                    id: 1,
                    name: 'Demo User',
                    email: 'demo@pledgr.art',
                    avatar: null,
                    isCreator: false
                };
            }
        }
        
        this.updateUI();
    }

    // Register new user
    static async register(userData) {
        try {
                            const apiUrl = window.location.hostname === 'pledgr.art' 
                    ? 'https://pledgr.onrender.com/api/auth/register'
                    : '/api/auth/register';
            
            const response = await fetch(apiUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(userData)
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Registration failed');
            }

            // Store token and user data
            this.token = data.token;
            this.currentUser = data.user;
            localStorage.setItem('pledgr_token', this.token);
            
            this.updateUI();
            return data.user;
        } catch (error) {
            console.log('Backend unavailable, using offline mode');
            // Create demo user for offline mode
            this.currentUser = {
                id: 1,
                name: userData.name,
                email: userData.email,
                avatar: null,
                isCreator: false
            };
            this.token = 'demo-token-' + Date.now();
            localStorage.setItem('pledgr_token', this.token);
            
            this.updateUI();
            return this.currentUser;
        }
    }

    // Login user
    static async login(email, password) {
        try {
                            const apiUrl = window.location.hostname === 'pledgr.art' 
                    ? 'https://pledgr.onrender.com/api/auth/login'
                    : '/api/auth/login';
            
            const response = await fetch(apiUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ email, password })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Login failed');
            }

            // Store token and user data
            this.token = data.token;
            this.currentUser = data.user;
            localStorage.setItem('pledgr_token', this.token);
            
            this.updateUI();
            return data.user;
        } catch (error) {
            console.log('Backend unavailable, using offline mode');
            // Create demo user for offline mode
            this.currentUser = {
                id: 1,
                name: 'Demo User',
                email: email,
                avatar: null,
                isCreator: false
            };
            this.token = 'demo-token-' + Date.now();
            localStorage.setItem('pledgr_token', this.token);
            
            this.updateUI();
            return this.currentUser;
        }
    }

    // Logout user
    static logout() {
        this.currentUser = null;
        this.token = null;
        localStorage.removeItem('pledgr_token');
        this.updateUI();
    }

    // Update user profile
    static async updateProfile(userData) {
        if (!this.currentUser) return false;

        try {
            const apiUrl = window.location.hostname === 'pledgr.art' 
            ? 'https://pledgr.onrender.com/api/auth/profile'
            : '/api/auth/profile';
        const response = await fetch(apiUrl, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${this.token}`
                },
                body: JSON.stringify(userData)
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Failed to update profile');
            }

            // Update current user data
            this.currentUser = { ...this.currentUser, ...userData };
            return true;
        } catch (error) {
            console.error('Failed to update profile:', error);
            return false;
        }
    }

    // Make user a creator
    static async becomeCreator(creatorData) {
        if (!this.currentUser) return false;

        try {
            const apiUrl = window.location.hostname === 'pledgr.art' 
            ? 'https://pledgr.onrender.com/api/artists'
            : '/api/artists';
        const response = await fetch(apiUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${this.token}`
                },
                body: JSON.stringify(creatorData)
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Failed to become creator');
            }

            // Update current user to be a creator
            this.currentUser.isCreator = true;
            return true;
        } catch (error) {
            console.error('Failed to become creator:', error);
            return false;
        }
    }

    // Add pledge to user's pledges
    static async addPledge(pledgeData) {
        if (!this.currentUser) return false;

        try {
            const apiUrl = window.location.hostname === 'pledgr.art' 
                ? 'https://pledgr.onrender.com/api/pledges'
                : '/api/pledges';
            const response = await fetch(apiUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${this.token}`
                },
                body: JSON.stringify(pledgeData)
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Failed to create pledge');
            }

            return data.pledgeId;
        } catch (error) {
            console.error('Failed to create pledge:', error);
            return false;
        }
    }

    // Get user pledges
    static async getPledges() {
        if (!this.currentUser) return [];

        try {
            const apiUrl = window.location.hostname === 'pledgr.art' 
                ? 'https://pledgr.onrender.com/api/pledges'
                : '/api/pledges';
            const response = await fetch(apiUrl, {
                headers: {
                    'Authorization': `Bearer ${this.token}`
                }
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Failed to get pledges');
            }

            return data.pledges || [];
        } catch (error) {
            console.error('Failed to get pledges:', error);
            return [];
        }
    }

    // Update UI based on authentication state
    static updateUI() {
        const navMenu = document.querySelector('.nav-menu');
        const authButton = navMenu.querySelector('.btn-primary');

        if (this.currentUser) {
            // User is logged in
            authButton.style.display = 'none';
            
            // Create user menu if it doesn't exist
            if (!document.querySelector('.user-menu')) {
                const userMenu = this.createUserMenu();
                navMenu.appendChild(userMenu);
            } else {
                // Update existing user menu
                const userAvatar = document.querySelector('.user-avatar img');
                const userName = document.querySelector('.user-name');
                if (userAvatar) userAvatar.src = this.currentUser.avatar;
                if (userName) userName.textContent = this.currentUser.name;
            }
        } else {
            // User is not logged in
            authButton.style.display = 'block';
            authButton.textContent = 'Sign In';
            authButton.onclick = () => openModal('loginModal');
            
            // Remove user menu if it exists
            const userMenu = document.querySelector('.user-menu');
            if (userMenu) {
                userMenu.remove();
            }
        }
    }

    // Create user menu element
    static createUserMenu() {
        const userMenu = document.createElement('div');
        userMenu.className = 'user-menu';
        userMenu.innerHTML = `
            <button class="btn-secondary btn-small" onclick="ArtPoster.showArtPostModal()">
                <i class="fas fa-plus"></i> Post Art
            </button>
            <div class="user-avatar">
                <img src="${this.currentUser.avatar}" alt="${this.currentUser.name}">
            </div>
            <div class="user-dropdown">
                <div class="user-info">
                    <span class="user-name">${this.currentUser.name}</span>
                    <span class="user-email">${this.currentUser.email}</span>
                    ${this.currentUser.isCreator ? '<span class="creator-badge">🎨 Artist</span>' : ''}
                </div>
                <div class="dropdown-menu">
                    <a href="#" onclick="UserAuth.openProfile()">
                        <i class="fas fa-user"></i> Profile
                    </a>
                    <a href="#" onclick="UserAuth.openPledges()">
                        <i class="fas fa-heart"></i> My Pledges
                    </a>
                    ${!this.currentUser.isCreator ? `
                        <a href="#" onclick="ArtistProfileCreator.showArtistSetupModal()">
                            <i class="fas fa-palette"></i> Become Artist
                        </a>
                    ` : `
                        <a href="#" onclick="UserAuth.openCreatorDashboard()">
                            <i class="fas fa-cog"></i> Creator Dashboard
                        </a>
                    `}
                    <a href="#" onclick="UserAuth.logout()">
                        <i class="fas fa-sign-out-alt"></i> Sign Out
                    </a>
                </div>
            </div>
        `;

        // Add click event to toggle dropdown
        userMenu.addEventListener('click', this.toggleUserMenu);
        
        return userMenu;
    }

    // Toggle user dropdown menu
    static toggleUserMenu(e) {
        e.stopPropagation();
        const dropdown = e.currentTarget.querySelector('.user-dropdown');
        dropdown.classList.toggle('active');
    }

    // Open profile modal
    static openProfile() {
        this.createProfileModal();
        openModal('profileModal');
    }

    // Open pledges modal
    static async openPledges() {
        const pledges = await this.getPledges();
        this.createPledgesModal(pledges);
        openModal('pledgesModal');
    }

    // Open become creator modal
    static openBecomeCreator() {
        this.createBecomeCreatorModal();
        openModal('becomeCreatorModal');
    }

    // Open creator dashboard
    static openCreatorDashboard() {
        // This would open the creator dashboard
        console.log('Opening creator dashboard...');
    }

    // Create profile modal
    static createProfileModal() {
        if (document.getElementById('profileModal')) return;

        const modal = document.createElement('div');
        modal.id = 'profileModal';
        modal.className = 'modal';
        modal.innerHTML = `
            <div class="modal-content">
                <span class="close" onclick="closeModal('profileModal')">&times;</span>
                <h2>Edit Profile</h2>
                <form id="profileForm" class="auth-form">
                    <div class="form-group">
                        <label for="profileName">Full Name</label>
                        <input type="text" id="profileName" value="${this.currentUser.name}" required>
                    </div>
                    <div class="form-group">
                        <label for="profileBio">Bio</label>
                        <textarea id="profileBio" rows="3">${this.currentUser.bio || ''}</textarea>
                    </div>
                    <div class="form-group">
                        <label for="profileWebsite">Website</label>
                        <input type="url" id="profileWebsite" value="${this.currentUser.website || ''}">
                    </div>
                    <div class="form-group">
                        <label>Social Media</label>
                        <input type="text" id="profileTwitter" placeholder="Twitter" value="${this.currentUser.social_twitter || ''}">
                        <input type="text" id="profileInstagram" placeholder="Instagram" value="${this.currentUser.social_instagram || ''}">
                        <input type="text" id="profileYoutube" placeholder="YouTube" value="${this.currentUser.social_youtube || ''}">
                    </div>
                    <button type="submit" class="btn-primary">Update Profile</button>
                </form>
            </div>
        `;

        document.body.appendChild(modal);

        // Handle form submission
        document.getElementById('profileForm').addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const formData = {
                name: document.getElementById('profileName').value,
                bio: document.getElementById('profileBio').value,
                website: document.getElementById('profileWebsite').value,
                social: {
                    twitter: document.getElementById('profileTwitter').value,
                    instagram: document.getElementById('profileInstagram').value,
                    youtube: document.getElementById('profileYoutube').value
                }
            };

            const success = await this.updateProfile(formData);
            if (success) {
                closeModal('profileModal');
                showSuccessMessage('Profile updated successfully!');
            } else {
                showErrorMessage('Failed to update profile');
            }
        });
    }

    // Create pledges modal
    static createPledgesModal(pledges) {
        if (document.getElementById('pledgesModal')) {
            document.getElementById('pledgesModal').remove();
        }

        const modal = document.createElement('div');
        modal.id = 'pledgesModal';
        modal.className = 'modal';
        modal.innerHTML = `
            <div class="modal-content">
                <span class="close" onclick="closeModal('pledgesModal')">&times;</span>
                <h2>My Pledges</h2>
                <div class="pledges-list">
                    ${pledges.length === 0 ? '<p>No pledges yet. Start supporting artists!</p>' : 
                        pledges.map(pledge => `
                            <div class="pledge-item">
                                <img src="${pledge.artist_image}" alt="${pledge.artist_name}" class="pledge-artist-image">
                                <div class="pledge-info">
                                    <h4>${pledge.artist_name}</h4>
                                    <p>${pledge.level_name} - $${pledge.amount}</p>
                                    <small>Pledged on ${new Date(pledge.created_at).toLocaleDateString()}</small>
                                </div>
                                <button class="btn-cancel" onclick="UserAuth.cancelPledge(${pledge.id})">
                                    Cancel
                                </button>
                            </div>
                        `).join('')
                    }
                </div>
            </div>
        `;

        document.body.appendChild(modal);
    }

    // Create become creator modal
    static createBecomeCreatorModal() {
        if (document.getElementById('becomeCreatorModal')) return;

        const modal = document.createElement('div');
        modal.id = 'becomeCreatorModal';
        modal.className = 'modal';
        modal.innerHTML = `
            <div class="modal-content">
                <span class="close" onclick="closeModal('becomeCreatorModal')">&times;</span>
                <h2>Become a Creator</h2>
                <form id="becomeCreatorForm" class="auth-form">
                    <div class="form-group">
                        <label for="creatorName">Artist/Creator Name</label>
                        <input type="text" id="creatorName" required>
                    </div>
                    <div class="form-group">
                        <label for="creatorTitle">Project Title</label>
                        <input type="text" id="creatorTitle" required>
                    </div>
                    <div class="form-group">
                        <label for="creatorCategory">Category</label>
                        <select id="creatorCategory" required>
                            <option value="">Select Category</option>
                            <option value="music">Music</option>
                            <option value="visual">Visual Arts</option>
                            <option value="writing">Writing</option>
                            <option value="film">Film</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label for="creatorDescription">Project Description</label>
                        <textarea id="creatorDescription" rows="4" required></textarea>
                    </div>
                    <div class="form-group">
                        <label for="creatorGoal">Funding Goal ($)</label>
                        <input type="number" id="creatorGoal" min="1" required>
                    </div>
                    <div class="form-group">
                        <label for="creatorImage">Project Image URL</label>
                        <input type="url" id="creatorImage" placeholder="https://example.com/image.jpg">
                    </div>
                    <button type="submit" class="btn-primary">Create Project</button>
                </form>
            </div>
        `;

        document.body.appendChild(modal);

        // Handle form submission
        document.getElementById('becomeCreatorForm').addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const formData = {
                name: document.getElementById('creatorName').value,
                title: document.getElementById('creatorTitle').value,
                category: document.getElementById('creatorCategory').value,
                description: document.getElementById('creatorDescription').value,
                goal: parseFloat(document.getElementById('creatorGoal').value),
                image: document.getElementById('creatorImage').value || 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=400&h=300&fit=crop'
            };

            const success = await this.becomeCreator(formData);
            if (success) {
                closeModal('becomeCreatorModal');
                showSuccessMessage('Creator profile created successfully!');
                // Refresh the page to show the new creator profile
                setTimeout(() => location.reload(), 1500);
            } else {
                showErrorMessage('Failed to create creator profile');
            }
        });
    }

    // Cancel pledge
    static async cancelPledge(pledgeId) {
        if (!confirm('Are you sure you want to cancel this pledge?')) return;

        try {
            const response = await fetch(`/api/pledges/${pledgeId}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${this.token}`
                }
            });

            if (response.ok) {
                showSuccessMessage('Pledge cancelled successfully');
                // Refresh pledges modal
                this.openPledges();
            } else {
                showErrorMessage('Failed to cancel pledge');
            }
        } catch (error) {
            console.error('Failed to cancel pledge:', error);
            showErrorMessage('Failed to cancel pledge');
        }
    }
}

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
        // Check if user is logged in
        if (!UserAuth.currentUser) {
            throw new Error('Please sign in to make a pledge');
        }
        
        const artist = artists.find(a => a.id === artistId);
        const pledgeLevel = artist.pledgeLevels.find(p => p.id === pledgeLevelId);
        
        if (!artist || !pledgeLevel) {
            throw new Error('Invalid artist or pledge level');
        }
        
        // Calculate fees
        const pledgeAmount = pledgeLevel.amount;
        const platformFee = (pledgeAmount * PLATFORM_FEE_PERCENTAGE) / 100;
        const artistReceives = pledgeAmount - platformFee;
        
        // Use Stripe for real payments
        if (window.StripePaymentProcessor) {
            try {
                const paymentResult = await window.StripePaymentProcessor.processPayment(artistId, pledgeLevelId);
                
                // Add pledge to user's pledges if successful
                if (paymentResult.success) {
                    UserAuth.addPledge({
                        artistId: artistId,
                        artistName: artist.name,
                        levelId: pledgeLevelId,
                        levelName: pledgeLevel.name,
                        amount: pledgeAmount
                    });
                }
                
                return paymentResult;
            } catch (error) {
                // Fallback to simulation if Stripe fails
                console.warn('Stripe failed, using simulation:', error);
                const result = await this.simulatePayment(pledgeAmount, paymentMethod);
                
                // Add pledge to user's pledges if successful
                if (result.success) {
                    UserAuth.addPledge({
                        artistId: artistId,
                        artistName: artist.name,
                        levelId: pledgeLevelId,
                        levelName: pledgeLevel.name,
                        amount: pledgeAmount
                    });
                }
                
                return result;
            }
        } else {
            // Fallback to simulation if Stripe not loaded
            const result = await this.simulatePayment(pledgeAmount, paymentMethod);
            
            // Add pledge to user's pledges if successful
            if (result.success) {
                UserAuth.addPledge({
                    artistId: artistId,
                    artistName: artist.name,
                    levelId: pledgeLevelId,
                    levelName: pledgeLevel.name,
                    amount: pledgeAmount
                });
            }
            
            return result;
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

// Artist Profile Creation System
class ArtistProfileCreator {
    static async createArtistProfile(profileData) {
        try {
            const apiUrl = window.location.hostname === 'pledgr.art' 
                ? 'https://pledgr.onrender.com/api/artists'
                : '/api/artists';
            
            const response = await fetch(apiUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${UserAuth.token}`
                },
                body: JSON.stringify(profileData)
            });

            if (response.ok) {
                const data = await response.json();
                return data;
            } else {
                const error = await response.json();
                throw new Error(error.error || 'Failed to create artist profile');
            }
        } catch (error) {
            console.error('Create artist profile error:', error);
            throw error;
        }
    }

    static async createPledgeLevel(artistId, levelData) {
        try {
            const apiUrl = window.location.hostname === 'pledgr.art' 
                ? 'https://pledgr.onrender.com/api/artists'
                : '/api/artists';
            
            const response = await fetch(`${apiUrl}/${artistId}/levels`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${UserAuth.token}`
                },
                body: JSON.stringify(levelData)
            });

            if (response.ok) {
                const data = await response.json();
                return data;
            } else {
                const error = await response.json();
                throw new Error(error.error || 'Failed to create pledge level');
            }
        } catch (error) {
            console.error('Create pledge level error:', error);
            throw error;
        }
    }

    static showArtistSetupModal() {
        if (!UserAuth.currentUser) {
            openModal('loginModal');
            return;
        }

        const modal = document.createElement('div');
        modal.className = 'modal artist-setup-modal';
        modal.innerHTML = `
            <div class="modal-content artist-setup-content">
                <span class="close" onclick="this.parentElement.parentElement.remove()">&times;</span>
                <div class="artist-setup">
                    <h2>🎨 Set Up Your Artist Profile</h2>
                    <p class="setup-subtitle">Create your page and start earning from your art in minutes!</p>
                    
                    <form id="artistSetupForm" class="artist-setup-form">
                        <div class="form-section">
                            <h3>Basic Info</h3>
                            <div class="form-group">
                                <label for="artistName">Artist Name *</label>
                                <input type="text" id="artistName" required placeholder="Your artist name">
                            </div>
                            <div class="form-group">
                                <label for="artistTitle">Page Title *</label>
                                <input type="text" id="artistTitle" required placeholder="e.g., 'Digital Art Collection'">
                            </div>
                            <div class="form-group">
                                <label for="artistCategory">Category *</label>
                                <select id="artistCategory" required>
                                    <option value="">Choose category</option>
                                    <option value="visual">Visual Arts</option>
                                    <option value="music">Music</option>
                                    <option value="writing">Writing</option>
                                    <option value="film">Film & Video</option>
                                    <option value="other">Other</option>
                                </select>
                            </div>
                        </div>

                        <div class="form-section">
                            <h3>Your Story</h3>
                            <div class="form-group">
                                <label for="artistDescription">Description *</label>
                                <textarea id="artistDescription" required rows="4" placeholder="Tell your story and what you create..."></textarea>
                            </div>
                            <div class="form-group">
                                <label for="artistGoal">Monthly Goal (Optional)</label>
                                <input type="number" id="artistGoal" min="0" step="0.01" placeholder="e.g., 500">
                                <small>Set a monthly funding goal to motivate your supporters</small>
                            </div>
                        </div>

                        <div class="form-section">
                            <h3>Support Tiers</h3>
                            <p class="tier-info">Set up 2-3 support levels to get started. You can always add more later!</p>
                            
                            <div id="pledgeLevels">
                                <div class="pledge-level-input" data-level="1">
                                    <h4>Support Level 1</h4>
                                    <div class="level-inputs">
                                        <input type="text" placeholder="Name (e.g., 'Supporter')" class="level-name" required>
                                        <input type="number" placeholder="Amount ($)" min="1" step="0.01" class="level-amount" required>
                                        <textarea placeholder="What do supporters get?" class="level-benefits" rows="2"></textarea>
                                    </div>
                                </div>
                                
                                <div class="pledge-level-input" data-level="2">
                                    <h4>Support Level 2</h4>
                                    <div class="level-inputs">
                                        <input type="text" placeholder="Name (e.g., 'Patron')" class="level-name" required>
                                        <input type="number" placeholder="Amount ($)" min="1" step="0.01" class="level-amount" required>
                                        <textarea placeholder="What do supporters get?" class="level-benefits" rows="2"></textarea>
                                    </div>
                                </div>
                            </div>
                            
                            <button type="button" class="btn-secondary btn-small" onclick="ArtistProfileCreator.addPledgeLevel()">
                                + Add Another Level
                            </button>
                        </div>

                        <div class="form-section">
                            <h3>Profile Image</h3>
                            <div class="form-group">
                                <label for="artistImage">Cover Image URL</label>
                                <input type="url" id="artistImage" placeholder="https://example.com/image.jpg">
                                <small>Add a cover image to make your page look great!</small>
                            </div>
                        </div>

                        <div class="setup-actions">
                            <button type="submit" class="btn-primary btn-large">
                                🚀 Create My Artist Page
                            </button>
                            <p class="setup-note">You'll be able to edit everything later</p>
                        </div>
                    </form>
                </div>
            </div>
        `;

        document.body.appendChild(modal);
        modal.style.display = 'block';
        
        // Setup form submission
        this.setupArtistForm();
    }

    static addPledgeLevel() {
        const levelsContainer = document.getElementById('pledgeLevels');
        const levelCount = levelsContainer.children.length + 1;
        
        const newLevel = document.createElement('div');
        newLevel.className = 'pledge-level-input';
        newLevel.dataset.level = levelCount;
        newLevel.innerHTML = `
            <h4>Support Level ${levelCount}</h4>
            <div class="level-inputs">
                <input type="text" placeholder="Name (e.g., 'VIP')" class="level-name" required>
                <input type="number" placeholder="Amount ($)" min="1" step="0.01" class="level-amount" required>
                <textarea placeholder="What do supporters get?" class="level-benefits" rows="2"></textarea>
            </div>
            <button type="button" class="remove-level" onclick="this.parentElement.remove()">×</button>
        `;
        
        levelsContainer.appendChild(newLevel);
    }

    static setupArtistForm() {
        const form = document.getElementById('artistSetupForm');
        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const submitBtn = form.querySelector('button[type="submit"]');
            const originalText = submitBtn.textContent;
            submitBtn.textContent = 'Creating...';
            submitBtn.disabled = true;
            
            try {
                // Collect form data
                const profileData = {
                    name: document.getElementById('artistName').value,
                    title: document.getElementById('artistTitle').value,
                    category: document.getElementById('artistCategory').value,
                    description: document.getElementById('artistDescription').value,
                    goal: parseFloat(document.getElementById('artistGoal').value) || 0,
                    image: document.getElementById('artistImage').value || null
                };

                // Create artist profile
                const artistResult = await this.createArtistProfile(profileData);
                
                // Create pledge levels
                const levelInputs = document.querySelectorAll('.pledge-level-input');
                for (const levelInput of levelInputs) {
                    const name = levelInput.querySelector('.level-name').value;
                    const amount = parseFloat(levelInput.querySelector('.level-amount').value);
                    const benefits = levelInput.querySelector('.level-benefits').value;
                    
                    if (name && amount) {
                        await this.createPledgeLevel(artistResult.artistId, {
                            name,
                            amount,
                            description: `Support at $${amount}/month`,
                            benefits: benefits || 'Access to exclusive content'
                        });
                    }
                }

                // Show success
                this.showSetupSuccess(artistResult.artistId);
                
            } catch (error) {
                showErrorMessage(error.message);
                submitBtn.textContent = originalText;
                submitBtn.disabled = false;
            }
        });
    }

    static showSetupSuccess(artistId) {
        const modal = document.querySelector('.artist-setup-modal');
        if (!modal) return;

        modal.innerHTML = `
            <div class="modal-content success-content">
                <div class="success-icon">
                    🎉
                </div>
                <h2>Your Artist Page is Live!</h2>
                <p>Congratulations! Your artist profile has been created and is now visible to supporters.</p>
                
                <div class="success-actions">
                    <button class="btn-primary" onclick="window.location.href='/artist/${artistId}'">
                        View My Page
                    </button>
                    <button class="btn-secondary" onclick="this.parentElement.parentElement.parentElement.remove()">
                        Continue
                    </button>
                </div>
                
                <div class="next-steps">
                    <h3>Next Steps:</h3>
                    <ul>
                        <li>🎨 Post your first artwork</li>
                        <li>📢 Share your page with your audience</li>
                        <li>💰 Start receiving support from fans</li>
                        <li>⚙️ Customize your profile further</li>
                    </ul>
                </div>
            </div>
        `;
    }
}

// Quick Start System
class QuickStart {
    static showQuickStart() {
        const modal = document.createElement('div');
        modal.className = 'modal quick-start-modal';
        modal.innerHTML = `
            <div class="modal-content quick-start-content">
                <span class="close" onclick="this.parentElement.parentElement.remove()">&times;</span>
                <div class="quick-start">
                    <h2>🚀 Get Started with Pledgr</h2>
                    <p>Choose how you want to use Pledgr:</p>
                    
                    <div class="quick-start-options">
                        <div class="option-card" onclick="QuickStart.startAsArtist()">
                            <div class="option-icon">🎨</div>
                            <h3>I'm an Artist</h3>
                            <p>Create your profile, post art, and start earning from supporters</p>
                            <button class="btn-primary">Start Creating</button>
                        </div>
                        
                        <div class="option-card" onclick="QuickStart.startAsSupporter()">
                            <div class="option-icon">❤️</div>
                            <h3>I'm a Supporter</h3>
                            <p>Browse artists and support creators you love</p>
                            <button class="btn-primary">Start Browsing</button>
                        </div>
                    </div>
                    
                    <div class="quick-start-features">
                        <h3>Why Pledgr?</h3>
                        <ul>
                            <li>✅ Only 5% platform fee (vs 8-12% elsewhere)</li>
                            <li>✅ Instant PayPal payments</li>
                            <li>✅ Simple setup in minutes</li>
                            <li>✅ Beautiful, mobile-friendly profiles</li>
                        </ul>
                    </div>
                </div>
            </div>
        `;

        document.body.appendChild(modal);
        modal.style.display = 'block';
    }

    static startAsArtist() {
        if (!UserAuth.currentUser) {
            openModal('signupModal');
            return;
        }
        
        // Close quick start modal
        const modal = document.querySelector('.quick-start-modal');
        if (modal) modal.remove();
        
        // Show artist setup
        ArtistProfileCreator.showArtistSetupModal();
    }

    static startAsSupporter() {
        // Close quick start modal
        const modal = document.querySelector('.quick-start-modal');
        if (modal) modal.remove();
        
        // Scroll to artists section
        scrollToSection('artists');
    }
}

// DOM elements
const artistsGrid = document.getElementById('artistsGrid');
const filterButtons = document.querySelectorAll('.filter-btn');
const navLinks = document.querySelectorAll('.nav-link');
const navToggle = document.querySelector('.nav-toggle');
const navMenu = document.querySelector('.nav-menu');

// Initialize the app
document.addEventListener('DOMContentLoaded', async function() {
    loadArtists();
    setupEventListeners();
    setupSmoothScrolling();
    setupMobileMenu();
    await UserAuth.init(); // Initialize user authentication
});

// Fallback artist data when backend is unavailable
const FALLBACK_ARTISTS = [
    {
        id: 1,
        name: "Sarah Chen",
        category: "visual",
        title: "Digital Art Collection",
        description: "Creating stunning digital artwork that pushes the boundaries of imagination and technology.",
        image: "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=400&h=300&fit=crop&crop=face",
        profileImage: "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face",
        pledged: 2450,
        goal: 3000,
        supporters: 47,
        daysLeft: 15,
        pledgeLevels: [
            {
                id: 1,
                name: "Supporter",
                amount: 5,
                description: "Basic support level",
                benefits: ["Access to WIP posts", "Monthly newsletter"],
                supporters: 23
            },
            {
                id: 2,
                name: "Art Collector",
                amount: 15,
                description: "Premium support level",
                benefits: ["Exclusive artwork", "Behind-the-scenes content", "Early access to new pieces"],
                supporters: 18
            },
            {
                id: 3,
                name: "Patron",
                amount: 25,
                description: "VIP support level",
                benefits: ["All previous benefits", "Custom artwork", "Direct artist communication", "Name in credits"],
                supporters: 6
            }
        ]
    },
    {
        id: 2,
        name: "Marcus Rodriguez",
        category: "music",
        title: "Jazz Fusion Album",
        description: "Recording a groundbreaking jazz fusion album that blends traditional jazz with modern electronic elements.",
        image: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400&h=300&fit=crop",
        profileImage: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=150&h=150&fit=crop&crop=face",
        pledged: 1800,
        goal: 5000,
        supporters: 34,
        daysLeft: 22,
        pledgeLevels: [
            {
                id: 1,
                name: "Listener",
                amount: 8,
                description: "Music lover support",
                benefits: ["Digital album download", "Studio session videos"],
                supporters: 20
            },
            {
                id: 2,
                name: "Music Enthusiast",
                amount: 18,
                description: "Enhanced music experience",
                benefits: ["All previous benefits", "Exclusive bonus tracks", "Live performance access"],
                supporters: 12
            },
            {
                id: 3,
                name: "Producer",
                amount: 35,
                description: "Ultimate music experience",
                benefits: ["All previous benefits", "Producer credit", "Private concert", "Instrument lessons"],
                supporters: 2
            }
        ]
    },
    {
        id: 3,
        name: "Emma Thompson",
        category: "writing",
        title: "Fantasy Novel Series",
        description: "Writing an epic fantasy trilogy that explores themes of identity, destiny, and the power of choice.",
        image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=300&fit=crop",
        profileImage: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face",
        pledged: 3200,
        goal: 4000,
        supporters: 89,
        daysLeft: 8,
        pledgeLevels: [
            {
                id: 1,
                name: "Reader",
                amount: 10,
                description: "Book lover support",
                benefits: ["E-book copies", "Author notes"],
                supporters: 45
            },
            {
                id: 2,
                name: "Bookworm",
                amount: 20,
                description: "Enhanced reading experience",
                benefits: ["All previous benefits", "Signed paperback", "Character sketches", "Deleted scenes"],
                supporters: 32
            },
            {
                id: 3,
                name: "Storyteller",
                amount: 40,
                description: "Ultimate reader experience",
                benefits: ["All previous benefits", "Character named after you", "Monthly writing workshops", "Manuscript access"],
                supporters: 12
            }
        ]
    },
    {
        id: 4,
        name: "Alex Kim",
        category: "film",
        title: "Short Film: 'Echoes'",
        description: "Directing a thought-provoking short film about memory, loss, and the connections that bind us together.",
        image: "https://images.unsplash.com/photo-1485846234645-a62644f84728?w=400&h=300&fit=crop",
        profileImage: "https://images.unsplash.com/photo-1485846234645-a62644f84728?w=150&h=150&fit=crop&crop=face",
        pledged: 1200,
        goal: 2500,
        supporters: 28,
        daysLeft: 35,
        pledgeLevels: [
            {
                id: 1,
                name: "Film Fan",
                amount: 12,
                description: "Movie enthusiast support",
                benefits: ["Digital film download", "Making-of videos"],
                supporters: 18
            },
            {
                id: 2,
                name: "Cinema Lover",
                amount: 25,
                description: "Enhanced film experience",
                benefits: ["All previous benefits", "Director commentary", "BTS photos", "Soundtrack access"],
                supporters: 8
            },
            {
                id: 3,
                name: "Executive Producer",
                amount: 50,
                description: "Ultimate film experience",
                benefits: ["All previous benefits", "Producer credit", "Set visit", "Original screenplay"],
                supporters: 2
            }
        ]
    }
];

// Load artists into the grid
async function loadArtists(category = 'all') {
    try {
        // Always use the live backend URL for pledgr.art
        const apiUrl = window.location.hostname === 'pledgr.art' 
            ? `https://pledgr.onrender.com/api/artists?category=${category}`
            : `/api/artists?category=${category}`;
        
        const response = await fetch(apiUrl);
        const data = await response.json();
        
        if (response.ok && data.artists && data.artists.length > 0) {
            displayArtists(data.artists);
            return;
        }
    } catch (error) {
        console.log('Backend unavailable, using fallback data');
    }
    
    // Use fallback data when backend is unavailable
    const filteredArtists = category === 'all' 
        ? FALLBACK_ARTISTS 
        : FALLBACK_ARTISTS.filter(artist => artist.category === category);
    
    displayArtists(filteredArtists);
}

// Display artists in the grid
function displayArtists(artists) {
    artistsGrid.innerHTML = '';
    
    if (artists.length === 0) {
        artistsGrid.innerHTML = '<div class="no-artists"><p>No artists found in this category.</p></div>';
        return;
    }
    
    artists.forEach(artist => {
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
        <img src="${artist.image || 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=400&h=300&fit=crop'}" alt="${artist.name}" class="artist-image">
        <div class="artist-info">
            <span class="artist-category">${getCategoryName(artist.category)}</span>
            <h3>${artist.name}</h3>
            <p>${artist.title}</p>
            <div class="artist-progress">
                <p>$${(artist.pledged || 0).toLocaleString()} of $${artist.goal.toLocaleString()}</p>
                <div class="progress-bar">
                    <div class="progress" style="width: ${Math.min(progress, 100)}%"></div>
                </div>
                <p>${artist.supporters || 0} supporters • ${artist.days_left || 30} days left</p>
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
        
        // Close user dropdown when clicking outside
        if (!e.target.closest('.user-menu') && !e.target.closest('.user-dropdown')) {
            const dropdown = document.querySelector('.user-dropdown');
            if (dropdown && dropdown.classList.contains('active')) {
                dropdown.classList.remove('active');
            }
        }
    });
}

// Handle form submissions
async function handleFormSubmit(e) {
    e.preventDefault();
    
    const form = e.target;
    const submitButton = form.querySelector('button[type="submit"]');
    const originalText = submitButton.textContent;
    
    submitButton.textContent = 'Processing...';
    submitButton.disabled = true;
    
    try {
        if (form.id === 'loginForm') {
            // Handle login
            const email = document.getElementById('loginEmail').value;
            const password = document.getElementById('loginPassword').value;
            
            await UserAuth.login(email, password);
            closeModal('loginModal');
            showSuccessMessage('Welcome back!');
            form.reset();
            
        } else if (form.id === 'signupForm') {
            // Handle registration
            const name = document.getElementById('signupName').value;
            const email = document.getElementById('signupEmail').value;
            const password = document.getElementById('signupPassword').value;
            
            await UserAuth.register({ name, email, password });
            closeModal('signupModal');
            showSuccessMessage('Account created successfully! Welcome to Pledgr!');
            form.reset();
        }
    } catch (error) {
        showErrorMessage(error.message);
    } finally {
        submitButton.textContent = originalText;
        submitButton.disabled = false;
    }
}

// Modal functions
function openModal(modalId) {
    console.log('🔍 openModal called with:', modalId);
    const modal = document.getElementById(modalId);
    if (modal) {
        console.log('✅ Modal found, opening...');
        modal.style.display = 'block';
        document.body.style.overflow = 'hidden';
    } else {
        console.error('❌ Modal not found:', modalId);
    }
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
    const artist = artists.find(a => a.id === artistId);
    const pledgeLevel = artist.pledgeLevels.find(p => p.id === levelId);
    
    const paymentSection = document.querySelector('.payment-section');
    if (paymentSection) {
        paymentSection.innerHTML = `
            <h3>Complete Your Pledge</h3>
            <div class="payment-form">
                <div class="payment-options">
                    <div class="payment-method active" onclick="switchPaymentMethod('paypal')">
                        <input type="radio" name="payment-method" value="paypal" checked>
                        <label>PayPal</label>
                    </div>
                    <div class="payment-method" onclick="switchPaymentMethod('stripe')">
                        <input type="radio" name="payment-method" value="stripe">
                        <label>Credit Card</label>
                    </div>
                    <div class="payment-method" onclick="switchPaymentMethod('card')">
                        <input type="radio" name="payment-method" value="card">
                        <label>Manual Entry</label>
                    </div>
                </div>
                
                <div id="paypal-payment" class="payment-option active">
                    <div id="paypal-button-container"></div>
                    <p class="payment-note">Pay securely with PayPal</p>
                </div>
                
                <div id="stripe-payment" class="payment-option">
                    <div id="stripe-card-element"></div>
                    <p class="payment-note">Secure payment powered by Stripe</p>
                </div>
                
                <div id="card-payment" class="payment-option">
                    <form id="paymentForm">
                        <div class="form-group">
                            <label for="card-number">Card Number</label>
                            <input type="text" id="card-number" placeholder="1234 5678 9012 3456" maxlength="19">
                        </div>
                        <div class="form-row">
                            <div class="form-group">
                                <label for="expiry">Expiry</label>
                                <input type="text" id="expiry" placeholder="MM/YY" maxlength="5">
                            </div>
                            <div class="form-group">
                                <label for="cvv">CVV</label>
                                <input type="text" id="cvv" placeholder="123" maxlength="4">
                            </div>
                        </div>
                        <div class="form-group">
                            <label for="name">Name on Card</label>
                            <input type="text" id="name" placeholder="John Doe">
                        </div>
                        <button type="submit" class="btn btn-primary">
                            Pay $${pledgeLevel.amount}
                        </button>
                    </form>
                </div>
            </div>
        `;
        
        // Setup form submission
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
        
        // Initialize PayPal button if available
        if (window.PayPalPaymentProcessor && window.PayPalPaymentProcessor.createPayPalButton) {
            window.PayPalPaymentProcessor.createPayPalButton(artistId, levelId, 'paypal-button-container');
        }
        
        // Initialize Stripe card element if available
        if (window.StripePaymentProcessor) {
            const cardElement = window.StripePaymentProcessor.createCardElement();
            const cardContainer = document.getElementById('stripe-card-element');
            if (cardContainer) {
                cardElement.mount('#stripe-card-element');
            }
        }
    }
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

// Switch payment method
function switchPaymentMethod(method) {
    // Update radio buttons
    document.querySelectorAll('input[name="payment-method"]').forEach(radio => {
        radio.checked = radio.value === method;
    });
    
    // Update payment method styling
    document.querySelectorAll('.payment-method').forEach(el => {
        el.classList.remove('active');
    });
    event.target.closest('.payment-method').classList.add('active');
    
    // Show/hide payment options
    document.querySelectorAll('.payment-option').forEach(option => {
        option.classList.remove('active');
    });
    
    if (method === 'paypal') {
        document.getElementById('paypal-payment').classList.add('active');
    } else if (method === 'stripe') {
        document.getElementById('stripe-payment').classList.add('active');
    } else {
        document.getElementById('card-payment').classList.add('active');
    }
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

// Pledge Modal Functions
function openPledgeModal(artistId) {
    const artist = FALLBACK_ARTISTS.find(a => a.id === artistId);
    if (!artist) return;

    const modalHTML = `
        <div class="modal-content large">
            <span class="close" onclick="closeModal('pledgeModal')">&times;</span>
            <div class="pledge-modal-header">
                <img src="${artist.profileImage}" alt="${artist.name}" class="artist-avatar">
                <div class="artist-info">
                    <h3>${artist.name}</h3>
                    <p>${artist.title}</p>
                </div>
            </div>
            
            <div class="pledge-levels">
                <h4>Choose Your Pledge Level</h4>
                ${artist.pledgeLevels.map(level => `
                    <div class="pledge-level-option" onclick="selectPledgeLevel(${level.id}, ${level.amount}, '${artist.name}')">
                        <div class="level-header">
                            <h5>${level.name}</h5>
                            <span class="level-amount">$${level.amount}/month</span>
                        </div>
                        <p class="level-description">${level.description}</p>
                        <ul class="level-benefits">
                            ${level.benefits.map(benefit => `<li>${benefit}</li>`).join('')}
                        </ul>
                        <div class="level-supporters">${level.supporters} supporters</div>
                    </div>
                `).join('')}
            </div>
        </div>
    `;

    const modal = document.createElement('div');
    modal.id = 'pledgeModal';
    modal.className = 'modal';
    modal.innerHTML = modalHTML;
    document.body.appendChild(modal);
    
    openModal('pledgeModal');
}

function selectPledgeLevel(levelId, amount, artistName) {
    const modalHTML = `
        <div class="modal-content large">
            <span class="close" onclick="closeModal('pledgeModal')">&times;</span>
            <div class="pledge-confirmation">
                <h3>Complete Your Pledge</h3>
                <p>You're pledging <strong>$${amount}/month</strong> to <strong>${artistName}</strong></p>
                
                <div class="payment-options">
                    <h4>Choose Payment Method</h4>
                    
                    <div class="payment-method">
                        <div id="paypal-container"></div>
                    </div>
                </div>
            </div>
        </div>
    `;

    const modal = document.getElementById('pledgeModal');
    modal.querySelector('.modal-content').innerHTML = modalHTML;
    
    // Initialize PayPal payment
    PayPalIntegration.createButton('paypal-container', amount, artistName,
        () => showNotification(`Successfully pledged $${amount} to ${artistName}!`, 'success'),
        (error) => showNotification(`Payment failed: ${error}`, 'error')
    );
}

// Payment method handling (PayPal only)
function handlePaymentMethod(method) {
    console.log(`Using payment method: ${method}`);
}

// Artist Modal Functions
function openArtistModal(artist) {
    const modalHTML = `
        <div class="modal-content large">
            <span class="close" onclick="closeModal('artistModal')">&times;</span>
            <div class="artist-modal-content">
                <div class="artist-hero">
                    <img src="${artist.image}" alt="${artist.name}" class="artist-hero-image">
                    <div class="artist-hero-overlay">
                        <div class="artist-hero-info">
                            <img src="${artist.profileImage}" alt="${artist.name}" class="artist-profile-image">
                            <div class="artist-details">
                                <h2>${artist.name}</h2>
                                <p class="artist-category">${getCategoryName(artist.category)}</p>
                                <h3>${artist.title}</h3>
                            </div>
                        </div>
                    </div>
                </div>
                
                <div class="artist-content">
                    <div class="artist-description">
                        <p>${artist.description}</p>
                    </div>
                    
                    <div class="artist-stats">
                        <div class="stat-item">
                            <h4>$${artist.pledged.toLocaleString()}</h4>
                            <p>Pledged of ${formatCurrency(artist.goal)} goal</p>
                        </div>
                        <div class="stat-item">
                            <h4>${artist.supporters}</h4>
                            <p>Supporters</p>
                        </div>
                        <div class="stat-item">
                            <h4>${artist.daysLeft}</h4>
                            <p>Days left</p>
                        </div>
                    </div>
                    
                    <div class="progress-section">
                        <div class="progress-info">
                            <span>Progress</span>
                            <span>${Math.round((artist.pledged / artist.goal) * 100)}%</span>
                        </div>
                        <div class="progress-bar">
                            <div class="progress" style="width: ${Math.min((artist.pledged / artist.goal) * 100, 100)}%"></div>
                        </div>
                    </div>
                    
                    <div class="pledge-levels-section">
                        <h3>Pledge Levels</h3>
                        <div class="pledge-levels-grid">
                            ${artist.pledgeLevels.map(level => `
                                <div class="pledge-level-card">
                                    <div class="level-header">
                                        <h4>${level.name}</h4>
                                        <span class="level-price">$${level.amount}/month</span>
                                    </div>
                                    <p class="level-desc">${level.description}</p>
                                    <ul class="level-benefits-list">
                                        ${level.benefits.map(benefit => `<li>${benefit}</li>`).join('')}
                                    </ul>
                                    <div class="level-footer">
                                        <span class="supporters-count">${level.supporters} supporters</span>
                                        <button class="btn-pledge" onclick="openPledgeModal(${artist.id})">Pledge</button>
                                    </div>
                                </div>
                            `).join('')}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;

    const modal = document.getElementById('artistModal');
    modal.querySelector('#artistModalContent').innerHTML = modalHTML;
    
    openModal('artistModal');
}

// Modal Functions
function openModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.style.display = 'block';
        document.body.style.overflow = 'hidden';
    }
}

function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.style.display = 'none';
        document.body.style.overflow = 'auto';
    }
}

function switchModal(fromModalId, toModalId) {
    closeModal(fromModalId);
    openModal(toModalId);
}

// Utility Functions
function scrollToSection(sectionId) {
    const section = document.getElementById(sectionId);
    if (section) {
        section.scrollIntoView({ behavior: 'smooth' });
    }
}

function setupSmoothScrolling() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({ behavior: 'smooth' });
            }
        });
    });
}

function setupMobileMenu() {
    const navToggle = document.querySelector('.nav-toggle');
    const navMenu = document.querySelector('.nav-menu');
    
    if (navToggle && navMenu) {
        navToggle.addEventListener('click', () => {
            navMenu.classList.toggle('active');
            navToggle.classList.toggle('active');
        });
    }
}

// Form handling
function handleFormSubmit(e) {
    e.preventDefault();
    const form = e.target;
    const formId = form.id;
    
    if (formId === 'loginForm') {
        const email = form.querySelector('#loginEmail').value;
        const password = form.querySelector('#loginPassword').value;
        
        UserAuth.login(email, password)
            .then(() => {
                closeModal('loginModal');
                showNotification('Successfully logged in!', 'success');
            })
            .catch(error => {
                showNotification(error.message, 'error');
            });
    } else if (formId === 'signupForm') {
        const name = form.querySelector('#signupName').value;
        const email = form.querySelector('#signupEmail').value;
        const password = form.querySelector('#signupPassword').value;
        
        UserAuth.register({ name, email, password })
            .then(() => {
                closeModal('signupModal');
                showNotification('Account created successfully!', 'success');
            })
            .catch(error => {
                showNotification(error.message, 'error');
            });
    }
}

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

// Art Posting System
class ArtPoster {
    static async createArtPost(artData) {
        try {
            const apiUrl = window.location.hostname === 'pledgr.art' 
                ? 'https://pledgr.onrender.com/api/art'
                : '/api/art';
            
            const response = await fetch(apiUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${UserAuth.token}`
                },
                body: JSON.stringify(artData)
            });

            if (response.ok) {
                const data = await response.json();
                return data;
            } else {
                const error = await response.json();
                throw new Error(error.error || 'Failed to create art post');
            }
        } catch (error) {
            console.error('Create art post error:', error);
            throw error;
        }
    }

    static showArtPostModal() {
        if (!UserAuth.currentUser) {
            openModal('loginModal');
            return;
        }

        // Check if user is an artist
        if (!UserAuth.currentUser.isCreator) {
            this.showBecomeArtistPrompt();
            return;
        }

        const modal = document.createElement('div');
        modal.className = 'modal art-post-modal';
        modal.innerHTML = `
            <div class="modal-content art-post-content">
                <span class="close" onclick="this.parentElement.parentElement.remove()">&times;</span>
                <div class="art-post">
                    <h2>🎨 Share Your Art</h2>
                    <p class="post-subtitle">Post your latest creation and share it with your supporters!</p>
                    
                    <form id="artPostForm" class="art-post-form">
                        <div class="form-group">
                            <label for="artTitle">Title *</label>
                            <input type="text" id="artTitle" required placeholder="Give your art a title">
                        </div>
                        
                        <div class="form-group">
                            <label for="artDescription">Description</label>
                            <textarea id="artDescription" rows="4" placeholder="Tell the story behind your art, your inspiration, or what you're working on..."></textarea>
                        </div>
                        
                        <div class="form-group">
                            <label for="artImage">Image URL *</label>
                            <input type="url" id="artImage" required placeholder="https://example.com/your-art.jpg">
                            <small>Upload your image to a service like Imgur, then paste the URL here</small>
                        </div>
                        
                        <div class="form-group">
                            <label for="artTags">Tags (Optional)</label>
                            <input type="text" id="artTags" placeholder="digital art, fantasy, character design">
                            <small>Separate tags with commas</small>
                        </div>
                        
                        <div class="form-group">
                            <label for="artVisibility">Visibility</label>
                            <select id="artVisibility">
                                <option value="public">Public - Everyone can see</option>
                                <option value="supporters">Supporters Only - Only your supporters can see</option>
                            </select>
                        </div>
                        
                        <div class="post-actions">
                            <button type="submit" class="btn-primary btn-large">
                                🚀 Post My Art
                            </button>
                            <p class="post-note">Your art will be visible on your profile and in the main feed</p>
                        </div>
                    </form>
                </div>
            </div>
        `;

        document.body.appendChild(modal);
        modal.style.display = 'block';
        
        // Setup form submission
        this.setupArtForm();
    }

    static showBecomeArtistPrompt() {
        const modal = document.createElement('div');
        modal.className = 'modal become-artist-modal';
        modal.innerHTML = `
            <div class="modal-content become-artist-content">
                <span class="close" onclick="this.parentElement.parentElement.remove()">&times;</span>
                <div class="become-artist">
                    <div class="become-artist-icon">🎨</div>
                    <h2>Become an Artist First</h2>
                    <p>To post art and start earning from supporters, you need to create an artist profile first.</p>
                    
                    <div class="become-artist-actions">
                        <button class="btn-primary btn-large" onclick="ArtistProfileCreator.showArtistSetupModal()">
                            Create Artist Profile
                        </button>
                        <button class="btn-secondary" onclick="this.parentElement.parentElement.parentElement.remove()">
                            Maybe Later
                        </button>
                    </div>
                    
                    <div class="become-artist-benefits">
                        <h3>Why become an artist?</h3>
                        <ul>
                            <li>💰 Earn money from your art</li>
                            <li>👥 Build a community of supporters</li>
                            <li>🎯 Share your creative process</li>
                            <li>🚀 Grow your audience</li>
                        </ul>
                    </div>
                </div>
            </div>
        `;

        document.body.appendChild(modal);
        modal.style.display = 'block';
    }

    static setupArtForm() {
        const form = document.getElementById('artPostForm');
        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const submitBtn = form.querySelector('button[type="submit"]');
            const originalText = submitBtn.textContent;
            submitBtn.textContent = 'Posting...';
            submitBtn.disabled = true;
            
            try {
                const artData = {
                    title: document.getElementById('artTitle').value,
                    description: document.getElementById('artDescription').value,
                    imageUrl: document.getElementById('artImage').value,
                    tags: document.getElementById('artTags').value.split(',').map(tag => tag.trim()).filter(tag => tag),
                    visibility: document.getElementById('artVisibility').value
                };

                const result = await this.createArtPost(artData);
                
                // Show success
                this.showPostSuccess(result.artId);
                
            } catch (error) {
                showErrorMessage(error.message);
                submitBtn.textContent = originalText;
                submitBtn.disabled = false;
            }
        });
    }

    static showPostSuccess(artId) {
        const modal = document.querySelector('.art-post-modal');
        if (!modal) return;

        modal.innerHTML = `
            <div class="modal-content success-content">
                <div class="success-icon">
                    🎉
                </div>
                <h2>Art Posted Successfully!</h2>
                <p>Your art is now live and visible to your supporters!</p>
                
                <div class="success-actions">
                    <button class="btn-primary" onclick="window.location.href='/art/${artId}'">
                        View My Post
                    </button>
                    <button class="btn-secondary" onclick="this.parentElement.parentElement.parentElement.remove()">
                        Post Another
                    </button>
                </div>
                
                <div class="next-steps">
                    <h3>What happens next?</h3>
                    <ul>
                        <li>📱 Your art appears on your profile</li>
                        <li>👥 Supporters get notified (if visibility is set to supporters)</li>
                        <li>💬 People can comment and engage</li>
                        <li>💰 More art = more reasons for people to support you</li>
                    </ul>
                </div>
            </div>
        `;
    }
}