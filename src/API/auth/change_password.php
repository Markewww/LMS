<?php
// src/API/auth/change_password.php
// CORS headers are handled centrally in dbconfig.php
require_once "../dbconfig.php";
require_once "../activity_logger.php";

if (!$conn) {
    http_response_code(500);
    echo json_encode(["success" => false, "message" => "Database Connection Failure"]);
    exit();
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(["success" => false, "message" => "Method Not Allowed. Use POST requests."]);
    exit();
}

// 3. CAPTURE AND VALIDATE INBOUND JSON PAYLOAD
$data = json_decode(file_get_contents("php://input"), true);

$user_id          = $data['user_id'] ?? null;
$current_password = $data['current_password'] ?? null;
$new_password     = $data['new_password'] ?? null;

if (!$user_id || !$current_password || !$new_password) {
    http_response_code(400);
    echo json_encode(["success" => false, "message" => "Incomplete parameters. All fields are required."]);
    exit();
}

try {
    // 4. FETCH THE ACCOUNT
    $fetchSql = "SELECT password FROM accounts WHERE user_id = ? LIMIT 1";
    $fetchStmt = $conn->prepare($fetchSql);
    $fetchStmt->bind_param("s", $user_id);
    $fetchStmt->execute();
    $userData = $fetchStmt->get_result()->fetch_assoc();

    if (!$userData) {
        http_response_code(404);
        echo json_encode(["success" => false, "message" => "Account profile record not found."]);
        exit();
    }

    // 5. VERIFY CURRENT PASSWORD
    if (!password_verify($current_password, $userData['password'])) {
        // Only staff sessions are recorded (the logger skips students automatically)
        logActivity($conn, 'auth.password_change_failed', 'accounts', $user_id, ['reason' => 'wrong_current_password']);

        http_response_code(200); // 200 lets your custom React modals catch validation flags smoothly
        echo json_encode(["success" => false, "message" => "The current password you entered is incorrect."]);
        exit();
    }

    // 6. SAVE THE NEW HASH
    $hashed_new_password = password_hash($new_password, PASSWORD_BCRYPT);
    $updateSql = "UPDATE accounts SET password = ? WHERE user_id = ?";
    $updateStmt = $conn->prepare($updateSql);
    $updateStmt->bind_param("ss", $hashed_new_password, $user_id);
    $updateStmt->execute();

    // Never log any password value
    logActivity($conn, 'auth.password_change', 'accounts', $user_id);

    http_response_code(200);
    echo json_encode(["success" => true, "message" => "Your password has been changed successfully!"]);

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(["success" => false, "message" => "Server transaction exception: " . $e->getMessage()]);
} finally {
    if (isset($fetchStmt)) $fetchStmt->close();
    if (isset($updateStmt)) $updateStmt->close();
    if (isset($conn)) $conn->close();
}
?>
