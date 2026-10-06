<?php
// 1. ALLOW CORS AND DEFINE JSON OUTPUT HEADERS
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");
header("Content-Type: application/json; charset=UTF-8");

// 2. INCLUDE DATABASE CONFIGURATION
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
    // 3. UNIFIED DUAL-ASSET SQL EXECUTION MATRIX
    // Uses UNION ALL to pull entries from both independent logging tables, matching types up seamlessly
    $sql = "
        (SELECT 
            cl.uuid AS loan_id,
            cl.student_id,
            CONCAT(s.first_name, ' ', s.last_name) AS full_name,
            bi.title AS asset_title,
            'book' AS asset_type,
            cl.borrow_date,
            cl.due_date,
            cl.return_date,
            cl.status
        FROM circulation_logs cl
        JOIN students s ON cl.student_id = s.student_id
        JOIN books_inventory bi ON cl.barcode = bi.barcode)
        
        UNION ALL
        
        (SELECT 
            rl.uuid AS loan_id,
            rl.student_id,
            CONCAT(s.first_name, ' ', s.last_name) AS full_name,
            rp.title AS asset_title,
            'research' AS asset_type,
            rl.borrow_date,
            rl.due_date,
            rl.return_date,
            rl.status
        FROM research_logs rl
        JOIN students s ON rl.student_id = s.student_id
        JOIN research_projects rp ON rl.code = rp.code)
        
        ORDER BY borrow_date DESC, loan_id DESC
    ";

    $result = $conn->query($sql);

    if ($result) {
        $logs = [];
        while ($row = $result->fetch_assoc()) {
            // Clean up any double spaces caused by trailing database inputs
            $formattedName = preg_replace('/\s+/', ' ', trim($row['full_name']));
            
            $logs[] = [
                "loan_id"     => $row['loan_id'],
                "student_id"  => $row['student_id'],
                "full_name"   => $formattedName,
                "asset_title" => $row['asset_title'],
                "asset_type"  => $row['asset_type'],
                "borrow_date" => date("M d, Y", strtotime($row['borrow_date'])),
                "due_date"    => date("M d, Y", strtotime($row['due_date'])),
                "return_date" => $row['return_date'] ? date("M d, Y", strtotime($row['return_date'])) : null,
                "status"      => $row['status']
            ];
        }
        
        http_response_code(200);
        echo json_encode($logs);
    } else {
        http_response_code(500);
        echo json_encode(["error" => "Circulation Log Compilation Failure: " . $conn->error]);
    }

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        "error" => "Server Core Operation Failure",
        "message" => $e->getMessage()
    ]);
}

$conn->close();
?>
