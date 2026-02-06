<?php
require '../config.php';
session_start();

if (!isset($_SESSION['admin'])) {
    header("Location: index.php");
    exit();
}

$msg = "";
$search = $_GET['search'] ?? '';
$search_param = "%$search%";

// Add Category
if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_POST['category_name'])) {
    $category_name = trim($_POST['category_name']);
    if (!empty($category_name)) {
        $stmt = $conn->prepare("INSERT INTO categories (name) VALUES (?)");
        $stmt->bind_param("s", $category_name);
        if ($stmt->execute()) {
            $msg = "✅ Category added successfully!";
        } else {
            $msg = "❌ Error adding category.";
        }
        $stmt->close();
    } else {
        $msg = "⚠️ Category name cannot be empty.";
    }
}

// Delete Category
if (isset($_GET['delete']) && is_numeric($_GET['delete'])) {
    $delete_id = (int)$_GET['delete'];
    $conn->query("DELETE FROM categories WHERE id = $delete_id");
    header("Location: manage_category.php");
    exit();
}

// Fetch Categories
$stmt = $conn->prepare("SELECT * FROM categories WHERE name LIKE ? ORDER BY name ASC");
$stmt->bind_param("s", $search_param);
$stmt->execute();
$result = $stmt->get_result();
?>
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Manage Categories</title>
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
    .main {
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
    form.search-form {
      margin-bottom: 20px;
      display: flex;
      gap: 8px;
      flex-wrap: wrap;
    }
    form.search-form input[type="text"] {
      padding: 10px;
      flex: 1 1 250px;
      border: 1.5px solid #d7e0eb;
      border-radius: 8px;
      font-size: 16px;
      transition: border-color 0.3s ease;
    }
    form.search-form input[type="text"]:focus {
      border-color: #457b9d;
      outline: none;
    }
    form.search-form button {
      padding: 10px 20px;
      font-size: 16px;
      border: none;
      background-color: #1d3557;
      color: white;
      border-radius: 8px;
      cursor: pointer;
      font-weight: 600;
      transition: background 0.3s ease;
    }
    form.search-form button:hover {
      background-color: #457b9d;
    }
    .table-container {
      background: #ffffff;
      border-radius: 16px;
      padding: 20px;
      box-shadow: 0 6px 18px rgba(0,0,0,0.05);
    }
    table {
      width: 100%;
      border-collapse: collapse;
    }
    thead {
      background: #1d3557;
      color: white;
      border-radius: 16px 16px 0 0;
    }
    th, td {
      text-align: left;
      padding: 14px 20px;
      border-bottom: 1.5px solid #e5e7eb;
    }
    tbody tr:hover {
      background-color: #e7f0fb;
      transition: background 0.3s ease;
    }
    .no-data {
      text-align: center;
      padding: 30px 0;
      color: #999;
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
    /* Pagination */
    .pagination {
      margin-top: 30px;
      text-align: center;
    }
    .pagination a {
      margin: 0 6px;
      text-decoration: none;
      color: #1d3557;
      padding: 8px 14px;
      border-radius: 8px;
      border: 1.5px solid transparent;
      font-weight: 600;
      user-select: none;
      transition: all 0.3s ease;
      display: inline-block;
      min-width: 40px;
      text-align: center;
    }
    .pagination a.active,
    .pagination a:hover {
      background-color: #1d3557;
      color: white;
      border-color: #1d3557;
    }
    @media (max-width: 768px) {
      .container {
        flex-direction: column;
      }
      .sidebar {
        width: 100%;
        flex-direction: row;
        justify-content: space-around;
        padding: 20px 10px;
        border-right: none;
        border-bottom: 1px solid #ccc;
      }
      .sidebar a {
        flex: 1;
        text-align: center;
        padding: 10px;
        font-size: 14px;
      }
      .logout-btn {
        margin-top: 0;
      }
      .main {
        padding: 20px;
        overflow-x: auto;
      }
      form.search-form {
        flex-direction: column;
      }
      form.search-form input[type="text"],
      form.search-form button {
        width: 100%;
        margin: 5px 0;
      }
      table, thead, tbody, th, td, tr {
        font-size: 14px;
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
            <a href="add_dealer.php"><i class="fas fa-user-plus"></i> Add Dealer</a>
        </div>
    
        <!-- Manage Section -->
        <div class="sidebar-heading" onclick="toggleMenu('manageMenu')">⚙️ Manage</div>
        <div class="submenu" id="manageMenu">
            <a href="manage_services.php"><i class="fas fa-tools"></i> Manage Services</a>
            <a href="manage_users.php"><i class="fas fa-users"></i> Manage Users</a>
            <a href="manage_technician.php"><i class="fas fa-user-cog"></i> Manage Technician</a>
            <a href="manage_dealer.php"><i class="fas fa-user-cog"></i> Manage Dealer</a>
            <a href="manage_category.php" class="active"><i class="fas fa-sitemap"></i> Manage Category</a>
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

    <main class="main">
      <h2>Service List</h2>

      <form method="GET" class="search-form" action="">
        <input type="text" name="search" placeholder="Search by name or email" value="<?= htmlspecialchars($search) ?>" />
        <button type="submit">Search</button>
      </form>

      <div class="table-container">
      <table>
        <thead>
          <tr>
        <th>#</th>
        <th>Category Name</th>
        <th>Action</th>
          </tr>
        </thead>
        <tbody>
          <?php if ($result && $result->num_rows > 0): ?>
            <?php $i = $offset + 1; while ($row = $result->fetch_assoc()): ?>
              <tr>
            <td><?= $i++ ?></td>
            <td><?= htmlspecialchars($row['name']) ?></td>
                <td>
                  <a href="edit_category.php?id=<?= $row['id'] ?>" title="Edit"><i class="fas fa-edit"></i></a>
                  &nbsp;
                  <a href="delete_category.php?id=<?= $row['id'] ?>" title="Delete" onclick="return confirm('Are you sure you want to delete this service?')"><i class="fas fa-trash-alt"></i></a>
                </td>
              </tr>
            <?php endwhile; ?>
          <?php else: ?>
            <tr>
              <td colspan="6" class="no-data">No services found.</td>
            </tr>
          <?php endif; ?>
        </tbody>
      </table>
    </div>

    <?php if ($total_pages > 1): ?>
      <div class="pagination">
        <?php for ($i = 1; $i <= $total_pages; $i++): ?>
          <a href="?page=<?= $i ?><?= $search ? '&search=' . urlencode($search) : '' ?>" class="<?= ($i === $page) ? 'active' : '' ?>">
            <?= $i ?>
          </a>
        <?php endfor; ?>
      </div>
    <?php endif; ?>

</body>
</html>
