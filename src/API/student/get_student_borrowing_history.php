<?php
// 1. ALLOW CORS AND DEFINE JSON OUTPUT HEADERS
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");
header("Content-Type: application/json; charset=UTF-8");

// 2. INCLUDE DATABASE CONNECTION CONFIG
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

// 3. CAPTURE ACTIVE STUDENT LOG ID PARAMETER
$student_id = $_GET['student_id'] ?? null;
if (!$student_id || trim($student_id) === "") {
    http_response_code(400);
    echo json_encode(["error" => "Missing student session identifier token query."]);
    exit();
}

try {
    // 4. UNIFIED DUAL-ASSET HISTORICAL QUERY CORES (CORRECTED COLUMN TARGETS)
    // First segment reads textbooks from circulation_logs joined on barcode
    // Second segment reads manuscripts from research_logs joined on code, extracting rp.title correctly
    $sql = "
        (SELECT 
            cl.uuid as id,
            bi.title,
            'book' as asset_type,
            cl.borrow_date,
            cl.due_date,
            cl.return_date,
            cl.status
         FROM circulation_logs cl
         JOIN books_inventory bi ON cl.barcode = bi.barcode
         WHERE cl.student_id = ?)
         
        UNION ALL
        
        (SELECT 
            rl.uuid as id,
            rp.title, 
            'research' as asset_type,
            rl.borrow_date,
            rl.due_date,
            rl.return_date,
            rl.status
         FROM research_logs rl
         JOIN research_projects rp ON rl.code = rp.code
         WHERE rl.student_id = ?)
         
        ORDER BY borrow_date DESC, id DESC
    ";

    $stmt = $conn->prepare($sql);
    $stmt->bind_param("ss", $student_id, $student_id);
    $stmt->execute();
    $result = $stmt->get_result();

    $history = [];
    while ($row = $result->fetch_assoc()) {
        // Map database status flags cleanly to frontend visual casing values
        $statusValue = "Pending";
        if ($row['status'] === 'returned') {
            $statusValue = "Returned";
        } elseif ($row['status'] === 'overdue') {
            $statusValue = "Overdue";
        } elseif ($row['status'] === 'borrowed') {
            $statusValue = "Pending"; // Currently actively checked out by the borrower
        }

        $history[] = [
            "id"         => $row['id'],
            "title"      => !empty($row['title']) ? $row['title'] : "Untitled Library Asset",
            "asset_type" => $row['asset_type'],
            // Convert native database timestamps to clean corporate calendar strings direct from PHP
            "date"       => date("M d, Y", strtotime($row['borrow_date'])),
            "due"        => date("M d, Y", strtotime($row['due_date'])),
            "status"     => $statusValue
        ];
    }

    http_response_code(200);
    echo json_encode($history);

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        "error" => "History logs synchronization crash",
        "message" => $e->getMessage()
    ]);
} finally {
    if (isset($stmt)) $stmt->close();
    if (isset($conn)) $conn->close();
}
?>
