<?php
require '../config.php';
session_start();

if (!isset($_SESSION['admin'])) {
    header("Location: index.php");
    exit();
}

// Total customers
$sql_customer = "SELECT COUNT(*) as total_customer FROM users";
$result = $conn->query($sql_customer);
$total_customer = $result->fetch_assoc()['total_customer'] ?? 0;

// Total orders
$sql_total = "SELECT COUNT(*) as total_orders FROM orders";
$result = $conn->query($sql_total);
$total_orders = $result->fetch_assoc()['total_orders'] ?? 0;

// Pending + assigned orders
$sql_pending = "SELECT COUNT(*) as pending_requests FROM orders WHERE status IN ('pending', 'assigned')";
$result = $conn->query($sql_pending);
$pending_requests = $result->fetch_assoc()['pending_requests'] ?? 0;

// Canceled orders
$sql_canceled = "SELECT COUNT(*) as canceled_requests FROM orders WHERE status = 'canceled'";
$result = $conn->query($sql_canceled);
$canceled_requests = $result->fetch_assoc()['canceled_requests'] ?? 0;

// Completed orders
$sql_completed = "SELECT COUNT(*) as completed_requests FROM orders WHERE status = 'done'";
$result = $conn->query($sql_completed);
$completed_requests = $result->fetch_assoc()['completed_requests'] ?? 0;

// Technician locations
function getLatestTechnicianLocations($conn) {
    $query = "
        SELECT t1.*
        FROM salesman_locations t1
        INNER JOIN (
            SELECT salesman_name, MAX(last_updated) AS max_updated
            FROM salesman_locations
            GROUP BY salesman_name
        ) t2 ON t1.salesman_name = t2.salesman_name AND t1.last_updated = t2.max_updated
        ORDER BY t1.salesman_name ASC
    ";
    $result = mysqli_query($conn, $query);
    $locations = [];
    while ($row = mysqli_fetch_assoc($result)) {
        $locations[] = $row;
    }
    return $locations;
}

if (isset($_GET['salesman_name'])) {
    $name = mysqli_real_escape_string($conn, $_GET['salesman_name']);
    $query = "SELECT * FROM salesman_locations WHERE salesman_name = '$name' ORDER BY last_updated DESC";
    $result = mysqli_query($conn, $query);
    $locations = [];
    while ($row = mysqli_fetch_assoc($result)) {
        $locations[] = $row;
    }
    header('Content-Type: application/json');
    echo json_encode($locations);
    exit;
}

$salesman_locations = getLatestTechnicianLocations($conn);

if (isset($_GET['get_salesman_locations']) && $_GET['get_salesman_locations'] == '1') {
    header('Content-Type: application/json');
    echo json_encode(getLatestTechnicianLocations($conn));
    exit;
}
?>

