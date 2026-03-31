<?php
require_once "../dbconfig.php";

$data = json_decode(file_get_contents("php://input"), true);

if (!isset($data['uuid']) || !isset($data['status'])) {
    echo json_encode(["success" => false, "message" => "Missing data"]);
    exit;
}

$uuid = $data['uuid'];
$status = $data['status'];

$stmt = $conn->prepare("UPDATE research_projects SET status = ? WHERE uuid = ?");
$stmt->bind_param("ss", $status, $uuid);

if ($stmt->execute()) {
    echo json_encode(["success" => true]);
} else {
    echo json_encode(["success" => false, "message" => $conn->error]);
}
?>
