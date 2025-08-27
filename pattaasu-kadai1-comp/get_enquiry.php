<?php
require 'db_config.php';
header('Content-Type: application/json');

try {
    $sql = "SELECT 
        id,
        product_id AS productId,
        name,
        tamil_name AS tamilName,
        original_price AS originalPrice,
        offer_price AS offerPrice,
        category,
        in_stock AS inStock,
        last_updated,
        quantities,
        is_delete,
        latest
    FROM products
    WHERE latest = 1 AND is_delete = 0 
    ORDER BY product_id";
    
    $stmt = $conn->prepare($sql);
    $stmt->execute();
    $result = $stmt->get_result();
    $products = [];
    while ($row = $result->fetch_assoc()) {
        $products[] = [
            'id' => (int)$row['id'],
            'productId' => $row['productId'],
            'name' => $row['name'],
            'tamilName' => $row['tamilName'],
            'originalPrice' => (float)$row['originalPrice'],
            'offerPrice' => (float)$row['offerPrice'],
            'category' => $row['category'],
            'inStock' => (int)$row['inStock'],
            'last_updated' => $row['last_updated'],
            'quantities' => $row['quantities'],
            'is_delete' => (int)$row['is_delete'],
            'latest' => (int)$row['latest']
        ];
    }
    $stmt->close();
    echo json_encode($products);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['status' => 'error', 'message' => $e->getMessage()]);
} finally {
    if (isset($conn) && $conn->ping()) {
        $conn->close();
    }
}
?>