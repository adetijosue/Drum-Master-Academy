/**
 * DMA Auth Core - Hybrid Cloud (Supabase) & Local Simulation Backend Logic
 */

// Dynamically load supabase-config.js if not already present
(function() {
    if (!document.querySelector('script[src*="supabase-config.js"]')) {
        const script = document.createElement('script');
        script.src = 'assets/js/supabase-config.js';
        script.async = false;
        document.head.appendChild(script);
    }
})();

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
                console.warn(`[DMA Core] Le compte ${targetEmail} a été purgé de la base locale.`);
            }
        }
        
        // 2. Purge from Current Active Session
        const sessionData = localStorage.getItem('dma_current_session');
        if (sessionData) {
            const currentSession = JSON.parse(sessionData);
            if (currentSession.email.toLowerCase() === targetEmail) {
                localStorage.removeItem('dma_current_session');
                console.warn(`[DMA Core] Session active pour ${targetEmail} purgée.`);
                if (window.location.pathname.includes('dashboard.html') || window.location.pathname.includes('delete-account.html')) {
                    window.location.href = 'index.html';
                }
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

    // Utility: SHA-256 Hashing for Passwords (used in simulated mode)
    async hashPassword(password) {
        const encoder = new TextEncoder();
        const data = encoder.encode(password);
        const hashBuffer = await crypto.subtle.digest('SHA-256', data);
        const hashArray = Array.from(new Uint8Array(hashBuffer));
        return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    },

    // Get all simulated users
    getUsers() {
        const data = localStorage.getItem(DMA_DB_KEY);
        return data ? JSON.parse(data) : [];
    },

    // Check if Supabase client is configured and available
    async getSupabase() {
        if (window.DMA_SUPABASE && window.DMA_SUPABASE.isConfigured()) {
            return await window.DMA_SUPABASE.initClient();
        }
        return null;
    },

    // Register a new user (Hybrid Local/Supabase)
    async register(userData) {
        const client = await this.getSupabase();
        if (client) {
            console.log('[DMA AuthCore] Inscription en cours via Supabase Cloud...');
            // Calculate redirect URL to bring the user back to the correct production domain
            const redirectUrl = window.location.origin + (window.location.pathname.includes('/Drum-Master-Academy') ? '/Drum-Master-Academy/login.html' : '/login.html');
            
            const { data, error } = await client.auth.signUp({
                email: userData.email,
                password: userData.password,
                options: {
                    emailRedirectTo: redirectUrl,
                    data: {
                        name: userData.name
                    }
                }
            });
            if (error) {
                return { success: false, message: error.message };
            }
            return { success: true };
        }

        // Local Simulation Fallback
        console.log('[DMA AuthCore] Inscription en cours via Simulation Locale...');
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
            enrolledCourses: [],
            photo: null,
            level: 'beginner',
            interests: [],
            setupCompleted: false,
            setupPostponed: false,
            courseProgress: {},
            joinDate: new Date().toISOString()
        };
        
        users.push(newUser);
        localStorage.setItem(DMA_DB_KEY, JSON.stringify(users));
        return { success: true };
    },

    // Login user (Hybrid Local/Supabase)
    async login(email, password) {
        const client = await this.getSupabase();
        if (client) {
            console.log('[DMA AuthCore] Connexion en cours via Supabase Cloud...');
            const { data, error } = await client.auth.signInWithPassword({
                email: email,
                password: password
            });
            if (error) {
                return { success: false, message: error.message };
            }

            // Fetch the profile associated with the user
            const { data: profile, error: profileError } = await client
                .from('profiles')
                .select('*')
                .eq('id', data.user.id)
                .single();

            if (profileError) {
                console.warn('[DMA AuthCore] Impossible de récupérer le profil Supabase, création d\'un profil temporaire:', profileError);
                // Create a basic profile fallback
                const fallbackProfile = {
                    id: data.user.id,
                    name: data.user.user_metadata?.name || 'Batteur DMA',
                    email: email,
                    enrolledCourses: [],
                    photo: null,
                    level: 'beginner',
                    interests: [],
                    setupCompleted: false,
                    setupPostponed: false,
                    courseProgress: {},
                    joinDate: new Date().toISOString()
                };
                localStorage.setItem(DMA_SESSION_KEY, JSON.stringify(fallbackProfile));
                return { success: true };
            }

            // Map Supabase Profile to DMA Session Object
            const sessionUser = {
                id: profile.id,
                name: profile.name,
                email: profile.email,
                enrolledCourses: profile.enrolled_courses || [],
                photo: profile.photo_url,
                level: profile.level || 'beginner',
                interests: profile.interests || [],
                setupCompleted: profile.setup_completed || false,
                setupPostponed: profile.setup_postponed || false,
                courseProgress: profile.course_progress || {},
                joinDate: profile.join_date
            };

            localStorage.setItem(DMA_SESSION_KEY, JSON.stringify(sessionUser));
            return { success: true };
        }

        // Local Simulation Fallback
        console.log('[DMA AuthCore] Connexion en cours via Simulation Locale...');
        const users = this.getUsers();
        const hashedPassword = await this.hashPassword(password);
        const user = users.find(u => u.email === email && u.password === hashedPassword);
        
        if (user) {
            localStorage.setItem(DMA_SESSION_KEY, JSON.stringify(user));
            return { success: true };
        }
        return { success: false, message: "Email ou mot de passe incorrect." };
    },

    // Logout (Hybrid Local/Supabase)
    async logout() {
        const client = await this.getSupabase();
        if (client) {
            await client.auth.signOut();
        }
        localStorage.removeItem(DMA_SESSION_KEY);
        window.location.href = 'index.html';
    },

    // Get current logged in user from session cache
    getCurrentUser() {
        const session = localStorage.getItem(DMA_SESSION_KEY);
        return session ? JSON.parse(session) : null;
    },

    // Enroll in a course (Hybrid Local/Supabase)
    async enrollCourse(courseId) {
        const user = this.getCurrentUser();
        if (!user) return { success: false, message: "Vous devez être connecté." };
        
        if (!user.enrolledCourses.includes(courseId)) {
            user.enrolledCourses.push(courseId);
            
            // Sync session cache
            localStorage.setItem(DMA_SESSION_KEY, JSON.stringify(user));
            
            // Sync cloud
            const client = await this.getSupabase();
            if (client) {
                const { error } = await client
                    .from('profiles')
                    .update({ enrolled_courses: user.enrolledCourses })
                    .eq('id', user.id);
                if (error) {
                    console.error('[DMA AuthCore] Erreur de synchronisation Supabase course enrollment:', error);
                }
            }

            // Sync local DB fallback
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

    // Postpone profile setup (Hybrid Local/Supabase)
    async postponeSetup() {
        const user = this.getCurrentUser();
        if (user) {
            user.setupPostponed = true;
            localStorage.setItem(DMA_SESSION_KEY, JSON.stringify(user));
            
            const client = await this.getSupabase();
            if (client) {
                await client.from('profiles').update({ setup_postponed: true }).eq('id', user.id);
            }

            // Sync local DB
            const users = this.getUsers();
            const userIndex = users.findIndex(u => u.email === user.email);
            if (userIndex !== -1) {
                users[userIndex].setupPostponed = true;
                localStorage.setItem(DMA_DB_KEY, JSON.stringify(users));
            }
        }
    },

    // Update course progress (Hybrid Local/Supabase)
    async updateCourseProgress(courseId, lessonId) {
        const user = this.getCurrentUser();
        if (user) {
            if (!user.courseProgress) user.courseProgress = {};
            if (!user.courseProgress[courseId]) user.courseProgress[courseId] = { completedLessons: [] };
            
            if (!user.courseProgress[courseId].completedLessons.includes(lessonId)) {
                user.courseProgress[courseId].completedLessons.push(lessonId);
                
                // Sync session cache
                localStorage.setItem(DMA_SESSION_KEY, JSON.stringify(user));
                
                // Sync cloud
                const client = await this.getSupabase();
                if (client) {
                    const { error } = await client
                        .from('profiles')
                        .update({ course_progress: user.courseProgress })
                        .eq('id', user.id);
                    if (error) {
                        console.error('[DMA AuthCore] Erreur de synchronisation Supabase course progress:', error);
                    }
                }
                
                // Sync local DB
                const users = this.getUsers();
                const userIndex = users.findIndex(u => u.email === user.email);
                if (userIndex !== -1) {
                    users[userIndex].courseProgress = user.courseProgress;
                    localStorage.setItem(DMA_DB_KEY, JSON.stringify(users));
                }
            }
        }
    },

    // Delete account (Hybrid Local/Supabase)
    async deleteAccount(password) {
        const user = this.getCurrentUser();
        if (!user) return { success: false, message: "Utilisateur non connecté." };
        
        const client = await this.getSupabase();
        if (client) {
            console.log('[DMA AuthCore] Suppression de compte en cours via Supabase Cloud...');
            const { error } = await client.rpc('delete_user');
            if (error) {
                return { success: false, message: error.message };
            }
            await this.logout();
            return { success: true };
        }

        // Local Simulation Fallback
        const hashedPassword = await this.hashPassword(password);
        if (user.password !== hashedPassword) {
            return { success: false, message: "Mot de passe incorrect." };
        }

        // Remove from DB
        const users = this.getUsers();
        const updatedUsers = users.filter(u => u.email !== user.email);
        localStorage.setItem(DMA_DB_KEY, JSON.stringify(updatedUsers));

        this.logout();
        return { success: true };
    },

    // Update profile details (Hybrid Local/Supabase)
    async updateProfile(name, level, interests, extraFields = {}) {
        const user = this.getCurrentUser();
        if (!user) return { success: false, message: "Utilisateur non connecté." };

        if (name !== undefined) user.name = this.escapeHTML(name);
        if (level !== undefined) user.level = level;
        if (interests !== undefined) user.interests = interests;
        
        // Merge extra fields if present
        if (extraFields.equipment !== undefined) user.equipment = extraFields.equipment;
        if (extraFields.weeklyGoal !== undefined) user.weeklyGoal = extraFields.weeklyGoal;
        if (extraFields.bio !== undefined) user.bio = this.escapeHTML(extraFields.bio);
        if (extraFields.setupCompleted !== undefined) user.setupCompleted = extraFields.setupCompleted;
        else user.setupCompleted = true; // Mark setup complete by default

        // Sync session cache
        localStorage.setItem(DMA_SESSION_KEY, JSON.stringify(user));

        // Sync cloud
        const client = await this.getSupabase();
        if (client) {
            const cloudUpdates = {
                name: user.name,
                level: user.level,
                interests: user.interests,
                setup_completed: user.setupCompleted,
                equipment: user.equipment || 'acoustic',
                weekly_goal: user.weeklyGoal || 120,
                bio: user.bio || null
            };
            const { error } = await client
                .from('profiles')
                .update(cloudUpdates)
                .eq('id', user.id);
            if (error) {
                return { success: false, message: error.message };
            }
        }

        // Sync local DB
        const users = this.getUsers();
        const userIndex = users.findIndex(u => u.email === user.email);
        if (userIndex !== -1) {
            users[userIndex].name = user.name;
            users[userIndex].level = user.level;
            users[userIndex].interests = user.interests;
            users[userIndex].setupCompleted = user.setupCompleted;
            if (user.equipment !== undefined) users[userIndex].equipment = user.equipment;
            if (user.weeklyGoal !== undefined) users[userIndex].weeklyGoal = user.weeklyGoal;
            if (user.bio !== undefined) users[userIndex].bio = user.bio;
            localStorage.setItem(DMA_DB_KEY, JSON.stringify(users));
        }
        return { success: true, user };
    },

    // Update avatar profile picture (Hybrid Local/Supabase)
    async updateAvatar(photoBase64) {
        const user = this.getCurrentUser();
        if (!user) return { success: false, message: "Utilisateur non connecté." };

        user.photo = photoBase64;
        localStorage.setItem(DMA_SESSION_KEY, JSON.stringify(user));

        const client = await this.getSupabase();
        if (client) {
            const { error } = await client
                .from('profiles')
                .update({ photo_url: photoBase64 })
                .eq('id', user.id);
            if (error) {
                console.error('[DMA AuthCore] Erreur de synchronisation Supabase avatar:', error);
            }
        }

        // Sync local DB
        const users = this.getUsers();
        const userIndex = users.findIndex(u => u.email === user.email);
        if (userIndex !== -1) {
            users[userIndex].photo = photoBase64;
            localStorage.setItem(DMA_DB_KEY, JSON.stringify(users));
        }
        return { success: true };
    },

    // Change password (Hybrid Local/Supabase)
    async changePassword(currentPassword, newPassword) {
        const user = this.getCurrentUser();
        if (!user) return { success: false, message: "Utilisateur non connecté." };

        const client = await this.getSupabase();
        if (client) {
            const { error } = await client.auth.updateUser({ password: newPassword });
            if (error) {
                return { success: false, message: error.message };
            }
            return { success: true };
        }

        // Local Simulation Fallback
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

    // Reset password (Hybrid Local/Supabase)
    async resetPassword(email, newPassword) {
        const client = await this.getSupabase();
        if (client) {
            console.log('[DMA AuthCore] Envoi de la demande de réinitialisation Supabase...');
            const { error } = await client.auth.resetPasswordForEmail(email, {
                redirectTo: window.location.origin + '/reset-password.html'
            });
            if (error) {
                return { success: false, message: error.message };
            }
            return { success: true, message: "Un lien de réinitialisation a été envoyé à votre e-mail." };
        }

        // Local Simulation Fallback
        const users = this.getUsers();
        const userIndex = users.findIndex(u => u.email === email);
        if (userIndex === -1) {
            return { success: false, message: "Aucun compte associé à cet e-mail." };
        }

        const hashedPassword = await this.hashPassword(newPassword);
        users[userIndex].password = hashedPassword;
        localStorage.setItem(DMA_DB_KEY, JSON.stringify(users));

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
        localStorage.removeItem('dma_supabase_url');
        localStorage.removeItem('dma_supabase_key');
        localStorage.removeItem('dma_community_posts');
        localStorage.removeItem('dma_comments_db');
        return { success: true };
    }
};
