<?php
// Never let warnings/notices leak into the binary download
ini_set('display_errors', '0');
error_reporting(E_ALL);

header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

require_once "../dbconfig.php";
if (!$conn) {
    http_response_code(500);
    die("Database connection failed.");
}

// 1. INITIALIZE ALL 12 PROGRAMS
$allPrograms = [
    "BSABE", "BSARCHI", "BSCE", "BSCpE", "BSCS", "BSEE",
    "BSECE", "BSIE", "BSIndT-AT", "BSIndT-ET", "BSIndT-ELEX", "BSIT"
];
$programCounts = array_fill_keys($allPrograms, 0);

// 2. FETCH APPROVED RESEARCHES (LATEST FIRST)
$sql = "SELECT code, title, program, year
        FROM research_projects
        WHERE status = 'approved'
        ORDER BY created_at DESC";
$result = $conn->query($sql);

$researches = [];
if ($result) {
    while ($row = $result->fetch_assoc()) {
        $researches[] = $row;
        $prog = !empty(trim($row['program'] ?? '')) ? trim($row['program']) : 'Unspecified';
        if (!isset($programCounts[$prog])) {
            $programCounts[$prog] = 0;
        }
        $programCounts[$prog]++;
    }
}
$totalResearches = count($researches);
arsort($programCounts);

// 3. PIE CHART (PHP GD)
$chartPngData = null;
$chartWidth  = 760;
$chartHeight = 420;

if (function_exists('imagecreatetruecolor') && $totalResearches > 0) {
    $img = imagecreatetruecolor($chartWidth, $chartHeight);
    $white      = imagecolorallocate($img, 255, 255, 255);
    $darkText   = imagecolorallocate($img, 31, 41, 55);
    $borderGray = imagecolorallocate($img, 229, 231, 235);
    imagefill($img, 0, 0, $white);

    $paletteRgb = [
        [21, 128, 61], [16, 185, 129], [234, 179, 8], [37, 99, 235],
        [249, 115, 22], [139, 92, 246], [20, 184, 166], [244, 63, 94],
        [14, 165, 233], [168, 85, 247], [132, 204, 22], [100, 116, 139]
    ];
    $colors = [];
    foreach ($paletteRgb as $rgb) {
        $colors[] = imagecolorallocate($img, $rgb[0], $rgb[1], $rgb[2]);
    }

    $cx = 190; $cy = 210; $diameter = 300;
    $startAngle = 0; $colorIndex = 0;
    $legendX = 385; $legendY = 30;

    foreach ($programCounts as $programName => $count) {
        $sliceColor = $colors[$colorIndex % count($colors)];
        $percentage = ($count / $totalResearches) * 100;
        $sweepAngle = ($count / $totalResearches) * 360;
        $endAngle   = $startAngle + $sweepAngle;

        if ($sweepAngle > 0) {
            if (round($sweepAngle) >= 360) {
                imagefilledellipse($img, $cx, $cy, $diameter, $diameter, $sliceColor);
            } else {
                imagefilledarc($img, $cx, $cy, $diameter, $diameter,
                    (int)round($startAngle), (int)round($endAngle),
                    $sliceColor, IMG_ARC_PIE);
            }
        }

        if ($legendY < $chartHeight - 35) {
            imagefilledrectangle($img, $legendX, $legendY, $legendX + 14, $legendY + 14, $sliceColor);
            imagerectangle($img, $legendX, $legendY, $legendX + 14, $legendY + 14, $borderGray);
            $labelText = sprintf("%-12s : %d (%.1f%%)", $programName, $count, $percentage);
            imagestring($img, 3, $legendX + 22, $legendY, $labelText, $darkText);
            $legendY += 27;
        }

        $startAngle = $endAngle;
        $colorIndex++;
    }

    imagestring($img, 4, $legendX, $legendY + 8,
        "Total Approved Researches: " . $totalResearches, $colors[0]);

    ob_start();
    imagepng($img);
    $chartPngData = ob_get_clean();
    imagedestroy($img);
}

