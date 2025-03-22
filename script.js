// Cart array to store items
let cart = [];

// DOM elements for cart
const cartButton = document.getElementById("cartButton");
const cartModal = document.getElementById("cartModal");
const closeCartModal = document.getElementById("closeCartModal");
const cartItemsContainer = document.getElementById("cartItems");
const cartTotal = document.getElementById("cartTotal");
const buyNowCartButton = document.getElementById("buyNowCart");
const cartBadge = document.querySelector(".cart-badge");

// DOM elements for QR code
const qrModal = document.getElementById("qrModal");
const closeQrModal = document.getElementById("closeQrModal");
const orderDetails = document.getElementById("orderDetails");
const qrCodeContainer = document.getElementById("qrcode");

// DOM elements for about and sizing
const menuIcon = document.getElementById("menuIcon");
const aboutModal = document.getElementById("aboutModal");
const closeAboutModal = document.getElementById("closeAboutModal");
const sizingModal = document.getElementById("sizingModal");
const closeSizingModal = document.getElementById("closeSizingModal");
const sizingContent = document.getElementById("sizingContent");
const showSizingButtons = document.querySelectorAll(".show-sizing");

// DOM elements for login, greeting, and logout
const loginForm = document.getElementById("loginForm");
const userGreeting = document.getElementById("userGreeting");
const logoutButton = document.getElementById("logoutButton");

// Admin page elements
const video = document.getElementById("video");
const canvas = document.getElementById("canvas");
const startScannerButton = document.getElementById("startScanner");
const stopScannerButton = document.getElementById("stopScanner");
const scannedOrdersContainer = document.getElementById("scannedOrders");

// Order details page elements
const orderSummary = document.getElementById("orderSummary");
const adminActions = document.getElementById("adminActions");
const markPaidButton = document.getElementById("markPaid");
const userActions = document.getElementById("userActions");
const markUserPaidButton = document.getElementById("markUserPaid");
const saveOrderButton = document.getElementById("saveOrder");

let stream = null;
let scanning = false;

// Load scanned orders from localStorage
let scannedOrders = JSON.parse(localStorage.getItem("scannedOrders")) || [];

function saveScannedOrders() {
    localStorage.setItem("scannedOrders", JSON.stringify(scannedOrders));
}

function displayScannedOrders() {
    if (!scannedOrdersContainer) return;
    scannedOrdersContainer.innerHTML = "";
    scannedOrders.forEach((order, index) => {
        const orderDiv = document.createElement("div");
        orderDiv.classList.add("scanned-order");
        orderDiv.innerHTML = `
            <h3>Order ${index + 1}</h3>
            <p><strong>Total:</strong> ₱${order.total}</p>
            <p><strong>Items:</strong></p>
            ${order.items.map(item => `
                <p>Item: ${item.name}, Size: ${item.size}, Quantity: ${item.quantity}, Price: ₱${item.price}</p>
            `).join("")}
            <p><strong>Admin Status:</strong> ${order.paid ? "Paid" : "Pending"}</p>
            <p><strong>User Status:</strong> ${order.userPaid ? "Paid" : "Pending"}</p>
        `;
        scannedOrdersContainer.appendChild(orderDiv);
    });
}

// Error handling for critical DOM elements
if (!cartButton || !cartModal || !closeCartModal || !cartItemsContainer || !cartTotal || !cartBadge) {
    console.error("Required cart elements not found!");
}

// Display user greeting and logout button if logged in
function updateUserGreeting() {
    if (userGreeting && logoutButton) {
        const userId = localStorage.getItem("userId");
        if (userId) {
            userGreeting.textContent = `Hello, ${userId}`;
            userGreeting.style.display = "inline-block";
            logoutButton.style.display = "inline-block";
        } else {
            userGreeting.style.display = "none";
            logoutButton.style.display = "none";
        }
    }
}

// Handle logout
if (logoutButton) {
    logoutButton.addEventListener("click", () => {
        localStorage.removeItem("userId");
        localStorage.removeItem("loginType");
        updateUserGreeting();
        window.location.href = "./index.html";
    });
}

