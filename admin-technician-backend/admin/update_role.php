<?php
require '../config.php';

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $id = $_POST['id'] ?? null;
    $role_id = $_POST['role_id'] ?? null;

    if ($id && $role_id) {
        $stmt = $conn->prepare("UPDATE techniciam SET role_id = ? WHERE id = ?");
        $stmt->bind_param("ii", $role_id, $id);
        if ($stmt->execute()) {
            echo "success";
        } else {
            echo "error";
        }
    } else {
        echo "invalid";
    }
}
?>
