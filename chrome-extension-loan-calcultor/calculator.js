// Loan Calculator Logic

class LoanCalculator {
    constructor() {
        this.loanAmount = 0;
        this.loanRatio = 100;
        this.annualRate = 0;
        this.termYears = 0;
        this.gracePeriodMonths = 0;
        this.paymentMethod = 'equalPayment';
        this.additionalCosts = [];
        this.schedule = [];
    }

    setParams(amount, ratio, rate, years, gracePeriod, method) {
        this.loanAmount = amount;
        this.loanRatio = ratio;
        this.annualRate = rate / 100;
        this.termYears = years;
        this.gracePeriodMonths = gracePeriod || 0;
        this.paymentMethod = method;
    }

    setAdditionalCosts(costs) {
        this.additionalCosts = costs;
    }

    getTotalAdditionalCosts() {
        return this.additionalCosts.reduce((sum, cost) => sum + cost.amount, 0);
    }

    getActualLoanAmount() {
        return this.loanAmount * (this.loanRatio / 100);
    }

    calculate() {
        const principal = this.getActualLoanAmount();
        const monthlyRate = this.annualRate / 12;
        const totalMonths = this.termYears * 12;
        const graceMonths = Math.min(this.gracePeriodMonths, totalMonths - 1);
        const repaymentMonths = totalMonths - graceMonths;

        this.schedule = [];

        if (this.paymentMethod === 'equalPayment') {
            return this.calculateEqualPaymentWithGrace(principal, monthlyRate, totalMonths, graceMonths);
        } else {
            return this.calculateEqualPrincipalWithGrace(principal, monthlyRate, totalMonths, graceMonths);
        }
    }

    // Equal Payment with Grace Period - 本息平均攤還（含寬限期）
    calculateEqualPaymentWithGrace(principal, monthlyRate, totalMonths, graceMonths) {
        const repaymentMonths = totalMonths - graceMonths;
        let remainingBalance = principal;
        let cumulativePrincipal = 0;
        let cumulativeInterest = 0;
        let totalInterest = 0;
        let gracePayment = 0;

        // Calculate monthly payment after grace period
        let monthlyPayment;
        if (monthlyRate === 0) {
            monthlyPayment = principal / repaymentMonths;
        } else {
            monthlyPayment = principal *
                (monthlyRate * Math.pow(1 + monthlyRate, repaymentMonths)) /
                (Math.pow(1 + monthlyRate, repaymentMonths) - 1);
        }

        // Grace period - interest only
        for (let month = 1; month <= graceMonths; month++) {
            const interestPayment = remainingBalance * monthlyRate;
            gracePayment = interestPayment;

            cumulativeInterest += interestPayment;
            totalInterest += interestPayment;

            this.schedule.push({
                period: month,
                payment: Math.round(interestPayment),
                principal: 0,
                interest: Math.round(interestPayment),
                cumulativePrincipal: 0,
                cumulativeInterest: Math.round(cumulativeInterest),
                remainingBalance: Math.round(remainingBalance),
                isGracePeriod: true
            });
        }

        // Regular payment period
        for (let month = graceMonths + 1; month <= totalMonths; month++) {
            const interestPayment = remainingBalance * monthlyRate;
            const principalPayment = monthlyPayment - interestPayment;

            cumulativePrincipal += principalPayment;
            cumulativeInterest += interestPayment;
            remainingBalance -= principalPayment;
            totalInterest += interestPayment;

            if (month === totalMonths) {
                remainingBalance = 0;
            }

            this.schedule.push({
                period: month,
                payment: Math.round(monthlyPayment),
                principal: Math.round(principalPayment),
                interest: Math.round(interestPayment),
                cumulativePrincipal: Math.round(cumulativePrincipal),
                cumulativeInterest: Math.round(cumulativeInterest),
                remainingBalance: Math.max(0, Math.round(remainingBalance)),
                isGracePeriod: false
            });
        }

        const totalPayment = (gracePayment * graceMonths) + (monthlyPayment * repaymentMonths);
        const additionalCosts = this.getTotalAdditionalCosts();

        // Calculate APR
        const apr = this.calculateAPR(principal, totalPayment, additionalCosts, totalMonths);

        return {
            monthlyPayment: Math.round(monthlyPayment),
            monthlyPaymentFirst: graceMonths > 0 ? Math.round(gracePayment) : Math.round(monthlyPayment),
            monthlyPaymentLast: Math.round(monthlyPayment),
            gracePayment: graceMonths > 0 ? Math.round(gracePayment) : null,
            totalPayment: Math.round(totalPayment),
            totalInterest: Math.round(totalInterest),
            totalCost: Math.round(totalPayment + additionalCosts),
            additionalCosts: additionalCosts,
            principal: principal,
            graceMonths: graceMonths,
            apr: apr,
            schedule: this.schedule
        };
    }

