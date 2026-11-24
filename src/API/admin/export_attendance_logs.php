<?php
// src\API\admin\export_attendance_logs.php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET");
header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With");

header("Content-Type: application/vnd.ms-excel; charset=UTF-8");
header("Content-Disposition: attachment; filename=\"CvSU_CEIT_Attendance_Logs_" . date('Y-m-d') . ".xls\"");
header("Pragma: no-cache");
header("Expires: 0");

require_once "../dbconfig.php";

if (!$conn) {
    http_response_code(500);
    echo "Error: Database Connection Failure";
    exit();
}

function esc($v) {
    return htmlspecialchars((string)$v, ENT_XML1 | ENT_QUOTES, 'UTF-8');
}

function cell($value, $style = null, $mergeAcross = null, $type = 'String') {
    $attr = '';
    if ($style) $attr .= " ss:StyleID=\"$style\"";
    if ($mergeAcross !== null) $attr .= " ss:MergeAcross=\"$mergeAcross\"";
    return "    <Cell$attr><Data ss:Type=\"$type\">" . esc($value) . "</Data></Cell>\n";
}

function fmtTime($dt) {
    if (empty($dt)) return '';
    $ts = strtotime($dt);
    return $ts ? date('g:i A', $ts) : '';
}

$monthNames = [1 => 'January', 'February', 'March', 'April', 'May', 'June',
               'July', 'August', 'September', 'October', 'November', 'December'];

try {
    $query = "SELECT
                a.student_id,
                a.log_date,
                COALESCE(NULLIF(a.course, ''), s.course) AS course,
                a.time_in,
                a.time_out,
                a.duration,
                CONCAT_WS(' ',
                    s.first_name,
                    NULLIF(s.middle_name, ''),
                    s.last_name,
                    NULLIF(s.suffix, '')
                ) AS full_name
              FROM attendance_logs a
              LEFT JOIN students s ON s.student_id = a.student_id
              ORDER BY a.log_date ASC, a.time_in ASC";
    $result = $conn->query($query);

    // Group: year -> month -> rows
    $data = [];
    if ($result) {
        while ($row = $result->fetch_assoc()) {
            $year  = (int)substr($row['log_date'], 0, 4);
            $month = (int)substr($row['log_date'], 5, 2);
            $data[$year][$month][] = $row;
        }
    }
    krsort($data); // latest year first (only years with data exist)

    echo "<?xml version=\"1.0\" encoding=\"UTF-8\"?>\n";
    echo "<?mso-application progid=\"Excel.Sheet\"?>\n";
    echo "<Workbook xmlns=\"urn:schemas-microsoft-com:office:spreadsheet\"\n";
    echo " xmlns:o=\"urn:schemas-microsoft-com:office:office\"\n";
    echo " xmlns:x=\"urn:schemas-microsoft-com:office:excel\"\n";
    echo " xmlns:ss=\"urn:schemas-microsoft-com:office:spreadsheet\">\n";

    echo " <Styles>\n";
    echo "  <Style ss:ID=\"Default\">\n";
    echo "   <Alignment ss:Vertical=\"Center\"/>\n";
    echo "   <Font ss:FontName=\"Segoe UI\" ss:Size=\"10\"/>\n";
    echo "  </Style>\n";
    echo "  <Style ss:ID=\"MonthStyle\">\n";
    echo "   <Interior ss:Color=\"#1B4D3E\" ss:Pattern=\"Solid\"/>\n";
    echo "   <Font ss:FontName=\"Segoe UI\" ss:Size=\"13\" ss:Bold=\"1\" ss:Color=\"#FFFFFF\"/>\n";
    echo "   <Alignment ss:Horizontal=\"Left\" ss:Vertical=\"Center\"/>\n";
    echo "  </Style>\n";
    echo "  <Style ss:ID=\"HeaderStyle\">\n";
    echo "   <Interior ss:Color=\"#E8F5E9\" ss:Pattern=\"Solid\"/>\n";
    echo "   <Font ss:FontName=\"Segoe UI\" ss:Size=\"10\" ss:Bold=\"1\"/>\n";
    echo "   <Alignment ss:Horizontal=\"Center\" ss:Vertical=\"Center\"/>\n";
    echo "   <Borders><Border ss:Position=\"Bottom\" ss:LineStyle=\"Continuous\" ss:Weight=\"1\"/></Borders>\n";
    echo "  </Style>\n";
    echo "  <Style ss:ID=\"CenterText\">\n";
    echo "   <Alignment ss:Horizontal=\"Center\" ss:Vertical=\"Center\"/>\n";
    echo "  </Style>\n";
    echo "  <Style ss:ID=\"TotalStyle\">\n";
    echo "   <Font ss:FontName=\"Segoe UI\" ss:Size=\"10\" ss:Bold=\"1\"/>\n";
    echo "   <Alignment ss:Horizontal=\"Left\" ss:Vertical=\"Center\"/>\n";
    echo "  </Style>\n";
    echo " </Styles>\n";

    if (empty($data)) {
        echo " <Worksheet ss:Name=\"No Data\">\n  <Table>\n";
        echo "   <Row>\n" . cell("No attendance records found.") . "   </Row>\n";
        echo "  </Table>\n </Worksheet>\n";
    }

    foreach ($data as $year => $months) {
        echo " <Worksheet ss:Name=\"" . esc($year) . "\">\n";
        echo "  <Table>\n";
        echo "   <Column ss:Width=\"50\"/>\n";   // Day
        echo "   <Column ss:Width=\"230\"/>\n";  // Full Name
        echo "   <Column ss:Width=\"120\"/>\n";  // Course
        echo "   <Column ss:Width=\"80\"/>\n";   // Time In
        echo "   <Column ss:Width=\"80\"/>\n";   // Time Out
        echo "   <Column ss:Width=\"120\"/>\n";  // Duration

        foreach ($monthNames as $mNum => $mName) {
            $rows = $months[$mNum] ?? [];

            // Month title
            echo "   <Row ss:Height=\"24\">\n" . cell($mName, 'MonthStyle', 5) . "   </Row>\n";

            // Column headers
            echo "   <Row ss:Height=\"20\">\n";
            foreach (['Day', 'Full Name', 'Course', 'Time In', 'Time Out', 'Duration'] as $h) {
                echo cell($h, 'HeaderStyle');
            }
            echo "   </Row>\n";

            // Data rows + unique (student, day) counter
            $unique = [];
            foreach ($rows as $r) {
                $unique[$r['student_id'] . '|' . $r['log_date']] = true;
                $name = !empty($r['full_name']) ? $r['full_name'] : $r['student_id'];

                echo "   <Row>\n";
                echo cell((int)substr($r['log_date'], 8, 2), 'CenterText', null, 'Number'); // day only
                echo cell($name);
                echo cell($r['course'] ?? '');
                echo cell(fmtTime($r['time_in']), 'CenterText');
                echo cell(fmtTime($r['time_out']), 'CenterText');
                echo cell($r['duration'] ?? '', 'CenterText');
                echo "   </Row>\n";
            }

            // Monthly total (same student twice in one day = 1)
            echo "   <Row>\n" . cell("Total students entered in $mName: " . count($unique), 'TotalStyle', 5) . "   </Row>\n";

            // Spacer row
            echo "   <Row/>\n";
        }

        echo "  </Table>\n";
        echo " </Worksheet>\n";
    }

    echo "</Workbook>\n";
    exit();

} catch (Exception $e) {
    http_response_code(500);
    echo "Error processing attendance export: " . $e->getMessage();
} finally {
    if (isset($conn)) $conn->close();
}
?>