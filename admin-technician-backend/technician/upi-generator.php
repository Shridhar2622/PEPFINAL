<?php
session_start();
require '../config.php';

if (!isset($_SESSION['techniciam_id'])) {
    header("Location: index.php");
    exit();
}

$technician_id = $_SESSION['techniciam_id'];

// Fetch UPI ID from DB
$stmt = $conn->prepare("SELECT upi_id FROM techniciam WHERE id = ?");
$stmt->bind_param("i", $technician_id);
$stmt->execute();
$result = $stmt->get_result();
$technician = $result->fetch_assoc();
$stmt->close();

$upi_id = $technician['upi_id'] ?? '';
?>
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>UPI Generator - Technician Dashboard</title>
  <link href="https://fonts.googleapis.com/css2?family=Orbitron:wght@600&family=Quicksand:wght@500&display=swap" rel="stylesheet">
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/css/all.min.css" />
  <script src="https://cdnjs.cloudflare.com/ajax/libs/qrious/4.0.2/qrious.min.js"></script>
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
  padding: 30px;
  flex-direction: column;
  align-items: center;   /* Center horizontally */
  justify-content: center; /* Center vertically */
  text-align: center;     /* For text & inputs */
}

.main h2 {
  font-family: 'Orbitron', sans-serif;
  font-size: 24px;
  margin-bottom: 20px;
  color: var(--primary);
}

input, button {
  padding: 10px;
  margin: 8px 0;
  width: 100%;
  max-width: 300px;
  border: 1px solid #ccc;
  border-radius: 6px;
}

button {
  background: var(--accent);
  color: white;
  border: none;
  cursor: pointer;
}

button:hover {
  background: #d45a3d;
}

#qr {
  margin: 20px auto;
  display: block;
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
        padding-top: 80px; /* Keep space for header */
        justify-content: flex-start; /* So it scrolls on small screens */
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
    <a href="complete-order.php"><i class="fas fa-check-circle"></i> Mark as Completed</a>
    <a href="upi-generator.php" class="active"><i class="fas fa-qrcode"></i> UPI Generator</a>
    <a href="settings.php"><i class="fas fa-user-cog"></i> Settings</a>
    <a href="privacy/"><i class="fas fa-file-contract"></i> Privacy Policy</a>
    <a href="logout.php"><i class="fas fa-sign-out-alt"></i> Logout</a>
  </div>

  <!-- Main Content -->
  <div class="main">
    <h2>UPI Payment QR Code Generator</h2>
    <input type="text" id="upiId" value="<?= htmlspecialchars($upi_id) ?>" placeholder="Enter UPI ID" readonly><br>
    <input type="number" id="amount" placeholder="Enter Amount"><br>
    <button onclick="generateQR()">Generate QR</button>
    <canvas id="qr"></canvas>
    <p id="upiLink" style="word-break: break-all;"></p>
  </div>
</div>

<script>
document.getElementById('sidebarToggle').addEventListener('click', function() {
    document.getElementById('sidebar').classList.toggle('active');
});

function generateQR() {
    let upiId = document.getElementById('upiId').value.trim();
    let amount = document.getElementById('amount').value.trim();

    if (!upiId || !amount) {
        alert("Please enter Amount");
        return;
    }

    let upiLink = `upi://pay?pa=${encodeURIComponent(upiId)}&pn=Merchant&am=${amount}&cu=INR`;
    
    document.getElementById('upiLink').innerText = upiLink;

    new QRious({
        element: document.getElementById('qr'),
        value: upiLink,
        size: 250
    });
}
</script>

</body>
</html>
