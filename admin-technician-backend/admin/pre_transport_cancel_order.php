<?php
require '../config.php';
session_start();
if (!isset($_SESSION['admin'])) {
    header("Location: index.php");
    exit();
}

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $order_id = $_POST['order_id'];

    // Update order status to canceled
    $stmt = $conn->prepare("UPDATE pre_transport_orders SET status = 'canceled' WHERE id = ?");
    $stmt->bind_param("i", $order_id);
    $stmt->execute();

    header("Location: pre_transport_orders.php");
    exit();
}
?>
