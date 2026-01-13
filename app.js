let currentUser = null;

function login() {
  const username = document.getElementById("username").value.trim();
  const role = document.getElementById("role").value;
  if (!username) return alert("Введите имя");

  currentUser = { username, role };
  localStorage.setItem("user", JSON.stringify(currentUser));

  // Скрываем форму логина
  document.getElementById("loginPanel").style.display = "none";

  // Показываем основной интерфейс
  document.getElementById("mainInterface").style.display = "flex"; // или block

  // Обновляем приветствие
  document.getElementById(
    "welcome"
  ).innerText = `Привет, ${currentUser.username}! (${currentUser.role})`;

  initMainInterface();
}

function initMainInterface() {
  const welcome = document.getElementById("welcome");
  welcome.innerText = `Привет, ${currentUser.username}! (${currentUser.role})`;

  loadLots();
}

// Загрузка страницы
document.addEventListener("DOMContentLoaded", () => {
  const welcome = document.getElementById("welcome");
  const sellerPanel = document.getElementById("sellerPanel");

  const userData = JSON.parse(localStorage.getItem("user"));
  if (!userData) {
    window.location.href = "index.html";
    return;
  }
  currentUser = userData;
  welcome.innerText = `Привет, ${currentUser.username}! (${currentUser.role})`;

  sellerPanel.classList.remove("hidden");

  loadLots();
});

// Создание лота
function createLot() {
  const title = document.getElementById("title").value.trim();
  const price = parseFloat(document.getElementById("price").value);
  const amount = parseFloat(document.getElementById("amount").value);
  const unit = document.getElementById("unit").value.trim() || "кг";

  if (!title) return alert("Введите название отхода");
  if (isNaN(price) || price <= 0) return alert("Введите корректную цену");
  if (isNaN(amount) || amount <= 0) return alert("Введите количество");

  // Тип лота: продавец → "sell", покупатель → "buy"
  const type = currentUser.role === "buyer" ? "buy" : "sell";

  let lots = JSON.parse(localStorage.getItem("lots")) || [];
  lots.push({
    title,
    price,
    amount,
    seller: currentUser.username,
    buyer: null,
    type,
    unit,
  });
  localStorage.setItem("lots", JSON.stringify(lots));
  loadLots();

  document.getElementById("title").value = "";
  document.getElementById("price").value = "";
  document.getElementById("amount").value = "";
}

// Загрузка лотов
function loadLots() {
  const lotsDiv = document.getElementById("lots");
  lotsDiv.innerHTML = "";

  let lots = JSON.parse(localStorage.getItem("lots")) || [];

  lots.forEach((lot, index) => {
    const div = document.createElement("div");
    div.className = "lot";

    // Цвет по типу
    if (lot.type === "sell") div.classList.add("seller");
    else if (lot.type === "buy") div.classList.add("buyer");

    let buttons = "";
    const statusText = lot.type === "sell" ? "Продаю" : "Скупаем";

    // Кнопки покупки/продажи
    if (!lot.buyer) {
      // Покупатель может купить "sell"
      if (currentUser.role === "buyer" && lot.type === "sell") {
        if (lot.amount >= 50)
          buttons += `<button onclick="buyLot(${index})">Купить</button>`;
        else
          buttons += `<span style="color:red;font-size:12px;">Мин. 50 ${lot.unit}</span>`;
      }
      // Продавец может продать "buy"
      if (currentUser.role === "seller" && lot.type === "buy") {
        if (lot.amount >= 50)
          buttons += `<button onclick="sellLot(${index})" style="background:#2980b9;">Продать</button>`;
        else
          buttons += `<span style="color:red;font-size:12px;">Мин. 50 ${lot.unit}</span>`;
      }
    }

    // Кнопка удаления для владельца
    if (lot.seller === currentUser.username) {
      buttons += ` <button onclick="deleteLot(${index})" style="background:#e74c3c;">Удалить</button>`;
    }

    div.innerHTML = `
            <b>${lot.title}</b><br>
            <i>${statusText}</i><br>
            Цена: ${lot.price} тг / ${lot.unit}<br>
            Количество: ${lot.amount} ${lot.unit}<br>
            Создал: ${lot.seller}<br>
            ${lot.buyer ? "Сделка с: " + lot.buyer : buttons}
        `;
    lotsDiv.appendChild(div);
  });
}

// Купить лот
function buyLot(index) {
  let lots = JSON.parse(localStorage.getItem("lots"));
  if (lots[index].amount < 50)
    return alert("Можно покупать только от 50 кг/литров");
  lots[index].buyer = currentUser.username;
  localStorage.setItem("lots", JSON.stringify(lots));
  loadLots();
}

// Продать лот
function sellLot(index) {
  let lots = JSON.parse(localStorage.getItem("lots"));
  if (lots[index].amount < 50) return alert("Мин. 50 кг/литров для сделки");
  lots[index].buyer = currentUser.username;
  localStorage.setItem("lots", JSON.stringify(lots));
  loadLots();
}

// Удаление лота
function deleteLot(index) {
  let lots = JSON.parse(localStorage.getItem("lots"));
  if (confirm(`Удалить лот "${lots[index].title}"?`)) {
    lots.splice(index, 1);
    localStorage.setItem("lots", JSON.stringify(lots));
    loadLots();
  }
}
// Очистить всю историю лотов
function clearHistory() {
  if (confirm("Вы точно хотите удалить всю историю лотов?")) {
    localStorage.removeItem("lots"); // удаляем все лоты
    loadLots(); // обновляем интерфейс
  }
}
