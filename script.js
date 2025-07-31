// User Authentication System
class UserAuth {
    static currentUser = null;
    static users = JSON.parse(localStorage.getItem('pledgr_users') || '[]');
    static sessions = JSON.parse(localStorage.getItem('pledgr_sessions') || '{}');

    // Initialize user system
    static init() {
        this.checkSession();
        this.updateUI();
    }

    // Check for existing session
    static checkSession() {
        const sessionId = localStorage.getItem('pledgr_session_id');
        if (sessionId && this.sessions[sessionId]) {
            const user = this.users.find(u => u.id === this.sessions[sessionId].userId);
            if (user) {
                this.currentUser = user;
                return true;
            }
        }
        return false;
    }

    // Register new user
    static async register(userData) {
        // Validate input
        if (!userData.name || !userData.email || !userData.password) {
            throw new Error('All fields are required');
        }

        if (userData.password.length < 6) {
            throw new Error('Password must be at least 6 characters');
        }

        if (this.users.find(u => u.email === userData.email)) {
            throw new Error('Email already registered');
        }

        // Create new user
        const newUser = {
            id: Date.now().toString(),
            name: userData.name,
            email: userData.email,
            password: await this.hashPassword(userData.password),
            avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(userData.name)}&background=random`,
            createdAt: new Date().toISOString(),
            isCreator: false,
            pledges: [],
            followers: [],
            following: [],
            bio: '',
            website: '',
            social: {
                twitter: '',
                instagram: '',
                youtube: ''
            }
        };

        this.users.push(newUser);
        this.saveUsers();
        
        // Auto-login after registration
        return this.login(userData.email, userData.password);
    }

    // Login user
    static async login(email, password) {
        const user = this.users.find(u => u.email === email);
        if (!user) {
            throw new Error('Invalid email or password');
        }

        const isValidPassword = await this.verifyPassword(password, user.password);
        if (!isValidPassword) {
            throw new Error('Invalid email or password');
        }

        // Create session
        const sessionId = this.generateSessionId();
        this.sessions[sessionId] = {
            userId: user.id,
            createdAt: new Date().toISOString(),
            expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString() // 30 days
        };

        localStorage.setItem('pledgr_session_id', sessionId);
        this.saveSessions();
        
        this.currentUser = user;
        this.updateUI();
        
        return user;
    }

    // Logout user
    static logout() {
        const sessionId = localStorage.getItem('pledgr_session_id');
        if (sessionId) {
            delete this.sessions[sessionId];
            this.saveSessions();
        }
        
        localStorage.removeItem('pledgr_session_id');
        this.currentUser = null;
        this.updateUI();
    }

    // Update user profile
    static updateProfile(userData) {
        if (!this.currentUser) return false;

        const userIndex = this.users.findIndex(u => u.id === this.currentUser.id);
        if (userIndex === -1) return false;

        // Update user data
        this.users[userIndex] = {
            ...this.users[userIndex],
            ...userData,
            updatedAt: new Date().toISOString()
        };

        this.currentUser = this.users[userIndex];
        this.saveUsers();
        this.updateUI();
        
        return true;
    }

    // Make user a creator
    static becomeCreator(creatorData) {
        if (!this.currentUser) return false;

        const userIndex = this.users.findIndex(u => u.id === this.currentUser.id);
        if (userIndex === -1) return false;

        this.users[userIndex] = {
            ...this.users[userIndex],
            isCreator: true,
            creatorProfile: {
                title: creatorData.title,
                description: creatorData.description,
                category: creatorData.category,
                goal: creatorData.goal,
                image: creatorData.image || this.currentUser.avatar,
                pledgeLevels: creatorData.pledgeLevels || []
            },
            updatedAt: new Date().toISOString()
        };

        this.currentUser = this.users[userIndex];
        this.saveUsers();
        this.updateUI();
        
        return true;
    }

    // Add pledge to user's pledges
    static addPledge(pledgeData) {
        if (!this.currentUser) return false;

        const pledge = {
            id: Date.now().toString(),
            artistId: pledgeData.artistId,
            artistName: pledgeData.artistName,
            levelId: pledgeData.levelId,
            levelName: pledgeData.levelName,
            amount: pledgeData.amount,
            date: new Date().toISOString(),
            status: 'active'
        };

        this.currentUser.pledges.push(pledge);
        this.updateUser();
        
        return pledge;
    }

    // Helper methods
    static async hashPassword(password) {
        // Simple hash for demo - in production use proper hashing
        return btoa(password + 'pledgr_salt');
    }

    static async verifyPassword(password, hashedPassword) {
        return btoa(password + 'pledgr_salt') === hashedPassword;
    }

    static generateSessionId() {
        return 'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    }

    static saveUsers() {
        localStorage.setItem('pledgr_users', JSON.stringify(this.users));
    }

    static saveSessions() {
        localStorage.setItem('pledgr_sessions', JSON.stringify(this.sessions));
    }

    static updateUser() {
        const userIndex = this.users.findIndex(u => u.id === this.currentUser.id);
        if (userIndex !== -1) {
            this.users[userIndex] = this.currentUser;
            this.saveUsers();
        }
    }

    // Update UI based on authentication state
    static updateUI() {
        const navMenu = document.querySelector('.nav-menu');
        const authButton = navMenu.querySelector('.btn-primary');
        
        if (this.currentUser) {
            // User is logged in
            authButton.innerHTML = `
                <div class="user-menu">
                    <img src="${this.currentUser.avatar}" alt="${this.currentUser.name}" class="user-avatar">
                    <span>${this.currentUser.name}</span>
                    <i class="fas fa-chevron-down"></i>
                </div>
            `;
            authButton.onclick = () => this.toggleUserMenu();
            
            // Add user menu dropdown
            this.createUserMenu();
        } else {
            // User is logged out
            authButton.innerHTML = 'Sign In';
            authButton.onclick = () => openModal('loginModal');
            
            // Remove user menu if exists
            const existingMenu = document.querySelector('.user-dropdown');
            if (existingMenu) existingMenu.remove();
        }
    }

    // Create user menu dropdown
    static createUserMenu() {
        const existingMenu = document.querySelector('.user-dropdown');
        if (existingMenu) existingMenu.remove();

        const navMenu = document.querySelector('.nav-menu');
        const dropdown = document.createElement('div');
        dropdown.className = 'user-dropdown';
        dropdown.innerHTML = `
            <div class="dropdown-header">
                <img src="${this.currentUser.avatar}" alt="${this.currentUser.name}">
                <div>
                    <h4>${this.currentUser.name}</h4>
                    <p>${this.currentUser.email}</p>
                </div>
            </div>
            <div class="dropdown-menu">
                <a href="#" onclick="UserAuth.openProfile()">
                    <i class="fas fa-user"></i> My Profile
                </a>
                <a href="#" onclick="UserAuth.openPledges()">
                    <i class="fas fa-heart"></i> My Pledges
                </a>
                ${this.currentUser.isCreator ? `
                    <a href="#" onclick="UserAuth.openCreatorDashboard()">
                        <i class="fas fa-cog"></i> Creator Dashboard
                    </a>
                ` : `
                    <a href="#" onclick="UserAuth.openBecomeCreator()">
                        <i class="fas fa-star"></i> Become a Creator
                    </a>
                `}
                <div class="dropdown-divider"></div>
                <a href="#" onclick="UserAuth.logout()">
                    <i class="fas fa-sign-out-alt"></i> Sign Out
                </a>
            </div>
        `;

        navMenu.appendChild(dropdown);
    }

    // Toggle user menu
    static toggleUserMenu() {
        const dropdown = document.querySelector('.user-dropdown');
        if (dropdown) {
            dropdown.classList.toggle('active');
        }
    }

    // Open profile modal
    static openProfile() {
        this.createProfileModal();
        openModal('profileModal');
    }

    // Open pledges modal
    static openPledges() {
        this.createPledgesModal();
        openModal('pledgesModal');
    }

    // Open become creator modal
    static openBecomeCreator() {
        this.createBecomeCreatorModal();
        openModal('becomeCreatorModal');
    }

    // Open creator dashboard
    static openCreatorDashboard() {
        if (!this.currentUser.isCreator) return;
        
        // Find the artist data for current user
        const artist = artists.find(a => a.name === this.currentUser.name);
        if (artist) {
            CreatorDashboard.openDashboard(artist.id);
        } else {
            // Create new artist entry for the user
            const newArtist = {
                id: Date.now(),
                name: this.currentUser.name,
                category: this.currentUser.creatorProfile?.category || 'visual',
                title: this.currentUser.creatorProfile?.title || 'My Creative Project',
                description: this.currentUser.creatorProfile?.description || 'Support my creative journey!',
                image: this.currentUser.creatorProfile?.image || this.currentUser.avatar,
                profileImage: this.currentUser.avatar,
                pledged: 0,
                goal: this.currentUser.creatorProfile?.goal || 1000,
                supporters: 0,
                daysLeft: 30,
                monthlyPledges: 0,
                pledgeLevels: this.currentUser.creatorProfile?.pledgeLevels || []
            };
            
            artists.unshift(newArtist);
            CreatorDashboard.openDashboard(newArtist.id);
        }
    }

    // Create profile modal
    static createProfileModal() {
        if (!this.currentUser) return;

        const modal = document.getElementById('profileModal') || this.createModal('profileModal', 'My Profile');
        const content = modal.querySelector('.modal-content');
        
        content.innerHTML = `
            <div class="profile-form">
                <div class="profile-avatar">
                    <img src="${this.currentUser.avatar}" alt="${this.currentUser.name}">
                    <button class="btn-secondary btn-small">Change Avatar</button>
                </div>
                
                <form id="profileForm">
                    <div class="form-group">
                        <label for="profileName">Full Name</label>
                        <input type="text" id="profileName" value="${this.currentUser.name}" required>
                    </div>
                    
                    <div class="form-group">
                        <label for="profileEmail">Email</label>
                        <input type="email" id="profileEmail" value="${this.currentUser.email}" readonly>
                    </div>
                    
                    <div class="form-group">
                        <label for="profileBio">Bio</label>
                        <textarea id="profileBio" rows="3">${this.currentUser.bio || ''}</textarea>
                    </div>
                    
                    <div class="form-group">
                        <label for="profileWebsite">Website</label>
                        <input type="url" id="profileWebsite" value="${this.currentUser.website || ''}">
                    </div>
                    
                    <div class="social-links">
                        <h4>Social Links</h4>
                        <div class="form-group">
                            <label for="profileTwitter">Twitter</label>
                            <input type="url" id="profileTwitter" value="${this.currentUser.social?.twitter || ''}">
                        </div>
                        <div class="form-group">
                            <label for="profileInstagram">Instagram</label>
                            <input type="url" id="profileInstagram" value="${this.currentUser.social?.instagram || ''}">
                        </div>
                        <div class="form-group">
                            <label for="profileYoutube">YouTube</label>
                            <input type="url" id="profileYoutube" value="${this.currentUser.social?.youtube || ''}">
                        </div>
                    </div>
                    
                    <button type="submit" class="btn-primary">Save Changes</button>
                </form>
            </div>
        `;

        // Handle profile form submission
        const form = content.querySelector('#profileForm');
        form.onsubmit = (e) => {
            e.preventDefault();
            this.updateProfile({
                name: document.getElementById('profileName').value,
                bio: document.getElementById('profileBio').value,
                website: document.getElementById('profileWebsite').value,
                social: {
                    twitter: document.getElementById('profileTwitter').value,
                    instagram: document.getElementById('profileInstagram').value,
                    youtube: document.getElementById('profileYoutube').value
                }
            });
            closeModal('profileModal');
            showSuccessMessage('Profile updated successfully!');
        };
    }

    // Create pledges modal
    static createPledgesModal() {
        if (!this.currentUser) return;

        const modal = document.getElementById('pledgesModal') || this.createModal('pledgesModal', 'My Pledges');
        const content = modal.querySelector('.modal-content');
        
        const pledges = this.currentUser.pledges || [];
        
        content.innerHTML = `
            <div class="pledges-content">
                ${pledges.length === 0 ? `
                    <div class="empty-state">
                        <i class="fas fa-heart"></i>
                        <h3>No pledges yet</h3>
                        <p>Start supporting creators to see your pledges here!</p>
                        <button class="btn-primary" onclick="closeModal('pledgesModal'); scrollToSection('artists')">
                            Discover Artists
                        </button>
                    </div>
                ` : `
                    <div class="pledges-list">
                        ${pledges.map(pledge => `
                            <div class="pledge-item">
                                <div class="pledge-info">
                                    <h4>${pledge.artistName}</h4>
                                    <p class="pledge-level">${pledge.levelName}</p>
                                    <p class="pledge-amount">$${pledge.amount}/month</p>
                                    <p class="pledge-date">Since ${new Date(pledge.date).toLocaleDateString()}</p>
                                </div>
                                <div class="pledge-actions">
                                    <button class="btn-secondary btn-small" onclick="UserAuth.cancelPledge('${pledge.id}')">
                                        Cancel
                                    </button>
                                </div>
                            </div>
                        `).join('')}
                    </div>
                `}
            </div>
        `;
    }

    // Create become creator modal
    static createBecomeCreatorModal() {
        if (!this.currentUser) return;

        const modal = document.getElementById('becomeCreatorModal') || this.createModal('becomeCreatorModal', 'Become a Creator');
        const content = modal.querySelector('.modal-content');
        
        content.innerHTML = `
            <div class="creator-form">
                <div class="creator-intro">
                    <h3>Share Your Creativity</h3>
                    <p>Start your creator journey and connect with supporters who believe in your vision.</p>
                </div>
                
                <form id="creatorForm">
                    <div class="form-group">
                        <label for="creatorTitle">Project Title</label>
                        <input type="text" id="creatorTitle" placeholder="e.g., My Digital Art Collection" required>
                    </div>
                    
                    <div class="form-group">
                        <label for="creatorCategory">Category</label>
                        <select id="creatorCategory" required>
                            <option value="">Select a category</option>
                            <option value="visual">Visual Arts</option>
                            <option value="music">Music</option>
                            <option value="writing">Writing</option>
                            <option value="film">Film & Video</option>
                            <option value="photography">Photography</option>
                            <option value="crafts">Crafts & DIY</option>
                        </select>
                    </div>
                    
                    <div class="form-group">
                        <label for="creatorDescription">Project Description</label>
                        <textarea id="creatorDescription" rows="4" placeholder="Tell supporters about your creative project..." required></textarea>
                    </div>
                    
                    <div class="form-group">
                        <label for="creatorGoal">Monthly Goal ($)</label>
                        <input type="number" id="creatorGoal" min="1" value="100" required>
                    </div>
                    
                    <div class="form-group">
                        <label for="creatorImage">Project Image URL</label>
                        <input type="url" id="creatorImage" placeholder="https://example.com/image.jpg">
                    </div>
                    
                    <button type="submit" class="btn-primary">Create Creator Profile</button>
                </form>
            </div>
        `;

        // Handle creator form submission
        const form = content.querySelector('#creatorForm');
        form.onsubmit = (e) => {
            e.preventDefault();
            
            const creatorData = {
                title: document.getElementById('creatorTitle').value,
                category: document.getElementById('creatorCategory').value,
                description: document.getElementById('creatorDescription').value,
                goal: parseInt(document.getElementById('creatorGoal').value),
                image: document.getElementById('creatorImage').value || this.currentUser.avatar,
                pledgeLevels: [
                    {
                        id: 1,
                        name: "Supporter",
                        amount: 5,
                        description: "Basic support level",
                        benefits: ["Monthly updates", "Early access"],
                        supporters: 0
                    },
                    {
                        id: 2,
                        name: "Fan",
                        amount: 15,
                        description: "Enhanced support level",
                        benefits: ["Exclusive content", "Behind-the-scenes"],
                        supporters: 0
                    }
                ]
            };
            
            this.becomeCreator(creatorData);
            closeModal('becomeCreatorModal');
            showSuccessMessage('Creator profile created successfully!');
            this.updateUI();
        };
    }

    // Create modal helper
    static createModal(id, title) {
        const modal = document.createElement('div');
        modal.id = id;
        modal.className = 'modal';
        modal.innerHTML = `
            <div class="modal-content">
                <span class="close" onclick="closeModal('${id}')">&times;</span>
                <h2>${title}</h2>
                <div class="modal-body"></div>
            </div>
        `;
        document.body.appendChild(modal);
        return modal;
    }

    // Cancel pledge
    static cancelPledge(pledgeId) {
        if (!this.currentUser) return;
        
        this.currentUser.pledges = this.currentUser.pledges.filter(p => p.id !== pledgeId);
        this.updateUser();
        this.createPledgesModal(); // Refresh the modal
        showSuccessMessage('Pledge cancelled successfully!');
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
    UserAuth.init(); // Initialize user authentication
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