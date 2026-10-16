const addDrawer = document.getElementById("add-drawer");
const toggleFormBtn = document.getElementById("toggle-form-btn");
const addForm = document.getElementById("add-form");
const skuInput = document.getElementById("sku-input");
const nameInput = document.getElementById("name-input");
const stockInput = document.getElementById("stock-input");
const searchInput = document.getElementById("search-input");
const stockFilter = document.getElementById("stock-filter");
const inventoryList = document.getElementById("inventory-list");
const counterText = document.getElementById("inventory-counter");

// Retrieve persisted inventory
let inventoryData = JSON.parse(localStorage.getItem("localInventory")) || [
    { id: "SKU-001", name: "Lenovo ThinkPad", stock: 15 },
    { id: "SKU-002", name: "Wireless Mouse", stock: 8 },
    { id: "SKU-003", name: "A4 Printer Paper", stock: 0 }
];

function persistData() {
    localStorage.setItem("localInventory", JSON.stringify(inventoryData));
    updateCounter();
}

function updateCounter() {
    counterText.textContent = `${inventoryData.length} item${inventoryData.length === 1 ? '' : 's'} tracked`;
}

// Drawer Toggle
toggleFormBtn.addEventListener("click", () => {
    addDrawer.classList.toggle("hidden");
    const isOpened = !addDrawer.classList.contains("hidden");
    toggleFormBtn.style.transform = isOpened ? "rotate(45deg)" : "rotate(0deg)";
    if (isOpened) skuInput.focus();
});

// Render cards
function renderList() {
    inventoryList.innerHTML = "";
    const query = searchInput.value.trim().toLowerCase();
    const filter = stockFilter.value;

    const filtered = inventoryData.filter(item => {
        const matchesQuery = item.name.toLowerCase().includes(query) || item.id.toLowerCase().includes(query);
        let matchesFilter = true;
        if (filter === "low") matchesFilter = item.stock > 0 && item.stock < 10;
        else if (filter === "out") matchesFilter = item.stock === 0;
        else if (filter === "available") matchesFilter = item.stock >= 10;
        return matchesQuery && matchesFilter;
    });

    if (filtered.length === 0) {
        inventoryList.innerHTML = `
            <div class="empty-state">
                <p>No inventory matches your search.</p>
            </div>
        `;
        return;
    }

    filtered.forEach(item => {
        const card = document.createElement("div");
        card.className = "item-card";
        card.id = `card-${item.id}`;

        let statusText = "In Stock";
        let badgeClass = "badge-available";

        if (item.stock === 0) {
            statusText = "Out of Stock";
            badgeClass = "badge-out";
        } else if (item.stock < 10) {
            statusText = "Low Stock";
            badgeClass = "badge-low";
        }

        card.innerHTML = `
            <div class="item-info">
                <span class="sku-tag">${item.id}</span>
                <div class="item-name">${item.name}</div>
                <span class="badge ${badgeClass}">${statusText}</span>
            </div>
            <div class="item-actions">
                <div class="stock-stepper">
                    <button class="step-btn" onclick="updateStock('${item.id}', -1)" aria-label="Decrease stock">-</button>
                    <span class="stock-count">${item.stock}</span>
                    <button class="step-btn" onclick="updateStock('${item.id}', 1)" aria-label="Increase stock">+</button>
                </div>
                <button class="delete-action-btn" onclick="removeItemAnimated('${item.id}')" aria-label="Delete item">✕</button>
            </div>
        `;
        inventoryList.appendChild(card);
    });
}

// Add Item
addForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const sku = skuInput.value.trim().toUpperCase();

    if (inventoryData.some(item => item.id === sku)) {
        alert("This SKU already exists in inventory.");
        return;
    }

    const newItem = {
        id: sku,
        name: nameInput.value.trim(),
        stock: parseInt(stockInput.value, 10)
    };

    inventoryData.unshift(newItem);
    persistData();
    renderList();

    addForm.reset();
    addDrawer.classList.add("hidden");
    toggleFormBtn.style.transform = "rotate(0deg)";
});

// Stock Stepper (+ / -)
window.updateStock = function(id, change) {
    const item = inventoryData.find(prod => prod.id === id);
    if (!item) return;

    item.stock = Math.max(0, item.stock + change);
    persistData();
    renderList();
};

// Deletion with slide-out animation
window.removeItemAnimated = function(id) {
    const card = document.getElementById(`card-${id}`);
    if (card) {
        card.classList.add("removing");
        setTimeout(() => {
            inventoryData = inventoryData.filter(item => item.id !== id);
            persistData();
            renderList();
        }, 220);
    }
};

// Search & Filter Listeners
searchInput.addEventListener("input", renderList);
stockFilter.addEventListener("change", renderList);

// Initial Load
persistData();
renderList();
