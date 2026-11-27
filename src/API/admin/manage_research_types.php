<?php
// src/API/admin/manage_research_types.php
require_once "../dbconfig.php";
require_once "../require_admin.php";
require_once "../activity_logger.php";

if (!$conn) {
    http_response_code(500);
    echo json_encode(["success" => false, "message" => "Database Connection Failure"]);
    exit();
}

$method = $_SERVER['REQUEST_METHOD'];

try {
    if ($method === 'GET') {
        $stmt = $conn->prepare("SELECT id, setting_value FROM system_settings WHERE setting_key = 'research_type' ORDER BY id ASC");
        $stmt->execute();
        $result = $stmt->get_result();
        $types = [];
        while ($row = $result->fetch_assoc()) {
            $types[] = $row;
        }
        $stmt->close();

        echo json_encode(["success" => true, "types" => $types]);
        exit();
    }

    if ($method === 'POST') {
        // Verify admin/staff permissions just like upload_legacy_research.php
        requireStaff($conn);

        $rawInput = file_get_contents("php://input");
        $data = json_decode($rawInput, true);
        $action = $data['action'] ?? 'add';

        if ($action === 'add') {
            $newType = trim($data['value'] ?? '');

            if ($newType === '') {
                http_response_code(400);
                echo json_encode(["success" => false, "message" => "Research type cannot be empty."]);
                exit();
            }

            // Check for duplicates first
            $checkStmt = $conn->prepare("SELECT id FROM system_settings WHERE setting_key = 'research_type' AND LOWER(setting_value) = LOWER(?)");
            $checkStmt->bind_param("s", $newType);
            $checkStmt->execute();
            $checkStmt->store_result();

            if ($checkStmt->num_rows > 0) {
                $checkStmt->close();
                http_response_code(400);
                echo json_encode(["success" => false, "message" => "This research type already exists."]);
                exit();
            }
            $checkStmt->close();

            // Insert new type
            $stmt = $conn->prepare("INSERT INTO system_settings (setting_key, setting_value) VALUES ('research_type', ?)");
            $stmt->bind_param("s", $newType);

            if ($stmt->execute()) {
                $insertedId = $conn->insert_id;
                $stmt->close();

                logActivity($conn, 'settings.add_research_type', 'system_settings', (string)$insertedId, [
                    'value' => $newType
                ]);

                http_response_code(201);
                echo json_encode([
                    "success" => true,
                    "id" => $insertedId,
                    "setting_value" => $newType
                ]);
            } else {
                throw new Exception($stmt->error);
            }
            exit();
        }

        if ($action === 'delete') {
            $id = intval($data['id'] ?? 0);

            if ($id <= 0) {
                http_response_code(400);
                echo json_encode(["success" => false, "message" => "Invalid research type ID."]);
                exit();
            }

            $stmt = $conn->prepare("DELETE FROM system_settings WHERE id = ? AND setting_key = 'research_type'");
            $stmt->bind_param("i", $id);

            if ($stmt->execute()) {
                $stmt->close();

                logActivity($conn, 'settings.delete_research_type', 'system_settings', (string)$id, []);

                echo json_encode(["success" => true, "message" => "Research type deleted."]);
            } else {
                throw new Exception($stmt->error);
            }
            exit();
        }

        http_response_code(400);
        echo json_encode(["success" => false, "message" => "Invalid action."]);
        exit();
    }

    http_response_code(405);
    echo json_encode(["success" => false, "message" => "Method Not Allowed."]);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        "success" => false,
        "message" => $e->getMessage()
    ]);
}
?>
