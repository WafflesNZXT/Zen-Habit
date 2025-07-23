// Account Dropdown Management System
class AccountDropdown {
    constructor() {
        this.dropdown = document.getElementById('accountDropdown');
        this.isVisible = false;
        this.currentTab = 'profile';
        this.profilePicture = null;
        
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.loadUserData();
        this.loadThemePreference();
        this.setupDragAndDrop();
    }

    setupEventListeners() {
        // Tab switching
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.switchTab(e.target.dataset.tab);
            });
        });

        // Profile picture upload
        document.getElementById('uploadProfileBtn').addEventListener('click', () => {
            document.getElementById('profilePictureInput').click();
        });

        document.getElementById('profilePictureInput').addEventListener('change', (e) => {
            this.handleProfilePictureUpload(e.target.files[0]);
        });

        // Profile picture click to upload
        document.getElementById('profilePicture').addEventListener('click', () => {
            document.getElementById('profilePictureInput').click();
        });

        // Name saving
        document.getElementById('saveNameBtn').addEventListener('click', () => {
            this.saveName();
        });

        // Enter key for name input
        document.getElementById('profileName').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.saveName();
            }
        });

        // Dark mode toggle
        document.getElementById('darkModeToggle').addEventListener('change', (e) => {
            this.toggleDarkMode(e.target.checked);
        });

        // Account deletion
        document.getElementById('deleteAccountBtn').addEventListener('click', () => {
            this.showDeleteConfirmation();
        });

        document.getElementById('cancelDeleteBtn').addEventListener('click', () => {
            this.hideDeleteConfirmation();
        });

        document.getElementById('confirmDeleteBtn').addEventListener('click', () => {
            this.deleteAccount();
        });

        // Close dropdown when clicking outside
        document.addEventListener('click', (e) => {
            if (!this.dropdown.contains(e.target) && !e.target.closest('.account-icon')) {
                this.hide();
            }
        });

        // Close modal when clicking overlay
        document.getElementById('deleteConfirmModal').addEventListener('click', (e) => {
            if (e.target.id === 'deleteConfirmModal') {
                this.hideDeleteConfirmation();
            }
        });
    }

    setupDragAndDrop() {
        const container = document.querySelector('.profile-picture-container');
        
        ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
            container.addEventListener(eventName, this.preventDefaults, false);
        });

        ['dragenter', 'dragover'].forEach(eventName => {
            container.addEventListener(eventName, () => {
                container.classList.add('drag-over');
            }, false);
        });

        ['dragleave', 'drop'].forEach(eventName => {
            container.addEventListener(eventName, () => {
                container.classList.remove('drag-over');
            }, false);
        });

        container.addEventListener('drop', (e) => {
            const files = e.dataTransfer.files;
            if (files.length > 0 && files[0].type.startsWith('image/')) {
                this.handleProfilePictureUpload(files[0]);
            }
        }, false);
    }

    preventDefaults(e) {
        e.preventDefault();
        e.stopPropagation();
    }

    show() {
        this.dropdown.classList.add('show');
        this.isVisible = true;
        this.loadUserData();
    }

    hide() {
        this.dropdown.classList.remove('show');
        this.isVisible = false;
    }

    toggle() {
        if (this.isVisible) {
            this.hide();
        } else {
            this.show();
        }
    }

    switchTab(tabName) {
        // Update tab buttons
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        document.querySelector(`[data-tab="${tabName}"]`).classList.add('active');

        // Update tab content
        document.querySelectorAll('.tab-content').forEach(content => {
            content.classList.remove('active');
        });
        document.getElementById(`${tabName}Tab`).classList.add('active');

        this.currentTab = tabName;
    }

    loadUserData() {
        if (!authManager.isLoggedIn()) return;

        const user = authManager.getCurrentUser();
        if (!user) return;

        // Update dropdown header
        document.getElementById('dropdownUserName').textContent = user.name;
        document.getElementById('dropdownUserEmail').textContent = user.email;

        // Update settings tab
        document.getElementById('settingsUserName').textContent = user.name;
        document.getElementById('maskedEmail').textContent = this.maskEmail(user.email);

        // Update profile tab
        document.getElementById('profileName').value = user.name;

        // Load profile picture
        this.loadProfilePicture();

        // Update avatars
        this.updateAvatars(user.name, this.profilePicture);
    }

    updateAvatars(name, profilePicture) {
        const avatarText = name.charAt(0).toUpperCase();
        
        // Update dropdown header avatar
        document.getElementById('dropdownAvatarText').textContent = avatarText;
        const dropdownImg = document.getElementById('dropdownAvatarImg');
        
        // Update profile tab avatar
        document.getElementById('profileAvatarText').textContent = avatarText;
        const profileImg = document.getElementById('profileAvatarImg');

        if (profilePicture) {
            dropdownImg.src = profilePicture;
            dropdownImg.style.display = 'block';
            document.getElementById('dropdownAvatarText').style.display = 'none';

            profileImg.src = profilePicture;
            profileImg.style.display = 'block';
            document.getElementById('profileAvatarText').style.display = 'none';
        } else {
            dropdownImg.style.display = 'none';
            document.getElementById('dropdownAvatarText').style.display = 'flex';

            profileImg.style.display = 'none';
            document.getElementById('profileAvatarText').style.display = 'flex';
        }
    }

    maskEmail(email) {
        const [username, domain] = email.split('@');
        if (username.length <= 2) {
            return `${username[0]}***@${domain}`;
        }
        const maskedUsername = username[0] + '*'.repeat(username.length - 2) + username[username.length - 1];
        return `${maskedUsername}@${domain}`;
    }

    handleProfilePictureUpload(file) {
        if (!file || !file.type.startsWith('image/')) {
            this.showNotification('Please select a valid image file', 'error');
            return;
        }

        if (file.size > 5 * 1024 * 1024) { // 5MB limit
            this.showNotification('Image size must be less than 5MB', 'error');
            return;
        }

        const reader = new FileReader();
        reader.onload = (e) => {
            this.profilePicture = e.target.result;
            this.saveProfilePicture();
            this.updateAvatars(authManager.getCurrentUser().name, this.profilePicture);
            
            // Add success animation
            document.getElementById('profilePicture').classList.add('upload-success');
            setTimeout(() => {
                document.getElementById('profilePicture').classList.remove('upload-success');
            }, 500);
            
            this.showNotification('Profile picture updated successfully!', 'success');
        };
        reader.readAsDataURL(file);
    }

    saveProfilePicture() {
        const user = authManager.getCurrentUser();
        if (user) {
            localStorage.setItem(`zenHabitProfilePic_${user.id}`, this.profilePicture);
        }
    }

    loadProfilePicture() {
        const user = authManager.getCurrentUser();
        if (user) {
            const saved = localStorage.getItem(`zenHabitProfilePic_${user.id}`);
            if (saved) {
                this.profilePicture = saved;
            }
        }
    }

    saveName() {
        const newName = document.getElementById('profileName').value.trim();
        if (!newName) {
            this.showNotification('Name cannot be empty', 'error');
            return;
        }

        try {
            authManager.updateProfile({ name: newName });
            this.loadUserData();
            this.showNotification('Name updated successfully!', 'success');
            
            // Update the main app UI
            if (window.app) {
                window.app.updateUI();
            }
        } catch (error) {
            this.showNotification(error.message, 'error');
        }
    }

    toggleDarkMode(isDark) {
        const theme = isDark ? 'dark' : 'light';
        document.documentElement.setAttribute('data-theme', theme);
        localStorage.setItem('zenHabitTheme', theme);
        
        this.showNotification(`Switched to ${theme} mode`, 'success');
    }

    loadThemePreference() {
        const savedTheme = localStorage.getItem('zenHabitTheme') || 'light';
        const isDark = savedTheme === 'dark';
        
        document.documentElement.setAttribute('data-theme', savedTheme);
        document.getElementById('darkModeToggle').checked = isDark;
    }

    showDeleteConfirmation() {
        document.getElementById('deleteConfirmModal').classList.add('show');
    }

    hideDeleteConfirmation() {
        document.getElementById('deleteConfirmModal').classList.remove('show');
    }

    deleteAccount() {
        try {
            const user = authManager.getCurrentUser();
            
            // Delete profile picture
            if (user) {
                localStorage.removeItem(`zenHabitProfilePic_${user.id}`);
            }
            
            // Delete account through auth manager
            authManager.deleteAccount();
            
            // Hide modal and dropdown
            this.hideDeleteConfirmation();
            this.hide();
            
            // Update main app UI
            if (window.app) {
                window.app.checkAuthState();
                window.app.updateUI();
            }
            
            this.showNotification('Account deleted successfully', 'success');
        } catch (error) {
            this.showNotification(error.message, 'error');
        }
    }

    showNotification(message, type = 'info') {
        // Create notification element
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.textContent = message;
        
        // Style the notification
        Object.assign(notification.style, {
            position: 'fixed',
            top: '20px',
            right: '20px',
            padding: '12px 20px',
            borderRadius: '8px',
            color: 'white',
            fontWeight: '500',
            fontSize: '14px',
            zIndex: '3000',
            opacity: '0',
            transform: 'translateY(-10px)',
            transition: 'all 0.3s ease',
            maxWidth: '300px',
            wordWrap: 'break-word'
        });

        // Set background color based on type
        const colors = {
            success: '#28a745',
            error: '#dc3545',
            info: '#667eea'
        };
        notification.style.background = colors[type] || colors.info;

        // Add to DOM
        document.body.appendChild(notification);

        // Animate in
        setTimeout(() => {
            notification.style.opacity = '1';
            notification.style.transform = 'translateY(0)';
        }, 10);

        // Remove after 3 seconds
        setTimeout(() => {
            notification.style.opacity = '0';
            notification.style.transform = 'translateY(-10px)';
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
            }, 300);
        }, 3000);
    }

    // Method to update account icon in navigation
    updateAccountIcon(name, profilePicture) {
        const accountIcon = document.querySelector('.account-icon');
        if (!accountIcon) return;

        const avatarText = accountIcon.querySelector('span');
        const avatarImg = accountIcon.querySelector('img');

        if (avatarText) {
            avatarText.textContent = name.charAt(0).toUpperCase();
        }

        if (profilePicture && avatarImg) {
            avatarImg.src = profilePicture;
            avatarImg.style.display = 'block';
            if (avatarText) avatarText.style.display = 'none';
        } else {
            if (avatarImg) avatarImg.style.display = 'none';
            if (avatarText) avatarText.style.display = 'flex';
        }
    }
}

// Initialize account dropdown when DOM is loaded
let accountDropdown;
document.addEventListener('DOMContentLoaded', () => {
    accountDropdown = new AccountDropdown();
    
    // Make it globally available
    window.accountDropdown = accountDropdown;
});

