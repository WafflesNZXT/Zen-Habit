// Challenge Management System for Zen Habit
class ChallengeManager {
    constructor() {
        this.challenges = [];
        this.loadChallenges();
    }

    async loadChallenges() {
        try {
            const response = await fetch('data/challenges.json');
            this.challenges = await response.json();
        } catch (error) {
            console.error('Error loading challenges:', error);
            // Fallback challenges if file can't be loaded
            this.challenges = [
                {
                    id: 1,
                    title: "Drink a glass of water mindfully",
                    description: "Hydrate your body with intention. Feel the water's temperature, taste, and notice how it nourishes you.",
                    category: "wellness",
                    icon: "💧",
                    difficulty: "easy"
                },
                {
                    id: 2,
                    title: "Practice mindful breathing for 2 minutes",
                    description: "Find a quiet space and focus on your breath. Inhale slowly for 4 counts, hold for 4, then exhale for 6.",
                    category: "mental",
                    icon: "🌬️",
                    difficulty: "easy"
                },
                {
                    id: 3,
                    title: "Take 10 conscious breaths",
                    description: "Pause whatever you're doing and take 10 deep, intentional breaths. Notice the sensation of air entering and leaving your body.",
                    category: "mental",
                    icon: "🧘",
                    difficulty: "easy"
                }
            ];
        }
    }

    // Get today's challenge based on date
    getTodaysChallenge() {
        const today = new Date();
        const dayOfYear = this.getDayOfYear(today);
        const challengeIndex = dayOfYear % this.challenges.length;
        return this.challenges[challengeIndex];
    }

    // Get challenge by ID
    getChallengeById(id) {
        return this.challenges.find(challenge => challenge.id === id);
    }

    // Get challenges by category
    getChallengesByCategory(category) {
        return this.challenges.filter(challenge => challenge.category === category);
    }

    // Get random challenge
    getRandomChallenge() {
        const randomIndex = Math.floor(Math.random() * this.challenges.length);
        return this.challenges[randomIndex];
    }

    // Helper function to get day of year
    getDayOfYear(date) {
        const start = new Date(date.getFullYear(), 0, 0);
        const diff = date - start;
        const oneDay = 1000 * 60 * 60 * 24;
        return Math.floor(diff / oneDay);
    }

    // Get challenge for specific date
    getChallengeForDate(date) {
        const dayOfYear = this.getDayOfYear(date);
        const challengeIndex = dayOfYear % this.challenges.length;
        return this.challenges[challengeIndex];
    }

    // Get all challenges
    getAllChallenges() {
        return this.challenges;
    }

    // Get challenges by difficulty
    getChallengesByDifficulty(difficulty) {
        return this.challenges.filter(challenge => challenge.difficulty === difficulty);
    }

    // Search challenges by title or description
    searchChallenges(query) {
        const lowercaseQuery = query.toLowerCase();
        return this.challenges.filter(challenge => 
            challenge.title.toLowerCase().includes(lowercaseQuery) ||
            challenge.description.toLowerCase().includes(lowercaseQuery)
        );
    }

    // Get mindfulness-focused challenges
    getMindfulnessChallenges() {
        return this.challenges.filter(challenge => 
            challenge.category === 'mental' || 
            challenge.title.toLowerCase().includes('mindful') ||
            challenge.description.toLowerCase().includes('mindful')
        );
    }

    // Get wellness challenges
    getWellnessChallenges() {
        return this.challenges.filter(challenge => challenge.category === 'wellness');
    }

    // Get physical challenges
    getPhysicalChallenges() {
        return this.challenges.filter(challenge => challenge.category === 'physical');
    }

    // Get social challenges
    getSocialChallenges() {
        return this.challenges.filter(challenge => challenge.category === 'social');
    }
}

// Progress tracking system for Zen Habit
class ProgressTracker {
    constructor() {
        this.storageKey = 'zenHabitProgress';
        this.progress = this.loadProgress();
    }

    loadProgress() {
        const saved = localStorage.getItem(this.storageKey);
        if (saved) {
            return JSON.parse(saved);
        }
        return {
            completedChallenges: {},
            streak: 0,
            totalCompleted: 0,
            lastCompletedDate: null,
            joinDate: new Date().toISOString().split('T')[0],
            longestStreak: 0,
            mindfulMoments: 0
        };
    }

    saveProgress() {
        localStorage.setItem(this.storageKey, JSON.stringify(this.progress));
    }

    // Mark today's challenge as complete
    completeToday() {
        const today = new Date().toISOString().split('T')[0];
        const challenge = challengeManager.getTodaysChallenge();
        
        if (!this.progress.completedChallenges[today]) {
            this.progress.completedChallenges[today] = {
                challengeId: challenge.id,
                completedAt: new Date().toISOString(),
                status: 'completed'
            };
            
            this.progress.totalCompleted++;
            this.progress.mindfulMoments++;
            this.updateStreak();
            this.progress.lastCompletedDate = today;
            
            // Update longest streak if current streak is higher
            if (this.progress.streak > this.progress.longestStreak) {
                this.progress.longestStreak = this.progress.streak;
            }
            
            this.saveProgress();
            return true;
        }
        return false;
    }

