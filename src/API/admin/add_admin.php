<?php
// src/API/admin/add_admin.php  (superadmin only)
require_once "../dbconfig.php";
require_once "../require_admin.php";
require_once "../activity_logger.php";
requireSuperadmin($conn);

$data = json_decode(file_get_contents("php://input"), true);

$user_id = $data['user_id'];
$email = $data['email'];
$password = password_hash($data['password'], PASSWORD_DEFAULT);
$first_name = $data['first_name'];
$last_name = $data['last_name'];
$middle_name = $data['middle_name'] ?? '';
$suffix = $data['suffix'] ?? '';
$contact = $data['contact_number'];

// Start Transaction
$conn->begin_transaction();

try {
    // 1. Insert into Accounts Table
    $stmt1 = $conn->prepare("INSERT INTO Accounts (user_id, password, email, user_type, account_status) VALUES (?, ?, ?, 'admin', 'active')");
    $stmt1->bind_param("sss", $user_id, $password, $email);
    $stmt1->execute();

    // 2. Insert into Admin Table
    $stmt2 = $conn->prepare("INSERT INTO Admin (employee_id, first_name, last_name, middle_name, suffix, email, contact_number) VALUES (?, ?, ?, ?, ?, ?, ?)");
    $stmt2->bind_param("sssssss", $user_id, $first_name, $last_name, $middle_name, $suffix, $email, $contact);
    $stmt2->execute();

    // If both successful, commit
    $conn->commit();

    // Never log the password
    logActivity($conn, 'admin.create', 'accounts', $user_id, [
        'name'           => trim("$first_name $middle_name $last_name $suffix"),
        'email'          => $email,
        'contact_number' => $contact,
    ]);

    echo json_encode(["success" => true, "message" => "Admin created successfully"]);
} catch (Exception $e) {
    // If any fails, undo everything
    $conn->rollback();
    echo json_encode(["success" => false, "message" => "Error: " . $e->getMessage()]);
}

$conn->close();
?>