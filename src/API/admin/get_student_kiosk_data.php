<?php
// 2. INCLUDE DATABASE CONFIGURATION
require_once "../dbconfig.php";

if (!$conn) {
    http_response_code(500);
    echo json_encode(["success" => false, "message" => "Database Connection Failure"]);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    http_response_code(405);
    echo json_encode(["success" => false, "message" => "Method Not Allowed. Use GET requests."]);
    exit;
}

// 3. CAPTURE AND VALIDATE INCOMING STUDENT ID / QR LOG STRING
$student_input = $_GET['id'] ?? null;
if (!$student_input || trim($student_input) === "") {
    http_response_code(400);
    echo json_encode(["success" => false, "message" => "Missing student QR identification payload."]);
    exit;
}

try {
    // 4. STEP A: FETCH STUDENT INFORMATION FROM REGISTRY
    // Checks both student_id and qr_data column variations for absolute flexibility
    $studentStmt = $conn->prepare("SELECT student_id, first_name, last_name FROM students WHERE student_id = ? OR qr_data = ? LIMIT 1");
    $studentStmt->bind_param("ss", $student_input, $student_input);
    $studentStmt->execute();
    $studentResult = $studentStmt->get_result()->fetch_assoc();

    if (!$studentResult) {
        http_response_code(404);
        echo json_encode(["success" => false, "message" => "Student not found or invalid QR code registration."]);
        exit;
    }

    $studentId = $studentResult['student_id'];
    $fullName  = trim($studentResult['first_name'] . " " . $studentResult['last_name']);

    $borrowedAssets = [];

    // 5. STEP B: MERGE ACTIVE BOOK LOANS INTO UNIFIED DATA ARRAY
    // Selects active checkouts from your circulation logs where the status is "borrowed" or "overdue"
    // Adjust table and column names below to match your precise schema if different
    $bookSql = "SELECT cl.barcode AS asset_id, bi.title AS asset_title, cl.borrow_date, cl.due_date 
                FROM circulation_logs cl
                JOIN books_inventory bi ON cl.barcode = bi.barcode
                WHERE cl.student_id = ? AND cl.status IN ('borrowed', 'overdue')";
                
    $bookStmt = $conn->prepare($bookSql);
    $bookStmt->bind_param("s", $studentId);
    $bookStmt->execute();
    $bookResult = $bookStmt->get_result();

    while ($row = $bookResult->fetch_assoc()) {
        $borrowedAssets[] = [
            "asset_id"    => $row['asset_id'],
            "asset_title" => $row['asset_title'],
            "asset_type"  => "book",
            "borrow_date" => $row['borrow_date'],
            "due_date"    => $row['due_date']
        ];
    }

    // 6. STEP C: MERGE ACTIVE RESEARCH MANUSCRIPT LOANS INTO UNIFIED DATA ARRAY
    // Selects active checkouts for Capstones/Theses from your research tracking logs
    $researchSql = "SELECT rl.code AS asset_id, rp.title AS asset_title, rl.borrow_date, rl.due_date 
                    FROM research_logs rl
                    JOIN research_projects rp ON rl.code = rp.code
                    WHERE rl.student_id = ? AND rl.status IN ('borrowed', 'overdue')";
                    
    $researchStmt = $conn->prepare($researchSql);
    $researchStmt->bind_param("s", $studentId);
    $researchStmt->execute();
    $researchResult = $researchStmt->get_result();

    while ($row = $researchResult->fetch_assoc()) {
        $borrowedAssets[] = [
            "asset_id"    => $row['asset_id'],
            "asset_title" => $row['asset_title'],
            "asset_type"  => "research",
            "borrow_date" => $row['borrow_date'],
            "due_date"    => $row['due_date']
        ];
    }

    // 7. DISPATCH PAYLOAD BACK TO FRONTEND COMPONENT
    http_response_code(200);
    echo json_encode([
        "success"        => true,
        "student_id"     => $studentId,
        "name"           => $fullName,
        "borrowed_assets" => $borrowedAssets
    ]);

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        "success" => false, 
        "message" => "Kiosk Registry processing failure.",
        "debug"   => $e->getMessage()
    ]);
} finally {
    if (isset($studentStmt)) $studentStmt->close();
    if (isset($bookStmt)) $bookStmt->close();
    if (isset($researchStmt)) $researchStmt->close();
    $conn->close();
}
?>
