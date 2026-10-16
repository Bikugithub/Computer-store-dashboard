// 1. Industry Presets Dictionary
const templates = {
    tech: [
        { id: "SKU-001", name: "Lenovo ThinkPad", stock: 15 },
        { id: "SKU-002", name: "Wireless Mouse", stock: 8 }
    ],
    lab: [
        { id: "CHEM-01", name: "Sulfuric Acid (500ml)", stock: 8 },
        { id: "CHEM-02", name: "Glass Beakers (250ml)", stock: 45 },
        { id: "CHEM-03", name: "Litmus Paper Strips", stock: 120 }
    ],
    pharmacy: [
        { id: "MED-01", name: "Paracetamol 500mg", stock: 350 },
        { id: "MED-02", name: "Cough Syrup (100ml)", stock: 5 },
        { id: "MED-03", name: "Surgical Masks (Box)", stock: 0 }
    ],
    restaurant: [
        { id: "FOOD-01", name: "All-Purpose Flour (kg)", stock: 25 },
        { id: "FOOD-02", name: "Olive Oil (Liters)", stock: 4 },
        { id: "FOOD-03", name: "Tomato Paste (Cans)", stock: 60 }
    ]
};

// 2. Load from localStorage, default to 'tech' if completely empty
let inventoryData = JSON.parse(localStorage.getItem("warehouseData")) || templates.tech;

const tbody = document.querySelector("#inventory-body");
const searchInput = document.querySelector("#search-input");
const stockFilter = document.querySelector("#stock-filter");

// 3. Render Function
function renderTable() {
    tbody.innerHTML = "";
    const query = searchInput.value.trim().toLowerCase();
    const filter = stockFilter.value;

    const filteredData = inventoryData.filter(item => {
        const matchesSearch = item.name.toLowerCase().includes(query) || item.id.toLowerCase().includes(query);
        let matchesFilter = true;
        if (filter === "low") matchesFilter = item.stock > 0 && item.stock < 10;
        else if (filter === "out") matchesFilter = item.stock === 0;
        else if (filter === "available") matchesFilter = item.stock >= 10;
        return matchesSearch && matchesFilter;
    });

    if (filteredData.length === 0) {
        tbody.innerHTML = `<tr><td colspan="4" class="no-results">No items found.</td></tr>`;
        return;
    }

    filteredData.forEach(item => {
        const tr = document.createElement("tr");
        let stockClass = item.stock === 0 ? "out-of-stock" : (item.stock < 10 ? "low-stock" : "");

        tr.innerHTML = `
            <td>${item.id}</td>
            <td>${item.name}</td>
            <td class="${stockClass}">${item.stock}</td>
            <td>
                <button class="btn-minus" data-id="${item.id}">-</button>
                <button class="btn-plus" data-id="${item.id}">+</button>
                <button class="btn-delete" data-id="${item.id}" title="Delete Item">🗑️</button>
            </td>
        `;
        tbody.appendChild(tr);
    });

    localStorage.setItem("warehouseData", JSON.stringify(inventoryData));
}

// 4. Handle Clicks inside the Table (Plus, Minus, and Delete)
tbody.addEventListener("click", function(e) {
    const targetId = e.target.dataset.id;
    if (!targetId) return;

    // Delete Button Logic
    if (e.target.classList.contains("btn-delete")) {
        // Filter out the item that matches the ID we want to delete
        inventoryData = inventoryData.filter(item => item.id !== targetId);
        renderTable();
        return;
    }

    // Plus/Minus Logic
    const targetItem = inventoryData.find(item => item.id === targetId);
    if (e.target.classList.contains("btn-plus")) {
        targetItem.stock++;
        renderTable();
    }
    if (e.target.classList.contains("btn-minus") && targetItem.stock > 0) {
        targetItem.stock--;
        renderTable();
    }
});

// 5. Add New Item Logic
document.querySelector("#add-btn").addEventListener("click", () => {
    const sku = document.querySelector("#new-sku").value.trim();
    const name = document.querySelector("#new-name").value.trim();
    const stock = parseInt(document.querySelector("#new-stock").value);

    // Form validation
    if (sku === "" || name === "" || isNaN(stock) || stock < 0) {
        alert("Please enter a valid SKU, Name, and Stock quantity.");
        return;
    }

    // Push the new item into the JavaScript array
    inventoryData.push({ id: sku, name: name, stock: stock });
    
    // Clear inputs
    document.querySelector("#new-sku").value = "";
    document.querySelector("#new-name").value = "";
    document.querySelector("#new-stock").value = "";
    
    renderTable();
});

// 6. Template Loader Logic
document.querySelector("#load-template-btn").addEventListener("click", () => {
    if(confirm("This will wipe your current inventory and load the selected preset. Continue?")) {
        const selected = document.querySelector("#profession-template").value;
        // JSON stringify/parse ensures we make a deep copy of the template, not a direct link
        inventoryData = JSON.parse(JSON.stringify(templates[selected]));
        renderTable();
    }
});

// 7. Search & Clear Data Listeners
searchInput.addEventListener("input", renderTable);
stockFilter.addEventListener("change", renderTable);

document.querySelector("#reset-btn").addEventListener("click", () => {
    if(confirm("Are you sure you want to completely clear all data?")) {
        inventoryData = [];
        renderTable();
    }
});

renderTable();