// 4. HELPERS
function xmlEsc($str) {
    return htmlspecialchars((string)$str, ENT_XML1 | ENT_QUOTES, 'UTF-8');
}

// Paragraph with a single run. Element order follows the OOXML schema.
function para($text, $o = []) {
    $center = !empty($o['center']);
    $pPr = '';
    if (isset($o['before']) || isset($o['after'])) {
        $pPr .= '<w:spacing'
              . (isset($o['before']) ? ' w:before="' . $o['before'] . '"' : '')
              . (isset($o['after'])  ? ' w:after="'  . $o['after']  . '"' : '')
              . '/>';
    }
    if ($center) $pPr .= '<w:jc w:val="center"/>';

    $rPr = '';
    if (!empty($o['font']))  $rPr .= '<w:rFonts w:ascii="' . $o['font'] . '" w:hAnsi="' . $o['font'] . '"/>';
    if (!empty($o['bold']))  $rPr .= '<w:b/>';
    if (!empty($o['italic'])) $rPr .= '<w:i/>';
    if (!empty($o['color'])) $rPr .= '<w:color w:val="' . $o['color'] . '"/>';
    if (!empty($o['sz']))    $rPr .= '<w:sz w:val="' . $o['sz'] . '"/>';

    return '<w:p>'
        . ($pPr !== '' ? '<w:pPr>' . $pPr . '</w:pPr>' : '')
        . '<w:r>' . ($rPr !== '' ? '<w:rPr>' . $rPr . '</w:rPr>' : '')
        . '<w:t xml:space="preserve">' . xmlEsc($text) . '</w:t></w:r></w:p>';
}

// Table cell
function tc($width, $text, $o = []) {
    $tcPr = '<w:tcW w:w="' . $width . '" w:type="dxa"/>';
    if (!empty($o['span'])) $tcPr .= '<w:gridSpan w:val="' . $o['span'] . '"/>';
    if (!empty($o['fill'])) $tcPr .= '<w:shd w:val="clear" w:color="auto" w:fill="' . $o['fill'] . '"/>';
    return '<w:tc><w:tcPr>' . $tcPr . '</w:tcPr>' . para($text, $o) . '</w:tc>';
}

function tblStart($totalWidth, array $grid, $borderColor) {
    $b = function ($side, $sz) use ($borderColor) {
        return '<w:' . $side . ' w:val="single" w:sz="' . $sz . '" w:space="0" w:color="' . $borderColor . '"/>';
    };
    $xml = '<w:tbl><w:tblPr><w:tblW w:w="' . $totalWidth . '" w:type="dxa"/><w:jc w:val="center"/>'
         . '<w:tblBorders>' . $b('top', 6) . $b('left', 6) . $b('bottom', 6) . $b('right', 6)
         . $b('insideH', 4) . $b('insideV', 4) . '</w:tblBorders></w:tblPr><w:tblGrid>';
    foreach ($grid as $w) $xml .= '<w:gridCol w:w="' . $w . '"/>';
    return $xml . '</w:tblGrid>';
}

// 5. BUILD document.xml BODY
$green = "15803D";
$lightGreenBg = "DCFCE7";
$borderColor = "D1D5DB";

$bodyXml = '';

// Title + subtitle
$bodyXml .= para('Reading Room Researches Masterlist', [
    'center' => true, 'after' => 100, 'font' => 'Calibri',
    'bold' => true, 'color' => $green, 'sz' => 36
]);
$bodyXml .= para('Approved Research Inventory | Generated on ' . date("F j, Y"), [
    'center' => true, 'after' => 200, 'font' => 'Calibri',
    'italic' => true, 'color' => '6B7280', 'sz' => 20
]);

