// ==========================================
// 1. DATA
// ==========================================

// Lijst met bankrekeningen
let accounts = [
  { name: "Betaalrekening", amount: 221500.00 },
  { name: "Spaarrekening", amount: 523200.50 }
];


// Lijst met transacties
const transactions = [];

// Data voor beleggingen
const investmentData = {
  aandelen: [
    { id: 'tech', name: 'TechCorp', price: 120.00, owned: 2 },
    { id: 'food', name: 'FoodInc', price: 45.50, owned: 0 },
    { id: 'auto', name: 'CarSystems', price: 210.20, owned: 5 }
  ],
  crypto: [
    { id: 'btc', name: 'Bitcoin', price: 90000.00, owned: 0.005 },
    { id: 'eth', name: 'Ethereum', price: 2500.00, owned: 0 }
  ]
};

// Crypto live
const cryptoData = [
  { id: 'btc', name: 'Bitcoin', price: 90000.00, owned: 0 },
  { id: 'eth', name: 'Ethereum', price: 4800.00, owned: 0 },
  { id: 'ltc', name: 'Litecoin', price: 250.00, owned: 0 }
];

let currentProduct = null; // Huidig geselecteerd beleggingsproduct

// ==========================================
// 2. DOM ELEMENTEN SELECTEREN
// ==========================================

// Bank
const accountListContainer = document.getElementById("accountListContainer");
const transactionList = document.getElementById("transactionList");
const fromAccountSelect = document.getElementById("fromAccount");
const toAccountSelect = document.getElementById("toAccount");

// Beleggingen
const categorySelect = document.getElementById("categorySelect");
const productSelect = document.getElementById("productSelect");
const cashBalanceEl = document.getElementById("cashBalance");
const investMessageEl = document.getElementById("investMessage");

// Crypto
const cryptoListEl = document.getElementById("cryptoList");
const cryptoSelectEl = document.getElementById("cryptoSelect");
const cryptoFeedback = document.getElementById("cryptoFeedback");
const cryptoCashDisplay = document.getElementById("cryptoCashDisplay");


// ==========================================
// 3. ALGEMENE FUNCTIES
// ==========================================

// Toon de rekeningen op het scherm
function renderAccounts() {
  if (!accountListContainer) return;

  // Reset de HTML
  accountListContainer.innerHTML = "";
  if (fromAccountSelect) fromAccountSelect.innerHTML = "";
  if (toAccountSelect) toAccountSelect.innerHTML = "";

  accounts.forEach((acc, index) => {
    const formattedAmount = acc.amount.toFixed(2);

    // Voeg rij toe aan de lijst
    accountListContainer.innerHTML += `
      <div class="account-row">
        <span class="acc-name">${acc.name}</span>
        <span class="acc-balance">€ ${formattedAmount}</span>
      </div>
    `;

    // Voeg opties toe aan select-menu's
    if (fromAccountSelect && toAccountSelect) {
      const option = `<option value="${index}">${acc.name} (€ ${formattedAmount})</option>`;
      fromAccountSelect.innerHTML += option;
      toAccountSelect.innerHTML += option;
    }
  });

  // Update ook de saldo's in andere secties
  updateInvestUI();
  updateCryptoBalanceView();
}

// Toon de transactiegeschiedenis
function renderTransactions() {
  if (!transactionList) return;

  const typeFilter = document.getElementById("filterType").value;
  const dateFilter = document.getElementById("filterDate").value;

  // Filteren
  let filtered = transactions.filter(t => 
    typeFilter === "all" || t.type === typeFilter
  );

  // Sorteren
  filtered.sort((a, b) => {
    const dateA = new Date(a.datum);
    const dateB = new Date(b.datum);
    return dateFilter === "newest" ? dateB - dateA : dateA - dateB;
  });

  // Renderen
  transactionList.innerHTML = "";
  filtered.forEach(t => {
    transactionList.innerHTML += `
      <div class="transaction-row">
        <span class="transaction-date">${t.datum}</span>
        <span class="transaction-type">${t.type}</span>
        <span class="transaction-amount ${t.type}">
          € ${Math.abs(t.bedrag).toFixed(2)}
        </span>
      </div>
    `;
  });
}

// Nieuwe rekening toevoegen
function handleAddAccount(e) {
  e.preventDefault();
  const name = document.getElementById("newAccName").value;
  const balance = parseFloat(document.getElementById("newAccBalance").value);

  if (name && !isNaN(balance)) {
    accounts.push({ name, amount: balance });
    document.getElementById("addAccountForm").reset();
    document.getElementById("addAccountForm").style.display = "none";
    document.getElementById("toggleFormBtn").style.display = "block";
    renderAccounts();
  }
}

