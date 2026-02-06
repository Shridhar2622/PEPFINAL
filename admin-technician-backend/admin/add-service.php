<?php
require '../config.php';
session_start();
ini_set('display_errors', 1);
error_reporting(E_ALL);

if (!isset($_SESSION['admin'])) {
    header("Location: index.php");
    exit();
}

// Fetch all categories to populate the dropdown
$category_result = $conn->query("SELECT id, name FROM categories ORDER BY name ASC");
$category_options = $category_result->fetch_all(MYSQLI_ASSOC);

$serviceMsg = '';
$categoryMsg = '';

if ($_SERVER['REQUEST_METHOD'] === 'POST') {

// Fetch price for selected route
if (isset($_POST['fetch_price'])) {
    $from = trim($_POST['from_destination']);
    $to = trim($_POST['to_destination']);

    if ($from && $to) {
        $stmt = $conn->prepare("SELECT price FROM transport_services WHERE from_destination = ? AND to_destination = ? LIMIT 1");
        $stmt->bind_param("ss", $from, $to);
        $stmt->execute();
        $stmt->bind_result($price);
        if ($stmt->fetch()) {
            $_SESSION['edit_price_data'] = [
                'from' => $from,
                'to' => $to,
                'price' => $price
            ];
        } else {
            $_SESSION['edit_price_msg'] = "⚠️ Route not found.";
        }
        $stmt->close();
    } else {
        $_SESSION['edit_price_msg'] = "⚠️ Both 'from' and 'to' are required.";
    }
    header("Location: add-service.php");
    exit();
}

// Update price for selected route
if (isset($_POST['update_price'])) {
    $from = trim($_POST['from_destination']);
    $to = trim($_POST['to_destination']);
    $new_price = floatval($_POST['new_price']);

    if ($from && $to && $new_price >= 0) {
        $stmt = $conn->prepare("UPDATE transport_services SET price = ? WHERE from_destination = ? AND to_destination = ?");
        $stmt->bind_param("dss", $new_price, $from, $to);
        if ($stmt->execute()) {
            $_SESSION['edit_price_msg'] = "✅ Price updated successfully!";
        } else {
            $_SESSION['edit_price_msg'] = "❌ Error: " . $stmt->error;
        }
        $stmt->close();
    } else {
        $_SESSION['edit_price_msg'] = "⚠️ Invalid input.";
    }
    unset($_SESSION['edit_price_data']);
    header("Location: add-service.php");
    exit();
}


// Rename location in transport_services table
if (isset($_POST['rename_location'])) {
    $old_name = trim($_POST['old_location']);
    $new_name = trim($_POST['new_location']);

    if ($old_name && $new_name) {
        $stmt = $conn->prepare("
            UPDATE transport_services 
            SET from_destination = IF(from_destination = ?, ?, from_destination),
                to_destination = IF(to_destination = ?, ?, to_destination)
            WHERE from_destination = ? OR to_destination = ?
        ");
        $stmt->bind_param("ssssss", $old_name, $new_name, $old_name, $new_name, $old_name, $old_name);

        if ($stmt->execute()) {
            $_SESSION['rename_msg'] = "✅ Location name updated successfully!";
        } else {
            $_SESSION['rename_msg'] = "❌ Error: " . $stmt->error;
        }
        $stmt->close();
    } else {
        $_SESSION['rename_msg'] = "⚠️ Both old and new names are required.";
    }

    header("Location: add-service.php");
    exit();
}

    // Add Service
    if (isset($_POST['add_service'])) {
        $product_name = trim($_POST['product_name']);
        $problem_description = trim($_POST['problem_description']);
        $initial_amount = floatval($_POST['initial_amount']);
        $category_id = intval($_POST['category_id'] ?? 0);
        
        if ($product_name && $problem_description && $initial_amount >= 0 && $category_id > 0) {
            $stmt = $conn->prepare("INSERT INTO services (product_name, problem_description, initial_amount, category_id) VALUES (?, ?, ?, ?)");
            $stmt->bind_param("ssdi", $product_name, $problem_description, $initial_amount, $category_id);
        
            if ($stmt->execute()) {
                $serviceMsg = "✅ Service added successfully!";
            } else {
                $serviceMsg = "❌ Error: " . $stmt->error;
            }
            $stmt->close();
        } else {
            $serviceMsg = "⚠️ All fields for service are required and must be valid.";
        }
    }

    // Add Category
    if (isset($_POST['add_category'])) {
        $category_name = trim($_POST['category_name']);
        if ($category_name) {
            $stmt = $conn->prepare("INSERT INTO categories (name) VALUES (?)");
            $stmt->bind_param("s", $category_name);
            if ($stmt->execute()) {
                $categoryMsg = "✅ Category added successfully!";
            } else {
                $categoryMsg = "❌ Error: " . $stmt->error;
            }
            $stmt->close();
        } else {
            $categoryMsg = "⚠️ Category name cannot be empty.";
        }
    }

    // Add Transport Service
    if (isset($_POST['add_transport_service'])) {
        $from = trim($_POST['from_destination']);
        $to = trim($_POST['to_destination']);
        $price = floatval($_POST['price']);

        if ($from && $to && $price >= 0) {
            $stmt = $conn->prepare("INSERT INTO transport_services (from_destination, to_destination, price, created_at) VALUES (?, ?, ?, NOW())");
            $stmt->bind_param("ssd", $from, $to, $price);
            if ($stmt->execute()) {
                $_SESSION['transport_msg'] = "✅ Transport Service added successfully!";
            } else {
                $_SESSION['transport_msg'] = "❌ Error: " . $stmt->error;
            }
            $stmt->close();
        } else {
            $_SESSION['transport_msg'] = "⚠️ All fields are required and must be valid.";
        }
        header("Location: add-service.php");
        exit();
    }

    // Import Transport Excel
    if (isset($_POST['import_transport_excel']) && isset($_FILES['transport_file'])) {
        $file = $_FILES['transport_file']['tmp_name'];

        require_once '../vendor/autoload.php';

        try {
            $spreadsheet = \PhpOffice\PhpSpreadsheet\IOFactory::load($file);
            $sheet = $spreadsheet->getActiveSheet();
            $rows = $sheet->toArray();

            $successCount = 0;
            $errorCount = 0;

            foreach ($rows as $index => $row) {
                if ($index === 0) continue; // skip header

                $from = trim($row[0]);
                $to = trim($row[1]);
                $price = floatval($row[2]);

                if ($from && $to && $price >= 0) {
                    // Check for existing entry
                    $checkStmt = $conn->prepare("SELECT id FROM transport_services WHERE from_destination = ? AND to_destination = ? AND price = ?");
                    $checkStmt->bind_param("ssd", $from, $to, $price);
                    $checkStmt->execute();
                    $checkStmt->store_result();

                    if ($checkStmt->num_rows === 0) {
                        // Insert if not duplicate
                        $stmt = $conn->prepare("INSERT INTO transport_services (from_destination, to_destination, price, created_at) VALUES (?, ?, ?, NOW())");
                        $stmt->bind_param("ssd", $from, $to, $price);
                        if ($stmt->execute()) {
                            $successCount++;
                        } else {
                            $errorCount++;
                        }
                        $stmt->close();
                    } else {
                        $errorCount++; // Already exists
                    }

                    $checkStmt->close();
                }
            }

            $_SESSION['transport_msg'] = "✅ Imported: $successCount rows, ❌ Skipped: $errorCount duplicate(s)";
        } catch (Exception $e) {
            $_SESSION['transport_msg'] = "❌ Error importing file: " . $e->getMessage();
        }

        header("Location: add-service.php");
        exit();
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
  select {
  width: 100%;
  padding: 12px 14px;
  border: 1.5px solid #d7e0eb;
  border-radius: 8px;
  font-size: 16px;
  margin-top: 6px;
  transition: border-color 0.3s ease;
}
select:focus {
  border-color: #457b9d;
  outline: none;
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
            <a href="add-service.php" class="active"><i class="fas fa-plus-circle"></i> Add Service</a>
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
  <h2>Add Service & Category</h2>
  <div style="display: flex; flex-wrap: wrap; gap: 30px;">
    
    <!-- Add Service Form -->
    <div style="flex: 1; min-width: 280px;">
      <?php if ($serviceMsg): ?>
        <div class="general-error"><?= htmlspecialchars($serviceMsg) ?></div>
      <?php endif; ?>

      <form method="POST">
        <input type="hidden" name="add_service" value="1" />
        <label for="product_name">Product Name</label>
        <input type="text" name="product_name" id="product_name" required />

        <label for="problem_description">Problem Description</label>
        <textarea name="problem_description" id="problem_description" rows="4" required style="width: 100%; height: 120px;"></textarea>
        
        <label for="category_id">Select Category</label>
        <select name="category_id" id="category_id" required>
          <option value="">-- Select Category --</option>
          <?php foreach ($category_options as $cat): ?>
            <option value="<?= $cat['id'] ?>"><?= htmlspecialchars($cat['name']) ?></option>
          <?php endforeach; ?>
        </select>

        <label for="initial_amount">Initial Amount (₹)</label>
        <input type="number" step="0.01" name="initial_amount" id="initial_amount" required />

        <button type="submit">Add Service</button>
      </form>
    </div>

    <!-- Add Category Form -->
    <div style="flex: 1; min-width: 280px;">
      <?php if ($categoryMsg): ?>
        <div class="general-error"><?= htmlspecialchars($categoryMsg) ?></div>
      <?php endif; ?>

      <form method="POST">
        <input type="hidden" name="add_category" value="1" />
        <label for="category_name">Category Name</label>
        <input type="text" name="category_name" id="category_name" required />

        <button type="submit">Add Category</button>
      </form>
    </div>

<!-- Add Transport Service Form -->
<div style="flex: 1; min-width: 280px;">
  <h2 style="margin-top: 40px;">Add Transport Service</h2>
  <?php if (!empty($_SESSION['transport_msg'])): ?>
    <div class="general-error"><?= htmlspecialchars($_SESSION['transport_msg']) ?></div>
    <?php unset($_SESSION['transport_msg']); ?>
  <?php endif; ?>

  <form method="POST">
    <input type="hidden" name="add_transport_service" value="1" />

    <label for="from_destination">From Destination</label>
    <input type="text" name="from_destination" id="from_destination" required />

    <label for="to_destination">To Destination</label>
    <input type="text" name="to_destination" id="to_destination" required />

    <label for="price">Price (₹)</label>
    <input type="number" step="0.01" name="price" id="price" required />

    <button type="submit">Add Transport Service</button>
  </form>
</div>

<!-- Upload Excel for Transport Services -->
<div style="flex: 1; min-width: 280px;">
  <h2 style="margin-top: 40px;">Import Transport via Excel</h2>
  <form method="POST" enctype="multipart/form-data">
    <input type="hidden" name="import_transport_excel" value="1" />
    <label for="transport_file">Select Excel File (.xlsx or .csv)</label>
    <input type="file" name="transport_file" id="transport_file" accept=".xlsx,.csv" required />
    <button type="submit">Import File</button>
  </form>
</div>

<!-- Rename Location Form -->
<div style="flex: 1; min-width: 280px;">
  <h2 style="margin-top: 40px;">Rename Location</h2>
  <?php if (!empty($_SESSION['rename_msg'])): ?>
    <div class="general-error"><?= htmlspecialchars($_SESSION['rename_msg']) ?></div>
    <?php unset($_SESSION['rename_msg']); ?>
  <?php endif; ?>

  <form method="POST">
    <input type="hidden" name="rename_location" value="1" />

    <label for="old_location">Old Location Name</label>
    <input type="text" name="old_location" id="old_location" placeholder="e.g. Naya Bazar Chowk" required />

    <label for="new_location">New Location Name</label>
    <input type="text" name="new_location" id="new_location" placeholder="e.g. Bazar Square" required />

    <button type="submit">Rename Location</button>
  </form>
</div>

<!-- Update Transport Price Form -->
<div style="flex: 1; min-width: 280px;">
  <h2 style="margin-top: 40px;">Update Route Price</h2>
  <?php if (!empty($_SESSION['edit_price_msg'])): ?>
    <div class="general-error"><?= htmlspecialchars($_SESSION['edit_price_msg']) ?></div>
    <?php unset($_SESSION['edit_price_msg']); ?>
  <?php endif; ?>

  <?php if (!empty($_SESSION['edit_price_data'])): 
    $data = $_SESSION['edit_price_data']; ?>
    
    <!-- Show price update form -->
    <form method="POST">
      <input type="hidden" name="update_price" value="1" />

      <label for="from_destination">From Destination</label>
      <input type="text" name="from_destination" id="from_destination" value="<?= htmlspecialchars($data['from']) ?>" readonly />

      <label for="to_destination">To Destination</label>
      <input type="text" name="to_destination" id="to_destination" value="<?= htmlspecialchars($data['to']) ?>" readonly />

      <label for="new_price">New Price (Old: ₹<?= htmlspecialchars($data['price']) ?>)</label>
      <input type="number" step="0.01" name="new_price" id="new_price" value="<?= htmlspecialchars($data['price']) ?>" required />

      <button type="submit">Update Price</button>
    </form>

  <?php else: ?>

    <!-- Initial search form -->
    <form method="POST">
      <input type="hidden" name="fetch_price" value="1" />

      <label for="from_destination">From Destination</label>
      <input type="text" name="from_destination" id="from_destination" required />

      <label for="to_destination">To Destination</label>
      <input type="text" name="to_destination" id="to_destination" required />

      <button type="submit">Fetch Price</button>
    </form>

  <?php endif; ?>
</div>


  </div>
</main>
  </div>
</body>
</html>
