<?php
// src\API\admin\export_circulation_logs.php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET");
header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With");

// Whitelisted config per log type (never put raw $_GET values into the SQL)
$types = [
    'books' => [
        'table'      => 'circulation_logs',
        'codeCol'    => 'barcode',
        'join'       => 'LEFT JOIN books_inventory x ON (x.barcode = c.barcode OR x.uuid = c.barcode)',
        'titleCol'   => 'x.title',
        'titleLabel' => 'Book Title',
        'codeLabel'  => 'Barcode',
        'unknown'    => 'Unknown Title',
        'totalLabel' => 'books borrowed',
        'fileLabel'  => 'Circulation',
        'noData'     => 'No circulation records found.',
    ],
    'research' => [
        'table'      => 'research_logs',
        'codeCol'    => 'code',
        'join'       => 'LEFT JOIN research_projects x ON (x.code = c.code OR x.uuid = c.code)',
        'titleCol'   => 'x.title',
        'titleLabel' => 'Research Title',
        'codeLabel'  => 'Code',
        'unknown'    => 'Unknown Title',
        'totalLabel' => 'research borrowed',
        'fileLabel'  => 'Research',
        'noData'     => 'No research records found.',
    ],
];

$type = $_GET['type'] ?? 'books';
if (!isset($types[$type])) $type = 'books';
$cfg = $types[$type];

header("Content-Type: application/vnd.ms-excel; charset=UTF-8");
header("Content-Disposition: attachment; filename=\"CvSU_CEIT_{$cfg['fileLabel']}_Logs_" . date('Y-m-d') . ".xls\"");
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

// Due/return dates can fall in another month, so keep the full date for them
function fmtDate($d) {
    if (empty($d)) return '—';
    $ts = strtotime($d);
    return $ts ? date('M j, Y', $ts) : '—';
}

$monthNames = [1 => 'January', 'February', 'March', 'April', 'May', 'June',
               'July', 'August', 'September', 'October', 'November', 'December'];

try {
    $query = "SELECT
                c.student_id,
                c.{$cfg['codeCol']} AS item_code,
                c.borrow_date,
                c.due_date,
                c.return_date,
                CASE
                    WHEN c.return_date IS NULL AND c.due_date < CURDATE() THEN 'overdue'
                    ELSE c.status
                END AS status,
                {$cfg['titleCol']} AS item_title,
                CONCAT_WS(' ',
                    s.first_name,
                    NULLIF(s.middle_name, ''),
                    s.last_name,
                    NULLIF(s.suffix, '')
                ) AS full_name
              FROM {$cfg['table']} c
              LEFT JOIN students s ON s.student_id = c.student_id
              {$cfg['join']}
              ORDER BY c.borrow_date ASC, full_name ASC";
    $result = $conn->query($query);

    // Group: year -> month -> rows (by borrow date)
    $data = [];
    if ($result) {
        while ($row = $result->fetch_assoc()) {
            $year  = (int)substr($row['borrow_date'], 0, 4);
            $month = (int)substr($row['borrow_date'], 5, 2);
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
        echo "   <Row>\n" . cell($cfg['noData']) . "   </Row>\n";
        echo "  </Table>\n </Worksheet>\n";
    }

    foreach ($data as $year => $months) {
        echo " <Worksheet ss:Name=\"" . esc($year) . "\">\n";
        echo "  <Table>\n";
        echo "   <Column ss:Width=\"50\"/>\n";   // Day
        echo "   <Column ss:Width=\"230\"/>\n";  // Full Name
        echo "   <Column ss:Width=\"260\"/>\n";  // Title
        echo "   <Column ss:Width=\"110\"/>\n";  // Barcode / Code
        echo "   <Column ss:Width=\"95\"/>\n";   // Due Date
        echo "   <Column ss:Width=\"95\"/>\n";   // Return Date
        echo "   <Column ss:Width=\"80\"/>\n";   // Status

        foreach ($monthNames as $mNum => $mName) {
            $rows = $months[$mNum] ?? [];

            // Month title
            echo "   <Row ss:Height=\"24\">\n" . cell($mName, 'MonthStyle', 6) . "   </Row>\n";

            // Column headers
            echo "   <Row ss:Height=\"20\">\n";
            foreach (['Day', 'Full Name', $cfg['titleLabel'], $cfg['codeLabel'], 'Due Date', 'Return Date', 'Status'] as $h) {
                echo cell($h, 'HeaderStyle');
            }
            echo "   </Row>\n";

            // Data rows + unique borrowers counter
            $borrowers = [];
            foreach ($rows as $r) {
                $borrowers[$r['student_id']] = true;
                $name  = !empty($r['full_name']) ? $r['full_name'] : $r['student_id'];
                $title = !empty($r['item_title']) ? $r['item_title'] : $cfg['unknown'];

                echo "   <Row>\n";
                echo cell((int)substr($r['borrow_date'], 8, 2), 'CenterText', null, 'Number'); // day only
                echo cell($name);
                echo cell($title);
                echo cell($r['item_code'], 'CenterText');
                echo cell(fmtDate($r['due_date']), 'CenterText');
                echo cell(fmtDate($r['return_date']), 'CenterText');
                echo cell(ucfirst($r['status']), 'CenterText');
                echo "   </Row>\n";
            }

            // Monthly totals
            echo "   <Row>\n" . cell(
                "Total {$cfg['totalLabel']} in $mName: " . count($rows) . "   |   Total students who borrowed: " . count($borrowers),
                'TotalStyle', 6
            ) . "   </Row>\n";

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
    echo "Error processing export: " . $e->getMessage();
} finally {
    if (isset($conn)) $conn->close();
}
?>