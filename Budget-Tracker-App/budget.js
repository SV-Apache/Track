
function createTracker(containerId, storageKey) {
  const container = document.getElementById(containerId);
  if (!container) {
    console.error(`Container mit ID "${containerId}" nicht gefunden.`);
    return;
  }

  let transactions = JSON.parse(localStorage.getItem(storageKey)) || [];

  container.innerHTML = `
    <div class="card glassmorphism">
      <input type="text" placeholder="Kategorie" class="input-category" />
      <input type="number" placeholder="Betrag (€)" class="input-amount" />
      <button class="btn-add">Hinzufügen</button>
    </div>
    <div class="card glassmorphism">
      <h2 class="balance">Saldo: € 0.00</h2>
      <ul class="list"></ul>
    </div>
    <div class="card glassmorphism">
      <canvas class="chart"></canvas>
    </div>
  `;

  const inputCategory = container.querySelector(".input-category");
  const inputAmount = container.querySelector(".input-amount");
  const btnAdd = container.querySelector(".btn-add");
  const balanceEl = container.querySelector(".balance");
  const listEl = container.querySelector(".list");
  const chartCanvas = container.querySelector(".chart");
  let pieChart;

  function save() {
    localStorage.setItem(storageKey, JSON.stringify(transactions));
  }

  function remove(index) {
    transactions.splice(index, 1);
    save();
    update();
  }

  function update() {
    listEl.innerHTML = "";
    let total = 0;
    const categories = {};

    transactions.forEach((t, index) => {
      total += t.amount;
      categories[t.category] = (categories[t.category] || 0) + t.amount;

      const li = document.createElement("li");
      const text = document.createTextNode(`${t.category}: € ${t.amount.toFixed(2)}`);
      const removeBtn = document.createElement("button");
      removeBtn.className = "remove";
      removeBtn.textContent = "✖";
      removeBtn.onclick = () => remove(index);

      li.appendChild(text);
      li.appendChild(removeBtn);
      listEl.appendChild(li);
    });

    balanceEl.textContent = `Saldo: € ${total.toFixed(2)}`;

    if (pieChart) pieChart.destroy();
    const ctx = chartCanvas.getContext("2d");
    if (ctx) {
      pieChart = new Chart(ctx, {
        type: "pie",
        data: {
          labels: Object.keys(categories),
          datasets: [{
            data: Object.values(categories),
            backgroundColor: ["#38bdf8", "#f472b6", "#34d399", "#facc15", "#f87171"],
          }]
        },
        options: {
          plugins: { legend: { labels: { color: "white" } } },
          responsive: true
        }
      });
    }
  }

  function handleAdd() {
    const cat = inputCategory.value.trim();
    const amt = parseFloat(inputAmount.value);

    if (!cat || isNaN(amt)) return;
    if (cat.length > 30) {
      alert("Kategorie ist zu lang (max. 30 Zeichen)");
      return;
    }

    transactions.push({ category: cat, amount: amt });
    save();
    inputCategory.value = "";
    inputAmount.value = "";
    inputCategory.focus();
    update();
  }

  btnAdd.addEventListener("click", handleAdd);

  [inputCategory, inputAmount].forEach(input => {
    input.addEventListener("keydown", e => {
      if (e.key === "Enter") {
        e.preventDefault();
        handleAdd();
      }
    });
  });

  window.__remove = (trackerId, index) => {
    if (trackerId === containerId) {
      remove(index);
    }
  };

  update();
}

// Service Worker Registrieren
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/service-worker.js')
      .then(reg => console.log('Service Worker registriert:', reg))
      .catch(err => console.error('Fehler beim Registrieren des Service Workers:', err));
  });
}

// Zwei Tracker initialisieren
createTracker("tracker-privat", "budget-privat");
createTracker("tracker-business", "budget-business");



