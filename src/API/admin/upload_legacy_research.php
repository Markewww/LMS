<?php
// src/API/admin/upload_legacy_research.php
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

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(["success" => false, "message" => "Method Not Allowed. Use POST requests."]);
    exit();
}

try {
    // 3. CAPTURE AND VALIDATE INCOMING FORM METADATA
    $title = isset($_POST['title']) ? trim($_POST['title']) : '';
    $type = isset($_POST['type']) ? trim($_POST['type']) : 'Thesis';
    $code = isset($_POST['code']) && trim($_POST['code']) !== '' ? trim($_POST['code']) : null;
    $program = isset($_POST['program']) && trim($_POST['program']) !== '' ? trim($_POST['program']) : null;
    $year = isset($_POST['year']) && trim($_POST['year']) !== '' ? (int)$_POST['year'] : null;
    $authors = isset($_POST['authors']) && trim($_POST['authors']) !== '' ? trim($_POST['authors']) : null;
    $adviser = isset($_POST['adviser']) && trim($_POST['adviser']) !== '' ? trim($_POST['adviser']) : null;
    $technical_critic = isset($_POST['technical_critic']) && trim($_POST['technical_critic']) !== '' ? trim($_POST['technical_critic']) : null;
    $abstract = isset($_POST['abstract']) && trim($_POST['abstract']) !== '' ? trim($_POST['abstract']) : null;
    $keywords = isset($_POST['keywords']) && trim($_POST['keywords']) !== '' ? trim($_POST['keywords']) : null;
    $submitted_by = isset($_POST['submitted_by']) ? trim($_POST['submitted_by']) : null;

    if (empty($title)) {
        http_response_code(400);
        echo json_encode(["success" => false, "message" => "Project Title is required."]);
        exit();
    }

    // Check for duplicate custom call numbers if one was entered
    if ($code !== null) {
        $checkQuery = "SELECT uuid FROM research_projects WHERE code = ?";
        $checkStmt = $conn->prepare($checkQuery);
        $checkStmt->bind_param("s", $code);
        $checkStmt->execute();
        $checkStmt->store_result();
        if ($checkStmt->num_rows > 0) {
            http_response_code(400);
            echo json_encode(["success" => false, "message" => "The entered Project Code / Call Number is already registered."]);
            exit();
        }
        $checkStmt->close();
    }

    // 4. GENERATE UNIQUE IDENTIFIER (UUIDv4 compliant)
    $uuid = sprintf('%04x%04x-%04x-%04x-%04x-%04x%04x%04x',
        mt_rand(0, 0xffff), mt_rand(0, 0xffff),
        mt_rand(0, 0xffff),
        mt_rand(0, 0x0fff) | 0x4000,
        mt_rand(0, 0x3fff) | 0x8000,
        mt_rand(0, 0xffff), mt_rand(0, 0xffff), mt_rand(0, 0xffff)
    );

    // Historical entries are approved automatically
    $status = 'approved';
    $db_file_path = null;

    // 5. OPTIONAL PDF DOCUMENT PROCESSING
    if (isset($_FILES['pdf_file']) && $_FILES['pdf_file']['error'] === UPLOAD_ERR_OK) {
        $fileTmpPath = $_FILES['pdf_file']['tmp_name'];
        $fileName = $_FILES['pdf_file']['name'];
        $fileExtension = strtolower(pathinfo($fileName, PATHINFO_EXTENSION));

        if ($fileExtension !== 'pdf') {
            http_response_code(400);
            echo json_encode(["success" => false, "message" => "Invalid document layout format. Only PDF files are supported."]);
            exit();
        }

        $uploadTargetDir = '../../assets/uploads/documents/research/';
        if (!is_dir($uploadTargetDir)) {
            mkdir($uploadTargetDir, 0755, true);
        }

        $newFileName = $uuid . '.' . $fileExtension;
        $dest_path = $uploadTargetDir . $newFileName;

        if (move_uploaded_file($fileTmpPath, $dest_path)) {
            $db_file_path = "src/assets/uploads/documents/research/" . $newFileName;
        } else {
            throw new Exception("File upload failed while shifting temporary documents to production.");
        }
    }

    // 6. INSERT
    $insertQuery = "INSERT INTO research_projects (
                uuid,
                code,
                title,
                type,
                program,
                year,
                authors,
                adviser,
                technical_critic,
                abstract,
                keywords,
                file_path,
                status,
                submitted_by
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";

    $stmt = $conn->prepare($insertQuery);
    if (!$stmt) {
        throw new Exception($conn->error);
    }

    // 14 columns: 13 strings + 1 integer (year)
    $stmt->bind_param(
        "sssssissssssss",
        $uuid,
        $code,
        $title,
        $type,
        $program,
        $year,
        $authors,
        $adviser,
        $technical_critic,
        $abstract,
        $keywords,
        $db_file_path,
        $status,
        $submitted_by
    );

    if ($stmt->execute()) {
        logActivity($conn, 'research.upload', 'research_project', $code ?: $uuid, [
            'title'   => $title,
            'type'    => $type,
            'program' => $program,
            'year'    => $year,
            'authors' => $authors,
            'legacy'  => true,
            'has_pdf' => $db_file_path !== null,
        ]);

        http_response_code(201);
        echo json_encode([
            "success" => true,
            "message" => "Legacy study registered successfully into the historical archives.",
            "uuid" => $uuid
        ]);
    } else {
        throw new Exception($stmt->error);
    }

    $stmt->close();

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        "success" => false,
        "message" => "Archiving operation failure.",
        "error" => $e->getMessage()
    ]);
}
?>