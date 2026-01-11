// Main Application Logic

// Chart instances
let paymentChart = null;
let balanceChart = null;

// Current calculation results
let currentResults = null;
let currentSummary = null;

// Theme settings
const themes = ['light', 'dark', 'night'];
const themeIcons = { light: '🌤️', dark: '🌙', night: '⭐' };
let currentThemeIndex = 0;

// Default loan terms by type (in years)
const defaultLoanTerms = {
    mortgage: 30,
    car: 5,
    personal: 7,
    other: 10
};

// Default loan ratios by type (in %)
const defaultLoanRatios = {
    mortgage: 80,
    car: 100,
    personal: 100,
    other: 80
};

// Default loan amounts by type
const defaultLoanAmounts = {
    mortgage: 10000000,
    car: 2000000,
    personal: 2000000,
    other: 5000000
};

// Default interest rates by type (in %)
const defaultInterestRates = {
    mortgage: 2.5,
    car: 3.0,
    personal: 2.5,
    other: 3.0
};

// DOM Elements
const elements = {
    // Controls
    languageSelect: document.getElementById('languageSelect'),
    themeToggle: document.getElementById('themeToggle'),
    themeIcon: document.getElementById('themeIcon'),
    currencySelect: document.getElementById('currencySelect'),

    // Inputs
    loanTypeSelect: document.getElementById('loanTypeSelect'),
    customLoanType: document.getElementById('customLoanType'),
    // Note: productAmount and loanAmount are handled specially now
    productAmount: document.getElementById('productAmount'),
    loanAmount: document.getElementById('loanAmount'), // Derived
    loanRatio: document.getElementById('loanRatio'),
    loanTerm: document.getElementById('loanTerm'),
    interestRate: document.getElementById('interestRate'),
    paymentMethod: document.getElementById('paymentMethod'),
    currencyUnit: document.getElementById('currencyUnit'),
    gracePeriod: document.getElementById('gracePeriod'),
    gracePeriodUnit: document.getElementById('gracePeriodUnit'),
    gracePeriodToggle: document.getElementById('gracePeriodToggle'),
    gracePeriodInputs: document.getElementById('gracePeriodInputs'),

    // Charts
    paymentChart: document.getElementById('paymentChart'),
    balanceChart: document.getElementById('balanceChart'),
    magnifyPaymentChart: document.getElementById('magnifyPaymentChart'),
    magnifyBalanceChart: document.getElementById('magnifyBalanceChart'),
    expandPaymentChart: document.getElementById('expandPaymentChart'),
    expandBalanceChart: document.getElementById('expandBalanceChart'),

    // Result details
    resultsSection: document.getElementById('resultsSection'),
    monthlyPaymentFirst: document.getElementById('monthlyPaymentFirst'),
    monthlyPaymentLast: document.getElementById('monthlyPaymentLast'),
    gracePayment: document.getElementById('gracePaymentValue'),
    totalPayment: document.getElementById('totalPaymentValue'),
    totalInterest: document.getElementById('totalInterestValue'),
    totalCost: document.getElementById('totalCostValue'),
    apr: document.getElementById('aprValue'),
    totalDownPayment: document.getElementById('totalDownPaymentValue'),
    totalEffect: document.getElementById('totalEffect'), // Only in DE?
    principalAmount: document.getElementById('principalAmount'),
    amortizationBody: document.getElementById('amortizationBody'),

    // Breakdown Modal
    fullscreenModal: document.getElementById('fullscreenModal'), // Reused or new?
    fullscreenTitle: document.getElementById('fullscreenTitle'),
    fullscreenClose: document.getElementById('fullscreenClose'),
    fullscreenBody: document.getElementById('fullscreenBody'),

    // Costs
    costsContainer: document.getElementById('costsContainer'),
    addCostBtn: document.getElementById('addCostBtn'),
    totalCosts: document.getElementById('totalCostsValue'),

    // Export & Share
    settingsToggle: document.getElementById('settingsToggle'),
    settingsMenu: document.getElementById('settingsMenu'),
    shareDropdownBtn: document.getElementById('shareDropdownBtn'),
    shareDropdownMenu: document.getElementById('shareDropdownMenu'),
    exportCSV: document.getElementById('exportCSV'),
    exportExcel: document.getElementById('exportExcel'),
    exportPDF: document.getElementById('exportPDF'),
    shareBtn: document.getElementById('shareBtn'),

    // Other UI elements
    resetBtn: document.getElementById('resetBtn'),
    calculateBtn: document.getElementById('calculateBtn'),

    periodSlider: document.getElementById('periodSlider'),
    periodDisplay: document.getElementById('periodDisplay'),
    periodDetails: document.getElementById('periodDetails'),

    chartModal: document.getElementById('chartModal'),
    modalTitle: document.getElementById('modalTitle'),
    modalClose: document.getElementById('modalClose'),

    fontSelect: document.getElementById('fontSelect'),
    expandTable: document.getElementById('expandTable'),

    graceToggleContainer: document.getElementById('graceToggleContainer'),
    gracePaymentToggle: document.getElementById('gracePaymentToggle'),
    gracePaymentValue: document.getElementById('gracePaymentValue')
};

// Auto-calculate Loan Amount based on Product Amount and Ratio
function updateLoanAmount() {
    if (!elements.productAmount || !elements.loanRatio || !elements.loanAmount) return;

    const productAmount = parseFloat(elements.productAmount.value.replace(/,/g, '')) || 0;
    const ratio = parseFloat(elements.loanRatio.value) || 0;
    const loanAmount = Math.round(productAmount * (ratio / 100));

    // Update derived field
    elements.loanAmount.value = i18n.formatNumber(loanAmount);
}

// Add listeners for auto-calculation
if (elements.productAmount) {
    // Handle backspace/delete near commas by skipping over them
    elements.productAmount.addEventListener('keydown', (e) => {
        const input = e.target;
        const cursorPos = input.selectionStart;
        const value = input.value;

        if (e.key === 'Backspace' && cursorPos > 0) {
            // If the character before cursor is a comma, skip it
            if (value[cursorPos - 1] === ',') {
                e.preventDefault();
                // Find the digit before the comma and delete it
                let newPos = cursorPos - 1;
                while (newPos > 0 && value[newPos - 1] === ',') {
                    newPos--;
                }
                if (newPos > 0) {
                    const newValue = value.substring(0, newPos - 1) + value.substring(cursorPos);
                    input.value = newValue;
                    // Reformat and update cursor
                    formatNumberInput(input);
                    updateLoanAmount();
                }
            }
        } else if (e.key === 'Delete' && cursorPos < value.length) {
            // If the character at cursor is a comma, skip it
            if (value[cursorPos] === ',') {
                e.preventDefault();
                // Find the digit after the comma and delete it
                let newPos = cursorPos + 1;
                while (newPos < value.length && value[newPos] === ',') {
                    newPos++;
                }
                if (newPos < value.length) {
                    const newValue = value.substring(0, cursorPos) + value.substring(newPos + 1);
                    input.value = newValue;
                    // Reformat and update cursor
                    formatNumberInput(input);
                    updateLoanAmount();
                }
            }
        }
    });

    elements.productAmount.addEventListener('input', () => {
        // Use the improved formatNumberInput function
        formatNumberInput(elements.productAmount);
        updateLoanAmount(); // Update calculated amount
    });
}
if (elements.loanRatio) {
    elements.loanRatio.addEventListener('input', updateLoanAmount);
}

// Initial calculation
setTimeout(updateLoanAmount, 100);

