<?php
require_once "../dbconfig.php";

if (!isset($_GET['student_id'])) {
    echo json_encode(["error" => "Student ID is required"]);
    exit;
}

$student_id = $_GET['student_id'];

try {
    // Join with students table to get the name of the uploader
    $sql = "SELECT r.*, s.first_name as owner_fname, s.last_name as owner_lname 
            FROM research_projects r
            JOIN students s ON r.submitted_by = s.student_id
            WHERE r.submitted_by = ? 
            OR r.authors LIKE ? 
            ORDER BY r.created_at DESC";
            
    $stmt = $conn->prepare($sql);
    $search_term = "%" . $student_id . "%"; 
    
    $stmt->bind_param("ss", $student_id, $search_term);
    $stmt->execute();
    $result = $stmt->get_result();

    $posts = [];
    while ($row = $result->fetch_assoc()) {
        $posts[] = $row;
    }

    echo json_encode($posts);
    $stmt->close();
} catch (Exception $e) {
    echo json_encode(["error" => $e->getMessage()]);
}
$conn->close();
?>
