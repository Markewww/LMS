<?php
// src/API/admin/add_book.php
// CORS headers are handled centrally in dbconfig.php
require_once "../dbconfig.php";
require_once "../require_admin.php";
require_once "../activity_logger.php";
requireStaff($conn);

// Get raw JSON data from the Axios request
$json = file_get_contents("php://input");
$data = json_decode($json, true);

// 1. Validation Check
if (!$data || !isset($data['uuid'])) {
    echo json_encode(["success" => false, "message" => "No Book Data received."]);
    exit;
}

$isbn = $data['isbn'] ?? null; // was used below but never defined before

// 2. Start Transaction
$conn->begin_transaction();

try {
    // 3. Prepare Insert Query for books_inventory
    $stmt = $conn->prepare("INSERT INTO books_inventory
        (uuid, title, authors, publisher, copyright_year, isbn, category, stock, qr_data, barcode)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)");

    // s = string, i = integer
    $stmt->bind_param("ssssississ",
        $data['uuid'],
        $data['title'],
        $data['authors'],
        $data['publisher'],
        $data['copyright_year'],
        $isbn,
        $data['category'],
        $data['stock'],
        $data['qr_data'],
        $data['barcode']
    );

    if ($stmt->execute()) {
        $conn->commit();

        logActivity($conn, 'book.add', 'books_inventory', $data['barcode'] ?? $data['uuid'], [
            'title'          => $data['title'] ?? null,
            'authors'        => $data['authors'] ?? null,
            'publisher'      => $data['publisher'] ?? null,
            'copyright_year' => $data['copyright_year'] ?? null,
            'isbn'           => $isbn,
            'category'       => $data['category'] ?? null,
            'stock'          => $data['stock'] ?? null,
        ]);

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
if (isset($stmt) && $stmt) $stmt->close();
$conn->close();
?>