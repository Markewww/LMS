<?php
require_once "../dbconfig.php";

if (!isset($_GET['student_id'])) {
    echo json_encode(["error" => "Student ID is required"]);
    exit;
}

$student_id = $_GET['student_id'];

try {
    // We use a prepared statement to prevent SQL injection
    $stmt = $conn->prepare("SELECT 
            a.user_id AS student_id,
            a.account_status,
            a.email,
            s.first_name,
            s.middle_name,
            s.last_name,
            s.suffix,
            s.course,
            s.contact_number,
            s.qr_data,
            s.created_at
        FROM accounts a
        INNER JOIN students s ON a.user_id = s.student_id
        WHERE a.user_id = ? AND a.user_type = 'student'
        LIMIT 1");

    $stmt->bind_param("s", $student_id);
    $stmt->execute();
    $result = $stmt->get_result();

    if ($row = $result->fetch_assoc()) {
        echo json_encode($row);
    } else {
        echo json_encode(["error" => "Student profile not found"]);
    }

    $stmt->close();
} catch (Exception $e) {
    echo json_encode(["error" => "Server Error: " . $e->getMessage()]);
}

$conn->close();
?>