// Show Down Payment Breakdown
function showDownPaymentBreakdown(data) {
    const listHtml = `
        <div class="cost-list-item">
            <span class="cost-name" data-i18n="baseDownPayment">基本頭期款</span>
            <span class="cost-amount">${i18n.formatCurrency(data.baseDownPayment)}</span>
        </div>
        ${data.unrelatedCostsList.map(item => `
        <div class="cost-list-item">
            <span class="cost-name">${item.name}</span>
            <span class="cost-amount">${i18n.formatCurrency(item.amount)}</span>
        </div>
        `).join('')}
        <div class="cost-list-item total">
            <span class="cost-name" data-i18n="total">總計</span>
            <span class="cost-amount">${i18n.formatCurrency(data.totalDownPayment)}</span>
        </div>
    `;

    showConfirmModal(
        i18n.t('totalDownPayment') || '總自備金額明細',
        listHtml,
        () => { } // No confirm action needed
    );
    // Hide cancel button for this view-only modal
    const modal = document.querySelector('.cost-modal-overlay:last-child'); // Get the modal we just created
    if (modal) {
        const cancelBtn = modal.querySelector('.btn-cancel');
        if (cancelBtn) cancelBtn.style.display = 'none';
        const confirmBtn = modal.querySelector('.btn-confirm');
        if (confirmBtn) confirmBtn.textContent = i18n.t('close') || '關閉';
    }
}


// Initialize application
function init() {
    // Show language selector for first-time visitors
    showLanguageSelector();

    // Load saved preferences
    loadPreferences();

    // Set up event listeners
    setupEventListeners();

    // Initialize UI
    i18n.updateUI();
    i18n.updateCurrencyUI();

    // Update monthly payment label based on payment method
    updateMonthlyPaymentLabel();
}

// Show language selection modal for first-time visitors
function showLanguageSelector() {
    const savedLang = localStorage.getItem('loanCalc_language');

    // If language preference exists, skip the selector
    if (savedLang) {
        return;
    }

    // Detect browser language
    const browserLang = navigator.language || navigator.userLanguage;
    let suggestedLang = 'zh'; // Default to Traditional Chinese
    if (browserLang.startsWith('en')) suggestedLang = 'en';
    else if (browserLang.startsWith('ja')) suggestedLang = 'ja';

    // Create and show modal
    const modal = createLanguageModal(suggestedLang);
    document.body.appendChild(modal);
}

function createLanguageModal(suggestedLang) {
    const overlay = document.createElement('div');
    overlay.className = 'language-modal-overlay';
    overlay.innerHTML = `
        <div class="language-modal">
            <h2>選擇語言 / Select Language / 言語を選択</h2>
            <div class="language-options">
                <button class="lang-btn ${suggestedLang === 'zh' ? 'suggested' : ''}" data-lang="zh">
                    <span class="lang-flag">🇹🇼</span>
                    <span class="lang-name">繁體中文</span>
                    ${suggestedLang === 'zh' ? '<span class="lang-hint">推薦</span>' : ''}
                </button>
                <button class="lang-btn ${suggestedLang === 'en' ? 'suggested' : ''}" data-lang="en">
                    <span class="lang-flag">🇺🇸</span>
                    <span class="lang-name">English</span>
                    ${suggestedLang === 'en' ? '<span class="lang-hint">Recommended</span>' : ''}
                </button>
                <button class="lang-btn ${suggestedLang === 'ja' ? 'suggested' : ''}" data-lang="ja">
                    <span class="lang-flag">🇯🇵</span>
                    <span class="lang-name">日本語</span>
                    ${suggestedLang === 'ja' ? '<span class="lang-hint">おすすめ</span>' : ''}
                </button>
            </div>
        </div>
    `;

    // Bind click events
    const buttons = overlay.querySelectorAll('.lang-btn');
    buttons.forEach(btn => {
        btn.addEventListener('click', () => {
            const lang = btn.dataset.lang;
            selectLanguage(lang);
            overlay.remove();
        });
    });

    return overlay;
}

function selectLanguage(lang) {
    i18n.setLanguage(lang);
    if (elements.languageSelect) {
        elements.languageSelect.value = lang;
    }
    localStorage.setItem('loanCalc_language', lang);
}

// Load saved preferences from localStorage
function loadPreferences() {
    const savedLang = localStorage.getItem('loanCalc_language');
    const savedTheme = localStorage.getItem('loanCalc_theme');
    const savedCurrency = localStorage.getItem('loanCalc_currency');

    if (savedLang) {
        elements.languageSelect.value = savedLang;
        i18n.setLanguage(savedLang);
    }

    if (savedTheme) {
        currentThemeIndex = themes.indexOf(savedTheme);
        if (currentThemeIndex === -1) currentThemeIndex = 0;
        setTheme(savedTheme);
    }

    if (savedCurrency) {
        elements.currencySelect.value = savedCurrency;
        i18n.setCurrency(savedCurrency);
    }

    // Load saved font
    const savedFont = localStorage.getItem('loanCalc_font');
    if (savedFont && elements.fontSelect) {
        elements.fontSelect.value = savedFont;
    } else if (elements.fontSelect) {
        // Set default font if no saved preference
        elements.fontSelect.value = 'YuPearl-Medium';
    }
}

