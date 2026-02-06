<?php
require '../config.php';
session_start();

if (!isset($_SESSION['admin'])) {
    header("Location: index.php");
    exit();
}

if (isset($_GET['id']) && is_numeric($_GET['id'])) {
    $id = (int)$_GET['id'];

    // Optional: Check if category is used in any service
    $checkStmt = $conn->prepare("SELECT COUNT(*) as total FROM services WHERE category_id = ?");
    $checkStmt->bind_param("i", $id);
    $checkStmt->execute();
    $checkResult = $checkStmt->get_result()->fetch_assoc();
    $checkStmt->close();

    if ($checkResult['total'] > 0) {
        $_SESSION['message'] = "❌ Cannot delete. This category is assigned to services.";
    } else {
        $stmt = $conn->prepare("DELETE FROM categories WHERE id = ?");
        $stmt->bind_param("i", $id);
        $stmt->execute();

        if ($stmt->affected_rows > 0) {
            $_SESSION['message'] = "✅ Category deleted successfully.";
        } else {
            $_SESSION['message'] = "❌ Failed to delete category.";
        }
        $stmt->close();
    }
}

header("Location: manage_category.php");
exit();
?>
