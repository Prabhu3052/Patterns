<?php
require 'db_config.php';
header('Content-Type: application/json');

try {
    $data = json_decode(file_get_contents('php://input'), true);

    if (!isset($data['billNumber']) || !isset($data['items']) || !isset($data['calculations'])) {
        throw new Exception('Invalid update data received.');
    }

    $conn->begin_transaction();
    
    $bill_number = $conn->real_escape_string($data['billNumber']);

    // Step 1: Delete all old items associated with this bill number
    $stmt_delete = $conn->prepare("DELETE FROM invoice_items WHERE bill_number = ?");
    $stmt_delete->bind_param("s", $bill_number);
    $stmt_delete->execute();
    $stmt_delete->close();

    // Step 2: Update the main invoice record with new totals and details
    $customer_name = $conn->real_escape_string($data['customer']['name']);
    $customer_phone = $conn->real_escape_string($data['customer']['phone']);
    $discount_percent = (float)$data['discountPercent'];
    $total_amount = (float)$data['calculations']['total'];

    $stmt_update = $conn->prepare("UPDATE invoices SET customer_name = ?, customer_phone = ?, discount_percent = ?, total_amount = ? WHERE bill_number = ?");
    $stmt_update->bind_param("ssdds", $customer_name, $customer_phone, $discount_percent, $total_amount, $bill_number);
    $stmt_update->execute();
    $stmt_update->close();

    // Step 3: Insert the new (potentially modified) list of items
    $stmt_insert = $conn->prepare("INSERT INTO invoice_items (bill_number, product_id, quantity, price) VALUES (?, ?, ?, ?)");
    foreach ($data['items'] as $item) {
        $product_id = $conn->real_escape_string($item['id']);
        $quantity = (int)$item['quantity'];
        $price = (float)$item['price'];
        $stmt_insert->bind_param("ssid", $bill_number, $product_id, $quantity, $price);
        $stmt_insert->execute();
    }
    $stmt_insert->close();

    $conn->commit();
    
    echo json_encode(['status' => 'success', 'message' => 'Invoice ' . $bill_number . ' updated successfully.']);

} catch (Exception $e) {
    if ($conn->ping()) $conn->rollback();
    http_response_code(500);
    echo json_encode(['status' => 'error', 'message' => $e->getMessage()]);
} finally {
    if (isset($conn) && $conn->ping()) $conn->close();
}
?>