/**
 * DMA Auth Core - Simulated Backend Logic
 */

// --- AUTOMATIC PURGE: adetijosue@gmail.com ---
(function() {
    try {
        const targetEmail = "adetijosue@gmail.com".toLowerCase();
        
        // 1. Purge from Users database
        const usersData = localStorage.getItem('dma_users_db');
        if (usersData) {
            let users = JSON.parse(usersData);
            const originalLength = users.length;
            users = users.filter(u => u.email.toLowerCase() !== targetEmail);
            if (users.length !== originalLength) {
                localStorage.setItem('dma_users_db', JSON.stringify(users));
                console.warn(`[DMA Core] Le compte ${targetEmail} a été purgé automatiquement de la base de données locale.`);
            }
        }
        
        // 2. Purge from Current Active Session
        const sessionData = localStorage.getItem('dma_current_session');
        if (sessionData) {
            const currentSession = JSON.parse(sessionData);
            if (currentSession.email.toLowerCase() === targetEmail) {
                localStorage.removeItem('dma_current_session');
                console.warn(`[DMA Core] Session active pour ${targetEmail} purgée.`);
                // If they are on the dashboard, redirect to home
                if (window.location.pathname.includes('dashboard.html') || window.location.pathname.includes('delete-account.html')) {
                    window.location.href = 'index.html';
                }
            }
        }

        // 3. Purge community posts associated with this user
        const postsData = localStorage.getItem('dma_community_posts');
        if (postsData) {
            let posts = JSON.parse(postsData);
            const originalLength = posts.length;
            posts = posts.filter(p => {
                const authorEmail = p.userEmail || (p.userName === "Josue ADETI" ? targetEmail : "");
                return authorEmail.toLowerCase() !== targetEmail;
            });
            if (posts.length !== originalLength) {
                localStorage.setItem('dma_community_posts', JSON.stringify(posts));
                console.warn(`[DMA Core] Publications de la communauté pour ${targetEmail} purgées.`);
            }
        }
    } catch (e) {
        console.error("[DMA Core] Error in auto-purge routine:", e);
    }
})();

const DMA_DB_KEY = 'dma_users_db';
const DMA_SESSION_KEY = 'dma_current_session';