// Check if user is admin, otherwise redirect
function checkAdminAccess() {
    const loginType = localStorage.getItem("loginType");
    if (loginType !== "admin") {
        alert("Access denied. Please log in as an admin.");
        window.location.href = "./index.html";
    }
}

// Handle login form submission with ID validation
if (loginForm) {
    const idInput = document.getElementById("idNumber");

    // Restrict input to numbers and hyphens only with auto-formatting for users
    idInput.addEventListener('input', function(e) {
        const selectedType = document.querySelector('input[name="loginType"]:checked').value;
        if (selectedType === "user") {
            // Remove any non-numeric characters except hyphens
            this.value = this.value.replace(/[^0-9-]/g, '');
            
            // Auto-add hyphens at correct positions
            let value = this.value.replace(/-/g, ''); // Remove existing hyphens
            if (value.length > 2) {
                value = value.slice(0, 2) + '-' + value.slice(2);
            }
            if (value.length > 7) {
                value = value.slice(0, 7) + '-' + value.slice(7);
            }
            this.value = value.slice(0, 11); // Limit to max length
            
            // Prevent more digits after reaching the limit for each section
            let parts = this.value.split('-');
            if (parts[0] && parts[0].length > 2) {
                parts[0] = parts[0].slice(0, 2);
            }
            if (parts[1] && parts[1].length > 4) {
                parts[1] = parts[1].slice(0, 4);
            }
            if (parts[2] && parts[2].length > 3) {
                parts[2] = parts[2].slice(0, 3);
            }
            this.value = parts.join('-');
        }
    });

    loginForm.addEventListener("submit", (e) => {
        e.preventDefault();
        const idNumber = idInput.value.trim();
        const selectedType = document.querySelector('input[name="loginType"]:checked').value;

        // Basic validation: Check if ID Number is not empty
        if (idNumber === "") {
            alert("Please enter your ID Number.");
            return;
        }

        if (selectedType === "admin") {
            // Admin login: Check for a simple admin credential
            if (idNumber.toLowerCase() === "admin") {
                localStorage.setItem("userId", idNumber);
                localStorage.setItem("loginType", "admin");
                window.location.href = "./admin.html";
            } else {
                alert("Invalid admin credentials. Use 'admin' as the ID.");
                idInput.focus();
            }
        } else {
            // User login: Validate ID format (12-3456-789)
            const pattern = /^\d{2}-\d{4}-\d{3}$/;
            if (!pattern.test(idNumber)) {
                alert("Invalid ID number. Please use format: 12-3456-789");
                idInput.focus();
                return;
            }

            localStorage.setItem("userId", idNumber);
            localStorage.setItem("loginType", "user");
            window.location.href = "./home.html";
        }
    });
}

// Toggle about modal with animation
if (menuIcon) {
    menuIcon.addEventListener("click", () => {
        aboutModal.classList.add("active");
        aboutModal.classList.remove("hidden");
    });
}

if (closeAboutModal) {
    closeAboutModal.addEventListener("click", () => {
        aboutModal.classList.add("hidden");
        setTimeout(() => aboutModal.classList.remove("active"), 300);
    });
}

// Toggle sizing modal with animation and dynamic content
if (showSizingButtons.length > 0) {
    showSizingButtons.forEach(button => {
        button.addEventListener("click", () => {
            const type = button.getAttribute("data-type");
            sizingContent.innerHTML = ""; // Clear previous content

            if (type === "uniform") {
                sizingContent.innerHTML = `
                    <table>
                        <thead>
                            <tr>
                                <th>Selected Size</th>
                                <th>Fits</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td>STD (Standard)</td>
                                <td>XS, S, M, L</td>
                            </tr>
                            <tr>
                                <td>XL (Extra Large)</td>
                                <td>XL, XXL, XXXL</td>
                            </tr>
                        </tbody>
                    </table>
                `;
            } else if (type === "shorts") {
                sizingContent.innerHTML = `
                    <table>
                        <thead>
                            <tr>
                                <th>Selected Size</th>
                                <th>Waist</th>
                                <th>Inseam</th>
                                <th>Thigh</th>
                                <th>Hip</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td>S (Small)</td>
                                <td>28-30</td>
                                <td>7</td>
                                <td>21-22</td>
                                <td>34-36</td>
                            </tr>
                            <tr>
                                <td>M (Medium)</td>
                                <td>32-34</td>
                                <td>7.5</td>
                                <td>23-24</td>
                                <td>38-40</td>
                            </tr>
                            <tr>
                                <td>L (Large)</td>
                                <td>36-38</td>
                                <td>8</td>
                                <td>25-26</td>
                                <td>42-44</td>
                            </tr>
                        </tbody>
                    </table>
                    <p style="font-size: 0.8rem; color: #666; margin-top: 1rem; text-align: center;">* Measurements are in inches.</p>
                `;
            }

            sizingModal.classList.add("active");
            sizingModal.classList.remove("hidden");
        });
    });
}