    // Equal Principal with Grace Period - 本金平均攤還（含寬限期）
    calculateEqualPrincipalWithGrace(principal, monthlyRate, totalMonths, graceMonths) {
        const repaymentMonths = totalMonths - graceMonths;
        const monthlyPrincipal = principal / repaymentMonths;

        let remainingBalance = principal;
        let cumulativePrincipal = 0;
        let cumulativeInterest = 0;
        let totalInterest = 0;
        let firstRegularPayment = 0;
        let lastPayment = 0;
        let gracePayment = 0;

        // Grace period - interest only
        for (let month = 1; month <= graceMonths; month++) {
            const interestPayment = remainingBalance * monthlyRate;
            gracePayment = interestPayment;

            cumulativeInterest += interestPayment;
            totalInterest += interestPayment;

            this.schedule.push({
                period: month,
                payment: Math.round(interestPayment),
                principal: 0,
                interest: Math.round(interestPayment),
                cumulativePrincipal: 0,
                cumulativeInterest: Math.round(cumulativeInterest),
                remainingBalance: Math.round(remainingBalance),
                isGracePeriod: true
            });
        }

        // Regular payment period
        for (let month = graceMonths + 1; month <= totalMonths; month++) {
            const interestPayment = remainingBalance * monthlyRate;
            const payment = monthlyPrincipal + interestPayment;

            cumulativePrincipal += monthlyPrincipal;
            cumulativeInterest += interestPayment;
            remainingBalance -= monthlyPrincipal;
            totalInterest += interestPayment;

            if (month === graceMonths + 1) firstRegularPayment = payment;
            if (month === totalMonths) {
                lastPayment = payment;
                remainingBalance = 0;
            }

            this.schedule.push({
                period: month,
                payment: Math.round(payment),
                principal: Math.round(monthlyPrincipal),
                interest: Math.round(interestPayment),
                cumulativePrincipal: Math.round(cumulativePrincipal),
                cumulativeInterest: Math.round(cumulativeInterest),
                remainingBalance: Math.max(0, Math.round(remainingBalance)),
                isGracePeriod: false
            });
        }

        const totalPayment = principal + totalInterest;
        const additionalCosts = this.getTotalAdditionalCosts();

        // Calculate APR
        const apr = this.calculateAPR(principal, totalPayment, additionalCosts, totalMonths);

        return {
            monthlyPayment: null,
            monthlyPaymentFirst: graceMonths > 0 ? Math.round(gracePayment) : Math.round(firstRegularPayment),
            monthlyPaymentLast: Math.round(lastPayment),
            gracePayment: graceMonths > 0 ? Math.round(gracePayment) : null,
            totalPayment: Math.round(totalPayment),
            totalInterest: Math.round(totalInterest),
            totalCost: Math.round(totalPayment + additionalCosts),
            additionalCosts: additionalCosts,
            principal: principal,
            graceMonths: graceMonths,
            apr: apr,
            schedule: this.schedule
        };
    }

    // Calculate Annual Percentage Rate (APR) - 總費用年百分率
    calculateAPR(principal, totalPayment, additionalCosts, totalMonths) {
        const totalCost = totalPayment + additionalCosts;
        const netLoan = principal - additionalCosts;

        if (netLoan <= 0) {
            return this.annualRate * 100;
        }

        const apr = this.calculateIRR(principal, additionalCosts, this.schedule, totalMonths);
        return apr;
    }

    // Internal Rate of Return calculation for APR
    calculateIRR(principal, upfrontCosts, schedule, totalMonths) {
        const netReceived = principal - upfrontCosts;

        if (netReceived <= 0 || schedule.length === 0) {
            return this.annualRate * 100;
        }

        let low = 0;
        let high = 1;
        let mid;
        const tolerance = 0.00001;
        const maxIterations = 100;

        for (let i = 0; i < maxIterations; i++) {
            mid = (low + high) / 2;

            let npv = -netReceived;
            for (let j = 0; j < schedule.length; j++) {
                npv += schedule[j].payment / Math.pow(1 + mid, j + 1);
            }

            if (Math.abs(npv) < tolerance) {
                break;
            }

            if (npv > 0) {
                low = mid;
            } else {
                high = mid;
            }
        }

        const annualRate = Math.pow(1 + mid, 12) - 1;
        return annualRate * 100;
    }

