// Budget Manager Application
// Handles daily spending, automatic transfers, and savings

// Initialize app on page load
window.addEventListener('DOMContentLoaded', () => {
    loadAccountData();
    checkDailyTransfer();
});

// Initialize account with starting balance
function initializeAccount() {
    const mainBalance = parseFloat(document.getElementById('mainBalance').value);
    const dailyLimit = parseFloat(document.getElementById('dailyLimit').value);

    if (!mainBalance || mainBalance <= 0) {
        alert('Please enter a valid main account balance!');
        return;
    }

    if (!dailyLimit || dailyLimit <= 0) {
        alert('Please enter a valid daily spending limit!');
        return;
    }

    // Initialize all accounts
    localStorage.setItem('mainAccount', mainBalance);
    localStorage.setItem('dailyAccount', 0);
    localStorage.setItem('savingsAccount', 0);
    localStorage.setItem('dailyLimit', dailyLimit);
    localStorage.setItem('lastTransferDate', new Date().toDateString());
    localStorage.setItem('initialized', 'true');

    // Initialize transaction history
    localStorage.setItem('transactions', JSON.stringify([]));

    alert('Account initialized successfully!');
    loadAccountData();
}

// Load and display account data
function loadAccountData() {
    const initialized = localStorage.getItem('initialized');

    if (!initialized) {
        document.getElementById('setupSection').classList.remove('hidden');
        document.getElementById('dashboard').classList.add('hidden');
        return;
    }

    document.getElementById('setupSection').classList.add('hidden');
    document.getElementById('dashboard').classList.remove('hidden');

    updateDisplay();
}

// Update all displays
function updateDisplay() {
    const mainAccount = parseFloat(localStorage.getItem('mainAccount') || 0);
    const dailyAccount = parseFloat(localStorage.getItem('dailyAccount') || 0);
    const savingsAccount = parseFloat(localStorage.getItem('savingsAccount') || 0);
    const dailyLimit = parseFloat(localStorage.getItem('dailyLimit') || 150);

    // Update account balances
    document.getElementById('mainAccountDisplay').textContent = '₹' + mainAccount.toFixed(2);
    document.getElementById('dailyAccountDisplay').textContent = '₹' + dailyAccount.toFixed(2);
    document.getElementById('savingsAccountDisplay').textContent = '₹' + savingsAccount.toFixed(2);

    // Update daily budget progress
    const remaining = dailyAccount;
    const percentage = Math.min((remaining / dailyLimit) * 100, 100);
    
    document.getElementById('progressFill').style.width = percentage + '%';
    document.getElementById('remainingAmount').textContent = '₹' + remaining.toFixed(2);
    document.getElementById('dailyLimitDisplay').textContent = '₹' + dailyLimit.toFixed(2);

    // Update transaction history
    updateTransactionList();
}

// Check if daily transfer is needed
function checkDailyTransfer() {
    const lastTransferDate = localStorage.getItem('lastTransferDate');
    const today = new Date().toDateString();

    if (lastTransferDate !== today) {
        // Auto-transfer unused amount to savings and reset for new day
        const dailyAccount = parseFloat(localStorage.getItem('dailyAccount') || 0);
        if (dailyAccount > 0) {
            const savingsAccount = parseFloat(localStorage.getItem('savingsAccount') || 0);
            localStorage.setItem('savingsAccount', savingsAccount + dailyAccount);
            addTransaction('Auto-transfer to Savings', dailyAccount, 'credit', 'savings');
        }
        localStorage.setItem('dailyAccount', 0);
        localStorage.setItem('lastTransferDate', today);
        updateDisplay();
    }
}

// Trigger daily transfer manually
function triggerDailyTransfer() {
    const dailyLimit = parseFloat(localStorage.getItem('dailyLimit') || 150);
    const mainAccount = parseFloat(localStorage.getItem('mainAccount') || 0);
    const dailyAccount = parseFloat(localStorage.getItem('dailyAccount') || 0);

    if (mainAccount < dailyLimit) {
        alert('Insufficient balance in main account!');
        return;
    }

    // Transfer unused amount to savings
    if (dailyAccount > 0) {
        const savingsAccount = parseFloat(localStorage.getItem('savingsAccount') || 0);
        localStorage.setItem('savingsAccount', savingsAccount + dailyAccount);
        addTransaction('Transfer to Savings', dailyAccount, 'credit', 'savings');
    }

    // Transfer daily limit from main to daily account
    localStorage.setItem('mainAccount', mainAccount - dailyLimit);
    localStorage.setItem('dailyAccount', dailyLimit);
    localStorage.setItem('lastTransferDate', new Date().toDateString());

    addTransaction('Daily Transfer from Main', dailyLimit, 'credit', 'daily');
    
    alert(`Transferred ₹${dailyLimit.toFixed(2)} to daily account!`);
    updateDisplay();
}

// Record spending
function recordSpending() {
    const amount = parseFloat(document.getElementById('spendAmount').value);
    const dailyAccount = parseFloat(localStorage.getItem('dailyAccount') || 0);

    if (!amount || amount <= 0) {
        alert('Please enter a valid amount!');
        return;
    }

    if (amount > dailyAccount) {
        alert('Insufficient balance in daily account!');
        return;
    }

    localStorage.setItem('dailyAccount', dailyAccount - amount);
    addTransaction('Spending', amount, 'debit', 'daily');
    
    document.getElementById('spendAmount').value = '';
    updateDisplay();
    alert(`Spent ₹${amount.toFixed(2)} successfully!`);
}

// Add transaction to history
function addTransaction(description, amount, type, account) {
    const transactions = JSON.parse(localStorage.getItem('transactions') || '[]');
    const transaction = {
        id: Date.now(),
        description: description,
        amount: amount,
        type: type,
        account: account,
        date: new Date().toLocaleString()
    };
    
    transactions.unshift(transaction);
    
    // Keep only last 50 transactions
    if (transactions.length > 50) {
        transactions.pop();
    }
    
    localStorage.setItem('transactions', JSON.stringify(transactions));
}

// Update transaction list display
function updateTransactionList() {
    const transactions = JSON.parse(localStorage.getItem('transactions') || '[]');
    const listElement = document.getElementById('transactionList');
    
    if (transactions.length === 0) {
        listElement.innerHTML = '<p class="empty-state">No transactions yet</p>';
        return;
    }
    
    listElement.innerHTML = transactions.slice(0, 10).map(t => `
        <div class="transaction-item">
            <div>
                <strong>${t.description}</strong>
                <div class="date">${t.date}</div>
            </div>
            <div class="amount ${t.type}">
                ${t.type === 'debit' ? '-' : '+'}₹${t.amount.toFixed(2)}
            </div>
        </div>
    `).join('');
}

// Reset all data
function resetApp() {
    if (confirm('Are you sure you want to reset all data? This cannot be undone!')) {
        localStorage.clear();
        location.reload();
    }
}
