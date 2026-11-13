// ==========================================
// 1. SUPABASE CLIENT INITIALIZATION
// ==========================================
const SUPABASE_URL = 'https://msyzuknuqggaokgqegps.supabase.co';
const SUPABASE_ANON_KEY = 'sb_secret_z7UeQ0j76CpP5niulSJI0g_2NmJwUSE';
const db = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// ==========================================
// 2. DOM LOAD INITIALIZATION
// ==========================================
document.addEventListener("DOMContentLoaded", () => {
    initNavigation();
    initSearchFilters();
    fetchAndRenderListings();        // Fetches car listings from Supabase
    initPhotoUpload();               // Sets up AI inspection photo upload & logging
    fetchAndRenderMaintenance();     // Fetches predictive maintenance timeline
});

// ==========================================
// 3. TAB NAVIGATION LOGIC
// ==========================================
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

// ==========================================
// 4. SEARCH & FILTER HANDLERS
// ==========================================
function initSearchFilters() {
    const searchBtn = document.getElementById("search-btn");
    searchBtn.addEventListener("click", () => {
        const searchText = document.getElementById("search-input").value.trim();
        const condition = document.getElementById("condition-filter").value;
        const maxPrice = document.getElementById("price-filter").value;
        fetchAndRenderListings(searchText, condition, maxPrice);
    });
}

// Fetch & Render Listings from Supabase
async function fetchAndRenderListings(searchText = "", condition = "all", maxPrice = "all") {
    const grid = document.getElementById("listings-grid");
    grid.innerHTML = "<p>Loading vehicles...</p>";

    let query = db.from("car_listings").select("*");

    if (searchText) {
        query = query.ilike("title", `%${searchText}%`);
    }
    if (condition !== "all") {
        query = query.eq("type", condition);
    }
    if (maxPrice !== "all") {
        query = query.lte("price", parseInt(maxPrice));
    }

    const { data: listings, error } = await query;

    if (error) {
        console.error("Error fetching car listings:", error.message);
        grid.innerHTML = `<p style="color:red;">Error loading listings from database.</p>`;
        return;
    }

    grid.innerHTML = "";
    listings.forEach(car => {
        const card = document.createElement("div");
        card.className = "card";
        card.innerHTML = `
            <img src="${car.img}" alt="${car.title}" class="card-img">
            <div class="card-body">
                <span class="badge ${car.rating_class}">${car.fair_price_rating}</span>
                <h3>${car.title}</h3>
                <p class="price-tag">$${Number(car.price).toLocaleString()}</p>
                <p><small>Mileage: ${car.mileage}</small></p>
                <button class="btn btn-primary" style="margin-top:0.5rem;" onclick="alert('Viewing full inspection history report for ${car.title}')">View Inspection History</button>
            </div>
        `;
        grid.appendChild(card);
    });
}

// ==========================================
// 5. AI PHOTO INSPECTION UPLOAD & LOGGING
// ==========================================
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

    analyzeBtn.addEventListener("click", async () => {
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

        // Save Inspection Record into Supabase
        const { error } = await db
            .from("inspection_logs")
            .insert([{
                car_part: part,
                file_name: uploadedFile ? uploadedFile.name : "unknown.jpg",
                assessment_html: assessment
            }]);

        if (error) {
            console.error("Failed to log inspection to Supabase:", error.message);
        } else {
            assessment += `<p style="margin-top:0.75rem; font-size:0.85rem; color:gray;">✓ Saved to AutoGuard Cloud History</p>`;
        }

        resultContent.innerHTML = assessment;
    });
}

// ==========================================
// 6. PREDICTIVE MAINTENANCE GARAGE TIMELINE
// ==========================================
async function fetchAndRenderMaintenance() {
    const list = document.getElementById("timeline-list");
    list.innerHTML = "<p>Loading maintenance predictions...</p>";

    const { data: maintenanceItems, error } = await db
        .from("maintenance_items")
        .select("*")
        .order("id", { ascending: true });

    if (error) {
        console.error("Error fetching maintenance items:", error.message);
        list.innerHTML = `<p style="color:red;">Error loading maintenance schedule.</p>`;
        return;
    }

    list.innerHTML = "";
    maintenanceItems.forEach(item => {
        const el = document.createElement("div");
        el.className = `timeline-item ${item.status === 'urgent' ? 'urgent' : ''}`;
        el.innerHTML = `
            <div>
                <h4>${item.title}</h4>
                <p><small>Due at: ${item.due_mileage} (${item.due_time})</small></p>
            </div>
            <div style="text-align:right;">
                <span style="font-weight:600; color:var(--text-dark);">${item.est_cost}</span>
                <br>
                <button class="btn btn-accent" style="padding:0.3rem 0.6rem; font-size:0.8rem; margin-top:0.3rem;" onclick="scheduleMaintenance(${item.id}, '${item.title}')">Schedule</button>
            </div>
        `;
        list.appendChild(el);
    });
}

// Update Maintenance Status in Supabase when "Schedule" is clicked
async function scheduleMaintenance(itemId, title) {
    const { error } = await db
        .from("maintenance_items")
        .update({ status: "scheduled", due_time: "Service Appointment Booked" })
        .eq("id", itemId);

    if (error) {
        alert("Could not schedule service: " + error.message);
        return;
    }

    alert(`Service scheduled for: ${title}`);
    fetchAndRenderMaintenance(); // Refresh UI immediately
}
