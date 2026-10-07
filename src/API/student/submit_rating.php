<?php
// 1. ALLOW CORS AND DEFINE JSON PAYLOAD INPUT HEADERS
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");
header("Content-Type: application/json; charset=UTF-8");

// 2. INCLUDE DATABASE CONNECTION CONFIG
require_once "../dbconfig.php";

if (!$conn) {
    http_response_code(500);
    echo json_encode(["success" => false, "message" => "Database Connection Failure"]);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(["success" => false, "message" => "Method Not Allowed. Use POST requests."]);
    exit;
}

// 3. CAPTURE AND VALIDATE INBOUND PAYLOAD
$data = json_decode(file_get_contents("php://input"), true);

$student_id  = $data['student_id'] ?? null;
$asset_id    = $data['asset_id'] ?? null;
$asset_type  = $data['asset_type'] ?? null; // 'book' or 'research'
$rating_score = isset($data['rating_score']) ? intval($data['rating_score']) : 0;

if (!$student_id || !$asset_id || !$asset_type || $rating_score < 1 || $rating_score > 5) {
    http_response_code(400);
    echo json_encode(["success" => false, "message" => "Invalid Request Parameters. Score must be between 1 and 5."]);
    exit;
}

try {
    // 4. UPSERT ENGINE ROUTINE
    // Inserts the row if it's the student's first time rating it; updates it if they're changing a previous vote
    $sql = "INSERT INTO asset_ratings (student_id, asset_id, asset_type, rating_score) 
            VALUES (?, ?, ?, ?) 
            ON DUPLICATE KEY UPDATE rating_score = VALUES(rating_score)";
            
    $stmt = $conn->prepare($sql);
    $stmt->bind_param("sssi", $student_id, $asset_id, $asset_type, $rating_score);
    $stmt->execute();

    // 5. FETCH THE BRAND NEW RE-CALCULATED AVERAGE FOR THIS ASSET RIGHT AWAY
    $avgSql = "SELECT AVG(rating_score) as average_score, COUNT(*) as total_votes 
               FROM asset_ratings 
               WHERE asset_id = ? AND asset_type = ?";
               
    $avgStmt = $conn->prepare($avgSql);
    $avgStmt->bind_param("ss", $asset_id, $asset_type);
    $avgStmt->execute();
    $stats = $avgStmt->get_result()->fetch_assoc();

    http_response_code(200);
    echo json_encode([
        "success"       => true,
        "message"       => "Rating recorded successfully.",
        "average_score" => round(floatval($stats['average_score']), 1),
        "total_votes"   => intval($stats['total_votes'])
    ]);

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(["success" => false, "message" => "Server transaction crash: " . $e->getMessage()]);
} finally {
    if (isset($stmt)) $stmt->close();
    if (isset($avgStmt)) $avgStmt->close();
    $conn->close();
}
?>
