<?php
require_once "../dbconfig.php";

try {
    // We try to get the max UUID. If your UUIDs are purely numeric strings:
    $query = "SELECT uuid FROM books_inventory ORDER BY CAST(uuid AS UNSIGNED) DESC LIMIT 1";
    $result = $conn->query($query);

    if ($result->num_rows > 0) {
        $row = $result->fetch_assoc();
        $lastId = (int)$row['uuid'];
        $nextId = $lastId + 1;
    } else {
        $nextId = 1001; // Starting ID if table is empty
    }

    echo json_encode(["success" => true, "next_id" => (string)$nextId]);

} catch (Exception $e) {
    echo json_encode(["success" => false, "message" => $e->getMessage()]);
}
?>