    getSchedule() {
        return this.schedule;
    }

    // Get data for charts - sample every N periods to reduce data points
    getChartData(maxPoints = 60) {
        const schedule = this.schedule;
        const interval = Math.ceil(schedule.length / maxPoints);

        const labels = [];
        const payments = [];
        const cumulativePrincipal = [];
        const cumulativeInterest = [];

        for (let i = 0; i < schedule.length; i += interval) {
            const entry = schedule[i];
            labels.push(entry.period);
            payments.push(entry.payment);
            cumulativePrincipal.push(entry.cumulativePrincipal);
            cumulativeInterest.push(entry.cumulativeInterest);
        }

        // Always include the last entry
        const lastEntry = schedule[schedule.length - 1];
        if (labels[labels.length - 1] !== lastEntry.period) {
            labels.push(lastEntry.period);
            payments.push(lastEntry.payment);
            cumulativePrincipal.push(lastEntry.cumulativePrincipal);
            cumulativeInterest.push(lastEntry.cumulativeInterest);
        }

        return {
            labels,
            payments,
            cumulativePrincipal,
            cumulativeInterest
        };
    }

    // Generate summary for sharing
    getSummary() {
        const result = this.calculate();
        return {
            loanAmount: this.loanAmount,
            actualAmount: this.getActualLoanAmount(),
            loanRatio: this.loanRatio,
            annualRate: this.annualRate * 100,
            termYears: this.termYears,
            gracePeriodMonths: this.gracePeriodMonths,
            paymentMethod: this.paymentMethod,
            monthlyPaymentFirst: result.monthlyPaymentFirst,
            monthlyPaymentLast: result.monthlyPaymentLast,
            gracePayment: result.gracePayment,
            totalPayment: result.totalPayment,
            totalInterest: result.totalInterest,
            totalCost: result.totalCost,
            apr: result.apr,
            additionalCosts: this.additionalCosts
        };
    }
}

// Export functions
function generateCSV(schedule, i18nInstance) {
    const headers = [
        i18nInstance.t('period'),
        i18nInstance.t('payment'),
        i18nInstance.t('principal'),
        i18nInstance.t('interest'),
        i18nInstance.t('cumulativePrincipal'),
        i18nInstance.t('cumulativeInterest'),
        i18nInstance.t('remainingBalance')
    ].join(',');

    const rows = schedule.map(entry => [
        entry.period + (entry.isGracePeriod ? i18nInstance.t('graceLabel') : ''),
        entry.payment,
        entry.principal,
        entry.interest,
        entry.cumulativePrincipal,
        entry.cumulativeInterest,
        entry.remainingBalance
    ].join(','));

    // Add BOM for UTF-8 encoding
    return '\uFEFF' + headers + '\n' + rows.join('\n');
}

function downloadCSV(schedule, i18nInstance, filename = 'loan_schedule.csv') {
    const csv = generateCSV(schedule, i18nInstance);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = filename;
    link.click();
    URL.revokeObjectURL(link.href);
}

function downloadExcel(schedule, summary, i18nInstance, filename = 'loan_schedule.xlsx') {
    // Create workbook
    const wb = XLSX.utils.book_new();

    // Summary sheet
    const summaryData = [
        [i18nInstance.t('loanDetails'), ''],
        [i18nInstance.t('loanAmount'), summary.loanAmount],
        [i18nInstance.t('loanRatio'), summary.loanRatio + '%'],
        [i18nInstance.t('interestRate'), summary.annualRate + '%'],
        [i18nInstance.t('loanTerm'), summary.termYears + ' ' + i18nInstance.t('years')],
        [i18nInstance.t('gracePeriod'), summary.gracePeriodMonths + ' ' + i18nInstance.t('months')],
        ['', ''],
        [i18nInstance.t('results'), ''],
        [i18nInstance.t('totalPayment'), summary.totalPayment],
        [i18nInstance.t('totalInterest'), summary.totalInterest],
        [i18nInstance.t('totalCostWithFees'), summary.totalCost],
        [i18nInstance.t('apr'), summary.apr.toFixed(2) + '%']
    ];
    const summarySheet = XLSX.utils.aoa_to_sheet(summaryData);
    XLSX.utils.book_append_sheet(wb, summarySheet, i18nInstance.t('results'));

    // Schedule sheet
    const scheduleHeaders = [
        i18nInstance.t('period'),
        i18nInstance.t('payment'),
        i18nInstance.t('principal'),
        i18nInstance.t('interest'),
        i18nInstance.t('cumulativePrincipal'),
        i18nInstance.t('cumulativeInterest'),
        i18nInstance.t('remainingBalance')
    ];

    const scheduleData = [scheduleHeaders];
    schedule.forEach(entry => {
        scheduleData.push([
            entry.period + (entry.isGracePeriod ? i18nInstance.t('graceLabel') : ''),
            entry.payment,
            entry.principal,
            entry.interest,
            entry.cumulativePrincipal,
            entry.cumulativeInterest,
            entry.remainingBalance
        ]);
    });

    const scheduleSheet = XLSX.utils.aoa_to_sheet(scheduleData);
    XLSX.utils.book_append_sheet(wb, scheduleSheet, i18nInstance.t('amortizationSchedule'));

    // Download
    XLSX.writeFile(wb, filename);
}

