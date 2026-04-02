<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json");

require_once "../dbconfig.php";

$data = json_decode(file_get_contents("php://input"), true);

if (!isset($data['book_id'])) {
    echo json_encode(["success" => false, "message" => "No Book ID provided."]);
    exit;
}

$id = $data['book_id'];

try {
    // We use the uuid column because it is your Primary Key
    $stmt = $conn->prepare("DELETE FROM books_inventory WHERE uuid = ?");
    $stmt->bind_param("s", $id);

    if ($stmt->execute()) {
        echo json_encode(["success" => true, "message" => "Book deleted successfully."]);
    } else {
        echo json_encode(["success" => false, "message" => "Failed to delete: " . $stmt->error]);
    }
} catch (Exception $e) {
    echo json_encode(["success" => false, "message" => $e->getMessage()]);
}

$conn->close();
?>
