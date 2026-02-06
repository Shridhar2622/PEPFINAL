<?php
session_start();
require '../config.php';
require '../vendor/phpmailer/phpmailer/src/PHPMailer.php';
require '../vendor/phpmailer/phpmailer/src/SMTP.php';
require '../vendor/phpmailer/phpmailer/src/Exception.php';

use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\Exception;

$error = '';
$success = '';

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $email = trim($_POST['email']);

    // Check if email exists
    $stmt = $conn->prepare("SELECT id FROM techniciam WHERE email = ?");
    $stmt->bind_param("s", $email);
    $stmt->execute();
    $stmt->store_result();

    if ($stmt->num_rows === 1) {
        $otp = rand(100000, 999999);
        $_SESSION['reset_email'] = $email;
        $_SESSION['reset_otp'] = $otp;
        $_SESSION['otp_time'] = time();

        // Send OTP
        $mail = new PHPMailer(true);
        try {
            $mail->isSMTP();
            $mail->Host       = 'smtp.hostinger.com';
            $mail->SMTPAuth   = true;
            $mail->Username   = 'no-reply@technde.in';
            $mail->Password   = 'TechNDE@7873';
            $mail->SMTPSecure = 'tls';
            $mail->Port       = 587;

            $mail->setFrom('no-reply@technde.in', 'TechNDe Support');
            $mail->addAddress($email);
            $mail->Subject = 'Your OTP for Password Reset';
            $mail->Body    = "Hi,\n\nYour OTP is: $otp\n\nUse this to reset your password. This code is valid for 10 minutes.";

            $mail->send();
            header("Location: verify-otp.php");
            exit;

        } catch (Exception $e) {
            $error = "Email sending failed. Mailer Error: {$mail->ErrorInfo}";
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
  <title>Forget Password - Service App</title>
  <link href="https://fonts.googleapis.com/css2?family=Orbitron:wght@500&family=Quicksand:wght@500&display=swap" rel="stylesheet" />
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/css/all.min.css" />
  <link rel="icon" type="image/png" href="/favicon-96x96.png" sizes="96x96" />
<link rel="icon" type="image/svg+xml" href="/favicon.svg" />
<link rel="shortcut icon" href="/favicon.ico" />
<link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
<meta name="apple-mobile-web-app-title" content="Bettiah Service" />
  <style>
    /* Same styles as before */
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
    .input-group i {
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
    @media (max-width: 480px) {
      .otp-container { padding: 30px 20px 40px; }
      .otp-header { font-size: 24px; }
      button.verify-btn { font-size: 16px; }
    }
  </style>
</head>
<body>
  <main class="otp-container" role="main" aria-label="Send OTP Form">
    <div class="otp-header">
      <i class="fas fa-unlock-alt"></i>
      <span>Forgot Password</span>
    </div>
    <p class="tagline">Enter your email address to receive OTP</p>

    <?php if ($error): ?>
      <div class="error-message">
        <?php echo htmlspecialchars($error); ?>
      </div>
    <?php endif; ?>

    <form method="post">
      <div class="input-group">
        <i class="fas fa-envelope"></i>
        <input
          type="email"
          name="email"
          placeholder="Enter your email"
          required
          aria-label="Email Address"
        />
      </div>
      <button class="verify-btn" type="submit" aria-label="Send OTP">
        <i class="fas fa-paper-plane"></i> Send OTP
      </button>
    </form>
  </main>
</body>
</html>
