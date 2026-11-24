<?php
// src/API/admin/update_book.php
require_once "../dbconfig.php";
require_once "../require_admin.php";
require_once "../activity_logger.php";
requireStaff($conn);

// Get raw JSON data from Axios
$json = file_get_contents("php://input");
$data = json_decode($json, true);

// 1. Validation Check: Ensure we have the ID to identify the book
if (!$data || !isset($data['uuid'])) {
    echo json_encode(["success" => false, "message" => "No Resource ID received."]);
    exit;
}

$uuid = $data['uuid'];

// Snapshot the record BEFORE it changes (for the audit log)
$snap = $conn->prepare("SELECT barcode, title, authors, publisher, copyright_year, isbn, category, stock
                        FROM books_inventory WHERE uuid = ?");
$snap->bind_param("s", $uuid);
$snap->execute();
$before = $snap->get_result()->fetch_assoc() ?: [];
$snap->close();

// 2. Start Transaction to maintain data integrity
$conn->begin_transaction();

try {
    // 3. Prepare Update Query for books_inventory
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
        $data['title'],
        $data['author'],         // mapped from chip input
        $data['publisher'],
        $data['copyright_year'],
        $data['isbn'],
        $data['type'],           // enum ('book', 'magazine', 'journal')
        $data['stock'],
        $uuid
    );

    if ($stmt->execute()) {
        $conn->commit();

        logChange($conn, 'book.edit', 'books_inventory', $before['barcode'] ?? $uuid, $before, [
            'title'          => $data['title'] ?? null,
            'authors'        => $data['author'] ?? null,
            'publisher'      => $data['publisher'] ?? null,
            'copyright_year' => $data['copyright_year'] ?? null,
            'isbn'           => $data['isbn'] ?? null,
            'category'       => $data['type'] ?? null,
            'stock'          => $data['stock'] ?? null,
        ], ['title' => $before['title'] ?? ($data['title'] ?? null)]);

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
if (isset($stmt) && $stmt) $stmt->close();
$conn->close();
?>