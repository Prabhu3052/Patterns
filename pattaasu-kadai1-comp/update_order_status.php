<?php
require 'db_config.php';
header('Content-Type: application/json');

try {
    $json_data = file_get_contents('php://input');
    $data = json_decode($json_data, true);

    if (!isset($data['orderid'])) {
        throw new Exception('Order ID is required.');
    }

    $orderid = $conn->real_escape_string($data['orderid']);

    $stmt = $conn->prepare("UPDATE order_customer_details SET complete = 1 WHERE orderid = ?");
    $stmt->bind_param("s", $orderid);

    if ($stmt->execute()) {
        echo json_encode(['status' => 'success', 'message' => 'Order status updated successfully.']);
    } else {
        throw new Exception('Failed to update order status.');
    }

    $stmt->close();
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['status' => 'error', 'message' => $e->getMessage()]);
} finally {
    if (isset($conn) && $conn->ping()) {
        $conn->close();
    }
}
?>