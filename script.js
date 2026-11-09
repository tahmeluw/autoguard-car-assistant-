// Mock Car Data
const carListings = [
    {
        id: 1,
        title: "2019 Honda Civic LX",
        price: 16500,
        mileage: "42,000 miles",
        type: "used",
        fairPriceRating: "Great Deal ($800 below market)",
        ratingClass: "badge-fair",
        img: "https://images.unsplash.com/photo-1590362891991-f776e747a588?w=500&q=80"
    },
    {
        id: 2,
        title: "2017 Toyota Corolla LE",
        price: 14200,
        mileage: "58,500 miles",
        type: "used",
        fairPriceRating: "Fair Market Value",
        ratingClass: "badge-fair",
        img: "https://images.unsplash.com/photo-1621007947382-bb3c3994e3fb?w=500&q=80"
    },
    {
        id: 3,
        title: "2021 Ford Escape SE",
        price: 21000,
        mileage: "29,000 miles",
        type: "used",
        fairPriceRating: "Overpriced by ~$1,200",
        ratingClass: "badge-warning",
        img: "https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?w=500&q=80"
    }
];

// Predictive Maintenance Data
const maintenanceItems = [
    {
        title: "Synthetic Oil Change & Filter",
        dueMileage: "65,000 miles",
        dueTime: "In ~3 weeks (approx. 800 miles left)",
        status: "urgent",
        estCost: "$65 - $85"
    },
    {
        title: "Front Brake Pads Inspection / Replacement",
        dueMileage: "70,000 miles",
        dueTime: "In ~5 months",
        status: "normal",
        estCost: "$180 - $240"
    },
    {
        title: "Tire Rotation & Alignment Check",
        dueMileage: "72,000 miles",
        dueTime: "In ~7 months",
        status: "normal",
        estCost: "$50 - $90"
    }
];

// DOM Load Initialization
document.addEventListener("DOMContentLoaded", () => {
    initNavigation();
    renderListings(carListings);
    initPhotoUpload();
    renderMaintenance();
});

// Tab Navigation Logic
function initNavigation() {
    const navButtons = document.querySelectorAll(".nav-btn");
    const tabContents = document.querySelectorAll(".tab-content");

    navButtons.forEach(button => {
        button.addEventListener("click", () => {
            const tabId = button.getAttribute("data-tab");

            navButtons.forEach(btn => btn.classList.remove("active"));
            tabContents.forEach(content => content.classList.remove("active"));

            button.classList.add("active");
            document.getElementById(`${tabId}-section`).classList.add("active");
        });
    });
}

// Render Listings
function renderListings(listings) {
    const grid = document.getElementById("listings-grid");
    grid.innerHTML = "";

    listings.forEach(car => {
        const card = document.createElement("div");
        card.className = "card";
        card.innerHTML = `
            <img src="${car.img}" alt="${car.title}" class="card-img">
            <div class="card-body">
                <span class="badge ${car.ratingClass}">${car.fairPriceRating}</span>
                <h3>${car.title}</h3>
                <p class="price-tag">$${car.price.toLocaleString()}</p>
                <p><small>Mileage: ${car.mileage}</small></p>
                <button class="btn btn-primary" style="margin-top:0.5rem;" onclick="alert('Viewing full inspection history report for ${car.title}')">View Inspection History</button>
            </div>
        `;
        grid.appendChild(card);
    });
}

// Photo Analysis Handling
function initPhotoUpload() {
    const dropZone = document.getElementById("drop-zone");
    const fileInput = document.getElementById("file-input");
    const analyzeBtn = document.getElementById("analyze-btn");
    const resultPlaceholder = document.getElementById("result-placeholder");
    const resultContent = document.getElementById("result-content");

    let uploadedFile = null;

    fileInput.addEventListener("change", (e) => {
        if (e.target.files.length > 0) {
            uploadedFile = e.target.files[0];
            dropZone.querySelector("p").innerHTML = `Selected: <strong>${uploadedFile.name}</strong>`;
            analyzeBtn.disabled = false;
        }
    });

    analyzeBtn.addEventListener("click", () => {
        const part = document.getElementById("car-part").value;
        resultPlaceholder.classList.add("hidden");
        resultContent.classList.remove("hidden");

        let assessment = "";
        if (part === "underbody") {
            assessment = `
                <h4 style="color:var(--warning);">Minor Valve Cover Seepage Detected</h4>
                <p>AI computer vision detected light oil residue near the upper gasket.</p>
                <ul>
                    <li><strong>Urgent Risk:</strong> Low (Safe to drive)</li>
                    <li><strong>Estimated Repair Cost:</strong> $150 - $250</li>
                    <li><strong>Negotiation Advice:</strong> Ask seller to lower price by $200.</li>
                </ul>
            `;
        } else if (part === "tires") {
            assessment = `
                <h4 style="color:var(--accent);">Tread Depth Healthy (6/32")</h4>
                <p>No uneven wear detected. Alignment appears balanced.</p>
                <ul>
                    <li><strong>Estimated Remaining Life:</strong> 15,000 miles</li>
                </ul>
            `;
        } else {
            assessment = `
                <h4 style="color:var(--accent);">No Structural Surface Damage Detected</h4>
                <p>Paint uniformity is consistent across panels. No signs of hidden body repair.</p>
            `;
        }

        resultContent.innerHTML = assessment;
    });
}

// Render Predictive Maintenance
function renderMaintenance() {
    const list = document.getElementById("timeline-list");
    list.innerHTML = "";

    maintenanceItems.forEach(item => {
        const el = document.createElement("div");
        el.className = `timeline-item ${item.status === 'urgent' ? 'urgent' : ''}`;
        el.innerHTML = `
            <div>
                <h4>${item.title}</h4>
                <p><small>Due at: ${item.dueMileage} (${item.dueTime})</small></p>
            </div>
            <div style="text-align:right;">
                <span style="font-weight:600; color:var(--text-dark);">${item.estCost}</span>
                <br>
                <button class="btn btn-accent" style="padding:0.3rem 0.6rem; font-size:0.8rem; margin-top:0.3rem;" onclick="alert('Service scheduled!')">Schedule</button>
            </div>
        `;
        list.appendChild(el);
    });
}
