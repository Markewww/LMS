<?php
// src/API/admin/delete_book.php
require_once "../dbconfig.php";
require_once "../require_admin.php";
require_once "../activity_logger.php";
requireStaff($conn);

$data = json_decode(file_get_contents("php://input"), true);

if (!isset($data['book_id'])) {
    echo json_encode(["success" => false, "message" => "No Book ID provided."]);
    exit;
}

$id = $data['book_id'];

try {
    // Snapshot the record BEFORE deleting it (it will be gone afterwards)
    $snap = $conn->prepare("SELECT uuid, barcode, title, authors, publisher, copyright_year, isbn, category, stock
                            FROM books_inventory WHERE uuid = ?");
    $snap->bind_param("s", $id);
    $snap->execute();
    $old = $snap->get_result()->fetch_assoc();
    $snap->close();

    // We use the uuid column because it is your Primary Key
    $stmt = $conn->prepare("DELETE FROM books_inventory WHERE uuid = ?");
    $stmt->bind_param("s", $id);

    if ($stmt->execute()) {
        if ($old && $stmt->affected_rows > 0) {
            logActivity($conn, 'book.delete', 'books_inventory', $old['barcode'] ?: $id, ['deleted' => $old]);
        }
        echo json_encode(["success" => true, "message" => "Book deleted successfully."]);
    } else {
        echo json_encode(["success" => false, "message" => "Failed to delete: " . $stmt->error]);
    }
} catch (Exception $e) {
    echo json_encode(["success" => false, "message" => $e->getMessage()]);
}

$conn->close();
?>