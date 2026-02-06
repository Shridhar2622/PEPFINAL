<?php
session_start();
require '../config.php';

if (!isset($_SESSION['techniciam_id'])) {
    header("Location: index.php");
    exit();
}

$techniciam_id = $_SESSION['techniciam_id'];

// Fetch only done orders assigned to this technician
$orders = [];
$stmt = $conn->prepare("
  SELECT orders.*, 
         users.name AS customer_name, 
         users.phone AS customer_phonenumber, 
         users.address AS customer_address
  FROM orders
  JOIN users ON orders.customer_id = users.id
  WHERE orders.technician_id = ? AND orders.status = 'done'
");
$stmt->bind_param("i", $techniciam_id);
$stmt->execute();
$result = $stmt->get_result();
while ($row = $result->fetch_assoc()) {
    $orders[] = $row;
}
$stmt->close();

// Fetch completed transport orders
$transport_orders = [];
$stmt = $conn->prepare("
  SELECT transport_orders.*, 
         users.name AS customer_name, 
         users.phone AS customer_phonenumber,
         transport_reasons.reason AS reason_name
  FROM transport_orders
  JOIN users ON transport_orders.customer_id = users.id
  LEFT JOIN transport_reasons ON transport_orders.extra_reason_id = transport_reasons.id
  WHERE transport_orders.technician_id = ? AND transport_orders.status = 'done'
");
$stmt->bind_param("i", $techniciam_id);
$stmt->execute();
$result = $stmt->get_result();
while ($row = $result->fetch_assoc()) {
    $transport_orders[] = $row;
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
    AND pre_orders.status = 'done'
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
  <title>Completed Orders</title>
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
      display: flex;
      flex-direction: column;
      gap: 12px;
    }

    .card h3 {
      font-size: 20px;
      margin-bottom: 10px;
      color: var(--accent);
    }

    
    .card strong {
      color: #333;
    }

    .bill-img {
      margin-top: 15px;
      max-width: 100%;
      border-radius: 10px;
      box-shadow: 0 4px 8px rgba(0,0,0,0.1);
    }

    .rating {
      color: #e9a825;
      font-size: 20px;
      margin-top: 10px;
    }
    
    .show-image-link {
      display: inline-block;
      color: #9f0000;
      text-decoration: none;
      font-weight: 600;
    }
    
    a[href^="tel:"] {
      color: #1d3557;
      text-decoration: none;
    }
    
    a[href^="tel:"]:hover {
      color: #e76f51;
      text-decoration: underline;
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
    <a href="assigned-orders.php"><i class="fas fa-list-check"></i> Assigned Orders</a>
    <a href="complete-order.php" class="active"><i class="fas fa-check-circle"></i> Mark as Completed</a>
    <a href="upi-generator.php"><i class="fas fa-qrcode"></i> UPI Generator</a>
    <a href="settings.php"><i class="fas fa-user-cog"></i> Settings</a>
    <a href="privacy/"><i class="fas fa-file-contract"></i> Privacy Policy</a>
    <a href="logout.php"><i class="fas fa-sign-out-alt"></i> Logout</a>
  </div>

  <!-- Main Content -->
  <div class="main">
    <h2>Completed Orders</h2>

<?php foreach ($orders as $order): ?>
<?php foreach ($transport_orders as $torder): ?>
  <div class="card">
    <h3>Transport Order #<?= htmlspecialchars($torder['id']) ?> - <?= htmlspecialchars($torder['transport_type']) ?></h3>
    <p><strong>Customer Name:</strong> <?= htmlspecialchars($torder['customer_name']) ?></p>
    <p><strong>Phone Number:</strong> 
      <a href="tel:<?= htmlspecialchars($torder['customer_phonenumber']) ?>">
        <?= htmlspecialchars($torder['customer_phonenumber']) ?>
      </a>
    </p>
    <p><strong>From:</strong> <?= htmlspecialchars($torder['from_destination']) ?></p>
    <p><strong>To:</strong> <?= htmlspecialchars($torder['to_destination']) ?></p>
    <p><strong>Request Date:</strong> <?= htmlspecialchars($torder['preferred_date']) ?></p>
    <p><strong>Completed Date:</strong> <?= htmlspecialchars($torder['completed_at']) ?></p>
    <p><strong>Vehicle Type:</strong> <?= htmlspecialchars($torder['product_name']) ?></p>
    <p><strong>Initial Amount ₹:</strong> <?= htmlspecialchars($torder['initial_amount']) ?></p>
    <p><strong>Final Amount ₹:</strong> <?= htmlspecialchars($torder['final_amount']) ?></p>
    <p><strong>Status:</strong> <?= htmlspecialchars($torder['status']) ?></p>
    
    <?php if (!empty($torder['reason_name'])): ?>
      <p><strong>Extra Charge Reason:</strong> <?= htmlspecialchars($torder['reason_name']) ?></p>
    <?php endif; ?>

    <?php if (!empty($torder['technician_note'])): ?>
      <p><strong>Technician Note:</strong> <?= htmlspecialchars($torder['technician_note']) ?></p>
    <?php endif; ?>
    
    <?php if (!empty($torder['rating'])): ?>
  <p><strong>Rating:</strong> 
    <span class="rating">
      <?= str_repeat('★', $torder['rating']) ?><?= str_repeat('☆', 5 - $torder['rating']) ?>
    </span>
  </p>
<?php endif; ?>

<?php if (!empty($torder['review'])): ?>
  <p><strong>Review:</strong> <?= htmlspecialchars($torder['review']) ?></p>
<?php endif; ?>
  </div>
<?php endforeach; ?>

  <div class="card">
    <h3>Order #<?= htmlspecialchars($order['id']) ?> - <?= htmlspecialchars($order['product_name']) ?></h3>
    <p><strong>Customer Name:</strong> <?= htmlspecialchars($order['customer_name']) ?></p>
    <p><strong>Phone Number:</strong> 
      <a href="tel:<?= htmlspecialchars($order['customer_phonenumber']) ?>">
        <?= htmlspecialchars($order['customer_phonenumber']) ?>
      </a>
    </p>
    <p><strong>Address:</strong> <?= htmlspecialchars($order['customer_address']) ?></p>
    <p><strong>Service Request Date:</strong> <?= htmlspecialchars($order['preferred_date']) ?></p>
    <p><strong>Note:</strong> <?= htmlspecialchars($order['customer_note']) ?></p>
    <p><strong>Estimated Cost ₹:</strong> <?= htmlspecialchars($order['initial_amount']) ?></p>
    <p><strong>Amount Paid ₹:</strong> <?= htmlspecialchars($order['final_amount']) ?></p>
    <p><strong>Status:</strong> <?= htmlspecialchars($order['status']) ?></p>

    <?php if (!empty($order['bill_image'])): ?>
      <p><strong>Bill Image:</strong>
      <a href="../<?= htmlspecialchars($order['bill_image']) ?>" target="_blank" class="show-image-link">
        Show Image
      </a>
      </p>
    <?php endif; ?>

    <?php if (!empty($order['rating'])): ?>
      <p><strong>Rating:</strong> <span class="rating"><?= str_repeat('★', $order['rating']) ?><?= str_repeat('☆', 5 - $order['rating']) ?></span></p>
    <?php endif; ?>

    <?php if (!empty($order['review'])): ?>
      <p><strong>Review:</strong> <?= htmlspecialchars($order['review']) ?></p>
    <?php endif; ?>
  </div>
<?php endforeach; ?>

<?php foreach ($pre_orders as $porder): ?>
  <div class="card">
    <h3>Pre-Order #<?= htmlspecialchars($porder['id']) ?> - <?= htmlspecialchars($porder['product_name']) ?></h3>
    <p><strong>Customer Name:</strong> <?= htmlspecialchars($porder['customer_name']) ?></p>
    <p><strong>Phone Number:</strong> 
      <a href="tel:<?= htmlspecialchars($porder['customer_phonenumber']) ?>">
        <?= htmlspecialchars($porder['customer_phonenumber']) ?>
      </a>
    </p>
    <p><strong>Address:</strong> <?= htmlspecialchars($porder['customer_address']) ?></p>
    <p><strong>Service Request Date:</strong> <?= htmlspecialchars($porder['preferred_date']) ?></p>
    <p><strong>Note:</strong> <?= htmlspecialchars($porder['customer_note']) ?></p>
    <p><strong>Estimated Cost ₹:</strong> <?= htmlspecialchars($porder['initial_amount']) ?></p>
    <p><strong>Amount Paid ₹:</strong> <?= htmlspecialchars($porder['final_amount']) ?></p>
    <p><strong>Status:</strong> <?= htmlspecialchars($porder['status']) ?></p>

    <?php if (!empty($porder['bill_image'])): ?>
      <p><strong>Bill Image:</strong>
        <a href="../<?= htmlspecialchars($porder['bill_image']) ?>" target="_blank" class="show-image-link">
          Show Image
        </a>
      </p>
    <?php endif; ?>

    <?php if (!empty($porder['rating'])): ?>
      <p><strong>Rating:</strong> 
        <span class="rating">
          <?= str_repeat('★', $porder['rating']) ?><?= str_repeat('☆', 5 - $porder['rating']) ?>
        </span>
      </p>
    <?php endif; ?>

    <?php if (!empty($porder['review'])): ?>
      <p><strong>Review:</strong> <?= htmlspecialchars($porder['review']) ?></p>
    <?php endif; ?>
  </div>
<?php endforeach; ?>

<script>
  const sidebarToggle = document.getElementById('sidebarToggle');
  const sidebar = document.getElementById('sidebar');
  sidebarToggle.addEventListener('click', () => {
    sidebar.classList.toggle('active');
  });
</script>
</body>
</html>
