<?php
// ---- CORS (credentials-safe) ----
// Browsers reject "*" when the request sends cookies, so list the exact origins allowed.
$allowedOrigins = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
];
$origin = $_SERVER['HTTP_ORIGIN'] ?? '';
if (in_array($origin, $allowedOrigins, true)) {
    header("Access-Control-Allow-Origin: $origin");
    header("Access-Control-Allow-Credentials: true");
    header("Vary: Origin");
}
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With");
header("Content-Type: application/json; charset=UTF-8");

date_default_timezone_set('Asia/Manila');

// Handle preflight OPTIONS requests
if (($_SERVER['REQUEST_METHOD'] ?? '') == 'OPTIONS') {
    http_response_code(200);
    exit();
}

$host = "localhost";
$user = "root";
$pass = "";
$dbname = "LMS";

$conn = new mysqli($host, $user, $pass, $dbname);

if ($conn->connect_error) {
    die(json_encode(["error" => "Connection failed: " . $conn->connect_error]));
}
// Do not close the connection here if you are 'including' this file in others
?>