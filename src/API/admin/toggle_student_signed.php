<?php
// src/API/admin/toggle_student_signed.php
require_once "../dbconfig.php";
require_once "../require_admin.php";
require_once "../activity_logger.php";

if (!$conn) {
    http_response_code(500);
    echo json_encode(["success" => false, "message" => "Database Connection Failure"]);
    exit();
}

requireStaff($conn);

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(["success" => false, "message" => "Method Not Allowed."]);
    exit();
}

try {
    $data = json_decode(file_get_contents("php://input"), true);
    $studentId = trim($data['student_id'] ?? '');
    $signed = !empty($data['signed']) ? 1 : 0;

    if ($studentId === '') {
        http_response_code(400);
        echo json_encode(["success" => false, "message" => "Student ID is required."]);
        exit();
    }

    $stmt = $conn->prepare("
        UPDATE students 
        SET clearance_signed = ?, 
            clearance_signed_at = IF(? = 1, NOW(), NULL) 
        WHERE student_id = ?
    ");
    $stmt->bind_param("iis", $signed, $signed, $studentId);

    if ($stmt->execute()) {
        $stmt->close();

        logActivity($conn, $signed ? 'student.clearance_signed' : 'student.clearance_unsigned', 'student', $studentId, [
            'signed' => (bool)$signed
        ]);

        echo json_encode([
            "success" => true,
            "clearance_signed" => $signed
        ]);
    } else {
        throw new Exception($stmt->error);
    }
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(["success" => false, "message" => $e->getMessage()]);
}
?>
