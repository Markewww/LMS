<?php
// src/API/admin/delete_research.php
// CORS headers and OPTIONS preflight are handled centrally in dbconfig.php
require_once "../dbconfig.php";
require_once "../require_admin.php";
require_once "../activity_logger.php";

if (!$conn) {
    http_response_code(500);
    echo json_encode(["success" => false, "message" => "Database Connection Failure"]);
    exit();
}

requireStaff($conn);

// Enforce DELETE requests only
if ($_SERVER['REQUEST_METHOD'] !== 'DELETE') {
    http_response_code(405);
    echo json_encode(["success" => false, "message" => "Method Not Allowed. Use DELETE requests."]);
    exit();
}

try {
    // 3. CAPTURE AND VALIDATE INCOMING URL PARAMETER (?uuid=XXXX-XXXX-XXXX)
    $uuid = isset($_GET['uuid']) ? trim($_GET['uuid']) : '';

    if (empty($uuid)) {
        http_response_code(400);
        echo json_encode(["success" => false, "message" => "Research project unique UUID is required for deletion."]);
        exit();
    }

    // 4. LOOK UP THE RECORD (also used as the audit snapshot) AND ITS PDF PATH
    $findQuery = "SELECT code, title, type, program, year, authors, status, file_path
                  FROM research_projects WHERE uuid = ?";
    $findStmt = $conn->prepare($findQuery);
    if (!$findStmt) {
        throw new Exception($conn->error);
    }
    $findStmt->bind_param("s", $uuid);
    $findStmt->execute();
    $result = $findStmt->get_result();
    $old = null;

    if ($result && $row = $result->fetch_assoc()) {
        $old = $row;
        $relativeFilePath = $row['file_path'];

        // Remove the PDF from disk if one is attached
        if (!empty($relativeFilePath)) {
            $physicalPath = str_replace("src/", "../../", $relativeFilePath);
            if (file_exists($physicalPath)) {
                unlink($physicalPath);
            }
        }
    }
    $findStmt->close();

    // 5. REMOVE THE ROW FROM THE TABLE
    $deleteSql = "DELETE FROM research_projects WHERE uuid = ?";
    $deleteStmt = $conn->prepare($deleteSql);
    if (!$deleteStmt) {
        throw new Exception($conn->error);
    }
    $deleteStmt->bind_param("s", $uuid);

    if ($deleteStmt->execute()) {
        if ($deleteStmt->affected_rows > 0) {
            if ($old) {
                $old['had_pdf'] = !empty($old['file_path']);
                unset($old['file_path']);
                logActivity($conn, 'research.delete', 'research_project', $old['code'] ?: $uuid, ['deleted' => $old]);
            }
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