<?php
require_once "../dbconfig.php";

$qr_input = $_GET['id'] ?? null;

if (!$qr_input) {
    echo json_encode(["success" => false, "message" => "No QR Data"]);
    exit;
}

try {
    $stmt = $conn->prepare("SELECT student_id, first_name, last_name, course FROM students WHERE qr_data = ?");
    $stmt->bind_param("s", $qr_input);
    $stmt->execute();
    $student = $stmt->get_result()->fetch_assoc();

    if (!$student) {
        echo json_encode(["success" => false, "message" => "Student not found"]);
        exit;
    }

    $sid = $student['student_id'];
    $fullName = $student['first_name'] . " " . $student['last_name'];
    $course = $student['course'];

    $checkStmt = $conn->prepare("SELECT uuid, time_in FROM attendance_logs WHERE student_id = ? AND time_out IS NULL LIMIT 1");
    $checkStmt->bind_param("s", $sid);
    $checkStmt->execute();
    $openSession = $checkStmt->get_result()->fetch_assoc();

    if ($openSession) {
        $logID = $openSession['uuid'];
        $timeIn = new DateTime($openSession['time_in']);
        $timeOut = new DateTime();
        
        $interval = $timeIn->diff($timeOut);
        $hours = ($interval->days * 24) + $interval->h;
        $minutes = $interval->i;
        $seconds = $interval->s;
        $duration = $hours . "hrs " . $minutes . "mins " . $seconds . "secs";

        $updateStmt = $conn->prepare("UPDATE attendance_logs SET time_out = NOW(), duration = ? WHERE uuid = ?");
        $updateStmt->bind_param("si", $duration, $logID);
        $updateStmt->execute();

        echo json_encode([
            "success" => true,
            "status" => "TIMED OUT",
            "name" => $fullName,
            "student_id" => $sid,
            "duration" => $duration
        ]);

    } else {
        $insertStmt = $conn->prepare("INSERT INTO attendance_logs (student_id, course, time_in) VALUES (?, ?, NOW())");
        $insertStmt->bind_param("ss", $sid, $course);
        $insertStmt->execute();

        echo json_encode([
            "success" => true,
            "status" => "TIMED IN",
            "name" => $fullName,
            "student_id" => $sid
        ]);
    }

} catch (Exception $e) {
    echo json_encode(["success" => false, "message" => $e->getMessage()]);
}

$conn->close();
?>
