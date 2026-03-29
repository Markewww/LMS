<?php
require_once "../dbconfig.php";

try {
    $date = $_GET['date'] ?? null;
    $query = "
        SELECT 
            al.uuid,
            al.student_id,
            CONCAT(s.first_name, ' ', s.last_name) AS full_name,
            DATE(al.time_in) AS date,
            TIME(al.time_in) AS time_in,
            TIME(al.time_out) AS time_out,
            al.duration
        FROM attendance_logs al
        INNER JOIN students s ON s.student_id = al.student_id
    ";

    if ($date) {
        $query .= " WHERE DATE(al.time_in) = ?";
    }

    $query .= " ORDER BY al.time_in DESC";
    $stmt = $conn->prepare($query);

    if ($date) {
        $stmt->bind_param("s", $date);
    }

    $stmt->execute();
    $result = $stmt->get_result();

    $logs = [];

    while ($row = $result->fetch_assoc()) {
        $logs[] = $row;
    }

    echo json_encode($logs);

} catch (Exception $e) {
    echo json_encode([
        "success" => false,
        "message" => $e->getMessage()
    ]);
}

$conn->close();
?>