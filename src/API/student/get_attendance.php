<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");
header("Content-Type: application/json; charset=UTF-8");

require_once "../dbconfig.php";

if (!$conn) {
    http_response_code(500);
    echo json_encode(["error" => "Database Connection Failure"]);
    exit();
}

if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    http_response_code(405);
    echo json_encode(["error" => "Method Not Allowed."]);
    exit();
}

try {
    $student_id = isset($_GET['student_id']) ? trim($_GET['student_id']) : '';

    if (empty($student_id)) {
        http_response_code(400);
        echo json_encode(["error" => "Missing required parameter student_id."]);
        exit();
    }

    // Prepared template query reading logs chronologically from your exact table fields layout
    $query = "SELECT uuid, student_id, log_date, course, time_in, time_out, duration 
              FROM attendance_logs 
              WHERE student_id = ? 
              ORDER BY log_date DESC, time_in DESC";

    $stmt = $conn->prepare($query);
    if (!$stmt) {
        throw new Exception($conn->error);
    }

    $stmt->bind_param("s", $student_id);
    $stmt->execute();
    $result = $stmt->get_result();

    $logs = [];
    while ($row = $result->fetch_assoc()) {
        $logs[] = $row;
    }

    http_response_code(200);
    echo json_encode($logs);
    
    $stmt->close();

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(["error" => "Server Task Error", "message" => $e->getMessage()]);
}

$conn->close();
?>
