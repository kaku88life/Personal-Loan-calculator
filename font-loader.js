// Font Loader for PDF Generation
// Handles loading TTF fonts and converting them to Base64 for jsPDF

const FontLoader = {
    // Available fonts configuration
    fonts: {
        'YuPearl-Medium': {
            path: 'fonts/YuPearl-Medium.ttf',
            displayName: {
                zh: '粉圓體 Medium',
                en: 'YuPearl Medium',
                ja: '粉円体 Medium'
            }
        },
        'Iansui-Regular': {
            path: 'fonts/Iansui-Regular.ttf',
            displayName: {
                zh: '芫荽體',
                en: 'Iansui',
                ja: 'Iansui'
            }
        },
        'ChenYuluoyan-Thin': {
            path: 'fonts/ChenYuluoyan-Thin.ttf',
            displayName: {
                zh: '晨鈺落雁體',
                en: 'ChenYuluoyan',
                ja: 'ChenYuluoyan'
            }
        }
    },

    // Cache for loaded fonts
    cache: {},

    /**
     * Load a font file and convert to Base64
     * @param {string} fontPath - Path to the TTF file
     * @returns {Promise<string>} Base64 encoded font data
     */
    async loadFontAsBase64(fontPath) {
        // Check cache first
        if (this.cache[fontPath]) {
            return this.cache[fontPath];
        }

        try {
            const response = await fetch(fontPath);
            if (!response.ok) {
                throw new Error(`Failed to load font: ${fontPath}`);
            }

            const arrayBuffer = await response.arrayBuffer();
            const base64 = this.arrayBufferToBase64(arrayBuffer);

            // Cache the result
            this.cache[fontPath] = base64;
            return base64;
        } catch (error) {
            console.error('Error loading font:', error);
            throw error;
        }
    },

    /**
     * Convert ArrayBuffer to Base64 string
     * @param {ArrayBuffer} buffer - Font file data
     * @returns {string} Base64 encoded string
     */
    arrayBufferToBase64(buffer) {
        let binary = '';
        const bytes = new Uint8Array(buffer);
        const len = bytes.byteLength;

        for (let i = 0; i < len; i++) {
            binary += String.fromCharCode(bytes[i]);
        }

        return window.btoa(binary);
    },

    /**
     * Add a font to jsPDF document
     * @param {jsPDF} doc - jsPDF document instance
     * @param {string} fontName - Font identifier (e.g., 'YuPearl-Regular')
     * @returns {Promise<void>}
     */
    async addFontToPDF(doc, fontName) {
        const fontConfig = this.fonts[fontName];
        if (!fontConfig) {
            console.warn(`Font '${fontName}' not found, using default`);
            return;
        }

        try {
            const base64Data = await this.loadFontAsBase64(fontConfig.path);

            // Add font to jsPDF virtual file system
            doc.addFileToVFS(`${fontName}.ttf`, base64Data);

            // Register the font
            doc.addFont(`${fontName}.ttf`, fontName, 'normal');

            console.log(`Font '${fontName}' loaded successfully`);
        } catch (error) {
            console.error(`Failed to add font '${fontName}' to PDF:`, error);
            throw error;
        }
    },

    /**
     * Get font display name for current language
     * @param {string} fontName - Font identifier
     * @param {string} language - Language code (zh, en, ja)
     * @returns {string} Display name
     */
    getDisplayName(fontName, language = 'zh') {
        const fontConfig = this.fonts[fontName];
        if (!fontConfig) return fontName;

        return fontConfig.displayName[language] || fontConfig.displayName.zh;
    },

    /**
     * Get all available fonts for a language
     * @param {string} language - Language code
     * @returns {Array} Array of {value, label} objects
     */
    getAvailableFonts(language = 'zh') {
        return Object.keys(this.fonts).map(fontName => ({
            value: fontName,
            label: this.getDisplayName(fontName, language)
        }));
    },

    /**
     * Preload a font to cache
     * @param {string} fontName - Font identifier
     * @returns {Promise<void>}
     */
    async preloadFont(fontName) {
        const fontConfig = this.fonts[fontName];
        if (!fontConfig) {
            console.warn(`Font '${fontName}' not found`);
            return;
        }

        await this.loadFontAsBase64(fontConfig.path);
        console.log(`Font '${fontName}' preloaded to cache`);
    }
};

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = FontLoader;
}
