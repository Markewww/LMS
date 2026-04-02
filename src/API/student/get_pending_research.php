<?php
require_once "../dbconfig.php";

$student_id = $_GET['student_id'];

// We use JSON_SEARCH to find the student_id within the authors JSON array
$sql = "SELECT * FROM research_projects 
        WHERE status = 'pending' 
        AND (submitted_by = ? OR JSON_SEARCH(authors, 'one', ?))
        ORDER BY created_at DESC";

$stmt = $conn->prepare($sql);
$stmt->bind_param("ss", $student_id, $student_id);
$stmt->execute();
$result = $stmt->get_result();

$pending = [];
while($row = $result->fetch_assoc()) {
    $pending[] = $row;
}

echo json_encode($pending);
$stmt->close();
$conn->close();
?>
