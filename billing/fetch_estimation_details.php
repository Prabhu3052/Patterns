<?php
header('Content-Type: application/json');
include 'db_config.php';

$estimationNumber = isset($_GET['estimation_number']) ? $_GET['estimation_number'] : '';

if (!$estimationNumber) {
    echo json_encode(["status" => "error", "message" => "Estimation number not provided."]);
    $conn->close();
    exit();
}

try {
    $conn->begin_transaction();

    // Fetch main estimation details
    $estStmt = $conn->prepare("SELECT * FROM estimations WHERE estimation_number = ?");
    $estStmt->bind_param("s", $estimationNumber);
    $estStmt->execute();
    $estimation = $estStmt->get_result()->fetch_assoc();
    $estStmt->close();

    if ($estimation) {
        // Fetch items for that estimation
        $itemsStmt = $conn->prepare("SELECT product_id, quantity FROM estimation_items WHERE estimation_number = ?");
        $itemsStmt->bind_param("s", $estimationNumber);
        $itemsStmt->execute();
        $itemsResult = $itemsStmt->get_result();
        $items = [];
        while ($row = $itemsResult->fetch_assoc()) {
            $items[] = $row;
        }
        $itemsStmt->close();

        $estimation['items'] = $items;
        echo json_encode(["status" => "success", "data" => $estimation]);
    } else {
        echo json_encode(["status" => "error", "message" => "Estimation not found."]);
    }

    $conn->commit();
} catch (mysqli_sql_exception $e) {
    $conn->rollback();
    echo json_encode(["status" => "error", "message" => "Database error: " . $e->getMessage()]);
}

$conn->close();
?>