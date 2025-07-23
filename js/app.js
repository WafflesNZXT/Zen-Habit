// Main Application Controller for Zen Habit
class ZenHabitApp {
    constructor() {
        this.currentView = 'welcome';
        this.init();
    }

    init() {
        this.bindEvents();
        this.checkAuthState();
        this.updateUI();
    }

    bindEvents() {
        // Navigation events
        document.getElementById('loginBtn').addEventListener('click', () => this.showAuth('login'));
        document.getElementById('signupBtn').addEventListener('click', () => this.showAuth('signup'));
        document.getElementById('getStartedBtn').addEventListener('click', () => this.showAuth('signup'));
        document.getElementById('learnMoreBtn').addEventListener('click', () => this.scrollToFeatures());

        // Auth form switching
        document.getElementById('showSignupForm').addEventListener('click', (e) => {
            e.preventDefault();
            this.switchAuthForm('signup');
        });
        document.getElementById('showLoginForm').addEventListener('click', (e) => {
            e.preventDefault();
            this.switchAuthForm('login');
        });

        // Form submissions
        document.getElementById('loginFormElement').addEventListener('submit', (e) => this.handleLogin(e));
        document.getElementById('signupFormElement').addEventListener('submit', (e) => this.handleSignup(e));

        // Dashboard events
        document.getElementById('completeBtn').addEventListener('click', () => this.completeChallenge());
        document.getElementById('skipBtn').addEventListener('click', () => this.skipChallenge());
        document.getElementById('viewProgressBtn').addEventListener('click', () => this.showProgress());
        document.getElementById('logoutBtn').addEventListener('click', () => this.logout());
        document.getElementById('backToDashboardBtn').addEventListener('click', () => this.showDashboard());

        // Password strength checker
        document.getElementById('signupPassword').addEventListener('input', (e) => this.checkPasswordStrength(e.target.value));
    }

    checkAuthState() {
        if (authManager.isLoggedIn()) {
            this.currentView = 'dashboard';
        } else {
            this.currentView = 'welcome';
        }
    }

    updateUI() {
        // Hide all sections
        document.getElementById('welcomeSection').classList.add('hidden');
        document.getElementById('authSection').classList.add('hidden');
        document.getElementById('dashboardSection').classList.add('hidden');
        document.getElementById('progressSection').classList.add('hidden');

        // Update navigation
        const nav = document.getElementById('nav');
        
        if (authManager.isLoggedIn()) {
            const greeting = this.getTimeBasedGreeting();
            nav.innerHTML = `
                <div style="display: flex; align-items: center; gap: 16px;">
                    <span style="color: white; font-weight: 500;">${greeting}</span>
                    <a href="about.html" class="btn btn-outline" style="color: white; border-color: white; text-decoration: none; height: 50px; text-align: center;">About</a>
                    <button class="btn btn-outline" id="logoutBtn" style="color: white; border-color: white; height: 50px;">Logout</button>
                </div>
            `;
            document.getElementById('logoutBtn').addEventListener('click', () => this.logout());
        } else {
            nav.innerHTML = `
                <div style="display: flex; align-items: center; gap: 12px;">
                    <a href="about.html" class="btn btn-outline" style="color: white; border-color: white; text-decoration: none;">About</a>
                    <button class="btn btn-primary" id="loginBtn">Login</button>
                    <button class="btn btn-secondary" id="signupBtn">Sign Up</button>
                </div>
            `;
            document.getElementById('loginBtn').addEventListener('click', () => this.showAuth('login'));
            document.getElementById('signupBtn').addEventListener('click', () => this.showAuth('signup'));
        }

        // Show appropriate section
        switch (this.currentView) {
            case 'welcome':
                document.getElementById('welcomeSection').classList.remove('hidden');
                break;
            case 'auth':
                document.getElementById('authSection').classList.remove('hidden');
                break;
            case 'dashboard':
                document.getElementById('dashboardSection').classList.remove('hidden');
                this.loadDashboard();
                break;
            case 'progress':
                document.getElementById('progressSection').classList.remove('hidden');
                this.loadProgress();
                break;
        }
    }

    getTimeBasedGreeting() {
        const hour = new Date().getHours();
        const name = authManager.getCurrentUser().name.split(' ')[0]; // First name only
        
        if (hour < 12) {
            return `Good morning, ${name}!`;
        } else if (hour < 17) {
            return `Good afternoon, ${name}!`;
        } else {
            return `Good evening, ${name}!`;
        }
    }

    showAuth(type = 'login') {
        this.currentView = 'auth';
        this.updateUI();
        this.switchAuthForm(type);
    }

    switchAuthForm(type) {
        const loginForm = document.getElementById('loginForm');
        const signupForm = document.getElementById('signupForm');

        if (type === 'signup') {
            loginForm.classList.add('hidden');
            signupForm.classList.remove('hidden');
        } else {
            signupForm.classList.add('hidden');
            loginForm.classList.remove('hidden');
        }
    }

