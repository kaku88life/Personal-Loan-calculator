// Main Application Logic

// Chart instances
let paymentChart = null;
let balanceChart = null;

// Current calculation results
let currentResults = null;
let currentSummary = null;

// Theme settings
const themes = ['light', 'dark', 'night'];
const themeIcons = { light: '🌤️', dark: '🌙', night: '🌃' };
let currentThemeIndex = 0;

// Default loan terms by type (in years)
const defaultLoanTerms = {
    mortgage: 30,
    car: 5,
    personal: 5,
    other: 10
};

// Default loan ratios by type (in %)
const defaultLoanRatios = {
    mortgage: 80,
    car: 100,
    personal: 100,
    other: 80
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
    loanAmount: document.getElementById('loanAmount'),
    loanRatio: document.getElementById('loanRatio'),
    loanTerm: document.getElementById('loanTerm'),
    gracePeriod: document.getElementById('gracePeriod'),
    gracePeriodToggle: document.getElementById('gracePeriodToggle'),
    gracePeriodInputs: document.getElementById('gracePeriodInputs'),
    gracePeriodUnit: document.getElementById('gracePeriodUnit'),
    interestRate: document.getElementById('interestRate'),
    paymentMethod: document.getElementById('paymentMethod'),
    currencyUnit: document.getElementById('currencyUnit'),

    // Costs
    addCostBtn: document.getElementById('addCostBtn'),
    costsContainer: document.getElementById('costsContainer'),
    totalCostsValue: document.getElementById('totalCostsValue'),

    // Calculate
    calculateBtn: document.getElementById('calculateBtn'),

    // Results
    resultsSection: document.getElementById('resultsSection'),
    monthlyPaymentValue: document.getElementById('monthlyPaymentValue'),
    totalPaymentValue: document.getElementById('totalPaymentValue'),
    totalInterestValue: document.getElementById('totalInterestValue'),
    totalCostValue: document.getElementById('totalCostValue'),
    aprValue: document.getElementById('aprValue'),
    amortizationBody: document.getElementById('amortizationBody'),

    // Export/Share dropdown
    shareDropdownBtn: document.getElementById('shareDropdownBtn'),
    shareDropdownMenu: document.getElementById('shareDropdownMenu'),
    exportCSV: document.getElementById('exportCSV'),
    exportExcel: document.getElementById('exportExcel'),
    exportPDF: document.getElementById('exportPDF'),
    shareBtn: document.getElementById('shareBtn'),

    // Chart magnify
    magnifyPaymentChart: document.getElementById('magnifyPaymentChart'),
    magnifyBalanceChart: document.getElementById('magnifyBalanceChart'),

    // Modal
    chartModal: document.getElementById('chartModal'),
    modalTitle: document.getElementById('modalTitle'),
    modalClose: document.getElementById('modalClose'),
    periodSlider: document.getElementById('periodSlider'),
    periodDisplay: document.getElementById('periodDisplay'),
    periodDetails: document.getElementById('periodDetails'),

    // Settings dropdown
    settingsToggle: document.getElementById('settingsToggle'),
    settingsMenu: document.getElementById('settingsMenu'),

    // Grace payment toggle
    graceToggleContainer: document.getElementById('graceToggleContainer'),
    gracePaymentToggle: document.getElementById('gracePaymentToggle'),
    gracePaymentValue: document.getElementById('gracePaymentValue'),

    // Expand buttons
    expandPaymentChart: document.getElementById('expandPaymentChart'),
    expandBalanceChart: document.getElementById('expandBalanceChart'),
    expandTable: document.getElementById('expandTable'),

    // Fullscreen modal
    fullscreenModal: document.getElementById('fullscreenModal'),
    fullscreenTitle: document.getElementById('fullscreenTitle'),
    fullscreenClose: document.getElementById('fullscreenClose'),
    fullscreenBody: document.getElementById('fullscreenBody')
};

// Initialize application
function init() {
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

    // Loan type change - update default term, ratio and handle custom type
    elements.loanTypeSelect.addEventListener('change', (e) => {
        const loanType = e.target.value;

        // Show/hide custom loan type input
        if (loanType === 'other') {
            elements.customLoanType.classList.remove('hidden');
            elements.customLoanType.focus();
        } else {
            elements.customLoanType.classList.add('hidden');
        }

        // Update default loan term based on loan type
        if (defaultLoanTerms[loanType]) {
            elements.loanTerm.value = defaultLoanTerms[loanType];
        }

        // Update default loan ratio based on loan type
        if (defaultLoanRatios[loanType]) {
            elements.loanRatio.value = defaultLoanRatios[loanType];
        }
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

    // Export buttons
    elements.exportCSV.addEventListener('click', exportToCSV);
    elements.exportExcel.addEventListener('click', exportToExcel);
    elements.exportPDF.addEventListener('click', exportToPDF);
    elements.shareBtn.addEventListener('click', shareResults);

    // Enter key to calculate
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' && e.target.tagName !== 'BUTTON') {
            calculate();
        }
    });
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
        const hasGrace = parseInt(elements.gracePeriod?.value || 0) > 0;
        const isEqualPrincipal = elements.paymentMethod.value === 'equalPrincipal';

        if (hasGrace || isEqualPrincipal) {
            label.setAttribute('data-i18n', 'monthlyPaymentRange');
            label.textContent = i18n.t('monthlyPaymentRange');
        } else {
            label.setAttribute('data-i18n', 'monthlyPayment');
            label.textContent = i18n.t('monthlyPayment');
        }
    }
}

