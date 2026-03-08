<?php
require_once 'dbcofig.php';

$data = json_decode(file_get_contents("php://input"), true);
$idOrUser = $data['id']; // It can be either ID or username
$password = $data['password'];

// Check both user_id (student and admin) and username (superadmin)
$sql = "SELECT * FROM accounts WHERE user_id = ? OR username = ?";
$stmt = $conn->prepare($sql);
$stmt->bind_param("ss", $idOrUser, $idOrUser);
$stmt->execute();
$result = $stmt->get_result();

if ($result->num_rows > 0) {
    $user = $result->fetch_assoc();
    // Verify password stored hashed in the database
    if (password_verify($password, $user['password'])) {
        echo json_encode([
            "success" => true, 
            "message" => "Login successful", 
            "user" => [
                "id" => $user['user_id'],
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