// Geld overboeken
function handleTransfer(e) {
  e.preventDefault();
  
  const fromIdx = fromAccountSelect.value;
  const toIdx = toAccountSelect.value;
  const amount = parseFloat(document.getElementById("transferAmount").value);
  const errorEl = document.getElementById("transferError");
  const successEl = document.getElementById("transferSuccess");

  errorEl.style.display = "none";
  successEl.style.display = "none";

  // Validatie
  if (fromIdx === toIdx) {
    showError(errorEl, "Kies twee verschillende rekeningen.");
    return;
  }
  if (accounts[fromIdx].amount < amount) {
    showError(errorEl, "Onvoldoende saldo.");
    return;
  }

  // Uitvoeren
  accounts[fromIdx].amount -= amount;
  accounts[toIdx].amount += amount;

  // Transactie opslaan
  addTransaction(amount); // Helper functie

  renderAccounts();
  renderTransactions();
  successEl.style.display = "block";
  e.target.reset();
}

// Helper: Toon error bericht
function showError(element, message) {
  element.textContent = message;
  element.style.display = "block";
}

// Helper: Voeg transactie toe aan historie
function addTransaction(amount) {
  const today = new Date().toISOString().split("T")[0];
  transactions.push(
    { type: "uitgaand", datum: today, bedrag: -amount },
    { type: "inkomend", datum: today, bedrag: amount }
  );
}


// ==========================================
// 4. BELEGGINGEN
// ==========================================

// Update de UI voor beleggingen
function updateInvestUI() {
  if (cashBalanceEl) {
    cashBalanceEl.textContent = accounts[0].amount.toFixed(2);
  }

  const priceEl = document.getElementById("currentPrice");
  const ownedEl = document.getElementById("ownedAmount");

  if (currentProduct) {
    priceEl.textContent = currentProduct.price.toFixed(2);
    // Voor crypto
    const isCrypto = categorySelect.value === 'crypto';
    ownedEl.textContent = isCrypto ? currentProduct.owned.toFixed(4) : currentProduct.owned;
  } else {
    priceEl.textContent = "0.00";
    ownedEl.textContent = "0";
  }
}

// Categorie selectie
if (categorySelect) {
  categorySelect.addEventListener("change", (e) => {
    const category = e.target.value;
    productSelect.innerHTML = "";
    investMessageEl.textContent = "";
    currentProduct = null;

    if (category && investmentData[category]) {
      productSelect.disabled = false;
      investmentData[category].forEach((prod, index) => {
        const opt = document.createElement("option");
        opt.value = index;
        opt.textContent = prod.name;
        productSelect.appendChild(opt);
      });
      // Selecteer eerste item
      currentProduct = investmentData[category][0];
      productSelect.value = 0;
    } else {
      productSelect.disabled = true;
    }
    updateInvestUI();
  });
}

// Product selectie
if (productSelect) {
  productSelect.addEventListener("change", (e) => {
    const cat = categorySelect.value;
    const idx = e.target.value;
    if (investmentData[cat]) {
      currentProduct = investmentData[cat][idx];
      updateInvestUI();
    }
  });
}

// Kopen & Verkopen Logic
function handleTrade(type) {
  if (!currentProduct) return;

  const inputEl = document.getElementById("investValue");
  const amountEuro = parseFloat(inputEl.value);
  const mainAccount = accounts[0];

  investMessageEl.className = "";

  if (isNaN(amountEuro) || amountEuro <= 0) {
    investMessageEl.textContent = "Voer een geldig bedrag in.";
    investMessageEl.classList.add("message-error");
    return;
  }

  if (type === 'buy') {
    // Kopen
    if (mainAccount.amount < amountEuro) {
      investMessageEl.textContent = "Onvoldoende saldo.";
      investMessageEl.classList.add("message-error");
      return;
    }
    const units = amountEuro / currentProduct.price;
    currentProduct.owned += units;
    mainAccount.amount -= amountEuro;
    investMessageEl.textContent = `Gekocht: €${amountEuro.toFixed(2)} aan ${currentProduct.name}`;
    investMessageEl.classList.add("message-success");

  } else {
    // Verkopen
    const unitsToSell = amountEuro / currentProduct.price;
    if (unitsToSell > currentProduct.owned) {
      investMessageEl.textContent = "Niet genoeg eenheden in bezit.";
      investMessageEl.classList.add("message-error");
      return;
    }
    currentProduct.owned -= unitsToSell;
    mainAccount.amount += amountEuro;
    investMessageEl.textContent = `Verkocht: €${amountEuro.toFixed(2)} aan ${currentProduct.name}`;
    investMessageEl.classList.add("message-success");
  }

  // Update alles
  inputEl.value = "";
  renderAccounts();
}

// Knoppen koppelen
const buyBtn = document.getElementById("buyBtn");
const sellBtn = document.getElementById("sellBtn");
if (buyBtn) buyBtn.onclick = () => handleTrade('buy');
if (sellBtn) sellBtn.onclick = () => handleTrade('sell');


// ==========================================
// CRYPTO OVERZICHT
// ==========================================