// Pie chart image
if ($chartPngData !== null) {
    $emuWidth  = $chartWidth * 7600;   // ~6.3 in, fits within the 7 in text width
    $emuHeight = $chartHeight * 7600;
    $bodyXml .= '<w:p><w:pPr><w:spacing w:after="180"/><w:jc w:val="center"/></w:pPr><w:r><w:drawing>'
        . '<wp:inline distT="0" distB="0" distL="0" distR="0">'
        . '<wp:extent cx="' . $emuWidth . '" cy="' . $emuHeight . '"/>'
        . '<wp:docPr id="1" name="Program Distribution Pie Chart"/>'
        . '<a:graphic><a:graphicData uri="http://schemas.openxmlformats.org/drawingml/2006/picture">'
        . '<pic:pic>'
        . '<pic:nvPicPr><pic:cNvPr id="0" name="chart.png"/><pic:cNvPicPr/></pic:nvPicPr>'
        . '<pic:blipFill><a:blip r:embed="rIdChart"/><a:stretch><a:fillRect/></a:stretch></pic:blipFill>'
        . '<pic:spPr><a:xfrm><a:off x="0" y="0"/><a:ext cx="' . $emuWidth . '" cy="' . $emuHeight . '"/></a:xfrm>'
        . '<a:prstGeom prst="rect"><a:avLst/></a:prstGeom></pic:spPr>'
        . '</pic:pic></a:graphicData></a:graphic>'
        . '</wp:inline></w:drawing></w:r></w:p>';
}

// Summary table
$bodyXml .= para('Research Distribution Summary by Program', [
    'center' => true, 'before' => 100, 'after' => 100,
    'bold' => true, 'color' => $green, 'sz' => 24
]);

$bodyXml .= tblStart(7500, [4300, 1600, 1600], $borderColor);
$hdr = ['bold' => true, 'color' => 'FFFFFF', 'sz' => 20, 'fill' => $green];
$bodyXml .= '<w:tr>'
    . tc(4300, 'Program', $hdr)
    . tc(1600, 'Total Uploaded', $hdr + ['center' => true])
    . tc(1600, 'Percentage', $hdr + ['center' => true])
    . '</w:tr>';

foreach ($programCounts as $prog => $count) {
    $pct = $totalResearches > 0 ? number_format(($count / $totalResearches) * 100, 1) . '%' : '0.0%';
    $bodyXml .= '<w:tr>'
        . tc(4300, $prog, ['sz' => 20])
        . tc(1600, (string)$count, ['sz' => 20, 'center' => true])
        . tc(1600, $pct, ['sz' => 20, 'center' => true])
        . '</w:tr>';
}

$tot = ['bold' => true, 'color' => $green, 'sz' => 20, 'fill' => $lightGreenBg];
$bodyXml .= '<w:tr>'
    . tc(4300, 'TOTAL RESEARCH OF ALL PROGRAMS', $tot)
    . tc(1600, (string)$totalResearches, $tot + ['center' => true])
    . tc(1600, $totalResearches > 0 ? '100.0%' : '0.0%', $tot + ['center' => true])
    . '</w:tr></w:tbl>';

// Masterlist table
$bodyXml .= para('Approved Researches Masterlist (Latest Uploads First)', [
    'before' => 320, 'after' => 120, 'bold' => true, 'color' => $green, 'sz' => 26
]);

$bodyXml .= tblStart(9360, [1500, 4860, 2000, 1000], $borderColor);
$bodyXml .= '<w:tr>'
    . tc(1500, 'Code', $hdr)
    . tc(4860, 'Title', $hdr)
    . tc(2000, 'Program', $hdr)
    . tc(1000, 'Year', $hdr + ['center' => true])
    . '</w:tr>';

