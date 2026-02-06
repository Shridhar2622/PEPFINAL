<?php
require '../config.php';
session_start();

if (!isset($_SESSION['admin'])) {
    header("Location: index.php");
    exit();
}

$msg = '';

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    if (isset($_POST['submit_reason'])) {
        $reason = trim($_POST['reason']);
        if ($reason) {
            $stmt = $conn->prepare("INSERT INTO amount_reasons (reason) VALUES (?)");
            $stmt->bind_param("s", $reason);
            $msg = $stmt->execute() ? "✅ Reason added successfully!" : "❌ Error: " . $stmt->error;
            $stmt->close();
        } else {
            $msg = "⚠️ Reason is required.";
        }
    }

    if (isset($_POST['submit_role'])) {
        $roles = trim($_POST['roles']);
        if ($roles) {
            $stmt = $conn->prepare("INSERT INTO roles (name) VALUES (?)");
            $stmt->bind_param("s", $roles);
            $msg = $stmt->execute() ? "✅ Role added successfully!" : "❌ Error: " . $stmt->error;
            $stmt->close();
        } else {
            $msg = "⚠️ Role is required.";
        }
    }
}
?>

<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <title>Add Service</title>
<link href="https://fonts.googleapis.com/css2?family=Orbitron:wght@500&family=Quicksand:wght@500&display=swap" rel="stylesheet" />
<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/css/all.min.css" />
<link rel="icon" type="image/png" href="/favicon-96x96.png" sizes="96x96" />
<link rel="icon" type="image/svg+xml" href="/favicon.svg" />
<link rel="shortcut icon" href="/favicon.ico" />
<link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
<meta name="apple-mobile-web-app-title" content="Bettiah Service" />
<link rel="manifest" href="/site.webmanifest" />
<style>
    * {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
    }

    body {
      font-family: 'Quicksand', sans-serif;
      background: linear-gradient(135deg, #edf2fb, #d7e3fc);
      color: #2d3142;
      min-height: 100vh;
    }

    header {
      background: linear-gradient(90deg, #1d3557, #457b9d);
      padding: 24px;
      text-align: center;
      color: white;
      font-size: 28px;
      font-weight: bold;
      font-family: 'Orbitron', sans-serif;
      letter-spacing: 1px;
      box-shadow: 0 3px 12px rgba(0,0,0,0.2);
    }

    .container {
      display: flex;
      flex-wrap: wrap;
      min-height: calc(100vh - 80px);
    }

    .sidebar {
      width: 240px;
      background-color: #ffffff;
      box-shadow: 4px 0 12px rgba(0,0,0,0.05);
      padding: 30px 20px;
      display: flex;
      flex-direction: column;
      gap: 18px;
      border-right: 1px solid #d9e2ec;
      overflow-y: auto;
    }

    .sidebar a {
      text-decoration: none;
      color: #1d3557;
      font-weight: 600;
      font-size: 16px;
      padding: 12px 16px;
      border-radius: 8px;
      background: #f1f5fa;
      display: flex;
      align-items: center;
      gap: 10px;
      transition: all 0.25s ease;
    }

    .sidebar a:hover,
    .sidebar a.active {
      background: #457b9d;
      color: white;
    }
    
    .sidebar-heading {
      text-decoration: none;
      color: #1d3557;
      font-weight: 600;
      font-size: 16px;
      padding: 12px 16px;
      border-radius: 8px;
      background: #f1f5fa;
      display: flex;
      align-items: center;
      gap: 10px;
      transition: all 0.25s ease;
    }
    .submenu {
        display: none;
        padding-left: 15px;
    }
    .submenu a {
        font-size: 14px;
    }

    .main {
      flex: 1;
      padding: 40px;
      background: #f8fbff;
    }

    a i {
      font-size: 18px;
      cursor: pointer;
    }
    a i.fa-edit {
      color: #007bff;
      transition: color 0.3s ease;
    }
    a i.fa-edit:hover {
      color: #0056b3;
    }
    a i.fa-trash-alt {
      color: #dc3545;
      transition: color 0.3s ease;
    }
    a i.fa-trash-alt:hover {
      color: #a71d2a;
    }
  .logout-btn {
    margin-top: auto;
    padding: 12px;
    text-align: center;
    background: #e63946;
    color: white;
    text-decoration: none;
    border-radius: 8px;
    font-weight: bold;
    transition: background 0.3s ease;
  }
  .logout-btn:hover {
    background: #c92a3e;
  }
  main {
    flex: 1;
    padding: 40px;
    background: #f8fbff;
    overflow-x: auto;
  }
  h2 {
    font-size: 26px;
    font-weight: bold;
    margin-bottom: 20px;
    color: #1d3557;
  }
  form {
    background: white;
    padding: 30px;
    border-radius: 16px;
    box-shadow: 0 6px 18px rgba(0,0,0,0.05);
    max-width: 600px;
  }
  label {
    display: block;
    font-weight: 600;
    margin-bottom: 6px;
    margin-top: 18px;
    color: #1d3557;
  }
  input[type="text"],
  input[type="number"],
  textarea {
    width: 100%;
    padding: 12px 14px;
    border: 1.5px solid #d7e0eb;
    border-radius: 8px;
    font-size: 16px;
    transition: border-color 0.3s ease;
  }
  input[type="text"]:focus,
  input[type="number"]:focus,
  textarea:focus {
    border-color: #457b9d;
    outline: none;
  }
  .error {
    color: #dc3545;
    font-size: 14px;
    margin-top: 4px;
  }
  button {
    margin-top: 24px;
    background: #1d3557;
    color: white;
    padding: 14px 24px;
    border: none;
    border-radius: 10px;
    font-weight: 600;
    cursor: pointer;
    font-size: 16px;
    transition: background 0.3s ease;
  }
  button:hover {
    background: #457b9d;
  }
  .general-error {
    background: #f8d7da;
    color: #842029;
    padding: 12px 16px;
    border-radius: 8px;
    margin-bottom: 20px;
    font-weight: 600;
  }
  @media (max-width: 768px) {
    main {
      padding: 20px;
    }
    form {
      padding: 20px;
      max-width: 100%;
    }
  }
</style>
</head>
<body>
  <header>
    🚀 Admin Dashboard - Reservice
  </header>

  <div class="container">
<div class="sidebar">
    <a href="dashboard.php"><i class="fas fa-tachometer-alt"></i> Dashboard</a>
    <a href="all_transport_orders.php"><i class="fas fa-clipboard-list"></i> All Transport Orders</a>
    <a href="all_orders.php"><i class="fas fa-clipboard-list"></i> All Orders</a>
    <a href="pre_transport_orders.php"><i class="fas fa-clipboard-list"></i> Pre Transport Orders</a>
    <a href="pre_orders.php"><i class="fas fa-clipboard-list"></i> Pre Orders</a>
    
    <!-- Add Section -->
    <div class="sidebar-heading" onclick="toggleMenu('addMenu')">➕ Add</div>
    <div class="submenu" id="addMenu">
        <a href="add-reason.php" class="active"><i class="fas fa-file-alt"></i> Add Reason</a>
        <a href="add-service.php"><i class="fas fa-plus-circle"></i> Add Service</a>
        <a href="add_technician.php"><i class="fas fa-user-plus"></i> Add Technician</a>
        <a href="add_dealer.php"><i class="fas fa-user-plus"></i> Add Dealer</a>
    </div>

    <!-- Manage Section -->
    <div class="sidebar-heading" onclick="toggleMenu('manageMenu')">⚙️ Manage</div>
    <div class="submenu" id="manageMenu">
        <a href="manage_services.php"><i class="fas fa-tools"></i> Manage Services</a>
        <a href="manage_users.php"><i class="fas fa-users"></i> Manage Users</a>
        <a href="manage_technician.php"><i class="fas fa-user-cog"></i> Manage Technician</a>
        <a href="manage_dealer.php"><i class="fas fa-user-cog"></i> Manage Dealer</a>
        <a href="manage_category.php"><i class="fas fa-sitemap"></i> Manage Category</a>
        <a href="manage_reason.php"><i class="fas fa-receipt"></i> Manage Reason</a>
    </div>

    <a href="logout.php" class="logout-btn"><i class="fas fa-sign-out-alt"></i> Logout</a>
</div>

<script>
function toggleMenu(id) {
    var menu = document.getElementById(id);
    if (menu.style.display === "block") {
        menu.style.display = "none";
    } else {
        menu.style.display = "block";
    }
}
</script>

    <main>
      <h2>Add Amount Reason</h2>
    
      <?php if ($msg): ?>
        <div class="message"><?= htmlspecialchars($msg) ?></div>
      <?php endif; ?>
    
<form method="POST">
  <label for="reason">Reason</label>
  <textarea name="reason" id="reason" rows="4" required></textarea>
  <button type="submit" name="submit_reason">Add Reason</button>
</form>

      </form>
    </main>
    
    
    <main>
      <h2>Add Technician Roles</h2>
    
      <?php if ($msg): ?>
        <div class="message"><?= htmlspecialchars($msg) ?></div>
      <?php endif; ?>
    
<form method="POST">
  <label for="roles">Role</label>
  <textarea name="roles" id="roles" rows="4" required></textarea>
  <button type="submit" name="submit_role">Add Role</button>
</form>

    </main>
  </div>
</body>
</html>
