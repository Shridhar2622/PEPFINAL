<?php
require '../config.php';
if ($_SERVER['REQUEST_METHOD'] == 'POST' && isset($_POST['order_id'])) {
    $order_id = $_POST['order_id'];

    $stmt = $conn->prepare("UPDATE pre_transport_orders SET technician_id = NULL, status = 'pending' WHERE id = ?");
    $stmt->bind_param("i", $order_id);
    $stmt->execute();
    $stmt->close();
}

header("Location: pre_transport_orders.php"); // Change this as per your redirect logic
exit();
