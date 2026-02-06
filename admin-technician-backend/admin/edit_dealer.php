<?php
require '../config.php';
session_start();
if (!isset($_SESSION['admin'])) {
    header("Location: index.php");
    exit();
}

$id = $_GET['id'] ?? null;
if (!$id || !is_numeric($id)) {
    header("Location: manage_dealer.php");
    exit();
}

$error = '';
$success = '';

// Fetch existing Dealer data
$stmt = $conn->prepare("SELECT * FROM dealer WHERE id = ?");
$stmt->bind_param("i", $id);
$stmt->execute();
$Dealer = $stmt->get_result()->fetch_assoc();

if (!$Dealer) {
    header("Location: manage_dealer.php");
    exit();
}

// Handle form submit
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $name    = trim($_POST['name'] ?? '');
    $email   = trim($_POST['email'] ?? '');
    $phone   = trim($_POST['phone'] ?? '');
    $address = trim($_POST['address'] ?? '');

    if (empty($name) || empty($email)) {
        $error = "Name and Email are required.";
    } elseif (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
        $error = "Invalid email format.";
    } elseif (!empty($phone) && !preg_match('/^\d{10}$/', $phone)) {
        $error = "Phone number must be exactly 10 digits.";
    } else {
        // ✅ Step 1: Check duplicate in users table
        $checkUser = $conn->prepare("SELECT id FROM users WHERE (email = ? OR phone = ?)");
        $checkUser->bind_param("ss", $email, $phone);
        $checkUser->execute();
        $checkUser->store_result();

        if ($checkUser->num_rows > 0) {
            $error = "Customer already exists with this phone number or email.";
        }
        $checkUser->close();

        // ✅ Step 2: Check duplicate in dealer table (excluding current dealer)
        if (empty($error)) {
            $checkDealer = $conn->prepare("SELECT id FROM dealer WHERE (email = ? OR phone = ?) AND id != ?");
            $checkDealer->bind_param("ssi", $email, $phone, $id);
            $checkDealer->execute();
            $checkDealer->store_result();

            if ($checkDealer->num_rows > 0) {
                $error = "Another dealer already exists with this phone number or email.";
            }
            $checkDealer->close();
        }

        // ✅ Step 3: Update Dealer if no errors
        if (empty($error)) {
            $stmt = $conn->prepare("UPDATE dealer SET name = ?, email = ?, phone = ?, address = ? WHERE id = ?");
            $stmt->bind_param("ssssi", $name, $email, $phone, $address, $id);

            if ($stmt->execute()) {
                $success = "Dealer updated successfully.";
                // Refresh Dealer data after update
                $Dealer = [
                    'name'    => $name,
                    'email'   => $email,
                    'phone'   => $phone,
                    'address' => $address
                ];
            } else {
                $error = "Failed to update Dealer.";
            }
        }
    }
}
?>

<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <title>Edit Dealer</title>
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
    input[type="text"], input[type="email"] {
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
  </style>
</head>
<body>

  <h2>Edit Dealer</h2>

  <form method="POST" action="">
    <label for="name">Name *</label>
    <input type="text" id="name" name="name" required value="<?= htmlspecialchars($Dealer['name']) ?>" />

    <label for="email">Email *</label>
    <input type="email" id="email" name="email" required value="<?= htmlspecialchars($Dealer['email']) ?>" />

    <label for="phone">Phone</label>
    <input type="text" id="phone" name="phone" value="<?= htmlspecialchars($Dealer['phone'] ?? '') ?>" />

    <label for="address">Address</label>
    <input type="text" id="address" name="address" value="<?= htmlspecialchars($Dealer['address'] ?? '') ?>" />

    <button type="submit">Update Dealer</button>

    <?php if ($error): ?>
      <div class="message error"><?= htmlspecialchars($error) ?></div>
    <?php endif; ?>
    <?php if ($success): ?>
      <div class="message success"><?= htmlspecialchars($success) ?></div>
    <?php endif; ?>
  </form>

  <a href="manage_dealer.php" class="back-link">&larr; Back to Dealer List</a>

</body>
</html>
