// 1. Import Firebase directly from Google's servers
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-app.js";
import { getAuth, signInWithPopup, GoogleAuthProvider, signOut, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-auth.js";
import { getFirestore, doc, setDoc, getDoc } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-firestore.js";

// 2. Your specific Firebase Configuration
const firebaseConfig = {
  apiKey: "AIzaSyAsbJE73N8WU1rVL5z3bIs-PcAgjdovO4g",
  authDomain: "stock-management-3c94b.firebaseapp.com",
  projectId: "stock-management-3c94b",
  storageBucket: "stock-management-3c94b.firebasestorage.app",
  messagingSenderId: "140096768670",
  appId: "1:140096768670:web:044fb4d3bfad0861a2898f"
};

// 3. Initialize Firebase Services
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const provider = new GoogleAuthProvider();

// DOM Elements
const loginBtn = document.getElementById("login-btn");
const logoutBtn = document.getElementById("logout-btn");
const userStatus = document.getElementById("user-status");
const appContent = document.getElementById("app-content");
const tbody = document.querySelector("#inventory-body");
const searchInput = document.querySelector("#search-input");
const stockFilter = document.querySelector("#stock-filter");

let inventoryData = [];

// Industry Presets
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

// --- AUTHENTICATION LOGIC ---

// Listen for Login/Logout state changes
onAuthStateChanged(auth, async (user) => {
    if (user) {
        // User is logged in
        loginBtn.style.display = "none";
        logoutBtn.style.display = "inline-block";
        userStatus.textContent = `Logged in as: ${user.email}`;
        appContent.style.display = "block";
        
        await loadDataFromCloud(user.uid);
    } else {
        // User is logged out
        loginBtn.style.display = "inline-block";
        logoutBtn.style.display = "none";
        userStatus.textContent = "Please log in to sync data to the cloud.";
        appContent.style.display = "none";
        inventoryData = [];
    }
});

// Login Button Click
loginBtn.addEventListener("click", () => {
    signInWithPopup(auth, provider).catch(error => alert("Login failed: " + error.message));
});

// Logout Button Click
logoutBtn.addEventListener("click", () => {
    signOut(auth);
});

// --- CLOUD DATABASE LOGIC ---

// Fetch data from Firestore
async function loadDataFromCloud(userId) {
    userStatus.textContent = "Loading data from cloud...";
    try {
        const docRef = doc(db, "users", userId);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
            inventoryData = docSnap.data().inventory;
        } else {
            inventoryData = templates.tech; // Default if they are a brand new user
            await saveDataToCloud(); // Save the default immediately
        }
        renderTable();
        userStatus.textContent = `Cloud sync active for: ${auth.currentUser.email}`;
    } catch (error) {
        console.error("Error loading data:", error);
        userStatus.textContent = "Error loading data. Check console.";
    }
}

// Push data to Firestore
async function saveDataToCloud() {
    if (!auth.currentUser) return; // Don't save if not logged in
    
    userStatus.textContent = "Syncing...";
    try {
        const docRef = doc(db, "users", auth.currentUser.uid);
        // This pushes the current array to Google's servers
        await setDoc(docRef, { inventory: inventoryData }); 
        userStatus.textContent = `Cloud sync active for: ${auth.currentUser.email}`;
    } catch (error) {
        console.error("Error saving data:", error);
        userStatus.textContent = "Error saving to cloud!";
    }
}


// --- UI RENDERING & LOGIC ---

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
}

// Handle Clicks inside the Table
tbody.addEventListener("click", async function(e) {
    const targetId = e.target.dataset.id;
    if (!targetId) return;

    if (e.target.classList.contains("btn-delete")) {
        inventoryData = inventoryData.filter(item => item.id !== targetId);
        renderTable();
        await saveDataToCloud();
        return;
    }

    const targetItem = inventoryData.find(item => item.id === targetId);
    if (e.target.classList.contains("btn-plus")) {
        targetItem.stock++;
        renderTable();
        await saveDataToCloud();
    }
    
    if (e.target.classList.contains("btn-minus") && targetItem.stock > 0) {
        targetItem.stock--;
        renderTable();
        await saveDataToCloud();
    }
});

// Add New Item
document.querySelector("#add-btn").addEventListener("click", async () => {
    const sku = document.querySelector("#new-sku").value.trim();
    const name = document.querySelector("#new-name").value.trim();
    const stock = parseInt(document.querySelector("#new-stock").value);

    if (sku === "" || name === "" || isNaN(stock) || stock < 0) {
        alert("Please enter a valid SKU, Name, and Stock quantity.");
        return;
    }

    inventoryData.push({ id: sku, name: name, stock: stock });
    
    document.querySelector("#new-sku").value = "";
    document.querySelector("#new-name").value = "";
    document.querySelector("#new-stock").value = "";
    
    renderTable();
    await saveDataToCloud();
});

// Load Template
document.querySelector("#load-template-btn").addEventListener("click", async () => {
    if(confirm("This will wipe your current inventory and load the preset to the cloud. Continue?")) {
        const selected = document.querySelector("#profession-template").value;
        inventoryData = JSON.parse(JSON.stringify(templates[selected]));
        renderTable();
        await saveDataToCloud();
    }
});

// Search and Filter Listeners
searchInput.addEventListener("input", renderTable);
stockFilter.addEventListener("change", renderTable);

// Reset Button
document.querySelector("#reset-btn").addEventListener("click", async () => {
    if(confirm("Are you sure you want to completely clear all data from the cloud?")) {
        inventoryData = [];
        renderTable();
        await saveDataToCloud();
    }
});
    