// Set up all event listeners
function setupEventListeners() {
    // Language change
    elements.languageSelect.addEventListener('change', (e) => {
        const lang = e.target.value;
        i18n.setLanguage(lang);
        i18n.updateCurrencyUI();
        localStorage.setItem('loanCalc_language', lang);

        // Update charts if they exist
        if (currentResults) {
            updateCharts(currentResults);
        }

        updateMonthlyPaymentLabel();

        // Update total costs display to reflect new language
        updateTotalCosts();
    });

    // Theme toggle - 點擊切換到下一個主題
    elements.themeToggle.addEventListener('click', () => {
        // 切換到下一個主題
        currentThemeIndex = (currentThemeIndex + 1) % themes.length;
        const theme = themes[currentThemeIndex];

        // 添加動畫效果
        elements.themeToggle.classList.add('switching');
        setTimeout(() => {
            elements.themeToggle.classList.remove('switching');
        }, 400);

        setTheme(theme);
        localStorage.setItem('loanCalc_theme', theme);
    });

    // Currency change
    elements.currencySelect.addEventListener('change', (e) => {
        const currency = e.target.value;
        i18n.setCurrency(currency);
        localStorage.setItem('loanCalc_currency', currency);

        // Update displayed values if results exist
        if (currentResults) {
            displayResults(currentResults);
        }
    });

    // Loan type change - update default term, ratio, amount, rate and handle custom type
    elements.loanTypeSelect.addEventListener('change', (e) => {
        const loanType = e.target.value;

        // Show/hide custom loan type input
        if (loanType === 'other') {
            elements.customLoanType.classList.remove('hidden');
            elements.customLoanType.focus();
        } else {
            elements.customLoanType.classList.add('hidden');
        }

        // Update default product amount based on loan type
        if (defaultLoanAmounts[loanType] && elements.productAmount) {
            elements.productAmount.value = i18n.formatNumber(defaultLoanAmounts[loanType]);
        }

        // Update default loan term based on loan type
        if (defaultLoanTerms[loanType]) {
            elements.loanTerm.value = defaultLoanTerms[loanType];
        }

        // Update default loan ratio based on loan type
        if (defaultLoanRatios[loanType]) {
            elements.loanRatio.value = defaultLoanRatios[loanType];
        }

        // Update default interest rate based on loan type
        if (defaultInterestRates[loanType] && elements.interestRate) {
            elements.interestRate.value = defaultInterestRates[loanType];
        }

        // Update productAmount label based on loan type
        const productAmountLabel = document.querySelector('label[data-i18n="productAmount"], label[data-i18n="productAmountPersonal"]');
        if (productAmountLabel) {
            if (loanType === 'personal') {
                productAmountLabel.setAttribute('data-i18n', 'productAmountPersonal');
                productAmountLabel.textContent = i18n.t('productAmountPersonal');
            } else {
                productAmountLabel.setAttribute('data-i18n', 'productAmount');
                productAmountLabel.textContent = i18n.t('productAmount');
            }
        }

        // Recalculate loan amount after updating all fields
        updateLoanAmount();
    });

    // Grace period toggle
    if (elements.gracePeriodToggle) {
        elements.gracePeriodToggle.addEventListener('change', (e) => {
            if (e.target.checked) {
                elements.gracePeriodInputs.classList.add('active');
            } else {
                elements.gracePeriodInputs.classList.remove('active');
            }
        });
    }

    // Share dropdown toggle
    if (elements.shareDropdownBtn) {
        elements.shareDropdownBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            const dropdown = elements.shareDropdownBtn.parentElement;
            dropdown.classList.toggle('active');
        });

        // Close dropdown when clicking outside
        document.addEventListener('click', (e) => {
            const dropdown = elements.shareDropdownBtn.parentElement;
            if (!dropdown.contains(e.target)) {
                dropdown.classList.remove('active');
            }
        });
    }

    // Chart magnify buttons
    if (elements.magnifyPaymentChart) {
        elements.magnifyPaymentChart.addEventListener('click', () => {
            openChartModal('payment');
        });
    }

    if (elements.magnifyBalanceChart) {
        elements.magnifyBalanceChart.addEventListener('click', () => {
            openChartModal('balance');
        });
    }

    // Modal close
    if (elements.modalClose) {
        elements.modalClose.addEventListener('click', closeChartModal);
    }

    if (elements.chartModal) {
        elements.chartModal.addEventListener('click', (e) => {
            if (e.target === elements.chartModal) {
                closeChartModal();
            }
        });
    }

    // Period slider
    if (elements.periodSlider) {
        elements.periodSlider.addEventListener('input', (e) => {
            const period = parseInt(e.target.value);
            elements.periodDisplay.textContent = period;
            updatePeriodDetails(period);
        });
    }

    // Settings dropdown toggle
    if (elements.settingsToggle) {
        elements.settingsToggle.addEventListener('click', (e) => {
            e.stopPropagation();
            const dropdown = elements.settingsToggle.parentElement;
            dropdown.classList.toggle('active');
        });

        // Close dropdown when clicking outside
        document.addEventListener('click', (e) => {
            const dropdown = elements.settingsToggle.parentElement;
            if (!dropdown.contains(e.target)) {
                dropdown.classList.remove('active');
            }
        });
    }

    // Grace payment toggle (switch between grace period and post-grace period display)
    if (elements.gracePaymentToggle) {
        elements.gracePaymentToggle.addEventListener('change', (e) => {
            updateGracePaymentDisplay();
        });
    }

    // Expand buttons
    if (elements.expandPaymentChart) {
        elements.expandPaymentChart.addEventListener('click', () => {
            openFullscreen('paymentChart', i18n.t('paymentChart'));
        });
    }

    if (elements.expandBalanceChart) {
        elements.expandBalanceChart.addEventListener('click', () => {
            openFullscreen('balanceChart', i18n.t('balanceChart'));
        });
    }

    if (elements.expandTable) {
        elements.expandTable.addEventListener('click', () => {
            openFullscreen('table', i18n.t('amortizationSchedule'));
        });
    }

    // Fullscreen close
    if (elements.fullscreenClose) {
        elements.fullscreenClose.addEventListener('click', closeFullscreen);
    }

    // Payment method change
    elements.paymentMethod.addEventListener('change', () => {
        updateMonthlyPaymentLabel();
    });

    // Add cost button
    elements.addCostBtn.addEventListener('click', addCostItem);

    // Calculate button
    elements.calculateBtn.addEventListener('click', calculate);

    // Reset button
    if (elements.resetBtn) {
        elements.resetBtn.addEventListener('click', resetForm);
    }

    // Export buttons
    elements.exportCSV.addEventListener('click', exportToCSV);
    elements.exportExcel.addEventListener('click', exportToExcel);
    elements.exportPDF.addEventListener('click', exportToPDF);
    elements.shareBtn.addEventListener('click', shareResults);

    // Enter key to calculate (only when no modal is open)
    document.addEventListener('keydown', (e) => {
        // Skip if a modal is open (cost modal or confirm modal)
        const hasOpenModal = document.querySelector('.cost-modal-overlay') ||
            document.querySelector('.modal-overlay.active');
        if (hasOpenModal) return;

        // Skip for buttons and selects
        if (e.target.tagName === 'BUTTON' || e.target.tagName === 'SELECT') return;

        if (e.key === 'Enter') {
            e.preventDefault();
            calculate();
        }
    });

    // Font selector change
    if (elements.fontSelect) {
        elements.fontSelect.addEventListener('change', (e) => {
            const font = e.target.value;
            localStorage.setItem('loanCalc_font', font);
        });
    }

    // Add thousand separator formatting to amount input
    if (elements.loanAmount) {
        elements.loanAmount.addEventListener('input', (e) => {
            formatNumberInput(e.target);
        });

        elements.loanAmount.addEventListener('blur', (e) => {
            const value = parseFormattedNumber(e.target.value);
            if (value > 0) {
                e.target.value = formatWithThousandSeparator(value);
            }
        });

        elements.loanAmount.addEventListener('focus', (e) => {
            e.target.value = parseFormattedNumber(e.target.value).toString();
        });
    }

    // Format existing value if present
    if (elements.loanAmount && elements.loanAmount.value) {
        const value = parseFormattedNumber(elements.loanAmount.value);
        if (value > 0) {
            elements.loanAmount.value = formatWithThousandSeparator(value);
        }
    }
}

// Set theme
function setTheme(theme) {
    document.body.className = `theme-${theme}`;

    // Update icon
    if (elements.themeIcon) {
        elements.themeIcon.textContent = themeIcons[theme];
    }

    // Update toggle button title
    if (elements.themeToggle) {
        const titles = {
            light: i18n.t('themeLight'),
            dark: i18n.t('themeDark'),
            night: i18n.t('themeNight')
        };
        elements.themeToggle.title = titles[theme] || theme;
    }

    // Update charts if they exist
    if (paymentChart || balanceChart) {
        updateChartsTheme();
    }
}

// Get current theme colors
function getThemeColors() {
    const style = getComputedStyle(document.body);
    return {
        accent: style.getPropertyValue('--accent-color').trim(),
        success: style.getPropertyValue('--success-color').trim(),
        warning: style.getPropertyValue('--warning-color').trim(),
        text: style.getPropertyValue('--text-primary').trim(),
        textMuted: style.getPropertyValue('--text-muted').trim(),
        grid: style.getPropertyValue('--chart-grid').trim(),
        bg: style.getPropertyValue('--bg-card').trim()
    };
}

// Update monthly payment label based on payment method
function updateMonthlyPaymentLabel() {
    const label = document.querySelector('.card h3[data-i18n="monthlyPayment"]');
    if (label) {
        // Always use clean monthlyPayment label without parentheses
        label.setAttribute('data-i18n', 'monthlyPayment');
        label.textContent = i18n.t('monthlyPayment');
    }
}

