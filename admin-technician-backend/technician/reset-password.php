<?php
session_start();
require '../config.php';

$error = '';
$success = '';
$name = '';

// Redirect if session expired
if (!isset($_SESSION['reset_email'])) {
    header('Location: forget-password.php');
    exit;
}

$email = $_SESSION['reset_email'];

// Fetch technician name
$stmt = $conn->prepare("SELECT name FROM techniciam WHERE email = ?");
$stmt->bind_param("s", $email);
$stmt->execute();
$stmt->bind_result($name);
$stmt->fetch();
$stmt->close();

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $password = $_POST['password'];
    $confirm  = $_POST['confirm'];

    if (strlen($password) < 6) {
        $error = "Password must be at least 6 characters.";
    } elseif ($password !== $confirm) {
        $error = "Passwords do not match.";
    } else {
        $hashed = password_hash($password, PASSWORD_DEFAULT);
        $stmt = $conn->prepare("UPDATE techniciam SET password = ? WHERE email = ?");
        $stmt->bind_param("ss", $hashed, $email);

        if ($stmt->execute()) {
            $success = "✅ Password successfully updated. You can now <a href='index.php' class='login-link'>Login In</a>.";
            session_destroy();
        } else {
            $error = "Something went wrong. Please try again.";
        }
    }
}
?>

<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Reset Password - Service App</title>
  <link href="https://fonts.googleapis.com/css2?family=Orbitron:wght@500&family=Quicksand:wght@500&display=swap" rel="stylesheet" />
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/css/all.min.css" />
  <link rel="icon" type="image/png" href="/favicon-96x96.png" sizes="96x96" />
<link rel="icon" type="image/svg+xml" href="/favicon.svg" />
<link rel="shortcut icon" href="/favicon.ico" />
<link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
<meta name="apple-mobile-web-app-title" content="Bettiah Service" />
  <style>
    * { box-sizing: border-box; }

    body {
      margin: 0;
      font-family: 'Quicksand', sans-serif;
      background: #f5f9ff;
      display: flex;
      justify-content: center;
      align-items: center;
      min-height: 100vh;
      padding: 15px;
    }

    .otp-container {
      background: #ffffff;
      border-radius: 14px;
      box-shadow: 0 10px 25px rgba(100, 100, 150, 0.1);
      max-width: 420px;
      width: 100%;
      padding: 40px 35px 50px;
      text-align: center;
    }

    .otp-header {
      font-family: 'Orbitron', sans-serif;
      font-weight: 600;
      font-size: 28px;
      color: #1d3557;
      margin-bottom: 6px;
      display: flex;
      justify-content: center;
      align-items: center;
      gap: 10px;
    }

    .otp-header i {
      font-size: 30px;
      color: #457b9d;
    }

    .tagline {
      font-size: 14px;
      color: #6c7a89;
      margin-bottom: 28px;
      font-weight: 500;
    }

    .input-group {
      position: relative;
      margin-bottom: 18px;
      text-align: left;
    }

    .input-group .icon {
      position: absolute;
      top: 50%;
      left: 14px;
      transform: translateY(-50%);
      color: #a1b1c2;
      font-size: 18px;
      pointer-events: none;
    }

    .input-group input {
      width: 100%;
      padding: 13px 15px 13px 42px;
      font-size: 16px;
      border-radius: 10px;
      border: 1.8px solid #d7e0eb;
      outline: none;
      color: #34495e;
      background-color: #f9fbfe;
      transition: border-color 0.25s ease;
      font-weight: 500;
    }

    .input-group input:focus {
      border-color: #457b9d;
      background-color: #fff;
      box-shadow: 0 0 8px rgba(69, 123, 157, 0.3);
    }
    
    .toggle-password {
      position: absolute;
      top: 50%;
      right: 12px;
      transform: translateY(-50%);
      cursor: pointer;
      color: #a1b1c2;
      font-size: 18px;
      user-select: none;
    }
    
    .toggle-password:hover {
      color: #457b9d;
    }

    button.verify-btn {
      width: 100%;
      padding: 14px;
      font-size: 18px;
      font-weight: 700;
      color: white;
      background: linear-gradient(90deg, #1d3557 0%, #457b9d 100%);
      border: none;
      border-radius: 12px;
      cursor: pointer;
      transition: background 0.3s ease, transform 0.25s ease;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 10px;
    }

    button.verify-btn:hover {
      background: linear-gradient(90deg, #457b9d 0%, #1d3557 100%);
      transform: scale(1.03);
    }

    .error-message {
      background-color: #ffe0e0;
      border: 1px solid #ff5c5c;
      padding: 12px 15px;
      border-radius: 8px;
      color: #900;
      margin-bottom: 20px;
      font-weight: 600;
      text-align: left;
    }

    .success {
      background-color: #e0ffe6;
      border: 1px solid #2ecc71;
      padding: 12px 15px;
      border-radius: 8px;
      color: #2c662d;
      margin-bottom: 20px;
      font-weight: 600;
      text-align: left;
    }
    
    .success a.login-link {
      color: #457b9d;
      text-decoration: none;
      font-weight: bold;
      transition: color 0.3s ease, text-decoration 0.3s ease;
    }
    
    .success a.login-link:hover {
      color: #1d3557;
      text-decoration: underline;
    }

    @media (max-width: 480px) {
      .otp-container { padding: 30px 20px 40px; }
      .otp-header { font-size: 24px; }
      button.verify-btn { font-size: 16px; }
    }
  </style>
</head>
<body>
  <main class="otp-container">
    <div class="otp-header">
      <i class="fas fa-lock"></i>
      <span>Reset Password</span>
    </div>
    <p class="tagline">Welcome back, <strong><?php echo htmlspecialchars($name); ?></strong>!</p>

    <?php if ($error): ?>
      <div class="error-message">
        <?php echo htmlspecialchars($error); ?>
      </div>
    <?php endif; ?>

    <?php if ($success): ?>
      <div class="success"><?php echo $success; ?></div>
    <?php else: ?>
      <form method="post">
        <div class="input-group">
          <i class="fas fa-key icon"></i>
          <input type="password" name="password" id="passwordInput1" placeholder="New Password" required />
          <i class="fas fa-eye toggle-password" id="togglePassword1" aria-label="Toggle password visibility" role="button" tabindex="0"></i>
        </div>
        
        <div class="input-group">
          <i class="fas fa-key icon"></i>
          <input type="password" name="confirm" id="passwordInput2" placeholder="Confirm Password" required />
          <i class="fas fa-eye toggle-password" id="togglePassword2" aria-label="Toggle password visibility" role="button" tabindex="0"></i>
        </div>
        <button class="verify-btn" type="submit">
          <i class="fas fa-check-circle"></i> Update Password
        </button>
      </form>
    <?php endif; ?>
  </main>
</body>
<script>
  function setupToggle(toggleId, inputId) {
    const toggle = document.getElementById(toggleId);
    const input = document.getElementById(inputId);

    toggle.addEventListener('click', () => {
      const type = input.getAttribute('type') === 'password' ? 'text' : 'password';
      input.setAttribute('type', type);
      toggle.classList.toggle('fa-eye');
      toggle.classList.toggle('fa-eye-slash');
    });

    toggle.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        toggle.click();
      }
    });
  }

  setupToggle('togglePassword1', 'passwordInput1');
  setupToggle('togglePassword2', 'passwordInput2');
</script>
</html>