const AuthCore = {
    // Utility: XSS Protection
    escapeHTML(str) {
        if (!str) return '';
        const div = document.createElement('div');
        div.textContent = str;
        return div.innerHTML;
    },

    // Utility: SHA-256 Hashing for Passwords
    async hashPassword(password) {
        const encoder = new TextEncoder();
        const data = encoder.encode(password);
        const hashBuffer = await crypto.subtle.digest('SHA-256', data);
        const hashArray = Array.from(new Uint8Array(hashBuffer));
        return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    },

    // Get all users from "DB"
    getUsers() {
        const data = localStorage.getItem(DMA_DB_KEY);
        return data ? JSON.parse(data) : [];
    },

    // Register a new user
    async register(userData) {
        const users = this.getUsers();
        if (users.find(u => u.email === userData.email)) {
            return { success: false, message: "Cet email est déjà utilisé." };
        }
        
        const hashedPassword = await this.hashPassword(userData.password);
        
        const newUser = {
            ...userData,
            name: this.escapeHTML(userData.name),
            email: this.escapeHTML(userData.email),
            password: hashedPassword,
            enrolledCourses: [], // Initially empty
            photo: null,
            level: 'beginner',
            interests: [],
            setupCompleted: false, // Flag for onboarding
            setupPostponed: false, // Flag for delayed onboarding
            courseProgress: {}, // Store progress: { 'course-id': { completedLessons: ['lesson1', 'lesson2'] } }
            joinDate: new Date().toISOString()
        };
        
        users.push(newUser);
        localStorage.setItem(DMA_DB_KEY, JSON.stringify(users));
        return { success: true };
    },

    // Login user
    async login(email, password) {
        const users = this.getUsers();
        const hashedPassword = await this.hashPassword(password);
        const user = users.find(u => u.email === email && u.password === hashedPassword);
        
        if (user) {
            localStorage.setItem(DMA_SESSION_KEY, JSON.stringify(user));
            return { success: true };
        }
        return { success: false, message: "Email ou mot de passe incorrect." };
    },

    // Logout
    logout() {
        localStorage.removeItem(DMA_SESSION_KEY);
        window.location.href = 'index.html';
    },

    // Get current logged in user
    getCurrentUser() {
        const session = localStorage.getItem(DMA_SESSION_KEY);
        return session ? JSON.parse(session) : null;
    },

    // Enroll in a course
    enrollCourse(courseId) {
        const user = this.getCurrentUser();
        if (!user) return { success: false, message: "Vous devez être connecté." };
        
        if (!user.enrolledCourses.includes(courseId)) {
            user.enrolledCourses.push(courseId);
            
            // Update session
            localStorage.setItem(DMA_SESSION_KEY, JSON.stringify(user));
            
            // Update DB
            const users = this.getUsers();
            const userIndex = users.findIndex(u => u.email === user.email);
            if (userIndex !== -1) {
                users[userIndex].enrolledCourses = user.enrolledCourses;
                localStorage.setItem(DMA_DB_KEY, JSON.stringify(users));
            }
        }
        return { success: true };
    },

    // Check if enrolled
    isEnrolled(courseId) {
        const user = this.getCurrentUser();
        return user ? user.enrolledCourses.includes(courseId) : false;
    },

    // Postpone profile setup
    postponeSetup() {
        const user = this.getCurrentUser();
        if (user) {
            user.setupPostponed = true;
            localStorage.setItem(DMA_SESSION_KEY, JSON.stringify(user));
            
            // Persist to DB as well so it survives logout/login
            const users = this.getUsers();
            const userIndex = users.findIndex(u => u.email === user.email);
            if (userIndex !== -1) {
                users[userIndex].setupPostponed = true;
                localStorage.setItem(DMA_DB_KEY, JSON.stringify(users));
            }
        }
    },

    // Update course progress
    updateCourseProgress(courseId, lessonId) {
        const user = this.getCurrentUser();
        if (user) {
            if (!user.courseProgress) user.courseProgress = {};
            if (!user.courseProgress[courseId]) user.courseProgress[courseId] = { completedLessons: [] };
            
            if (!user.courseProgress[courseId].completedLessons.includes(lessonId)) {
                user.courseProgress[courseId].completedLessons.push(lessonId);
                
                localStorage.setItem(DMA_SESSION_KEY, JSON.stringify(user));
                
                const users = this.getUsers();
                const userIndex = users.findIndex(u => u.email === user.email);
                if (userIndex !== -1) {
                    users[userIndex].courseProgress = user.courseProgress;
                    localStorage.setItem(DMA_DB_KEY, JSON.stringify(users));
                }
            }
        }
    },

    // Delete account
    async deleteAccount(password) {
        const user = this.getCurrentUser();
        if (!user) return { success: false, message: "Utilisateur non connecté." };
        
        const hashedPassword = await this.hashPassword(password);
        if (user.password !== hashedPassword) {
            return { success: false, message: "Mot de passe incorrect." };
        }

        // Remove from DB
        const users = this.getUsers();
        const updatedUsers = users.filter(u => u.email !== user.email);
        localStorage.setItem(DMA_DB_KEY, JSON.stringify(updatedUsers));

        // Clear session
        this.logout();
        return { success: true };
    },

    // Update profile details
    updateProfile(name, level, interests) {
        const user = this.getCurrentUser();
        if (!user) return { success: false, message: "Utilisateur non connecté." };

        user.name = this.escapeHTML(name);
        user.level = level;
        user.interests = interests;

        // Update session
        localStorage.setItem(DMA_SESSION_KEY, JSON.stringify(user));

        // Update DB
        const users = this.getUsers();
        const userIndex = users.findIndex(u => u.email === user.email);
        if (userIndex !== -1) {
            users[userIndex].name = user.name;
            users[userIndex].level = user.level;
            users[userIndex].interests = user.interests;
            localStorage.setItem(DMA_DB_KEY, JSON.stringify(users));
        }
        return { success: true, user };
    },

    // Change password
    async changePassword(currentPassword, newPassword) {
        const user = this.getCurrentUser();
        if (!user) return { success: false, message: "Utilisateur non connecté." };

        const hashedCurrent = await this.hashPassword(currentPassword);
        if (user.password !== hashedCurrent) {
            return { success: false, message: "Le mot de passe actuel est incorrect." };
        }

        const hashedNew = await this.hashPassword(newPassword);
        user.password = hashedNew;

        // Update session
        localStorage.setItem(DMA_SESSION_KEY, JSON.stringify(user));

        // Update DB
        const users = this.getUsers();
        const userIndex = users.findIndex(u => u.email === user.email);
        if (userIndex !== -1) {
            users[userIndex].password = hashedNew;
            localStorage.setItem(DMA_DB_KEY, JSON.stringify(users));
        }
        return { success: true };
    },

    // Reset password
    async resetPassword(email, newPassword) {
        const users = this.getUsers();
        const userIndex = users.findIndex(u => u.email === email);
        if (userIndex === -1) {
            return { success: false, message: "Aucun compte associé à cet e-mail." };
        }

        const hashedPassword = await this.hashPassword(newPassword);
        users[userIndex].password = hashedPassword;
        localStorage.setItem(DMA_DB_KEY, JSON.stringify(users));

        // If the current session is this user, update it too
        const session = this.getCurrentUser();
        if (session && session.email === email) {
            session.password = hashedPassword;
            localStorage.setItem(DMA_SESSION_KEY, JSON.stringify(session));
        }

        return { success: true };
    },

    // Purge everything
    purgeAllData() {
        localStorage.removeItem(DMA_DB_KEY);
        localStorage.removeItem(DMA_SESSION_KEY);
        localStorage.removeItem('dma_posts_db');
        localStorage.removeItem('dma_comments_db');
        return { success: true };
    }
};