// Crypto saldo update
function updateCryptoBalanceView() {
  if (cryptoCashDisplay && accounts[0]) {
    cryptoCashDisplay.textContent = `€ ${accounts[0].amount.toFixed(2)}`;
  }
}

function renderCryptoList() {
  if (!cryptoListEl) return;
  
  cryptoListEl.innerHTML = "";
  
  cryptoData.forEach(coin => {
    const valueOwned = (coin.owned * coin.price).toFixed(2);
    const rowId = `crypto-row-${coin.id}`;
    
    const div = document.createElement("div");
    div.className = "crypto-item";
    div.id = rowId;
    div.innerHTML = `
      ${coin.name}: €${valueOwned} 
      <span style="float:right; opacity:0.7">${coin.price.toFixed(0)}</span>
    `;
    cryptoListEl.appendChild(div);
  });
}

// Select opties vullen voor Crypto sectie
function initCryptoSelect() {
  if (!cryptoSelectEl) return;
  cryptoSelectEl.innerHTML = "";
  cryptoData.forEach((coin, index) => {
    const opt = document.createElement("option");
    opt.value = index;
    opt.textContent = coin.name;
    cryptoSelectEl.appendChild(opt);
  });
}

// Live markt
setInterval(() => {
  cryptoData.forEach(coin => {
    const oldPrice = coin.price;
    // Verandering
    const change = 1 + (Math.random() * 0.04 - 0.02);
    coin.price = coin.price * change;

    // Update
    const row = document.getElementById(`crypto-row-${coin.id}`);
    if (row) {
      const valueOwned = (coin.owned * coin.price).toFixed(2);
      row.innerHTML = `
        ${coin.name}: €${valueOwned} 
        <span style="float:right; opacity:0.7">${coin.price.toFixed(0)}</span>
      `;

      // Kleur effect
      const flashClass = coin.price > oldPrice ? "flash-green" : "flash-red";
      row.classList.add(flashClass);
      setTimeout(() => row.classList.remove(flashClass), 500);
    }
  });
}, 3000);

// Crypto Kopen/Verkopen
function handleCryptoTrade(type) {
  const amount = parseFloat(document.getElementById("cryptoAmount").value);
  const index = cryptoSelectEl.value;
  const coin = cryptoData[index];
  const mainAccount = accounts[0];

  // Feedback reset
  cryptoFeedback.textContent = "";
  cryptoFeedback.className = "crypto-msg";

  if (isNaN(amount) || amount <= 0) {
    cryptoFeedback.textContent = "Voer een geldig bedrag in.";
    cryptoFeedback.style.color = "red";
    return;
  }

  if (type === 'buy') {
    if (mainAccount.amount < amount) {
      cryptoFeedback.textContent = "Onvoldoende saldo.";
      cryptoFeedback.style.color = "red";
      return;
    }
    const units = amount / coin.price;
    coin.owned += units;
    mainAccount.amount -= amount;
    cryptoFeedback.textContent = `Gekocht: €${amount.toFixed(2)} aan ${coin.name}.`;
    cryptoFeedback.style.color = "#2e7d32";
  } else {
    // Sell
    const unitsToSell = amount / coin.price;
    if (coin.owned < unitsToSell) {
      cryptoFeedback.textContent = `Niet genoeg ${coin.name} in bezit.`;
      cryptoFeedback.style.color = "red";
      return;
    }
    coin.owned -= unitsToSell;
    mainAccount.amount += amount;
    cryptoFeedback.textContent = `Verkocht: €${amount.toFixed(2)} aan ${coin.name}.`;
    cryptoFeedback.style.color = "#2e7d32";
  }

  renderAccounts();
  renderCryptoList();
}

// Knoppen koppelen
const btnBuyCrypto = document.getElementById("btnBuyCrypto");
const btnSellCrypto = document.getElementById("btnSellCrypto");
if (btnBuyCrypto) btnBuyCrypto.onclick = () => handleCryptoTrade('buy');
if (btnSellCrypto) btnSellCrypto.onclick = () => handleCryptoTrade('sell');

const toggleFormBtn = document.getElementById("toggleFormBtn");
if (toggleFormBtn) {
  toggleFormBtn.onclick = () => {
    document.getElementById("addAccountForm").style.display = "block";
    toggleFormBtn.style.display = "none";
  };
}

const addAccountForm = document.getElementById("addAccountForm");
if (addAccountForm) addAccountForm.onsubmit = handleAddAccount;

const transferForm = document.getElementById("transferForm");
if (transferForm) transferForm.onsubmit = handleTransfer;

const filterType = document.getElementById("filterType");
const filterDate = document.getElementById("filterDate");
if (filterType) filterType.onchange = renderTransactions;
if (filterDate) filterDate.onchange = renderTransactions;

// Start functies
initCryptoSelect();
renderCryptoList();
renderAccounts();
renderTransactions();