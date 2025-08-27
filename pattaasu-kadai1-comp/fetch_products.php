<?php
require 'db_config.php';

// Ungal database-il ulla sariyana column peyargalai (snake_case) payanpaduthugirom.
// Javascript-il elidhaga payanpadutha avatrai camelCase-ஆக maatri anuppugirom.
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

$result = $conn->query($sql);
$products = array();

if ($result && $result->num_rows > 0) {
    while($row = $result->fetch_assoc()) {
        // Data-vai sariyana type-il maatrugirom
        $row['id'] = (int)$row['id'];
        $row['originalPrice'] = (float)$row['originalPrice'];
        $row['offerPrice'] = (float)$row['offerPrice'];
        $row['inStock'] = (int)$row['inStock'];
        $row['is_delete']    = (int)$row['is_delete'];
        $row['latest']        = (int)$row['latest'];
        
        $products[] = $row;
    }
}

echo json_encode($products);
$conn->close();
?>