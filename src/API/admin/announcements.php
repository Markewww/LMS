<?php
// src/API/admin/announcements.php
// CORS headers and OPTIONS preflight are handled centrally in dbconfig.php
require_once "../dbconfig.php";
require_once "../require_admin.php";
require_once "../activity_logger.php";

if (!$conn) {
    http_response_code(500);
    echo json_encode(["error" => "Database Connection Failure"]);
    exit();
}

$method = $_SERVER['REQUEST_METHOD'];

// Reading the feed stays public (students see it); posting and deleting are staff-only
if ($method !== 'GET') {
    requireStaff($conn);
}

try {
    // ─── GET: FETCH POSTS ───
    if ($method === 'GET') {
        $query = "SELECT
              a.id,
              a.admin_id,
              a.announcement_text,
              a.image_path,
              a.bg_id,
              a.created_at,
              adm.first_name,
              adm.last_name
              FROM announcements a
          LEFT JOIN admin adm ON a.admin_id = adm.employee_id
          ORDER BY a.created_at DESC";

        $result = $conn->query($query);
        if (!$result) throw new Exception($conn->error);

        $announcements = [];
        while ($row = $result->fetch_assoc()) {
            $fullName = (!empty($row['first_name']) && !empty($row['last_name']))
                ? $row['first_name'] . " " . $row['last_name']
                : $row['admin_id'];

            $announcements[] = [
                "id" => (int)$row['id'],
                "adminId" => $row['admin_id'],
                "adminName" => $fullName,
                "text" => $row['announcement_text'],
                "imagePath" => $row['image_path'] ? $row['image_path'] : null,
                "bgId" => isset($row['bg_id']) ? $row['bg_id'] : 'none',
                "createdAt" => $row['created_at']
            ];
        }
        http_response_code(200);
        echo json_encode($announcements);
    }

    // ─── POST: CREATE NEW MULTI-IMAGE/BG POST ───
    elseif ($method === 'POST') {
        $rawText = isset($_POST['text']) ? trim($_POST['text']) : '';
        $adminId = isset($_POST['adminId']) ? $conn->real_escape_string($_POST['adminId']) : '';
        $text = $conn->real_escape_string($rawText);
        $bgId = isset($_POST['bgId']) ? $conn->real_escape_string($_POST['bgId']) : 'none';
        $uploadedPaths = [];

        if (empty($adminId) || empty($text)) {
            http_response_code(400);
            echo json_encode(["error" => "Admin ID and announcement text are required."]);
            exit();
        }

        if (isset($_FILES['images']['name']) && is_array($_FILES['images']['name'])) {
            $totalFiles = count($_FILES['images']['name']);
            $uploadTargetDir = '../../assets/uploads/images/';

            if (!is_dir($uploadTargetDir)) {
                mkdir($uploadTargetDir, 0755, true);
            }

            for ($i = 0; $i < $totalFiles; $i++) {
                if ($_FILES['images']['error'][$i] === UPLOAD_ERR_OK) {
                    $fileTmpPath = $_FILES['images']['tmp_name'][$i];
                    $fileName = $_FILES['images']['name'][$i];
                    $fileExtension = strtolower(pathinfo($fileName, PATHINFO_EXTENSION));
                    $allowedExtensions = ['jpg', 'jpeg', 'png', 'gif', 'webp'];

                    if (in_array($fileExtension, $allowedExtensions)) {
                        $newFileName = md5(time() . $fileName . $i) . '.' . $fileExtension;
                        $dest_path = $uploadTargetDir . $newFileName;

                        if (move_uploaded_file($fileTmpPath, $dest_path)) {
                            $uploadedPaths[] = "src/assets/uploads/images/" . $newFileName;
                        }
                    }
                }
            }
        }

        $db_image_path = count($uploadedPaths) > 0 ? implode(",", $uploadedPaths) : null;
        $db_image_val = $db_image_path ? "'$db_image_path'" : "NULL";

        $query = "INSERT INTO announcements (admin_id, announcement_text, image_path, bg_id) VALUES ('$adminId', '$text', $db_image_val, '$bgId')";

        if ($conn->query($query)) {
            $newId = $conn->insert_id;

            logActivity($conn, 'announcement.create', 'announcements', (string)$newId, [
                'text'   => auditTrim($rawText),
                'images' => count($uploadedPaths),
                'bg_id'  => $bgId,
            ]);

            http_response_code(201);
            echo json_encode(["message" => "Announcement published successfully!"]);
        } else {
            throw new Exception($conn->error);
        }
    }

    // ─── DELETE: REMOVE ANNOUNCEMENT AND ALL ITS FILES ───
    elseif ($method === 'DELETE') {
        $id = isset($_GET['id']) ? (int)$_GET['id'] : 0;

        if ($id <= 0) {
            http_response_code(400);
            echo json_encode(["error" => "Invalid assignment target ID."]);
            exit();
        }

        // Read the post first (also the audit snapshot)
        $findResult = $conn->query("SELECT admin_id, announcement_text, image_path FROM announcements WHERE id = $id");
        $old = null;

        if ($findResult && $findResult->num_rows > 0) {
            $old = $findResult->fetch_assoc();

            if (!empty($old['image_path'])) {
                $images = explode(",", $old['image_path']);
                foreach ($images as $img) {
                    $physicalPath = str_replace("src/", "../../", trim($img));
                    if (file_exists($physicalPath)) {
                        unlink($physicalPath);
                    }
                }
            }
        }

        if ($conn->query("DELETE FROM announcements WHERE id = $id")) {
            if ($old) {
                logActivity($conn, 'announcement.delete', 'announcements', (string)$id, [
                    'deleted' => [
                        'posted_by' => $old['admin_id'],
                        'text'      => auditTrim($old['announcement_text']),
                        'images'    => empty($old['image_path']) ? 0 : count(explode(",", $old['image_path'])),
                    ],
                ]);
            }
            http_response_code(200);
            echo json_encode(["message" => "Post removed successfully!"]);
        } else {
            throw new Exception($conn->error);
        }
    }

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(["error" => "Operation Failed", "message" => $e->getMessage()]);
}
?>