<?php
session_start();
require '../config.php';
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

// ✅ Set MySQL session time zone to IST (Asia/Kolkata)
$conn->query("SET time_zone = '+05:30'");

if (!isset($_SESSION['techniciam_id'])) {
    header("Location: index.php");
    exit();
}

$techniciam_id = $_SESSION['techniciam_id'];

if ($_SERVER['REQUEST_METHOD'] == 'POST' && isset($_POST['order_id']) && isset($_POST['is_transport']) && $_POST['is_transport'] == '1') {
    $order_id = $_POST['order_id'];
    $final_amount = $_POST['final_amount'];
    $status = 'done';
    $technician_note = isset($_POST['technician_note']) ? trim($_POST['technician_note']) : null;
    $extra_reason_id = isset($_POST['extra_reason_id']) ? $_POST['extra_reason_id'] : null;

    $sql = "UPDATE transport_orders SET final_amount = ?, status = ?, extra_reason_id = ?, technician_note = ?, completed_at = NOW() WHERE id = ? AND technician_id = ?";
    $stmt = $conn->prepare($sql);
    $stmt->bind_param("sssiii", $final_amount, $status, $extra_reason_id, $technician_note, $order_id, $techniciam_id);
    $stmt->execute();
    $stmt->close();

    $_SESSION['success'] = "Transport Order has been completed!";
    header("Location: assigned-orders.php");
    exit();
}

if ($_SERVER['REQUEST_METHOD'] == 'POST' && isset($_POST['order_id']) && isset($_POST['is_preorder']) && $_POST['is_preorder'] === '1') {

    $order_id = $_POST['order_id'];
    $final_amount = $_POST['final_amount'];
    $status = 'done';
    $technician_note = isset($_POST['technician_note']) ? trim($_POST['technician_note']) : null;

    // ✅ Uploads folder path
    $upload_dir = '../uploads/bills/';
    if (!is_dir($upload_dir)) {
        mkdir($upload_dir, 0777, true);
    }

    $bill_image = null;

    // ✅ Handle file upload
    if (isset($_FILES['bill_image']) && $_FILES['bill_image']['error'] == 0) {
        $filename = basename($_FILES['bill_image']['name']);
        $target_path = $upload_dir . time() . "_" . $filename;

        if (move_uploaded_file($_FILES['bill_image']['tmp_name'], $target_path)) {
            $bill_image = str_replace('../', '', $target_path);
        }
    }

    $extra_reason_id = isset($_POST['extra_reason_id']) ? $_POST['extra_reason_id'] : null;

    // ✅ Update query based on whether image is uploaded
    if ($bill_image !== null) {
        $sql = "UPDATE pre_orders 
                SET final_amount = ?, status = ?, bill_image = ?, extra_reason_id = ?, technician_note = ?, completed_at = NOW() 
                WHERE id = ? AND technician_id = ?";
        $stmt = $conn->prepare($sql);
        $stmt->bind_param("sssissi", $final_amount, $status, $bill_image, $extra_reason_id, $technician_note, $order_id, $techniciam_id);
    } else {
        $sql = "UPDATE pre_orders 
                SET final_amount = ?, status = ?, extra_reason_id = ?, technician_note = ?, completed_at = NOW() 
                WHERE id = ? AND technician_id = ?";
        $stmt = $conn->prepare($sql);
        $stmt->bind_param("ssissi", $final_amount, $status, $extra_reason_id, $technician_note, $order_id, $techniciam_id);
    }

    if ($stmt->execute()) {
        $_SESSION['success'] = "Pre-order has been marked as completed!";
        header("Location: assigned-orders.php");
        exit();
    } else {
        echo "Error updating order: " . $stmt->error;
    }

    $stmt->close();
}

