<?php
require '../config.php';
session_start();

if (!isset($_SESSION['admin'])) {
    header("Location: index.php");
    exit();
}

if (isset($_GET['id']) && is_numeric($_GET['id'])) {
    $id = (int)$_GET['id'];

    $stmt = $conn->prepare("DELETE FROM services WHERE id = ?");
    $stmt->bind_param("i", $id);
    $stmt->execute();

    // Optional: check for success/failure
    if ($stmt->affected_rows > 0) {
        $_SESSION['message'] = "Service deleted successfully.";
    } else {
        $_SESSION['message'] = "Failed to delete service.";
    }

    $stmt->close();
}

header("Location: manage_services.php");
exit();
?>
