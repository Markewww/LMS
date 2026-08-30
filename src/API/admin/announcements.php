<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, DELETE, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit(); 
}

require_once "../dbconfig.php";

if (!$conn) {
    header("Content-Type: application/json; charset=UTF-8");
    http_response_code(500);
    echo json_encode(["error" => "Database Connection Failure"]);
    exit();
}

$method = $_SERVER['REQUEST_METHOD'];

try {
    // ─── GET: FETCH POSTS ───
    if ($method === 'GET') {
        header("Content-Type: application/json; charset=UTF-8");
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
                  ORDER BY a.created_at DESC"; // ─── FIXED: Added the missing semicolon here ───
                  
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
        header("Content-Type: application/json; charset=UTF-8");
        
        $adminId = isset($_POST['adminId']) ? $conn->real_escape_string($_POST['adminId']) : '';
        $text = isset($_POST['text']) ? $conn->real_escape_string($_POST['text']) : '';
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
            http_response_code(201);
            echo json_encode(["message" => "Announcement published successfully!"]);
        } else {
            throw new Exception($conn->error);
        }
    }

    // ─── DELETE: REMOVE ANNOUNCEMENT AND ALL ITS FILES ───
    elseif ($method === 'DELETE') {
        header("Content-Type: application/json; charset=UTF-8");
        $id = isset($_GET['id']) ? (int)$_GET['id'] : 0;
        
        if ($id <= 0) {
            http_response_code(400);
            echo json_encode(["error" => "Invalid assignment target ID."]);
            exit();
        }

        $findQuery = "SELECT image_path FROM announcements WHERE id = $id";
        $findResult = $conn->query($findQuery);
        
        if ($findResult && $findResult->num_rows > 0) {
            $row = $findResult->fetch_assoc();
            if (!empty($row['image_path'])) {
                $images = explode(",", $row['image_path']);
                foreach ($images as $img) {
                    $physicalPath = str_replace("src/", "../../", trim($img));
                    if (file_exists($physicalPath)) {
                        unlink($physicalPath); 
                    }
                }
            }
        }

        $deleteQuery = "DELETE FROM announcements WHERE id = $id";
        if ($conn->query($deleteQuery)) {
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
