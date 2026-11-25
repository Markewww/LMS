<?php
// src/API/activity_logger.php
//
// logActivity($conn, 'book.add', 'books_inventory', $barcode, ['title' => $title]);
// logChange($conn, 'book.edit', 'books_inventory', $barcode, $before, $after);
//
// $actor is only for events where no session exists yet (e.g. failed login):
//   ['uuid' => 1, 'user_id' => 'SA-001', 'name' => 'Juan', 'role' => 'superadmin']

function logActivity($conn, $action, $targetType = null, $targetId = null, $details = null, $actor = null) {
    try {
        if (session_status() === PHP_SESSION_NONE) session_start();

        $uuid = $actor['uuid']    ?? ($_SESSION['uuid'] ?? null);
        $uid  = $actor['user_id'] ?? ($_SESSION['user_id'] ?? 'unknown');
        $name = $actor['name']    ?? ($_SESSION['full_name'] ?? $uid);
        $role = $actor['role']    ?? ($_SESSION['user_type'] ?? 'admin');

        // Nothing to attribute: no identified staff member
        if ($uid === 'unknown') return;
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

// Shortens very long values (abstracts etc.) so the log stays readable
function auditTrim($v) {
    if (is_string($v) && mb_strlen($v) > 200) return mb_substr($v, 0, 200) . '…';
    return $v;
}

// Logs only the fields that actually changed, as {before:{...}, after:{...}}.
// Nothing is written when nothing changed. $extra is merged into the details.
function logChange($conn, $action, $targetType, $targetId, array $before, array $after, array $extra = []) {
    $b = [];
    $a = [];
    foreach ($after as $key => $value) {
        $old = $before[$key] ?? null;
        if ((string)$old !== (string)$value) {
            $b[$key] = auditTrim($old);
            $a[$key] = auditTrim($value);
        }
    }
    if (!$a) return;
    logActivity($conn, $action, $targetType, $targetId, $extra + ['before' => $b, 'after' => $a]);
}