<?php
// src/API/admin/update_student.php
require_once "../dbconfig.php";
require_once "../require_admin.php";
require_once "../activity_logger.php";
requireStaff($conn);

// Get raw JSON data from Axios
$json = file_get_contents("php://input");
$data = json_decode($json, true);

// 1. Validation Check
if (!$data || !isset($data['student_id'])) {
    echo json_encode(["success" => false, "message" => "No Student ID received. Check if frontend is sending data correctly."]);
    exit;
}

$id = $data['student_id'];

// Snapshot BEFORE the change (for the audit log)
$snap = $conn->prepare("SELECT s.first_name, s.middle_name, s.last_name, s.suffix, s.course, s.contact_number,
                               a.email, a.account_status
                        FROM students s
                        LEFT JOIN accounts a ON a.user_id = s.student_id
                        WHERE s.student_id = ?");
$snap->bind_param("s", $id);
$snap->execute();
$before = $snap->get_result()->fetch_assoc() ?: [];
$snap->close();
$before['password_changed'] = false;

// 2. Start Transaction
$conn->begin_transaction();

try {
    // 3. Update 'students' table
    $stmt1 = $conn->prepare("UPDATE students SET
        first_name = ?,
        middle_name = ?,
        last_name = ?,
        suffix = ?,
        course = ?,
        contact_number = ?
        WHERE student_id = ?");
    $stmt1->bind_param("sssssss",
        $data['first_name'],
        $data['middle_name'],
        $data['last_name'],
        $data['suffix'],
        $data['course'],
        $data['contact_number'],
        $id
    );
    $stmt1->execute();

    // 4. Update 'accounts' table (Email and Status)
    if (!empty($data['password'])) {
        $hashed = password_hash($data['password'], PASSWORD_DEFAULT);
        $stmt2 = $conn->prepare("UPDATE accounts SET email = ?, account_status = ?, password = ? WHERE user_id = ?");
        $stmt2->bind_param("ssss", $data['email'], $data['account_status'], $hashed, $id);
    } else {
        $stmt2 = $conn->prepare("UPDATE accounts SET email = ?, account_status = ? WHERE user_id = ?");
        $stmt2->bind_param("sss", $data['email'], $data['account_status'], $id);
    }
    $stmt2->execute();

    $conn->commit();

    // ---- AUDIT LOG (passwords are never stored, only a "password_changed" flag) ----
    $after = [
        'first_name'       => $data['first_name'] ?? null,
        'middle_name'      => $data['middle_name'] ?? null,
        'last_name'        => $data['last_name'] ?? null,
        'suffix'           => $data['suffix'] ?? null,
        'course'           => $data['course'] ?? null,
        'contact_number'   => $data['contact_number'] ?? null,
        'email'            => $data['email'] ?? null,
        'account_status'   => $data['account_status'] ?? ($before['account_status'] ?? null),
        'password_changed' => !empty($data['password']),
    ];

    $oldStatus = $before['account_status'] ?? null;
    $newStatus = $after['account_status'];
    if ($oldStatus !== $newStatus && $newStatus === 'suspended')      $action = 'student.suspend';
    elseif ($oldStatus === 'suspended' && $newStatus !== $oldStatus)  $action = 'student.reactivate';
    else                                                              $action = 'student.edit';

    logChange($conn, $action, 'students', $id, $before, $after, [
        'name' => trim(($before['first_name'] ?? '') . ' ' . ($before['last_name'] ?? '')),
    ]);

    echo json_encode(["success" => true, "message" => "Update successful!"]);
} catch (Exception $e) {
    $conn->rollback();
    echo json_encode(["success" => false, "message" => "Database Error: " . $e->getMessage()]);
}

$conn->close();
?>