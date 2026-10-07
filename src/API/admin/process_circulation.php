<?php
// 1. ALLOW CORS AND DEFINE JSON OUTPUT HEADERS
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");
header("Content-Type: application/json; charset=UTF-8");

// 2. INCLUDE DATABASE CONFIGURATION
require_once "../dbconfig.php";

if (!$conn) {
    http_response_code(500);
    echo json_encode(["success" => false, "message" => "Database Connection Failure"]);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(["success" => false, "message" => "Method Not Allowed. Use POST requests."]);
    exit;
}

// 3. READ COMPRESSED JSON POST PAYLOAD BODY FROM REACT
$data = json_decode(file_get_contents("php://input"), true);
$student_id = $data['student_id'] ?? null;
$asset_code = $data['asset_code'] ?? null;

if (!$student_id || !$asset_code) {
    http_response_code(400);
    echo json_encode(["success" => false, "message" => "Incomplete request parameters: Missing Student ID or Asset Code."]);
    exit;
}

try {
    $asset_title = "";
    $asset_type = "";
    $is_book = false;
    $is_research = false;

    // 4. IDENTIFY IF THE SCANNED CODE IS A BOOK OR A RESEARCH MANUSCRIPT
    // Check Books Inventory First
    $bookCheck = $conn->prepare("SELECT title, stock FROM books_inventory WHERE barcode = ? LIMIT 1");
    $bookCheck->bind_param("s", $asset_code);
    $bookCheck->execute();
    $bookRow = $bookCheck->get_result()->fetch_assoc();

    if ($bookRow) {
        $asset_title = $bookRow['title'];
        $asset_type = "book";
        $is_book = true;
    } else {
        // If not a book, check Research Projects
        $researchCheck = $conn->prepare("SELECT title FROM research_projects WHERE code = ? LIMIT 1");
        $researchCheck->bind_param("s", $asset_code);
        $researchCheck->execute();
        $researchRow = $researchCheck->get_result()->fetch_assoc();

        if ($researchRow) {
            $asset_title = $researchRow['title'];
            $asset_type = "research";
            $is_research = true;
        }
    }

    // If item doesn't exist in either inventory table
    if (!$is_book && !$is_research) {
        http_response_code(404);
        echo json_encode(["success" => false, "message" => "Item tracking code not found in Library or Research registry."]);
        exit;
    }

    // 5. AUTOMATIC TRANSACTION SELECTOR (CHECK IF ACTIVE LOAN EXISTS FOR THIS STUDENT)
    $has_active_loan = false;
    $log_uuid = "";

    if ($is_book) {
        $loanCheck = $conn->prepare("SELECT uuid FROM circulation_logs WHERE student_id = ? AND barcode = ? AND status IN ('borrowed', 'overdue') LIMIT 1");
    } else {
        $loanCheck = $conn->prepare("SELECT uuid FROM research_logs WHERE student_id = ? AND code = ? AND status IN ('borrowed', 'overdue') LIMIT 1");
    }
    
    $loanCheck->bind_param("ss", $student_id, $asset_code);
    $loanCheck->execute();
    $loanRow = $loanCheck->get_result()->fetch_assoc();

    if ($loanRow) {
        $has_active_loan = true;
        $log_uuid = $loanRow['uuid'];
    }

    // 6. EXECUTE THE TRANSACTION (RETURN OR BORROW)
    if ($has_active_loan) {
        // --- ACTION A: PROCESS RETURN (CHECK-IN) ---
        if ($is_book) {
            $updateLog = $conn->prepare("UPDATE circulation_logs SET return_date = CURDATE(), status = 'returned' WHERE uuid = ?");
            // Increment book inventory stock count by 1
            $updateStock = $conn->prepare("UPDATE books_inventory SET stock = stock + 1 WHERE barcode = ?");
            $updateStock->bind_param("s", $asset_code);
            $updateStock->execute();
        } else {
            $updateLog = $conn->prepare("UPDATE research_logs SET return_date = CURDATE(), status = 'returned' WHERE uuid = ?");
        }
        
        $updateLog->with = false;
        $updateLog->bind_param("s", $log_uuid);
        $updateLog->execute();

        $action_msg = "Successfully processed return checkout.";
        $action_type = "return";

    } else {
        // --- ACTION B: PROCESS BORROW (CHECK-OUT) ---
        // Inventory availability check for books
        if ($is_book && $bookRow['stock'] <= 0) {
            http_response_code(200);
            echo json_encode(["success" => false, "message" => "Transaction Denied: This book copy is currently out of stock."]);
            exit;
        }

        // Generate a clean transaction UUID
        $new_uuid = bin2hex(random_bytes(16));
        
        // Define standard grace periods (Books = 7 Days, Researches must stay in room = 1 Day/Same Day)
        $days_allowed = $is_book ? 7 : 0; 

        if ($is_book) {
            $insertLog = $conn->prepare("INSERT INTO circulation_logs (uuid, student_id, barcode, borrow_date, due_date, status) VALUES (?, ?, ?, CURDATE(), DATE_ADD(CURDATE(), INTERVAL ? DAY), 'borrowed')");
            // Decrement book inventory stock count by 1
            $updateStock = $conn->prepare("UPDATE books_inventory SET stock = stock - 1 WHERE barcode = ?");
            $updateStock->bind_param("s", $asset_code);
            $updateStock->execute();
        } else {
            $insertLog = $conn->prepare("INSERT INTO research_logs (uuid, student_id, code, borrow_date, due_date, status) VALUES (?, ?, ?, CURDATE(), CURDATE(), 'borrowed')");
        }

        if ($is_book) {
            $insertLog->bind_param("sssi", $new_uuid, $student_id, $asset_code, $days_allowed);
        } else {
            $insertLog->bind_param("sss", $new_uuid, $student_id, $asset_code);
        }
        
        $insertLog->execute();

        $action_msg = "Asset successfully checked out.";
        $action_type = "borrow";
    }

    // 7. FETCH FRESH UPDATED LEDGER ARRAYS FOR REACT TO IMMEDIATELY RENDER ON MONITOR
    $updatedAssets = [];
    
    // Fetch remaining books
    $freshBooks = $conn->prepare("SELECT cl.barcode AS asset_id, bi.title AS asset_title, cl.borrow_date, cl.due_date FROM circulation_logs cl JOIN books_inventory bi ON cl.barcode = bi.barcode WHERE cl.student_id = ? AND cl.status IN ('borrowed', 'overdue')");
    $freshBooks->bind_param("s", $student_id);
    $freshBooks->execute();
    $fbResult = $freshBooks->get_result();
    while ($r = $fbResult->fetch_assoc()) {
        $updatedAssets[] = ["asset_id" => $r['asset_id'], "asset_title" => $r['asset_title'], "asset_type" => "book", "borrow_date" => $r['borrow_date'], "due_date" => $r['due_date']];
    }

    // Fetch remaining research papers
    $freshResearch = $conn->prepare("SELECT rl.code AS asset_id, rp.title AS asset_title, rl.borrow_date, rl.due_date FROM research_logs rl JOIN research_projects rp ON rl.code = rp.code WHERE rl.student_id = ? AND rl.status IN ('borrowed', 'overdue')");
    $freshResearch->bind_param("s", $student_id);
    $freshResearch->execute();
    $frResult = $freshResearch->get_result();
    while ($r = $frResult->fetch_assoc()) {
        $updatedAssets[] = ["asset_id" => $r['asset_id'], "asset_title" => $r['asset_title'], "asset_type" => "research", "borrow_date" => $r['borrow_date'], "due_date" => $r['due_date']];
    }

    // 8. DISPATCH LIVE PAYLOAD RESPONSES
    http_response_code(200);
    echo json_encode([
        "success"        => true,
        "action"         => $action_type,
        "message"        => $action_msg,
        "asset_title"    => $asset_title,
        "updated_assets" => $updatedAssets
    ]);

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(["success" => false, "message" => "Database transaction exception: " . $e->getMessage()]);
} finally {
    if (isset($bookCheck)) $bookCheck->close();
    if (isset($researchCheck)) $researchCheck->close();
    if (isset($loanCheck)) $loanCheck->close();
    if (isset($updateLog)) $updateLog->close();
    if (isset($insertLog)) $insertLog->close();
    if (isset($updateStock)) $updateStock->close();
    $conn->close();
}
?>
