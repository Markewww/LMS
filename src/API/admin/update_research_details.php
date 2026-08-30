<?php
// 1. ALLOW CORS AND DEFINE JSON OUTPUT HEADERS
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");
header("Content-Type: application/json; charset=UTF-8");

// Handle browser preflight cross-origin safety checks automatically
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// 2. INCLUDE YOUR DATABASE CONNECTION FILE
require_once "../dbconfig.php";

if (!$conn) {
    http_response_code(500);
    echo json_encode(["success" => false, "message" => "Database Connection Failure"]);
    exit();
}

// Enforce request method constraints
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(["success" => false, "message" => "Method Not Allowed. Use POST requests."]);
    exit();
}

try {
    // 3. READ AND DECODE THE INCOMING JSON PAYLOAD RAW DATA
    $rawInput = file_get_contents("php://input");
    $data = json_decode($rawInput, true);

    // Validate absolute required parameters before running updates
    if (empty($data['uuid']) || empty($data['title'])) {
        http_response_code(400);
        echo json_encode(["success" => false, "message" => "Research UUID and Project Title are required fields."]);
        exit();
    }

    // 4. SANITIZE AND PARSE PAYLOAD PARAMETERS
    $uuid = trim($data['uuid']);
    $title = trim($data['title']);
    $type = isset($data['type']) ? trim($data['type']) : 'Thesis';
    
    // Explicitly handle empty string mappings converting back to safe database NULL row markers
    $code = isset($data['code']) && trim($data['code']) !== '' ? trim($data['code']) : null;
    $program = isset($data['program']) && trim($data['program']) !== '' ? trim($data['program']) : null;
    $year = isset($data['year']) && trim($data['year']) !== '' ? (int)$data['year'] : null;
    $adviser = isset($data['adviser']) && trim($data['adviser']) !== '' ? trim($data['adviser']) : null;
    $technical_critic = isset($data['technical_critic']) && trim($data['technical_critic']) !== '' ? trim($data['technical_critic']) : null;
    $abstract = isset($data['abstract']) && trim($data['abstract']) !== '' ? trim($data['abstract']) : null;
    
    // Formatted comma-separated string outputs generated straight out from frontend input micro-chips
    $authors = isset($data['authors']) && trim($data['authors']) !== '' ? trim($data['authors']) : null;
    $keywords = isset($data['keywords']) && trim($data['keywords']) !== '' ? trim($data['keywords']) : null;

    // Check for duplicate custom project call codes across other rows to prevent constraint failures
    if ($code !== null) {
        $checkQuery = "SELECT uuid FROM research_projects WHERE code = ? AND uuid != ?";
        $checkStmt = $conn->prepare($checkQuery);
        $checkStmt->bind_param("ss", $code, $uuid);
        $checkStmt->execute();
        $checkStmt->store_result();
        if ($checkStmt->num_rows > 0) {
            http_response_code(400);
            echo json_encode(["success" => false, "message" => "The modified Project Code / Call Number is already registered on another study."]);
            exit();
        }
        $checkStmt->close();
    }

    // 5. SECURE INJECTION PROTECTION PREPARED SQL PARAMETER UPDATE STATEMENT
    $updateSql = "UPDATE research_projects SET 
                    title = ?, 
                    type = ?, 
                    code = ?, 
                    program = ?, 
                    year = ?, 
                    adviser = ?, 
                    technical_critic = ?, 
                    abstract = ?, 
                    authors = ?, 
                    keywords = ? 
                  WHERE uuid = ?";

    $stmt = $conn->prepare($updateSql);
    if (!$stmt) {
        throw new Exception($conn->error);
    }

    // "ssssissssss" translates parameter shapes safely: 10 structural string maps ('s') and 1 explicit integer tracker ('i') for the publication year
    $stmt->bind_param(
        "ssssissssss",
        $title,
        $type,
        $code,
        $program,
        $year,
        $adviser,
        $technical_critic,
        $abstract,
        $authors,
        $keywords,
        $uuid
    );

    if ($stmt->execute()) {
        http_response_code(200);
        echo json_encode([
            "success" => true, 
            "message" => "Research project document entry records modified successfully."
        ]);
    } else {
        throw new Exception($stmt->error);
    }

    $stmt->close();

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        "success" => false, 
        "message" => "Update operations failure.", 
        "error" => $e->getMessage()
    ]);
}

$conn->close();
?>