if ($_SERVER['REQUEST_METHOD'] == 'POST' && isset($_POST['order_id'])) {
    $order_id = $_POST['order_id'];
    $final_amount = $_POST['final_amount'];
    $status = 'done';
    $technician_note = isset($_POST['technician_note']) ? trim($_POST['technician_note']) : null;

    $upload_dir = '../uploads/bills/';
    if (!is_dir($upload_dir)) {
        mkdir($upload_dir, 0777, true);
    }

    $bill_image = null;
    if (isset($_FILES['bill_image']) && $_FILES['bill_image']['error'] == 0) {
        $filename = basename($_FILES['bill_image']['name']);
        $target_path = $upload_dir . time() . "_" . $filename;
        if (move_uploaded_file($_FILES['bill_image']['tmp_name'], $target_path)) {
            $bill_image = str_replace('../', '', $target_path);
        }
    }

    $extra_reason_id = isset($_POST['extra_reason_id']) ? $_POST['extra_reason_id'] : null;

    if ($bill_image !== null) {
        $sql = "UPDATE orders SET final_amount = ?, status = ?, bill_image = ?, extra_reason_id = ?, technician_note = ?, completed_at = NOW() WHERE id = ? AND technician_id = ?";
        $stmt = $conn->prepare($sql);
        $stmt->bind_param("sssissi", $final_amount, $status, $bill_image, $extra_reason_id, $technician_note, $order_id, $techniciam_id);
    } else {
        $sql = "UPDATE orders SET final_amount = ?, status = ?, extra_reason_id = ?, technician_note = ?, completed_at = NOW() WHERE id = ? AND technician_id = ?";
        $stmt = $conn->prepare($sql);
        $stmt->bind_param("ssissi", $final_amount, $status, $extra_reason_id, $technician_note, $order_id, $techniciam_id);
    }
    $stmt->execute();
    $stmt->close();
    $_SESSION['success'] = "Order has been completed!";
    header("Location: assigned-orders.php");
    exit();
}

// Fetch amount reasons
$reasons = [];
$reason_result = $conn->query("SELECT id, reason FROM amount_reasons");
while ($row = $reason_result->fetch_assoc()) {
    $reasons[] = $row;
}

// Fetch transport reasons
$transport_reasons = [];
$t_result = $conn->query("SELECT id, reason FROM transport_reasons");
while ($row = $t_result->fetch_assoc()) {
    $transport_reasons[] = $row;
}

