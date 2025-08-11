document.addEventListener('DOMContentLoaded', () => {
    // --- STATE MANAGEMENT ---
    let allProducts = [];
    let adminProducts = [];
    let idsToDelete = [];
    let currentBill = createNewBill();
    let selectedProductForBill = null;
    let hasPendingChanges = false; // Track pending changes
    let isBillSaved = false; // New flag to track if the bill has been saved (via share or normal save)
    let toastContainer; // For the toast notifications

    // --- ELEMENT SELECTORS ---
    const views = {
        enquiry: document.getElementById('enquiry-view'),
        products: document.getElementById('products-management-view'),
        billing: document.getElementById('billing-management-view'),
        billingNav: document.getElementById('billing-nav'),
        newInvoice: document.getElementById('new-invoice-creator'),
        oldInvoices: document.getElementById('old-invoices-list'),
    };

    const navLinks = {
        enquiry: document.getElementById('nav-enquiry'),
        products: document.getElementById('nav-products'),
        billing: document.getElementById('nav-billing'),
    };

    const productAdminElements = {
        tableBody: document.getElementById('admin-table-body'),
        addProductBtn: document.getElementById('add-product-btn'),
        saveToDbBtn: document.getElementById('save-to-db-btn'),
        modal: document.getElementById('product-modal'),
        modalTitle: document.getElementById('modal-title'),
        form: document.getElementById('product-form'),
        cancelBtn: document.getElementById('cancel-btn'),
        productName: document.getElementById('product-name'),
        productTamilName: document.getElementById('product-tamil-name'),
        productOriginalPrice: document.getElementById('product-original-price'),
        productOfferPrice: document.getElementById('product-offer-price'),
        productCategory: document.getElementById('product-category'),
    };

    const billingNavButtons = {
        newInvoice: document.getElementById('new-invoice-btn'),
        oldInvoices: document.getElementById('old-invoices-btn'),
        backToBilling1: document.getElementById('back-to-billing-btn'),
        backToBilling2: document.getElementById('back-to-billing-btn2'),
    };

    const newInvoiceElements = {
        customerName: document.getElementById('customer-name'),
        customerPhone: document.getElementById('customer-phone'),
        generateLinkBtn: document.getElementById('generate-link-btn'),
        generatedLink: document.getElementById('generated-link'),
        discountPercent: document.getElementById('bill-discount-percent'),
        productSearch: document.getElementById('product-search'),
        productDropdown: document.getElementById('product-dropdown'),
        dropdownArrow: document.querySelector('.dropdown-arrow'),
        quantityInput: document.getElementById('product-quantity'),
        clearSelectionBtn: document.getElementById('clear-selection-btn'),
        addToBillBtn: document.getElementById('add-to-bill-btn'),
        invoiceItemsBody: document.getElementById('invoice-items-body'),
        billCustomerName: document.querySelector('#bill-customer-name-display span'),
        billDate: document.getElementById('bill-date-display'),
        billNumber: document.getElementById('bill-number-display'),
        productCount: document.getElementById('bill-product-count'),
        productQuantity: document.getElementById('bill-product-quantity'),
        subTotal: document.getElementById('bill-sub-total'),
        discountAmount: document.getElementById('bill-discount-amount'),
        total: document.getElementById('bill-total'),
        billActions: document.getElementById('bill-actions'),
        finalizedActions: document.getElementById('finalized-actions'),
        clearBillBtn: document.getElementById('clear-bill-btn'),
        finalizeBillBtn: document.getElementById('finalize-bill-btn'),
        editBillBtn: document.getElementById('edit-bill-btn'),
        shareBillBtn: document.getElementById('share-bill-btn'),
        saveBillBtn: document.getElementById('save-bill-btn'),
        billPreviewArea: document.getElementById('bill-preview-area'),
        finalizedBillView: document.getElementById('finalized-bill-view'),
    };

    const oldInvoicesElements = {
        body: document.getElementById('old-invoices-body'),
    };

    const enquiryElements = {
        productList: document.getElementById('enquiry-product-list'),
    };

    // --- CUSTOM TOAST FUNCTIONS ---
    function createToastContainer() {
        const container = document.createElement('div');
        container.id = 'toast-container';
        document.body.appendChild(container);
        toastContainer = container;
    }

    function showToast(message) {
        const toast = document.createElement('div');
        toast.classList.add('toast');
        toast.textContent = message;
        toastContainer.appendChild(toast);
        setTimeout(() => {
            toast.classList.add('show');
        }, 100);
        setTimeout(() => {
            toast.classList.remove('show');
            setTimeout(() => {
                toast.remove();
            }, 300);
        }, 3000);
    }

    // --- INITIALIZATION ---
    async function initApp() {
        createToastContainer(); // Create the toast container on init
        await fetchProducts();
        idsToDelete = JSON.parse(localStorage.getItem('crackerDeletions')) || [];
        updateSaveButtonVisibility(); // Check initial state
        switchView(localStorage.getItem('lastView') || 'billing');
    }

    async function fetchProducts() {
        try {
            const response = await fetch('./fetch_products.php');
            if (!response.ok) throw new Error("Network response failed");
            allProducts = await response.json();
            adminProducts = JSON.parse(JSON.stringify(allProducts));
        } catch (error) {
            console.error('Failed to fetch products:', error);
            showToast('Could not load product data. Please check the connection and PHP scripts.');
        }
    }

    // --- VIEW MANAGEMENT ---
    function switchView(viewName) {
        Object.values(views).forEach(v => v.classList.remove('active'));
        Object.values(navLinks).forEach(l => l.classList.remove('active'));
        if (views[viewName]) views[viewName].classList.add('active');
        if (navLinks[viewName]) navLinks[viewName].classList.add('active');
        localStorage.setItem('lastView', viewName);
        if (viewName === 'enquiry') renderEnquiryTable();
        if (viewName === 'products') renderAdminTable();
        if (viewName === 'billing') showBillingPage('nav');
    }

    function showBillingPage(pageName) {
        views.billingNav.classList.toggle('hidden', pageName !== 'nav');
        views.newInvoice.classList.toggle('hidden', pageName !== 'new');
        views.oldInvoices.classList.toggle('hidden', pageName !== 'old');
        if (pageName === 'new') resetBill();
        if (pageName === 'old') fetchAndRenderOldInvoices();
    }

    function renderEnquiryTable() {
        const enquiryList = enquiryElements.productList;
        enquiryList.innerHTML = '';
        if (!allProducts || allProducts.length === 0) {
            enquiryList.innerHTML = '<p>No products available.</p>';
            return;
        }
        const table = document.createElement('table');
        table.className = 'custom-table';
        table.innerHTML = `
            <thead>
                <tr>
                    <th>Product ID</th>
                    <th>English Name</th>
                    <th>Tamil Name</th>
                    <th>Original Price</th>
                    <th>Offer Price</th>
                    <th>Category</th>
                </tr>
            </thead>`;
        const tableBody = document.createElement('tbody');
        const productsByCategory = allProducts.reduce((acc, p) => {
            const category = p.category || 'Uncategorized';
            (acc[category] = acc[category] || []).push(p);
            return acc;
        }, {});
        for (const category in productsByCategory) {
            const headerRow = tableBody.insertRow();
            headerRow.className = 'category-header-row';
            headerRow.innerHTML = `<th colspan="6">${category}</th>`;
            productsByCategory[category].forEach(product => {
                const row = tableBody.insertRow();
                let priceIndicator = '';
                let priceCellClass = '';
                if (product.priceHistory && product.priceHistory.length > 1) {
                    const currentPrice = product.priceHistory[product.priceHistory.length - 1];
                    const previousPrice = product.priceHistory[product.priceHistory.length - 2];
                    if (currentPrice > previousPrice) {
                        priceIndicator = '↑';
                        priceCellClass = 'increased';
                    } else if (currentPrice < previousPrice) {
                        priceIndicator = '↓';
                        priceCellClass = 'decreased';
                    }
                }
                row.innerHTML = `
                    <td>${product.productId || 'N/A'}</td>
                    <td>${product.name}</td>
                    <td>${product.tamilName}</td>
                    <td>₹${parseFloat(product.originalPrice).toFixed(2)}</td>
                    <td class="${priceCellClass}">₹${parseFloat(product.offerPrice).toFixed(2)} ${priceIndicator}</td>
                    <td>${product.category}</td>`;
            });
        }
        table.appendChild(tableBody);
        enquiryList.appendChild(table);
    }

    // --- PRODUCT ADMIN LOGIC ---
    function renderAdminTable() {
        const tableBody = productAdminElements.tableBody;
        tableBody.innerHTML = '';
        if (!adminProducts || adminProducts.length === 0) {
            tableBody.innerHTML = `<tr><td colspan="7">No products to manage.</td></tr>`;
            return;
        }
        const productsByCategory = adminProducts.reduce((acc, p) => {
            const category = p.category || 'Uncategorized';
            (acc[category] = acc[category] || []).push(p);
            return acc;
        }, {});
        for (const category in productsByCategory) {
            const headerRow = tableBody.insertRow();
            headerRow.className = 'category-header-row';
            headerRow.innerHTML = `<th colspan="7">${category}</th>`;
            productsByCategory[category].forEach(product => {
                const productIndex = adminProducts.findIndex(p => p.id === product.id);
                const row = tableBody.insertRow();
                row.dataset.index = productIndex;
                row.className = product.inStock == 1 ? 'out-of-stock' : '';
                row.innerHTML = `
                    <td>${product.productId || 'New'}</td>
                    <td>${product.name}</td>
                    <td>${product.tamilName}</td>
                    <td>₹${parseFloat(product.originalPrice).toFixed(2)}</td>
                    <td class="editable-price">₹${parseFloat(product.offerPrice).toFixed(2)}</td>
                    <td>${product.category}</td>
                    <td>${getAdminActionButtons(product)}</td>`;
            });
        }
        updateSaveButtonVisibility();
    }

    function getAdminActionButtons(product) {
        if (product.inStock == 1) {
            return `<button class="in-stock-btn" data-id="${product.id}">In Stock</button>`;
        }
        return `
            <button class="delete-btn" data-id="${product.id}">Delete</button>
            <button class="no-stock-btn" data-id="${product.id}">No Stock</button>`;
    }

    function handleAdminFormSubmit(e) {
        e.preventDefault();
        const newProduct = {
            id: -Date.now(),
            name: productAdminElements.productName.value,
            tamilName: productAdminElements.productTamilName.value,
            originalPrice: parseFloat(productAdminElements.productOriginalPrice.value),
            offerPrice: parseFloat(productAdminElements.productOfferPrice.value),
            category: productAdminElements.productCategory.value,
            inStock: 1,
            productId: '',
            latest: 1,
            is_delete: 0
        };
        adminProducts.push(newProduct);
        productAdminElements.modal.classList.add('hidden');
        productAdminElements.form.reset();
        renderAdminTable();
        hasPendingChanges = true;
        updateSaveButtonVisibility();
    }

    function handleDelete(e) {
        const id = parseInt(e.target.dataset.id);
        idsToDelete.push(id);
        localStorage.setItem('crackerDeletions', JSON.stringify(idsToDelete));
        adminProducts = adminProducts.filter(p => p.id !== id);
        hasPendingChanges = true;
        renderAdminTable();
    }

    function handleToggleStock(e) {
        const id = parseInt(e.target.dataset.id);
        const product = adminProducts.find(p => p.id === id);
        if (product) {
            product.inStock = product.inStock == 1 ? 0 : 1;
            hasPendingChanges = true;
            renderAdminTable();
        }
    }

    function handlePriceEdit(e) {
        if (!e.target.classList.contains('editable-price')) return;
        const row = e.target.closest('tr');
        const index = parseInt(row.dataset.index);
        const product = adminProducts[index];
        const cell = e.target;
    
        // Create input box
        const input = document.createElement('input');
        input.type = 'number';
        input.step = '0.01';
        input.min = '0';
        input.value = parseFloat(product.offerPrice).toFixed(2);
        input.style.width = '100%';
        input.style.padding = '2px';
        input.style.boxSizing = 'border-box';
    
        // Replace cell content with input
        cell.innerHTML = '';
        cell.appendChild(input);
        input.focus();
    
        // Save on Enter or blur
        const savePrice = () => {
            const newPrice = parseFloat(input.value);
            if (!isNaN(newPrice) && newPrice >= 0) {
                product.offerPrice = newPrice;
                hasPendingChanges = true;
                updateSaveButtonVisibility();
            }
            renderAdminTable();
        };
    
        input.addEventListener('keydown', (ev) => {
            if (ev.key === 'Enter') {
                savePrice();
            }
        });
    
        input.addEventListener('blur', savePrice);
    }

    async function saveProductsToServer() {
        productAdminElements.saveToDbBtn.textContent = 'Saving...';
        productAdminElements.saveToDbBtn.disabled = true;
        try {
            const payload = {
                stockChanges: adminProducts.filter(p => allProducts.some(ap => ap.id === p.id && ap.inStock !== p.inStock)).map(p => ({ id: p.id, inStock: p.inStock })),
                priceEdits: adminProducts.filter(p => allProducts.some(ap => ap.id === p.id && (ap.name !== p.name || ap.tamilName !== p.tamilName || ap.originalPrice !== p.originalPrice || ap.offerPrice !== p.offerPrice || ap.category !== p.category))).map(p => ({
                    id: p.id,
                    productId: p.productId,
                    name: p.name,
                    tamilName: p.tamilName,
                    originalPrice: p.originalPrice,
                    offerPrice: p.offerPrice,
                    category: p.category,
                    inStock: p.inStock
                })),
                newProducts: adminProducts.filter(p => p.id < 0).map(p => ({
                    name: p.name,
                    tamilName: p.tamilName,
                    originalPrice: p.originalPrice,
                    offerPrice: p.offerPrice,
                    category: p.category,
                    inStock: p.inStock
                })),
                toDelete: idsToDelete
            };
            const response = await fetch('./save_products.php', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });
            const result = await response.json();
            if (!response.ok || result.status !== 'success') throw new Error(result.message);
            await fetchProducts();
            idsToDelete = [];
            localStorage.setItem('crackerDeletions', JSON.stringify(idsToDelete));
            hasPendingChanges = false;
            renderAdminTable();
            showToast('Products saved successfully!');
        } catch (error) {
            showToast(`Error saving products: ${error.message}`);
        } finally {
            productAdminElements.saveToDbBtn.textContent = 'Save to Database';
            productAdminElements.saveToDbBtn.disabled = false;
        }
    }

    function updateSaveButtonVisibility() {
        productAdminElements.saveToDbBtn.classList.toggle('hidden', !hasPendingChanges);
    }

    // --- BILLING LOGIC ---
    function createNewBill() {
        return {
            billNumber: `B${Date.now()}`,
            date: new Date().toISOString().split('T')[0],
            customer: { name: '', phone: '' },
            items: [],
            discountPercent: 0,
            calculations: { productCount: 0, productQuantity: 0, subTotal: 0, discountAmount: 0, total: 0 },
            isFinalized: false
        };
    }

    function resetBill() {
        currentBill = createNewBill();
        newInvoiceElements.customerName.value = '';
        newInvoiceElements.customerPhone.value = '';
        newInvoiceElements.discountPercent.value = 0;
        newInvoiceElements.productSearch.value = '';
        newInvoiceElements.quantityInput.value = 1;
        selectedProductForBill = null;
        isBillSaved = false; // Reset the saved flag for the new bill
        renderBill();
    }

    function renderBill() {
        calculateBillTotals();
        const calcs = currentBill.calculations;
        newInvoiceElements.billCustomerName.textContent = currentBill.customer.name || 'N/A';
        newInvoiceElements.billDate.textContent = new Date(currentBill.date).toLocaleDateString('en-GB');
        newInvoiceElements.billNumber.textContent = currentBill.billNumber;
        newInvoiceElements.productCount.textContent = calcs.productCount;
        newInvoiceElements.productQuantity.textContent = calcs.productQuantity;
        newInvoiceElements.subTotal.textContent = `₹${calcs.subTotal.toFixed(2)}`;
        newInvoiceElements.discountAmount.textContent = `₹${calcs.discountAmount.toFixed(2)}`;
        newInvoiceElements.total.textContent = `₹${calcs.total.toFixed(2)}`;
        newInvoiceElements.invoiceItemsBody.innerHTML = '';
        currentBill.items.forEach((item, index) => {
            const row = newInvoiceElements.invoiceItemsBody.insertRow();
            row.dataset.index = index;
            const isEditable = !currentBill.isFinalized;
            row.innerHTML = `
                <td>${item.name}</td>
                <td>${isEditable ? `<input type="number" class="qty-input" value="${item.quantity}" min="1">` : item.quantity}</td>
                <td>${isEditable ? `<input type="number" class="price-input" value="${item.price.toFixed(2)}" step="0.01" min="0">` : `₹${item.price.toFixed(2)}`}</td>
                <td>₹${item.amount.toFixed(2)}</td>
                <td>${isEditable ? `<button class="remove-item-btn">Remove</button>` : ''}</td>`;
        });
        toggleFinalizedView(currentBill.isFinalized);
    }

    function calculateBillTotals() {
        currentBill.calculations.productCount = currentBill.items.length;
        currentBill.calculations.productQuantity = currentBill.items.reduce((sum, item) => sum + item.quantity, 0);
        currentBill.calculations.subTotal = currentBill.items.reduce((sum, item) => sum + item.amount, 0);
        currentBill.calculations.discountAmount = (currentBill.calculations.subTotal * currentBill.discountPercent) / 100;
        currentBill.calculations.total = currentBill.calculations.subTotal - currentBill.calculations.discountAmount;
    }

    function toggleFinalizedView(isFinalized) {
        currentBill.isFinalized = isFinalized;
        newInvoiceElements.billPreviewArea.classList.toggle('hidden', isFinalized);
        newInvoiceElements.finalizedBillView.classList.toggle('hidden', !isFinalized);
        newInvoiceElements.billActions.classList.toggle('hidden', isFinalized);
        newInvoiceElements.finalizedActions.classList.toggle('hidden', !isFinalized);
        if (isFinalized) {
            newInvoiceElements.finalizedBillView.innerHTML = newInvoiceElements.billPreviewArea.innerHTML;
            newInvoiceElements.finalizedBillView.querySelectorAll('input, button').forEach(el => {
                const parent = el.parentNode;
                if (el.classList.contains('qty-input')) parent.textContent = el.value;
                else if (el.classList.contains('price-input')) parent.textContent = `₹${parseFloat(el.value).toFixed(2)}`;
                else parent.innerHTML = '';
            });
        }
    }

    async function fetchAndRenderOldInvoices() {
        try {
            const response = await fetch('./fetch_invoices.php');
            const invoices = await response.json();
            oldInvoicesElements.body.innerHTML = '';
            invoices.forEach(inv => {
                const row = oldInvoicesElements.body.insertRow();
                row.innerHTML = `
                    <td>${inv.bill_number}</td>
                    <td>${new Date(inv.bill_date).toLocaleDateString('en-GB')}</td>
                    <td>${inv.customer_name}</td>
                    <td>${inv.customer_phone || 'N/A'}</td>
                    <td>${parseFloat(inv.discount_percent).toFixed(2)}%</td>
                    <td>₹${parseFloat(inv.total_amount).toFixed(2)}</td>
                    <td><button class="share-invoice-btn" data-bill-number="${inv.bill_number}">Share</button></td>`;
            });
            // Add event listeners for share buttons
            oldInvoicesElements.body.querySelectorAll('.share-invoice-btn').forEach(btn => {
                btn.addEventListener('click', () => {
                    const billNumber = btn.dataset.billNumber;
                    const link = `${window.location.origin}/bill.html?billNumber=${encodeURIComponent(billNumber)}`;
                    navigator.clipboard.writeText(link).then(() => {
                        showToast('Link copied to clipboard!');
                    }).catch(err => {
                        console.error('Failed to copy link:', err);
                        showToast('Failed to copy link. Please try again.');
                    });
                });
            });
        } catch (error) {
            console.error("Could not fetch old invoices:", error);
            showToast('Could not load invoices. Please check the connection.');
        }
    }

    function renderDropdown(products) {
        newInvoiceElements.productDropdown.innerHTML = '';
        products.forEach(p => {
            const div = document.createElement('div');
            div.textContent = `${p.name} (${p.tamilName}) - ₹${p.offerPrice}`;
            div.dataset.productId = p.id;
            div.addEventListener('click', () => {
                selectedProductForBill = p;
                newInvoiceElements.productSearch.value = `${p.name} (${p.tamilName})`;
                newInvoiceElements.productDropdown.classList.remove('show');
                newInvoiceElements.quantityInput.focus();
            });
            newInvoiceElements.productDropdown.appendChild(div);
        });
        newInvoiceElements.productDropdown.classList.add('show');
    }

    async function saveBill() {
        newInvoiceElements.saveBillBtn.textContent = 'Saving...';
        newInvoiceElements.saveBillBtn.disabled = true;
        try {
            if (isBillSaved) {
                showToast('Invoice already saved!');
                resetBill(); // Clear the page after showing the message
                return;
            }
            const response = await fetch('./save_invoice.php', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(currentBill)
            });
            const result = await response.json();
            if (!response.ok || result.status !== 'success') throw new Error(result.message);
            showToast('Invoice saved successfully!');
            isBillSaved = true; // Mark as saved after success
            resetBill(); // Reset the bill after successful save
        } catch (error) {
            showToast(`Error saving invoice: ${error.message}`);
        } finally {
            newInvoiceElements.saveBillBtn.textContent = 'Save';
            newInvoiceElements.saveBillBtn.disabled = false;
        }
    }

    // --- EVENT LISTENERS ---
    Object.keys(navLinks).forEach(key => navLinks[key].addEventListener('click', () => switchView(key)));
    Object.values(billingNavButtons).forEach(btn => btn.addEventListener('click', (e) => {
        const id = e.currentTarget.id;
        if (id === 'new-invoice-btn') showBillingPage('new');
        else if (id === 'old-invoices-btn') showBillingPage('old');
        else showBillingPage('nav');
    }));

    // Product Admin Page
    productAdminElements.tableBody.addEventListener('click', (e) => {
        const target = e.target.closest('button');
        if (!target) return;
        if (target.matches('.delete-btn')) handleDelete(e);
        if (target.matches('.no-stock-btn, .in-stock-btn')) handleToggleStock(e);
    });
    productAdminElements.tableBody.addEventListener('dblclick', handlePriceEdit);
    productAdminElements.addProductBtn.addEventListener('click', () => productAdminElements.modal.classList.remove('hidden'));
    productAdminElements.cancelBtn.addEventListener('click', () => productAdminElements.modal.classList.add('hidden'));
    productAdminElements.form.addEventListener('submit', handleAdminFormSubmit);
    productAdminElements.saveToDbBtn.addEventListener('click', saveProductsToServer);

    // New Invoice Page
    newInvoiceElements.customerName.addEventListener('input', (e) => {
        currentBill.customer.name = e.target.value;
        renderBill();
    });
    newInvoiceElements.customerPhone.addEventListener('input', (e) => {
        currentBill.customer.phone = e.target.value;
    });
    newInvoiceElements.discountPercent.addEventListener('input', (e) => {
        currentBill.discountPercent = parseFloat(e.target.value) || 0;
        renderBill();
    });
    newInvoiceElements.productSearch.addEventListener('keyup', (e) => {
        renderDropdown(allProducts.filter(p => p.name.toLowerCase().includes(e.target.value.toLowerCase())));
        if (e.key === 'Enter' && selectedProductForBill) {
            newInvoiceElements.quantityInput.focus();
        }
    });
    newInvoiceElements.dropdownArrow.addEventListener('click', () => renderDropdown(allProducts));
    document.addEventListener('click', (e) => {
        if (!e.target.closest('.searchable-dropdown')) newInvoiceElements.productDropdown.classList.remove('show');
    });
    newInvoiceElements.clearSelectionBtn.addEventListener('click', () => {
        selectedProductForBill = null;
        newInvoiceElements.productSearch.value = '';
        newInvoiceElements.quantityInput.value = 1;
    });
    newInvoiceElements.quantityInput.addEventListener('keyup', (e) => {
        if (e.key === 'Enter') {
            newInvoiceElements.addToBillBtn.click();
        }
    });
    newInvoiceElements.addToBillBtn.addEventListener('click', () => {
        const quantity = parseInt(newInvoiceElements.quantityInput.value);
        if (!selectedProductForBill || isNaN(quantity) || quantity < 1) return showToast('Please select a product and enter a valid quantity.');
        const existingItem = currentBill.items.find(item => item.id === selectedProductForBill.id);
        if (existingItem) {
            existingItem.quantity += quantity;
            existingItem.amount = existingItem.quantity * existingItem.price;
        } else {
            currentBill.items.push({
                id: selectedProductForBill.id,
                name: selectedProductForBill.name,
                quantity: quantity,
                price: selectedProductForBill.offerPrice,
                amount: quantity * selectedProductForBill.offerPrice
            });
        }
        renderBill();
        newInvoiceElements.clearSelectionBtn.click();
        newInvoiceElements.productSearch.focus();
    });
    newInvoiceElements.invoiceItemsBody.addEventListener('click', (e) => {
        if (e.target.closest('.remove-item-btn')) {
            currentBill.items.splice(e.target.closest('tr').dataset.index, 1);
            renderBill();
        }
    });
    let activeInput = null;
    let caretPos = 0;

    // Track which input is active and where the caret is
    newInvoiceElements.invoiceItemsBody.addEventListener('focusin', (e) => {
        if (e.target.classList.contains('qty-input') || e.target.classList.contains('price-input')) {
            activeInput = e.target;
            caretPos = e.target.selectionStart;
        }
    });

    newInvoiceElements.invoiceItemsBody.addEventListener('keyup', (e) => {
        if (activeInput) {
            caretPos = activeInput.selectionStart;
        }
    });

    newInvoiceElements.invoiceItemsBody.addEventListener('input', (e) => {
        const index = e.target.closest('tr').dataset.index;
        const item = currentBill.items[index];

        if (e.target.classList.contains('qty-input')) {
            item.quantity = parseInt(e.target.value) || 1;
        }
        if (e.target.classList.contains('price-input')) {
            item.price = parseFloat(e.target.value) || 0;
        }

        item.amount = item.quantity * item.price;

        // Re-render but restore focus + caret
        renderBill();
        if (activeInput) {
            const row = newInvoiceElements.invoiceItemsBody.querySelector(`tr[data-index="${index}"]`);
            const sameInput = row.querySelector(`.${e.target.classList[0]}`);
            if (sameInput) {
                sameInput.focus();
                sameInput.setSelectionRange(caretPos, caretPos);
            }
        }
    });
    newInvoiceElements.clearBillBtn.addEventListener('click', resetBill);
    newInvoiceElements.finalizeBillBtn.addEventListener('click', () => toggleFinalizedView(true));
    newInvoiceElements.editBillBtn.addEventListener('click', () => toggleFinalizedView(false));
    newInvoiceElements.saveBillBtn.addEventListener('click', saveBill);

    // New event listener for shareBillBtn
    newInvoiceElements.shareBillBtn.addEventListener('click', async () => {
        if (isBillSaved) {
            showToast('Invoice already saved!');
            return;
        }
        newInvoiceElements.shareBillBtn.textContent = 'Sharing...';
        newInvoiceElements.shareBillBtn.disabled = true;
        try {
            const response = await fetch('./save_invoice.php', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(currentBill)
            });
            const result = await response.json();
            if (!response.ok || result.status !== 'success') throw new Error(result.message);
            isBillSaved = true; // Mark as saved after success (no reset)
            const billNumber = currentBill.billNumber;
            const link = `${window.location.origin}/bill.html?billNumber=${encodeURIComponent(billNumber)}`;
            navigator.clipboard.writeText(link).then(() => {
                showToast('Link copied to clipboard!');
            }).catch(err => {
                console.error('Failed to copy link:', err);
                showToast('Failed to copy link. Please try again.');
            });
        } catch (error) {
            showToast(`Error saving and sharing invoice: ${error.message}`);
        } finally {
            newInvoiceElements.shareBillBtn.textContent = 'Share';
            newInvoiceElements.shareBillBtn.disabled = false;
        }
    });

    initApp();
});

