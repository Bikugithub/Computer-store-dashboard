// 1. Initial State
const defaultInventory = [
    { id: "SKU-001", name: "Lenovo ThinkPad", stock: 15 },
    { id: "SKU-002", name: "Logitech Wireless Mouse", stock: 8 },
    { id: "SKU-003", name: "A4 Printer Paper (Ream)", stock: 120 },
    { id: "SKU-004", name: "Office Desk Chair", stock: 3 },
    { id: "SKU-005", name: "HDMI Cable (2m)", stock: 0 },
    { id: "SKU-006", name: "Mechanical Keyboard", stock: 22 }
];

// 2. Load from localStorage
let inventoryData = JSON.parse(localStorage.getItem("warehouseData")) || defaultInventory;

// DOM Elements
const tbody = document.querySelector("#inventory-body");
const resetBtn = document.querySelector("#reset-btn");
const searchInput = document.querySelector("#search-input");
const stockFilter = document.querySelector("#stock-filter");

// 3. Render Function with Live Filter & Search Logic
function renderTable() {
    tbody.innerHTML = "";

    const query = searchInput.value.trim().toLowerCase();
    const filter = stockFilter.value;

    // Filter items according to search text and selected dropdown criteria
    const filteredData = inventoryData.filter(item => {
        const matchesSearch = item.name.toLowerCase().includes(query) || 
                              item.id.toLowerCase().includes(query);

        let matchesFilter = true;
        if (filter === "low") {
            matchesFilter = item.stock > 0 && item.stock < 10;
        } else if (filter === "out") {
            matchesFilter = item.stock === 0;
        } else if (filter === "available") {
            matchesFilter = item.stock >= 10;
        }

        return matchesSearch && matchesFilter;
    });

    // Empty state handling
    if (filteredData.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="4" class="no-results">No matching inventory items found.</td>
            </tr>
        `;
        return;
    }

    // Render table rows
    filteredData.forEach(item => {
        const tr = document.createElement("tr");

        let stockClass = "";
        if (item.stock === 0) stockClass = "out-of-stock";
        else if (item.stock < 10) stockClass = "low-stock";

        tr.innerHTML = `
            <td>${item.id}</td>
            <td>${item.name}</td>
            <td class="${stockClass}">${item.stock}</td>
            <td>
                <button class="btn-minus" data-id="${item.id}">-</button>
                <button class="btn-plus" data-id="${item.id}">+</button>
            </td>
        `;
        tbody.appendChild(tr);
    });

    // Save full inventory data to persistent storage
    localStorage.setItem("warehouseData", JSON.stringify(inventoryData));
}

// 4. Event Delegation: Update stock using item ID lookup
tbody.addEventListener("click", function(e) {
    const targetId = e.target.dataset.id;
    if (!targetId) return;

    const targetItem = inventoryData.find(item => item.id === targetId);
    if (!targetItem) return;

    if (e.target.classList.contains("btn-plus")) {
        targetItem.stock++;
        renderTable();
    }

    if (e.target.classList.contains("btn-minus")) {
        if (targetItem.stock > 0) {
            targetItem.stock--;
            renderTable();
        }
    }
});

// 5. Input & Filter Listeners (Real-time update on typing or selecting)
searchInput.addEventListener("input", renderTable);
stockFilter.addEventListener("change", renderTable);

// 6. Reset Button
resetBtn.addEventListener("click", () => {
    inventoryData = JSON.parse(JSON.stringify(defaultInventory));
    searchInput.value = "";
    stockFilter.value = "all";
    renderTable();
});

// Initial run
renderTable();