function downloadPDF(schedule, summary, i18nInstance, filename = 'loan_schedule.pdf') {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();

    // Title
    doc.setFontSize(18);
    doc.text(i18nInstance.t('title'), 14, 20);

    // Summary section
    doc.setFontSize(12);
    let y = 35;

    doc.text(`${i18nInstance.t('loanAmount')}: ${i18nInstance.formatCurrency(summary.loanAmount)}`, 14, y);
    y += 8;
    doc.text(`${i18nInstance.t('loanRatio')}: ${summary.loanRatio}%`, 14, y);
    y += 8;
    doc.text(`${i18nInstance.t('interestRate')}: ${summary.annualRate}%`, 14, y);
    y += 8;
    doc.text(`${i18nInstance.t('loanTerm')}: ${summary.termYears} ${i18nInstance.t('years')}`, 14, y);
    y += 8;
    if (summary.gracePeriodMonths > 0) {
        doc.text(`${i18nInstance.t('gracePeriod')}: ${summary.gracePeriodMonths} ${i18nInstance.t('months')}`, 14, y);
        y += 8;
    }
    y += 4;

    doc.setFontSize(14);
    doc.text(i18nInstance.t('results'), 14, y);
    y += 8;

    doc.setFontSize(12);
    doc.text(`${i18nInstance.t('totalPayment')}: ${i18nInstance.formatCurrency(summary.totalPayment)}`, 14, y);
    y += 8;
    doc.text(`${i18nInstance.t('totalInterest')}: ${i18nInstance.formatCurrency(summary.totalInterest)}`, 14, y);
    y += 8;
    doc.text(`${i18nInstance.t('totalCostWithFees')}: ${i18nInstance.formatCurrency(summary.totalCost)}`, 14, y);
    y += 8;
    doc.text(`${i18nInstance.t('apr')}: ${summary.apr.toFixed(2)}%`, 14, y);
    y += 15;

    // Table
    const tableHeaders = [
        [
            i18nInstance.t('period'),
            i18nInstance.t('payment'),
            i18nInstance.t('principal'),
            i18nInstance.t('interest'),
            i18nInstance.t('remainingBalance')
        ]
    ];

    // Sample data for PDF
    const maxRows = 120;
    const interval = Math.ceil(schedule.length / maxRows);
    const tableData = [];

    for (let i = 0; i < schedule.length; i += interval) {
        const entry = schedule[i];
        tableData.push([
            entry.period + (entry.isGracePeriod ? '*' : ''),
            i18nInstance.formatNumber(entry.payment),
            i18nInstance.formatNumber(entry.principal),
            i18nInstance.formatNumber(entry.interest),
            i18nInstance.formatNumber(entry.remainingBalance)
        ]);
    }

    // Add last entry if not included
    const lastEntry = schedule[schedule.length - 1];
    if (tableData[tableData.length - 1][0] !== lastEntry.period.toString()) {
        tableData.push([
            lastEntry.period + (lastEntry.isGracePeriod ? '*' : ''),
            i18nInstance.formatNumber(lastEntry.payment),
            i18nInstance.formatNumber(lastEntry.principal),
            i18nInstance.formatNumber(lastEntry.interest),
            i18nInstance.formatNumber(lastEntry.remainingBalance)
        ]);
    }

    doc.autoTable({
        head: tableHeaders,
        body: tableData,
        startY: y,
        styles: {
            fontSize: 8,
            cellPadding: 2
        },
        headStyles: {
            fillColor: [67, 97, 238]
        }
    });

    doc.save(filename);
}

// Create global instance
const calculator = new LoanCalculator();
