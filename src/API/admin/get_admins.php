<?php
// Correct relative path
require_once "../dbconfig.php"; 

try {
    $sql = "SELECT 
                a.user_id, 
                ad.last_name, 
                ad.first_name, 
                ad.middle_name, 
                ad.suffix, 
                ad.email, 
                ad.contact_number,
                a.user_type,
                a.account_status
            FROM Accounts a
            INNER JOIN Admin ad ON a.user_id = ad.employee_id
            WHERE a.user_type IN ('admin', 'superadmin')
            ORDER BY ad.last_name ASC";

    $result = $conn->query($sql);

    if ($result) {
        $admins = [];
        while ($row = $result->fetch_assoc()) {
            $admins[] = $row;
        }
        // Send the array directly, not wrapped in another array
        echo json_encode($admins); 
    } else {
        echo json_encode(["error" => "SQL Error: " . $conn->error]);
    }
} catch (Exception $e) {
    echo json_encode(["error" => "Server Error: " . $e->getMessage()]);
}

$conn->close();
?>
