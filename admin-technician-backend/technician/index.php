<?php
require '../config.php';

session_start(); // Add this at the very top, before any HTML or logic

// ✅ Redirect if already logged in
if (isset($_SESSION['techniciam_id'])) {
    header("Location: dashboard.php");
    exit();
}

$error = '';
$email = '';

if ($_SERVER['REQUEST_METHOD'] == 'POST') {
    $email = trim($_POST['email']);
    $password = $_POST['password'];

    // Check if techniciam exists
    $stmt = $conn->prepare("SELECT id, password, name FROM techniciam WHERE email = ? OR phone = ?");
    $stmt->bind_param("ss", $email, $email);
    $stmt->execute();
    $stmt->store_result();

    if ($stmt->num_rows == 1) {
        $stmt->bind_result($id, $hashed_password, $name);
        $stmt->fetch();

        if (password_verify($password, $hashed_password)) {
            // Password is correct, start session
            session_start();
            $_SESSION['techniciam_id'] = $id;
            $_SESSION['techniciam_name'] = $name;

            header('Location: dashboard.php'); // Redirect to dashboard or home page
            exit;
        } else {
            $error = "Incorrect password.";
        }
    } else {
        $error = "No account found with that email.";
    }
}
?>

<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Login - Service App</title>
  <link href="https://fonts.googleapis.com/css2?family=Orbitron:wght@500&family=Quicksand:wght@500&display=swap" rel="stylesheet" />
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/css/all.min.css" />
  <link rel="icon" type="image/png" href="/favicon-96x96.png" sizes="96x96" />
<link rel="icon" type="image/svg+xml" href="/favicon.svg" />
<link rel="shortcut icon" href="/favicon.ico" />
<link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
<meta name="apple-mobile-web-app-title" content="Bettiah Service" />
  <style>
    * {
      box-sizing: border-box;
    }

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

    .login-container {
      background: #ffffff;
      border-radius: 14px;
      box-shadow: 0 10px 25px rgba(100, 100, 150, 0.1);
      max-width: 420px;
      width: 100%;
      padding: 40px 35px 50px;
      text-align: center;
    }

    .login-header {
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

    .login-header i {
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

    .input-group {
      position: relative;
    }
    
    .input-group input {
      width: 100%;
      padding-right: 40px; /* space for eye icon */
      box-sizing: border-box;
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

    button.login-btn {
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

    button.login-btn:hover {
      background: linear-gradient(90deg, #457b9d 0%, #1d3557 100%);
      transform: scale(1.03);
    }

    .register-link {
      margin-top: 22px;
      font-size: 15px;
      color: #6c7a89;
    }

    .register-link a {
      color: #457b9d;
      font-weight: 600;
      text-decoration: none;
      transition: color 0.3s ease;
    }

    .register-link a:hover {
      color: #1d3557;
      text-decoration: underline;
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

    @media (max-width: 480px) {
      .login-container {
        padding: 30px 20px 40px;
      }

      .login-header {
        font-size: 24px;
      }

      button.login-btn {
        font-size: 16px;
      }
    }
  </style>
</head>
<body>
  <div class="login-container" role="main" aria-label="Technician login form">
    <div class="login-header">
      <i class="fas fa-sign-in-alt"></i>
      <span>Welcome Back</span>
    </div>
    <p class="tagline">Log in to access your account and services</p>

    <?php if ($error): ?>
      <div class="error-message">
        <?php echo htmlspecialchars($error); ?>
      </div>
    <?php endif; ?>

    <form method="post" novalidate>
      <div class="input-group">
        <i class="fas fa-envelope icon"></i>
        <input
          type="text"
          name="email"
          placeholder="Email or Number"
          required
          aria-label="Email Address"
          value="<?php echo htmlspecialchars($email); ?>"
        />
      </div>
      <div class="input-group">
          <i class="fas fa-lock icon"></i>
        <input
          type="password"
          name="password"
          placeholder="Password"
          required
          aria-label="Password"
          id="passwordInput"
        />
        <i class="fas fa-eye toggle-password" id="togglePassword" aria-label="Toggle password visibility" role="button" tabindex="0"></i>
      </div>
      <button class="login-btn" type="submit" aria-label="Log In">
        <i class="fas fa-arrow-right-to-bracket"></i> Log In
      </button>
    </form>

    <div class="register-link">
      Forget Your Password? <a href="forget-password.php">Click Here</a>
    </div>
  </div>
</body>
<script>
  const togglePassword = document.getElementById('togglePassword');
  const passwordInput = document.getElementById('passwordInput');

  togglePassword.addEventListener('click', () => {
    const type = passwordInput.getAttribute('type') === 'password' ? 'text' : 'password';
    passwordInput.setAttribute('type', type);

    togglePassword.classList.toggle('fa-eye');
    togglePassword.classList.toggle('fa-eye-slash');
  });

  // Optional: keyboard accessibility (toggle with Enter or Space)
  togglePassword.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      togglePassword.click();
    }
  });
</script>
</html>
