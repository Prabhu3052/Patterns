<?php
require 'db_config.php';

try {
    if (isset($_GET['next_bill'])) {
        // Start transaction to ensure atomicity
        $conn->begin_transaction();

        // Lock and get last_bill_number from order_counter
        $stmt = $conn->prepare("SELECT last_bill_number FROM order_counter FOR UPDATE");
        $stmt->execute();
        $result = $stmt->get_result();
        $row = $result->fetch_assoc();
        $stmt->close();

        if (!$row) {
            // If no row exists, initialize it
            $stmt = $conn->prepare("INSERT INTO order_counter (last_bill_number) VALUES (0)");
            $stmt->execute();
            $stmt->close();
            $last_bill_number = 0;
        } else {
            $last_bill_number = (int)$row['last_bill_number'];
        }

        // Calculate new bill number
        $new_bill_number = $last_bill_number + 1;
        $formatted_bill_number = "B" . $new_bill_number;

        // Update the existing row in order_counter with the new last_bill_number
        $stmt = $conn->prepare("UPDATE order_counter SET last_bill_number = ?");
        $stmt->bind_param("i", $new_bill_number);
        $stmt->execute();
        $stmt->close();

        // Commit transaction
        $conn->commit();

        // Return the formatted bill number
        header('Content-Type: text/plain');
        echo $formatted_bill_number;
        exit;
    } elseif (isset($_GET['bill_number'])) {
        $bill_number = $conn->real_escape_string($_GET['bill_number']);
        $stmt = $conn->prepare("SELECT * FROM invoices WHERE bill_number = ?");
        $stmt->bind_param("s", $bill_number);
        $stmt->execute();
        $result = $stmt->get_result();
        $invoice = $result->fetch_assoc();
        $stmt->close();
        if (!$invoice) {
            throw new Exception('Invoice not found');
        }
        $stmt = $conn->prepare("SELECT * FROM invoice_items WHERE bill_number = ?");
        $stmt->bind_param("s", $bill_number);
        $stmt->execute();
        $result = $stmt->get_result();
        $items = [];
        while ($row = $result->fetch_assoc()) {
            $items[] = $row;
        }
        $stmt->close();
        $invoice['items'] = $items;
        header('Content-Type: application/json');
        echo json_encode($invoice);
    } else {
        $stmt = $conn->prepare("SELECT bill_number, bill_date, customer_name, customer_phone, discount_percent, total_amount FROM invoices ORDER BY bill_date DESC");
        $stmt->execute();
        $result = $stmt->get_result();
        $invoices = [];
        while ($row = $result->fetch_assoc()) {
            $invoices[] = $row;
        }
        $stmt->close();
        header('Content-Type: application/json');
        echo json_encode($invoices);
    }
} catch (Exception $e) {
    // Rollback transaction if active
    if ($conn->in_transaction) {
        $conn->rollback();
    }
    http_response_code(500);
    echo json_encode(['status' => 'error', 'message' => $e->getMessage()]);
} finally {
    if (isset($conn) && $conn->ping()) {
        $conn->close();
    }
}
?>