if ($totalResearches === 0) {
    $bodyXml .= '<w:tr>'
        . tc(9360, 'No approved research records found.',
             ['span' => 4, 'center' => true, 'italic' => true, 'color' => '6B7280', 'sz' => 20])
        . '</w:tr>';
} else {
    foreach ($researches as $idx => $item) {
        $rowFill = ($idx % 2 === 1) ? 'F9FAFB' : 'FFFFFF';
        $codeVal  = !empty($item['code'])    ? $item['code']    : 'N/A';
        $titleVal = $item['title'] ?? '';
        $progVal  = !empty($item['program']) ? $item['program'] : 'N/A';
        $yearVal  = !empty($item['year'])    ? $item['year']    : 'N/A';

        $bodyXml .= '<w:tr>'
            . tc(1500, $codeVal,  ['bold' => true, 'sz' => 19, 'fill' => $rowFill])
            . tc(4860, $titleVal, ['sz' => 19, 'fill' => $rowFill])
            . tc(2000, $progVal,  ['sz' => 19, 'fill' => $rowFill])
            . tc(1000, (string)$yearVal, ['sz' => 19, 'fill' => $rowFill, 'center' => true])
            . '</w:tr>';
    }
}
$bodyXml .= '</w:tbl>';

// Word requires a paragraph after the last table (before sectPr)
$bodyXml .= '<w:p/>';

// 6. ASSEMBLE .DOCX
$documentXml = '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>'
    . '<w:document'
    . ' xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main"'
    . ' xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships"'
    . ' xmlns:wp="http://schemas.openxmlformats.org/drawingml/2006/wordprocessingDrawing"'
    . ' xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main"'
    . ' xmlns:pic="http://schemas.openxmlformats.org/drawingml/2006/picture">'
    . '<w:body>' . $bodyXml
    . '<w:sectPr><w:pgSz w:w="12240" w:h="15840"/>'
    . '<w:pgMar w:top="1080" w:right="1080" w:bottom="1080" w:left="1080" w:header="720" w:footer="720" w:gutter="0"/>'
    . '</w:sectPr></w:body></w:document>';

$contentTypesXml = '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>'
    . '<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">'
    . '<Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>'
    . '<Default Extension="xml" ContentType="application/xml"/>'
    . '<Default Extension="png" ContentType="image/png"/>'
    . '<Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/>'
    . '</Types>';

$rootRelsXml = '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>'
    . '<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">'
    . '<Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="word/document.xml"/>'
    . '</Relationships>';

$docRelsXml = '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>'
    . '<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">';
if ($chartPngData !== null) {
    $docRelsXml .= '<Relationship Id="rIdChart" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/image" Target="media/chart.png"/>';
}
$docRelsXml .= '</Relationships>';

$tempFile = tempnam(sys_get_temp_dir(), 'docx_');
$zip = new ZipArchive();
if ($zip->open($tempFile, ZipArchive::CREATE | ZipArchive::OVERWRITE) !== true) {
    http_response_code(500);
    die("Failed to generate Word document.");
}
$zip->addFromString('[Content_Types].xml', $contentTypesXml);
$zip->addFromString('_rels/.rels', $rootRelsXml);
$zip->addFromString('word/_rels/document.xml.rels', $docRelsXml);
$zip->addFromString('word/document.xml', $documentXml);
if ($chartPngData !== null) {
    $zip->addFromString('word/media/chart.png', $chartPngData);
}
$zip->close();

// 7. STREAM DOWNLOAD
// Discard any stray output (whitespace, notices from dbconfig.php, etc.)
while (ob_get_level() > 0) {
    ob_end_clean();
}

$filename = "Reading_Room_Researches_Masterlist_" . date("Y-m-d") . ".docx";
header("Content-Description: File Transfer");
header("Content-Type: application/vnd.openxmlformats-officedocument.wordprocessingml.document");
header("Content-Disposition: attachment; filename=\"" . $filename . "\"");
header("Content-Transfer-Encoding: binary");
header("Expires: 0");
header("Cache-Control: must-revalidate");
header("Pragma: public");
header("Content-Length: " . filesize($tempFile));
readfile($tempFile);
unlink($tempFile);
$conn->close();
exit();