<?php
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

require '../config.php';
session_start();
if (!isset($_SESSION['admin'])) {
    header("Location: index.php");
    exit();
}

$errors = [];
$name = $email = $phone = $password = $address = "";

function generateUniqueIdNumber($conn) {
    do {
        $random_number = str_pad(mt_rand(0, 99999999), 8, '0', STR_PAD_LEFT);
        $stmt = $conn->prepare("SELECT id FROM dealer WHERE id_number = ?");
        $stmt->bind_param("s", $random_number);
        $stmt->execute();
        $stmt->store_result();
    } while ($stmt->num_rows > 0);
    $stmt->close();
    return $random_number;
}

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $name     = trim($_POST['name'] ?? '');
    $email    = trim($_POST['email'] ?? '');
    $phone    = trim($_POST['phone'] ?? '');
    $password = trim($_POST['password'] ?? '');
    $address  = trim($_POST['address'] ?? '');
    $id_number = generateUniqueIdNumber($conn);

    // ✅ Basic Validations
    if (!$name) $errors['name'] = "Name is required.";
    if (!$email || !filter_var($email, FILTER_VALIDATE_EMAIL)) $errors['email'] = "Valid email is required.";
    if (!$phone) $errors['phone'] = "Phone number is required.";
    if (!$password || strlen($password) < 6) $errors['password'] = "Password must be at least 6 characters.";
    if (!$address) $errors['address'] = "Address is required.";

    if (empty($errors)) {

        // ✅ Step 1: Check if phone or email exists in users table
        $checkUser = $conn->prepare("SELECT id FROM users WHERE phone = ? OR email = ?");
        $checkUser->bind_param("ss", $phone, $email);
        $checkUser->execute();
        $checkUser->store_result();

        if ($checkUser->num_rows > 0) {
            $errors['general'] = "Customer already exists with this phone number or email.";
        }
        $checkUser->close();

        // ✅ Step 2: Check if phone or email exists in dealer table itself
        if (empty($errors)) {
            $checkDealer = $conn->prepare("SELECT id FROM dealer WHERE phone = ? OR email = ?");
            $checkDealer->bind_param("ss", $phone, $email);
            $checkDealer->execute();
            $checkDealer->store_result();

            if ($checkDealer->num_rows > 0) {
                $errors['general'] = "Dealer already exists with this phone number or email.";
            }
            $checkDealer->close();
        }

        // ✅ Step 3: If no duplicates, insert into dealer table
        if (empty($errors)) {
            $hashed_password = password_hash($password, PASSWORD_DEFAULT);

            $stmt = $conn->prepare("INSERT INTO dealer (name, email, phone, password, address, id_number, created_at) 
                                    VALUES (?, ?, ?, ?, ?, ?, NOW())");
            $stmt->bind_param("ssssss", $name, $email, $phone, $hashed_password, $address, $id_number);

            if ($stmt->execute()) {
                header("Location: manage_technician.php?success=1");
                exit();
            } else {
                $errors['general'] = "Failed to add technician. Try again.";
            }
            $stmt->close();
        }
    }
}
?>

<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<title>Add Dealer</title>
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
  input[type="email"],
  input[type="password"] {
    width: 100%;
    padding: 12px 14px;
    border: 1.5px solid #d7e0eb;
    border-radius: 8px;
    font-size: 16px;
    transition: border-color 0.3s ease;
  }
  input[type="text"]:focus,
  input[type="email"]:focus,
  input[type="password"]:focus {
    border-color: #457b9d;
    outline: none;
  }
  .error {
    color: #dc3545;
    font-size: 14px;
    margin-top: 4px;
  }
button {
  display: block; /* NEW */
  margin-top: 32px; /* Thoda zyada gap ke liye */
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
            <a href="add-reason.php"><i class="fas fa-file-alt"></i> Add Reason</a>
            <a href="add-service.php"><i class="fas fa-plus-circle"></i> Add Service</a>
            <a href="add_technician.php"><i class="fas fa-user-plus"></i> Add Technician</a>
            <a href="add_dealer.php" class="active"><i class="fas fa-user-plus"></i> Add Dealer</a>
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
      <h2>Add Technician</h2>

      <?php if (!empty($errors['general'])): ?>
        <div class="general-error"><?= htmlspecialchars($errors['general']) ?></div>
      <?php endif; ?>

      <form method="POST" action="" enctype="multipart/form-data">
        <label for="name">Name</label>
        <input id="name" name="name" type="text" value="<?= htmlspecialchars($name) ?>" />
        <?php if (!empty($errors['name'])): ?>
          <div class="error"><?= htmlspecialchars($errors['name']) ?></div>
        <?php endif; ?>

        <label for="email">Email</label>
        <input id="email" name="email" type="email" value="<?= htmlspecialchars($email) ?>" />
        <?php if (!empty($errors['email'])): ?>
          <div class="error"><?= htmlspecialchars($errors['email']) ?></div>
        <?php endif; ?>

        <label for="phone">Phone</label>
        <input id="phone" name="phone" type="text" value="<?= htmlspecialchars($phone) ?>" />
        <?php if (!empty($errors['phone'])): ?>
          <div class="error"><?= htmlspecialchars($errors['phone']) ?></div>
        <?php endif; ?>

        <label for="password">Password</label>
        <input id="password" name="password" type="password" />
        <?php if (!empty($errors['password'])): ?>
          <div class="error"><?= htmlspecialchars($errors['password']) ?></div>
        <?php endif; ?>

        <label for="address">Address</label>
        <input id="address" name="address" type="text" value="<?= htmlspecialchars($address) ?>" />
        <?php if (!empty($errors['address'])): ?>
          <div class="error"><?= htmlspecialchars($errors['address']) ?></div>
        <?php endif; ?>

        <button type="submit">Add Technician</button>
      </form>
    </main>
  </div>
</body>
</html>
