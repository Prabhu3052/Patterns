<?php
header('Content-Type: application/json');

require_once 'db_config.php'; // Include the database connection file

try {
    // Prepare and execute the query
    $stmt = $conn->prepare("
    SELECT 
        p.product_id,
        p.name,
        pd.image,
        pd.video,
        pd.offer,
        pd.instagram
    FROM products p
    RIGHT JOIN products_details pd ON p.product_id = pd.product_id
    WHERE p.latest = 1 AND p.is_delete = 0 AND p.in_stock = 0
    ORDER BY p.product_id
");
    $stmt->execute();
    
    // Fetch results using MySQLi
    $result = $stmt->get_result();
    $products = $result->fetch_all(MYSQLI_ASSOC);
    
    if (empty($products)) {
        error_log("No products found in products_details table.");
    }
    echo json_encode($products);
} catch (Exception $e) {
    error_log("Error: " . $e->getMessage());
    echo json_encode(['status' => 'error', 'message' => $e->getMessage()]);
}
?>