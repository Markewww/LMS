<?php
require_once "../dbconfig.php";

try {
    // We join the tables on user_id (from accounts) and student_id (from students)
    // We filter for 'student' user_type to exclude admins from this list
    $sql = "SELECT 
            a.user_id AS student_id,
            a.account_status AS account_status,
            a.email AS email,
            s.first_name AS first_name,
            s.middle_name AS middle_name,
            s.last_name AS last_name,
            s.suffix AS suffix,
            s.course AS course,
            s.contact_number AS contact_number,
            s.qr_data AS qr_data,
            s.created_at AS created_at
        FROM accounts a
        INNER JOIN students s ON a.user_id = s.student_id
        WHERE a.user_type = 'student'
        ORDER BY s.last_name ASC";

    $result = $conn->query($sql);

    if ($result) {
        $students = [];
        
        while ($row = $result->fetch_assoc()) {
            $students[] = $row;
        }

        // Return the array directly for React to map over
        echo json_encode($students);
    } else {
        echo json_encode(["error" => "Query failed: " . $conn->error]);
    }

} catch (Exception $e) {
    echo json_encode(["error" => "Server Error: " . $e->getMessage()]);
}

$conn->close();
?>
