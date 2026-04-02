<?php
require_once "../dbconfig.php";

$json = file_get_contents("php://input");
$data = json_decode($json, true);

if (!$data || !isset($data['user_id'])) {
    echo json_encode(["success" => false, "message" => "No Admin ID received."]);
    exit;
}

$id = $data['user_id'];

// 1. Security Check: Get current user_type from DB (don't trust frontend)
$check = $conn->prepare("SELECT user_type FROM Accounts WHERE user_id = ?");
$check->bind_param("s", $id);
$check->execute();
$result = $check->get_result();
$currentUser = $result->fetch_assoc();

if (!$currentUser) {
    echo json_encode(["success" => false, "message" => "Account not found."]);
    exit;
}

$isSuperAdmin = ($currentUser['user_type'] === 'superadmin');

$conn->begin_transaction();

try {
    // 2. Update Admin Table (Profile) - Skip if Superadmin
    if (!$isSuperAdmin) {
        $stmt1 = $conn->prepare("UPDATE Admin SET 
            first_name = ?, 
            middle_name = ?, 
            last_name = ?, 
            suffix = ?, 
            contact_number = ?,
            email = ? 
            WHERE employee_id = ?");
        
        $stmt1->bind_param("sssssss", 
            $data['first_name'], 
            $data['middle_name'], 
            $data['last_name'], 
            $data['suffix'], 
            $data['contact_number'],
            $data['email'],
            $id
        );
        $stmt1->execute();
    }

    // 3. Update Accounts Table (Credentials & Status)
    if ($isSuperAdmin) {
        // Superadmin: ONLY allowed to update password
        if (!empty($data['password'])) {
            $hashed = password_hash($data['password'], PASSWORD_DEFAULT);
            $stmt2 = $conn->prepare("UPDATE Accounts SET password = ? WHERE user_id = ?");
            $stmt2->bind_param("ss", $hashed, $id);
            $stmt2->execute();
        }
    } else {
        // Regular Admin: Update email, status, and password (if provided)
        if (!empty($data['password'])) {
            $hashed = password_hash($data['password'], PASSWORD_DEFAULT);
            $stmt2 = $conn->prepare("UPDATE Accounts SET email = ?, account_status = ?, password = ? WHERE user_id = ?");
            $stmt2->bind_param("ssss", $data['email'], $data['account_status'], $hashed, $id);
        } else {
            $stmt2 = $conn->prepare("UPDATE Accounts SET email = ?, account_status = ? WHERE user_id = ?");
            $stmt2->bind_param("sss", $data['email'], $data['account_status'], $id);
        }
        $stmt2->execute();
    }

    $conn->commit();
    echo json_encode(["success" => true, "message" => "Administrator updated successfully!"]);

} catch (Exception $e) {
    $conn->rollback();
    echo json_encode(["success" => false, "message" => "Database Error: " . $e->getMessage()]);
}

$conn->close();
?>
