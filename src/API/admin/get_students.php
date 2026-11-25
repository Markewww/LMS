<?php
require_once "../dbconfig.php";

try {
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
                s.created_at AS created_at,
                CASE 
                    WHEN SUM(CASE WHEN rp.status = 'approved' THEN 1 ELSE 0 END) > 0 THEN 'verified'
                    ELSE MAX(CASE WHEN rp.status = 'pending' THEN rp.verification_code ELSE NULL END)
                END AS research_badge
            FROM accounts a
            INNER JOIN students s ON a.user_id = s.student_id
            LEFT JOIN research_projects rp 
                ON s.student_id = rp.submitted_by
                OR (
                    rp.authors IS NOT NULL 
                    AND LOWER(rp.authors) LIKE CONCAT('%', LOWER(TRIM(s.first_name)), '%')
                    AND LOWER(rp.authors) LIKE CONCAT('%', LOWER(TRIM(s.last_name)), '%')
                )
            WHERE a.user_type = 'student'
            GROUP BY 
                a.user_id,
                a.account_status,
                a.email,
                s.first_name,
                s.middle_name,
                s.last_name,
                s.suffix,
                s.course,
                s.contact_number,
                s.qr_data,
                s.created_at
            ORDER BY s.last_name ASC";

    $result = $conn->query($sql);

    if ($result) {
        $students = [];
        while ($row = $result->fetch_assoc()) {
            $students[] = $row;
        }
        echo json_encode($students);
    } else {
        echo json_encode(["error" => "Query failed: " . $conn->error]);
    }
} catch (Exception $e) {
    echo json_encode(["error" => "Server Error: " . $e->getMessage()]);
}

$conn->close();
?>