// Add cost item with modal dialog
// Add cost item with modal dialog
function addCostItem() {
    // Create modal dialog
    const modal = document.createElement('div');
    modal.className = 'cost-modal-overlay';

    // Default values from main loan
    const mainRate = elements.interestRate ? elements.interestRate.value : '2.0';
    const mainTerm = elements.loanTerm ? elements.loanTerm.value : '30';

    modal.innerHTML = `
        <div class="cost-modal">
            <h3>${i18n.t('additionalCosts')}</h3>
            <div class="cost-modal-body">
                <div class="form-group">
                    <label>${i18n.t('costNamePlaceholder')}</label>
                    <input type="text" id="costNameInput" class="cost-modal-input" placeholder="${i18n.t('costNamePlaceholder')}" autofocus>
                </div>
                <div class="form-group">
                    <label>${i18n.t('costAmountPlaceholder')}</label>
                    <input type="text" id="costAmountInput" class="cost-modal-input" placeholder="0" inputmode="numeric">
                </div>

                <div class="cost-payment-mode">
                    <label>${i18n.t('costPaymentMode')}</label>
                    <div class="mode-options">
                        <div class="mode-option selected" data-value="upfront">
                            ${i18n.t('costOneTime')}
                        </div>
                        <div class="mode-option" data-value="financed">
                             ${i18n.t('costFinanced')}
                        </div>
                    </div>
                </div>

                <!-- Cost Type Selection (Related vs Unrelated) -->
                 <div class="form-group" style="margin-top: 12px;">
                    <label>${i18n.t('costType')}</label>
                    <div class="toggle-group" style="display: flex; gap: 8px;">
                         <div class="type-option selected" data-value="related" style="flex: 1; padding: 8px; border: 1px solid var(--border-color); text-align: center; border-radius: var(--border-radius); cursor: pointer; background: var(--bg-secondary); transition: all 0.2s;">
                             <span style="font-size: 0.8rem; white-space: pre-line;">${i18n.t('costRelated')}</span>
                         </div>
                         <div class="type-option" data-value="unrelated" style="flex: 1; padding: 8px; border: 1px solid var(--border-color); text-align: center; border-radius: var(--border-radius); cursor: pointer; background: var(--bg-secondary); transition: all 0.2s;">
                             <span style="font-size: 0.8rem; white-space: pre-line;">${i18n.t('costUnrelated')}</span>
                         </div>
                    </div>
                </div>

                <div class="cost-finance-details" id="costFinanceDetails">
                    <div class="form-group">
                         <label>${i18n.t('costFinancedRate')}</label>
                         <input type="number" id="costRateInput" class="cost-modal-input" value="${mainRate}" step="0.01">
                    </div>
                    <div class="form-group">
                         <label>${i18n.t('costFinancedTerm')} (${i18n.t('years')})</label>
                         <input type="number" id="costTermInput" class="cost-modal-input" value="${mainTerm}" step="1">
                    </div>
                    <div class="form-group">
                         <label>${i18n.t('costLoanRatio')}</label>
                         <input type="number" id="costRatioInput" class="cost-modal-input" value="100" max="100" min="0" step="1">
                    </div>
                    <div class="form-group">
                         <label>${i18n.t('costGracePeriod')} (${i18n.t('years')})</label>
                         <input type="number" id="costGraceInput" class="cost-modal-input" value="0" min="0" step="1">
                    </div>
                </div>
            </div>
            <div class="cost-modal-footer">
                <button type="button" class="btn-cancel">取消</button>
                <button type="button" class="btn-confirm">確認</button>
            </div>
        </div>
    `;

    document.body.appendChild(modal);

    const nameInput = modal.querySelector('#costNameInput');
    const amountInput = modal.querySelector('#costAmountInput');
    const rateInput = modal.querySelector('#costRateInput');
    const termInput = modal.querySelector('#costTermInput');
    const ratioInput = modal.querySelector('#costRatioInput');
    const graceInput = modal.querySelector('#costGraceInput');
    const confirmBtn = modal.querySelector('.btn-confirm');
    const cancelBtn = modal.querySelector('.btn-cancel');
    const financeDetails = modal.querySelector('#costFinanceDetails');
    const modeOptions = modal.querySelectorAll('.mode-option');
    const typeOptions = modal.querySelectorAll('.type-option');
    let currentMode = 'upfront';
    let currentType = 'related';

    // Focus on name input
    setTimeout(() => nameInput.focus(), 100);

    // Format amount input with thousand separators
    amountInput.addEventListener('input', (e) => {
        // Remove non-numeric chars except dot
        let value = e.target.value.replace(/[^\d.]/g, '');

        // Handle multiple dots
        const parts = value.split('.');
        if (parts.length > 2) {
            value = parts[0] + '.' + parts.slice(1).join('');
        }

        // Add thousand separators to integer part
        if (value) {
            const integerPart = parts[0];
            const decimalPart = parts.length > 1 ? '.' + parts[1] : '';

            const formattedInteger = integerPart.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
            e.target.value = formattedInteger + decimalPart;
        }
    });

    // Toggle Mode
    modeOptions.forEach(opt => {
        opt.addEventListener('click', () => {
            modeOptions.forEach(o => o.classList.remove('selected'));
            opt.classList.add('selected');
            currentMode = opt.dataset.value;
            if (currentMode === 'financed') {
                financeDetails.classList.add('active');
            } else {
                financeDetails.classList.remove('active');
            }
        });
    });

    // Toggle Type
    typeOptions.forEach(opt => {
        opt.addEventListener('click', () => {
            typeOptions.forEach(o => {
                o.classList.remove('selected');
                o.style.borderColor = 'var(--border-color)';
                o.style.backgroundColor = 'var(--bg-secondary)';
                o.style.color = 'var(--text-primary)';
            });
            opt.classList.add('selected');
            opt.style.borderColor = 'var(--accent-color)';
            opt.style.backgroundColor = 'var(--accent-color)';
            opt.style.color = 'white';
            currentType = opt.dataset.value;
        });
    });

    // Initialize first type option style
    const selectedType = modal.querySelector('.type-option.selected');
    if (selectedType) {
        selectedType.style.borderColor = 'var(--accent-color)';
        selectedType.style.backgroundColor = 'var(--accent-color)';
        selectedType.style.color = 'white';
    }

    // Enhance new number inputs
    [rateInput, termInput, ratioInput, graceInput].forEach(input => {
        // Wait for them to be visible/in DOM properly
        setTimeout(() => enhanceToNumberInput(input), 0);
    });

    // Close modal function
    const closeModal = () => {
        modal.remove();
    };

    // Cancel button
    cancelBtn.addEventListener('click', closeModal);

    // Click outside to close - DISABLED per user request
    // modal.addEventListener('click', (e) => {
    //    if (e.target === modal) closeModal();
    // });

    // Confirm button - add cost to list
    const confirmAdd = () => {
        const name = nameInput.value.trim();
        // Amount is parsed later to handle commas
        const rate = parseFloat(rateInput.value);
        const term = parseFloat(termInput.value);
        const ratio = parseFloat(ratioInput.value);
        const grace = parseFloat(graceInput.value);

        if (!name) {
            alert(i18n.t('costNamePlaceholder') || '請輸入項目名稱');
            nameInput.focus();
            return;
        }

        // Parse amount (remove commas)
        const rawAmount = amountInput.value.replace(/,/g, '');
        const amount = parseFloat(rawAmount);

        if (isNaN(amount) || amount <= 0) {
            alert(i18n.t('alertInvalidAmount') || '請輸入有效的金額');
            amountInput.focus();
            return;
        }

        // Validate finance details
        if (currentMode === 'financed') {
            if (isNaN(rate) || rate < 0) {
                alert(i18n.t('alertInvalidRate') || '請輸入有效的利率');
                rateInput.focus();
                return;
            }
            if (isNaN(term) || term <= 0) {
                alert(i18n.t('alertInvalidTerm') || '請輸入有效的年限');
                termInput.focus();
                return;
            }
        }

        // Create cost item in list
        const costItem = document.createElement('div');
        costItem.className = 'cost-item';

        // Badge for financed items
        const badgeHtml = currentMode === 'financed'
            ? `<span class="payment-mode-badge financed" data-i18n="costFinanced">${i18n.t('costFinanced')}</span>`
            : '';

        costItem.innerHTML = `
            <div class="cost-info">
                <span class="cost-name">${name}</span>
                ${badgeHtml}
            </div>
            <span class="cost-amount">${i18n.getCurrencySymbol()} ${amount.toLocaleString()}</span>
            <button type="button" class="btn-remove" onclick="removeCostItem(this)">&times;</button>
        `;

        // Store data in element for calculation
        costItem.dataset.name = name;
        costItem.dataset.amount = amount;
        costItem.dataset.mode = currentMode;
        if (currentMode === 'financed') {
            costItem.dataset.rate = rate;
            costItem.dataset.term = term;
            costItem.dataset.loanRatio = ratio;
            costItem.dataset.gracePeriod = grace;
        }
        costItem.dataset.type = currentType;

        elements.costsContainer.appendChild(costItem);
        updateTotalCosts();
        closeModal();
    };

    confirmBtn.addEventListener('click', confirmAdd);

    // Handle Enter key on inputs
    const handleKeydown = (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            e.stopPropagation();
            confirmAdd();
        }
    };

    [nameInput, amountInput, rateInput, termInput, ratioInput, graceInput].forEach(input => {
        input.addEventListener('keydown', handleKeydown);
    });
}

