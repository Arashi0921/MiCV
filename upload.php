[file name]: upload.php
[file content begin]
<?php
// Proyecto UAMEX - Avila González Luis Arturo
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: *");

if (!isset($_FILES['file'])) {
    echo json_encode(["error" => "No file received"]);
    exit;
}

$type = $_POST['type'] ?? 'otros';
$original = $_FILES['file']['name'];

$clean = strtolower(preg_replace('/\s+/', '_', $original));
$unique = $type . "_" . time() . "_" . $clean;

$storagePath = __DIR__ . "/../storage/pdfs/" . $unique;
$publicPath  = "/storage/pdfs/" . $unique;

if (move_uploaded_file($_FILES['file']['tmp_name'], $storagePath)) {
    echo json_encode([
        "success" => true,
        "fileName" => $unique,
        "filePath" => $publicPath
    ]);
} else {
    echo json_encode(["error" => "Failed to move file"]);
}
// Hernández Guadarrama Hellen Aylén - Gestión de Archivos
// Roberto Bonifacio Castelan Sanagustín - Servidor PHP
// Ramírez García Maria Guadalupe - Seguridad y Validación
?>
[file content end]