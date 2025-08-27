<?php
require 'db_config.php';
header('Content-Type: application/json');

try {
    // Check for a specific status request, default to fetching all
    $status = isset($_GET['status']) ? (int)$_GET['status'] : null;

    $sql_count_pending = "SELECT COUNT(*) FROM order_customer_details WHERE complete = 0";
    $sql_count_completed = "SELECT COUNT(*) FROM order_customer_details WHERE complete = 1";
    $pending_count = $conn->query($sql_count_pending)->fetch_row()[0];
    $completed_count = $conn->query($sql_count_completed)->fetch_row()[0];

    // Build the query to fetch order details
    $sql_details = "SELECT
        ocd.orderid,
        ocd.name,
        ocd.phonenumber,
        ocd.email,
        ocd.orderdate,
        ocd.complete
    FROM order_customer_details ocd";

    if ($status !== null) {
        $sql_details .= " WHERE ocd.complete = ?";
    }

    $sql_details .= " ORDER BY ocd.orderdate DESC";

    $stmt_details = $conn->prepare($sql_details);
    if ($status !== null) {
        $stmt_details->bind_param("i", $status);
    }
    $stmt_details->execute();
    $result_details = $stmt_details->get_result();

    $orders = [];
    while ($row = $result_details->fetch_assoc()) {
        // Fetch order items for each order
        $stmt_items = $conn->prepare("SELECT product_id, quantity, price FROM order_items WHERE orderid = ?");
        $stmt_items->bind_param("s", $row['orderid']);
        $stmt_items->execute();
        $result_items = $stmt_items->get_result();
        $items = [];
        while ($item_row = $result_items->fetch_assoc()) {
            $items[] = [
                'product_id' => $item_row['product_id'],
                'quantity' => (int)$item_row['quantity'],
                'price' => (float)$item_row['price']
            ];
        }
        $stmt_items->close();

        $orders[] = [
            'orderid' => (int)$row['orderid'], // Cast to integer
            'name' => $row['name'],
            'phone_number' => $row['phonenumber'],
            'email' => $row['email'],
            'order_date' => $row['orderdate'],
            'complete' => (int)$row['complete'],
            'items' => $items
        ];
    }
    $stmt_details->close();

    echo json_encode([
        'status' => 'success',
        'pending_count' => (int)$pending_count,
        'completed_count' => (int)$completed_count,
        'orders' => $orders
    ]);

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['status' => 'error', 'message' => $e->getMessage()]);
} finally {
    if (isset($conn) && $conn->ping()) {
        $conn->close();
    }
}
?>