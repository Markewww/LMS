<?php
require_once "../dbconfig.php";

// Get raw JSON data from Axios
$json = file_get_contents("php://input");
$data = json_decode($json, true);

// 1. Validation Check
if (!$data || !isset($data['student_id'])) {
    echo json_encode(["success" => false, "message" => "No Student ID received. Check if frontend is sending data correctly."]);
    exit;
}

$id = $data['student_id'];

// 2. Start Transaction
$conn->begin_transaction();

try {
    // 3. Update 'students' table 
    // Added: middle_name, suffix, and contact_number
    $stmt1 = $conn->prepare("UPDATE students SET 
        first_name = ?, 
        middle_name = ?, 
        last_name = ?, 
        suffix = ?, 
        course = ?, 
        contact_number = ? 
        WHERE student_id = ?");
    
    $stmt1->bind_param("sssssss", 
        $data['first_name'], 
        $data['middle_name'], 
        $data['last_name'], 
        $data['suffix'], 
        $data['course'], 
        $data['contact_number'], 
        $id
    );
    $stmt1->execute();

    // 4. Update 'accounts' table (Email and Status)
    if (!empty($data['password'])) {
        $hashed = password_hash($data['password'], PASSWORD_DEFAULT);
        $stmt2 = $conn->prepare("UPDATE accounts SET email = ?, account_status = ?, password = ? WHERE user_id = ?");
        $stmt2->bind_param("ssss", $data['email'], $data['account_status'], $hashed, $id);
    } else {
        $stmt2 = $conn->prepare("UPDATE accounts SET email = ?, account_status = ? WHERE user_id = ?");
        $stmt2->bind_param("sss", $data['email'], $data['account_status'], $id);
    }
    $stmt2->execute();

    $conn->commit();
    echo json_encode(["success" => true, "message" => "Update successful!"]);

} catch (Exception $e) {
    $conn->rollback();
    echo json_encode(["success" => false, "message" => "Database Error: " . $e->getMessage()]);
}

$conn->close();
?>
