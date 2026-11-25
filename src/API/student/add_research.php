<?php
// src/API/student/add_research.php
// CORS headers are handled centrally in dbconfig.php
require_once "../dbconfig.php";

$saved_files = []; // files already written to disk; removed again if anything fails afterwards

try {
    // 1. Setup Upload Directories
    $upload_dir  = "../../assets/uploads/research/";
    $receipt_dir = "../../assets/uploads/receipts/";
    foreach ([$upload_dir, $receipt_dir] as $dir) {
        if (!is_dir($dir)) {
            mkdir($dir, 0777, true);
        }
    }

    // 2. Process JSON Metadata
    $title = $_POST['title'];
    $abstract = $_POST['abstract'];
    $authors = $_POST['authors'];   // Already stringified JSON from React
    $keywords = $_POST['keywords']; // Already stringified JSON from React
    $type = $_POST['type'];
    $adviser = $_POST['adviser'];
    $critic = $_POST['technicalCritic'];
    $submitted_by = $_POST['submitted_by'];
    $program = $_POST['program'];             // student's program/course
    $v_code = $_POST['verification_code'];    // verification code
    $uuid = bin2hex(random_bytes(16));        // Generate a unique ID

    // 3. Validate the PDF
    if (!isset($_FILES['file']) || $_FILES['file']['error'] !== UPLOAD_ERR_OK) {
        throw new Exception("No PDF file uploaded.");
    }
    $file = $_FILES['file'];
    $file_ext = strtolower(pathinfo($file['name'], PATHINFO_EXTENSION));
    if ($file_ext !== 'pdf') {
        throw new Exception("Only PDF files are allowed.");
    }

    // 4. Validate the Printing Receipt picture (required)
    if (!isset($_FILES['receipt']) || $_FILES['receipt']['error'] !== UPLOAD_ERR_OK) {
        throw new Exception("A photo of the printing receipt is required.");
    }
    $receipt = $_FILES['receipt'];
    if ($receipt['size'] > 5 * 1024 * 1024) {
        throw new Exception("The printing receipt image must be 5MB or smaller.");
    }
    // Check the real file content, not just the name
    $imageInfo = @getimagesize($receipt['tmp_name']);
    $allowedImages = ['image/jpeg' => 'jpg', 'image/png' => 'png', 'image/webp' => 'webp'];
    if (!$imageInfo || !isset($allowedImages[$imageInfo['mime']])) {
        throw new Exception("The printing receipt must be a JPG, PNG or WEBP image.");
    }
    $receipt_ext = $allowedImages[$imageInfo['mime']];

    // 5. Rename files to prevent overwriting and handle special characters
    $stamp = time();
    $new_filename = $uuid . "_" . $stamp . ".pdf";
    $target_path = $upload_dir . $new_filename;
    $db_path = "assets/uploads/research/" . $new_filename;

    $new_receipt_name = $uuid . "_" . $stamp . "." . $receipt_ext;
    $receipt_target = $receipt_dir . $new_receipt_name;
    $db_picture_path = "assets/uploads/receipts/" . $new_receipt_name;

    // 6. Move both uploads
    if (!move_uploaded_file($file['tmp_name'], $target_path)) {
        throw new Exception("Failed to move uploaded file.");
    }
    $saved_files[] = $target_path;

    if (!move_uploaded_file($receipt['tmp_name'], $receipt_target)) {
        throw new Exception("Failed to save the printing receipt image.");
    }
    $saved_files[] = $receipt_target;

    // 7. Insert into Database
    $sql = "INSERT INTO research_projects
        (uuid, verification_code, title, abstract, authors, keywords, type, adviser, technical_critic, file_path, picture_path, submitted_by, program, status)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending')";
    $stmt = $conn->prepare($sql);
    $stmt->bind_param("sssssssssssss",
        $uuid, $v_code, $title, $abstract, $authors, $keywords, $type, $adviser, $critic,
        $db_path, $db_picture_path, $submitted_by, $program
    );

    if ($stmt->execute()) {
        echo json_encode(["success" => true, "message" => "Project submitted successfully!"]);
    } else {
        throw new Exception("Database error: " . $stmt->error);
    }
} catch (Exception $e) {
    // Don't leave orphaned files behind when the submission fails
    foreach ($saved_files as $path) {
        if (is_file($path)) {
            @unlink($path);
        }
    }
    echo json_encode(["success" => false, "message" => $e->getMessage()]);
}
$conn->close();
?>