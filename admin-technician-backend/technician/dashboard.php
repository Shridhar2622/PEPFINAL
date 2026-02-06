<?php
session_start();
require '../config.php';

if (!isset($_SESSION['techniciam_name']) || !isset($_SESSION['techniciam_id'])) {
    header("Location: index.php");
    exit();
}

$techniciam_id = $_SESSION['techniciam_id'];

/* 🔹 TOTAL ASSIGNED ORDERS */
$sql_total = "
    SELECT 
        (SELECT COUNT(*) FROM orders WHERE technician_id = ?) +
        (SELECT COUNT(*) FROM transport_orders WHERE technician_id = ?) +
        (SELECT COUNT(*) FROM pre_orders WHERE technician_id = ?)
    AS total_orders";
$stmt = $conn->prepare($sql_total);
$stmt->bind_param("iii", $techniciam_id, $techniciam_id, $techniciam_id);
$stmt->execute();
$result = $stmt->get_result();
$total_orders = $result->fetch_assoc()['total_orders'] ?? 0;
$stmt->close();

/* 🔹 PENDING WORK (assigned + in-progress) */
$sql_pending = "
    SELECT 
        (SELECT COUNT(*) FROM orders WHERE technician_id = ? AND status IN ('assigned', 'in-progress')) +
        (SELECT COUNT(*) FROM transport_orders WHERE technician_id = ? AND status IN ('assigned', 'in-progress')) +
        (SELECT COUNT(*) FROM pre_orders WHERE technician_id = ? AND status IN ('assigned', 'in-progress'))
    AS pending";
$stmt = $conn->prepare($sql_pending);
$stmt->bind_param("iii", $techniciam_id, $techniciam_id, $techniciam_id);
$stmt->execute();
$result = $stmt->get_result();
$pending = $result->fetch_assoc()['pending'] ?? 0;
$stmt->close();

/* 🔹 COMPLETED JOBS */
$sql_completed = "
    SELECT 
        (SELECT COUNT(*) FROM orders WHERE technician_id = ? AND status = 'done') +
        (SELECT COUNT(*) FROM transport_orders WHERE technician_id = ? AND status = 'done') +
        (SELECT COUNT(*) FROM pre_orders WHERE technician_id = ? AND status = 'done')
    AS completed";
$stmt = $conn->prepare($sql_completed);
$stmt->bind_param("iii", $techniciam_id, $techniciam_id, $techniciam_id);
$stmt->execute();
$result = $stmt->get_result();
$completed = $result->fetch_assoc()['completed'] ?? 0;
$stmt->close();

/* ⭐ AVERAGE RATING (orders + transport_orders + pre_orders) */
$sql_rating = "
    SELECT ROUND(AVG(r), 1) AS avg_rating FROM (
        SELECT rating AS r FROM orders WHERE technician_id = ? AND rating IS NOT NULL
        UNION ALL
        SELECT rating AS r FROM transport_orders WHERE technician_id = ? AND rating IS NOT NULL
        UNION ALL
        SELECT rating AS r FROM pre_orders WHERE technician_id = ? AND rating IS NOT NULL
    ) AS combined_ratings";
$stmt = $conn->prepare($sql_rating);
$stmt->bind_param("iii", $techniciam_id, $techniciam_id, $techniciam_id);
$stmt->execute();
$result = $stmt->get_result();
$avg_rating = $result->fetch_assoc()['avg_rating'] ?? "N/A";
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
      font-weight: 600;
    }

    .card-link {
      text-decoration: none;
      color: inherit;
      display: block;
      transition: transform 0.2s ease;
    }
    
    .card-link:hover .card {
      transform: scale(1.02);
      box-shadow: 0 6px 18px rgba(0,0,0,0.1);
      cursor: pointer;
    }
    
    .call-button {
      position: fixed;
      bottom: 24px;
      right: 24px;
      width: 60px;
      height: 60px;
      background-color: var(--accent);
      color: white;
      border-radius: 50%;
      text-align: center;
      line-height: 60px;
      font-size: 24px;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
      z-index: 1002;
      transition: background-color 0.3s ease;
      text-decoration: none;
    }
    
    .call-button:hover {
      background-color: #d65a3d;
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

<a href="tel:+919288392886" class="call-button" title="Call Now">
  <i class="fas fa-headset"></i>
</a>

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
    <a href="dashboard.php" class="active"><i class="fas fa-chart-line"></i> Dashboard</a>
    <a href="assigned-orders.php"><i class="fas fa-list-check"></i> Assigned Orders</a>
    <a href="complete-order.php"><i class="fas fa-check-circle"></i> Mark as Completed</a>
    <a href="upi-generator.php"><i class="fas fa-qrcode"></i> UPI Generator</a>
    <a href="settings.php"><i class="fas fa-user-cog"></i> Settings</a>
    <a href="privacy/"><i class="fas fa-file-contract"></i> Privacy Policy</a>
    <a href="logout.php"><i class="fas fa-sign-out-alt"></i> Logout</a>
  </div>

  <!-- Main Content -->
  <div class="main">
    <h2>Welcome, <?php echo htmlspecialchars($_SESSION['techniciam_name']); ?> 👨‍🔧</h2>

    <div class="cards">
      <a href="complete-order.php" class="card-link">
        <div class="card">
          <h3><i class="fas fa-tasks"></i> Total Orders</h3>
          <p><?php echo $total_orders; ?></p>
        </div>
      </a>
    
      <a href="assigned-orders.php" class="card-link">
        <div class="card">
          <h3><i class="fas fa-hourglass-half"></i> Pending Work</h3>
          <p><?php echo $pending; ?></p>
        </div>
      </a>
    
      <a href="complete-order.php" class="card-link">
        <div class="card">
          <h3><i class="fas fa-check-circle"></i> Completed</h3>
          <p><?php echo $completed; ?></p>
        </div>
      </a>
    
      <a href="complete-order.php" class="card-link">
        <div class="card">
          <h3><i class="fas fa-star"></i> Avg. Rating</h3>
          <p><?php echo is_numeric($avg_rating) ? $avg_rating . " ★" : "No ratings yet"; ?></p>
        </div>
      </a>
    </div>
  </div>
</div>

<script>
  const sidebarToggle = document.getElementById('sidebarToggle');
  const sidebar = document.getElementById('sidebar');
  sidebarToggle.addEventListener('click', () => {
    sidebar.classList.toggle('active');
  });
</script>
</body>
</html>