    async handleLogin(e) {
        e.preventDefault();
        
        const email = document.getElementById('loginEmail').value;
        const password = document.getElementById('loginPassword').value;
        const submitBtn = e.target.querySelector('button[type="submit"]');

        try {
            this.setLoading(submitBtn, true);
            this.clearMessages();

            await authManager.login(email, password);
            
            this.showSuccess('Welcome back to your mindful journey! 🧘');
            setTimeout(() => {
                this.currentView = 'dashboard';
                this.updateUI();
            }, 1000);

        } catch (error) {
            this.showError(error.message);
        } finally {
            this.setLoading(submitBtn, false);
        }
    }

    async handleSignup(e) {
        e.preventDefault();
        
        const name = document.getElementById('signupName').value;
        const email = document.getElementById('signupEmail').value;
        const password = document.getElementById('signupPassword').value;
        const confirmPassword = document.getElementById('confirmPassword').value;
        const submitBtn = e.target.querySelector('button[type="submit"]');

        try {
            this.setLoading(submitBtn, true);
            this.clearMessages();

            await authManager.register(name, email, password, confirmPassword);
            
            this.showSuccess('Welcome to Zen Habit! Your mindful journey begins now! 🌱');
            setTimeout(() => {
                this.currentView = 'dashboard';
                this.updateUI();
            }, 1500);

        } catch (error) {
            this.showError(error.message);
        } finally {
            this.setLoading(submitBtn, false);
        }
    }

    loadDashboard() {
        const user = authManager.getCurrentUser();
        const challenge = challengeManager.getTodaysChallenge();
        
        // Update user info with personalized greeting
        document.getElementById('userName').textContent = user.name.split(' ')[0];
        
        // Update stats
        document.getElementById('currentStreak').textContent = progressTracker.getCurrentStreak();
        document.getElementById('totalCompleted').textContent = progressTracker.getTotalCompleted();
        
        // Update challenge info with beautiful date formatting
        const today = new Date();
        const dateOptions = { 
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
        };
        document.getElementById('challengeDate').textContent = today.toLocaleDateString('en', dateOptions);
        document.getElementById('challengeIcon').textContent = challenge.icon;
        document.getElementById('challengeTitle').textContent = challenge.title;
        document.getElementById('challengeDescription').textContent = challenge.description;
        
        // Update challenge status
        const isCompleted = progressTracker.isTodayCompleted();
        const isSkipped = progressTracker.isTodaySkipped();
        
        const completeBtn = document.getElementById('completeBtn');
        const skipBtn = document.getElementById('skipBtn');
        const statusDiv = document.getElementById('challengeStatus');
        
        if (isCompleted) {
            completeBtn.style.display = 'none';
            skipBtn.style.display = 'none';
            statusDiv.classList.remove('hidden');
            statusDiv.innerHTML = `
                <div class="status-complete">
                    <span class="status-icon">✨</span>
                    <span>Mindful moment completed! You're cultivating inner peace!</span>
                </div>
            `;
        } else if (isSkipped) {
            completeBtn.style.display = 'none';
            skipBtn.style.display = 'none';
            statusDiv.classList.remove('hidden');
            statusDiv.innerHTML = `
                <div class="status-complete" style="background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%); border-left-color: #f59e0b;">
                    <span class="status-icon">🌅</span>
                    <span style="color: #92400e;">Challenge skipped. Tomorrow brings new opportunities for mindfulness!</span>
                </div>
            `;
        } else {
            completeBtn.style.display = 'block';
            skipBtn.style.display = 'block';
            statusDiv.classList.add('hidden');
        }
    }

    completeChallenge() {
        if (progressTracker.completeToday()) {
            // Show celebration message with streak info
            const currentStreak = progressTracker.getCurrentStreak();
            let message = 'Wonderful! Your mindful moment is complete! ✨';
            
            if (currentStreak > 1) {
                message += ` You're on a ${currentStreak}-day streak! 🔥`;
            }
            
            if (currentStreak === 7) {
                message += ' One week of mindfulness - amazing!';
            } else if (currentStreak === 30) {
                message += ' 30 days of mindful living - incredible dedication!';
            }
            
            this.showSuccess(message);
            this.loadDashboard(); // Refresh dashboard
            
            // Add a subtle celebration animation
            this.celebrateCompletion();
        } else {
            this.showError('Today\'s mindful moment is already complete!');
        }
    }

    celebrateCompletion() {
        // Add a subtle celebration effect
        const challengeCard = document.getElementById('challengeCard');
        challengeCard.style.transform = 'scale(1.02)';
        challengeCard.style.transition = 'transform 0.3s ease';
        
        setTimeout(() => {
            challengeCard.style.transform = 'scale(1)';
        }, 300);
    }

    skipChallenge() {
        if (confirm('Are you sure you want to skip today\'s mindful challenge? Remember, every small step counts on your journey to inner peace.')) {
            if (progressTracker.skipToday()) {
                this.showSuccess('Challenge skipped with compassion. Tomorrow is a new opportunity for mindfulness!');
                this.loadDashboard(); // Refresh dashboard
            } else {
                this.showError('Today\'s challenge has already been completed or skipped!');
            }
        }
    }

