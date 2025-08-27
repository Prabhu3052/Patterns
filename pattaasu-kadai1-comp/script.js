document.addEventListener("DOMContentLoaded", () => {
    // --- STATE MANAGEMENT ---
    allProducts = JSON.parse(localStorage.getItem("allProducts")) || [];
    let adminProducts = [];
    let idsToDelete = [];
    currentBill = createNewBill();
    let selectedProductForBill = null;
    let hasPendingChanges = false;
    let isBillSaved = false;
    let toastContainer;
     allOrders = JSON.parse(localStorage.getItem("allOrders")) || [];
    let additionalProducts = [];
    let originalAdditionalProducts = [];
    let hasPendingAdditionalChanges = false;
  
    // --- ELEMENT SELECTORS ---
    const views = {
      enquiry: document.getElementById("enquiry-view"),
      products: document.getElementById("products-management-view"),
      billing: document.getElementById("billing-management-view"),
      billingNav: document.getElementById("billing-nav"),
      newInvoice: document.getElementById("new-invoice-creator"),
      oldInvoices: document.getElementById("old-invoices-list"),
      additionalProducts: document.getElementById(
        "additional-products-details-view"
      ),
      orders: document.getElementById("orders-view"),
    };
  
    const navLinks = {
      enquiry: document.getElementById("nav-enquiry"),
      products: document.getElementById("nav-products"),
      billing: document.getElementById("nav-billing"),
      additionalProducts: document.getElementById(
        "nav-products-additional-details"
      ),
      orders: document.getElementById("nav-orders"),
    };
  
    const productAdminElements = {
      tableBody: document.getElementById("admin-table-body"),
      addProductBtn: document.getElementById("add-product-btn"),
      saveToDbBtn: document.getElementById("save-to-db-btn"),
      modal: document.getElementById("product-modal"),
      modalTitle: document.getElementById("modal-title"),
      form: document.getElementById("product-form"),
      cancelBtn: document.getElementById("cancel-btn"),
      productName: document.getElementById("product-name"),
      productTamilName: document.getElementById("product-tamil-name"),
      productOriginalPrice: document.getElementById("product-original-price"),
      productOfferPrice: document.getElementById("product-offer-price"),
      productCategory: document.getElementById("product-category"),
      productQuantities: document.getElementById("product-quantities"),
      productImage: document.getElementById("product-image"),
      // productContents: document.getElementById("product-contents"),
      productVideo: document.getElementById("product-video"),
      productInstagram: document.getElementById("product-instagram"),
      productOffer: document.getElementById("product-offer"),
    };
  
    const billingNavButtons = {
      newInvoice: document.getElementById("new-invoice-btn"),
      oldInvoices: document.getElementById("old-invoices-btn"),
      backToBilling1: document.getElementById("back-to-billing-btn"),
      backToBilling2: document.getElementById("back-to-billing-btn2"),
      newBill: document.getElementById("new-bill-btn"),
    };
  
    const newInvoiceElements = {
      customerName: document.getElementById("customer-name"),
      customerPhone: document.getElementById("customer-phone"),
      generateLinkBtn: document.getElementById("generate-link-btn"),
      generatedLink: document.getElementById("generated-link"),
      discountPercent: document.getElementById("bill-discount-percent"),
      productSearch: document.getElementById("product-search"),
      productDropdown: document.getElementById("product-dropdown"),
      dropdownArrow: document.querySelector(".dropdown-arrow"),
      quantityInput: document.getElementById("product-quantity"),
      clearSelectionBtn: document.getElementById("clear-selection-btn"),
      addToBillBtn: document.getElementById("add-to-bill-btn"),
      invoiceItemsBody: document.getElementById("invoice-items-body"),
      billCustomerName: document.querySelector(
        "#bill-customer-name-display span"
      ),
      billDate: document.getElementById("bill-date-display"),
      billNumber: document.getElementById("bill-number-display"),
      productCount: document.getElementById("bill-product-count"),
      productQuantity: document.getElementById("bill-product-quantity"),
      subTotal: document.getElementById("bill-sub-total"),
      discountAmount: document.getElementById("bill-discount-amount"),
      total: document.getElementById("bill-total"),
      billActions: document.getElementById("bill-actions"),
      finalizedActions: document.getElementById("finalized-actions"),
      clearBillBtn: document.getElementById("clear-bill-btn"),
      finalizeBillBtn: document.getElementById("finalize-bill-btn"),
      editBillBtn: document.getElementById("edit-bill-btn"),
      shareBillBtn: document.getElementById("share-bill-btn"),
      saveBillBtn: document.getElementById("save-bill-btn"),
      savedText: document.getElementById("saved-text"),
      printBillBtn: document.getElementById("print-bill-btn"),
      billPreviewArea: document.getElementById("bill-preview-area"),
      finalizedBillView: document.getElementById("finalized-bill-view"),
    };
  
    const oldInvoicesElements = {
      body: document.getElementById("old-invoices-body"),
    };
  
    const enquiryElements = {
      productList: document.getElementById("enquiry-product-list"),
    };
  
    const additionalProductElements = {
      tableBody: document.getElementById("additional-products-table-body"),
      saveToDbBtn: document.getElementById("save-to-db-additional-btn"),
      productdetailmodal: document.getElementById("additional-product-modal"),
      modalTitle: document.getElementById("additional-modal-title"),
      form: document.getElementById("additional-product-form"),
      cancelBtn: document.getElementById("additional-cancel-btn"),
      productId: document.getElementById("additional-product-product-id"),
      image: document.getElementById("additional-product-image"),
      // contents: document.getElementById("additional-product-contents"),
      video: document.getElementById("additional-product-video"),
      instagram: document.getElementById("additional-product-instagram"),
      offer: document.getElementById("additional-product-offer"),
    };
  
    const ordersElements = {
      navPending: document.getElementById("nav-pending-orders"),
      navCompleted: document.getElementById("nav-completed-orders"),
      pendingList: document.getElementById("pending-orders-list"),
      completedList: document.getElementById("completed-orders-list"),
      pendingTableBody: document.getElementById("pending-orders-table-body"),
      completedTableBody: document.getElementById("completed-orders-table-body"),
      pendingCount: document.getElementById("pending-count"),
      completedCount: document.getElementById("completed-count"),
    };
  
    // --- CUSTOM TOAST FUNCTIONS ---
    function createToastContainer() {
      const container = document.createElement("div");
      container.id = "toast-container";
      document.body.appendChild(container);
      toastContainer = container;
    }
  
    function showToast(message) {
      const toast = document.createElement("div");
      toast.classList.add("toast");
      toast.textContent = message;
      toastContainer.appendChild(toast);
      setTimeout(() => {
        toast.classList.add("show");
      }, 100);
      setTimeout(() => {
        toast.classList.remove("show");
        setTimeout(() => {
          toast.remove();
        }, 300);
      }, 3000);
    }
  
    // --- CONFIRM MODAL SETUP ---
    function setupConfirmModal() {
      let confirmModal = document.getElementById("confirm-modal");
      if (!confirmModal) {
        confirmModal = document.createElement("div");
        confirmModal.id = "confirm-modal";
        confirmModal.classList.add("modal", "hidden");
        confirmModal.innerHTML = `
                  <div class="modal-content">
                      <p>Clear current unsaved bill and generate a new one?</p>
                      <button id="confirm-yes">Yes</button>
                      <button id="confirm-no">No</button>
                  </div>
              `;
        document.body.appendChild(confirmModal);
  
        confirmModal.addEventListener("click", (e) => {
          if (e.target === confirmModal) {
            confirmModal.classList.add("hidden");
          }
        });
      }
      return confirmModal;
    }
  
    const confirmModal = setupConfirmModal();
    const confirmYes = document.getElementById("confirm-yes");
    const confirmNo = document.getElementById("confirm-no");
  
    let confirmCallback = null;
  
    confirmYes.addEventListener("click", () => {
      if (confirmCallback) confirmCallback(true);
      confirmModal.classList.add("hidden");
    });
  
    confirmNo.addEventListener("click", () => {
      if (confirmCallback) confirmCallback(false);
      confirmModal.classList.add("hidden");
    });
  
    function showConfirmModal(callback) {
      confirmCallback = callback;
      confirmModal.classList.remove("hidden");
    }
  
    // --- INITIALIZATION ---
    async function initApp() {
      createToastContainer();
      console.log("Orders view element:", views.orders);
      console.log("Nav link for orders:", navLinks.orders);
      await fetchProducts();
      await fetchAdditionalProducts();
      idsToDelete = JSON.parse(localStorage.getItem("crackerDeletions")) || [];
      updateSaveButtonVisibility();
      switchView(localStorage.getItem("lastView") || "billing");
      setupShareModal();
      setupMutationObserver();
    }
  
    async function fetchProducts() {
      try {
        const response = await fetch("./fetch_products.php", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
        });
        if (!response.ok)
          throw new Error(`Network response failed: ${response.status}`);
        const data = await response.json();
        if (!Array.isArray(data)) throw new Error("Invalid products data format");
        localStorage.setItem("allProducts", JSON.stringify(data));
        allProducts = data;
        adminProducts = JSON.parse(localStorage.getItem("allProducts")) || [];
        console.log("Fetched allProducts:", allProducts);
      } catch (error) {
        console.error("Failed to fetch products:", error);
        showToast("Could not load product data: " + error.message);
      }
    }
  
    async function fetchAdditionalProducts() {
      try {
        const response = await fetch("./fetch_additional_products.php", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
        });
        if (!response.ok)
          throw new Error(`HTTP error! Status: ${response.status}`);
        const data = await response.json();
        if (!Array.isArray(data))
          throw new Error("Invalid data format: Expected an array");
        localStorage.setItem("additionalProducts", JSON.stringify(data));
        additionalProducts = data;
        originalAdditionalProducts = JSON.parse(JSON.stringify(data));
        console.log("Fetched additional products:", additionalProducts);
        renderAdditionalProductsTable();
      } catch (error) {
        console.error("Failed to fetch additional products:", error);
        showToast("Could not load additional product data: " + error.message);
      }
    }
  
    // --- VIEW MANAGEMENT ---
    function switchView(viewName) {
      Object.values(views).forEach((v) => v && v.classList.remove("active"));
      Object.values(navLinks).forEach((l) => l && l.classList.remove("active"));
      if (views[viewName]) views[viewName].classList.add("active");
      if (navLinks[viewName]) navLinks[viewName].classList.add("active");
      localStorage.setItem("lastView", viewName);
      if (viewName === "enquiry") renderEnquiryTable();
      if (viewName === "products") renderAdminTable();
      if (viewName === "billing") showBillingPage("nav");
      if (viewName === "additionalProducts") {
        console.log("Switching to additional products details, rendering table");
        renderAdditionalProductsTable();
      }
      if (viewName === "orders") {
        console.log("Switching to orders, rendering table");
        fetchAndRenderOrders();
      }
    }
  
    function showBillingPage(pageName) {
      try {
        console.log("Switching to billing page:", pageName);
        console.log("views:", views);
        if (!views.newInvoice) {
          console.error("New Invoice element not found");
          showToast("Error: New Invoice page not found in DOM");
          return;
        }
        views.billingNav.classList.add("hidden");
        views.newInvoice.classList.add("hidden");
        views.oldInvoices.classList.add("hidden");
        views.billingNav.classList.toggle("hidden", pageName !== "nav");
        views.newInvoice.classList.toggle("hidden", pageName !== "new");
        views.oldInvoices.classList.toggle("hidden", pageName !== "old");
        console.log("New invoice classList:", views.newInvoice.classList);
        if (pageName === "new" && currentBill.isNew && currentBill.items.length === 0) {
          resetBill();
      }
        if (pageName === "old") fetchAndRenderOldInvoices();
      } catch (error) {
        console.error("Error switching billing page:", error);
        showToast("Failed to switch to billing page: " + error.message);
      }
    }
  
    // --- BILL MANAGEMENT ---
    async function getNextBillNumber() {
      try {
        const response = await fetch("./fetch_invoices.php?next_bill=1");
        if (!response.ok) throw new Error("Failed to fetch next bill number");
        return await response.text();
      } catch (error) {
        console.error(error);
        showToast("Could not generate bill number. Using fallback.");
        return "B" + Date.now();
      }
    }
  
    function createNewBill() {
      return {
        billNumber: "Draft",
        date: new Date().toISOString().split("T")[0],
        customer: { name: "", phone: "" },
        discountPercent: 0,
        items: [],
        calculations: {
          productCount: 0,
          productQuantity: 0,
          subTotal: 0,
          discountAmount: 0,
          total: 0,
        },
        isFinalized: false,
        isNew: true,
        fromOrderId: null,
      };
    }
  
    async function resetBill() {
      currentBill = createNewBill();
      isBillSaved = false;
      newInvoiceElements.customerName.value = "";
      newInvoiceElements.customerPhone.value = "";
      newInvoiceElements.discountPercent.value = 0;
      newInvoiceElements.generatedLink.value = "";
      newInvoiceElements.generateLinkBtn.innerHTML =
        '<i class="fas fa-link"></i> Copy';
      newInvoiceElements.shareBillBtn.classList.add("hidden");
      newInvoiceElements.printBillBtn.classList.add("hidden");
      newInvoiceElements.saveBillBtn.classList.remove("hidden");
      newInvoiceElements.savedText.classList.add("hidden");
      toggleFinalizedView(false);
      renderBill();
    }
  
    function calculateBillTotals() {
      currentBill.calculations.productCount = currentBill.items.length;
      currentBill.calculations.productQuantity = currentBill.items.reduce(
        (sum, item) => sum + item.quantity,
        0
      );
      currentBill.calculations.subTotal = currentBill.items.reduce(
        (sum, item) => sum + item.amount,
        0
      );
      currentBill.calculations.discountAmount =
        (currentBill.calculations.subTotal * currentBill.discountPercent) / 100;
      currentBill.calculations.total =
        currentBill.calculations.subTotal -
        currentBill.calculations.discountAmount;
    }
  
    function renderBill() {
      try {
        console.log("Rendering bill with currentBill:", currentBill);
        console.log("newInvoiceElements:", newInvoiceElements);
        if (
          !newInvoiceElements.customerName ||
          !newInvoiceElements.billCustomerName ||
          !newInvoiceElements.invoiceItemsBody
        ) {
          console.error("Bill elements missing");
          showToast("Error: Bill preview elements not found");
          return;
        }
        calculateBillTotals();
        const calcs = currentBill.calculations;
        newInvoiceElements.customerName.value = currentBill.customer.name || "";
        newInvoiceElements.customerPhone.value = currentBill.customer.phone || "";
        newInvoiceElements.billCustomerName.textContent =
          currentBill.customer.name || "";
        newInvoiceElements.billDate.textContent = new Date(
          currentBill.date
        ).toLocaleDateString("en-GB");
        newInvoiceElements.billNumber.textContent =
          currentBill.billNumber === "Draft" ? "Draft" : currentBill.billNumber;
        newInvoiceElements.productCount.textContent = calcs.productCount;
        newInvoiceElements.productQuantity.textContent = calcs.productQuantity;
        newInvoiceElements.subTotal.textContent = `₹${calcs.subTotal.toFixed(2)}`;
        newInvoiceElements.discountAmount.textContent = `₹${calcs.discountAmount.toFixed(
          2
        )}`;
        newInvoiceElements.total.textContent = `₹${calcs.total.toFixed(2)}`;
        newInvoiceElements.invoiceItemsBody.innerHTML = "";
        currentBill.items.forEach((item, index) => {
          const row = newInvoiceElements.invoiceItemsBody.insertRow();
          row.dataset.index = index;
          const isEditable = !currentBill.isFinalized;
          row.innerHTML = `
                      <td>${item.name}</td>
                      <td>${
                        isEditable
                          ? `<input type="number" class="qty-input" value="${item.quantity}" min="1">`
                          : item.quantity
                      }</td>
                      <td>${
                        isEditable
                          ? `<input type="number" class="price-input" value="${item.price.toFixed(
                              2
                            )}" step="0.25" min="0">`
                          : `₹${item.price.toFixed(2)}`
                      }</td>
                      <td>₹${item.amount.toFixed(2)}</td>
                      <td>${
                        isEditable
                          ? `<button class="remove-item-btn"><i class="fas fa-trash-alt"></i></button>`
                          : ""
                      }</td>`;
        });
        newInvoiceElements.billActions.classList.toggle(
          "hidden",
          currentBill.items.length === 0 || currentBill.isFinalized
        );
      } catch (error) {
        console.error("Error rendering bill:", error);
        showToast("Failed to render bill: " + error.message);
      }
    }
  
    // --- ORDERS LOGIC ---
    async function fetchAndRenderOrders() {
      try {
        const response = await fetch("./fetch_orders.php");
        console.log("Fetch orders response:", response);
        if (!response.ok)
          throw new Error(`Network response failed: ${response.status}`);
        const data = await response.json();
        console.log("Fetched orders data:", data);
        if (data.status !== "success")
          throw new Error(data.message || "Invalid response");
        if (!Array.isArray(data.orders))
          throw new Error("Orders data is not an array");
        localStorage.setItem("allOrders", JSON.stringify(data.orders));
        allOrders = data.orders;
        ordersElements.pendingCount.textContent = data.pending_count || 0;
        ordersElements.completedCount.textContent = data.completed_count || 0;
        const pendingOrders = data.orders.filter((o) => o.complete === 0);
        const completedOrders = data.orders.filter((o) => o.complete === 1);
        console.log("Pending orders:", pendingOrders);
        console.log("Completed orders:", completedOrders);
        renderOrdersTable(ordersElements.pendingTableBody, pendingOrders, false);
        renderOrdersTable(
          ordersElements.completedTableBody,
          completedOrders,
          true
        );
        showOrderList("pending");
      } catch (error) {
        console.error("Failed to fetch orders:", error);
        showToast("Could not load order data: " + error.message);
      }
    }
  
    function renderOrdersTable(tableBody, orders, isCompleted) {
      try {
        console.log(
          `Rendering ${isCompleted ? "completed" : "pending"} orders table:`,
          orders
        );
        tableBody.innerHTML = "";
        if (!orders || orders.length === 0) {
          tableBody.innerHTML = `<tr><td colspan="7">No ${
            isCompleted ? "completed" : "pending"
          } orders to display.</td></tr>`;
          return;
        }
        orders.forEach((order, index) => {
          console.log("Order ID:", order.orderid, "Type:", typeof order.orderid);
          const row = tableBody.insertRow();
          row.innerHTML = `
                      <td>${index + 1}</td>
                      <td>${order.orderid}</td>
                      <td>${order.name || "N/A"}</td>
                      <td>${order.phone_number || "N/A"}</td>
                      <td>${order.email || "N/A"}</td>
                      <td>${new Date(order.order_date).toLocaleDateString(
                        "en-GB"
                      )}</td>
                      <td>${
                        isCompleted
                          ? '<button class="completed-btn" disabled>Completed</button>'
                          : `<button class="move-to-bill-btn button button-primary" data-orderid="${order.orderid}">Move to Bill</button>`
                      }</td>
                  `;
        });
        if (!isCompleted) {
          tableBody.querySelectorAll(".move-to-bill-btn").forEach((btn) => {
            btn.addEventListener("click", () => {
              const orderid = btn.dataset.orderid;
              console.log("Clicked orderid:", orderid, "Type:", typeof orderid);
              console.log("allOrders:", allOrders);
              const order = allOrders.find((o) => {
                console.log(
                  "Comparing orderid:",
                  o.orderid,
                  "Type:",
                  typeof o.orderid
                );
                return String(o.orderid) === String(orderid);
              });
              console.log("Found order:", order);
              if (order) {
                if (
                  currentBill.billNumber === "Draft" &&
                  (currentBill.items.length > 0 ||
                    currentBill.customer.name !== "" ||
                    currentBill.customer.phone !== "")
                ) {
                  showConfirmModal((confirmed) => {
                    if (confirmed) {
                      moveOrderToBill(order);
                    }
                  });
                } else {
                  moveOrderToBill(order);
                }
              } else {
                showToast("Error: Order not found.");
              }
            });
          });
        }
      } catch (error) {
        console.error(
          `Error rendering ${
            isCompleted ? "completed" : "pending"
          } orders table:`,
          error
        );
        showToast(
          `Failed to render ${
            isCompleted ? "completed" : "pending"
          } orders table: ${error.message}`
        );
      }
    }
  
    async function moveOrderToBill(order) {
      try {
        console.log("Moving order:", order);
        console.log("allProducts:", allProducts);
        resetBill();
        console.log("After resetBill, currentBill:", currentBill);
        currentBill.customer.name = order.name || "";
        currentBill.customer.phone = order.phone_number || "";
        currentBill.fromOrderId = order.orderid;
        console.log("After assign:", currentBill); 
        if (!order.items || !Array.isArray(order.items)) {
          console.warn("Order has no valid items:", order);
          showToast("Warning: Order has no items");
          currentBill.items = [];
        } else {
          currentBill.items = order.items.map((item) => {
             productMatch = allProducts.find(
              (p) => String(p.productId) === String(item.product_id)
            );
            console.log("Product ID:", item.product_id, "Match:", productMatch);
            return {
              id: productMatch ? productMatch.productId : item.product_id,
              name: productMatch
                ? `${productMatch.name} (${productMatch.tamilName})`
                : `Product ${item.product_id}`,
              quantity: parseInt(item.quantity) || 1,
              price: parseFloat(item.price) || 0,
              amount:
                (parseInt(item.quantity) || 1) * (parseFloat(item.price) || 0),
            };
          });
        }
        console.log("Populated currentBill:", currentBill);
        switchView("billing");
        showBillingPage("new");
        renderBill();
        showToast(`Order ${order.orderid} moved to a new bill. Please save it.`);
      } catch (error) {
        console.error("Error in moveOrderToBill:", error);
        showToast("Failed to move order to bill: " + error.message);
      }
    }
  
    function showOrderList(type) {
      ordersElements.pendingList.classList.toggle("hidden", type !== "pending");
      ordersElements.completedList.classList.toggle(
        "hidden",
        type !== "completed"
      );
      ordersElements.navPending.classList.toggle("active", type === "pending");
      ordersElements.navCompleted.classList.toggle(
        "active",
        type === "completed"
      );
    }
  
    // --- MUTATION OBSERVER FOR SCROLLING ---
    function setupMutationObserver() {
      const invoiceBody = document.getElementById("invoice-items-body");
      const billActions = document.getElementById("bill-actions");
      if (!invoiceBody || !billActions) {
        console.error("Invoice items body or bill actions not found");
        showToast("Error: Required bill elements missing");
        return;
      }
      const observer = new MutationObserver((mutationsList) => {
        for (const mutation of mutationsList) {
          if (mutation.type === "childList" && mutation.addedNodes.length > 0) {
            billActions.scrollIntoView({ behavior: "smooth", block: "nearest" });
          }
        }
      });
      observer.observe(invoiceBody, { childList: true });
    }
  
    // --- OTHER EXISTING FUNCTIONS ---
    function toggleFinalizedView(isFinalized) {
      currentBill.isFinalized = isFinalized;
      newInvoiceElements.billPreviewArea.classList.toggle("hidden", isFinalized);
      newInvoiceElements.finalizedBillView.classList.toggle(
        "hidden",
        !isFinalized
      );
      newInvoiceElements.billActions.classList.toggle(
        "hidden",
        isFinalized || currentBill.items.length === 0
      );
      newInvoiceElements.finalizedActions.classList.toggle(
        "hidden",
        !isFinalized
      );
      newInvoiceElements.editBillBtn.classList.toggle("hidden", isBillSaved);
      if (isFinalized) {
        newInvoiceElements.finalizedBillView.innerHTML =
          newInvoiceElements.billPreviewArea.innerHTML;
        const headerRow =
          newInvoiceElements.finalizedBillView.querySelector("thead tr");
        if (headerRow && headerRow.cells.length > 0) {
          headerRow.deleteCell(-1);
        }
        const rows =
          newInvoiceElements.finalizedBillView.querySelectorAll("tbody tr");
        rows.forEach((row) => {
          if (row.cells.length > 0) {
            row.deleteCell(-1);
          }
        });
        newInvoiceElements.finalizedBillView
          .querySelectorAll("input")
          .forEach((el) => {
            const parent = el.parentNode;
            if (el.classList.contains("qty-input")) {
              parent.textContent = el.value;
            } else if (el.classList.contains("price-input")) {
              parent.textContent = `₹${parseFloat(el.value).toFixed(2)}`;
            }
          });
        newInvoiceElements.finalizedBillView
          .querySelectorAll("button")
          .forEach((el) => {
            el.parentNode.innerHTML = "";
          });
      }
      newInvoiceElements.shareBillBtn.classList.toggle("hidden", !isBillSaved);
      newInvoiceElements.printBillBtn.classList.toggle("hidden", !isBillSaved);
      newInvoiceElements.saveBillBtn.classList.toggle("hidden", isBillSaved);
      newInvoiceElements.savedText.classList.toggle("hidden", !isBillSaved);
    }
  
    async function saveBill() {
      newInvoiceElements.saveBillBtn.textContent = "Saving...";
      newInvoiceElements.saveBillBtn.disabled = true;
      if (currentBill.billNumber === "Draft") {
        currentBill.billNumber = await getNextBillNumber();
      }
      const url = currentBill.isNew
        ? "./save_invoice.php"
        : "./update_invoice.php";
      try {
        const response = await fetch(url, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(currentBill),
        });
        const result = await response.json();
        if (!response.ok || result.status !== "success")
          throw new Error(result.message);
        showToast("Invoice saved successfully!");
        isBillSaved = true;
        toggleFinalizedView(true);
        if (currentBill.fromOrderId) {
          try {
            const updateResponse = await fetch("./update_order_status.php", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ orderid: currentBill.fromOrderId }),
            });
            if (!updateResponse.ok) throw new Error("Failed to update order status");
            console.log(`Order ${currentBill.fromOrderId} status updated to completed.`);
            showToast(`Order ${currentBill.fromOrderId} marked as completed.`);
            currentBill.fromOrderId = null;
          } catch (error) {
            console.error("Failed to update order status:", error);
            showToast("Error updating order status. Manual update may be required.");
          }
        }
      } catch (error) {
        showToast(`Error saving invoice: ${error.message}`);
      } finally {
        newInvoiceElements.saveBillBtn.textContent = "Save";
        newInvoiceElements.saveBillBtn.disabled = false;
      }
    }
  
    async function loadBill(billNumber, editable) {
      try {
        const response = await fetch(
          `./fetch_old_details.php?billNumber=${encodeURIComponent(billNumber)}`
        );
        if (!response.ok) throw new Error("Failed to load invoice");
        const data = await response.json();
        if (data.status === "error") throw new Error(data.message);
        // const allProducts = JSON.parse(localStorage.getItem('allProducts')) || [];
        console.log(`allproducts` + allProducts);
        items = data.items.map((item) => {
          productMatch = allProducts.find((p) => p.productId === item.productId);
          return {
            id: item.productId,
            name: productMatch
              ? `${productMatch.name} (${productMatch.tamilName})`
              : `Unknown Product (${item.productId})`,
            //   name: item.name,
            quantity: item.quantity,
            price: parseFloat(item.price),
            amount: item.amount,
          };
        });
        currentBill = {
          billNumber: data.invoice.billNumber,
          date: data.invoice.billDate,
          customer: {
            name: data.invoice.customerName,
            phone: data.invoice.customerPhone,
          },
          discountPercent: parseFloat(data.invoice.discountPercent),
          items: items,
          calculations: data.calculations,
          isFinalized: !editable,
          isNew: false,
          fromOrderId: null,
        };
        isBillSaved = !editable;
        newInvoiceElements.customerName.value = currentBill.customer.name;
        newInvoiceElements.customerPhone.value = currentBill.customer.phone;
        newInvoiceElements.discountPercent.value = currentBill.discountPercent;
        showBillingPage("new");
        renderBill();
        toggleFinalizedView(!editable);
      } catch (error) {
        console.error("Failed to load bill:", error);
        showToast("Could not load the invoice. Please try again.");
      }
    }
  
    function renderAdditionalProductsTable() {
      const tableBody = additionalProductElements.tableBody;
      tableBody.innerHTML = "";
      if (!additionalProducts || additionalProducts.length === 0) {
        tableBody.innerHTML = `<tr><td colspan="7">No products to manage.</td></tr>`;
        return;
      }
      additionalProducts.forEach((product) => {
        const originalProduct = originalAdditionalProducts.find(
          (p) => p.product_id === product.product_id
        );
        const isModified =
          JSON.stringify(product) !== JSON.stringify(originalProduct);
        const row = tableBody.insertRow();
        row.className = isModified ? "locally-modified" : "";
        row.innerHTML = `
                  <td>${product.product_id || "N/A"}</td>
                  <td>${product.name || "N/A"}</td>
                  <td>${product.image || ""}</td>
                  
                  <td>${product.video || ""}</td>
                  <td>${product.instagram || ""}</td>
                  <td>${product.offer || 0}%</td>
                  <td><button class="edit-additional-btn button button-primary" data-product-id="${
                    product.product_id
                  }"><i class="fas fa-edit"></i> Edit</button></td>
              `;
      });
      // <td>${product.contents || ""}</td>
      additionalProductElements.tableBody
        .querySelectorAll(".edit-additional-btn")
        .forEach((btn) => {
          btn.addEventListener("click", handleAdditionalEdit);
        });
      updateSaveButtonVisibility();
    }
  
    function handleAdditionalEdit(e) {
      const button = e.target.closest("button");
      if (!button) return;
      const productId = button.dataset.productId;
      const product = additionalProducts.find((p) => p.product_id === productId);
      if (!product) {
        showToast("Product not found!");
        return;
      }
      additionalProductElements.productId.value = product.product_id || "";
      additionalProductElements.image.value = product.image || "";
      // additionalProductElements.contents.value = product.contents || "";
      additionalProductElements.video.value = product.video || "";
      additionalProductElements.instagram.value = product.instagram || "";
      additionalProductElements.offer.value = product.offer || 0;
      additionalProductElements.modalTitle.textContent = `Edit Product ${product.product_id}`;
      additionalProductElements.productdetailmodal.classList.remove("hidden");
      const saveBtn = document.getElementById("additional-save-product-btn");
      const formInputs =
        additionalProductElements.form.querySelectorAll("input, textarea");
      const initialValues = {
        image: product.image || "",
        // contents: product.contents || "",
        video: product.video || "",
        instagram: product.instagram || "",
        offer: product.offer || 0,
      };
      document.getElementById("additional-product-modal").classList.add("show");
      const checkChanges = () => {
        const hasChanged =
          additionalProductElements.image.value !== initialValues.image ||
          // additionalProductElements.contents.value !== initialValues.contents ||
          additionalProductElements.video.value !== initialValues.video ||
          additionalProductElements.instagram.value !== initialValues.instagram ||
          parseInt(additionalProductElements.offer.value) !==
            parseInt(initialValues.offer);
        if (hasChanged) {
          saveBtn.disabled = false;
          saveBtn.style.opacity = "1";
        } else {
          saveBtn.disabled = true;
          saveBtn.style.opacity = "0.5";
        }
      };
      formInputs.forEach((input) =>
        input.addEventListener("input", checkChanges)
      );
      checkChanges();
    }
  
    additionalProductElements.tableBody.addEventListener("click", (e) => {
      if (e.target.closest(".edit-additional-btn")) {
        handleAdditionalEdit(e);
      }
    });
  
    additionalProductElements.form.addEventListener("submit", (e) => {
      e.preventDefault();
      const productId = additionalProductElements.productId.value;
      const updatedProduct = {
        product_id: productId,
        image: additionalProductElements.image.value || "",
        // contents: additionalProductElements.contents.value || "",
        video: additionalProductElements.video.value || "",
        instagram: additionalProductElements.instagram.value || "",
        offer: parseInt(additionalProductElements.offer.value) || 0,
      };
      const index = additionalProducts.findIndex(
        (p) => p.product_id == productId
      );
      if (index !== -1) {
        additionalProducts[index] = updatedProduct;
        hasPendingAdditionalChanges = true;
        updateSaveButtonVisibility();
        renderAdditionalProductsTable();
        additionalProductElements.productdetailmodal.classList.add("hidden");
        showToast("Product details updated locally. Save changes to persist.");
      } else {
        showToast("Error: Product not found for updating.");
      }
    });
  
    additionalProductElements.cancelBtn.addEventListener("click", () => {
      additionalProductElements.productdetailmodal.classList.add("hidden");
      additionalProductElements.form.reset();
    });
  
    async function saveAdditionalProductsToServer() {
      additionalProductElements.saveToDbBtn.textContent = "Saving...";
      additionalProductElements.saveToDbBtn.disabled = true;
      try {
        const response = await fetch("./save_additional_products.php", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(additionalProducts),
        });
        const result = await response.json();
        if (!response.ok || result.status !== "success") {
          throw new Error(result.message || "Failed to save additional products");
        }
        showToast("Additional products saved successfully!");
        hasPendingAdditionalChanges = false;
        originalAdditionalProducts = JSON.parse(
          JSON.stringify(additionalProducts)
        );
        updateSaveButtonVisibility();
      } catch (error) {
        console.error("Error saving additional products:", error);
        showToast(`Error saving additional products: ${error.message}`);
      } finally {
        additionalProductElements.saveToDbBtn.textContent = "Save Changes to DB";
        additionalProductElements.saveToDbBtn.disabled = false;
        fetchAdditionalProducts();
      }
    }
  
    additionalProductElements.saveToDbBtn.addEventListener(
      "click",
      saveAdditionalProductsToServer
    );
  
    // --- EVENT LISTENERS ---
    Object.keys(navLinks).forEach((key) =>
      navLinks[key].addEventListener("click", () => switchView(key))
    );
  
    ordersElements.navPending.addEventListener("click", () =>
      showOrderList("pending")
    );
    ordersElements.navCompleted.addEventListener("click", () =>
      showOrderList("completed")
    );
  
    Object.values(billingNavButtons).forEach((btn) =>
      btn.addEventListener("click", (e) => {
        const id = e.currentTarget.id;
        if (id === "new-invoice-btn") showBillingPage("new");
        else if (id === "old-invoices-btn") showBillingPage("old");
        else if (id === "new-bill-btn") {
          if (
            currentBill.billNumber === "Draft" &&
            (currentBill.items.length > 0 ||
              currentBill.customer.name !== "" ||
              currentBill.customer.phone !== "")
          ) {
            showConfirmModal((confirmed) => {
              if (confirmed) {
                resetBill();
              }
            });
          } else {
            resetBill();
          }
        } else showBillingPage("nav");
      })
    );
  
    productAdminElements.tableBody.addEventListener("click", (e) => {
      const target = e.target.closest("button");
      if (!target) return;
      if (target.matches(".delete-btn")) handleDelete(e);
      if (target.matches(".no-stock-btn, .in-stock-btn")) handleToggleStock(e);
    });
    productAdminElements.tableBody.addEventListener("dblclick", handlePriceEdit);
    productAdminElements.addProductBtn.addEventListener("click", () =>
      productAdminElements.modal.classList.remove("hidden")
    );
    productAdminElements.cancelBtn.addEventListener("click", () =>
      productAdminElements.modal.classList.add("hidden")
    );
    productAdminElements.form.addEventListener("submit", handleAdminFormSubmit);
    productAdminElements.saveToDbBtn.addEventListener(
      "click",
      saveProductsToServer
    );
  
    newInvoiceElements.customerName.addEventListener("input", (e) => {
      currentBill.customer.name = e.target.value;
      renderBill();
    });
    newInvoiceElements.customerPhone.addEventListener("input", (e) => {
      currentBill.customer.phone = e.target.value;
    });
    newInvoiceElements.discountPercent.addEventListener("input", (e) => {
      currentBill.discountPercent = parseFloat(e.target.value) || 0;
      renderBill();
    });
    newInvoiceElements.productSearch.addEventListener("keyup", (e) => {
      const searchTerm = e.target.value.toLowerCase();
      renderDropdown(
        allProducts.filter((p) => p.name.toLowerCase().includes(searchTerm))
      );
      if (e.key === "Enter") {
        if (selectedProductForBill) {
          newInvoiceElements.productSearch.value = `${selectedProductForBill.name} (${selectedProductForBill.tamilName})`;
          newInvoiceElements.productDropdown.classList.remove("show");
          newInvoiceElements.quantityInput.focus();
        } else if (
          newInvoiceElements.productDropdown.classList.contains("show")
        ) {
          const firstProduct = newInvoiceElements.productDropdown.querySelector(
            "div[data-product-id]"
          );
          if (firstProduct) {
            selectedProductForBill = allProducts.find(
              (p) => p.id === parseInt(firstProduct.dataset.productId)
            );
            newInvoiceElements.productSearch.value = `${selectedProductForBill.name} (${selectedProductForBill.tamilName})`;
            newInvoiceElements.productDropdown.classList.remove("show");
            newInvoiceElements.quantityInput.focus();
          }
        }
      }
    });
    newInvoiceElements.dropdownArrow.addEventListener("click", () =>
      renderDropdown(allProducts)
    );
    document.addEventListener("click", (e) => {
      if (!e.target.closest(".searchable-dropdown"))
        newInvoiceElements.productDropdown.classList.remove("show");
    });
    newInvoiceElements.clearSelectionBtn.addEventListener("click", () => {
      selectedProductForBill = null;
      newInvoiceElements.productSearch.value = "";
      newInvoiceElements.quantityInput.value = 1;
    });
    newInvoiceElements.quantityInput.addEventListener("keyup", (e) => {
      if (e.key === "Enter") newInvoiceElements.addToBillBtn.click();
    });
    newInvoiceElements.addToBillBtn.addEventListener("click", () => {
      const quantity = parseInt(newInvoiceElements.quantityInput.value);
      if (!selectedProductForBill || isNaN(quantity) || quantity < 1)
        return showToast("Please select a product and enter a valid quantity.");
      const existingItem = currentBill.items.find(
        (item) => item.id === selectedProductForBill.productId
      );
      if (existingItem) {
        existingItem.quantity += quantity;
        existingItem.amount = existingItem.quantity * existingItem.price;
      } else {
        currentBill.items.push({
          id: selectedProductForBill.productId,
          name: selectedProductForBill.name,
          quantity: quantity,
          price: selectedProductForBill.offerPrice,
          amount: quantity * selectedProductForBill.offerPrice,
        });
      }
      renderBill();
      newInvoiceElements.clearSelectionBtn.click();
      newInvoiceElements.productSearch.focus();
    });
    newInvoiceElements.invoiceItemsBody.addEventListener("click", (e) => {
      if (e.target.closest(".remove-item-btn")) {
        currentBill.items.splice(e.target.closest("tr").dataset.index, 1);
        renderBill();
      }
    });
    let activeInput = null;
    let caretPos = 0;
    newInvoiceElements.invoiceItemsBody.addEventListener("focusin", (e) => {
      if (
        e.target.classList.contains("qty-input") ||
        e.target.classList.contains("price-input")
      ) {
        activeInput = e.target;
        caretPos = e.target.selectionStart;
      }
    });
    newInvoiceElements.invoiceItemsBody.addEventListener("keyup", (e) => {
      if (activeInput) caretPos = activeInput.selectionStart;
    });
    newInvoiceElements.invoiceItemsBody.addEventListener("input", (e) => {
      const input = e.target;
      const index = input.closest("tr").dataset.index;
      const item = currentBill.items[index];
      caretPos = input.selectionStart;
      if (input.classList.contains("qty-input")) {
        item.quantity = parseInt(input.value) || 1;
      }
      if (input.classList.contains("price-input")) {
        item.price = parseFloat(input.value) || 0;
      }
      item.amount = item.quantity * item.price;
      const row = input.closest("tr");
      row.cells[3].textContent = `₹${item.amount.toFixed(2)}`;
      calculateBillTotals();
      newInvoiceElements.productCount.textContent =
        currentBill.calculations.productCount;
      newInvoiceElements.productQuantity.textContent =
        currentBill.calculations.productQuantity;
      newInvoiceElements.subTotal.textContent = `₹${currentBill.calculations.subTotal.toFixed(
        2
      )}`;
      newInvoiceElements.discountAmount.textContent = `₹${currentBill.calculations.discountAmount.toFixed(
        2
      )}`;
      newInvoiceElements.total.textContent = `₹${currentBill.calculations.total.toFixed(
        2
      )}`;
      input.focus();
      input.setSelectionRange(caretPos, caretPos);
    });
    newInvoiceElements.invoiceItemsBody.addEventListener(
      "blur",
      (e) => {
        if (
          e.target.classList.contains("qty-input") ||
          e.target.classList.contains("price-input")
        ) {
          renderBill();
        }
      },
      true
    );
    newInvoiceElements.invoiceItemsBody.addEventListener("keypress", (e) => {
      if (
        e.key === "Enter" &&
        (e.target.classList.contains("qty-input") ||
          e.target.classList.contains("price-input"))
      ) {
        renderBill();
        const index = e.target.closest("tr").dataset.index;
        const sameInput = newInvoiceElements.invoiceItemsBody.querySelector(
          `tr[data-index="${index}"] .${e.target.classList[0]}`
        );
        if (sameInput) {
          sameInput.focus();
          sameInput.setSelectionRange(caretPos, caretPos);
        }
      }
    });
    newInvoiceElements.clearBillBtn.addEventListener("click", resetBill);
    newInvoiceElements.finalizeBillBtn.addEventListener("click", () =>
      toggleFinalizedView(true)
    );
    newInvoiceElements.editBillBtn.addEventListener("click", () => {
      isBillSaved = false;
      toggleFinalizedView(false);
      renderBill();
    });
    newInvoiceElements.saveBillBtn.addEventListener("click", saveBill);
    newInvoiceElements.shareBillBtn.addEventListener("click", () => {
      const link = `${
        window.location.origin
      }/bill.html?billNumber=${encodeURIComponent(currentBill.billNumber)}`;
      newInvoiceElements.generatedLink.value = link;
      newInvoiceElements.generateLinkBtn.innerHTML =
        '<i class="fas fa-link"></i> Copy';
    });
    newInvoiceElements.generateLinkBtn.addEventListener("click", () => {
      if (
        newInvoiceElements.generateLinkBtn.innerHTML ===
        '<i class="fas fa-link"></i> Copy'
      ) {
        navigator.clipboard
          .writeText(newInvoiceElements.generatedLink.value)
          .then(() => {
            showToast("Link Copied");
          })
          .catch((err) => {
            console.error("Failed to copy link:", err);
            showToast("Failed to copy link. Please try again.");
          });
      }
    });
    newInvoiceElements.printBillBtn.addEventListener("click", () => {
      // Get the content of finalized-bill-view
      const printContents = document.getElementById("finalized-bill-view").innerHTML;
    
      // Create a hidden iframe for printing
      const iframe = document.createElement("iframe");
      iframe.style.display = "none";
      document.body.appendChild(iframe);
    
      // Get all existing stylesheets from the main page
      const stylesheets = Array.from(document.styleSheets)
        .map((sheet) => {
          try {
            // Extract CSS rules
            return Array.from(sheet.cssRules)
              .map((rule) => rule.cssText)
              .join("\n");
          } catch (e) {
            console.warn("Cannot access stylesheet:", sheet.href, e);
            return "";
          }
        })
        .filter((css) => css)
        .join("\n");
    
      // Write the content and styles to the iframe
      const iframeDoc = iframe.contentDocument || iframe.contentWindow.document;
      iframeDoc.open();
      iframeDoc.write(`
        <html>
          <head>
            <style>
              /* Existing website styles */
              ${stylesheets}
              
              /* Additional print-specific styles */
              body { 
                font-family: Arial, sans-serif; 
                color: #333;
              }
              #finalized-bill-view {
                width: 90%;
                max-width: 800px; /* Adjust as needed */
              }
              table { 
                width: 100%; 
                border-collapse: collapse; 
                margin-top: 20px;
              }
              th, td { 
                border: 1px solid #ddd; 
                padding: 8px; 
                text-align: left; 
                font-size: 14px;
              }
              th { 
                background-color: #f2f2f2; 
                font-weight: bold;
              }
              .bill-details { 
                margin-bottom: 20px; 
                font-size: 16px;
              }
              .bill-details span { 
                font-weight: bold; 
              }
              /* Ensure no unwanted elements like buttons appear */
              button, .remove-item-btn { 
                display: none; 
              }
            </style>
          </head>
          <body>
            <div id="finalized-bill-view">
              ${printContents}
            </div>
          </body>
        </html>
      `);
      iframeDoc.close();
    
      // Trigger print in the iframe
      iframe.contentWindow.focus();
      iframe.contentWindow.print();
    
      // Remove the iframe after printing
      setTimeout(() => {
        document.body.removeChild(iframe);
      }, 1000); // Delay to ensure print dialog appears
    });
  
    // --- PRODUCT ADMIN LOGIC ---
    function renderAdminTable() {
      const tableBody = productAdminElements.tableBody;
      tableBody.innerHTML = "";
      if (!adminProducts || adminProducts.length === 0) {
        tableBody.innerHTML = `<tr><td colspan="7">No products to manage.</td></tr>`;
        return;
      }
      const productsByCategory = adminProducts.reduce((acc, p) => {
        const category = p.category || "Uncategorized";
        (acc[category] = acc[category] || []).push(p);
        return acc;
      }, {});
      for (const category in productsByCategory) {
        const headerRow = tableBody.insertRow();
        headerRow.className = "category-header-row";
        headerRow.innerHTML = `<th colspan="7">${category}</th>`;
        productsByCategory[category].forEach((product) => {
          const productIndex = adminProducts.findIndex(
            (p) => p.id === product.id
          );
          const row = tableBody.insertRow();
          row.dataset.index = productIndex;
          row.className = product.inStock == 1 ? "out-of-stock" : "";
          row.innerHTML = `
                      <td>${product.productId || "New"}</td>
                      <td>${product.name}</td>
                      <td>${product.tamilName}</td>
                      <td>₹${parseFloat(product.originalPrice).toFixed(2)}</td>
                      <td class="editable-price">₹${parseFloat(
                        product.offerPrice
                      ).toFixed(2)}</td>
                      <td>${product.quantities}</td>
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
        originalPrice: parseFloat(
          productAdminElements.productOriginalPrice.value
        ),
        offerPrice: parseFloat(productAdminElements.productOfferPrice.value),
        quantities: productAdminElements.productQuantities.value,
        category: productAdminElements.productCategory.value,
        inStock: 0,
        productId: "",
        latest: 1,
        is_delete: 0,
        image: productAdminElements.productImage.value,
        // contents: productAdminElements.productContents.value,
        video: productAdminElements.productVideo.value,
        instagram: productAdminElements.productInstagram.value,
        offer: parseInt(productAdminElements.productOffer.value) || 0,
      };
      adminProducts.push(newProduct);
      productAdminElements.modal.classList.add("hidden");
      productAdminElements.form.reset();
      renderAdminTable();
      hasPendingChanges = true;
      updateSaveButtonVisibility();
    }
  
    function handleDelete(e) {
      const id = parseInt(e.target.dataset.id);
      idsToDelete.push(id);
      localStorage.setItem("crackerDeletions", JSON.stringify(idsToDelete));
      adminProducts = adminProducts.filter((p) => p.id !== id);
      hasPendingChanges = true;
      renderAdminTable();
    }
  
    function handleToggleStock(e) {
      const id = parseInt(e.target.dataset.id);
      const product = adminProducts.find((p) => p.id === id);
      if (product) {
        product.inStock = product.inStock == 1 ? 0 : 1;
        hasPendingChanges = true;
        renderAdminTable();
      }
    }
  
    function handlePriceEdit(e) {
      if (!e.target.classList.contains("editable-price")) return;
      const row = e.target.closest("tr");
      const index = parseInt(row.dataset.index);
      const product = adminProducts[index];
      const cell = e.target;
      const input = document.createElement("input");
      input.type = "number";
      input.step = "0.25";
      input.min = "0";
      input.value = parseFloat(product.offerPrice).toFixed(2);
      input.style.width = "100%";
      input.style.padding = "6px 8px";
      input.style.boxSizing = "border-box";
      input.style.border = "1px solid #ccc";
      input.style.borderRadius = "8px";
      input.style.fontSize = "14px";
      input.style.color = "#333";
      input.style.backgroundColor = "#fff";
      input.style.outline = "none";
      input.style.transition = "all 0.3s ease";
      input.style.boxShadow = "0 1px 3px rgba(0, 0, 0, 0.1)";
      cell.innerHTML = "";
      cell.appendChild(input);
      input.focus();
      const savePrice = () => {
        const newPrice = parseFloat(input.value);
        if (!isNaN(newPrice)) {
          product.offerPrice = newPrice;
          hasPendingChanges = true;
        }
        renderAdminTable();
      };
      input.addEventListener("blur", savePrice);
      input.addEventListener("keypress", (e) => {
        if (e.key === "Enter") savePrice();
      });
    }
  
    function updateSaveButtonVisibility() {
      productAdminElements.saveToDbBtn.classList.toggle(
        "hidden",
        !hasPendingChanges
      );
      additionalProductElements.saveToDbBtn.classList.toggle(
        "hidden",
        !hasPendingAdditionalChanges
      );
    }
  
    async function saveProductsToServer() {
      const newProducts = adminProducts
        .filter((p) => p.id < 0)
        .map((p) => ({
          name: p.name,
          tamilName: p.tamilName,
          originalPrice: p.originalPrice,
          offerPrice: p.offerPrice,
          quantities: p.quantities,
          category: p.category,
          inStock: p.inStock,
          image: p.image,
          // contents: p.contents,
          video: p.video,
          instagram: p.instagram,
          offer: p.offer,
        }));
      const changedProducts = adminProducts
        .filter((p) => p.id > 0)
        .map((p) => {
          const orig = allProducts.find((o) => o.id === p.id);
          if (!orig) return null;
          return {
            p,
            priceChanged: p.offerPrice !== orig.offerPrice,
            stockChanged: p.inStock !== orig.inStock,
          };
        })
        .filter((c) => c !== null);
      const priceEdits = changedProducts
        .filter((c) => c.priceChanged)
        .map((c) => ({
          id: c.p.id,
          productId: c.p.productId,
          name: c.p.name,
          tamilName: c.p.tamilName,
          originalPrice: c.p.originalPrice,
          offerPrice: c.p.offerPrice,
          category: c.p.category,
          inStock: c.p.inStock,
          quantities: c.p.quantities,
        }));
      const stockChanges = changedProducts
        .filter((c) => !c.priceChanged && c.stockChanged)
        .map((c) => ({
          id: c.p.id,
          inStock: c.p.inStock,
        }));
      try {
        const response = await fetch("./save_products.php", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            stockChanges,
            priceEdits,
            newProducts,
            toDelete: idsToDelete,
          }),
        });
        if (!response.ok) throw new Error("Failed to save products");
        const result = await response.json();
        if (result.status !== "success") throw new Error(result.message);
        showToast("Products saved successfully!");
        hasPendingChanges = false;
        idsToDelete = [];
        localStorage.removeItem("crackerDeletions");
        await fetchProducts();
        renderAdminTable();
      } catch (error) {
        showToast(`Error saving products: ${error.message}`);
      }
    }
  
    function renderDropdown(products) {
      newInvoiceElements.productDropdown.innerHTML = "";
      products.forEach((p) => {
        const div = document.createElement("div");
        div.textContent = `${p.name} (${p.tamilName}) - ₹${p.offerPrice}`;
        div.dataset.productId = p.id;
        div.addEventListener("click", () => {
          selectedProductForBill = p;
          newInvoiceElements.productSearch.value = `${p.name} (${p.tamilName})`;
          newInvoiceElements.productDropdown.classList.remove("show");
          newInvoiceElements.quantityInput.focus();
        });
        newInvoiceElements.productDropdown.appendChild(div);
      });
      newInvoiceElements.productDropdown.classList.add("show");
    }
  
    async function fetchAndRenderOldInvoices() {
      try {
        const response = await fetch("./fetch_invoices.php");
        const invoices = await response.json();
        oldInvoicesElements.body.innerHTML = "";
        invoices.forEach((inv) => {
          const row = oldInvoicesElements.body.insertRow();
          row.innerHTML = `
                      <td>${inv.bill_number}</td>
                      <td>${new Date(inv.bill_date).toLocaleDateString(
                        "en-GB"
                      )}</td>
                      <td>${inv.customer_name}</td>
                      <td>${inv.customer_phone || "N/A"}</td>
                      <td>${parseFloat(inv.discount_percent).toFixed(2)}%</td>
                      <td>₹${parseFloat(inv.total_amount).toFixed(2)}</td>
                      <td>
                          <button class="view-invoice-btn" data-bill-number="${
                            inv.bill_number
                          }"><i class="fas fa-eye"></i>View</button>
                          <button class="edit-invoice-btn" data-bill-number="${
                            inv.bill_number
                          }"><i class="fas fa-edit"></i>Edit</button>
                          <button class="share-invoice-btn" data-bill-number="${
                            inv.bill_number
                          }"><i class="fas fa-share-square"></i>Share</button>
                      </td>`;
        });
        oldInvoicesElements.body
          .querySelectorAll(".share-invoice-btn")
          .forEach((btn) => {
            btn.addEventListener("click", () => {
              const billNumber = btn.dataset.billNumber;
              const link = `${
                window.location.origin
              }/bill.html?billNumber=${encodeURIComponent(billNumber)}`;
              navigator.clipboard
                .writeText(link)
                .then(() => {
                  showToast("Link copied to clipboard!");
                })
                .catch((err) => {
                  console.error("Failed to copy link:", err);
                  showToast("Failed to copy link. Please try again.");
                });
            });
          });
        oldInvoicesElements.body
          .querySelectorAll(".view-invoice-btn")
          .forEach((btn) => {
            btn.addEventListener("click", () =>
              loadBill(btn.dataset.billNumber, false)
            );
          });
        oldInvoicesElements.body
          .querySelectorAll(".edit-invoice-btn")
          .forEach((btn) => {
            btn.addEventListener("click", () =>
              loadBill(btn.dataset.billNumber, true)
            );
          });
      } catch (error) {
        console.error("Could not fetch old invoices:", error);
        showToast("Could not load invoices. Please check the connection.");
      }
    }
  
    async function renderEnquiryTable() {
      try {
        const response = await fetch("./get_enquiry.php");
        if (!response.ok) throw new Error("Network response failed");
        const enquiryProducts = await response.json();
        const container = enquiryElements.productList;
        container.innerHTML = "";
        const table = document.createElement("table");
        table.className = "admin-table";
        const thead = document.createElement("thead");
        thead.innerHTML = `<tr><th>Product ID</th><th>Name</th><th>Tamil Name</th><th>Original Price</th><th>Offer Price</th><th>Quantities</th><th>Stock</th></tr>`;
        table.appendChild(thead);
        const tbody = document.createElement("tbody");
        const productsByCategory = enquiryProducts.reduce((acc, p) => {
          const category = p.category || "Uncategorized";
          if (!acc[category]) acc[category] = [];
          acc[category].push(p);
          return acc;
        }, {});
        for (const category in productsByCategory) {
          const headerRow = tbody.insertRow();
          headerRow.className = "category-header-row";
          headerRow.innerHTML = `<th colspan="7">${category}</th>`;
          productsByCategory[category].forEach((product) => {
            const row = tbody.insertRow();
            const stockText = product.inStock === 1 ? "No Stock" : "In Stock";
            row.className = product.inStock === 1 ? "out-of-stock" : "";
            row.innerHTML = `
                          <td>${product.productId}</td>
                          <td>${product.name}</td>
                          <td>${product.tamilName}</td>
                          <td>₹${parseFloat(product.originalPrice).toFixed(
                            2
                          )}</td>
                          <td>₹${parseFloat(product.offerPrice).toFixed(2)}</td>
                          <td>${product.quantities}</td>
                          <td>${stockText}</td>
                      `;
          });
        }
        table.appendChild(tbody);
        container.appendChild(table);
        const header = document.querySelector("#enquiry-view .admin-header");
        if (!document.getElementById("share-enquiry-btn")) {
          const shareBtn = document.createElement("button");
          shareBtn.id = "share-enquiry-btn";
          shareBtn.innerHTML = '<i class="fas fa-share-square"></i> Share';
          shareBtn.classList.add("share-btn");
          header.appendChild(shareBtn);
          shareBtn.addEventListener("click", showShareModal);
        }
      } catch (error) {
        console.error("Failed to load enquiry products:", error);
        showToast(
          "Could not load enquiry data. Please check the connection and PHP scripts."
        );
      }
    }
  
    function setupShareModal() {
      let shareModal = document.getElementById("share-modal");
      if (!shareModal) {
        shareModal = document.createElement("div");
        shareModal.id = "share-modal";
        shareModal.classList.add("modal", "hidden");
        shareModal.innerHTML = `
                  <div class="modal-content">
                      <input type="text" id="share-link" readonly>
                      <button id="copy-link-btn">Copy Link</button>
                      <div class="social-icons">
                          <a id="whatsapp-share" href="#" target="_blank">WhatsApp</a>
                          <a id="instagram-share" href="#" target="_blank">Instagram</a>
                          <a id="facebook-share" href="#" target="_blank">Facebook</a>
                      </div>
                  </div>
              `;
        document.body.appendChild(shareModal);
        document.getElementById("copy-link-btn").addEventListener("click", () => {
          const linkInput = document.getElementById("share-link");
          navigator.clipboard
            .writeText(linkInput.value)
            .then(() => {
              showToast("Link Copied");
            })
            .catch((err) => {
              console.error("Failed to copy link:", err);
              showToast("Failed to copy link. Please try again.");
            });
        });
        shareModal.addEventListener("click", (e) => {
          if (e.target === shareModal) {
            shareModal.classList.add("hidden");
          }
        });
      }
    }
  
    function showShareModal() {
      const link = window.location.origin + "/enquiry.html";
      const shareModal = document.getElementById("share-modal");
      document.getElementById("share-link").value = link;
      document.getElementById(
        "whatsapp-share"
      ).href = `https://api.whatsapp.com/send?text=${encodeURIComponent(link)}`;
      document.getElementById(
        "facebook-share"
      ).href = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(
        link
      )}`;
      document.getElementById("instagram-share").href =
        "https://www.instagram.com/";
      shareModal.classList.remove("hidden");
    }
  
    initApp();
  });