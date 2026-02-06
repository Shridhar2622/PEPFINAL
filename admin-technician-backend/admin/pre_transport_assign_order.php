<?php
require '../config.php';
session_start();
if (!isset($_SESSION['admin'])) {
    header("Location: index.php");
    exit();
}

if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_POST['order_id'], $_POST['technician_id'])) {
    $order_id = $_POST['order_id'];
    $technician_id = $_POST['technician_id'];

    // Generate random 6-digit pin
    $security_pin = str_pad(random_int(0, 999999), 6, '0', STR_PAD_LEFT);

    // Update order
    $stmt = $conn->prepare("UPDATE pre_transport_orders SET technician_id = ?, status = 'assigned', securitypin = ? WHERE id = ?");
    $stmt->bind_param("isi", $technician_id, $security_pin, $order_id);
    $stmt->execute();

    header("Location: pre_transport_orders.php");
    exit();
}
?>
