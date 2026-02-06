<?php
require '../config.php';
session_start();

if (!isset($_SESSION['admin'])) {
    header("Location: index.php");
    exit();
}

$id = $_GET['id'] ?? null;
if (!$id || !is_numeric($id)) {
    header("Location: manage_category.php");
    exit();
}

$id = (int)$id;

// Fetch category
$stmt = $conn->prepare("SELECT * FROM categories WHERE id = ?");
$stmt->bind_param("i", $id);
$stmt->execute();
$result = $stmt->get_result();
$category = $result->fetch_assoc();
$stmt->close();

if (!$category) {
    $_SESSION['message'] = "Category not found.";
    header("Location: manage_category.php");
    exit();
}

// Handle update
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $new_name = trim($_POST['category_name']);
    if (!empty($new_name)) {
        $stmt = $conn->prepare("UPDATE categories SET name = ? WHERE id = ?");
        $stmt->bind_param("si", $new_name, $id);
        if ($stmt->execute()) {
            $success = "✅ Category updated successfully!";
            $category['name'] = $new_name;
        } else {
            $error = "❌ Failed to update category.";
        }
        $stmt->close();
    } else {
        $error = "⚠️ Category name cannot be empty.";
    }
}
?>

<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Edit Category</title>
  <link href="https://fonts.googleapis.com/css2?family=Orbitron:wght@500&family=Quicksand:wght@500&display=swap" rel="stylesheet" />
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
    input[type="text"] {
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
  <h2>Edit Category</h2>
  <form method="POST">
    <label for="category_name">Category Name:</label>
    <input type="text" name="category_name" id="category_name" value="<?= htmlspecialchars($category['name']) ?>" required />

    <button type="submit">Update Category</button>

    <?php if (isset($error)): ?>
      <div class="message error"><?= htmlspecialchars($error) ?></div>
    <?php endif; ?>
    <?php if (isset($success)): ?>
      <div class="message success"><?= htmlspecialchars($success) ?></div>
    <?php endif; ?>
  </form>
  <a href="manage_category.php" class="back-link">&larr; Back to Category List</a>
</body>
</html>
