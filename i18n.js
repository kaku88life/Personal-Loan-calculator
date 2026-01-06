// Internationalization (i18n) System

const translations = {
    zh: {
        // Header
        title: '貸款計算機',
        language: '語言',
        theme: '主題',
        currency: '幣別',
        themeLight: '淺色',
        themeDark: '深色',
        themeNight: '夜間',

        // Loan Details
        loanDetails: '貸款資訊',
        loanType: '貸款類型',
        mortgage: '房貸',
        carLoan: '車貸',
        personalLoan: '信貸',
        other: '其他',
        customLoanTypePlaceholder: '請輸入貸款類型',
        loanAmount: '貸款金額',
        loanRatio: '貸款成數',
        loanTerm: '貸款年限',
        years: '年',
        months: '個月',
        interestRate: '年利率',
        paymentMethod: '還款方式',
        equalPayment: '本息平均攤還（等額本息）',
        equalPrincipal: '本金平均攤還（等額本金）',
        gracePeriod: '寬限期',
        gracePeriodHint: '寬限期內只繳利息，不還本金',
        gracePeriodPayment: '寬限期內',
        postGracePeriodPayment: '寬限期後',

        // Additional Costs
        additionalCosts: '額外費用',
        costNamePlaceholder: '費用名目',
        costAmountPlaceholder: '金額',
        totalCosts: '總額外費用：',

        // Calculate
        calculate: '計算',

        // Results
        results: '計算結果',
        monthlyPayment: '每月還款金額',
        monthlyPaymentRange: '每月還款金額（首期/末期）',
        monthlyPaymentGrace: '寬限期月付',
        totalPayment: '總還款金額',
        totalInterest: '總利息',
        totalCostWithFees: '總成本（含費用）',
        apr: '總費用年百分率',
        aprDescription: '包含所有費用的實際年利率',

        // Charts
        paymentChart: '還款金額趨勢圖',
        balanceChart: '本金利息累計圖',
        paymentAmount: '還款金額',
        principalPaid: '已還本金',
        interestPaid: '已還利息',
        period: '期數',

        // Table
        amortizationSchedule: '還款明細表',
        payment: '還款金額',
        principal: '本金',
        interest: '利息',
        cumulativePrincipal: '累計本金',
        cumulativeInterest: '累計利息',
        remainingBalance: '剩餘本金',
        graceLabel: '(寬限)',

        // Export
        export: '匯出',
        share: '分享',
        shareTitle: '貸款計算結果',
        shareText: '我使用貸款計算機計算了貸款方案',
        viewDetails: '查看詳細',
        detailInfo: '詳細資訊',
        pdfFont: 'PDF 字體',

        // Footer
        footer: '© 2026 貸款計算機',

        // Alerts
        alertFillFields: '請填寫所有必要欄位',
        alertInvalidAmount: '請輸入有效的貸款金額',
        alertInvalidTerm: '請輸入有效的貸款年限',
        alertInvalidRate: '請輸入有效的利率',
        alertInvalidGrace: '寬限期不能超過貸款年限',
        alertShareNotSupported: '您的瀏覽器不支援分享功能',
        alertShareSuccess: '分享成功',
        alertShareCancelled: '分享已取消',
        alertExportSuccess: '匯出成功',

        // Currency
        currencySymbol: 'NT$',
        currencyName: '台幣',

        // Confirm
        confirmReset: '確定要重置所有輸入嗎？'
    },

    en: {
        // Header
        title: 'Loan Calculator',
        language: 'Language',
        theme: 'Theme',
        currency: 'Currency',
        themeLight: 'Light',
        themeDark: 'Dark',
        themeNight: 'Night',

        // Loan Details
        loanDetails: 'Loan Details',
        loanType: 'Loan Type',
        mortgage: 'Mortgage',
        carLoan: 'Car Loan',
        personalLoan: 'Personal Loan',
        other: 'Other',
        customLoanTypePlaceholder: 'Enter loan type',
        loanAmount: 'Loan Amount',
        loanRatio: 'Loan-to-Value Ratio',
        loanTerm: 'Loan Term',
        years: 'Years',
        months: 'Months',
        interestRate: 'Annual Interest Rate',
        paymentMethod: 'Payment Method',
        equalPayment: 'Equal Payment (Amortization)',
        equalPrincipal: 'Equal Principal',
        gracePeriod: 'Grace Period',
        gracePeriodHint: 'Interest-only payments during grace period',
        gracePeriodPayment: 'During Grace',
        postGracePeriodPayment: 'After Grace',

        // Additional Costs
        additionalCosts: 'Additional Costs',
        costNamePlaceholder: 'Cost Name',
        costAmountPlaceholder: 'Amount',
        totalCosts: 'Total Additional Costs:',

        // Calculate
        calculate: 'Calculate',

        // Results
        results: 'Results',
        monthlyPayment: 'Monthly Payment',
        monthlyPaymentRange: 'Monthly Payment (First/Last)',
        monthlyPaymentGrace: 'Grace Period Payment',
        totalPayment: 'Total Payment',
        totalInterest: 'Total Interest',
        totalCostWithFees: 'Total Cost (incl. Fees)',
        apr: 'Annual Percentage Rate',
        aprDescription: 'Effective annual rate including all fees',

        // Charts
        paymentChart: 'Payment Trend Chart',
        balanceChart: 'Principal & Interest Chart',
        paymentAmount: 'Payment Amount',
        principalPaid: 'Principal Paid',
        interestPaid: 'Interest Paid',
        period: 'Period',

        // Table
        amortizationSchedule: 'Amortization Schedule',
        payment: 'Payment',
        principal: 'Principal',
        interest: 'Interest',
        cumulativePrincipal: 'Cumulative Principal',
        cumulativeInterest: 'Cumulative Interest',
        remainingBalance: 'Remaining Balance',
        graceLabel: '(Grace)',

        // Export
        export: 'Export',
        share: 'Share',
        shareTitle: 'Loan Calculation Results',
        shareText: 'I calculated a loan plan using Loan Calculator',
        viewDetails: 'View Details',
        detailInfo: 'Detail Information',
        pdfFont: 'PDF Font',

        // Footer
        footer: '© 2026 Loan Calculator',

        // Alerts
        alertFillFields: 'Please fill in all required fields',
        alertInvalidAmount: 'Please enter a valid loan amount',
        alertInvalidTerm: 'Please enter a valid loan term',
        alertInvalidRate: 'Please enter a valid interest rate',
        alertInvalidGrace: 'Grace period cannot exceed loan term',
        alertShareNotSupported: 'Sharing is not supported in your browser',
        alertShareSuccess: 'Shared successfully',
        alertShareCancelled: 'Share cancelled',
        alertExportSuccess: 'Export successful',

        // Currency
        currencySymbol: 'NT$',
        currencyName: 'TWD',

        // Confirm
        confirmReset: 'Are you sure you want to reset all inputs?'
    },

    ja: {
        // Header
        title: 'ローン計算機',
        language: '言語',
        theme: 'テーマ',
        currency: '通貨',
        themeLight: 'ライト',
        themeDark: 'ダーク',
        themeNight: 'ナイト',

        // Loan Details
        loanDetails: 'ローン情報',
        loanType: 'ローンタイプ',
        mortgage: '住宅ローン',
        carLoan: '自動車ローン',
        personalLoan: '個人ローン',
        other: 'その他',
        customLoanTypePlaceholder: 'ローンタイプを入力',
        loanAmount: '借入金額',
        loanRatio: '借入比率',
        loanTerm: '返済期間',
        years: '年',
        months: 'ヶ月',
        interestRate: '年利率',
        paymentMethod: '返済方法',
        equalPayment: '元利均等返済',
        equalPrincipal: '元金均等返済',
        gracePeriod: '据置期間',
        gracePeriodHint: '据置期間中は利息のみ支払い',
        gracePeriodPayment: '据置期間中',
        postGracePeriodPayment: '据置期間後',

        // Additional Costs
        additionalCosts: '追加費用',
        costNamePlaceholder: '費用名',
        costAmountPlaceholder: '金額',
        totalCosts: '追加費用合計：',

        // Calculate
        calculate: '計算する',

        // Results
        results: '計算結果',
        monthlyPayment: '月々の返済額',
        monthlyPaymentRange: '月々の返済額（初回/最終）',
        monthlyPaymentGrace: '据置期間中の月額',
        totalPayment: '総返済額',
        totalInterest: '総利息',
        totalCostWithFees: '総コスト（手数料込）',
        apr: '実質年率',
        aprDescription: '手数料を含む実質年率',

        // Charts
        paymentChart: '返済額推移グラフ',
        balanceChart: '元金・利息累計グラフ',
        paymentAmount: '返済額',
        principalPaid: '返済元金',
        interestPaid: '返済利息',
        period: '期',

        // Table
        amortizationSchedule: '返済スケジュール',
        payment: '返済額',
        principal: '元金',
        interest: '利息',
        cumulativePrincipal: '累計元金',
        cumulativeInterest: '累計利息',
        remainingBalance: '残高',
        graceLabel: '(据置)',

        // Export
        export: 'エクスポート',
        share: '共有',
        shareTitle: 'ローン計算結果',
        shareText: 'ローン計算機でローンプランを計算しました',
        viewDetails: '詳細を見る',
        detailInfo: '詳細情報',
        pdfFont: 'PDFフォント',

        // Footer
        footer: '© 2026 ローン計算機',

        // Alerts
        alertFillFields: 'すべての必須項目を入力してください',
        alertInvalidAmount: '有効な借入金額を入力してください',
        alertInvalidTerm: '有効な返済期間を入力してください',
        alertInvalidRate: '有効な利率を入力してください',
        alertInvalidGrace: '据置期間は返済期間を超えることはできません',
        alertShareNotSupported: 'お使いのブラウザは共有機能に対応していません',
        alertShareSuccess: '共有しました',
        alertShareCancelled: '共有がキャンセルされました',
        alertExportSuccess: 'エクスポート完了',

        // Currency
        currencySymbol: '¥',
        currencyName: 'JPY',

        // Confirm
        confirmReset: 'すべての入力をリセットしますか？'
    }
};

