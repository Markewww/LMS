<?php
require_once "../dbconfig.php";

// Get raw JSON data from Axios
$json = file_get_contents("php://input");
$data = json_decode($json, true);

// 1. Validation Check: Ensure we have the ID to identify the book
if (!$data || !isset($data['uuid'])) {
    echo json_encode(["success" => false, "message" => "No Resource ID received."]);
    exit;
}

$uuid = $data['uuid'];

// 2. Start Transaction to maintain data integrity
$conn->begin_transaction();

try {
    // 3. Prepare Update Query for books_inventory
    // s = string, i = integer
    $stmt = $conn->prepare("UPDATE books_inventory SET 
        title = ?, 
        authors = ?, 
        publisher = ?, 
        copyright_year = ?, 
        isbn = ?, 
        category = ?, 
        stock = ? 
        WHERE uuid = ?");
    
    $stmt->bind_param("ssssisis", 
        $data['title'],           // varchar
        $data['author'],          // text (mapped from chip input)
        $data['publisher'],       // varchar
        $data['copyright_year'],  // year
        $data['isbn'],            // varchar
        $data['type'],            // enum ('book', 'magazine', 'journal')
        $data['stock'],           // int
        $uuid                     // varchar(36) - PK
    );

    if ($stmt->execute()) {
        $conn->commit(); // Save changes
        echo json_encode(["success" => true, "message" => "Inventory record updated successfully!"]);
    } else {
        throw new Exception("Execution failed: " . $stmt->error);
    }

} catch (Exception $e) {
    // 4. Rollback if any error occurs
    $conn->rollback();
    echo json_encode(["success" => false, "message" => "Database Error: " . $e->getMessage()]);
}

// 5. Close connection
$stmt->close();
$conn->close();
?>
