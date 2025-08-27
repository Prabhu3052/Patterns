<?php
require 'db_config.php';
header('Content-Type: application/json');

try {
    $bill_number = isset($_GET['billNumber']) ? $conn->real_escape_string($_GET['billNumber']) : '';
    $phone = isset($_GET['phone']) ? $conn->real_escape_string($_GET['phone']) : '';

    if (empty($bill_number)) {
        throw new Exception('Bill number is required.');
    }

    // Fetch invoice details
    $stmt = $conn->prepare("SELECT bill_number, bill_date, customer_name, customer_phone, discount_percent, total_amount FROM invoices WHERE bill_number = ?");
    $stmt->bind_param("s", $bill_number);
    $stmt->execute();
    $result = $stmt->get_result();
    $invoice = $result->fetch_assoc();
    $stmt->close();

    if (!$invoice) {
        throw new Exception('Invoice not found.');
    }

    // Validate phone number if provided
    if (!empty($phone) && $phone !== $invoice['customer_phone']) {
        throw new Exception('Invalid phone number.');
    }

    // Fetch all products where is_delete = 0 (optional, if needed for fallback)
    $stmt = $conn->prepare("SELECT id, product_id, name, tamil_name, original_price, offer_price, category, in_stock, is_delete, latest FROM products");
    $stmt->execute();
    $result = $stmt->get_result();
    $products = [];
    while ($row = $result->fetch_assoc()) {
        $products[] = [
            'id' => (int)$row['id'],
            'productId' => $row['product_id'], // Custom product_id (e.g., P001)
            'name' => $row['name'],
            'tamilName' => $row['tamil_name'],
            'originalPrice' => (float)$row['original_price'],
            'offerPrice' => (float)$row['offer_price'],
            'category' => $row['category'],
            'inStock' => (int)$row['in_stock'],
            'latest' => (int)$row['latest']
        ];
    }
    $stmt->close();

    // Pre-build maps for efficiency
    $products_by_id = [];
    foreach ($products as $p) {
        $products_by_id[$p['productId']] = $p;
    }

    // Fetch invoice items with price
    $stmt = $conn->prepare("SELECT product_id, quantity, price FROM invoice_items WHERE bill_number = ?");
    $stmt->bind_param("s", $bill_number);
    $stmt->execute();
    $result = $stmt->get_result();
    $items = [];
    while ($row = $result->fetch_assoc()) {
        $referenced_id = $row['product_id'];
        $ref_product = $products_by_id[$referenced_id] ?? null;
        $items[] = [
            'productId' => $ref_product ? $ref_product['productId'] : "Unknown-{$referenced_id}", // Use custom product_id or fallback
            'quantity' => (int)$row['quantity'],
            'price' => (float)$row['price'],
            'amount' => (float)$row['quantity'] * (float)$row['price']
        ];
    }
    $stmt->close();

    // Calculate totals
    $calculations = [
        'productCount' => count($items),
        'productQuantity' => array_sum(array_column($items, 'quantity')),
        'subTotal' => array_sum(array_column($items, 'amount')),
        'discountAmount' => (array_sum(array_column($items, 'amount')) * $invoice['discount_percent']) / 100,
        'total' => array_sum(array_column($items, 'amount')) - (array_sum(array_column($items, 'amount')) * $invoice['discount_percent']) / 100
    ];

    // Return invoice data and products
    echo json_encode([
        'status' => 'success',
        'invoice' => [
            'billNumber' => $invoice['bill_number'],
            'billDate' => $invoice['bill_date'],
            'customerName' => $invoice['customer_name'],
            'customerPhone' => $invoice['customer_phone'],
            'discountPercent' => (float)$invoice['discount_percent'],
            'totalAmount' => (float)$calculations['total']
        ],
        'items' => $items,
        'calculations' => $calculations,
        'products' => $products
    ]);

} catch (Exception $e) {
    http_response_code(400);
    echo json_encode(['status' => 'error', 'message' => $e->getMessage()]);
} finally {
    if (isset($conn) && $conn->ping()) {
        $conn->close();
    }
}
?>