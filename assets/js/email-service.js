/**
 * DMA Email Service - Powered by EmailJS
 * This service handles real email delivery to students.
 */

const EmailService = {
    // [IMPORTANT] Remplacer ces valeurs après avoir créé un compte sur emailjs.com
    CONFIG: {
        PUBLIC_KEY: "co0AOCa4ZF0LcYtbL",      // Clé publique (Account > API Keys)
        SERVICE_ID: "drum-master-academy",      // ID du service (Email Services)
        TEMPLATE_ID: "template_a98sl3e"      // ID du template (Email Templates)
    },

    /**
     * Envoie l'email de bienvenue réel
     * @param {Object} userData { name, email }
     */
    async sendWelcomeEmail(userData) {
        // Vérification si les clés sont configurées
        if (this.CONFIG.PUBLIC_KEY === "YOUR_PUBLIC_KEY") {
            console.warn("[DMA EMAIL] Service non configuré. Mode simulation actif.");
            return { success: true, simulated: true };
        }

        try {
            const templateParams = {
                to_name: userData.name,
                to_email: userData.email,
                firstname: userData.name.split(' ')[0],
                reply_to: "adetijosue@gmail.com"
            };

            const response = await emailjs.send(
                this.CONFIG.SERVICE_ID,
                this.CONFIG.TEMPLATE_ID,
                templateParams
            );

            console.log("[DMA EMAIL] Succès !", response.status, response.text);
            return { success: true, simulated: false };
        } catch (error) {
            console.error("[DMA EMAIL] Erreur d'envoi :", error);
            return { success: false, error: error };
        }
    }
};