// Currency configurations
const currencies = {
    TWD: {
        symbol: 'NT$',
        name: { zh: '台幣', en: 'TWD', ja: '台湾ドル' },
        decimals: 0
    },
    JPY: {
        symbol: '¥',
        name: { zh: '日幣', en: 'JPY', ja: '日本円' },
        decimals: 0
    },
    USD: {
        symbol: '$',
        name: { zh: '美金', en: 'USD', ja: '米ドル' },
        decimals: 2
    }
};

// i18n class
class I18n {
    constructor() {
        this.currentLang = 'zh';
        this.currentCurrency = 'TWD';
    }

    setLanguage(lang) {
        if (translations[lang]) {
            this.currentLang = lang;
            this.updateUI();
            this.updateDocumentLang();
        }
    }

    setCurrency(currency) {
        if (currencies[currency]) {
            this.currentCurrency = currency;
            this.updateCurrencyUI();
        }
    }

    t(key) {
        return translations[this.currentLang][key] || key;
    }

    formatCurrency(amount) {
        const config = currencies[this.currentCurrency];
        const formatted = amount.toLocaleString(this.getLocale(), {
            minimumFractionDigits: config.decimals,
            maximumFractionDigits: config.decimals
        });
        return `${config.symbol}${formatted}`;
    }

