# Stock Manager Dashboard

A lightweight, mobile-first inventory tracking web app. I originally experimented with Firebase and custom Node.js/Express backends for this project, but ultimately pivoted to a purely offline-first `localStorage` approach. This keeps the app completely free to host on GitHub Pages, instantly responsive on mobile, and completely free from cloud-provider security blocks or server timeout issues.

## Features
* **Zero Backend Setup:** All inventory data saves instantly to the browser's local memory. No database configuration required.
* **Touch-Friendly UI:** Ditched rigid desktop tables for a responsive card layout. Includes tactile +/- stepper buttons to update stock levels directly from a phone screen.
* **Live Search & Filters:** Instantly search products by SKU or name, and filter by status (In Stock, Low Stock, Out of Stock).
* **Smooth Interactions:** CSS-driven collapsible drawer for adding new items and clean slide-out animations for deletions.

## Tech Stack
* HTML5
* CSS3 (Custom variables, Flexbox, smooth transitions)
* Vanilla JavaScript (ES6, DOM manipulation, LocalStorage API)

## How to Run Locally
1. Clone this repository:
   `git clone https://github.com/Bikugithub/item-selector-dashboard.git`
2. Open `index.html` in any web browser.

Since the project relies on standard browser APIs, you don't need to run `npm install`, set up Node, or start a local server. Just open the HTML file and it works immediately.


FOR PREVIEW = https://bikugithub.github.io/item-selector-dashboard/
