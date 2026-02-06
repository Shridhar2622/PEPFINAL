<?php
require '../config.php';
session_start();

if (!isset($_SESSION['admin'])) {
    header("Location: index.php");
    exit();
}

if (!isset($_GET['id']) || !is_numeric($_GET['id'])) {
    // Invalid or missing ID, redirect back to manage page
    header("Location: manage_technician.php");
    exit();
}

$id = (int)$_GET['id'];

// Prepare and execute delete query
$stmt = $conn->prepare("DELETE FROM techniciam WHERE id = ?");
$stmt->bind_param("i", $id);

if ($stmt->execute()) {
    // Success, redirect back with success message or just redirect
    header("Location: manage_technician.php?msg=deleted");
} else {
    // Error handling, redirect with error message
    header("Location: manage_technician.php?msg=error");
}

$stmt->close();
$conn->close();
exit();
?>
