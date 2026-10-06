<?php
// src\API\admin\get_attendance_graph.php
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
    $year = $_GET['year'] ?? date('Y');
    $course = $_GET['course'] ?? null;
    $range = $_GET['range'] ?? '1Y';

    $dateCondition = "YEAR(al.time_out) = ?";
    $params = [$year];
    $paramTypes = "s";
    
    // Choose dynamic X-Axis label grouping matrices based on frontend timeline tokens
    if ($range !== '1Y' && $range !== 'ALL') {
        $dateCondition = "al.time_out >= NOW() - INTERVAL ";
        switch ($range) {
            case '1D': 
                $dateCondition .= "1 DAY"; 
                $xAxisSelect = "DATE_FORMAT(al.time_out, '%h:00 %p') as label_key, HOUR(al.time_out) as sort_key";
                break;
            case '1W': 
                $dateCondition .= "7 DAY"; 
                $xAxisSelect = "DATE_FORMAT(al.time_out, '%a') as label_key, DAYOFWEEK(al.time_out) as sort_key";
                break;
            case '1M': 
                $dateCondition .= "1 MONTH"; 
                $xAxisSelect = "CONCAT('Week ', FLOOR((DAY(al.time_out) - 1) / 7) + 1) as label_key, FLOOR((DAY(al.time_out) - 1) / 7) + 1 as sort_key";
                break;
            case '3M': 
                $dateCondition .= "3 MONTH"; 
                // Group by Month Number for flawless sorting chronological pipelines
                $xAxisSelect = "DATE_FORMAT(al.time_out, '%b') as label_key, MONTH(al.time_out) as sort_key";
                break;
        }
        $params = [];
        $paramTypes = "";
    } else {
        $xAxisSelect = "DATE_FORMAT(al.time_out, '%b') as label_key, MONTH(al.time_out) as sort_key";
        if ($range === 'ALL') {
            $dateCondition = "1=1";
            $params = [];
            $paramTypes = "";
        }
    }

    $coursesList = ["BSABE", "BSARCHI", "BSCE", "BSCpE", "BSCS", "BSEE", "BSECE", "BSIE", "BSIT-AT", "BSIT-ET", "BSIT-ELEX", "BSIT"];
    $attendance_data = [];
    
    // Seed default baseline tracking buckets to keep layout streams clean
    if ($range === '1D') {
        for ($i = 0; $i < 24; $i++) {
            $ts = mktime($i, 0, 0, 1, 1, 1970);
            $lbl = date('h:00 A', $ts);
            $attendance_data[$i] = array_merge(["xAxisKey" => $lbl], array_fill_keys($coursesList, 0));
        }
    } elseif ($range === '1W') {
        for ($i = 6; $i >= 0; $i--) {
            $lbl = date('D', strtotime("-$i days"));
            $attendance_data[$lbl] = array_merge(["xAxisKey" => $lbl], array_fill_keys($coursesList, 0));
        }
    } elseif ($range === '1M') {
        for ($w = 1; $w <= 4; $w++) {
            $attendance_data[$w] = array_merge(["xAxisKey" => "Week $w"], array_fill_keys($coursesList, 0));
        }
    } elseif ($range === '3M') {
        // FIXED: Swapped 'b' out for uppercase 'M' to correctly output short-month text labels (e.g. Aug, Sep, Oct)
        for ($i = 2; $i >= 0; $i--) {
            $lbl = date('M', strtotime("-$i months"));
            $attendance_data[$lbl] = array_merge(["xAxisKey" => $lbl], array_fill_keys($coursesList, 0));
        }
    } else {
        $monthsLabels = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
        foreach ($monthsLabels as $mName) {
            $attendance_data[$mName] = array_merge(["xAxisKey" => $mName], array_fill_keys($coursesList, 0));
        }
    }

    // 2. CORE LIVE DATA FETCH AGGREGATION
    $query = "
        SELECT 
            {$xAxisSelect},
            s.course, 
            COUNT(DISTINCT al.student_id, DATE(al.time_out)) as unique_daily_visits 
        FROM attendance_logs al
        INNER JOIN students s ON s.student_id = al.student_id
        WHERE {$dateCondition} AND al.time_out IS NOT NULL
    ";

    if (!empty($course)) {
        $query .= " AND s.course = ?";
        $params[] = $course;
        $paramTypes .= "s";
    }

    $query .= " GROUP BY label_key, sort_key, s.course ORDER BY sort_key ASC";

    $stmt = $conn->prepare($query);
    if (!empty($paramTypes)) {
        $stmt->bind_param($paramTypes, ...$params);
    }
    
    $stmt->execute();
    $result = $stmt->get_result();

    while ($row = $result->fetch_assoc()) {
        $lblKey = $row['label_key'];
        $course_name = $row['course'];
        $visitsCount = (int)$row['unique_daily_visits'];
        
        if ($range === '1D' || $range === '1M') {
            $sKey = (int)$row['sort_key'];
            if ($range === '1M' && $sKey > 4) $sKey = 4; 
            if (isset($attendance_data[$sKey][$course_name])) {
                $attendance_data[$sKey][$course_name] = $visitsCount;
            }
        } else {
            // Secure array target injection matches against the pre-seeded short-month text labels perfectly
            if (isset($attendance_data[$lblKey][$course_name])) {
                $attendance_data[$lblKey][$course_name] = $visitsCount;
            }
        }
    }

    http_response_code(200);
    echo json_encode(array_values($attendance_data));

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(["error" => $e->getMessage()]);
} finally {
    if (isset($stmt)) $stmt->close();
    $conn->close();
}
?>
