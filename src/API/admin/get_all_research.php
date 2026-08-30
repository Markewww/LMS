<?php
require_once "../dbconfig.php";

if (!$conn) {
    http_response_code(500);
    echo json_encode(["error" => "Database Connection Failure"]);
    exit();
}

try {
    // ─── FIX: Changed INNER JOIN to LEFT JOIN ───
    // This allows records submitted by administrators (like legacy papers) to display safely.
    $sql = "SELECT 
                r.*, 
                s.first_name AS owner_fname, 
                s.last_name AS owner_lname,
                adm.first_name AS admin_fname,
                adm.last_name AS admin_lname
            FROM research_projects r
            LEFT JOIN students s ON r.submitted_by = s.student_id
            LEFT JOIN admin adm ON r.submitted_by = adm.employee_id
            ORDER BY r.created_at DESC";

    $result = $conn->query($sql);

    if ($result) {
        $submissions = [];
        while ($row = $result->fetch_assoc()) {
            // Build a clean, combined string field indicating the uploader's name or fallback to their raw ID
            if (!empty($row['owner_fname'])) {
                $row['uploader_name'] = $row['owner_fname'] . ' ' . $row['owner_lname'];
            } elseif (!empty($row['admin_fname'])) {
                $row['uploader_name'] = $row['admin_fname'] . ' ' . $row['admin_lname'];
            } else {
                $row['uploader_name'] = $row['submitted_by'];
            }

            $submissions[] = $row;
        }
        
        http_response_code(200);
        echo json_encode($submissions);
    } else {
        http_response_code(500);
        echo json_encode(["error" => "Query failed: " . $conn->error]);
    }

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(["error" => "Server Error: " . $e->getMessage()]);
}

$conn->close();
?>
