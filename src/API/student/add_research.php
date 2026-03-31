<?php
require_once "../dbconfig.php";

try {
    // 1. Setup Upload Directory
    $upload_dir = "../../assets/uploads/research/";
    if (!is_dir($upload_dir)) {
        mkdir($upload_dir, 0777, true);
    }

    // 2. Process JSON Metadata
    $title = $_POST['title'];
    $abstract = $_POST['abstract'];
    $authors = $_POST['authors']; // Already stringified JSON from React
    $keywords = $_POST['keywords']; // Already stringified JSON from React
    $type = $_POST['type'];
    $adviser = $_POST['adviser'];
    $critic = $_POST['technicalCritic'];
    $submitted_by = $_POST['submitted_by'];
    $program = $_POST['program']; // New field for student's program/course
    $uuid = bin2hex(random_bytes(16)); // Generate a unique ID

    // 3. Handle PDF Upload
    if (!isset($_FILES['file'])) {
        throw new Exception("No PDF file uploaded.");
    }

    $file = $_FILES['file'];
    $file_ext = strtolower(pathinfo($file['name'], PATHINFO_EXTENSION));
    
    // Security: Check if it's actually a PDF
    if ($file_ext !== 'pdf') {
        throw new Exception("Only PDF files are allowed.");
    }

    // Rename file to prevent overwriting and handle special characters
    $new_filename = $uuid . "_" . time() . ".pdf";
    $target_path = $upload_dir . $new_filename;
    $db_path = "assets/uploads/research/" . $new_filename;

    if (move_uploaded_file($file['tmp_name'], $target_path)) {
        // 4. Insert into Database
        $sql = "INSERT INTO research_projects 
                (uuid, title, abstract, authors, keywords, type, adviser, technical_critic, file_path, submitted_by, program, status) 
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending')";
        
        $stmt = $conn->prepare($sql);
        $stmt->bind_param("sssssssssss", 
            $uuid, $title, $abstract, $authors, $keywords, $type, $adviser, $critic, $db_path, $submitted_by, $program
        );

        if ($stmt->execute()) {
            echo json_encode(["success" => true, "message" => "Project submitted successfully!"]);
        } else {
            throw new Exception("Database error: " . $stmt->error);
        }
    } else {
        throw new Exception("Failed to move uploaded file.");
    }

} catch (Exception $e) {
    echo json_encode(["success" => false, "message" => $e->getMessage()]);
}

$conn->close();
?>
