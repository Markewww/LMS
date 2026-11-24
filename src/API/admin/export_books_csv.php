<?php
// src\API\admin\export_books_csv.php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET");
header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With");

// FIXED EXTENSION WORKAROUND: Changing the filename output token to .xml removes the alert popup permanently!
header("Content-Type: application/vnd.ms-excel; charset=UTF-8");
header("Content-Disposition: attachment; filename=\"CvSU_CEIT_Books_Inventory_" . date('Y-m-d') . ".xml\"");
header("Pragma: no-cache");
header("Expires: 0");

require_once "../dbconfig.php";

if (!$conn) {
    http_response_code(500);
    echo "Error: Database Connection Failure";
    exit();
}

try {
    // 1. EMIT OFFICIAL MICROSOFT COMPLIANT EXCEL XML WORKBOOK METADATA
    echo "<?xml version=\"1.0\" encoding=\"UTF-8\"?>\n";
    echo "<?mso-application progid=\"Excel.Sheet\"?>\n";
    echo "<Workbook xmlns=\"urn:schemas-microsoft-com:office:spreadsheet\"\n";
    echo " xmlns:o=\"urn:schemas-microsoft-com:office:office\"\n";
    echo " xmlns:x=\"urn:schemas-microsoft-com:office:excel\"\n";
    echo " xmlns:ss=\"urn:schemas-microsoft-com:office:spreadsheet\"\n";
    echo " xmlns:html=\"http://w3.org\">\n";
    
    // 2. DEFINE NATIVE CORE EXCEL STYLE CLASSES
    echo " <Styles>\n";
    echo "  <Style ss:ID=\"Default\">\n";
    echo "   <Alignment ss:Vertical=\"Top\" ss:WrapText=\"1\"/>\n"; // Force text wrapping globally
    echo "   <Font ss:FontName=\"Segoe UI\" ss:Size=\"10\"/>\n";
    echo "  </Style>\n";
    echo "  <Style ss:ID=\"HeaderStyle\">\n";
    echo "   <Interior ss:Color=\"#1B4D3E\" ss:Pattern=\"Solid\"/>\n"; // Forest Green Theme Color
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

    // 3. DEFINE THE ACTIVE INVENTORY WORKSHEET SPREADSHEET FRAME
    echo " <Worksheet ss:Name=\"Books Inventory\">\n";
    echo "  <Table>\n";
    
    // Force explicit layout column width dimensions directly into Excel rows
    echo "   <Column ss:Width=\"150\"/>\n"; // ID
    echo "   <Column ss:Width=\"280\"/>\n"; // Title
    echo "   <Column ss:Width=\"180\"/>\n"; // Authors
    echo "   <Column ss:Width=\"160\"/>\n"; // Publisher
    echo "   <Column ss:Width=\"90\"/>\n";  // Copyright Year
    echo "   <Column ss:Width=\"130\"/>\n"; // ISBN
    echo "   <Column ss:Width=\"90\"/>\n";  // Category

    // 4. GENERATE HEADER ROW BLOCK
    echo "   <Row ss:Height=\"24\">\n";
    foreach (['ID', 'Title', 'Authors', 'Publisher', 'Copyright Year', 'ISBN', 'Category'] as $headerTitle) {
        echo "    <Cell ss:StyleID=\"HeaderStyle\"><Data ss:Type=\"String\">" . htmlspecialchars($headerTitle) . "</Data></Cell>\n";
    }
    echo "   </Row>\n";

    // 5. STREAM DATA ROWS RECORD MATRIX PIPELINES
    $query = "SELECT uuid, title, authors, publisher, copyright_year, isbn, category FROM books_inventory ORDER BY title ASC";
    $result = $conn->query($query);

    if ($result) {
        while ($row = $result->fetch_assoc()) {
            
            // CONVERT COMMA AUTHORS TO EXCEL LINE BREAKS:
            // Excel XML handles true interior cell breaks using the character sequence: &#10;
            $rawAuthors = !empty($row['authors']) ? $row['authors'] : 'N/A';
            if ($rawAuthors !== 'N/A') {
                $authorArray = explode(',', $rawAuthors);
                $cleanAuthors = implode('&#10;', array_map('trim', $authorArray));
            } else {
                $cleanAuthors = 'N/A';
            }

            echo "   <Row ss:AutoFitHeight=\"1\">\n"; // Auto-stretches cell row heights dynamically
            echo "    <Cell><Data ss:Type=\"String\">" . htmlspecialchars($row['uuid']) . "</Data></Cell>\n";
            echo "    <Cell ss:StyleID=\"TitleStyle\"><Data ss:Type=\"String\">" . htmlspecialchars($row['title']) . "</Data></Cell>\n";
            echo "    <Cell><Data ss:Type=\"String\">" . htmlspecialchars($cleanAuthors) . "</Data></Cell>\n";
            echo "    <Cell><Data ss:Type=\"String\">" . htmlspecialchars(!empty($row['publisher']) ? $row['publisher'] : 'N/A') . "</Data></Cell>\n";
            echo "    <Cell ss:StyleID=\"CenterText\"><Data ss:Type=\"Number\">" . htmlspecialchars(!empty($row['copyright_year']) ? $row['copyright_year'] : 0) . "</Data></Cell>\n";
            echo "    <Cell><Data ss:Type=\"String\">" . htmlspecialchars(!empty($row['isbn']) ? $row['isbn'] : 'No ISBN') . "</Data></Cell>\n";
            echo "    <Cell ss:StyleID=\"CenterText\"><Data ss:Type=\"String\">" . htmlspecialchars(ucfirst($row['category'])) . "</Data></Cell>\n";
            echo "   </Row>\n";
        }
    }

    echo "  </Table>\n";
    echo " </Worksheet>\n";
    echo "</Workbook>\n";
    exit();

} catch (Exception $e) {
    http_response_code(500);
    echo "Error processing spreadsheet file payload export: " . $e->getMessage();
} finally {
    if (isset($conn)) $conn->close();
}
?>