// newInvoiceElements.customerPhone.addEventListener('blur', (e) => {
//     const phone = e.target.value.replace(/\D/g, ''); // Remove non-digits
//     if (phone.length < 10 || phone.length > 13) {
//         e.target.setCustomValidity('Phone number must be between 10 and 13 digits.');
//         showToast('Phone number must be between 10 and 13 digits.');
//     } else {
//         e.target.setCustomValidity('');
//         currentBill.customer.phone = phone;
//     }
// });


// function handleAdminFormSubmit(e) {
//     e.preventDefault();
//     const newProduct = {
//         id: -Date.now(),
//         name: productAdminElements.productName.value,
//         tamilName: productAdminElements.productTamilName.value,
//         originalPrice: parseFloat(productAdminElements.productOriginalPrice.value),
//         offerPrice: parseFloat(productAdminElements.productOfferPrice.value),
//         category: productAdminElements.productCategory.value,
//         inStock: 0, // Changed to 0 to indicate the product is in stock
//         productId: '',
//         latest: 1,
//         is_delete: 0
//     };
//     adminProducts.push(newProduct);
//     productAdminElements.modal.classList.add('hidden');
//     productAdminElements.form.reset();
//     renderAdminTable();
//     hasPendingChanges = true;
//     updateSaveButtonVisibility();
// }