    formatNumber(num, decimals = 0) {
        return num.toLocaleString(this.getLocale(), {
            minimumFractionDigits: decimals,
            maximumFractionDigits: decimals
        });
    }

    formatPercent(num, decimals = 2) {
        return num.toLocaleString(this.getLocale(), {
            minimumFractionDigits: decimals,
            maximumFractionDigits: decimals
        }) + '%';
    }

    getLocale() {
        const locales = { zh: 'zh-TW', en: 'en-US', ja: 'ja-JP' };
        return locales[this.currentLang] || 'zh-TW';
    }

    updateUI() {
        // Update all elements with data-i18n attribute
        document.querySelectorAll('[data-i18n]').forEach(element => {
            const key = element.getAttribute('data-i18n');
            if (translations[this.currentLang][key]) {
                element.textContent = translations[this.currentLang][key];
            }
        });

        // Update select options with data-i18n
        document.querySelectorAll('option[data-i18n]').forEach(option => {
            const key = option.getAttribute('data-i18n');
            if (translations[this.currentLang][key]) {
                option.textContent = translations[this.currentLang][key];
            }
        });

        // Update placeholders
        const customLoanInput = document.getElementById('customLoanType');
        if (customLoanInput) {
            customLoanInput.placeholder = this.t('customLoanTypePlaceholder');
        }

        // Update theme button titles
        const themeBtns = document.querySelectorAll('.theme-btn');
        const themeTitles = {
            light: this.t('themeLight'),
            dark: this.t('themeDark'),
            night: this.t('themeNight')
        };
        themeBtns.forEach(btn => {
            const theme = btn.getAttribute('data-theme');
            if (themeTitles[theme]) {
                btn.title = themeTitles[theme];
            }
        });
    }

    updateCurrencyUI() {
        const currencyUnit = document.getElementById('currencyUnit');
        if (currencyUnit) {
            currencyUnit.textContent = this.currentCurrency;
        }

        // Update currency select display
        const currencySelect = document.getElementById('currencySelect');
        if (currencySelect) {
            const options = currencySelect.options;
            for (let i = 0; i < options.length; i++) {
                const currency = options[i].value;
                const currConfig = currencies[currency];
                if (currConfig) {
                    options[i].textContent = `${currency} (${currConfig.name[this.currentLang]})`;
                }
            }
        }
    }

    updateDocumentLang() {
        document.documentElement.lang = this.currentLang === 'zh' ? 'zh-TW' :
            this.currentLang === 'ja' ? 'ja' : 'en';
    }

    getCurrencySymbol() {
        return currencies[this.currentCurrency].symbol;
    }

    getCurrencyDecimals() {
        return currencies[this.currentCurrency].decimals;
    }
}

// Create global instance
const i18n = new I18n();
