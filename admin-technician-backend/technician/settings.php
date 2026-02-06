<?php
session_start();
require '../config.php';

require '../vendor/phpmailer/phpmailer/src/PHPMailer.php';
require '../vendor/phpmailer/phpmailer/src/SMTP.php';
require '../vendor/phpmailer/phpmailer/src/Exception.php';

use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\Exception;

if (!isset($_SESSION['techniciam_id'])) {
    header("Location: index.php");
    exit();
}

$technician_id = $_SESSION['techniciam_id'];
$success = $error = "";
$otp_sent = false;

$stmt = $conn->prepare("SELECT * FROM techniciam WHERE id = ?");
$stmt->bind_param("i", $technician_id);
$stmt->execute();
$result = $stmt->get_result();
$technician = $result->fetch_assoc();
$stmt->close();

function send_otp_email($to_email, $otp) {
    $mail = new PHPMailer(true);

    try {
        $mail->isSMTP();
        $mail->Host       = 'smtp.hostinger.com';
        $mail->SMTPAuth   = true;
        $mail->Username   = 'no-reply@technde.in';
        $mail->Password   = 'TechNDE@7873';
        $mail->SMTPSecure = 'tls';
        $mail->Port       = 587;

        $mail->setFrom('no-reply@technde.in', 'Technde Support');
        $mail->addAddress($to_email);

        $mail->isHTML(true);
        $mail->Subject = 'Your OTP for Email Verification';
        $mail->Body    = "<p>Your OTP to verify your email change is: <b>$otp</b></p>
                          <p>If you did not request this, please ignore this email.</p>";
        $mail->AltBody = "Your OTP to verify your email change is: $otp";

        $mail->send();
        return true;
    } catch (Exception $e) {
        error_log("Mailer Error: " . $mail->ErrorInfo);
        return false;
    }
}

// Handle POST
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    if (isset($_POST['verify_otp'])) {
        $input_otp = trim($_POST['otp'] ?? '');

        if ($input_otp === '') {
            $_SESSION['error'] = "Please enter the OTP sent to your email.";
        } elseif (!isset($_SESSION['email_otp'], $_SESSION['new_email'], $_SESSION['pending_data'])) {
            $_SESSION['error'] = "No OTP session found. Please try updating your email again.";
        } else {
            if ($input_otp === (string)$_SESSION['email_otp']) {
                $pending = $_SESSION['pending_data'];
                $email = $_SESSION['new_email'];

                if ($pending['password'] !== '') {
                    $hashed_password = password_hash($pending['password'], PASSWORD_DEFAULT);
                    $stmt = $conn->prepare("UPDATE techniciam SET name = ?, email = ?, phone = ?, address = ?, upi_id = ?, password = ? WHERE id = ?");
                    $stmt->bind_param("ssssssi", $pending['name'], $email, $pending['phone'], $pending['address'], $pending['upi_id'], $hashed_password, $technician_id);
                } else {
                    $stmt = $conn->prepare("UPDATE techniciam SET name = ?, email = ?, phone = ?, address = ?, upi_id = ? WHERE id = ?");
                    $stmt->bind_param("sssssi", $pending['name'], $email, $pending['phone'], $pending['address'], $pending['upi_id'], $technician_id);
                }

                if ($stmt->execute()) {
                    $_SESSION['success'] = "Email verified and profile updated successfully.";
                    unset($_SESSION['email_otp'], $_SESSION['new_email'], $_SESSION['pending_data']);
                } else {
                    $_SESSION['error'] = "Database error while updating profile.";
                }
                $stmt->close();
            } else {
                $_SESSION['error'] = "Invalid OTP. Please try again.";
            }
        }

        header("Location: settings.php");
        exit();
    } else {
        $name     = trim($_POST['name'] ?? '');
        $email    = trim($_POST['email'] ?? '');
        $phone    = trim($_POST['phone'] ?? '');
        $address  = trim($_POST['address'] ?? '');
        $upi_id   = trim($_POST['upi_id'] ?? '');
        $password = $_POST['password'] ?? '';

        if (!preg_match('/^\d{10}$/', $phone)) {
            $_SESSION['error'] = "Phone number must be exactly 10 digits.";
        } elseif ($name === "" || $email === "" || $phone === "" || $address === "" || $upi_id === "") {
            $_SESSION['error'] = "All fields except password are required.";
        } else {
            if ($email !== $technician['email']) {
                $otp = random_int(100000, 999999);
                if (send_otp_email($email, $otp)) {
                    $_SESSION['email_otp'] = $otp;
                    $_SESSION['new_email'] = $email;
                    $_SESSION['pending_data'] = [
                        'name' => $name,
                        'phone' => $phone,
                        'address' => $address,
                        'upi_id' => $upi_id,
                        'password' => $password
                    ];
                    $_SESSION['otp_sent'] = true;
                    $_SESSION['success'] = "OTP sent to your new email. Please verify below to update your email.";
                } else {
                    $_SESSION['error'] = "Failed to send OTP email. Please try again later.";
                }
            } else {
                if ($password !== '') {
                    $hashed_password = password_hash($password, PASSWORD_DEFAULT);
                    $stmt = $conn->prepare("UPDATE techniciam SET name = ?, email = ?, phone = ?, address = ?, upi_id = ?, password = ? WHERE id = ?");
                    $stmt->bind_param("ssssssi", $name, $email, $phone, $address, $upi_id, $hashed_password, $technician_id);
                } else {
                    $stmt = $conn->prepare("UPDATE techniciam SET name = ?, email = ?, phone = ?, address = ?, upi_id = ? WHERE id = ?");
                    $stmt->bind_param("sssssi", $name, $email, $phone, $address, $upi_id, $technician_id);
                }

                if ($stmt->execute()) {
                    $_SESSION['success'] = "Profile updated successfully.";
                } else {
                    $_SESSION['error'] = "Something went wrong. Try again.";
                }
                $stmt->close();
            }
        }

        header("Location: settings.php");
        exit();
    }
}

