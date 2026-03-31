<?php
require_once "../dbconfig.php";

try {
    // We JOIN with the students table to get the owner's full name
    $sql = "SELECT 
                r.*, 
                s.first_name AS owner_fname, 
                s.last_name AS owner_lname 
            FROM research_projects r
            INNER JOIN students s ON r.submitted_by = s.student_id
            ORDER BY r.created_at DESC";

    $result = $conn->query($sql);

    if ($result) {
        $submissions = [];
        while ($row = $result->fetch_assoc()) {
            $submissions[] = $row;
        }
        echo json_encode($submissions);
    } else {
        echo json_encode(["error" => "Query failed: " . $conn->error]);
    }

} catch (Exception $e) {
    echo json_encode(["error" => "Server Error: " . $e->getMessage()]);
}

$conn->close();
?>
