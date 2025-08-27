<?php
header('Content-Type: application/json');
include 'db_config.php';

$sql = "SELECT * FROM products ORDER BY product_id ASC";
$result = $conn->query($sql);

$products = array();
if ($result->num_rows > 0) {
    while($row = $result->fetch_assoc()) {
        $products[] = $row;
    }
}

echo json_encode($products);
$conn->close();
?>