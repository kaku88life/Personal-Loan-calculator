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

    setParams(amount, ratio, rate, years, gracePeriod, method, productAmount) {
        this.loanAmount = amount;
        this.loanRatio = ratio;
        this.annualRate = rate / 100;
        this.termYears = years;
        this.gracePeriodMonths = gracePeriod || 0;
        this.paymentMethod = method;
        // If productAmount is provided, use it. Otherwise derive it.
        if (productAmount) {
            this.productAmount = productAmount;
        } else {
            this.productAmount = ratio > 0 ? amount / (ratio / 100) : amount;
        }
    }

    setAdditionalCosts(costs) {
        this.additionalCosts = costs;
    }

    // Get total ALL costs (for display mostly)
    getTotalAdditionalCosts() {
        return this.additionalCosts.reduce((sum, cost) => sum + cost.amount, 0);
    }

    getActualLoanAmount() {
        // loanAmount is already the calculated loan amount (product amount × ratio)
        // so we just return it directly without multiplying by ratio again
        return this.loanAmount;
    }

    calculate() {
        const principal = this.getActualLoanAmount();
        const monthlyRate = this.annualRate / 12;
        const totalMonths = this.termYears * 12;
        const graceMonths = Math.min(this.gracePeriodMonths, totalMonths - 1);

        // 1. Main Loan Calculation
        let mainResult;
        if (this.paymentMethod === 'equalPayment') {
            mainResult = this.calculateEqualPayment(principal, monthlyRate, totalMonths, graceMonths);
        } else {
            mainResult = this.calculateEqualPrincipal(principal, monthlyRate, totalMonths, graceMonths);
        }

        // Arrays to hold schedules
        const allSchedules = [mainResult.schedule];
        const relatedSchedules = [mainResult.schedule];

        // Track upfront costs
        let relatedUpfrontCosts = 0;
        let unrelatedUpfrontCosts = 0;

        // 2. Process Additional Costs
        this.additionalCosts.forEach(cost => {
            let financedAmount = 0;
            let upfrontAmount = 0;

            if (cost.mode === 'financed') {
                const ratio = (typeof cost.loanRatio === 'number') ? cost.loanRatio : 100;
                financedAmount = cost.amount * (ratio / 100);
                upfrontAmount = cost.amount - financedAmount;
            } else {
                upfrontAmount = cost.amount;
            }

            // Categorize upfront portion
            if (cost.type === 'unrelated') {
                unrelatedUpfrontCosts += upfrontAmount;
            } else {
                relatedUpfrontCosts += upfrontAmount;
            }

            // Calculate financed portion schedule
            if (financedAmount > 0) {
                // Rate
                const costRateVal = (typeof cost.rate === 'number') ? cost.rate : (this.annualRate * 100);
                const costMonthlyRate = (costRateVal / 100) / 12;

                // Term
                const costTermVal = (typeof cost.term === 'number') ? cost.term : this.termYears;
                const costTotalMonths = Math.floor(costTermVal * 12);

                // Grace Period (Input is in Years)
                const costGraceYears = (typeof cost.gracePeriod === 'number') ? cost.gracePeriod : 0;
                const costGraceMonths = Math.min(Math.floor(costGraceYears * 12), costTotalMonths - 1);

                // Calculate Schedule (Standard Equal Payment for costs)
                const costResult = this.calculateEqualPayment(financedAmount, costMonthlyRate, costTotalMonths, costGraceMonths);

                // Add to schedules
                allSchedules.push(costResult.schedule);
                if (cost.type !== 'unrelated') {
                    relatedSchedules.push(costResult.schedule);
                }
            }
        });

        // 3. Merge Schedules
        // schedule: Contains EVERYTHING (for Amortization Table, Total Payment, Charts)
        this.schedule = this.mergeSchedules(allSchedules, mainResult.schedule);

        // aprSchedule: Contains only RELATED items (for APR calculation)
        const aprSchedule = this.mergeSchedules(relatedSchedules, mainResult.schedule);

        // 4. Calculate Final Totals
        const totalPayment = this.schedule.reduce((sum, item) => sum + item.payment, 0);
        const totalInterest = this.schedule.reduce((sum, item) => sum + item.interest, 0);

        // 5. Calculate APR
        // Use relatedUpfrontCosts and aprSchedule
        const apr = this.calculateIRR(principal, relatedUpfrontCosts, aprSchedule);

        // Calculate first/last payments for display
        const monthlyPaymentFirst = this.schedule.length > 0 ? this.schedule[0].payment : 0;
        const monthlyPaymentLast = this.schedule.length > 0 ? this.schedule[this.schedule.length - 1].payment : 0;

        // Grace payment check (from main loan perspective)
        let gracePayment = null;
        if (graceMonths > 0 && this.schedule.length >= graceMonths) {
            gracePayment = this.schedule[0].payment;
        }

        // Total Cost (Total Pmt + All Upfront Costs)
        // Note: Total Payment includes repayment of financed amounts + interest
        const totalUpfrontAll = relatedUpfrontCosts + unrelatedUpfrontCosts;
        const totalCost = totalPayment + relatedUpfrontCosts; // Stick to loan cost definition

        // Calculate Total Down Payment
        const housePrice = this.loanRatio > 0 ? this.loanAmount / (this.loanRatio / 100) : 0;
        const baseDownPayment = Math.max(0, housePrice - this.loanAmount);
        // Corrected Formula: Base Down Payment + All Upfront Costs (Related + Unrelated)
        const totalDownPayment = baseDownPayment + unrelatedUpfrontCosts + relatedUpfrontCosts;

        // Pass specific breakdown data back
        this.lastBreakdown = {
            baseDownPayment: baseDownPayment,
            unrelatedUpfrontCosts: unrelatedUpfrontCosts,
            relatedUpfrontCosts: relatedUpfrontCosts
        };

        return {
            monthlyPayment: monthlyPaymentFirst === monthlyPaymentLast ? monthlyPaymentFirst : null,
            monthlyPaymentFirst: monthlyPaymentFirst,
            monthlyPaymentLast: monthlyPaymentLast,
            gracePayment: gracePayment,
            totalPayment: totalPayment,
            totalInterest: totalInterest,
            totalCost: totalCost,
            additionalCosts: this.getTotalAdditionalCosts(),
            principal: principal,
            graceMonths: graceMonths,
            apr: apr,
            schedule: this.schedule,
            totalDownPayment: Math.round(totalDownPayment),
            baseDownPayment: Math.round(baseDownPayment),
            unrelatedCostsList: this.additionalCosts.filter(c => c.type === 'unrelated' && c.mode !== 'financed')
        };
    }

    // Merge multiple schedules into one
    mergeSchedules(schedules, mainSchedule) {
        let maxLen = 0;
        schedules.forEach(s => maxLen = Math.max(maxLen, s.length));

        const merged = [];
        let cumulativePrincipal = 0;
        let cumulativeInterest = 0;

        for (let i = 0; i < maxLen; i++) {
            const period = i + 1;
            let payment = 0;
            let principal = 0;
            let interest = 0;
            let remainingBalance = 0;
            let isGrace = false;

            // Determine if this is a grace period based on Main Schedule
            if (i < mainSchedule.length) {
                if (mainSchedule[i].isGracePeriod) isGrace = true;
            }

            schedules.forEach(s => {
                if (i < s.length) {
                    const item = s[i];
                    payment += item.payment;
                    principal += item.principal;
                    interest += item.interest;
                    remainingBalance += item.remainingBalance;
                }
            });

            cumulativePrincipal += principal;
            cumulativeInterest += interest;

            merged.push({
                period,
                payment: Math.round(payment),
                principal: Math.round(principal),
                interest: Math.round(interest),
                cumulativePrincipal: Math.round(cumulativePrincipal),
                cumulativeInterest: Math.round(cumulativeInterest),
                remainingBalance: Math.round(remainingBalance),
                isGracePeriod: isGrace
            });
        }
        return merged;
    }

    // Equal Payment Calculation (Returns schedule)
    calculateEqualPayment(principal, monthlyRate, totalMonths, graceMonths) {
        const schedule = [];
        const repaymentMonths = totalMonths - graceMonths;
        let remainingBalance = principal;
        let cumulativePrincipal = 0;
        let cumulativeInterest = 0;

        let monthlyPayment;
        if (monthlyRate === 0) {
            monthlyPayment = principal / repaymentMonths;
        } else {
            monthlyPayment = principal *
                (monthlyRate * Math.pow(1 + monthlyRate, repaymentMonths)) /
                (Math.pow(1 + monthlyRate, repaymentMonths) - 1);
        }

        // Grace period
        for (let month = 1; month <= graceMonths; month++) {
            const interestPayment = remainingBalance * monthlyRate;

            cumulativeInterest += interestPayment;

            schedule.push({
                period: month,
                payment: Math.round(interestPayment),
                principal: 0,
                interest: Math.round(interestPayment),
                cumulativePrincipal: Math.round(cumulativePrincipal),
                cumulativeInterest: Math.round(cumulativeInterest),
                remainingBalance: Math.round(remainingBalance),
                isGracePeriod: true
            });
        }

        // Regular period
        for (let month = graceMonths + 1; month <= totalMonths; month++) {
            const interestPayment = remainingBalance * monthlyRate;
            let principalPayment = monthlyPayment - interestPayment;

            // Adjust last month
            if (month === totalMonths) {
                principalPayment = remainingBalance;
                // Recalculate payment to match exact balance
                // monthlyPayment = principalPayment + interestPayment; 
            }

            remainingBalance -= principalPayment;
            cumulativePrincipal += principalPayment;
            cumulativeInterest += interestPayment;

            if (remainingBalance < 0) remainingBalance = 0;

            schedule.push({
                period: month,
                payment: Math.round(principalPayment + interestPayment), // Use calculated sum
                principal: Math.round(principalPayment),
                interest: Math.round(interestPayment),
                cumulativePrincipal: Math.round(cumulativePrincipal),
                cumulativeInterest: Math.round(cumulativeInterest),
                remainingBalance: Math.round(remainingBalance),
                isGracePeriod: false
            });
        }

        return { schedule, monthlyPayment }; // Only need schedule really
    }

    // Equal Principal Calculation (Returns schedule)
    calculateEqualPrincipal(principal, monthlyRate, totalMonths, graceMonths) {
        const schedule = [];
        const repaymentMonths = totalMonths - graceMonths;
        const monthlyPrincipal = principal / repaymentMonths;
        let remainingBalance = principal;
        let cumulativePrincipal = 0;
        let cumulativeInterest = 0;

        // Grace period
        for (let month = 1; month <= graceMonths; month++) {
            const interestPayment = remainingBalance * monthlyRate;
            cumulativeInterest += interestPayment;

            schedule.push({
                period: month,
                payment: Math.round(interestPayment),
                principal: 0,
                interest: Math.round(interestPayment),
                cumulativePrincipal: Math.round(cumulativePrincipal),
                cumulativeInterest: Math.round(cumulativeInterest),
                remainingBalance: Math.round(remainingBalance),
                isGracePeriod: true
            });
        }

        // Regular period
        for (let month = graceMonths + 1; month <= totalMonths; month++) {
            const interestPayment = remainingBalance * monthlyRate;
            let currentPrincipal = monthlyPrincipal;

            if (month === totalMonths) {
                currentPrincipal = remainingBalance;
            }

            const payment = currentPrincipal + interestPayment;
            remainingBalance -= currentPrincipal;
            cumulativePrincipal += currentPrincipal;
            cumulativeInterest += interestPayment;

            if (remainingBalance < 0) remainingBalance = 0;

            schedule.push({
                period: month,
                payment: Math.round(payment),
                principal: Math.round(currentPrincipal),
                interest: Math.round(interestPayment),
                cumulativePrincipal: Math.round(cumulativePrincipal),
                cumulativeInterest: Math.round(cumulativeInterest),
                remainingBalance: Math.round(remainingBalance),
                isGracePeriod: false
            });
        }

        return { schedule };
    }

    // Internal Rate of Return calculation for APR
    calculateIRR(principal, upfrontCosts, schedule) {
        // Net amount received
        const netReceived = principal - upfrontCosts;

        if (netReceived <= 0 || schedule.length === 0) {
            return this.annualRate * 100;
        }

        // Binary search for the monthly rate that makes NPV = 0
        let low = 0;
        let high = 1; // 100% monthly rate as upper bound
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

        // Convert monthly rate to annual rate
        const annualRate = Math.pow(1 + mid, 12) - 1;
        return annualRate * 100;
    }

    getSchedule() {
        return this.schedule;
    }

    // Get data for charts - sample every N periods to reduce data points
    getChartData(maxPoints = 60) {
        const schedule = this.schedule;
        // avoid division by zero
        if (!schedule || schedule.length === 0) return { labels: [], payments: [], cumulativePrincipal: [], cumulativeInterest: [] };

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
        // We need to run calculate if not already, or just grab last results?
        // Better to re-run or store results.
        // But calculate() stores to this.schedule.
        // Let's assume calculate() was called before getSummary, or call it now.
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

async function downloadPDF(schedule, summary, i18nInstance, fontName = 'NotoSansTC', filename = 'loan_schedule.pdf') {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();
    let fontLoaded = false;

    // Try to load Noto Sans TC
    if (fontName === 'NotoSansTC') {
        try {
            // Updated path relative to extension root
            const fontUrl = chrome.runtime.getURL('fonts/NotoSansTC-Regular.ttf');
            const response = await fetch(fontUrl);

            if (response.ok) {
                const blob = await response.blob();
                const reader = new FileReader();
                reader.readAsDataURL(blob);
                await new Promise(resolve => reader.onloadend = resolve);
                // Get base64 content
                const base64data = reader.result.split(',')[1];

                // Register font
                doc.addFileToVFS('NotoSansTC-Regular.ttf', base64data);
                doc.addFont('NotoSansTC-Regular.ttf', 'NotoSansTC', 'normal');
                doc.setFont('NotoSansTC');
                fontLoaded = true;
                console.log('Noto Sans TC font loaded successfully');
            } else {
                console.warn('Noto Sans TC font file not found at:', fontUrl);
            }
        } catch (error) {
            console.error('Error loading font:', error);
        }
    }

    if (!fontLoaded) {
        doc.setFont('helvetica');
        // Warn user if we know it's missing (optional logic)
    }

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
    doc.text(`${i18nInstance.t('interestRate')}: ${summary.annualRate.toFixed(2)}%`, 14, y);
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

    // Use custom font for table if loaded
    const tableStyles = {
        fontSize: 8,
        cellPadding: 2,
        font: fontLoaded ? 'NotoSansTC' : 'helvetica',
        fontStyle: 'normal'
    };

    doc.autoTable({
        head: tableHeaders,
        body: tableData,
        startY: y,
        styles: tableStyles,
        headStyles: {
            fillColor: [67, 97, 238],
            font: fontLoaded ? 'NotoSansTC' : 'helvetica',
            fontStyle: 'normal'
        }
    });

    // Save
    try {
        doc.save(filename);
    } catch (error) {
        // Fallback
        doc.save('loan_schedule.pdf');
    }
}

// Create global instance
const calculator = new LoanCalculator();
window.calculator = calculator;
console.log('LoanCalculator initialized and attached to window');
