<?php
// src/API/superadmin/get_audit_logs.php
session_start();
$allowedOrigins = ["http://localhost:5173", "http://localhost:3000"]; // add yours
$origin = $_SERVER['HTTP_ORIGIN'] ?? '';
if (in_array($origin, $allowedOrigins, true)) {
    header("Access-Control-Allow-Origin: $origin");
    header("Access-Control-Allow-Credentials: true");
    header("Vary: Origin");
}
header("Access-Control-Allow-Methods: GET, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}
ini_set('display_errors', '0');

// TODO: copy the CORS header block you use in get_admins.php here
header("Content-Type: application/json");

require_once "../dbconfig.php";

// ---- SUPERADMIN ONLY ----
// TODO: adjust 'user_type' if your login.php stores the role under another session key
if (($_SESSION['user_type'] ?? '') !== 'superadmin') {
    http_response_code(403);
    echo json_encode(['success' => false, 'message' => 'Forbidden']);
    exit;
}

$page   = max(1, (int)($_GET['page'] ?? 1));
$limit  = min(100, max(1, (int)($_GET['limit'] ?? 20)));
$offset = ($page - 1) * $limit;

// ---- FILTERS ----
$where = [];
$types = '';
$params = [];

if (!empty($_GET['actor'])) {
    $where[] = "actor_id = ?";
    $types .= 's';
    $params[] = $_GET['actor'];
}
if (!empty($_GET['action'])) {
    $where[] = "action = ?";
    $types .= 's';
    $params[] = $_GET['action'];
}
if (!empty($_GET['date_from'])) {
    $where[] = "created_at >= ?";
    $types .= 's';
    $params[] = $_GET['date_from'] . ' 00:00:00';
}
if (!empty($_GET['date_to'])) {
    $where[] = "created_at <= ?";
    $types .= 's';
    $params[] = $_GET['date_to'] . ' 23:59:59';
}
if (!empty($_GET['search'])) {
    $like = '%' . $_GET['search'] . '%';
    $where[] = "(target_id LIKE ? OR actor_name LIKE ? OR details LIKE ?)";
    $types .= 'sss';
    array_push($params, $like, $like, $like);
}

$whereSql = $where ? 'WHERE ' . implode(' AND ', $where) : '';

try {
    // Total for pagination
    $stmt = $conn->prepare("SELECT COUNT(*) FROM activity_logs $whereSql");
    if ($params) $stmt->bind_param($types, ...$params);
    $stmt->execute();
    $total = (int)$stmt->get_result()->fetch_row()[0];
    $stmt->close();

    // Page of rows ($limit/$offset are already cast to int)
    $stmt = $conn->prepare("SELECT id, actor_id, actor_name, actor_role, action, target_type,
                                   target_id, details, ip_address, user_agent, created_at
                            FROM activity_logs $whereSql
                            ORDER BY created_at DESC, id DESC
                            LIMIT $limit OFFSET $offset");
    if ($params) $stmt->bind_param($types, ...$params);
    $stmt->execute();
    $rows = $stmt->get_result()->fetch_all(MYSQLI_ASSOC);
    $stmt->close();

    // Dropdown options
    $actors = $conn->query("SELECT DISTINCT actor_id, actor_name FROM activity_logs ORDER BY actor_name")
                   ->fetch_all(MYSQLI_ASSOC);
    $actions = array_column(
        $conn->query("SELECT DISTINCT action FROM activity_logs ORDER BY action")->fetch_all(MYSQLI_ASSOC),
        'action'
    );

    // Summary cards
    $today = (int)$conn->query("SELECT COUNT(*) FROM activity_logs WHERE DATE(created_at) = CURDATE()")
                       ->fetch_row()[0];
    $failed = (int)$conn->query("SELECT COUNT(*) FROM activity_logs
                                 WHERE action = 'auth.login_failed'
                                 AND created_at >= NOW() - INTERVAL 7 DAY")->fetch_row()[0];

    echo json_encode([
        'success' => true,
        'data'    => $rows,
        'total'   => $total,
        'page'    => $page,
        'limit'   => $limit,
        'actors'  => $actors,
        'actions' => $actions,
        'stats'   => ['today' => $today, 'failed_logins_week' => $failed],
    ]);
} catch (Throwable $e) {
    error_log("get_audit_logs: " . $e->getMessage());
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Server error']);
}