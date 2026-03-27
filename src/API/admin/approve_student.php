<?php
require_once "../dbconfig.php";

$data = json_decode(file_get_contents("php://input"), true);

if (!$data || !isset($data['student_id'])) {
    echo json_encode(["success" => false, "message" => "Missing student ID."]);
    exit;
}

$student_id = $data['student_id'];
$new_status = 'active';

// Start Transaction
$conn->begin_transaction();

try {
    // 1. Update the account status to active
    $stmt1 = $conn->prepare("UPDATE accounts SET account_status = ? WHERE user_id = ?");
    $stmt1->bind_param("ss", $new_status, $student_id);
    $stmt1->execute();

    // 2. Fetch student details to build the QR Data string
    $stmt2 = $conn->prepare("SELECT first_name, last_name, course FROM students WHERE student_id = ?");
    $stmt2->bind_param("s", $student_id);
    $stmt2->execute();
    $student_info = $stmt2->get_result()->fetch_assoc();

    if ($student_info) {
        // Format: ID|LastName|FirstName|Course|Timestamp
        // This format is easy for your 2D scanner to parse
        $qr_string = "ID:" . $student_id . 
                     "|L:" . $student_info['last_name'] . 
                     "|F:" . $student_info['first_name'] . 
                     "|C:" . $student_info['course'] . 
                     "|TS:" . date("Y-m-d H:i:s");

        // 3. Save the generated QR string to the students table
        $stmt3 = $conn->prepare("UPDATE students SET qr_data = ? WHERE student_id = ?");
        $stmt3->bind_param("ss", $qr_string, $student_id);
        $stmt3->execute();
    }

    $conn->commit();
    echo json_encode(["success" => true, "message" => "Student approved and QR ID generated!"]);

} catch (Exception $e) {
    $conn->rollback();
    echo json_encode(["success" => false, "message" => "Error: " . $e->getMessage()]);
}

$conn->close();
?>
