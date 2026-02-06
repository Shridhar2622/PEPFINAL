<?php
session_start();
@include '../config.php';

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $latitude = $_POST['latitude'] ?? null;
    $longitude = $_POST['longitude'] ?? null;
    $salesman_name = $_POST['salesman_name'] ?? null;

    date_default_timezone_set('Asia/Kolkata');
    $updated_at = date('Y-m-d H:i:s');

    if (is_numeric($latitude) && is_numeric($longitude) && !empty($salesman_name)) {

        // ✅ Check if salesman exists in the database
        $check_user_stmt = $conn->prepare("SELECT id FROM techniciam WHERE name = ?");
        $check_user_stmt->bind_param("s", $salesman_name);
        $check_user_stmt->execute();
        $check_user_stmt->store_result();

        if ($check_user_stmt->num_rows > 0) {
            $check_user_stmt->close();

            // ✅ Get last update time for this salesman
            $last_stmt = $conn->prepare("SELECT last_updated FROM salesman_locations WHERE salesman_name = ? ORDER BY last_updated DESC LIMIT 1");
            $last_stmt->bind_param("s", $salesman_name);
            $last_stmt->execute();
            $last_stmt->bind_result($last_updated);
            $last_stmt->fetch();
            $last_stmt->close();

            $allow_insert = true;
            if (!empty($last_updated)) {
                $last_time = strtotime($last_updated);
                $current_time = strtotime($updated_at);

                // ⏱️ Check for 10-second delay
                if (($current_time - $last_time) < 10) {
                    $allow_insert = false;
                }
            }

            if ($allow_insert) {
                // ✅ Insert new location
                $insert_stmt = $conn->prepare("INSERT INTO salesman_locations (salesman_name, latitude, longitude, last_updated) VALUES (?, ?, ?, ?)");
                if (!$insert_stmt) {
                    die("Prepare failed: " . $conn->error);
                }

                $insert_stmt->bind_param("sdds", $salesman_name, $latitude, $longitude, $updated_at);

                if ($insert_stmt->execute()) {
                    echo "Inserted successfully";
                } else {
                    echo "Insert error: " . $insert_stmt->error;
                }

                $insert_stmt->close();
            } else {
                echo "Skipped: Less than 10 seconds since last insert";
            }

        } else {
            echo "Unauthorized salesman name";
            $check_user_stmt->close();
        }

    } else {
        echo "Invalid input";
    }
}
?>