// Get flash messages and OTP state
if (isset($_SESSION['success'])) {
    $success = $_SESSION['success'];
    unset($_SESSION['success']);
}
if (isset($_SESSION['error'])) {
    $error = $_SESSION['error'];
    unset($_SESSION['error']);
}
if (isset($_SESSION['otp_sent'])) {
    $otp_sent = true;
    unset($_SESSION['otp_sent']);
}
?>
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>Technician Settings</title>
  <link href="https://fonts.googleapis.com/css2?family=Orbitron:wght@600&family=Quicksand:wght@500&display=swap" rel="stylesheet" />
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/css/all.min.css" />
  <link rel="icon" type="image/png" href="/favicon-96x96.png" sizes="96x96" />
  <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
  <link rel="shortcut icon" href="/favicon.ico" />
  <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
  <meta name="apple-mobile-web-app-title" content="Bettiah Service" />
  <style>
    :root {
      --primary: #1d3557;
      --accent: #e76f51;
      --bg: #fdfcfb;
      --text-dark: #2c3e50;
    }

    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
      font-family: 'Quicksand', sans-serif;
    }

    body {
      background: var(--bg);
      color: var(--text-dark);
      min-height: 100vh;
      display: flex;
      flex-direction: column;
    }

    header {
      background: white;
      padding: 20px;
      text-align: center;
      font-family: 'Orbitron', sans-serif;
      font-size: 28px;
      color: var(--primary);
      letter-spacing: 1px;
      box-shadow: 0 4px 12px rgba(0,0,0,0.05);
      position: sticky;
      top: 0;
      z-index: 10;
    }

    .sidebar-toggle {
      display: none;
      background: var(--accent);
      color: white;
      padding: 10px 14px;
      font-size: 20px;
      cursor: pointer;
      position: fixed;
      top: 20px;
      left: 20px;
      z-index: 1001;
      border-radius: 8px;
      box-shadow: 0 5px 15px rgba(0,0,0,0.2);
    }

    .container {
      display: flex;
      flex: 1;
      min-height: calc(100vh - 60px); /* Account for header height */
    }

    .sidebar {
      width: 240px;
      background: #ffffff;
      border-right: 1.5px solid #e0e6ed;
      padding: 30px 20px;
      display: flex;
      flex-direction: column;
      gap: 14px;
      transition: transform 0.3s ease-in-out;
    }

    .sidebar-header {
      font-size: 18px;
      font-weight: 700;
      color: var(--primary);
      display: flex;
      align-items: center;
      gap: 10px;
      margin-bottom: 30px;
      font-family: 'Orbitron', sans-serif;
    }

    .sidebar a {
      display: flex;
      align-items: center;
      gap: 14px;
      text-decoration: none;
      font-weight: 600;
      padding: 12px 16px;
      color: var(--text-dark);
      border-radius: 10px;
      transition: background 0.25s ease, color 0.25s ease;
    }

    .sidebar a:hover,
    .sidebar a.active {
      background: var(--accent);
      color: white;
    }

    .main {
      flex: 1;
      padding: 40px 30px;
      overflow-y: auto;
      max-width: 720px;
      margin: auto;
      background: #fff;
      border-radius: 15px;
      box-shadow: 0 4px 12px rgba(0,0,0,0.06);
    }

    .main h2 {
      font-family: 'Orbitron', sans-serif;
      font-size: 26px;
      margin-bottom: 30px;
      color: var(--primary);
      text-align: center;
    }

    label {
      font-weight: 600;
      color: var(--primary);
      display: block;
      margin-bottom: 6px;
      margin-top: 18px;
    }

    input[type="text"],
    input[type="email"],
    input[type="password"],
    textarea {
      width: 100%;
      padding: 10px 12px;
      border: 1.5px solid #ccc;
      border-radius: 10px;
      font-size: 16px;
      transition: border-color 0.3s ease;
      font-family: 'Quicksand', sans-serif;
      resize: vertical;
    }

    input[type="text"]:focus,
    input[type="email"]:focus,
    input[type="password"]:focus,
    textarea:focus {
      outline: none;
      border-color: var(--accent);
    }

    button {
      background: var(--accent);
      color: white;
      border: none;
      margin-top: 28px;
      padding: 14px;
      font-size: 18px;
      border-radius: 12px;
      cursor: pointer;
      font-weight: 700;
      width: 100%;
      transition: background 0.3s ease;
      font-family: 'Orbitron', sans-serif;
    }

    button:hover {
      background: #d65a3a;
    }

    .success {
      background: #d4edda;
      color: #155724;
      border-left: 5px solid #28a745;
      border-radius: 8px;
      padding: 15px 20px;
      margin-bottom: 20px;
      font-weight: 600;
    }

    .error {
      background: #f8d7da;
      color: #721c24;
      border-left: 5px solid #f44336;
      border-radius: 8px;
      padding: 15px 20px;
      margin-bottom: 20px;
      font-weight: 600;
    }

    @media (max-width: 768px) {
      .sidebar {
        position: fixed;
        top: 0;
        left: 0;
        height: 100%;
        transform: translateX(-100%);
        z-index: 1000;
        padding-top: 80px;
      }

      .sidebar.active {
        transform: translateX(0);
      }

      .sidebar-toggle {
        display: block;
      }

      .main {
        max-width: 100%;
        margin: 15px 15px 15px 15px;
        padding: 30px 20px;
        border-radius: 15px;
      }

      header {
        padding-left: 60px;
      }
    }

    @media (max-width: 480px) {
      button {
        font-size: 20px;
        padding: 16px;
      }
    }
  </style>
