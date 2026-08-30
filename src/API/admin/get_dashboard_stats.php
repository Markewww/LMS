<?php
// 1. ALLOW CORS AND DEFINE JSON OUTPUT HEADERS (Must be at the very top, no spaces before <?php)
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");
header("Content-Type: application/json; charset=UTF-8");

// 2. DATABASE CONNECTION FILE
require_once "../dbconfig.php";

// Check if connection exists and is valid
if (!$conn) {
    http_response_code(500);
    echo json_encode([
        "error" => "Database Connection Failure",
        "totalBooks" => 0,
        "totalStudents" => 0,
        "activeVisitors" => 0,
        "pendingResearch" => 0
    ]);
    exit();
}

try {
    // ---- METRIC 1: TOTAL BOOKS ----
    $queryBooks = "SELECT COUNT(*) as total FROM books_inventory";
    $resultBooks = $conn->query($queryBooks);
    if (!$resultBooks) throw new Exception($conn->error);
    $rowBooks = $resultBooks->fetch_assoc();
    $totalBooks = (int)$rowBooks['total'];

    // ---- METRIC 2: TOTAL REGISTERED STUDENTS ----
    $queryStudents = "SELECT COUNT(*) as total FROM accounts WHERE user_type = 'student'";
    $resultStudents = $conn->query($queryStudents);
    if (!$resultStudents) throw new Exception($conn->error);
    $rowStudents = $resultStudents->fetch_assoc();
    $totalStudents = (int)$rowStudents['total'];

    // ---- METRIC 3: LIVE ACTIVE VISITORS (TODAY) ----
    $queryActive = "SELECT COUNT(*) as total FROM attendance_logs WHERE log_date = CURDATE() AND time_out IS NULL";
    $resultActive = $conn->query($queryActive);
    if (!$resultActive) throw new Exception($conn->error);
    $rowActive = $resultActive->fetch_assoc();
    $activeVisitors = (int)$rowActive['total'];

    // ---- METRIC 4: PENDING RESEARCH REVIEWS ----
    $queryPending = "SELECT COUNT(*) as total FROM research_projects WHERE status = 'pending'";
    $resultPending = $conn->query($queryPending);
    if (!$resultPending) throw new Exception($conn->error);
    $rowPending = $resultPending->fetch_assoc();
    $pendingResearch = (int)$rowPending['total'];

    // 3. COMBINE DATA INTO THE EXACT STRUCTURE THE FRONTEND EXPECTS
    $response = [
        "totalBooks" => $totalBooks,
        "totalStudents" => $totalStudents,
        "activeVisitors" => $activeVisitors,
        "pendingResearch" => $pendingResearch
    ];

    // Send successful response
    http_response_code(200);
    echo json_encode($response);

} catch (Exception $e) {
    // Send fallback data structure if query fails so your frontend doesn't crash
    http_response_code(500);
    echo json_encode([
        "error" => "Database Query Failure",
        "message" => $e->getMessage(),
        "totalBooks" => 0,
        "totalStudents" => 0,
        "activeVisitors" => 0,
        "pendingResearch" => 0
    ]);
}
?>
