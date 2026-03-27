<?php
// 1. Include Database Configuration
require_once "dbconfig.php";

// 2. Get JSON Body from Axios
$json = file_get_contents("php://input");
$data = json_decode($json, true);

if (!$data) {
    echo json_encode(["success" => false, "message" => "No data received"]);
    exit;
}

// 3. Extract Variables
$student_id = $data['student_id'];
$first_name = $data['first_name'];
$last_name  = $data['last_name'];
$course     = $data['course'];
$email      = $data['email'];
$password   = $data['password'];

// 4. Secure the Password
$hashed_password = password_hash($password, PASSWORD_DEFAULT);

// 5. Start Transaction
$conn->begin_transaction();

try {
    // Check if Student ID already exists in accounts
    $check = $conn->prepare("SELECT user_id FROM accounts WHERE user_id = ?");
    $check->bind_param("s", $student_id);
    $check->execute();
    if ($check->get_result()->num_rows > 0) {
        throw new Exception("Student ID is already registered.");
    }

    // A. Insert into 'accounts' table
    // user_type is 'student', status is 'pending' (until admin approves)
    $stmt1 = $conn->prepare("INSERT INTO accounts (user_id, email, password, user_type, account_status) VALUES (?, ?, ?, 'student', 'pending')");
    $stmt1->bind_param("sss", $student_id, $email, $hashed_password);
    $stmt1->execute();

    // B. Insert into 'students' table
    $stmt2 = $conn->prepare("INSERT INTO students (student_id, first_name, last_name, course) VALUES (?, ?, ?, ?)");
    $stmt2->bind_param("ssss", $student_id, $first_name, $last_name, $course);
    $stmt2->execute();

    // 6. Commit changes
    $conn->commit();
    echo json_encode(["success" => true, "message" => "Registration successful! Wait for admin approval."]);

} catch (Exception $e) {
    // Rollback if any error occurs
    $conn->rollback();
    echo json_encode(["success" => false, "message" => $e->getMessage()]);
}

$conn->close();
?>
