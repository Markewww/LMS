<?php
// src/API/require_admin.php
//
// Server-side access guard. Include it AFTER dbconfig.php, then call:
//   requireStaff($conn);        // any active admin or superadmin
//   requireSuperadmin($conn);   // superadmin only

function denyAccess($code, $message) {
    http_response_code($code);
    header("Content-Type: application/json; charset=UTF-8");
    echo json_encode(["success" => false, "message" => $message, "error" => $message]);
    exit();
}

function requireRole($conn, array $roles) {
    if (session_status() === PHP_SESSION_NONE) session_start();

    $uuid = $_SESSION['uuid'] ?? null;
    $role = $_SESSION['user_type'] ?? '';
    if (!$uuid || !in_array($role, $roles, true)) {
        denyAccess(401, "Not authorized. Please log in again.");
    }

    // Re-check the database so a suspended or demoted account loses access immediately
    $stmt = $conn->prepare("SELECT user_type, account_status FROM accounts WHERE uuid = ? LIMIT 1");
    $stmt->bind_param("i", $uuid);
    $stmt->execute();
    $row = $stmt->get_result()->fetch_assoc();
    $stmt->close();

    if (!$row || $row['account_status'] !== 'active' || !in_array($row['user_type'], $roles, true)) {
        denyAccess(403, "You do not have permission to perform this action.");
    }
    $_SESSION['user_type'] = $row['user_type'];
}

function requireStaff($conn)      { requireRole($conn, ['admin', 'superadmin']); }
function requireSuperadmin($conn) { requireRole($conn, ['superadmin']); }