<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST");
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json");

require_once "../dbconfig.php";

// Get raw JSON data from the Axios request
$json = file_get_contents("php://input");
$data = json_decode($json, true);

// 1. Validation Check
if (!$data || !isset($data['uuid'])) {
    echo json_encode(["success" => false, "message" => "No Book Data received."]);
    exit;
}

// 2. Start Transaction
$conn->begin_transaction();

try {
    // 3. Prepare Insert Query for books_inventory
    $stmt = $conn->prepare("INSERT INTO books_inventory 
        (uuid, title, authors, publisher, copyright_year, isbn, category, stock, qr_data, barcode) 
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)");
    
    // Type definitions for bind_param:
    // s = string (uuid, title, authors, publisher, isbn, category, qr_data, barcode)
    // i = integer (copyright_year, stock)
    $stmt->bind_param("ssssississ", 
        $data['uuid'],           // varchar(36)
        $data['title'],          // varchar
        $data['authors'],        // text
        $data['publisher'],      // varchar
        $data['copyright_year'], // year (integer-like)
        $data['isbn'],           // varchar
        $data['category'],       // enum('book', 'magazine', 'journal')
        $data['stock'],          // int
        $data['qr_data'],        // text
        $data['barcode']         // varchar
    );

    if ($stmt->execute()) {
        $conn->commit();
        echo json_encode(["success" => true, "message" => "Book saved successfully to inventory!"]);
    } else {
        throw new Exception("Execution failed: " . $stmt->error);
    }

} catch (Exception $e) {
    // 4. Rollback on failure
    $conn->rollback();
    echo json_encode(["success" => false, "message" => "Database Error: " . $e->getMessage()]);
}

// 5. Close connections
$stmt->close();
$conn->close();
?>
