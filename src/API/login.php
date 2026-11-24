<?php
// src/API/login.php
session_start();
require_once 'dbconfig.php';
require_once 'activity_logger.php';

$data = json_decode(file_get_contents("php://input"), true);
$idOrUser = $data['id'] ?? '';
$password = $data['password'] ?? '';

// 1. Find the user first
$sql = "SELECT * FROM accounts WHERE user_id = ? OR username = ?";
$stmt = $conn->prepare($sql);
$stmt->bind_param("ss", $idOrUser, $idOrUser);
$stmt->execute();
$result = $stmt->get_result();

if ($result->num_rows > 0) {
    $user = $result->fetch_assoc();
    $isStaff = in_array($user['user_type'], ['admin', 'superadmin'], true);

    // Actor info used for failed attempts (no session exists yet)
    $actor = [
        'uuid'    => (int)$user['uuid'],
        'user_id' => $user['user_id'],
        'name'    => $user['username'] ?: $user['user_id'],
        'role'    => $user['user_type'],
    ];

    // 2. PENDING
    if ($user['account_status'] === 'pending') {
        echo json_encode([
            "success" => false,
            "message" => "Your account is still under admin approval. Please check back later."
        ]);
        exit;
    }

    // 3. SUSPENDED
    if ($user['account_status'] === 'suspended') {
        if ($isStaff) {
            logActivity($conn, 'auth.login_failed', 'accounts', $user['user_id'], ['reason' => 'suspended'], $actor);
        }
        echo json_encode([
            "success" => false,
            "message" => "Your account has been suspended. Please contact the CEIT Reading Room admin."
        ]);
        exit;
    }

    // 4. Verify password
    if (password_verify($password, $user['password'])) {

        // Build a display name for the audit log (staff names live in the admin table)
        $fullName = $user['username'] ?: $user['user_id'];
        if ($isStaff) {
            $n = $conn->prepare("SELECT first_name, last_name FROM admin WHERE employee_id = ? LIMIT 1");
            $n->bind_param("s", $user['user_id']);
            $n->execute();
            if ($row = $n->get_result()->fetch_assoc()) {
                $fullName = trim($row['first_name'] . ' ' . $row['last_name']);
            }
            $n->close();
        }

        // Start the server-side session
        session_regenerate_id(true);
        $_SESSION['uuid']      = (int)$user['uuid'];
        $_SESSION['user_id']   = $user['user_id'];
        $_SESSION['user_type'] = $user['user_type'];
        $_SESSION['full_name'] = $fullName;

        if ($isStaff) {
            logActivity($conn, 'auth.login');
        }

        echo json_encode([
            "success" => true,
            "message" => "Login successful",
            "user" => [
                "id"     => $user['user_id'] ? $user['user_id'] : $user['username'],
                "type"   => $user['user_type'],
                "status" => $user['account_status']
            ]
        ]);
    } else {
        if ($isStaff) {
            logActivity($conn, 'auth.login_failed', 'accounts', $user['user_id'], ['reason' => 'wrong_password'], $actor);
        }
        echo json_encode(["success" => false, "message" => "Invalid password"]);
    }
} else {
    echo json_encode(["success" => false, "message" => "Incorrect ID or password"]);
}
?>