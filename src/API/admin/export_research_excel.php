<?php
// src\API\admin\export_research_excel.php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET");
header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With");

// Keep the verified XML SpreadsheetML format layout that Microsoft Excel parses natively
header("Content-Type: application/vnd.ms-excel; charset=UTF-8");
header("Content-Disposition: attachment; filename=\"CvSU_CEIT_Approved_Research_" . date('Y-m-d') . ".xls\"");
header("Pragma: no-cache");
header("Expires: 0");

require_once "../dbconfig.php";

if (!$conn) {
    http_response_code(500);
    echo "Error: Database Connection Failure";
    exit();
}

try {
    // 1. EMIT MICROSOFT COMPLIANT SPREADSHEETML DISCOVERY MARKS
    echo "<?xml version=\"1.0\" encoding=\"UTF-8\"?>\n";
    echo "<?mso-application progid=\"Excel.Sheet\"?>\n";
    echo "<Workbook xmlns=\"urn:schemas-microsoft-com:office:spreadsheet\"\n";
    echo " xmlns:o=\"urn:schemas-microsoft-com:office:office\"\n";
    echo " xmlns:x=\"urn:schemas-microsoft-com:office:excel\"\n";
    echo " xmlns:ss=\"urn:schemas-microsoft-com:office:spreadsheet\"\n";
    echo " xmlns:html=\"http://w3.org\">\n";
    
    // 2. DEFINE NATIVE CORE VIEW STYLES
    echo " <Styles>\n";
    echo "  <Style ss:ID=\"Default\">\n";
    echo "   <Alignment ss:Vertical=\"Top\" ss:WrapText=\"1\"/>\n"; // Enforces word-wrap globally
    echo "   <Font ss:FontName=\"Segoe UI\" ss:Size=\"10\"/>\n";
    echo "  </Style>\n";
    echo "  <Style ss:ID=\"HeaderStyle\">\n";
    echo "   <Interior ss:Color=\"#1B4D3E\" ss:Pattern=\"Solid\"/>\n"; // Forest Green Header Theme
    echo "   <Font ss:FontName=\"Segoe UI\" ss:Size=\"11\" ss:Bold=\"1\" ss:Color=\"#FFFFFF\"/>\n";
    echo "   <Alignment ss:Horizontal=\"Center\" ss:Vertical=\"Center\"/>\n";
    echo "  </Style>\n";
    echo "  <Style ss:ID=\"TitleStyle\">\n";
    echo "   <Font ss:FontName=\"Segoe UI\" ss:Size=\"10\" ss:Bold=\"1\" ss:Color=\"#2D3748\"/>\n";
    echo "   <Alignment ss:Vertical=\"Top\" ss:WrapText=\"1\"/>\n";
    echo "  </Style>\n";
    echo "  <Style ss:ID=\"CenterText\">\n";
    echo "   <Alignment ss:Horizontal=\"Center\" ss:Vertical=\"Top\"/>\n";
    echo "  </Style>\n";
    echo " </Styles>\n";

    // 3. THE 12 CEIT ACADEMIC PROGRAMS
    $programs = [
        "BSABE"       => "BS Agricultural & Biosystems Eng",
        "BSARCHI"     => "BS Architecture",
        "BSCE"        => "BS Civil Engineering",
        "BSCpE"       => "BS Computer Engineering",
        "BSCS"        => "BS Computer Science",
        "BSEE"        => "BS Electrical Engineering",
        "BSECE"       => "BS Electronics Engineering",
        "BSIE"       => "BS Industrial Engineering",
        "BSIndT-AT"   => "BSIndT - Automotive Tech",
        "BSIndT-ET"   => "BSIndT - Electrical Tech",
        "BSIndT-ELEX" => "BSIndT - Electronics Tech",
        "BSIT"        => "BS Information Technology"
    ];

    // 4. GENERATE INDEPENDENT TABBED WORKSHEETS
    foreach ($programs as $progCode => $progLabel) {
        $cleanSheetName = substr($progCode, 0, 31);
        
        echo " <Worksheet ss:Name=\"" . htmlspecialchars($cleanSheetName) . "\">\n";
        echo "  <Table>\n";
        
        // Define explicit column width parameters directly
        echo "   <Column ss:Width=\"120\"/>\n"; // Code
        echo "   <Column ss:Width=\"260\"/>\n"; // Title
        echo "   <Column ss:Width=\"60\"/>\n";  // Year
        echo "   <Column ss:Width=\"200\"/>\n"; // Authors
        echo "   <Column ss:Width=\"140\"/>\n"; // Adviser
        echo "   <Column ss:Width=\"140\"/>\n"; // Technical Critic

        // Build Table Header Row Block
        echo "   <Row ss:Height=\"24\">\n";
        foreach (['Code', 'Research Title', 'Year', 'Authors / Researchers', 'Adviser', 'Technical Critic'] as $headerTitle) {
            echo "    <Cell ss:StyleID=\"HeaderStyle\"><Data ss:Type=\"String\">" . htmlspecialchars($headerTitle) . "</Data></Cell>\n";
        }
        echo "   </Row>\n";

        // FIXED QUERY LOGIC: Filter constraints restricted strictly to status = 'approved' records only [INDEX]
        $query = "SELECT code, title, year, authors, adviser, technical_critic 
                  FROM research_projects 
                  WHERE program = ? AND status = 'approved' 
                  ORDER BY year DESC, code ASC";
                  
        $stmt = $conn->prepare($query);
        $stmt->bind_param("s", $progCode);
        $stmt->execute();
        $result = $stmt->get_result();

        $rowsCount = 0;
        while ($row = $result->fetch_assoc()) {
            $rowsCount++;
            
            // --- DATA NORMALIZER PARSER FOR AUTHORS CELL ---
            $rawAuthors = !empty($row['authors']) ? trim($row['authors']) : 'N/A';
            $parsedNames = [];

            if ($rawAuthors !== 'N/A' && $rawAuthors !== '') {
                if (str_starts_with($rawAuthors, '[') && str_ends_with($rawAuthors, ']')) {
                    $decodedJson = json_decode($rawAuthors, true);
                    if (is_array($decodedJson)) {
                        foreach ($decodedJson as $authorObj) {
                            if (is_array($authorObj)) {
                                $fullName = trim(($authorObj['first_name'] ?? '') . ' ' . ($authorObj['last_name'] ?? ''));
                                if (!empty($fullName)) {
                                    $parsedNames[] = htmlspecialchars($fullName);
                                }
                            } elseif (is_string($authorObj)) {
                                $parsedNames[] = htmlspecialchars(trim($authorObj));
                            }
                        }
                    }
                }
                
                if (empty($parsedNames)) {
                    $splitArray = explode(',', $rawAuthors);
                    foreach ($splitArray as $nameStr) {
                        $nameStr = trim($nameStr);
                        if (!empty($nameStr)) {
                            $parsedNames[] = htmlspecialchars($nameStr);
                        }
                    }
                }
            }

            // FIXED INTERIOR CELL BREAKS: Injected the literal code token string "&#10;" directly outside htmlspecialchars() [INDEX]
            $cleanAuthors = !empty($parsedNames) ? implode('&#10;', $parsedNames) : 'N/A';

            echo "   <Row ss:AutoFitHeight=\"1\">\n"; // Auto-stretches cell row heights dynamically
            echo "    <Cell><Data ss:Type=\"String\">" . htmlspecialchars(!empty($row['code']) ? $row['code'] : 'N/A') . "</Data></Cell>\n";
            echo "    <Cell ss:StyleID=\"TitleStyle\"><Data ss:Type=\"String\">" . htmlspecialchars($row['title']) . "</Data></Cell>\n";
            echo "    <Cell ss:StyleID=\"CenterText\"><Data ss:Type=\"Number\">" . htmlspecialchars(!empty($row['year']) ? $row['year'] : 0) . "</Data></Cell>\n";
            echo "    <Cell><Data ss:Type=\"String\">" . $cleanAuthors . "</Data></Cell>\n"; // Injects clean multi-line string text smoothly [INDEX]
            echo "    <Cell><Data ss:Type=\"String\">" . htmlspecialchars(!empty($row['adviser']) ? $row['adviser'] : 'N/A') . "</Data></Cell>\n";
            echo "    <Cell><Data ss:Type=\"String\">" . htmlspecialchars(!empty($row['technical_critic']) ? $row['technical_critic'] : 'N/A') . "</Data></Cell>\n";
            echo "   </Row>\n";
        }

        if ($rowsCount === 0) {
            echo "   <Row ss:Height=\"20\">\n";
            echo "    <Cell ss:MergeAcross=\"5\"><Data ss:Type=\"String\">No approved manuscripts found for " . htmlspecialchars($progLabel) . ".</Data></Cell>\n";
            echo "   </Row>\n";
        }

        echo "  </Table>\n";
        echo " </Worksheet>\n";
        $stmt->close();
    }

    echo "</Workbook>\n";
    exit();

} catch (Exception $e) {
    http_response_code(500);
    echo "Error processing spreadsheet file payload export: " . $e->getMessage();
} finally {
    if (isset($conn)) $conn->close();
}
?>
