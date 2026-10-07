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
    // 3. ENHANCED DUAL LEFT-JOIN SQL AGGREGATION WITH RATINGS CALCULATION
    $sql = "SELECT r.*,
                   s.first_name AS owner_fname,
                   s.last_name AS owner_Iname,
                   adm.first_name AS admin_fname,
                   adm.last_name AS admin_Iname,
                   COALESCE(ROUND(AVG(ar.rating_score), 1), 0.0) as average_rating,
                   COUNT(ar.id) as total_reviews
            FROM research_projects r
            LEFT JOIN students s ON r.submitted_by = s.student_id
            LEFT JOIN admin adm ON r.submitted_by = adm.employee_id
            LEFT JOIN asset_ratings ar ON r.uuid = ar.asset_id AND ar.asset_type = 'research'
            GROUP BY r.uuid
            ORDER BY r.created_at DESC";

    $result = $conn->query($sql);

    if ($result) {
        $submissions = [];
        while ($row = $result->fetch_assoc()) {
            // Build a clean combined uploader name string
            if (!empty($row['owner_fname'])) {
                $row['uploader_name'] = trim($row['owner_fname'] . ' ' . $row['owner_Iname']);
            } elseif (!empty($row['admin_fname'])) {
                $row['uploader_name'] = trim($row['admin_fname'] . ' ' . $row['admin_Iname']);
            } else {
                $row['uploader_name'] = $row['submitted_by'];
            }
            
            // Map computed rating values directly into item response payloads
            $row['rating'] = (float)$row['average_rating'];
            $row['reviews_count'] = (int)$row['total_reviews'];
            
            $submissions[] = $row;
        }
        http_response_code(200);
        echo json_encode($submissions);
    } else {
        http_response_code(500);
        echo json_encode(["error" => "Query failed: " . $conn->error]);
    }
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(["error" => "Server Error: " . $e->getMessage()]);
} finally {
    if (isset($conn)) {
        $conn->close();
    }
}
?>
