<?php
require '../config.php';
session_start();

if (!isset($_SESSION['admin'])) {
    header("Location: index.php");
    exit();
}

$id = $_GET['id'] ?? null;

if (!$id || !is_numeric($id)) {
    header("Location: manage_services.php");
    exit();
}

$id = (int)$id;

// Fetch categories
$categories = [];
$cat_result = $conn->query("SELECT id, name FROM categories ORDER BY name");
while ($row = $cat_result->fetch_assoc()) {
    $categories[] = $row;
}

// Fetch service data
$stmt = $conn->prepare("SELECT * FROM services WHERE id = ?");
$stmt->bind_param("i", $id);
$stmt->execute();
$result = $stmt->get_result();
$service = $result->fetch_assoc();
$stmt->close();

if (!$service) {
    $_SESSION['message'] = "Service not found.";
    header("Location: manage_services.php");
    exit();
}

// Handle update
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $product_name = trim($_POST['product_name']);
    $problem_description = trim($_POST['problem_description']);
    $initial_amount = (float)$_POST['initial_amount'];
    $category_id = (int)$_POST['category_id'];

    $stmt = $conn->prepare("UPDATE services SET product_name = ?, problem_description = ?, initial_amount = ?, category_id = ? WHERE id = ?");
    $stmt->bind_param("ssdii", $product_name, $problem_description, $initial_amount, $category_id, $id);
    $stmt->execute();
    $stmt->close();

    $success = "Service Details updated successfully.";
}
?>

<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <title>Edit Service</title>
  <link href="https://fonts.googleapis.com/css2?family=Orbitron:wght@500&family=Quicksand:wght@500&display=swap" rel="stylesheet" />
  <link rel="icon" type="image/png" href="/favicon-96x96.png" sizes="96x96" />
<link rel="icon" type="image/svg+xml" href="/favicon.svg" />
<link rel="shortcut icon" href="/favicon.ico" />
<link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
<meta name="apple-mobile-web-app-title" content="Bettiah Service" />
<link rel="manifest" href="/site.webmanifest" />
  <style>
    body {
      font-family: 'Quicksand', sans-serif;
      background: #f5f8fa;
      padding: 40px;
      max-width: 600px;
      margin: auto;
      color: #2d3142;
    }
    h2 {
      font-family: 'Orbitron', sans-serif;
      color: #1d3557;
    }
    form {
      background: white;
      padding: 30px;
      border-radius: 12px;
      box-shadow: 0 4px 14px rgba(0,0,0,0.1);
    }
    label {
      display: block;
      margin-top: 15px;
      font-weight: 600;
    }
    input[type="text"], input[type="number"], textarea {
      width: 100%;
      padding: 10px;
      margin-top: 6px;
      border: 1px solid #ccc;
      border-radius: 8px;
      font-size: 16px;
    }
    button {
      margin-top: 25px;
      padding: 12px 25px;
      background-color: #1d3557;
      color: white;
      font-size: 16px;
      border: none;
      border-radius: 8px;
      cursor: pointer;
    }
    button:hover {
      background-color: #457b9d;
    }
    .message {
      margin-top: 15px;
      font-weight: 600;
    }
    .error {
      color: #dc3545;
    }
    .success {
      color: #2a9d8f;
    }
    a.back-link {
      display: inline-block;
      margin-top: 20px;
      color: #1d3557;
      text-decoration: none;
      font-weight: 600;
    }
    a.back-link:hover {
      text-decoration: underline;
    }
    select {
  width: 100%;
  padding: 10px;
  margin-top: 6px;
  border: 1px solid #ccc;
  border-radius: 8px;
  font-size: 16px;
}

  </style>
</head>
<body>
  <div class="container">
    <h2>Edit Service</h2>
    <form method="POST">
      <label for="product_name">Product Name:</label>
      <input type="text" name="product_name" id="product_name" value="<?= htmlspecialchars($service['product_name']) ?>" required />

      <label for="problem_description">Problem Description:</label>
      <textarea name="problem_description" id="problem_description" rows="4" required><?= htmlspecialchars($service['problem_description']) ?></textarea>

        <label for="category_id">Category:</label>
        <select name="category_id" id="category_id" required>
          <option value="">-- Select Category --</option>
          <?php foreach ($categories as $cat): ?>
            <option value="<?= $cat['id'] ?>" <?= ($cat['id'] == $service['category_id']) ? 'selected' : '' ?>>
              <?= htmlspecialchars($cat['name']) ?>
            </option>
          <?php endforeach; ?>
        </select>

      <label for="initial_amount">Initial Amount (₹):</label>
      <input type="number" step="0.01" name="initial_amount" id="initial_amount" value="<?= htmlspecialchars($service['initial_amount']) ?>" required />

      <button type="submit">Update Service</button>
      
    <?php if ($error): ?>
      <div class="message error"><?= htmlspecialchars($error) ?></div>
    <?php endif; ?>
    <?php if ($success): ?>
      <div class="message success"><?= htmlspecialchars($success) ?></div>
    <?php endif; ?>
    </form>
  <a href="manage_services.php" class="back-link">&larr; Back to Service List</a>  </div>
</body>
</html>
