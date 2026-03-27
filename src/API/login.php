<?php
require_once 'dbconfig.php';

$data = json_decode(file_get_contents("php://input"), true);
$idOrUser = $data['id'] ?? ''; 
$password = $data['password'] ?? '';

// 1. Remove the status filter from SQL to find the user first
$sql = "SELECT * FROM accounts WHERE user_id = ? OR username = ?";
$stmt = $conn->prepare($sql);
$stmt->bind_param("ss", $idOrUser, $idOrUser);
$stmt->execute();
$result = $stmt->get_result();

if ($result->num_rows > 0) {
    $user = $result->fetch_assoc();

    // 2. Check for PENDING status
    if ($user['account_status'] === 'pending') {
        echo json_encode([
            "success" => false, 
            "message" => "Your account is still under admin approval. Please check back later."
        ]);
        exit;
    }

    // 3. Check for SUSPENDED status (Optional but good for UX)
    if ($user['account_status'] === 'suspended') {
        echo json_encode([
            "success" => false, 
            "message" => "Your account has been suspended. Please contact the CEIT Reading Room admin."
        ]);
        exit;
    }

    // 4. Verify Password (Only if status is active)
    if (password_verify($password, $user['password'])) {
        echo json_encode([
            "success" => true, 
            "message" => "Login successful", 
            "user" => [
                "id" => $user['user_id'] ? $user['user_id'] : $user['username'],
                "type" => $user['user_type'],
                "status" => $user['account_status']
            ]
        ]);
    } else {
        echo json_encode(["success" => false, "message" => "Invalid password"]);
    }
} else {
    echo json_encode(["success" => false, "message" => "User not found"]);
}
?>