// Fetch assigned orders
// Fetch assigned transport orders
$transport_orders = [];
$stmt = $conn->prepare("
  SELECT transport_orders.*, 
         users.name AS customer_name, 
         users.phone AS customer_phonenumber 
  FROM transport_orders
  JOIN users ON transport_orders.customer_id = users.id
  WHERE transport_orders.technician_id = ? AND transport_orders.status IN ('assigned', 'in-progress')
");
$stmt->bind_param("i", $techniciam_id);
$stmt->execute();
$result = $stmt->get_result();
while ($row = $result->fetch_assoc()) {
    $transport_orders[] = $row;
}
$stmt->close();

$orders = [];
$stmt = $conn->prepare("
  SELECT orders.*, 
         users.name AS customer_name, 
         users.phone AS customer_phonenumber, 
         users.address AS customer_address
  FROM orders
  JOIN users ON orders.customer_id = users.id
  WHERE orders.technician_id = ? AND orders.status IN ('assigned', 'in-progress')
");
$stmt->bind_param("i", $techniciam_id);
$stmt->execute();
$result = $stmt->get_result();
while ($row = $result->fetch_assoc()) {
    $orders[] = $row;
}
$stmt->close();

// Fetch assigned pre_orders
$pre_orders = [];
$stmt = $conn->prepare("
  SELECT pre_orders.*, 
         dealer.name AS dealer_name,
         dealer.phone AS dealer_phone
  FROM pre_orders
  JOIN dealer ON pre_orders.dealer_id = dealer.id
  WHERE pre_orders.technician_id = ? 
    AND pre_orders.status IN ('assigned', 'in-progress')
");
$stmt->bind_param("i", $techniciam_id);
$stmt->execute();
$result = $stmt->get_result();
while ($row = $result->fetch_assoc()) {
    $pre_orders[] = $row;
}
$stmt->close();
?>

<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>Technician Dashboard</title>
  <link href="https://fonts.googleapis.com/css2?family=Orbitron:wght@600&family=Quicksand:wght@500&display=swap" rel="stylesheet">
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/css/all.min.css" />
  <link rel="icon" type="image/png" href="/favicon-96x96.png" sizes="96x96" />
<link rel="icon" type="image/svg+xml" href="/favicon.svg" />
<link rel="shortcut icon" href="/favicon.ico" />
<link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
<meta name="apple-mobile-web-app-title" content="Bettiah Service" />
  <style>
    :root {
      --primary: #1d3557;
      --accent: #e76f51;
      --bg: #fdfcfb;
      --text-dark: #2c3e50;
    }

    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
      font-family: 'Quicksand', sans-serif;
    }

    body {
      background: var(--bg);
      color: var(--text-dark);
      min-height: 100vh;
      display: flex;
      flex-direction: column;
    }

    header {
      background: white;
      padding: 20px;
      text-align: center;
      font-family: 'Orbitron', sans-serif;
      font-size: 28px;
      color: var(--primary);
      letter-spacing: 1px;
      box-shadow: 0 4px 12px rgba(0,0,0,0.05);
      position: sticky;
      top: 0;
      z-index: 10;
    }

    .sidebar-toggle {
      display: none;
      background: var(--accent);
      color: white;
      padding: 10px 14px;
      font-size: 20px;
      cursor: pointer;
      position: fixed;
      top: 20px;
      left: 20px;
      z-index: 1001;
      border-radius: 8px;
      box-shadow: 0 5px 15px rgba(0,0,0,0.2);
    }

    .container {
      display: flex;
      flex: 1;
    }

    .sidebar {
      width: 240px;
      background: #ffffff;
      border-right: 1.5px solid #e0e6ed;
      padding: 30px 20px;
      display: flex;
      flex-direction: column;
      gap: 14px;
      transition: transform 0.3s ease-in-out;
    }

    .sidebar-header {
      font-size: 18px;
      font-weight: 700;
      color: var(--primary);
      display: flex;
      align-items: center;
      gap: 10px;
      margin-bottom: 30px;
      font-family: 'Orbitron', sans-serif;
    }

    .sidebar a {
      display: flex;
      align-items: center;
      gap: 14px;
      text-decoration: none;
      font-weight: 600;
      padding: 12px 16px;
      color: var(--text-dark);
      border-radius: 10px;
      transition: background 0.25s ease, color 0.25s ease;
    }

    .sidebar a:hover,
    .sidebar a.active {
      background: var(--accent);
      color: white;
    }

    .main {
      flex: 1;
      padding: 40px 30px;
      overflow-y: auto;
    }

    .main h2 {
      font-family: 'Orbitron', sans-serif;
      font-size: 26px;
      margin-bottom: 30px;
      color: var(--primary);
    }
    
    .success {
      padding: 12px 20px;
      background: #d4edda;
      color: #155724;
      border-left: 5px solid #28a745;
      border-radius: 8px;
      margin-bottom: 20px;
      font-weight: 600;
    }

    .cards {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
      gap: 20px;
    }

    .card {
      background: #ffffff;
      padding: 25px;
      border-radius: 15px;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.06);
      transition: transform 0.3s ease;
    }

    .card h3 {
      font-size: 20px;
      margin-bottom: 10px;
      color: var(--accent);
    }

    .card p {
      font-size: 18px;
    }
    
    /* Card form styles */
.card-form {
  margin-top: 20px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.card-form label {
  font-weight: 600;
  color: var(--primary);
  margin-bottom: 4px;
}

.card-form input[type="number"],
.card-form input[type="text"],
.card-form input[type="file"] {
  padding: 8px 10px;
  margin-top: 10px;
  border: 1.5px solid #ccc;
  border-radius: 8px;
  font-size: 16px;
  transition: border-color 0.3s ease;
  width: 100%;
  box-sizing: border-box;
}

.card-form input[type="number"]:focus,
.card-form input[type="text"]:focus,
.card-form input[type="file"]:focus {
  outline: none;
  border-color: var(--accent);
}

.card-form button {
  background: var(--accent);
  color: white;
  border: none;
  margin-top: 10px;
  padding: 12px;
  font-size: 18px;
  border-radius: 10px;
  cursor: pointer;
  font-weight: 700;
  transition: background 0.3s ease;
  align-self: flex-start;
  width: auto;
  min-width: 140px;
}

.card-form button:hover {
  background: #d65a3a;
}

.bill-img {
  margin-top: 15px;
  max-width: 100%;
  border-radius: 10px;
  box-shadow: 0 4px 8px rgba(0,0,0,0.1);
}

a[href^="tel:"] {
  color: #1d3557;
  font-weight: bold;
  text-decoration: none;
}

a[href^="tel:"]:hover {
  color: #e76f51;
  text-decoration: underline;
}

/* Responsive tweaks */
@media (max-width: 768px) {
  /* Make sidebar slide and main padding adjusted already */

  /* Cards stack in single column on small tablets */
  .cards {
    grid-template-columns: 1fr;
  }

  /* Make button full width on smaller screens */
  .card-form button {
    width: 100%;
    min-width: unset;
  }
}

@media (max-width: 480px) {
  /* Inputs fill the container on mobiles */
  .card-form input[type="number"],
  .card-form input[type="file"] {
    font-size: 18px;
  }

  /* Increase button font size and padding on small screens */
  .card-form button {
    font-size: 20px;
    padding: 14px;
  }
}


    @media (max-width: 768px) {
      .sidebar {
        position: fixed;
        top: 0;
        left: 0;
        height: 100%;
        transform: translateX(-100%);
        z-index: 1000;
        padding-top: 80px;
      }

      .sidebar.active {
        transform: translateX(0);
      }

      .sidebar-toggle {
        display: block;
      }

      .main {
        padding-top: 80px;
      }

      header {
        padding-left: 60px;
      }
    }

    @media (max-width: 480px) {
      .cards {
        grid-template-columns: 1fr;
      }
    }
  </style>
</head>
<body>

<!-- Sidebar Toggle Button -->
<div class="sidebar-toggle" id="sidebarToggle">
  <i class="fas fa-bars"></i>
</div>

<header>Technician Dashboard</header>

<div class="container">
  <!-- Sidebar -->
  <div class="sidebar" id="sidebar">
    <div class="sidebar-header">
      <i class="fas fa-toolbox"></i>
      <span>Technician</span>
    </div>
    <a href="dashboard.php"><i class="fas fa-chart-line"></i> Dashboard</a>
    <a href="assigned-orders.php" class="active"><i class="fas fa-list-check"></i> Assigned Orders</a>
    <a href="complete-order.php"><i class="fas fa-check-circle"></i> Mark as Completed</a>
    <a href="upi-generator.php"><i class="fas fa-qrcode"></i> UPI Generator</a>
    <a href="settings.php"><i class="fas fa-user-cog"></i> Settings</a>
    <a href="privacy/"><i class="fas fa-file-contract"></i> Privacy Policy</a>
    <a href="logout.php"><i class="fas fa-sign-out-alt"></i> Logout</a>
  </div>

  <!-- Main Content -->
  <div class="main">
    <h2>Your Orders</h2>

    <?php if (!empty($_SESSION['success'])): ?>
      <div class="success"><?php echo htmlspecialchars($_SESSION['success']); ?></div>
      <?php unset($_SESSION['success']); ?>
    <?php endif; ?>

    <!-- ✅ Transport Orders First -->
    <?php foreach ($transport_orders as $torder): ?>
      <div class="card">
        <div class="card-content">
          <h3>Order #<?= htmlspecialchars($torder['id']) ?> - <?= htmlspecialchars($torder['product_name']) ?></h3>
          <p><strong>Customer:</strong> <?= htmlspecialchars($torder['customer_name']) ?></p>
          <p><strong>Phone Number:</strong>
            <a href="tel:<?= htmlspecialchars($torder['customer_phonenumber']) ?>">
              <?= htmlspecialchars($torder['customer_phonenumber']) ?>
            </a>
          </p>
          <p><strong>From:</strong> <?= htmlspecialchars($torder['from_destination']) ?></p>
          <p><strong>To:</strong> <?= htmlspecialchars($torder['to_destination']) ?></p>
          <p><strong>Preferred Date:</strong> <?= htmlspecialchars($torder['preferred_date']) ?></p>
          <p><strong>Estimated Cost ₹:</strong> <?= htmlspecialchars($torder['initial_amount']) ?></p>
          <p><strong>Status:</strong> <?= htmlspecialchars($torder['status']) ?></p>
        </div>

        <div class="card-form">
          <?php if ($torder['status'] !== 'done'): ?>
            <form method="POST" onsubmit="return validatePin(<?= $torder['id'] ?>, '<?= htmlspecialchars($torder['securitypin']) ?>')">
              <input type="hidden" name="order_id" value="<?= $torder['id'] ?>">
              <input type="hidden" name="initial_amount" value="<?= $torder['initial_amount'] ?>">
              <input type="hidden" name="is_transport" value="1">

              <label>Final Amount (₹)</label>
              <input type="number" name="final_amount" required oninput="toggleReasonDropdown(this, <?= $torder['initial_amount'] ?>, <?= $torder['id'] ?>)">

              <label>Technician Note</label>
              <input type="text" name="technician_note" placeholder="Add any notes here...">

              <div id="reason-box-<?= $torder['id'] ?>" style="display:none;">
                <label>Reason for Extra Charges</label>
                <select name="extra_reason_id" style="padding: 8px 10px; margin-top: 10px; border: 1.5px solid #ccc; border-radius: 8px; font-size: 16px;" required="required">
                  <option value="">Select Reason</option>
                  <?php foreach ($transport_reasons as $reason): ?>
                    <option value="<?= $reason['id'] ?>"><?= htmlspecialchars($reason['reason']) ?></option>
                  <?php endforeach; ?>
                </select>
              </div>

              <label>Happy Pin</label>
              <input type="number" name="entered_pin" id="pin-input-<?= $torder['id'] ?>" placeholder="Enter Happy Pin" required>
              <div id="pin-error-<?= $torder['id'] ?>" style="color:red; display:none;">Incorrect Happy Pin</div>

              <button type="submit">Mark Completed</button>
            </form>
          <?php else: ?>
            <p><strong>Status:</strong> Completed</p>
          <?php endif; ?>
        </div>
      </div>
    <?php endforeach; ?>


    <!-- ✅ Regular Orders -->
    <?php foreach ($orders as $order): ?>
      <div class="card">
        <div class="card-content">
          <h3>Order #<?= htmlspecialchars($order['id']) ?> - <?= htmlspecialchars($order['product_name']) ?></h3>
          <p><strong>Customer:</strong> <?= htmlspecialchars($order['customer_name']) ?></p>
          <p><strong>Phone Number:</strong>
            <a href="tel:<?= htmlspecialchars($order['customer_phonenumber']) ?>">
              <?= htmlspecialchars($order['customer_phonenumber']) ?>
            </a>
          </p>
          <p><strong>Address:</strong> <?= htmlspecialchars($order['customer_address']) ?></p>
          <p><strong>Description:</strong> <?= htmlspecialchars($order['problem_description']) ?></p>
          <p><strong>Preferred Date:</strong> <?= htmlspecialchars($order['preferred_date']) ?></p>
          <p><strong>Note:</strong> <?= htmlspecialchars($order['customer_note']) ?></p>
          <p><strong>Estimated Cost ₹:</strong> <?= htmlspecialchars($order['initial_amount']) ?></p>
          <p><strong>Status:</strong> <?= htmlspecialchars($order['status']) ?></p>

          <?php if ($order['bill_image']): ?>
            <img src="../<?= htmlspecialchars($order['bill_image']) ?>" class="bill-img" alt="Bill Image">
          <?php endif; ?>
        </div>

        <div class="card-form">
          <?php if ($order['status'] !== 'done'): ?>
            <form method="POST" enctype="multipart/form-data" onsubmit="return validatePin(<?= $order['id'] ?>, '<?= htmlspecialchars($order['securitypin']) ?>')">
              <input type="hidden" name="order_id" value="<?= $order['id'] ?>">
              <input type="hidden" name="initial_amount" value="<?= $order['initial_amount'] ?>">

              <label>Final Amount (₹)</label>
              <input type="number" name="final_amount" required oninput="toggleReasonDropdown(this, <?= $order['initial_amount'] ?>, <?= $order['id'] ?>)">

              <label>Technician Note</label>
              <input type="text" name="technician_note" placeholder="Add any notes here...">

              <div id="reason-box-<?= $order['id'] ?>" style="display:none;">
                <label>Reason for Extra Charges</label>
                <select name="extra_reason_id" style="padding: 8px 10px; margin-top: 10px; border: 1.5px solid #ccc; border-radius: 8px; font-size: 16px;" required="required">
                  <option value="">Select Reason</option>
                  <?php foreach ($reasons as $reason): ?>
                    <option value="<?= $reason['id'] ?>"><?= htmlspecialchars($reason['reason']) ?></option>
                  <?php endforeach; ?>
                </select>
              </div>

              <label>Upload Bill</label>
              <input type="file" name="bill_image" accept="image/*" capture="environment">

              <label>Happy Pin</label>
              <input type="text" name="entered_pin" id="pin-input-<?= $order['id'] ?>" placeholder="Enter Happy Pin" required>
              <div id="pin-error-<?= $order['id'] ?>" style="color:red; display:none;">Incorrect Happy Pin</div>

              <button type="submit">Mark Completed</button>
            </form>
          <?php else: ?>
            <p><strong>Status:</strong> Completed</p>
          <?php endif; ?>
        </div>
      </div>
    <?php endforeach; ?>
    
    <!-- ✅ Pre Orders Section -->
<?php foreach ($pre_orders as $porder): ?>
  <div class="card">
    <div class="card-content">
      <h3>Pre-Order #<?= htmlspecialchars($porder['id']) ?> - <?= htmlspecialchars($porder['product_name']) ?></h3>
      <p><strong>Dealer:</strong> <?= htmlspecialchars($porder['dealer_name']) ?></p>
      <p><strong>Dealer Phone:</strong>
        <a href="tel:<?= htmlspecialchars($porder['dealer_phone']) ?>">
          <?= htmlspecialchars($porder['dealer_phone']) ?>
        </a>
      </p>
      <p><strong>Customer:</strong> <?= htmlspecialchars($porder['customer_name']) ?></p>
      <p><strong>Phone:</strong>
        <a href="tel:<?= htmlspecialchars($porder['phone']) ?>">
          <?= htmlspecialchars($porder['phone']) ?>
        </a>
      </p>
      <p><strong>Address:</strong> <?= htmlspecialchars($porder['address']) ?></p>
      <p><strong>Description:</strong> <?= htmlspecialchars($porder['problem_description']) ?></p>
      <p><strong>Preferred Date:</strong> <?= htmlspecialchars($porder['preferred_date']) ?></p>
      <p><strong>Note:</strong> <?= htmlspecialchars($porder['customer_note']) ?></p>
      <p><strong>Estimated Cost ₹:</strong> <?= htmlspecialchars($porder['initial_amount']) ?></p>
      <p><strong>Status:</strong> <?= htmlspecialchars($porder['status']) ?></p>
    </div>

<div class="card-form">
    <?php if ($porder['status'] !== 'done'): ?>
        <form method="POST" enctype="multipart/form-data" 
              onsubmit="return validatePin(<?= $porder['id'] ?>, '<?= htmlspecialchars($porder['securitypin']) ?>')">
              
            <input type="hidden" name="order_id" value="<?= $porder['id'] ?>">
            <input type="hidden" name="initial_amount" value="<?= $porder['initial_amount'] ?>">
            <input type="hidden" name="is_preorder" value="1">

            <label>Final Amount (₹)</label>
            <input type="number" name="final_amount" required 
                   oninput="toggleReasonDropdown(this, <?= $porder['initial_amount'] ?>, <?= $porder['id'] ?>)">

            <label>Technician Note</label>
            <input type="text" name="technician_note" placeholder="Add any notes here...">

            <div id="reason-box-<?= $porder['id'] ?>" style="display:none;">
                <label>Reason for Extra Charges</label>
                <select name="extra_reason_id" 
                        style="padding: 8px 10px; margin-top: 10px; border: 1.5px solid #ccc; border-radius: 8px; font-size: 16px;"
                        required="required">
                    <option value="">Select Reason</option>
                    <?php foreach ($reasons as $reason): ?>
                        <option value="<?= $reason['id'] ?>"><?= htmlspecialchars($reason['reason']) ?></option>
                    <?php endforeach; ?>
                </select>
            </div>

            <label>Upload Bill</label>
            <input type="file" name="bill_image" accept="image/*" capture="environment">

            <label>Happy Pin</label>
            <input type="text" name="entered_pin" id="pin-input-<?= $porder['id'] ?>" placeholder="Enter Happy Pin" required>
            <div id="pin-error-<?= $porder['id'] ?>" style="color:red; display:none;">Incorrect Happy Pin</div>

            <button type="submit">Mark Completed</button>
        </form>
    <?php else: ?>
        <p><strong>Status:</strong> Completed</p>
    <?php endif; ?>
</div>
    <?php endforeach; ?>
  </div>
</div>
<script>
  const sidebarToggle = document.getElementById('sidebarToggle');
  const sidebar = document.getElementById('sidebar');
  sidebarToggle.addEventListener('click', () => {
    sidebar.classList.toggle('active');
  });
</script>
<script>
function validatePin(orderId, actualPin) {
  const enteredPin = document.getElementById('pin-input-' + orderId).value.trim();
  const errorBox = document.getElementById('pin-error-' + orderId);
  
  if (enteredPin === actualPin) {
    errorBox.style.display = 'none';
    return true;
  } else {
    errorBox.style.display = 'block';
    return false; // prevent form submit
  }
}
</script>
<script>
function toggleReasonDropdown(input, initial, id) {
  const reasonBox = document.getElementById('reason-box-' + id);
  const select = reasonBox.querySelector('select');

  if (parseFloat(input.value) > parseFloat(initial)) {
    reasonBox.style.display = 'block';
    select.setAttribute('required', 'required');
  } else {
    reasonBox.style.display = 'none';
    select.removeAttribute('required'); // ✅ Remove required dynamically
  }
}
</script>
</body>
</html>
