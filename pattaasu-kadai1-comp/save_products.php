<?php
require 'db_config.php';
header('Content-Type: application/json');

try {
    $conn->begin_transaction();

    $json_data = file_get_contents('php://input');
    $payload = json_decode($json_data, true);

    if (json_last_error() !== JSON_ERROR_NONE) {
        throw new Exception('Invalid JSON data received.');
    }

    $stock_changes = $payload['stockChanges'] ?? [];
    $price_edits = $payload['priceEdits'] ?? [];
    $new_products = $payload['newProducts'] ?? [];
    $ids_to_delete = $payload['toDelete'] ?? [];
    $deleted_count = 0; $inserted_count = 0; $updated_count = 0; $stock_updated_count = 0;

    /**
     * Handle soft deletions: Mark products as deleted (is_delete = 1, latest = 0)
     */
    if (!empty($ids_to_delete)) {
        $ids_to_delete_int = array_map('intval', $ids_to_delete);
        $placeholders = implode(',', array_fill(0, count($ids_to_delete_int), '?'));
        $types = str_repeat('i', count($ids_to_delete_int));
        
        $stmt_delete = $conn->prepare("UPDATE products SET is_delete = 1, latest = 1 WHERE id IN ($placeholders)");
        $stmt_delete->bind_param($types, ...$ids_to_delete_int);
        $stmt_delete->execute();
        $deleted_count = $stmt_delete->affected_rows;
        $stmt_delete->close();
    }

    /**
     * Handle stock status updates: Update in_stock for existing products
     */
    if (!empty($stock_changes)) {
        $stmt_stock_update = $conn->prepare("UPDATE products SET in_stock = ?, last_updated = NOW() WHERE id = ?");
        foreach ($stock_changes as $product) {
            $id = (int)$product['id'];
            $in_stock = (int)$product['inStock'];
            if ($id > 0) {
                $stmt_stock_update->bind_param("ii", $in_stock, $id);
                $stmt_stock_update->execute();
                $stock_updated_count += $stmt_stock_update->affected_rows;
            }
        }
        $stmt_stock_update->close();
    }

    /**
     * Handle price edits: Insert new version with same product_id and mark old version as latest = 0
     */
    $stmt_insert = $conn->prepare("INSERT INTO products (product_id, name, tamil_name, original_price, offer_price, category, latest, in_stock, last_updated,quantities) VALUES (?, ?, ?, ?, ?, ?, 1, ?, NOW(),?)");
    $stmt_update_latest = $conn->prepare("UPDATE products SET latest = 0 WHERE id = ?");

    foreach ($price_edits as $product) {
        $id = (int)$product['id'];
        $in_stock = isset($product['inStock']) ? (int)$product['inStock'] : 0;
        $product_id = $product['productId']; // Use existing product_id

        if ($id > 0) {
            // Mark old version as latest = 0
            $stmt_update_latest->bind_param("i", $id);
            $stmt_update_latest->execute();
            $updated_count++;
        }

        // Insert new version with same product_id
        $stmt_insert->bind_param("sssddsis", $product_id, $product['name'], $product['tamilName'], $product['originalPrice'], $product['offerPrice'], $product['category'], $in_stock,$product['quantities']);
        $stmt_insert->execute();
        $inserted_count++;
    }

    /**
     * Handle new product insertions: Generate product_id based on highest existing
     */
    $stmt_details_insert = $conn->prepare("INSERT INTO products_details (product_id, image, video, instagram, offer) VALUES (?, ?, ?, ?, ?)");

    foreach ($new_products as $product) {
        $in_stock = isset($product['inStock']) ? (int)$product['inStock'] : 0;

        // Get the highest product_id
        $result = $conn->query("SELECT product_id FROM products WHERE product_id LIKE 'P%' ORDER BY CAST(SUBSTRING(product_id, 2) AS UNSIGNED) DESC LIMIT 1");
        $next_id = 1;
        if ($result && $row = $result->fetch_assoc()) {
            $last_product_id = $row['product_id'];
            $last_number = (int)substr($last_product_id, 1);
            $next_id = $last_number + 1;
        }
        $new_product_id = 'P' . str_pad($next_id, 3, '0', STR_PAD_LEFT);

        $stmt_insert->bind_param("sssddsis", $new_product_id, $product['name'], $product['tamilName'], $product['originalPrice'], $product['offerPrice'], $product['category'], $in_stock,$product['quantities']);
        $stmt_insert->execute();
        $inserted_count++;

        // Insert into products_details
        $offer = (float)$product['offer'];
        $stmt_details_insert->bind_param("ssssd", $new_product_id, $product['image'], $product['video'], $product['instagram'], $offer);
        $stmt_details_insert->execute();
    }
    $stmt_insert->close();
    $stmt_update_latest->close();
    $stmt_details_insert->close();
    $conn->commit();

    echo json_encode([
        'status' => 'success',
        'message' => "Sync complete! New: $inserted_count, Updated (old versions): $updated_count, Stock Updated: $stock_updated_count, Deleted: $deleted_count."
    ]);


} catch (Exception $e) {
    if ($conn->ping()) {
        $conn->rollback();
    }
    http_response_code(500);
    echo json_encode(['status' => 'error', 'message' => $e->getMessage()]);
} finally {
    if (isset($conn) && $conn->ping()) {
        $conn->close();
    }
}
?>