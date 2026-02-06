<?php
require '../config.php';
session_start();

if (!isset($_SESSION['admin'])) {
    header("Location: index.php");
    exit();
}

// Search term
$search = $_GET['search'] ?? '';

// Pagination setup
$limit = 10;
$page = isset($_GET['page']) && is_numeric($_GET['page']) ? (int)$_GET['page'] : 1;
$offset = ($page - 1) * $limit;

// Count and fetch orders based on search
if (!empty($search)) {
    $search_param = "%$search%";

    // Updated count statement with JOINs and more fields in WHERE clause
    $stmt_count = $conn->prepare("SELECT COUNT(*) AS total FROM transport_orders 
        JOIN users ON transport_orders.customer_id = users.id 
        WHERE 
            transport_orders.product_name LIKE ? OR 
            transport_orders.problem_description LIKE ? OR 
            users.name LIKE ? OR 
            users.phone LIKE ? OR 
            users.address LIKE ? OR 
            transport_orders.customer_note LIKE ? OR 
            transport_orders.technician_note LIKE ?");
    $stmt_count->bind_param("sssssss", $search_param, $search_param, $search_param, $search_param, $search_param, $search_param, $search_param);
    $stmt_count->execute();
    $total_records = $stmt_count->get_result()->fetch_assoc()['total'];
    $stmt_count->close();

    // Fetch matching records with same criteria
    $stmt = $conn->prepare("SELECT 
                                transport_orders.*, 
                                users.name AS customer_name, 
                                users.phone AS customer_phone, 
                                users.address AS customer_address,
                                amount_reasons.reason AS extra_reason
                            FROM transport_orders 
                            JOIN users ON transport_orders.customer_id = users.id 
                            LEFT JOIN amount_reasons ON transport_orders.extra_reason_id = amount_reasons.id
                            WHERE 
                                transport_orders.product_name LIKE ? OR 
                                transport_orders.problem_description LIKE ? OR 
                                users.name LIKE ? OR 
                                users.phone LIKE ? OR 
                                users.address LIKE ? OR 
                                transport_orders.customer_note LIKE ? OR 
                                transport_orders.technician_note LIKE ?
                            ORDER BY transport_orders.id DESC 
                            LIMIT ? OFFSET ?");
    $stmt->bind_param("ssssssssi", $search_param, $search_param, $search_param, $search_param, $search_param, $search_param, $search_param, $limit, $offset);
    $stmt->execute();
    $result = $stmt->get_result();
} else {
    // No search term
    $total_records = $conn->query("SELECT COUNT(*) AS total FROM transport_orders")->fetch_assoc()['total'];
    $result = $conn->query("SELECT 
                                transport_orders.*, 
                                users.name AS customer_name, 
                                users.phone AS customer_phone, 
                                users.address AS customer_address,
                                amount_reasons.reason AS extra_reason
                            FROM transport_orders 
                            JOIN users ON transport_orders.customer_id = users.id 
                            LEFT JOIN amount_reasons ON transport_orders.extra_reason_id = amount_reasons.id
                            ORDER BY transport_orders.id DESC 
                            LIMIT $limit OFFSET $offset");
}

// Fetch technicians
$technicians = [];
$tech_result = $conn->query("
    SELECT t.id, t.name, r.name AS role_name 
    FROM techniciam t 
    LEFT JOIN roles r ON t.role_id = r.id
");
while ($row = $tech_result->fetch_assoc()) {
    $technicians[] = $row;
}

// Pagination
$total_pages = ceil($total_records / $limit);
?>

<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8" />
<title>Manage Orders</title>
<link href="https://fonts.googleapis.com/css2?family=Orbitron:wght@500&family=Quicksand:wght@500&display=swap" rel="stylesheet" />
<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/css/all.min.css" />
<link rel="icon" type="image/png" href="/favicon-96x96.png" sizes="96x96" />
<link rel="icon" type="image/svg+xml" href="/favicon.svg" />
<link rel="shortcut icon" href="/favicon.ico" />
<link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
<meta name="apple-mobile-web-app-title" content="Bettiah Service" />
<link rel="manifest" href="/site.webmanifest" />
</head>
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
/* Container for horizontal scroll if स्क्रीन narrow हो */
.table-container {
  background: #ffffff;
  border-radius: 16px;
  padding: 20px;
  box-shadow: 0 6px 18px rgba(0,0,0,0.05);
  overflow-x: auto;
}

/* Table basic */
.table-container table {
  width: 100%;
  min-width: 800px;         /* कम से कम चौड़ाई */
  border-collapse: separate;
  border-spacing: 0;
}

/* Header row */
.table-container thead th {
  position: sticky;
  top: 0;
  background: #1d3557;
  color: #ffffff;
  padding: 12px 15px;
  text-align: left;
  z-index: 2;
}

/* Header corner-radius */
.table-container thead th:first-child {
  border-radius: 16px 0 0 0;
}
.table-container thead th:last-child {
  border-radius: 0 16px 0 0;
}

/* Body cells */
.table-container tbody td {
  padding: 12px 15px;
  border-bottom: 1px solid #e5e7eb;
  vertical-align: middle;
}

/* Zebra stripes */
.table-container tbody tr:nth-child(even) {
  background-color: #f3f6f9;
}

/* Hover effect */
.table-container tbody tr:hover {
  background-color: #e7f0fb;
  transition: background 0.3s ease;
}

/* Footer corner-radius */
.table-container tbody tr:last-child td:first-child {
  border-radius: 0 0 0 16px;
}
.table-container tbody tr:last-child td:last-child {
  border-radius: 0 0 16px 0;
}

/* No-data row */
.table-container .no-data {
  text-align: center;
  color: #999;
  padding: 30px 0;
}

.assign-form {
  display: flex;
  flex-direction: column;
  gap: 6px;
  max-width: 180px;
}

.assign-form select {
  padding: 8px 10px;
  font-size: 14px;
  border: 1.5px solid #d0d7e2;
  border-radius: 6px;
  background-color: #fff;
  color: #333;
  transition: border-color 0.3s ease;
}

.assign-form select:focus {
  outline: none;
  border-color: #457b9d;
}

.assign-form button {
  padding: 8px 12px;
  font-size: 14px;
  border: none;
  background-color: #1d3557;
  color: white;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 600;
  transition: background 0.3s ease;
}

.assign-form button:hover {
  background-color: #457b9d;
}

.cancel-btn {
  padding: 8px 12px;
  background-color: #e63946;
  color: white;
  border: none;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.3s ease;
}

.cancel-btn:hover {
  background-color: #c92a3e;
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
    
    .pagination {
  margin-top: 20px;
  text-align: center;
}

.pagination a {
  display: inline-block;
  margin: 0 5px;
  padding: 8px 12px;
  text-decoration: none;
  background-color: #f2f2f2;
  border-radius: 5px;
  color: #333;
  transition: background-color 0.3s ease;
}

.pagination a:hover {
  background-color: #ddd;
}

.pagination a.active {
  background-color: #007BFF;
  color: #fff;
  font-weight: bold;
}

  </style>
<body>
<header>
    🚀 Admin Dashboard - Reservice
</header>

  <div class="container">
    <div class="sidebar">
        <a href="dashboard.php"><i class="fas fa-tachometer-alt"></i> Dashboard</a>
        <a href="all_transport_orders.php" class="active"><i class="fas fa-clipboard-list"></i> All Transport Orders</a>
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
    
    <main class="main">
        <h2>Order List</h2>

        <form method="GET" class="search-form">
            <input type="text" name="search" placeholder="Search by Any Thing" value="<?= htmlspecialchars($search) ?>" />
            <button type="submit">Search</button>
        </form>

        <div class="table-container">
            <table>
                <thead>
                    <tr>
                        <th>#</th>
                        <th>Customer Name</th>
                        <th>Customer Phone</th>
                        <th>Customer Address</th>
                        <th>Product Name</th>
                        <th>Problem Description</th>
                        <th>From Destination</th>
                        <th>To Destination</th>
                        <th>Service Date</th>
                        <th>Completed Date</th>
                        <th>Customer Note</th>
                        <th>Status</th>
                        <th>Technician</th>
                        <th>Initial Amount</th>
                        <th>Final Amount</th>
                        <th>Extra Reason</th>
                        <th>Technician Note</th>
                        <th>Bill Image</th>
                        <th>Rating</th>
                        <th>Review</th>
                        <th>Created At</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    <?php if ($result && $result->num_rows > 0): ?>
                        <?php $i = $offset + 1; while ($row = $result->fetch_assoc()): ?>
                            <tr>
                                <td><?= $row['id'] ?></td>
                                <td><?= htmlspecialchars($row['customer_name']) ?></td>
                                <td><?= htmlspecialchars($row['customer_phone']) ?></td>
                                <td><?= htmlspecialchars($row['customer_address']) ?></td>
                                <td><?= htmlspecialchars($row['product_name']) ?></td>
                                <td><?= htmlspecialchars($row['problem_description']) ?></td>
                                <td><?= htmlspecialchars($row['from_destination']) ?></td>
                                <td><?= htmlspecialchars($row['to_destination']) ?></td>
                                <td><?= htmlspecialchars($row['preferred_date']) ?></td>
                                <td><?= htmlspecialchars($row['completed_at']) ?></td>
                                <td><?= htmlspecialchars($row['customer_note']) ?></td>
                                <td><?= htmlspecialchars($row['status']) ?></td>
                                <td>
                                    <?php
                                    if ($row['status'] == 'assigned' || $row['status'] == 'done') {
                                        $tech_id = $row['technician_id'];
                                        $tech_name = '';
                                        foreach ($technicians as $tech) {
                                            if ($tech['id'] == $tech_id) {
                                                $tech_name = $tech['name'] . ' - ' . $tech['role_name'];
                                                break;
                                            }
                                        }
                                        echo htmlspecialchars($tech_name);
                                    } elseif ($row['status'] == 'pending') {
                                        ?>
                                        <form method="POST" action="transport_assign_order.php" class="assign-form">
                                          <input type="hidden" name="order_id" value="<?= $row['id'] ?>" />
                                          <select name="technician_id" required>
                                            <option value="">Select Technician</option>
                                            <?php foreach ($technicians as $tech): ?>
                                              <option value="<?= $tech['id'] ?>">
                                               <?= htmlspecialchars($tech['name'] . ' - ' . $tech['role_name']) ?>
                                              </option>
                                            <?php endforeach; ?>
                                          </select>
                                          <button type="submit">Assign</button>
                                        </form>
                                        <?php
                                    } else {
                                        echo '-';
                                    }
                                    ?>
                                </td>
                                <td><?= htmlspecialchars($row['initial_amount']) ?></td>
                                <td><?= htmlspecialchars($row['final_amount']) ?></td>
                                <td><?= htmlspecialchars($row['extra_reason'] ?? '-') ?></td>
                                <td><?= htmlspecialchars($row['technician_note']) ?></td>
                                <td>
                                    <?php if (!empty($row['bill_image'])): ?>
                                        <a href="../<?= htmlspecialchars($row['bill_image']) ?>" target="_blank">View</a>
                                    <?php else: ?>
                                        -
                                    <?php endif; ?>
                                </td>
                                <td><?= htmlspecialchars($row['rating']) ?></td>
                                <td><?= htmlspecialchars($row['review']) ?></td>
                                <td><?= date("d M Y", strtotime($row['created_at'])) ?></td>
                                <td>
                                    <?php if ($row['status'] === 'pending'): ?>
                                        <form method="POST" action="transport_cancel_order.php" onsubmit="return confirm('Are you sure you want to cancel this order?');">
                                            <input type="hidden" name="order_id" value="<?= $row['id'] ?>" />
                                            <button type="submit" class="cancel-btn">Cancel</button>
                                        </form>
                                    <?php elseif ($row['status'] === 'assigned'): ?>
                                        <form method="POST" action="transport_remove_assignment.php" onsubmit="return confirm('Remove technician assignment and set back to pending?');">
                                            <input type="hidden" name="order_id" value="<?= $row['id'] ?>" />
                                            <button type="submit" class="cancel-btn">Remove Assigned</button>
                                        </form>
                                    <?php else: ?>
                                        -
                                    <?php endif; ?>
                                </td>
                            </tr>
                        <?php endwhile; ?>
                    <?php else: ?>
                        <tr>
                            <td colspan="15" class="no-data">No orders found.</td>
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
    </main>
</div>
</body>
</html>