// Custom Confirm Modal
function showConfirmModal(title, message, onConfirm) {
    const modal = document.createElement('div');
    modal.className = 'cost-modal-overlay'; // Reuse overlay style
    modal.style.zIndex = '10002'; // Ensure it's on top

    modal.innerHTML = `
        <div class="cost-modal" style="width: 90%; max-width: 400px; max-height: 90vh; overflow-y: auto;">
            <h3>${title}</h3>
            <div class="cost-modal-body">
                <p style="margin: 0; color: var(--text-primary); font-size: 1.05rem;">${message}</p>
            </div>
            <div class="cost-modal-footer">
                <button type="button" class="btn-cancel">取消</button>
                <button type="button" class="btn-confirm">確認</button>
            </div>
        </div>
    `;

    document.body.appendChild(modal);

    const confirmBtn = modal.querySelector('.btn-confirm');
    const cancelBtn = modal.querySelector('.btn-cancel');

    const closeModal = () => {
        modal.classList.add('fade-out'); // Optional: Add fade out class if styles exist
        setTimeout(() => modal.remove(), 200);
    };

    confirmBtn.addEventListener('click', () => {
        onConfirm();
        closeModal();
    });

    cancelBtn.addEventListener('click', closeModal);
    modal.addEventListener('click', (e) => {
        if (e.target === modal) closeModal();
    });

    // Handle Enter and Escape keys
    const handleKeydown = (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            e.stopPropagation(); // Stop propagation to prevent triggering background elements
            onConfirm();
            cleanup();
            closeModal();
        } else if (e.key === 'Escape') {
            e.preventDefault();
            cleanup();
            closeModal();
        }
    };

    const cleanup = () => {
        document.removeEventListener('keydown', handleKeydown);
    };

    // Add keydown listener
    document.addEventListener('keydown', handleKeydown);

    // Focus confirm button by default so Enter works naturally even without the listener (as a backup)
    // and to ensure focus is trapped/handled correctly
    setTimeout(() => confirmBtn.focus(), 50);
}

// Remove cost item
function removeCostItem(button) {
    const costItem = button.parentElement;
    costItem.style.animation = 'slideIn 0.3s ease reverse';
    setTimeout(() => {
        costItem.remove();
        updateTotalCosts();
    }, 280);
}

// Reset form to default values
function resetForm() {
    showConfirmModal(
        i18n.t('reset') || '重置',
        i18n.t('confirmReset') || '確定要重置所有輸入嗎？',
        () => {
            // Reset loan type
            elements.loanTypeSelect.value = 'mortgage';
            elements.customLoanType.classList.add('hidden');

            // Reset loan amount (with thousand separator)
            elements.loanAmount.value = formatWithThousandSeparator(10000000);  // 改為 1000 萬

            // Reset loan ratio, term, and rate
            elements.loanRatio.value = '80';
            elements.loanTerm.value = '30';
            elements.interestRate.value = '2.5';  // 改為 2.5%

            // Reset grace period
            if (elements.gracePeriodToggle) {
                elements.gracePeriodToggle.checked = false;
                elements.gracePeriodInputs.classList.remove('active');
            }
            if (elements.gracePeriod) {
                elements.gracePeriod.value = '1';
            }
            if (elements.gracePeriodUnit) {
                elements.gracePeriodUnit.value = 'years';
            }

            // Reset payment method
            elements.paymentMethod.value = 'equalPayment';

            // Clear all cost items
            elements.costsContainer.innerHTML = '';
            updateTotalCosts();

            // Hide results section
            if (elements.resultsSection) {
                elements.resultsSection.style.display = 'none';
            }

            // Clear current results
            currentResults = null;
            currentSummary = null;

            // Scroll to top
            window.scrollTo({ top: 0, behavior: 'smooth' });

            console.log('Form reset to default values');
        }
    );
}

// Update total additional costs display
function updateTotalCosts() {
    const costs = getAdditionalCosts();
    const upfrontTotal = costs
        .filter(c => c.mode !== 'financed')
        .reduce((sum, cost) => sum + cost.amount, 0);

    const financedTotal = costs
        .filter(c => c.mode === 'financed')
        .reduce((sum, cost) => sum + cost.amount, 0);

    let text = i18n.formatCurrency(upfrontTotal);
    if (financedTotal > 0) {
        text += ` + ${i18n.formatCurrency(financedTotal)} (${i18n.t('costFinanced')})`;
    }

    elements.totalCosts.textContent = text;
}

// Get additional costs from inputs
function getAdditionalCosts() {
    const costs = [];
    const costItems = elements.costsContainer.querySelectorAll('.cost-item');

    costItems.forEach(item => {
        const name = item.dataset.name;
        const amount = parseFloat(item.dataset.amount);
        const mode = item.dataset.mode || 'upfront';
        const type = item.dataset.type || 'related';
        const rate = parseFloat(item.dataset.rate || 0);
        const term = parseFloat(item.dataset.term || 0);
        const loanRatio = parseFloat(item.dataset.loanRatio || 100);
        const gracePeriod = parseFloat(item.dataset.gracePeriod || 0);

        if (name && !isNaN(amount) && amount > 0) {
            costs.push({ name, amount, mode, type, rate, term, loanRatio, gracePeriod });
        }
    });

    return costs;
}

// Get grace period in months
function getGracePeriodMonths() {
    if (!elements.gracePeriodToggle?.checked) {
        return 0;
    }

    const value = parseInt(elements.gracePeriod?.value || 0);
    const unit = elements.gracePeriodUnit?.value || 'years';

    return unit === 'years' ? value * 12 : value;
}

// Validate inputs
function validateInputs() {
    const amount = parseFormattedNumber(elements.loanAmount.value);
    const term = parseFloat(elements.loanTerm.value);
    const rate = parseFloat(elements.interestRate.value);
    const gracePeriod = getGracePeriodMonths();
    const totalMonths = term * 12;

    if (!amount || amount <= 0) {
        alert(i18n.t('alertInvalidAmount'));
        elements.loanAmount.focus();
        return false;
    }

    if (!term || term <= 0) {
        alert(i18n.t('alertInvalidTerm'));
        elements.loanTerm.focus();
        return false;
    }

    if (rate < 0) {
        alert(i18n.t('alertInvalidRate'));
        elements.interestRate.focus();
        return false;
    }

    if (gracePeriod >= totalMonths) {
        alert(i18n.t('alertInvalidGrace'));
        elements.gracePeriod.focus();
        return false;
    }

    return true;
}

// Format number with thousand separator
function formatWithThousandSeparator(num) {
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}

