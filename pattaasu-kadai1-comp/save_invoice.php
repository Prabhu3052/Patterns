<?php
require 'db_config.php';

try {
    $json_data = file_get_contents('php://input');
    $bills = json_decode($json_data, true);

    // If a single bill is sent, wrap it in an array for consistency
    if (isset($bills['billNumber'])) {
        $bills = [$bills];
    }

    $conn->begin_transaction();

    foreach ($bills as $data) {
        if (!isset($data['billNumber']) || !isset($data['customer']) || !isset($data['items']) || !isset($data['calculations'])) {
            throw new Exception('Invalid data received for bill ' . ($data['billNumber'] ?? 'unknown'));
        }

        // Save to invoices table
        $bill_number = $conn->real_escape_string($data['billNumber']);
        $bill_date = $conn->real_escape_string($data['date']);
        $customer_name = $conn->real_escape_string($data['customer']['name']);
        $customer_phone = $conn->real_escape_string($data['customer']['phone']);
        $discount_percent = (float)$data['discountPercent'];
        $total_amount = (float)$data['calculations']['total'];

        // Check if invoice exists
        $check_stmt = $conn->prepare("SELECT COUNT(*) FROM invoices WHERE bill_number = ?");
        $check_stmt->bind_param("s", $bill_number);
        $check_stmt->execute();
        $check_result = $check_stmt->get_result();
        $exists = $check_result->fetch_row()[0] > 0;
        $check_stmt->close();

        if ($exists) {
            // Update invoices
            $stmt = $conn->prepare("UPDATE invoices SET bill_date = ?, customer_name = ?, customer_phone = ?, discount_percent = ?, total_amount = ? WHERE bill_number = ?");
            $stmt->bind_param("sssdds", $bill_date, $customer_name, $customer_phone, $discount_percent, $total_amount, $bill_number);
            if (!$stmt->execute()) {
                throw new Exception('Failed to update invoice data for bill ' . $bill_number);
            }
            $stmt->close();

            // Delete existing items
            $del_stmt = $conn->prepare("DELETE FROM invoice_items WHERE bill_number = ?");
            $del_stmt->bind_param("s", $bill_number);
            if (!$del_stmt->execute()) {
                throw new Exception('Failed to delete old invoice items for bill ' . $bill_number);
            }
            $del_stmt->close();
        } else {
            // Insert new invoice
            $stmt = $conn->prepare("INSERT INTO invoices (bill_number, bill_date, customer_name, customer_phone, discount_percent, total_amount) VALUES (?, ?, ?, ?, ?, ?)");
            $stmt->bind_param("ssssdd", $bill_number, $bill_date, $customer_name, $customer_phone, $discount_percent, $total_amount);
            if (!$stmt->execute()) {
                throw new Exception('Failed to save invoice data for bill ' . $bill_number);
            }
            $stmt->close();
        }

        // Save to invoice_items table
        foreach ($data['items'] as $item) {
            // Find the product_id using the 'id' from the front end, which corresponds to the 'id' in the products table
            
            $product_id_from_db = $conn->real_escape_string($item['id']);
            $quantity = (int)$item['quantity'];
            $price = (float)$item['price'];

            $stmt = $conn->prepare("INSERT INTO invoice_items (bill_number, product_id, quantity, price) VALUES (?, ?, ?, ?)");
            $stmt->bind_param("ssid", $bill_number, $product_id_from_db, $quantity, $price);
            
            if (!$stmt->execute()) {
                throw new Exception('Failed to save invoice items for bill ' . $bill_number);
            }
            $stmt->close();
        }
    }

    $conn->commit();
    echo json_encode(['status' => 'success', 'message' => 'All invoices and items saved successfully.']);
} catch (Exception $e) {
    $conn->rollback();
    http_response_code(500);
    echo json_encode(['status' => 'error', 'message' => $e->getMessage()]);
} finally {
    if (isset($conn) && $conn->ping()) {
        $conn->close();
    }
}
?>