    showProgress() {
        this.currentView = 'progress';
        this.updateUI();
    }

    loadProgress() {
        // Load week grid
        const weekGrid = document.getElementById('weekGrid');
        const weekProgress = progressTracker.getWeekProgress();
        
        weekGrid.innerHTML = weekProgress.map(day => `
            <div class="day-cell ${day.progress?.status === 'completed' ? 'completed' : ''} ${day.isToday ? 'today' : ''}" 
                 title="${day.dayName} ${day.day}${day.progress ? ` - ${day.progress.status}` : ''}">
                ${day.day}
            </div>
        `).join('');

        // Load recent challenges
        const recentChallenges = document.getElementById('recentChallenges');
        const recent = progressTracker.getRecentChallenges();
        
        recentChallenges.innerHTML = recent.map(item => `
            <div class="recent-challenge">
                <div class="recent-challenge-icon">${item.challenge.icon}</div>
                <div class="recent-challenge-text">
                    <div class="recent-challenge-title">${item.challenge.title}</div>
                    <div class="recent-challenge-date">${new Date(item.date).toLocaleDateString('en', { 
                        weekday: 'short', 
                        month: 'short', 
                        day: 'numeric' 
                    })}</div>
                </div>
                <div class="recent-challenge-status ${item.progress?.status || 'pending'}">
                    ${item.progress?.status === 'completed' ? '✨ Completed' : 
                      item.progress?.status === 'skipped' ? 'Skipped' : 
                      item.isToday ? '🧘 Today' : '⚪ Missed'}
                </div>
            </div>
        `).join('');
    }

    showDashboard() {
        this.currentView = 'dashboard';
        this.updateUI();
    }

    logout() {
        if (confirm('Are you sure you want to end your mindful session?')) {
            authManager.logout();
            this.currentView = 'welcome';
            this.updateUI();
            this.showSuccess('Thank you for your mindful practice today. See you soon! 🙏');
        }
    }

    scrollToFeatures() {
        document.querySelector('.features').scrollIntoView({ 
            behavior: 'smooth' 
        });
    }

    checkPasswordStrength(password) {
        const strength = authManager.checkPasswordStrength(password);
        const container = document.getElementById('signupPassword').parentNode;
        
        // Remove existing strength indicator
        const existing = container.querySelector('.password-strength');
        if (existing) existing.remove();
        
        if (password.length > 0) {
            const strengthHTML = `
                <div class="password-strength">
                    <div class="password-strength-bar ${strength.level}"></div>
                </div>
                <div class="password-strength-text ${strength.level}">
                    Password strength: ${strength.level}
                </div>
            `;
            container.insertAdjacentHTML('beforeend', strengthHTML);
        }
    }

    setLoading(button, loading) {
        if (loading) {
            button.disabled = true;
            button.classList.add('loading');
        } else {
            button.disabled = false;
            button.classList.remove('loading');
        }
    }

    showError(message) {
        this.clearMessages();
        const authSection = document.getElementById('authSection');
        const errorDiv = document.createElement('div');
        errorDiv.className = 'error-message';
        errorDiv.textContent = message;
        authSection.insertBefore(errorDiv, authSection.firstChild);
        
        setTimeout(() => {
            if (errorDiv.parentNode) {
                errorDiv.remove();
            }
        }, 5000);
    }

    showSuccess(message) {
        this.clearMessages();
        
        // For auth section
        if (this.currentView === 'auth') {
            const authSection = document.getElementById('authSection');
            const successDiv = document.createElement('div');
            successDiv.className = 'success-message';
            successDiv.textContent = message;
            authSection.insertBefore(successDiv, authSection.firstChild);
            
            setTimeout(() => {
                if (successDiv.parentNode) {
                    successDiv.remove();
                }
            }, 3000);
        } else {
            // For dashboard/other sections - show a toast-like notification
            this.showToast(message, 'success');
        }
    }

    showToast(message, type = 'success') {
        // Create toast notification
        const toast = document.createElement('div');
        toast.className = `toast toast-${type}`;
        toast.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: ${type === 'success' ? 'linear-gradient(135deg, #10b981 0%, #059669 100%)' : '#ef4444'};
            color: white;
            padding: 16px 24px;
            border-radius: 12px;
            box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
            z-index: 1000;
            font-weight: 500;
            max-width: 400px;
            transform: translateX(100%);
            transition: transform 0.3s ease;
        `;
        toast.textContent = message;
        
        document.body.appendChild(toast);
        
        // Animate in
        setTimeout(() => {
            toast.style.transform = 'translateX(0)';
        }, 100);
        
        // Animate out and remove
        setTimeout(() => {
            toast.style.transform = 'translateX(100%)';
            setTimeout(() => {
                if (toast.parentNode) {
                    toast.remove();
                }
            }, 300);
        }, 4000);
    }

    clearMessages() {
        const messages = document.querySelectorAll('.error-message, .success-message');
        messages.forEach(msg => msg.remove());
    }
}

// Initialize app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    // Wait for challenges to load
    setTimeout(() => {
        window.zenHabitApp = new ZenHabitApp();
    }, 100);
});
