<?php
require_once "../dbconfig.php";

try {
    $year = $_GET['year'] ?? date('Y');
    $course = $_GET['course'] ?? null;

    // Base query using a JOIN to grab the program from the student's registry
    $query = "
        SELECT 
            MONTH(al.time_out) as month_num, 
            s.course, 
            COUNT(*) as total_visits 
        FROM attendance_logs al
        INNER JOIN students s ON s.student_id = al.student_id
        WHERE YEAR(al.time_out) = ? AND al.time_out IS NOT NULL
    ";

    // If specific course selected, filter the return metrics
    if (!empty($course)) {
        $query .= " AND s.course = ?";
    }

    $query .= " GROUP BY MONTH(al.time_out), s.course ORDER BY month_num ASC";

    $stmt = $conn->prepare($query);
    
    if (!empty($course)) {
        $stmt->bind_param("ss", $year, $course);
    } else {
        $stmt->bind_param("s", $year);
    }

    $stmt->execute();
    $result = $stmt->get_result();

    $months = [
        1 => "Jan", 2 => "Feb", 3 => "Mar", 4 => "Apr", 5 => "May", 6 => "Jun",
        7 => "Jul", 8 => "Aug", 9 => "Sep", 10 => "Oct", 11 => "Nov", 12 => "Dec"
    ];

    // Build standard graph skeleton array
    $attendance_data = [];
    foreach ($months as $num => $name) {
        $attendance_data[$num] = [
            "month" => $name,
            "BSABE" => 0, "BSARCHI" => 0, "BSCE" => 0, "BSCpE" => 0, 
            "BSCS" => 0, "BSEE" => 0, "BSECE" => 0, "BSIE" => 0, 
            "BSIT-AT" => 0, "BSIT-ET" => 0, "BSIT-ELEX" => 0, "BSIT" => 0
        ];
    }

    // Overwrite the counts securely
    while ($row = $result->fetch_assoc()) {
        $m_num = (int)$row['month_num'];
        $course_name = $row['course'];
        
        // Safety check ensuring data exists in the skeleton
        if (isset($attendance_data[$m_num][$course_name])) {
            $attendance_data[$m_num][$course_name] = (int)$row['total_visits'];
        }
    }

    echo json_encode(array_values($attendance_data));

} catch (Exception $e) {
    echo json_encode(["error" => $e->getMessage()]);
}

$conn->close();
?>
