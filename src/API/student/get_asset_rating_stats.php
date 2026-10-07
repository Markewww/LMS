<?php
// 1. INTRODUCE MANDATORY CORS SECURITY ACCESS HEADERS
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");
header("Content-Type: application/json; charset=UTF-8");

// 2. INCLUDE DATABASE CONNECTION
require_once "../dbconfig.php";

if (!$conn) {
    http_response_code(500);
    echo json_encode(["success" => false, "message" => "Database Connection Failure"]);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    http_response_code(405);
    echo json_encode(["success" => false, "message" => "Method Not Allowed. Use GET requests."]);
    exit;
}

// 3. CAPTURE AND VALIDATE INBOUND URL QUERY STRING SLUGS
$asset_id   = $_GET['asset_id'] ?? null;
$asset_type = $_GET['asset_type'] ?? null;
$student_id = $_GET['student_id'] ?? null; // Capture active viewer identity token

if (!$asset_id || !$asset_type) {
    http_response_code(400);
    echo json_encode(["success" => false, "message" => "Missing required lookup parameters."]);
    exit;
}

try {
    // Initialize standard fallback counters matrix array channels
    $distribution = [5 => 0, 4 => 0, 3 => 0, 2 => 0, 1 => 0];
    $total_votes = 0;
    $sum_scores = 0;

    // 4. PIPELINE SEGMENT A: COUNT DISTRIBUTION BREAKDOWNS GROUP HITS
    $sql = "SELECT rating_score, COUNT(*) as count 
            FROM asset_ratings 
            WHERE asset_id = ? AND asset_type = ? 
            GROUP BY rating_score";
            
    $stmt = $conn->prepare($sql);
    $stmt->bind_param("ss", $asset_id, $asset_type);
    $stmt->execute();
    $result = $stmt->get_result();

    while ($row = $result->fetch_assoc()) {
        $score = (int)$row['rating_score'];
        $count = (int)$row['count'];
        
        $distribution[$score] = $count;
        $total_votes += $count;
        $sum_scores += ($score * $count);
    }

    $average_score = $total_votes > 0 ? round($sum_scores / $total_votes, 1) : 0.0;

    // 5. PIPELINE SEGMENT B: LOOK UP CURRENT ACTIVE VIEWERS LOGGED VOTE
    $user_current_vote = 0;
    if (!empty($student_id)) {
        $userSql = "SELECT rating_score 
                    FROM asset_ratings 
                    WHERE student_id = ? AND asset_id = ? AND asset_type = ? 
                    LIMIT 1";
                    
        $userStmt = $conn->prepare($userSql);
        $userStmt->bind_param("sss", $student_id, $asset_id, $asset_type);
        $userStmt->execute();
        $userResult = $userStmt->get_result()->fetch_assoc();
        
        if ($userResult) {
            $user_current_vote = (int)$userResult['rating_score'];
        }
    }

    // 6. DISPATCH FRESH AGGREGATED METRICS DATA TO FRONTEND
    http_response_code(200);
    echo json_encode([
        "success"           => true,
        "average_score"     => (float)$average_score,
        "total_votes"       => (int)$total_votes,
        "distribution"      => $distribution,
        "user_current_vote" => $user_current_vote
    ]);

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(["success" => false, "message" => "Server transaction exception: " . $e->getMessage()]);
} finally {
    if (isset($stmt)) $stmt->close();
    if (isset($userStmt)) $userStmt->close();
    $conn->close();
}
?>
