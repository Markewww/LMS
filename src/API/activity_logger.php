<?php
// src/API/activity_logger.php
//
// Usage:  logActivity($conn, 'book.add', 'books_inventory', $barcode, ['title' => $title]);
// $actor is only for events where no session exists yet (e.g. failed login):
//         ['uuid' => 1, 'user_id' => 'SA-001', 'name' => 'Juan', 'role' => 'superadmin']

function logActivity($conn, $action, $targetType = null, $targetId = null, $details = null, $actor = null) {
    try {
        if (session_status() === PHP_SESSION_NONE) session_start();

        $uuid = $actor['uuid']    ?? ($_SESSION['uuid'] ?? null);
        $uid  = $actor['user_id'] ?? ($_SESSION['user_id'] ?? 'unknown');
        $name = $actor['name']    ?? ($_SESSION['full_name'] ?? $uid);
        $role = $actor['role']    ?? ($_SESSION['user_type'] ?? 'admin');

        // The log only tracks staff. Never record student activity here.
        if (!in_array($role, ['admin', 'superadmin'], true)) return;

        $json = $details !== null ? json_encode($details, JSON_UNESCAPED_UNICODE) : null;
        $ip   = $_SERVER['REMOTE_ADDR'] ?? null;
        $ua   = substr($_SERVER['HTTP_USER_AGENT'] ?? '', 0, 255);

        $stmt = $conn->prepare("INSERT INTO activity_logs
          (actor_uuid, actor_id, actor_name, actor_role, action, target_type, target_id, details, ip_address, user_agent)
          VALUES (?,?,?,?,?,?,?,?,?,?)");
        $stmt->bind_param("isssssssss", $uuid, $uid, $name, $role, $action,
                          $targetType, $targetId, $json, $ip, $ua);
        $stmt->execute();
        $stmt->close();
    } catch (Throwable $e) {
        // A logging failure must never break the real action
        error_log("Activity log failed: " . $e->getMessage());
    }
}