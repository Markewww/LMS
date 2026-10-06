<?php
// src\API\admin\get_top_visitors.php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET");
header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With");
header("Content-Type: application/json; charset=UTF-8");

require_once "../dbconfig.php";

if (!$conn) {
    http_response_code(500);
    echo json_encode(["success" => false, "message" => "Database Connection Failure"]);
    exit();
}

try {
    $currentMonth = date('m');
    $currentYear = date('Y');

    // PIPELINE ATTEMPT 1: Search strictly for data logged in the Current Month
    // UPDATED CORES: Uses COALESCE(al.time_out, NOW()) to calculate live stay durations for students currently in the room!
    $query = "
        SELECT 
            al.student_id,
            COALESCE(s.first_name, '') as first_name,
            COALESCE(s.last_name, '') as last_name,
            al.course,
            SUM(TIMESTAMPDIFF(MINUTE, al.time_in, COALESCE(al.time_out, NOW()))) as total_minutes,
            COUNT(al.uuid) as total_visits
        FROM attendance_logs al
        LEFT JOIN students s ON s.student_id = al.student_id
        WHERE MONTH(al.time_in) = ? 
          AND YEAR(al.time_in) = ? 
          AND al.time_in IS NOT NULL
        GROUP BY al.student_id, s.first_name, s.last_name, al.course
        ORDER BY total_minutes DESC
        LIMIT 10
    ";

    $stmt = $conn->prepare($query);
    $stmt->bind_param("ss", $currentMonth, $currentYear);
    $stmt->execute();
    $result = $stmt->get_result();

    $top_visitors = [];
    
    // PIPELINE ATTEMPT 2: Fallback to Lifetime Data if the current month yields nothing
    if ($result->num_rows === 0) {
        if (isset($stmt)) $stmt->close();
        
        $fallbackQuery = "
            SELECT 
                al.student_id,
                COALESCE(s.first_name, '') as first_name,
                COALESCE(s.last_name, '') as last_name,
                al.course,
                SUM(TIMESTAMPDIFF(MINUTE, al.time_in, COALESCE(al.time_out, NOW()))) as total_minutes,
                COUNT(al.uuid) as total_visits
            FROM attendance_logs al
            LEFT JOIN students s ON s.student_id = al.student_id
            WHERE al.time_in IS NOT NULL
            GROUP BY al.student_id, s.first_name, s.last_name, al.course
            ORDER BY total_minutes DESC
            LIMIT 10
        ";
        
        $stmt = $conn->prepare($fallbackQuery);
        $stmt->execute();
        $result = $stmt->get_result();
    }

    $rank = 1;
    while ($row = $result->fetch_assoc()) {
        $minutes = (int)$row['total_minutes'];
        
        // Handle short-duration fallback padding so they aren't hidden from view
        if ($minutes <= 0) {
            $minutes = 1; 
        }
        
        $hours = floor($minutes / 60);
        $remainingMinutes = $minutes % 60;
        
        $durationString = "";
        if ($hours > 0) {
            $durationString .= $hours . "h ";
        }
        $durationString .= $remainingMinutes . "m";

        $fullName = trim($row['first_name'] . ' ' . $row['last_name']);
        if (empty($fullName)) {
            $fullName = "Student ID: " . $row['student_id'];
        }

        $top_visitors[] = [
            "rank" => $rank++,
            "student_id" => $row['student_id'],
            "name" => $fullName,
            "course" => !empty($row['course']) ? $row['course'] : "General Track",
            "total_visits" => (int)$row['total_visits'],
            "duration" => $durationString,
            "raw_minutes" => $minutes
        ];
    }

    http_response_code(200);
    echo json_encode(["success" => true, "data" => $top_visitors]);

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(["success" => false, "error" => $e->getMessage()]);
} finally {
    if (isset($stmt)) $stmt->close();
    if (isset($conn)) $conn->close();
}
?>
