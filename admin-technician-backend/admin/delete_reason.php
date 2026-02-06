<?php
require '../config.php';
session_start();

// Admin check
if (!isset($_SESSION['admin'])) {
    header("Location: index.php");
    exit();
}

// Check if ID is provided and is numeric
if (isset($_GET['id']) && is_numeric($_GET['id'])) {
    $id = intval($_GET['id']);

    // Prepare and execute delete statement
    $stmt = $conn->prepare("DELETE FROM amount_reasons WHERE id = ?");
    $stmt->bind_param("i", $id);

    if ($stmt->execute()) {
        // Redirect back with success
        header("Location: add-reason.php?message=deleted");
        exit();
    } else {
        // Error occurred
        echo "Error deleting reason.";
    }

    $stmt->close();
} else {
    // Invalid or missing ID
    echo "Invalid request.";
}

$conn->close();
?>