</head>
<body>

<div class="sidebar-toggle" id="sidebarToggle">
  <i class="fas fa-bars"></i>
</div>

<header>Technician Dashboard</header>

<div class="container">
  <div class="sidebar" id="sidebar">
    <div class="sidebar-header">
      <i class="fas fa-toolbox"></i>
      <span>Technician</span>
    </div>
    <a href="dashboard.php"><i class="fas fa-chart-line"></i> Dashboard</a>
    <a href="assigned-orders.php"><i class="fas fa-list-check"></i> Assigned Orders</a>
    <a href="complete-order.php"><i class="fas fa-check-circle"></i> Mark as Completed</a>
    <a href="upi-generator.php"><i class="fas fa-qrcode"></i> UPI Generator</a>
    <a href="settings.php" class="active"><i class="fas fa-user-cog"></i> Settings</a>
    <a href="privacy/"><i class="fas fa-file-contract"></i> Privacy Policy</a>
    <a href="logout.php"><i class="fas fa-sign-out-alt"></i> Logout</a>
  </div>

  <div class="main">
    <h2>Technician Settings</h2>

    <?php if (!empty($success)): ?>
      <div class="success"><?= htmlspecialchars($success) ?></div>
    <?php endif; ?>

    <?php if (!empty($error)): ?>
      <div class="error"><?= htmlspecialchars($error) ?></div>
    <?php endif; ?>

    <?php if (!empty($otp_sent)): ?>
      <form method="POST" autocomplete="off">
        <label>Enter OTP sent to your new email</label>
        <input type="text" name="otp" maxlength="6" pattern="\d{6}" required placeholder="6-digit OTP" />
        <button type="submit" name="verify_otp">Verify OTP</button>
      </form>
    <?php else: ?>
      <form method="POST" autocomplete="off">
        <label>Name</label>
        <input type="text" name="name" value="<?= htmlspecialchars($technician['name'] ?? '') ?>" required />

        <label>Email</label>
        <input type="email" name="email" value="<?= htmlspecialchars($technician['email'] ?? '') ?>" required />

        <label>Phone Number</label>
        <input type="text" name="phone" value="<?= htmlspecialchars($technician['phone'] ?? '') ?>" maxlength="10" pattern="\d{10}" title="Phone number must be 10 digits" required />

        <label>Address</label>
        <textarea name="address" rows="3" required><?= htmlspecialchars($technician['address'] ?? '') ?></textarea>

        <label>UPI ID</label>
        <input type="text" name="upi_id" value="<?= htmlspecialchars($technician['upi_id'] ?? '') ?>" placeholder="example@upi" required />

        <label>New Password (leave blank to keep current)</label>
        <input type="password" name="password" placeholder="Enter new password" />

        <button type="submit">Update Settings</button>
      </form>
    <?php endif; ?>
  </div>
</div>

<script>
  const sidebarToggle = document.getElementById('sidebarToggle');
  const sidebar = document.getElementById('sidebar');

  sidebarToggle.addEventListener('click', () => {
    sidebar.classList.toggle('active');
  });
</script>

</body>
</html>