// Add cost item
function addCostItem() {
    const costItem = document.createElement('div');
    costItem.className = 'cost-item';
    costItem.innerHTML = `
        <input type="text" class="cost-name" placeholder="${i18n.t('costNamePlaceholder')}">
        <input type="number" class="cost-amount" placeholder="${i18n.t('costAmountPlaceholder')}" min="0" step="100">
        <button type="button" class="btn-remove" onclick="removeCostItem(this)">&times;</button>
    `;

    elements.costsContainer.appendChild(costItem);

    // Add event listener for amount change
    const amountInput = costItem.querySelector('.cost-amount');
    amountInput.addEventListener('input', updateTotalCosts);

    // Focus on name input
    costItem.querySelector('.cost-name').focus();
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

// Update total additional costs display
function updateTotalCosts() {
    const costs = getAdditionalCosts();
    const total = costs.reduce((sum, cost) => sum + cost.amount, 0);
    elements.totalCostsValue.textContent = i18n.formatCurrency(total);
}

// Get additional costs from inputs
function getAdditionalCosts() {
    const costItems = elements.costsContainer.querySelectorAll('.cost-item');
    const costs = [];

    costItems.forEach(item => {
        const name = item.querySelector('.cost-name').value.trim();
        const amount = parseFloat(item.querySelector('.cost-amount').value) || 0;

        if (name && amount > 0) {
            costs.push({ name, amount });
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
    const amount = parseFloat(elements.loanAmount.value);
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

// Main calculation function
function calculate() {
    if (!validateInputs()) return;

    const amount = parseFloat(elements.loanAmount.value);
    const ratio = parseFloat(elements.loanRatio.value) || 100;
    const rate = parseFloat(elements.interestRate.value);
    const term = parseFloat(elements.loanTerm.value);
    const gracePeriod = getGracePeriodMonths();
    const method = elements.paymentMethod.value;
    const costs = getAdditionalCosts();

    // Set calculator parameters
    calculator.setParams(amount, ratio, rate, term, gracePeriod, method);
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

    // Monthly payment
    if (hasGracePeriod) {
        // Show toggle for grace period payments
        elements.graceToggleContainer.style.display = 'block';
        elements.monthlyPaymentValue.style.display = 'none';

        // Store values for toggle
        elements.graceToggleContainer.dataset.gracePayment = results.monthlyPaymentFirst;
        elements.graceToggleContainer.dataset.postGracePayment = results.monthlyPaymentLast;

        // Update display based on toggle state
        updateGracePaymentDisplay();
    } else {
        // Hide toggle, show normal payment
        elements.graceToggleContainer.style.display = 'none';
        elements.monthlyPaymentValue.style.display = 'block';

        if (results.monthlyPayment !== null) {
            elements.monthlyPaymentValue.textContent = i18n.formatCurrency(results.monthlyPayment);
        } else {
            elements.monthlyPaymentValue.textContent =
                `${i18n.formatCurrency(results.monthlyPaymentFirst)} ~ ${i18n.formatCurrency(results.monthlyPaymentLast)}`;
        }
    }

    // Total payment
    elements.totalPaymentValue.textContent = i18n.formatCurrency(results.totalPayment);

    // Total interest
    elements.totalInterestValue.textContent = i18n.formatCurrency(results.totalInterest);

    // Total cost with fees
    elements.totalCostValue.textContent = i18n.formatCurrency(results.totalCost);

    // APR
    if (elements.aprValue) {
        elements.aprValue.textContent = i18n.formatPercent(results.apr);
    }
}

// Update grace payment display based on toggle state
function updateGracePaymentDisplay() {
    if (!elements.graceToggleContainer || !elements.gracePaymentValue) return;

    const isPostGrace = elements.gracePaymentToggle?.checked;
    const gracePayment = parseFloat(elements.graceToggleContainer.dataset.gracePayment) || 0;
    const postGracePayment = parseFloat(elements.graceToggleContainer.dataset.postGracePayment) || 0;

    const displayValue = isPostGrace ? postGracePayment : gracePayment;
    elements.gracePaymentValue.textContent = i18n.formatCurrency(displayValue);
}

// Update charts
function updateCharts(results) {
    const chartData = calculator.getChartData();
    const colors = getThemeColors();

    // Payment trend chart
    const paymentCtx = document.getElementById('paymentChart').getContext('2d');

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
                tension: 0.4,
                pointRadius: chartData.labels.length > 60 ? 0 : 3,
                pointHoverRadius: 5
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
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

    // Balance chart (cumulative principal & interest)
    const balanceCtx = document.getElementById('balanceChart').getContext('2d');

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
                    pointRadius: chartData.labels.length > 60 ? 0 : 3,
                    pointHoverRadius: 5
                },
                {
                    label: i18n.t('interestPaid'),
                    data: chartData.cumulativeInterest,
                    borderColor: colors.warning,
                    backgroundColor: colors.warning + '20',
                    fill: true,
                    tension: 0.4,
                    pointRadius: chartData.labels.length > 60 ? 0 : 3,
                    pointHoverRadius: 5
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
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
function exportToPDF() {
    if (!currentResults || !currentSummary) return;

    const filename = `loan_schedule_${new Date().toISOString().slice(0, 10)}.pdf`;
    downloadPDF(currentResults.schedule, currentSummary, i18n, filename);
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

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', init);