// Parse formatted number (remove commas)
function parseFormattedNumber(value) {
    if (typeof value === 'number') return value;
    const cleaned = value.toString().replace(/,/g, '');
    return parseFloat(cleaned) || 0;
}

// Format number input with thousand separators while typing
function formatNumberInput(input) {
    const cursorPos = input.selectionStart;
    const oldValue = input.value;

    // Count how many digits are before the cursor position
    let digitsBeforeCursor = 0;
    for (let i = 0; i < cursorPos && i < oldValue.length; i++) {
        if (/\d/.test(oldValue[i])) {
            digitsBeforeCursor++;
        }
    }

    // Remove non-digit characters except dot
    let cleaned = oldValue.replace(/[^\d.]/g, '');

    // Handle multiple dots - keep only the first one
    const dotIndex = cleaned.indexOf('.');
    if (dotIndex !== -1) {
        cleaned = cleaned.substring(0, dotIndex + 1) + cleaned.substring(dotIndex + 1).replace(/\./g, '');
    }

    // Split by dot for decimal handling
    const parts = cleaned.split('.');
    const integerPart = parts[0];
    const decimalPart = parts.length > 1 ? parts[1] : '';

    // Add thousand separators to integer part
    const formatted = integerPart.replace(/\B(?=(\d{3})+(?!\d))/g, ',');

    // Combine with decimal if exists
    const newValue = decimalPart !== '' || oldValue.includes('.') ? `${formatted}.${decimalPart}` : formatted;

    input.value = newValue;

    // Find the new cursor position by counting digits
    let newCursorPos = 0;
    let digitCount = 0;
    for (let i = 0; i < newValue.length && digitCount < digitsBeforeCursor; i++) {
        if (/\d/.test(newValue[i])) {
            digitCount++;
        }
        newCursorPos = i + 1;
    }

    // Handle case when cursor was after all digits
    if (digitCount < digitsBeforeCursor) {
        newCursorPos = newValue.length;
    }

    input.setSelectionRange(newCursorPos, newCursorPos);
}

