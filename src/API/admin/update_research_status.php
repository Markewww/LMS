<?php
// src/API/admin/update_research_status.php
require_once "../dbconfig.php";
require_once "../require_admin.php";
require_once "../activity_logger.php";
requireStaff($conn);

$data = json_decode(file_get_contents("php://input"), true);

if (!isset($data['uuid']) || !isset($data['status'])) {
    echo json_encode(["success" => false, "message" => "Missing data"]);
    exit;
}

$uuid = $data['uuid'];
$status = $data['status'];

// Snapshot before the change
$snap = $conn->prepare("SELECT code, title, status FROM research_projects WHERE uuid = ?");
$snap->bind_param("s", $uuid);
$snap->execute();
$old = $snap->get_result()->fetch_assoc();
$snap->close();

$stmt = $conn->prepare("UPDATE research_projects SET status = ? WHERE uuid = ?");
$stmt->bind_param("ss", $status, $uuid);

if ($stmt->execute()) {
    if ($old) {
        if ($status === 'approved')      $action = 'research.approve';
        elseif ($status === 'rejected')  $action = 'research.reject';
        else                             $action = 'research.status_change';

        logActivity($conn, $action, 'research_project', $old['code'] ?: $uuid, [
            'title' => $old['title'],
            'from'  => $old['status'],
            'to'    => $status,
        ]);
    }
    echo json_encode(["success" => true]);
} else {
    echo json_encode(["success" => false, "message" => $conn->error]);
}
?>