    // Skip today's challenge
    skipToday() {
        const today = new Date().toISOString().split('T')[0];
        const challenge = challengeManager.getTodaysChallenge();
        
        if (!this.progress.completedChallenges[today]) {
            this.progress.completedChallenges[today] = {
                challengeId: challenge.id,
                skippedAt: new Date().toISOString(),
                status: 'skipped'
            };
            
            this.resetStreak();
            this.saveProgress();
            return true;
        }
        return false;
    }

    // Check if today's challenge is completed
    isTodayCompleted() {
        const today = new Date().toISOString().split('T')[0];
        const todayProgress = this.progress.completedChallenges[today];
        return todayProgress && todayProgress.status === 'completed';
    }

    // Check if today's challenge is skipped
    isTodaySkipped() {
        const today = new Date().toISOString().split('T')[0];
        const todayProgress = this.progress.completedChallenges[today];
        return todayProgress && todayProgress.status === 'skipped';
    }

    // Update streak calculation
    updateStreak() {
        const today = new Date();
        let currentStreak = 0;
        let checkDate = new Date(today);

        // Count consecutive days backwards from today
        while (true) {
            const dateStr = checkDate.toISOString().split('T')[0];
            const dayProgress = this.progress.completedChallenges[dateStr];
            
            if (dayProgress && dayProgress.status === 'completed') {
                currentStreak++;
                checkDate.setDate(checkDate.getDate() - 1);
            } else {
                break;
            }
        }

        this.progress.streak = currentStreak;
    }

    // Reset streak
    resetStreak() {
        this.progress.streak = 0;
    }

    // Get current streak
    getCurrentStreak() {
        this.updateStreak(); // Recalculate to ensure accuracy
        return this.progress.streak;
    }

    // Get longest streak
    getLongestStreak() {
        return this.progress.longestStreak;
    }

    // Get total completed challenges
    getTotalCompleted() {
        return this.progress.totalCompleted;
    }

    // Get mindful moments count
    getMindfulMoments() {
        return this.progress.mindfulMoments;
    }

    // Get progress for a specific date
    getProgressForDate(date) {
        const dateStr = date.toISOString().split('T')[0];
        return this.progress.completedChallenges[dateStr] || null;
    }

    // Get recent challenges (last 7 days)
    getRecentChallenges() {
        const recent = [];
        const today = new Date();
        
        for (let i = 0; i < 7; i++) {
            const date = new Date(today);
            date.setDate(date.getDate() - i);
            const dateStr = date.toISOString().split('T')[0];
            const challenge = challengeManager.getChallengeForDate(date);
            const progress = this.getProgressForDate(date);
            
            recent.push({
                date: dateStr,
                challenge: challenge,
                progress: progress,
                isToday: i === 0
            });
        }
        
        return recent;
    }

    // Get week progress for calendar view
    getWeekProgress() {
        const week = [];
        const today = new Date();
        const startOfWeek = new Date(today);
        startOfWeek.setDate(today.getDate() - today.getDay()); // Start from Sunday
        
        for (let i = 0; i < 7; i++) {
            const date = new Date(startOfWeek);
            date.setDate(startOfWeek.getDate() + i);
            const dateStr = date.toISOString().split('T')[0];
            const progress = this.getProgressForDate(date);
            const isToday = dateStr === today.toISOString().split('T')[0];
            const isFuture = date > today;
            
            week.push({
                date: dateStr,
                day: date.getDate(),
                dayName: date.toLocaleDateString('en', { weekday: 'short' }),
                progress: progress,
                isToday: isToday,
                isFuture: isFuture
            });
        }
        
        return week;
    }

    // Get completion rate for the last 30 days
    getCompletionRate(days = 30) {
        const today = new Date();
        let completed = 0;
        let total = 0;
        
        for (let i = 0; i < days; i++) {
            const date = new Date(today);
            date.setDate(date.getDate() - i);
            const dateStr = date.toISOString().split('T')[0];
            const progress = this.getProgressForDate(date);
            
            if (date <= today) { // Don't count future dates
                total++;
                if (progress && progress.status === 'completed') {
                    completed++;
                }
            }
        }
        
        return total > 0 ? Math.round((completed / total) * 100) : 0;
    }

    // Get days since joining
    getDaysSinceJoining() {
        const joinDate = new Date(this.progress.joinDate);
        const today = new Date();
        const diffTime = Math.abs(today - joinDate);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return diffDays;
    }

    // Clear all progress (for testing or reset)
    clearProgress() {
        this.progress = {
            completedChallenges: {},
            streak: 0,
            totalCompleted: 0,
            lastCompletedDate: null,
            joinDate: new Date().toISOString().split('T')[0],
            longestStreak: 0,
            mindfulMoments: 0
        };
        this.saveProgress();
    }

    // Export progress data
    exportProgress() {
        return {
            ...this.progress,
            exportDate: new Date().toISOString(),
            version: '1.0'
        };
    }

    // Import progress data
    importProgress(data) {
        if (data && data.version === '1.0') {
            this.progress = {
                completedChallenges: data.completedChallenges || {},
                streak: data.streak || 0,
                totalCompleted: data.totalCompleted || 0,
                lastCompletedDate: data.lastCompletedDate || null,
                joinDate: data.joinDate || new Date().toISOString().split('T')[0],
                longestStreak: data.longestStreak || 0,
                mindfulMoments: data.mindfulMoments || 0
            };
            this.saveProgress();
            return true;
        }
        return false;
    }
}

// Initialize global instances
const challengeManager = new ChallengeManager();
const progressTracker = new ProgressTracker();

