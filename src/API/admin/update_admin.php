<?php
// src/API/admin/update_admin.php  (superadmin only)
require_once "../dbconfig.php";
require_once "../require_admin.php";
require_once "../activity_logger.php";
requireSuperadmin($conn);

$json = file_get_contents("php://input");
$data = json_decode($json, true);

if (!$data || !isset($data['user_id'])) {
    echo json_encode(["success" => false, "message" => "No Admin ID received."]);
    exit;
}

$id = $data['user_id'];

// 1. Security Check + audit snapshot: read the current record from the DB (don't trust frontend)
$check = $conn->prepare("SELECT a.user_type, a.email, a.account_status,
                                ad.first_name, ad.middle_name, ad.last_name, ad.suffix, ad.contact_number
                         FROM Accounts a
                         LEFT JOIN Admin ad ON ad.employee_id = a.user_id
                         WHERE a.user_id = ?");
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

    // ---- AUDIT LOG (passwords are never stored, only a "password_changed" flag) ----
    $before = [
        'first_name'       => $currentUser['first_name'],
        'middle_name'      => $currentUser['middle_name'],
        'last_name'        => $currentUser['last_name'],
        'suffix'           => $currentUser['suffix'],
        'contact_number'   => $currentUser['contact_number'],
        'email'            => $currentUser['email'],
        'account_status'   => $currentUser['account_status'],
        'password_changed' => false,
    ];
    if ($isSuperAdmin) {
        $after = $before;
        $after['password_changed'] = !empty($data['password']);
    } else {
        $after = [
            'first_name'       => $data['first_name'] ?? null,
            'middle_name'      => $data['middle_name'] ?? null,
            'last_name'        => $data['last_name'] ?? null,
            'suffix'           => $data['suffix'] ?? null,
            'contact_number'   => $data['contact_number'] ?? null,
            'email'            => $data['email'] ?? null,
            'account_status'   => $data['account_status'] ?? $currentUser['account_status'],
            'password_changed' => !empty($data['password']),
        ];
    }

    $oldStatus = $currentUser['account_status'];
    $newStatus = $after['account_status'];
    if ($oldStatus !== $newStatus && $newStatus === 'suspended')      $action = 'admin.suspend';
    elseif ($oldStatus === 'suspended' && $newStatus !== $oldStatus)  $action = 'admin.reactivate';
    else                                                              $action = 'admin.update';

    logChange($conn, $action, 'accounts', $id, $before, $after, [
        'name' => trim(($currentUser['first_name'] ?? '') . ' ' . ($currentUser['last_name'] ?? '')),
    ]);

    echo json_encode(["success" => true, "message" => "Administrator updated successfully!"]);
} catch (Exception $e) {
    $conn->rollback();
    echo json_encode(["success" => false, "message" => "Database Error: " . $e->getMessage()]);
}

$conn->close();
?>