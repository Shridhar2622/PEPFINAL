<?php
session_start();
@include '../config.php';

if (!isset($_SESSION['admin'])) {
    header("Location: index.html");
    exit();
}

// Fetch admin data for profile display if needed
if (isset($_SESSION['admin_email'])) {
    $query = "SELECT created_at, profile_image FROM admin WHERE email = ?";
    $stmt = mysqli_prepare($conn, $query);
    mysqli_stmt_bind_param($stmt, "s", $_SESSION['admin_email']);
    mysqli_stmt_execute($stmt);
    $result = mysqli_stmt_get_result($stmt);

    // Fetch the data
    if ($result) {
        $data = mysqli_fetch_assoc($result);
        $created_at = $data['created_at'];
        $created_at_date = date('Y-m-d', strtotime($created_at)); // Format date
        $profile_image = $data['profile_image'];
    } else {
        echo "Error: " . mysqli_error($conn);
    }

    mysqli_stmt_close($stmt);
}

$limit = 500;
$page = isset($_GET['page']) ? intval($_GET['page']) : 1;
if ($page < 1) $page = 1;

$offset = ($page - 1) * $limit;

// Count total rows
$countResult = $conn->query("SELECT COUNT(*) AS total FROM salesman_locations");
$totalRows = $countResult->fetch_assoc()['total'];
$totalPages = ceil($totalRows / $limit);

// Fetch latest rows (ordered by id DESC)
$sql = "SELECT * FROM salesman_locations ORDER BY id DESC LIMIT $limit OFFSET $offset";
$result = $conn->query($sql);


if (isset($_GET['delete'])) {
    $location_id = intval($_GET['delete']);

    $delete_sql = "DELETE FROM salesman_locations WHERE id = ?";
    $stmt = $conn->prepare($delete_sql);
    $stmt->bind_param("i", $location_id);
    if ($stmt->execute()) {
        $_SESSION['message'] = "Location deleted successfully.";
    } else {
        $_SESSION['message'] = "Error deleting location.";
    }
    $stmt->close();

    header("Location: salesman-locations.php"); // renamed file
    exit();
}


// Close the database connection
$conn->close();
?>

<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Salesman Locations</title>
    <link rel="stylesheet" href="admin.css"> <!-- Your custom admin styles -->
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.15.4/css/all.min.css">
    <style>
        .container {
            max-width: 100%;
            margin: 50px auto;
            padding: 20px;
            border: 1px solid #ccc;
            border-radius: 10px;
            box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
        }

        .d-flex {
            display: flex;
        }

        .justify-content-between {
            justify-content: space-between;
        }

        .align-items-center {
            align-items: center;
        }

        .btn-import,
        .btn-add {
            font-size: 14px;
            text-decoration: none;
            padding: 8px 15px;
            border-radius: 8px;
            transition: background-color 0.3s ease;
        }

        .btn-import {
            background-color: #343a40; /* Blue for Import Items */
            color: white;
        }

        .btn-add {
            background-color: #343a40; /* Dark grey for Add New Item */
            color: white;
        }

        .btn-import:hover {
            background-color: #555;
        }

        .btn-add:hover {
            background-color: #555;
        }

        table {
            width: 100%;
            border-collapse: collapse;
            margin: 20px 0;
        }
        table, th, td {
            border: 1px solid #ccc;
        }
        th, td {
            padding: 10px;
            text-align: center;
        }
        th {
            background-color: #f4f4f4;
        }
        .btn {
            padding: 5px 10px;
            border: none;
            border-radius: 8px;
            cursor: pointer;
            text-decoration: none;
        }
        .btn-map {
            background-color: #4CAF50;
            color: white;
        }
        .btn-delete {
            background-color: #f44336;
            color: white;
        }
        .btn-map:hover {
            background-color: #45a049;
        }
        .btn-delete:hover {
            background-color: #e53935;
        }
        .message {
            background-color: #f8d7da;
            color: #721c24;
            padding: 10px;
            margin-bottom: 15px;
            border-radius: 5px;
            text-align: center;
        }
    </style>
</head>
<body>

