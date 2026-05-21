/**
 * DMA Supabase Configuration & Client Loader
 * Dynamically loads Supabase JS Client and manages cloud configuration
 */

window.DMA_SUPABASE = {
    // 1. Load global environment credentials dynamically
    async loadEnv() {
        if (window.DMA_SUPABASE_ENV) return;
        return new Promise((resolve) => {
            const script = document.createElement('script');
            script.src = 'assets/js/supabase-env.js';
            script.async = false;
            script.onload = () => {
                console.log('[DMA Supabase] supabase-env.js chargé avec succès.');
                resolve();
            };
            script.onerror = () => {
                console.warn('[DMA Supabase] supabase-env.js introuvable ou erreur de chargement. Utilisation des valeurs locales.');
                resolve();
            };
            document.head.appendChild(script);
        });
    },

    // 2. Get credentials (falls back to window.DMA_SUPABASE_ENV)
    getUrl() {
        return localStorage.getItem('dma_supabase_url') || (window.DMA_SUPABASE_ENV && window.DMA_SUPABASE_ENV.URL) || '';
    },

    getKey() {
        return localStorage.getItem('dma_supabase_key') || (window.DMA_SUPABASE_ENV && window.DMA_SUPABASE_ENV.ANON_KEY) || '';
    },

    // 3. Check if credentials are set
    isConfigured() {
        return !!(this.getUrl() && this.getKey());
    },

    // 4. Save new credentials and reload
    saveCredentials(url, key) {
        if (!url || !key) {
            localStorage.removeItem('dma_supabase_url');
            localStorage.removeItem('dma_supabase_key');
        } else {
            localStorage.setItem('dma_supabase_url', url.trim());
            localStorage.setItem('dma_supabase_key', key.trim());
        }
    },

    // 5. Load Supabase SDK from CDN dynamically
    loadSDK() {
        return new Promise((resolve, reject) => {
            if (window.supabase) {
                resolve();
                return;
            }

            console.log('[DMA Supabase] Chargement dynamique du SDK Supabase...');
            const script = document.createElement('script');
            script.src = 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2';
            script.async = true;
            script.onload = () => {
                console.log('[DMA Supabase] SDK chargé avec succès depuis le CDN.');
                resolve();
            };
            script.onerror = (e) => {
                console.error('[DMA Supabase] Erreur de chargement du SDK Supabase:', e);
                reject(new Error('Impossible de charger le SDK Supabase. Vérifiez votre connexion.'));
            };
            document.head.appendChild(script);
        });
    },

    // 6. Initialize client instance
    async initClient() {
        if (window.supabaseClient) return window.supabaseClient;

        // Ensure env is loaded first
        await this.loadEnv();

        if (!this.isConfigured()) {
            console.log('[DMA Supabase] Supabase non configuré. Mode simulation local actif.');
            return null;
        }

        try {
            await this.loadSDK();
            
            const url = this.getUrl();
            const key = this.getKey();
            
            window.supabaseClient = window.supabase.createClient(url, key, {
                auth: {
                    persistSession: true,
                    autoRefreshToken: true,
                    detectSessionInUrl: true
                }
            });
            
            console.log('[DMA Supabase] Client Supabase initialisé avec succès.');
            return window.supabaseClient;
        } catch (e) {
            console.error('[DMA Supabase] Erreur lors de l\'initialisation du client:', e);
            return null;
        }
    },

    // 7. Test a connection with explicit credentials
    async testConnection(url, key) {
        try {
            await this.loadSDK();
            const testClient = window.supabase.createClient(url.trim(), key.trim());
            
            // Try to fetch a simple metadata table or do a request
            const { data, error } = await testClient.from('profiles').select('id').limit(1);
            
            // If the query returns a 404 (table not found) or invalid key error, throw
            if (error) {
                // If it's a 406 or invalid key, it's a failure. If it's a relation "profiles" doesn't exist,
                // it means credentials are correct, but the tables aren't set up yet! That's still a success for connection.
                if (error.code === 'PGRST116' || error.message.includes('relation "public.profiles" does not exist')) {
                    return { success: true, warning: 'Le projet est connecté, mais la table "profiles" n\'a pas encore été créée. Exécutez le script SQL.' };
                }
                return { success: false, message: error.message };
            }
            
            return { success: true };
        } catch (e) {
            return { success: false, message: e.message };
        }
    }
};

// Automatically try initializing when loaded
(async () => {
    await window.DMA_SUPABASE.initClient();
})();
