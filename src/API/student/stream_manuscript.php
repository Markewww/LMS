<?php
// 1. ALLOW CORS AND INBOUND VERIFICATIONS FOR CROSS-TABS
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET");
header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With");

// Mute cache headers to guarantee immediate stream delivery on updates
header("Cache-Control: no-cache, must-revalidate");
header("Expires: Sat, 26 Jul 1997 05:00:00 GMT");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

// 2. EXTRACT FILE SLUG CRITERIA
$file_slug = $_GET['file'] ?? null;

if (!$file_slug || trim($file_slug) === "") {
    http_response_code(400);
    echo "Error: Missing document string identification parameters.";
    exit;
}

// Guard: Sanitize input to strip out tracking hacks (prevents ../ system directory hops)
$filename = basename($file_slug);

// 3. TARGET PHYSICAL FILE DESTINATION ON HARD DRIVE
$base_directory = "C:/xampp/htdocs/LMS/src/assets/uploads/research/";
$absolute_path = $base_directory . $filename;

// 4. VERIFY FILE AND CONTENT METRICS BEFORE DISPATCHING PACKETS
if (!file_exists($absolute_path) || !is_file($absolute_path)) {
    http_response_code(404);
    echo "Error: Manuscript document file was not found on server disk registry.";
    exit;
}

// 5. INTRODUCE EXPLICIT EMBED STREAM MIME HEADERS
header("Content-Type: application/pdf");
header("Content-Disposition: inline; filename=\"" . $filename . "\"");
header("Content-Length: " . filesize($absolute_path));

// Flush system output buffers to avoid asset file structural corruption drops
while (ob_get_level()) {
    ob_end_clean();
}

// Push local binary off disk into network link channel layer
readfile($absolute_path);
exit;
?>