<div id="sidebar" class="sidebar">
    <div class="sidebar-brand">
        <h2><i class="fas fa-user-cog"></i> NEW DEV</h2>
    </div>
    <div class="sidebar-menu">
        <ul>
            <li><a href="dashboard.php"><i class="fas fa-tachometer-alt"></i><span>Dashboard</span></a></li>
            <li><a href="sales.php"><i class="fas fa-shopping-cart"></i><span>Sales</span></a></li>
            <li><a href="receipt.php"><i class="fas fa-receipt"></i><span>Receipt</span></a></li>
            <li><a href="order.php"><i class="fas fa-warehouse"></i><span>Order</span></a></li>
            <li><a href="under-maintenance.html"><i class="fas fa-comments"></i><span>Messaging</span></a></li>
            <li><a href="reports.php"><i class="fas fa-chart-bar"></i><span>Reports</span></a></li>
            <li><a href="add-customer.php"><i class="fas fa-user-plus"></i><span>Add Customer</span></a></li>
            <li><a href="add-salesman.php"><i class="fas fa-user-secret"></i><span>Add Salesman</span></a></li>
            <li><a href="add-item.php"><i class="fas fa-plus"></i><span>Add Item</span></a></li>
            <li><a href="add-areas.php"><i class="fas fa-plus-square"></i><span>Add Areas</span></a></li>
            <li><a href="salesman-locations.php" class="active"><i class="fas fa-plus-square"></i><span>Salesman Locations</span></a></li>
            <li><a href="settings.php"><i class="fas fa-cog"></i><span>Settings</span></a></li>
        </ul>
    </div>
</div>

<div class="main-content">
    <header>
        <h2>
            <label for="nav-toggle" id="nav-toggle">
                <i class="fas fa-bars"></i>
            </label>
            Salesman Locations
        </h2>
        <div class="user-wrapper" id="user-wrapper">
            <img src="<?php echo $profile_image; ?>" width="40px" height="40px" alt="User">
            <div>
                <h4><?php echo $_SESSION['admin']; ?></h4>
            </div>
        </div>
        <div class="popup" id="user-popup">
            <div class="popup-content">
                <img src="<?php echo htmlspecialchars($profile_image ?? ''); ?>" width="50px" height="50px" alt="User">
                <h4>NEW DEV ENTERPRISES</h4>
                <p>CREATED ON: <?php echo htmlspecialchars($created_at_date ?? ''); ?></p>
                <p>ROLE: STORE ADMIN</p>
                <button onclick="window.location.href='profile.php'">Profile</button>
                <button onclick="window.location.href='logout.php'">Sign out</button>
            </div>
        </div>
    </header>

    <main>
        <div class="container">
            <h2 class="d-flex justify-content-between align-items-center">
                <?php if ($page > 1): ?>
                    <a href="?page=<?php echo $page - 1; ?>" class="btn-import">Previous</a>
                <?php else: ?>
                    <span class="btn-import" style="opacity:0.5;pointer-events:none;">Previous</span>
                <?php endif; ?>
            
                <span>List of Locations (Page <?php echo $page; ?> of <?php echo $totalPages; ?>)</span>
            
                <?php if ($page < $totalPages): ?>
                    <a href="?page=<?php echo $page + 1; ?>" class="btn-add">Next</a>
                <?php else: ?>
                    <span class="btn-add" style="opacity:0.5;pointer-events:none;">Next</span>
                <?php endif; ?>
            </h2>
            <?php if (isset($_SESSION['message'])): ?>
                <div class="message"><?php echo htmlspecialchars($_SESSION['message']); ?></div>
                <?php unset($_SESSION['message']); ?>
            <?php endif; ?>
            <table>
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>Salesman Name</th>
                        <th>Latitude</th>
                        <th>Longitude</th>
                        <th>Last Updated</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    <?php while ($row = $result->fetch_assoc()): ?>
                        <tr>
                            <td><?php echo $row['id']; ?></td>
                            <td><?php echo htmlspecialchars($row['salesman_name']); ?></td>
                            <td><?php echo htmlspecialchars($row['latitude']); ?></td>
                            <td><?php echo htmlspecialchars($row['longitude']); ?></td>
                            <td><?php echo htmlspecialchars($row['last_updated']); ?></td>
                            <td>
                                <a href="https://www.google.com/maps?q=<?php echo $row['latitude']; ?>,<?php echo $row['longitude']; ?>" target="_blank" class="btn btn-map">Open Map</a>
                                <a href="?delete=<?php echo $row['id']; ?>" onclick="return confirm('Are you sure you want to delete this location?');" class="btn btn-delete">Delete</a>
                            </td>
                        </tr>
                    <?php endwhile; ?>
                </tbody>
            </table>
        </div>
    </main>
</div>

<script src="admin.js"></script>
</body>
</html>