if (closeSizingModal) {
    closeSizingModal.addEventListener("click", () => {
        sizingModal.classList.add("hidden");
        setTimeout(() => sizingModal.classList.remove("active"), 300);
        sizingContent.innerHTML = ""; // Clear content
    });
}

// Add to Cart functionality with animation
if (document.querySelectorAll(".add-to-cart").length > 0) {
    document.querySelectorAll(".add-to-cart").forEach((button, index) => {
        button.addEventListener("click", () => {
            const productName = button.getAttribute("data-name");
            const productPrice = parseFloat(button.getAttribute("data-price"));
            const productImage = button.getAttribute("data-image");
            const sizeSelect = document.getElementById(`size${index + 1}`);
            const size = sizeSelect ? sizeSelect.value : "N/A";

            // Validate size selection
            if (sizeSelect && !size) {
                alert("Please select a size before adding to cart!");
                return;
            }

            // Check if item already exists in cart
            const existingItem = cart.find(item => item.name === productName && item.size === size);
            if (existingItem) {
                existingItem.quantity = (existingItem.quantity || 0) + 1;
            } else {
                cart.push({
                    name: productName,
                    price: productPrice,
                    size: size,
                    image: productImage,
                    quantity: 1
                });
            }

            updateCart();
            animateCartBadge();
        });
    });
}

// Update cart display with animation
function updateCart() {
    if (!cartItemsContainer) return;
    cartItemsContainer.innerHTML = "";
    let total = 0;

    cart.forEach((item, index) => {
        const itemTotal = item.price * item.quantity;
        total += itemTotal;

        const cartItem = document.createElement("div");
        cartItem.classList.add("cart-item");
        cartItem.style.animationDelay = `${index * 0.1}s`; // Staggered animation
        cartItem.innerHTML = `
            <img src="${item.image}" alt="${item.name}">
            <div class="cart-item-details">
                <h3>${item.name}</h3>
                <p>Size: ${item.size}</p>
                <p>₱${item.price}</p>
                <div class="cart-item-quantity">
                    <button class="decrease">-</button>
                    <span>${item.quantity}</span>
                    <button class="increase">+</button>
                </div>
            </div>
            <button class="cart-item-remove"><i class="ri-delete-bin-line"></i></button>
        `;

        // Quantity controls
        cartItem.querySelector(".decrease").addEventListener("click", () => {
            if (item.quantity > 1) {
                item.quantity--;
                updateCart();
            }
        });

        cartItem.querySelector(".increase").addEventListener("click", () => {
            item.quantity++;
            updateCart();
        });

        // Remove item
        cartItem.querySelector(".cart-item-remove").addEventListener("click", () => {
            cart.splice(index, 1);
            updateCart();
        });

        cartItemsContainer.appendChild(cartItem);
    });

    cartTotal.textContent = total.toFixed(2);

    // Update cart badge with total quantity of items
    const totalQuantity = cart.reduce((sum, item) => sum + item.quantity, 0);
    cartBadge.textContent = totalQuantity > 0 ? totalQuantity : 0;
}

// Open cart modal with animation
if (cartButton) {
    cartButton.addEventListener("click", (e) => {
        e.preventDefault();
        updateCart();
        cartModal.classList.add("active");
        cartModal.classList.remove("hidden");
    });
}

