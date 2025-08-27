<?php
// This header allows requests from any origin.
header("Access-Control-Allow-Origin: *");

// This header specifies which HTTP methods are allowed (e.g., POST, GET).
header("Access-Control-Allow-Methods: POST, GET, OPTIONS, DELETE, PUT");

// This header is necessary for requests that include a 'Content-Type' header, like ours.
header("Access-Control-Allow-Headers: Content-Type, Authorization");

// When a browser sends a pre-flight OPTIONS request, we can just send back a 200 OK.
if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
    http_response_code(200);
    exit();
}

// --- The rest of your file remains the same ---

// Set the content type to JSON for all responses from here on.
header("Content-Type: application/json; charset=UTF-8");

$servername = "localhost";
$username = "root";
$password = "";
$dbname = "prabhu";

// Create connection
$conn = new mysqli($servername, $username, $password, $dbname);

// Check connection
if ($conn->connect_error) {
    // We send a valid JSON error, not just text.
    http_response_code(500);
    die(json_encode(["error" => "Connection failed: " . $conn->connect_error]));
}

// Set character set to utf8mb4
$conn->set_charset("utf8mb4");
?>