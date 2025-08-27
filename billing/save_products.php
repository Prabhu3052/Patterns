<?php
header('Content-Type: application/json');
include 'db_config.php';

// Tell MySQLi to throw exceptions on errors
mysqli_report(MYSQLI_REPORT_ERROR | MYSQLI_REPORT_STRICT);

$data = json_decode(file_get_contents("php://input"), true);

try {
    // Start the transaction
    $conn->begin_transaction();

    if (isset($data['action']) && $data['action'] == 'update') {
        $stmt = $conn->prepare("UPDATE products SET name=?, tamil_name=?, original_price=?, offer_price=?, category=?, in_stock=?, content=?, image=?, video=?, instagram=?, last_updated=? WHERE product_id=?");
        $stmt->bind_param("ssddsissssss", 
            $data['name'], 
            $data['tamil_name'], 
            $data['original_price'], 
            $data['offer_price'], 
            $data['category'], 
            $data['in_stock'], 
            $data['content'], 
            $data['image'], 
            $data['video'], 
            $data['instagram'], 
            $data['last_updated'],
            $data['product_id']
        );

        if ($stmt->execute()) {
            // If execution is successful, commit the transaction
            $conn->commit();
            echo json_encode(["status" => "success", "message" => "Product updated successfully."]);
        } else {
            // If there's an issue, rollback
            $conn->rollback();
            echo json_encode(["status" => "error", "message" => "Error updating record: " . $conn->error]);
        }
        $stmt->close();
    } else if (isset($data['action']) && $data['action'] == 'add') {
        $stmt = $conn->prepare("INSERT INTO products (product_id, name, tamil_name, original_price, offer_price, category, in_stock, content, image, video, instagram, last_updated) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)");
        $stmt->bind_param("ssddsissssss", 
            $data['product_id'],
            $data['name'], 
            $data['tamil_name'], 
            $data['original_price'], 
            $data['offer_price'], 
            $data['category'], 
            $data['in_stock'], 
            $data['content'], 
            $data['image'], 
            $data['video'], 
            $data['instagram'], 
            $data['last_updated']
        );

        if ($stmt->execute()) {
            // If execution is successful, commit the transaction
            $conn->commit();
            echo json_encode(["status" => "success", "message" => "New product added successfully."]);
        } else {
            // If there's an issue, rollback
            $conn->rollback();
            echo json_encode(["status" => "error", "message" => "Error adding product: " . $conn->error]);
        }
        $stmt->close();
    } else {
        echo json_encode(["status" => "error", "message" => "Invalid action."]);
    }
} catch (mysqli_sql_exception $e) {
    // Catch any exceptions and rollback the transaction to ensure data integrity
    $conn->rollback();
    echo json_encode(["status" => "error", "message" => "Database error: " . $e->getMessage()]);
}

$conn->close();
?>