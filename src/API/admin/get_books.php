<?php
require_once "../dbconfig.php";

try {
    // We select uuid as book_id to match your React component's expectations
    // and authors as author for the table display logic
    $sql = "SELECT 
                uuid as book_id, 
                title, 
                authors as author, 
                publisher, 
                copyright_year, 
                isbn, 
                category as type, 
                category, 
                stock, 
                qr_data, 
                barcode 
            FROM books_inventory 
            ORDER BY uuid DESC";

    $result = $conn->query($sql);

    $books = [];

    if ($result->num_rows > 0) {
        while($row = $result->fetch_assoc()) {
            // Ensure numeric values are returned as integers
            $row['stock'] = (int)$row['stock'];
            $books[] = $row;
        }
    }

    echo json_encode($books);

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(["success" => false, "message" => $e->getMessage()]);
}

$conn->close();
?>