// Close cart modal with animation
if (closeCartModal) {
    closeCartModal.addEventListener("click", () => {
        cartModal.classList.add("hidden");
        setTimeout(() => cartModal.classList.remove("active"), 300);
    });
}

// Buy Now from cart
if (buyNowCartButton) {
    buyNowCartButton.addEventListener("click", () => {
        if (cart.length === 0) {
            alert("Your cart is empty!");
            return;
        }

        // Prepare order details for display in QR modal
        let orderInfo = "";
        cart.forEach(item => {
            orderInfo += `Item: ${item.name}\nSize: ${item.size}\nQuantity: ${item.quantity}\nPrice: ₱${item.price}\n\n`;
        });
        const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
        orderInfo += `Total: ₱${total.toFixed(2)}`;

        // Create URL with query parameters for QR code (use absolute path)
        const itemsParam = encodeURIComponent(JSON.stringify(cart));
        const orderUrl = `https://brzyyyyy.github.io/teknoy-wildcarts/order-details.html?items=${itemsParam}`;

        // Clear the cart immediately after clicking "Buy Now"
        cart = [];
        updateCart();

        // Display order details in modal
        orderDetails.textContent = orderInfo;

        // Clear previous QR code
        qrCodeContainer.innerHTML = "";

        // Generate QR code with the URL
        try {
            QRCode.toCanvas(qrCodeContainer, orderUrl, { width: 200, height: 200 }, (error) => {
                if (error) {
                    console.error("QR Code generation failed:", error);
                    orderDetails.textContent += "\n[Error: QR Code could not be generated. Please note down your order details.]";
                } else {
                    console.log("QR Code generated successfully with URL:", orderUrl);
                }
            });
        } catch (e) {
            console.error("QR Code library error:", e);
            orderDetails.textContent += "\n[Error: QR Code library failed to load. Please note down your order details.]";
        }

        // Show QR modal and close cart modal with animation
        cartModal.classList.add("hidden");
        setTimeout(() => cartModal.classList.remove("active"), 300);
        qrModal.classList.add("active");
        qrModal.classList.remove("hidden");
    });
}

// Close QR modal with animation
if (closeQrModal) {
    closeQrModal.addEventListener("click", () => {
        qrModal.classList.add("hidden");
        setTimeout(() => qrModal.classList.remove("active"), 300);
        // Clear the cart after closing QR modal (redundant since cleared on "Buy Now", but kept for consistency)
        cart = [];
        updateCart();
    });
}

// Animate cart badge
function animateCartBadge() {
    if (!cartBadge) return;
    cartBadge.style.animation = "bounce 0.5s ease";
    setTimeout(() => {
        cartBadge.style.animation = "";
    }, 500);
}

// Start QR code scanner
if (startScannerButton) {
    startScannerButton.addEventListener("click", async () => {
        try {
            stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" } });
            video.srcObject = stream;
            video.play();
            startScannerButton.style.display = "none";
            stopScannerButton.style.display = "inline-block";
            scanning = true;
            scanQRCode();
        } catch (err) {
            console.error("Error accessing camera:", err);
            alert("Unable to access camera. Please ensure you have granted permission.");
        }
    });
}

// Stop QR code scanner
if (stopScannerButton) {
    stopScannerButton.addEventListener("click", () => {
        if (stream) {
            stream.getTracks().forEach(track => track.stop());
            video.srcObject = null;
            scanning = false;
            startScannerButton.style.display = "inline-block";
            stopScannerButton.style.display = "none";
        }
    });
}

// Scan QR code
function scanQRCode() {
    if (!scanning) return;

    const context = canvas.getContext("2d");
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    context.drawImage(video, 0, 0, canvas.width, canvas.height);
    const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
    const code = jsQR(imageData.data, imageData.width, imageData.height);

    if (code) {
        const url = code.data;
        // Check if the URL is an order-details URL
        if (url.includes("order-details.html?items=")) {
            const itemsParam = new URL(url).searchParams.get("items");
            const items = JSON.parse(decodeURIComponent(itemsParam));
            const total = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
            scannedOrders.push({ items, total, paid: false, userPaid: false });
            saveScannedOrders();
            displayScannedOrders();
            // Stop scanning after successful scan
            stopScannerButton.click();
            // Redirect to order-details page
            window.location.href = url;
        }
    }

    if (scanning) {
        requestAnimationFrame(scanQRCode);
    }
}