<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Admin Dashboard</title>
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
    
    .cards {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
      gap: 30px;
    }

    .card {
      background: #ffffff;
      padding: 24px;
      border-radius: 16px;
      box-shadow: 0 6px 18px rgba(0, 0, 0, 0.05);
      transition: transform 0.3s ease, background 0.3s ease;
      border: 1.5px solid #d7e0eb;
    }

    .card:hover {
      transform: scale(1.04);
      background: #e7f0fb;
    }

    .card h3 {
      font-size: 18px;
      margin-bottom: 10px;
      color: #2d3142;
    }

    .card p {
      font-size: 26px;
      font-weight: bold;
      color: #1d3557;
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

      .main {
        padding: 20px;
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
        <a href="dashboard.php" class="active"><i class="fas fa-tachometer-alt"></i> Dashboard</a>
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

    <div class="main">
      <div class="cards">
        <div class="card">
          <h3>Total Customers</h3>
          <p><?php echo $total_customer; ?></p>
        </div>
        <div class="card">
          <h3>Pending Orders</h3>
          <p><?php echo $pending_requests; ?></p>
        </div>
        <div class="card">
          <h3>Canceld Orders</h3>
          <p><?php echo $canceled_requests; ?></p>
        </div>
        <div class="card">
          <h3>Completed Orders</h3>
          <p><?php echo $completed_requests; ?></p>
        </div>
      </div>
              <!-- Technician Tracking Card -->
      <div class="projects" style="margin-top: 40px;">
        <div class="card">
          <div class="card-header">
            <h3>Technician Locations</h3>
          </div>
          <script>
            const technicianLocations = <?php echo json_encode($salesman_locations); ?>;
          </script>
          <div style="display: flex; gap: 20px; margin-top: 20px; flex-wrap: wrap;">
            <div style="width: 250px;">
              <h4>Technician List</h4>
              <ul id="technicianList" style="list-style: none; padding: 0; margin: 0;"></ul>
            </div>
            <div style="flex-grow: 1;">
              <div id="technicianMap" style="height: 400px; width: 100%; border: 1px solid #ccc;"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>

  <!-- Google Maps Script -->
<script src="https://maps.googleapis.com/maps/api/js?key=AIzaSyC8TN9VDsbGTigt_mPPKaadeOGkui3TBtA"></script>
<script>
  const technicianListContainer = document.getElementById('technicianList');
  let technicianMap;
  let technicianMarkers = [];
  let currentTechnicianLocations = [];

  function initTechnicianMap() {
    technicianMap = new google.maps.Map(document.getElementById("technicianMap"), {
      center: { lat: 20.5937, lng: 78.9629 },
      zoom: 5,
    });
  }

  function clearMarkers() {
    technicianMarkers.forEach(marker => marker.setMap(null));
    technicianMarkers = [];
  }

  function showAllTechniciansOnMap() {
    clearMarkers();
    const bounds = new google.maps.LatLngBounds();

    currentTechnicianLocations.forEach(loc => {
      const position = {
        lat: parseFloat(loc.latitude),
        lng: parseFloat(loc.longitude)
      };
      const marker = new google.maps.Marker({
        position,
        map: technicianMap,
        title: loc.salesman_name
      });

      const info = new google.maps.InfoWindow({
        content: `<strong>${loc.salesman_name}</strong><br>${loc.last_updated}`
      });

      marker.addListener('click', () => {
        info.open(technicianMap, marker);
      });

      technicianMarkers.push(marker);
      bounds.extend(position);
    });

    if (!bounds.isEmpty()) {
      technicianMap.fitBounds(bounds);
    }
  }

  function showSingleTechnicianLatestLocation(name) {
    const technician = currentTechnicianLocations.find(t => t.salesman_name === name);
    if (!technician) return;

    clearMarkers();

    const position = {
      lat: parseFloat(technician.latitude),
      lng: parseFloat(technician.longitude)
    };

    const marker = new google.maps.Marker({
      position,
      map: technicianMap,
      title: technician.salesman_name
    });

    const info = new google.maps.InfoWindow({
      content: `<strong>${technician.salesman_name}</strong><br>${technician.last_updated}`
    });

    marker.addListener('click', () => {
      info.open(technicianMap, marker);
    });

    technicianMarkers.push(marker);
    technicianMap.setCenter(position);
    technicianMap.setZoom(14);
  }

  function renderTechnicianList() {
    technicianListContainer.innerHTML = "";

    // All technicians option
    const allLi = document.createElement("li");
    allLi.style.cursor = "pointer";
    allLi.style.padding = "10px";
    allLi.style.borderBottom = "1px solid #ddd";
    allLi.style.fontWeight = "bold";
    allLi.style.backgroundColor = "#eef6ff";
    allLi.textContent = "📍 All Technicians";
    allLi.addEventListener("click", showAllTechniciansOnMap);
    technicianListContainer.appendChild(allLi);

    // Individual technicians
    currentTechnicianLocations.forEach(tech => {
      const li = document.createElement("li");
      li.style.cursor = "pointer";
      li.style.padding = "10px";
      li.style.borderBottom = "1px solid #ddd";
      li.textContent = tech.salesman_name;
      li.addEventListener("click", () => {
        showSingleTechnicianLatestLocation(tech.salesman_name);
      });
      technicianListContainer.appendChild(li);
    });
  }

  function fetchLatestTechnicianLocations() {
    fetch('?get_salesman_locations=1')
      .then(response => response.json())
      .then(data => {
        const seen = new Set();
        currentTechnicianLocations = data.filter(t => {
          if (seen.has(t.salesman_name)) return false;
          seen.add(t.salesman_name);
          return true;
        });
        renderTechnicianList();
      });
  }

  window.addEventListener('load', () => {
    const seen = new Set();
    currentTechnicianLocations = technicianLocations.filter(t => {
      if (seen.has(t.salesman_name)) return false;
      seen.add(t.salesman_name);
      return true;
    });

    initTechnicianMap();
    renderTechnicianList();
    setInterval(fetchLatestTechnicianLocations, 30000);
  });
</script>

</body>
</html>
