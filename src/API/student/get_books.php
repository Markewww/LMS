<?php
// 1. ALLOW CORS AND DEFINE JSON OUTPUT HEADERS
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");
header("Content-Type: application/json; charset=UTF-8");

// 2. INCLUDE YOUR DATABASE CONFIGURATION FILE
require_once "../dbconfig.php";

if (!$conn) {
    http_response_code(500);
    echo json_encode(["error" => "Database Connection Failure"]);
    exit();
}

if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    http_response_code(405);
    echo json_encode(["error" => "Method Not Allowed. Use GET requests."]);
    exit();
}

try {
    // 3. ENHANCED SQL PIPELINE MATRIX WITH LIVE STAR AGGREGATIONS
    $sql = "SELECT bi.uuid, bi.title, bi.authors, bi.publisher, bi.copyright_year, bi.isbn, bi.category, bi.qr_data, bi.barcode, bi.stock,
                   COALESCE(ROUND(AVG(ar.rating_score), 1), 0.0) as average_rating,
                   COUNT(ar.id) as total_reviews
            FROM books_inventory bi
            LEFT JOIN asset_ratings ar ON bi.barcode = ar.asset_id AND ar.asset_type = 'book'
            GROUP BY bi.uuid
            ORDER BY bi.title ASC";

    $result = $conn->query($sql);

    if ($result) {
        $books = [];
        while ($row = $result->fetch_assoc()) {
            $books[] = [
                "uuid"           => $row['uuid'],
                "title"          => $row['title'],
                "authors"        => $row['authors'],
                "publisher"      => $row['publisher'],
                "copyright_year" => $row['copyright_year'],
                "isbn"           => $row['isbn'],
                "category"       => $row['category'],
                "qr_data"        => $row['qr_data'],
                "barcode"        => $row['barcode'],
                "stock"          => (int)$row['stock'],
                "rating"         => (float)$row['average_rating'],
                "reviews_count"  => (int)$row['total_reviews']
            ];
        }
        http_response_code(200);
        echo json_encode($books);
    } else {
        http_response_code(500);
        echo json_encode(["error" => "Inventory Query Failure: " . $conn->error]);
    }
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        "error" => "Server Operation Error",
        "message" => $e->getMessage()
    ]);
} finally {
    if (isset($conn)) {
        $conn->close();
    }
}
?>