// Main calculation function
function calculate() {
    if (!validateInputs()) return;

    const amount = parseFormattedNumber(elements.loanAmount.value);
    const productAmount = parseFormattedNumber(elements.productAmount.value);
    const ratio = parseFloat(elements.loanRatio.value) || 100;
    const rate = parseFloat(elements.interestRate.value);
    const term = parseFloat(elements.loanTerm.value);
    const gracePeriod = getGracePeriodMonths();
    const method = elements.paymentMethod.value;
    const costs = getAdditionalCosts();

    // Set calculator parameters
    calculator.setParams(amount, ratio, rate, term, gracePeriod, method, productAmount);
    calculator.setAdditionalCosts(costs);

    // Calculate
    currentResults = calculator.calculate();
    currentSummary = calculator.getSummary();

    // Display results
    displayResults(currentResults);

    // Update charts
    updateCharts(currentResults);

    // Populate table
    populateTable(currentResults.schedule);

    // Update monthly payment label
    updateMonthlyPaymentLabel();

    // Show results section with animation
    elements.resultsSection.style.display = 'block';
    elements.resultsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

// Display calculation results
function displayResults(results) {
    // Check if there's a grace period
    const hasGracePeriod = results.graceMonths > 0;

    // Monthly payment - use grace payment value element
    const toggleContainer = document.querySelector('.grace-payment-toggle');

    if (hasGracePeriod && toggleContainer) {
        // Show toggle UI and store values
        toggleContainer.style.display = 'flex';
        toggleContainer.dataset.gracePayment = results.monthlyPaymentFirst;
        toggleContainer.dataset.postGracePayment = results.monthlyPaymentLast;

        // Update display based on toggle state
        updateGracePaymentDisplay();
    } else {
        // No grace period, hide toggle and show single payment value
        if (toggleContainer) {
            toggleContainer.style.display = 'none';
        }

        if (elements.gracePaymentValue) {
            if (results.monthlyPayment !== null) {
                elements.gracePaymentValue.textContent = i18n.formatCurrency(results.monthlyPayment);
            } else {
                elements.gracePaymentValue.textContent =
                    `${i18n.formatCurrency(results.monthlyPaymentFirst)} ~ ${i18n.formatCurrency(results.monthlyPaymentLast)}`;
            }
        }
    }

    // Total payment
    if (elements.totalPayment) {
        elements.totalPayment.textContent = i18n.formatCurrency(results.totalPayment);
    }

    // Total interest
    if (elements.totalInterest) {
        elements.totalInterest.textContent = i18n.formatCurrency(results.totalInterest);
    }

    // APR
    if (elements.apr) {
        elements.apr.textContent = i18n.formatPercent(results.apr);
    }

    // Total Down Payment
    const totalDownPaymentValue = document.getElementById('totalDownPaymentValue');
    if (totalDownPaymentValue) {
        totalDownPaymentValue.textContent = i18n.formatCurrency(results.totalDownPayment);
    }
}

// Update grace payment display based on toggle state
function updateGracePaymentDisplay() {
    const toggleContainer = document.querySelector('.grace-payment-toggle');
    if (!toggleContainer || !elements.gracePaymentValue) return;

    const isPostGrace = elements.gracePaymentToggle?.checked;
    const gracePayment = parseFloat(toggleContainer.dataset.gracePayment) || 0;
    const postGracePayment = parseFloat(toggleContainer.dataset.postGracePayment) || 0;

    const displayValue = isPostGrace ? postGracePayment : gracePayment;
    elements.gracePaymentValue.textContent = i18n.formatCurrency(displayValue);
}

// Update charts
// Update charts
function updateCharts(results) {
    // Increase resolution for scrollable chart (e.g. 180 points)
    const chartData = calculator.getChartData(180);
    const colors = getThemeColors();
    const pointCount = chartData.labels.length;
    const minWidthPerPoint = 20; // 20px per data point
    const minChartHeight = 800; // Tall chart to enable vertical scroll

    // --- Payment Trend Chart ---
    const paymentCanvas = document.getElementById('paymentChart');
    const paymentContainer = paymentCanvas.parentElement;
    const containerWidth = paymentContainer.clientWidth || 800;

    // Dynamic width calculation
    const requiredWidth = Math.max(containerWidth, pointCount * minWidthPerPoint);

    paymentCanvas.style.width = `${requiredWidth}px`;
    paymentCanvas.style.height = `${minChartHeight}px`;

    const paymentCtx = paymentCanvas.getContext('2d');

    if (paymentChart) {
        paymentChart.destroy();
    }

    paymentChart = new Chart(paymentCtx, {
        type: 'line',
        data: {
            labels: chartData.labels,
            datasets: [{
                label: i18n.t('paymentAmount'),
                data: chartData.payments,
                borderColor: colors.accent,
                backgroundColor: colors.accent + '20',
                fill: true,
                stepped: true,
                pointStyle: 'rectRot',
                pointRadius: 3,
                pointHoverRadius: 6,
                pointBackgroundColor: colors.bg,
                pointBorderWidth: 2
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false, // Allow width to exceed container
            interaction: {
                mode: 'index',
                intersect: false,
            },
            plugins: {
                legend: {
                    labels: { color: colors.text }
                },
                tooltip: {
                    callbacks: {
                        label: (context) => {
                            return `${context.dataset.label}: ${i18n.formatCurrency(context.raw)}`;
                        }
                    }
                }
            },
            scales: {
                x: {
                    title: {
                        display: true,
                        text: i18n.t('period'),
                        color: colors.textMuted
                    },
                    ticks: { color: colors.textMuted },
                    grid: { color: colors.grid }
                },
                y: {
                    title: {
                        display: true,
                        text: i18n.getCurrencySymbol(),
                        color: colors.textMuted
                    },
                    ticks: {
                        color: colors.textMuted,
                        callback: (value) => i18n.formatNumber(value)
                    },
                    grid: { color: colors.grid }
                }
            }
        }
    });

    // --- Balance Chart ---
    const balanceCanvas = document.getElementById('balanceChart');
    balanceCanvas.style.width = `${requiredWidth}px`;
    balanceCanvas.style.height = `${minChartHeight}px`;

    const balanceCtx = balanceCanvas.getContext('2d');

    if (balanceChart) {
        balanceChart.destroy();
    }

    balanceChart = new Chart(balanceCtx, {
        type: 'line',
        data: {
            labels: chartData.labels,
            datasets: [
                {
                    label: i18n.t('principalPaid'),
                    data: chartData.cumulativePrincipal,
                    borderColor: colors.success,
                    backgroundColor: colors.success + '20',
                    fill: true,
                    tension: 0.4,
                    pointStyle: 'rectRot',
                    pointRadius: 3,
                    pointHoverRadius: 6,
                    pointBackgroundColor: colors.bg,
                    pointBorderWidth: 2
                },
                {
                    label: i18n.t('interestPaid'),
                    data: chartData.cumulativeInterest,
                    borderColor: colors.warning,
                    backgroundColor: colors.warning + '20',
                    fill: true,
                    tension: 0.4,
                    pointStyle: 'rectRot',
                    pointRadius: 3,
                    pointHoverRadius: 6,
                    pointBackgroundColor: colors.bg,
                    pointBorderWidth: 2
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false, // Allow width to exceed container
            interaction: {
                mode: 'index',
                intersect: false,
            },
            plugins: {
                legend: {
                    labels: { color: colors.text }
                },
                tooltip: {
                    callbacks: {
                        label: (context) => {
                            return `${context.dataset.label}: ${i18n.formatCurrency(context.raw)}`;
                        }
                    }
                }
            },
            scales: {
                x: {
                    title: {
                        display: true,
                        text: i18n.t('period'),
                        color: colors.textMuted
                    },
                    ticks: { color: colors.textMuted },
                    grid: { color: colors.grid }
                },
                y: {
                    title: {
                        display: true,
                        text: i18n.getCurrencySymbol(),
                        color: colors.textMuted
                    },
                    ticks: {
                        color: colors.textMuted,
                        callback: (value) => i18n.formatNumber(value)
                    },
                    grid: { color: colors.grid }
                }
            }
        }
    });
}

// Update charts theme
function updateChartsTheme() {
    if (currentResults) {
        updateCharts(currentResults);
    }
}

// Populate amortization table
function populateTable(schedule) {
    elements.amortizationBody.innerHTML = '';

    // Show all rows
    schedule.forEach(entry => {
        const row = document.createElement('tr');
        if (entry.isGracePeriod) {
            row.className = 'grace-period';
        }
        row.innerHTML = `
            <td>${entry.period}${entry.isGracePeriod ? ' ' + i18n.t('graceLabel') : ''}</td>
            <td>${i18n.formatCurrency(entry.payment)}</td>
            <td>${i18n.formatCurrency(entry.principal)}</td>
            <td>${i18n.formatCurrency(entry.interest)}</td>
            <td>${i18n.formatCurrency(entry.cumulativePrincipal)}</td>
            <td>${i18n.formatCurrency(entry.cumulativeInterest)}</td>
            <td>${i18n.formatCurrency(entry.remainingBalance)}</td>
        `;
        elements.amortizationBody.appendChild(row);
    });
}

// Export to CSV
function exportToCSV() {
    if (!currentResults) return;

    const filename = `loan_schedule_${new Date().toISOString().slice(0, 10)}.csv`;
    downloadCSV(currentResults.schedule, i18n, filename);
}

// Export to Excel
function exportToExcel() {
    if (!currentResults || !currentSummary) return;

    const filename = `loan_schedule_${new Date().toISOString().slice(0, 10)}.xlsx`;
    downloadExcel(currentResults.schedule, currentSummary, i18n, filename);
}

// Export to PDF
async function exportToPDF() {
    if (!currentResults || !currentSummary) return;

    // Get selected font (Fixed to NotoSansTC)
    const selectedFont = 'NotoSansTC-Regular';
    const filename = `loan_schedule_${new Date().toISOString().slice(0, 10)}.pdf`;

    try {
        await downloadPDF(currentResults.schedule, currentSummary, i18n, selectedFont, filename);
    } catch (error) {
        console.error('PDF export failed:', error);
        alert('PDF 匯出失敗，請稍後再試');
    }
}

// Share results
async function shareResults() {
    if (!currentSummary) return;

    const shareData = {
        title: i18n.t('shareTitle'),
        text: generateShareText(),
        url: window.location.href
    };

    if (navigator.share) {
        try {
            await navigator.share(shareData);
        } catch (err) {
            if (err.name !== 'AbortError') {
                console.error('Share failed:', err);
            }
        }
    } else {
        // Fallback: copy to clipboard
        const text = `${shareData.title}\n\n${shareData.text}\n\n${shareData.url}`;

        if (navigator.clipboard) {
            try {
                await navigator.clipboard.writeText(text);
                alert(i18n.t('alertExportSuccess'));
            } catch (err) {
                fallbackCopy(text);
            }
        } else {
            fallbackCopy(text);
        }
    }
}

// Fallback copy function
function fallbackCopy(text) {
    const textarea = document.createElement('textarea');
    textarea.value = text;
    textarea.style.position = 'fixed';
    textarea.style.opacity = '0';
    document.body.appendChild(textarea);
    textarea.select();
    document.execCommand('copy');
    document.body.removeChild(textarea);
    alert(i18n.t('alertExportSuccess'));
}

// Generate share text
function generateShareText() {
    const summary = currentSummary;
    const lines = [
        i18n.t('shareText'),
        '',
        `${i18n.t('loanAmount')}: ${i18n.formatCurrency(summary.actualAmount)}`,
        `${i18n.t('interestRate')}: ${summary.annualRate}%`,
        `${i18n.t('loanTerm')}: ${summary.termYears} ${i18n.t('years')}`,
    ];

    if (summary.gracePeriodMonths > 0) {
        lines.push(`${i18n.t('gracePeriod')}: ${summary.gracePeriodMonths} ${i18n.t('months')}`);
    }

    lines.push('');
    lines.push(`${i18n.t('totalPayment')}: ${i18n.formatCurrency(summary.totalPayment)}`);
    lines.push(`${i18n.t('totalInterest')}: ${i18n.formatCurrency(summary.totalInterest)}`);
    lines.push(`${i18n.t('apr')}: ${summary.apr.toFixed(2)}%`);

    return lines.join('\n');
}

// Chart Modal Functions
function openChartModal(type) {
    if (!currentResults || !currentResults.schedule.length) return;

    const schedule = currentResults.schedule;
    const maxPeriod = schedule.length;

    // Set modal title
    elements.modalTitle.textContent = type === 'payment'
        ? i18n.t('paymentChart')
        : i18n.t('balanceChart');

    // Configure slider
    elements.periodSlider.max = maxPeriod;
    elements.periodSlider.value = 1;
    elements.periodDisplay.textContent = 1;

    // Update details for period 1
    updatePeriodDetails(1);

    // Show modal
    elements.chartModal.classList.add('active');
}

function closeChartModal() {
    elements.chartModal.classList.remove('active');
}

function updatePeriodDetails(period) {
    if (!currentResults || !currentResults.schedule.length) return;

    const schedule = currentResults.schedule;
    const entry = schedule[period - 1];

    if (!entry) return;

    const isGrace = entry.isGracePeriod;
    const graceLabel = isGrace ? ` ${i18n.t('graceLabel')}` : '';

    elements.periodDetails.innerHTML = `
        <div class="detail-item highlight">
            <div class="label">${i18n.t('period')}</div>
            <div class="value">${entry.period}${graceLabel}</div>
        </div>
        <div class="detail-item">
            <div class="label">${i18n.t('payment')}</div>
            <div class="value">${i18n.formatCurrency(entry.payment)}</div>
        </div>
        <div class="detail-item">
            <div class="label">${i18n.t('principal')}</div>
            <div class="value">${i18n.formatCurrency(entry.principal)}</div>
        </div>
        <div class="detail-item">
            <div class="label">${i18n.t('interest')}</div>
            <div class="value">${i18n.formatCurrency(entry.interest)}</div>
        </div>
        <div class="detail-item">
            <div class="label">${i18n.t('cumulativePrincipal')}</div>
            <div class="value">${i18n.formatCurrency(entry.cumulativePrincipal)}</div>
        </div>
        <div class="detail-item">
            <div class="label">${i18n.t('cumulativeInterest')}</div>
            <div class="value">${i18n.formatCurrency(entry.cumulativeInterest)}</div>
        </div>
        <div class="detail-item">
            <div class="label">${i18n.t('remainingBalance')}</div>
            <div class="value">${i18n.formatCurrency(entry.remainingBalance)}</div>
        </div>
    `;
}

// Fullscreen Modal Functions
function openFullscreen(type, title) {
    if (!elements.fullscreenModal) return;

    elements.fullscreenTitle.textContent = title;
    elements.fullscreenBody.innerHTML = '';

    if (type === 'paymentChart' || type === 'balanceChart') {
        // Clone the chart canvas and recreate the chart
        const originalCanvas = document.getElementById(type);
        const newCanvas = document.createElement('canvas');
        newCanvas.id = 'fullscreen-' + type;
        newCanvas.style.width = '100%';
        newCanvas.style.height = 'calc(100vh - 150px)';
        elements.fullscreenBody.appendChild(newCanvas);

        // Recreate chart in fullscreen
        const chartData = calculator.getChartData();
        const colors = getThemeColors();

        if (type === 'paymentChart') {
            new Chart(newCanvas.getContext('2d'), {
                type: 'line',
                data: {
                    labels: chartData.labels,
                    datasets: [{
                        label: i18n.t('paymentAmount'),
                        data: chartData.payments,
                        borderColor: colors.accent,
                        backgroundColor: colors.accent + '20',
                        fill: true,
                        tension: 0.4,
                        pointRadius: 2,
                        pointHoverRadius: 5
                    }]
                },
                options: getChartOptions(colors)
            });
        } else {
            new Chart(newCanvas.getContext('2d'), {
                type: 'line',
                data: {
                    labels: chartData.labels,
                    datasets: [
                        {
                            label: i18n.t('principalPaid'),
                            data: chartData.cumulativePrincipal,
                            borderColor: colors.success,
                            backgroundColor: colors.success + '20',
                            fill: true,
                            tension: 0.4,
                            pointRadius: 2,
                            pointHoverRadius: 5
                        },
                        {
                            label: i18n.t('interestPaid'),
                            data: chartData.cumulativeInterest,
                            borderColor: colors.warning,
                            backgroundColor: colors.warning + '20',
                            fill: true,
                            tension: 0.4,
                            pointRadius: 2,
                            pointHoverRadius: 5
                        }
                    ]
                },
                options: getChartOptions(colors)
            });
        }
    } else if (type === 'table') {
        // Clone the table
        const tableContainer = document.createElement('div');
        tableContainer.className = 'table-scroll';
        const table = document.getElementById('amortizationTable').cloneNode(true);
        tableContainer.appendChild(table);
        elements.fullscreenBody.appendChild(tableContainer);
    }

    elements.fullscreenModal.classList.add('active');
    document.body.style.overflow = 'hidden';
}

function closeFullscreen() {
    if (!elements.fullscreenModal) return;
    elements.fullscreenModal.classList.remove('active');
    document.body.style.overflow = '';
}

function getChartOptions(colors) {
    return {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                labels: { color: colors.text }
            },
            tooltip: {
                callbacks: {
                    label: (context) => {
                        return `${context.dataset.label}: ${i18n.formatCurrency(context.raw)}`;
                    }
                }
            }
        },
        scales: {
            x: {
                title: {
                    display: true,
                    text: i18n.t('period'),
                    color: colors.textMuted
                },
                ticks: { color: colors.textMuted },
                grid: { color: colors.grid }
            },
            y: {
                title: {
                    display: true,
                    text: i18n.getCurrencySymbol(),
                    color: colors.textMuted
                },
                ticks: {
                    color: colors.textMuted,
                    callback: (value) => i18n.formatNumber(value)
                },
                grid: { color: colors.grid }
            }
        }
    };
}

// Make removeCostItem available globally
window.removeCostItem = removeCostItem;

// Enhance number inputs with custom spinners
function enhanceToNumberInput(input) {
    if (input.dataset.enhanced) return;

    // Wrap input
    const wrapper = document.createElement('div');
    wrapper.className = 'spinner-wrapper';
    input.parentNode.insertBefore(wrapper, input);
    wrapper.appendChild(input);

    // Create buttons
    const btns = document.createElement('div');
    btns.className = 'spinner-btns';
    btns.innerHTML = `
        <button type="button" class="spinner-btn up" tabindex="-1">▲</button>
        <button type="button" class="spinner-btn down" tabindex="-1">▼</button>
    `;
    wrapper.appendChild(btns);

    const btnUp = btns.querySelector('.up');
    const btnDown = btns.querySelector('.down');

    const step = parseFloat(input.step) || 1;
    const min = input.min !== '' ? parseFloat(input.min) : -Infinity;
    const max = input.max !== '' ? parseFloat(input.max) : Infinity;

    const updateValue = (delta) => {
        let currentVal = parseFloat(input.value) || 0;
        let newVal = currentVal + delta;

        // Handle floating point precision
        if (String(step).includes('.')) {
            const decimals = String(step).split('.')[1].length;
            newVal = parseFloat(newVal.toFixed(decimals));
        }

        if (newVal >= min && newVal <= max) {
            input.value = newVal;
            input.dispatchEvent(new Event('input', { bubbles: true }));
            input.dispatchEvent(new Event('change', { bubbles: true }));
        }
    };

    btnUp.addEventListener('click', (e) => {
        e.preventDefault();
        updateValue(step);
    });

    btnDown.addEventListener('click', (e) => {
        e.preventDefault();
        updateValue(-step);
    });

    input.dataset.enhanced = 'true';
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    init();

    // Enhance existing number inputs
    document.querySelectorAll('input[type="number"]').forEach(enhanceToNumberInput);

    // Setup chart scrolling
    setupChartScrolling();
});

// Setup scroll interactions for charts
function setupChartScrolling() {
    const containers = document.querySelectorAll('.chart-scroll-container');

    containers.forEach(container => {
        // Drag to scroll functionality
        let isDown = false;
        let startX;
        let scrollLeft;

        container.addEventListener('mousedown', (e) => {
            isDown = true;
            container.style.cursor = 'grabbing';
            startX = e.pageX - container.offsetLeft;
            scrollLeft = container.scrollLeft;
        });

        container.addEventListener('mouseleave', () => {
            isDown = false;
            container.style.cursor = 'grab';
        });

        container.addEventListener('mouseup', () => {
            isDown = false;
            container.style.cursor = 'grab';
        });

        container.addEventListener('mousemove', (e) => {
            if (!isDown) return;
            e.preventDefault();
            const x = e.pageX - container.offsetLeft;
            const walk = (x - startX) * 1.5; // Scroll speed multiplier
            container.scrollLeft = scrollLeft - walk;
        });
    });
}
