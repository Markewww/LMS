<?php
// src/API/admin/update_research_details.php
// CORS headers and OPTIONS preflight are handled centrally in dbconfig.php
require_once "../dbconfig.php";
require_once "../require_admin.php";
require_once "../activity_logger.php";

if (!$conn) {
    http_response_code(500);
    echo json_encode(["success" => false, "message" => "Database Connection Failure"]);
    exit();
}

requireStaff($conn);

// Enforce request method constraints
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(["success" => false, "message" => "Method Not Allowed. Use POST requests."]);
    exit();
}

try {
    // 3. READ AND DECODE THE INCOMING JSON PAYLOAD
    $rawInput = file_get_contents("php://input");
    $data = json_decode($rawInput, true);

    if (empty($data['uuid']) || empty($data['title'])) {
        http_response_code(400);
        echo json_encode(["success" => false, "message" => "Research UUID and Project Title are required fields."]);
        exit();
    }

    // 4. SANITIZE AND PARSE PAYLOAD PARAMETERS
    $uuid = trim($data['uuid']);
    $title = trim($data['title']);
    $type = isset($data['type']) ? trim($data['type']) : 'Thesis';

    // Empty strings become NULL
    $code = isset($data['code']) && trim($data['code']) !== '' ? trim($data['code']) : null;
    $program = isset($data['program']) && trim($data['program']) !== '' ? trim($data['program']) : null;
    $year = isset($data['year']) && trim($data['year']) !== '' ? (int)$data['year'] : null;
    $adviser = isset($data['adviser']) && trim($data['adviser']) !== '' ? trim($data['adviser']) : null;
    $technical_critic = isset($data['technical_critic']) && trim($data['technical_critic']) !== '' ? trim($data['technical_critic']) : null;
    $abstract = isset($data['abstract']) && trim($data['abstract']) !== '' ? trim($data['abstract']) : null;
    $authors = isset($data['authors']) && trim($data['authors']) !== '' ? trim($data['authors']) : null;
    $keywords = isset($data['keywords']) && trim($data['keywords']) !== '' ? trim($data['keywords']) : null;

    // Check for duplicate project call codes across other rows
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

    // Snapshot the record BEFORE it changes (for the audit log)
    $snap = $conn->prepare("SELECT code, title, type, program, year, adviser, technical_critic, abstract, authors, keywords
                            FROM research_projects WHERE uuid = ?");
    $snap->bind_param("s", $uuid);
    $snap->execute();
    $before = $snap->get_result()->fetch_assoc() ?: [];
    $snap->close();

    // 5. PREPARED UPDATE
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

    // 10 strings + 1 integer (year)
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
        logChange($conn, 'research.edit', 'research_project', $before['code'] ?? $uuid, $before, [
            'code'             => $code,
            'title'            => $title,
            'type'             => $type,
            'program'          => $program,
            'year'             => $year,
            'adviser'          => $adviser,
            'technical_critic' => $technical_critic,
            'abstract'         => $abstract,
            'authors'          => $authors,
            'keywords'         => $keywords,
        ], ['title' => $before['title'] ?? $title]);

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