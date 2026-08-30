<?php
// 1. ALLOW CORS AND DEFINE JSON OUTPUT HEADERS
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: DELETE, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");
header("Content-Type: application/json; charset=UTF-8");

// Handle browser preflight cross-origin safety checks automatically
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// 2. INCLUDE YOUR DATABASE CONNECTION FILE
require_once "../dbconfig.php";

if (!$conn) {
    http_response_code(500);
    echo json_encode(["success" => false, "message" => "Database Connection Failure"]);
    exit();
}

// Enforce request method constraints to look strictly for DELETE queries
if ($_SERVER['REQUEST_METHOD'] !== 'DELETE') {
    http_response_code(405);
    echo json_encode(["success" => false, "message" => "Method Not Allowed. Use DELETE requests."]);
    exit();
}

try {
    // 3. CAPTURE AND VALIDATE INCOMING URL PARAMETER TARGET
    // Expects URL formatting structure matching: ?uuid=XXXX-XXXX-XXXX
    $uuid = isset($_GET['uuid']) ? trim($_GET['uuid']) : '';

    if (empty($uuid)) {
        http_response_code(400);
        echo json_encode(["success" => false, "message" => "Research project unique UUID is required for deletion."]);
        exit();
    }

    // 4. LOOKUP ATTACHED PDF FILE PATHS FOR PHYSICAL STORAGE CLEANUP
    $findQuery = "SELECT file_path FROM research_projects WHERE uuid = ?";
    $findStmt = $conn->prepare($findQuery);
    if (!$findStmt) {
        throw new Exception($conn->error);
    }
    
    $findStmt->bind_param("s", $uuid);
    $findStmt->execute();
    $result = $findStmt->get_result();
    
    if ($result && $row = $result->fetch_assoc()) {
        $relativeFilePath = $row['file_path'];
        
        // If a file link snapshot exists, remove the asset from disk space arrays
        if (!empty($relativeFilePath)) {
            // Converts database paths ("src/assets/uploads/documents/...") 
            // back into backend path steps ("../../assets/uploads/documents/...")
            $physicalPath = str_replace("src/", "../../", $relativeFilePath);
            
            if (file_exists($physicalPath)) {
                // Erases the physical PDF document file from your XAMPP local server storage
                unlink($physicalPath); 
            }
        }
    }
    $findStmt->close();

    // 5. REMOVE THE LOG RECORD ROW FROM THE MYSQL TABLE
    $deleteSql = "DELETE FROM research_projects WHERE uuid = ?";
    $deleteStmt = $conn->prepare($deleteSql);
    if (!$deleteStmt) {
        throw new Exception($conn->error);
    }

    $deleteStmt->bind_param("s", $uuid);

    if ($deleteStmt->execute()) {
        if ($deleteStmt->affected_rows > 0) {
            http_response_code(200);
            echo json_encode([
                "success" => true,
                "message" => "Research manuscript record and corresponding digital documents wiped out successfully."
            ]);
        } else {
            http_response_code(404);
            echo json_encode([
                "success" => false,
                "message" => "Target research project row not found. It may have already been deleted."
            ]);
        }
    } else {
        throw new Exception($deleteStmt->error);
    }

    $deleteStmt->close();

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        "success" => false,
        "message" => "An operational failure occurred during record deletion.",
        "error" => $e->getMessage()
    ]);
}

$conn->close();
?>