// Function to get query parameter by name
function getQueryParam(name) {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get(name);
}

// Display order details and user/admin actions
if (orderSummary) {
    const loginType = localStorage.getItem("loginType");
    const userId = localStorage.getItem("userId");
    const itemsParam = getQueryParam("items");
    let items = [];
    if (itemsParam) {
        try {
            items = JSON.parse(decodeURIComponent(itemsParam));
        } catch (e) {
            console.error("Error parsing items:", e);
        }
    }

    if (items.length > 0) {
        let total = 0;
        let orderDetailsText = `Order Details for ${userId}\n\n`; // For saving to file
        items.forEach(item => {
            const itemTotal = item.price * item.quantity;
            total += itemTotal;
            const itemDiv = document.createElement("div");
            itemDiv.classList.add("order-item");
            itemDiv.innerHTML = `
                <p><strong>Item:</strong> ${item.name}</p>
                <p><strong>Size:</strong> ${item.size}</p>
                <p><strong>Quantity:</strong> ${item.quantity}</p>
                <p><strong>Price:</strong> ₱${item.price}</p>
                <hr>
            `;
            orderSummary.appendChild(itemDiv);

            // Add to text for saving
            orderDetailsText += `Item: ${item.name}\nSize: ${item.size}\nQuantity: ${item.quantity}\nPrice: ₱${item.price}\n\n`;
        });
        const totalDiv = document.createElement("div");
        totalDiv.innerHTML = `<p><strong>Total:</strong> ₱${total.toFixed(2)}</p>`;
        orderSummary.appendChild(totalDiv);
        orderDetailsText += `Total: ₱${total.toFixed(2)}\n`;

        // Find the order in scannedOrders
        const orderIndex = scannedOrders.findIndex(order => 
            JSON.stringify(order.items) === JSON.stringify(items)
        );

        // User actions: "Order Paid" button
        if (markUserPaidButton) {
            if (orderIndex !== -1 && scannedOrders[orderIndex].userPaid) {
                markUserPaidButton.disabled = true;
                markUserPaidButton.textContent = "Order Already Paid";
            }

            markUserPaidButton.addEventListener("click", () => {
                if (orderIndex !== -1) {
                    scannedOrders[orderIndex].userPaid = true;
                    saveScannedOrders();
                    markUserPaidButton.disabled = true;
                    markUserPaidButton.textContent = "Order Already Paid";
                    alert("Order marked as paid by user.");
                }
            });
        }

        // User actions: "Save Order Details" button
        if (saveOrderButton) {
            saveOrderButton.addEventListener("click", () => {
                const blob = new Blob([orderDetailsText], { type: "text/plain" });
                const url = window.URL.createObjectURL(blob);
                const a = document.createElement("a");
                a.href = url;
                a.download = `order-details-${userId}.txt`;
                document.body.appendChild(a);
                a.click();
                window.URL.revokeObjectURL(url);
                document.body.removeChild(a);
                alert("Order details saved successfully!");
            });
        }

        // Admin actions: "Mark as Paid" button
        if (loginType === "admin" && adminActions) {
            adminActions.style.display = "block";

            if (orderIndex !== -1 && scannedOrders[orderIndex].paid) {
                markPaidButton.disabled = true;
                markPaidButton.textContent = "Already Paid";
            }

            markPaidButton.addEventListener("click", () => {
                if (orderIndex !== -1) {
                    scannedOrders[orderIndex].paid = true;
                    saveScannedOrders();
                    markPaidButton.disabled = true;
                    markPaidButton.textContent = "Already Paid";
                    alert("Order marked as paid by admin.");
                }
            });
        }
    } else {
        orderSummary.innerHTML = "<p>No order details found.</p>";
    }
}

// Initialize page
document.addEventListener("DOMContentLoaded", () => {
    updateUserGreeting();
    if (window.location.pathname.includes("admin.html")) {
        checkAdminAccess();
        displayScannedOrders();
    }
});