// let activeInput = null;
// let caretPos = 0;
// let activeIndex = null;
// let activeClass = null;

// function setCursorBeforeDecimal(inputEl) {
//     const dotPos = inputEl.value.indexOf(".");
//     if (dotPos !== -1) {
//         inputEl.setSelectionRange(dotPos, dotPos);
//     } else {
//         // If no decimal yet, keep at end
//         inputEl.setSelectionRange(inputEl.value.length, inputEl.value.length);
//     }
// }

// newInvoiceElements.invoiceItemsBody.addEventListener('focusin', (e) => {
//     if (e.target.classList.contains('qty-input') || e.target.classList.contains('price-input')) {
//         activeInput = e.target;
//         caretPos = activeInput.selectionStart || activeInput.value.length;

//         const tr = activeInput.closest('tr');
//         activeIndex = tr ? tr.dataset.index : null;
//         activeClass = activeInput.classList.contains('qty-input') ? 'qty-input' : 'price-input';

//         setTimeout(() => {
//             if (activeInput) {
//                 if (activeClass === 'price-input') {
//                     setCursorBeforeDecimal(activeInput);
//                 } else {
//                     activeInput.setSelectionRange(activeInput.value.length, activeInput.value.length);
//                 }
//             }
//         }, 0);
//     }
// });

