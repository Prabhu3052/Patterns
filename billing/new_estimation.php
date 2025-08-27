<?php
header('Content-Type: application/json');
include 'db_config.php';

mysqli_report(MYSQLI_REPORT_ERROR | MYSQLI_REPORT_STRICT);

$data = json_decode(file_get_contents("php://input"), true);

try {
    $conn->begin_transaction();

    // 1. Fetch the last estimation number from the counter table
    $counterStmt = $conn->prepare("SELECT last_estimation_number FROM counter WHERE id = 1 FOR UPDATE");
    $counterStmt->execute();
    $counterResult = $counterStmt->get_result();
    $last_est_num = $counterResult->fetch_assoc()['last_estimation_number'];
    
    // Generate the new estimation number
    $lastNum = (int)substr($last_est_num, 1);
    $newNum = 'E' . ($lastNum + 1);

    // 2. Save the main estimation details
    $estStmt = $conn->prepare("INSERT INTO estimations (estimation_number, customer_name, phone_number, discount, total_amount, created_at) VALUES (?, ?, ?, ?, ?, ?)");
    $estStmt->bind_param("sssdss",
        $newNum,
        $data['customer_name'],
        $data['phone_number'],
        $data['discount'],
        $data['total_amount'],
        $data['created_at']
    );
    $estStmt->execute();

    // 3. Save each item in the estimation
    $itemStmt = $conn->prepare("INSERT INTO estimation_items (estimation_number, product_id, quantity) VALUES (?, ?, ?)");
    foreach ($data['items'] as $item) {
        $itemStmt->bind_param("ssi", $newNum, $item['product_id'], $item['quantity']);
        $itemStmt->execute();
    }
    
    // 4. Update the counter table with the new estimation number
    $updateCounterStmt = $conn->prepare("UPDATE counter SET last_estimation_number = ? WHERE id = 1");
    $updateCounterStmt->bind_param("s", $newNum);
    $updateCounterStmt->execute();

    $conn->commit();
    echo json_encode(["status" => "success", "message" => "Estimation saved successfully!", "estimation_number" => $newNum]);
    
} catch (mysqli_sql_exception $e) {
    $conn->rollback();
    echo json_encode(["status" => "error", "message" => "Database error: " . $e->getMessage()]);
}

$conn->close();
?>