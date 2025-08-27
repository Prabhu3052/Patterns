<?php
header('Content-Type: application/json');
include 'db_config.php';

$sql = "SELECT estimation_number, created_at AS date, customer_name, phone_number, discount, total_amount, is_marked FROM estimations ORDER BY created_at DESC";
$result = $conn->query($sql);

$estimations = array();
if ($result->num_rows > 0) {
    while($row = $result->fetch_assoc()) {
        $estimations[] = $row;
    }
}

echo json_encode($estimations);
$conn->close();
?>