// newInvoiceElements.invoiceItemsBody.addEventListener('keyup', (e) => {
//     if (activeInput) {
//         caretPos = activeInput.selectionStart || activeInput.value.length;
//     }
// });

// newInvoiceElements.invoiceItemsBody.addEventListener('input', (e) => {
//     const tr = e.target.closest('tr');
//     if (!tr) return;
//     const index = tr.dataset.index;
//     const item = currentBill.items[index];

//     if (e.target.classList.contains('qty-input')) {
//         const v = e.target.value.replace(/[^\d]/g, '');
//         item.quantity = parseInt(v, 10) || 1;
//     }
//     if (e.target.classList.contains('price-input')) {
//         const v = e.target.value.replace(/[^0-9.\-]/g, '');
//         item.price = parseFloat(v) || 0;
//     }

//     item.amount = item.quantity * item.price;

//     const restoreIndex = index;
//     const restoreClass = e.target.classList.contains('qty-input') ? 'qty-input' : 'price-input';

//     renderBill();

//     setTimeout(() => {
//         const rowAfter = newInvoiceElements.invoiceItemsBody.querySelector(`tr[data-index="${restoreIndex}"]`);
//         if (!rowAfter) return;
//         const sameInput = rowAfter.querySelector(`.${restoreClass}`);
//         if (sameInput) {
//             sameInput.focus();
//             if (restoreClass === 'price-input') {
//                 setCursorBeforeDecimal(sameInput);
//             } else {
//                 const len = sameInput.value ? sameInput.value.length : 0;
//                 sameInput.setSelectionRange(len, len);
//             }
//         }
//     }, 0);
// });