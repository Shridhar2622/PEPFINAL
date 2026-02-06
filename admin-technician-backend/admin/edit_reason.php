<?php
require '../config.php';
session_start();

// Check admin session
if (!isset($_SESSION['admin'])) {
    header("Location: index.php");
    exit();
}

// Check if ID is provided
if (!isset($_GET['id']) || !is_numeric($_GET['id'])) {
    echo "Invalid request.";
    exit();
}

$id = intval($_GET['id']);
$reason = '';
$error = '';
$success = '';

// Fetch existing reason
$stmt = $conn->prepare("SELECT reason FROM amount_reasons WHERE id = ?");
$stmt->bind_param("i", $id);
$stmt->execute();
$result = $stmt->get_result();

if ($result->num_rows === 0) {
    echo "Reason not found.";
    exit();
}

$row = $result->fetch_assoc();
$reason = $row['reason'];

// Handle form submission
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $updated_reason = trim($_POST['reason']);

    if (empty($updated_reason)) {
        $error = "Reason cannot be empty.";
    } else {
        $stmt = $conn->prepare("UPDATE amount_reasons SET reason = ? WHERE id = ?");
        $stmt->bind_param("si", $updated_reason, $id);

        if ($stmt->execute()) {
            $success = "Reason updated successfully!";
            $reason = $updated_reason;
        } else {
            $error = "Something went wrong. Try again.";
        }
    }
}
?>

<!DOCTYPE html>
<html>
<head>
  <title>Edit Reason</title>
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/css/all.min.css" />
  <link rel="icon" type="image/png" href="/favicon-96x96.png" sizes="96x96" />
<link rel="icon" type="image/svg+xml" href="/favicon.svg" />
<link rel="shortcut icon" href="/favicon.ico" />
<link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
<meta name="apple-mobile-web-app-title" content="Bettiah Service" />
<link rel="manifest" href="/site.webmanifest" />
  <style>
    body {
      font-family: 'Segoe UI', sans-serif;
      background: #f8fafc;
      padding: 40px;
    }
    .form-box {
      max-width: 500px;
      margin: auto;
      background: white;
      padding: 30px;
      border-radius: 10px;
      box-shadow: 0 4px 12px rgba(0,0,0,0.1);
    }
    h2 {
      margin-bottom: 20px;
      color: #1d3557;
    }
    input[type="text"] {
      width: 100%;
      padding: 12px;
      margin-bottom: 20px;
      border: 1.5px solid #ccc;
      border-radius: 8px;
      font-size: 16px;
    }
    button {
      background: #1d3557;
      color: white;
      padding: 12px 20px;
      border: none;
      border-radius: 8px;
      font-size: 16px;
      cursor: pointer;
    }
    button:hover {
      background: #457b9d;
    }
    .message {
      padding: 10px 15px;
      border-radius: 8px;
      margin-bottom: 20px;
    }
    .error {
      background: #f8d7da;
      color: #721c24;
    }
    .success {
      background: #d4edda;
      color: #155724;
    }
  </style>
</head>
<body>

  <div class="form-box">
    <h2>Edit Reason</h2>

    <?php if ($error): ?>
      <div class="message error"><?= htmlspecialchars($error) ?></div>
    <?php elseif ($success): ?>
      <div class="message success"><?= htmlspecialchars($success) ?></div>
    <?php endif; ?>

    <form method="POST">
      <input type="text" name="reason" value="<?= htmlspecialchars($reason) ?>" placeholder="Enter updated reason" />
      <button type="submit"><i class="fas fa-save"></i> Update Reason</button>
    </form>

    <br><a href="manage_reason.php" style="text-decoration:none; color:#1d3557;">← Back to Reason List</a>
  </div>

</body>
</html>
