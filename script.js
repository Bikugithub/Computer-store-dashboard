// The live URL of your Replit Node.js backend
const API_URL = "https://3571c3fc-d97a-46b1-8d26-4cc9cbfbf2ec-00-2qf3a8vd042dk.pike.replit.dev/api/inventory";

const tbody = document.querySelector("#inventory-body");
const searchInput = document.querySelector("#search-input");
const stockFilter = document.querySelector("#stock-filter");
const userStatus = document.getElementById("user-status"); // Reusing the subtitle for status

let inventoryData = [];

// 1. Fetch data from your custom backend API
async function fetchInventory() {
    userStatus.textContent = "Connecting to Replit server...";
    try {
        const response = await fetch(API_URL);
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        // Convert the JSON response into a JavaScript array
        inventoryData = await response.json();
        
        userStatus.textContent = "Live data loaded from custom Node.js backend!";
        renderTable();
    } catch (error) {
        console.error("Error fetching from API:", error);
        userStatus.textContent = "Failed to connect to the server. Check console.";
    }
}

// 2. Render the table
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
                <span style="color: #666; font-size: 0.8rem;">(Read Only)</span>
            </td>
        `;
        tbody.appendChild(tr);
    });
}

// Search and Filter Listeners
searchInput.addEventListener("input", renderTable);
stockFilter.addEventListener("change", renderTable);

// Load data immediately when the app starts
fetchInventory();
