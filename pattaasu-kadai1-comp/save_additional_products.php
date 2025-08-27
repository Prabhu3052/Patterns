<?php
require_once 'db_config.php';
header('Content-Type: application/json');

 // Include the database connection file

try {
    $data = json_decode(file_get_contents('php://input'), true);

    if (empty($data)) {
        throw new Exception("No data received for update.");
    }
    
    foreach ($data as $product) {
        $stmt = $conn->prepare("UPDATE products_details SET image = ?, video = ?, instagram = ?, offer = ? WHERE product_id = ?");
        $stmt->execute([
            $product['image'],
            $product['video'],
            $product['instagram'],
            $product['offer'],
            $product['product_id']
        ]);
    }

    echo json_encode(['status' => 'success', 'message' => 'Products updated successfully']);
} catch (PDOException $e) {
    echo json_encode(['status' => 'error', 'message' => $e->getMessage()]);
}
?>