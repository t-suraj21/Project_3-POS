<?php
require_once __DIR__ . "/../config/database.php";

class WorkerController
{
    private const ASSIGNABLE_ROLES = ['sales_worker', 'account_worker', 'stock_manager', 'manager'];

    public static function getAll(array $user): void
    {
        global $conn;

        $shopId = (int) $user['shop_id'];

        error_log("[WorkerController::getAll] Fetching workers for shop_id: $shopId");

        try {
            $stmt = $conn->prepare(
                "SELECT id, name, email, role, is_verified, created_at
                 FROM users
                 WHERE shop_id = ? AND role <> 'shop_admin'
                 ORDER BY created_at DESC"
            );
            $stmt->execute([$shopId]);

            $workers = $stmt->fetchAll(PDO::FETCH_ASSOC);
            error_log("[WorkerController::getAll] Found " . count($workers) . " workers");

            if (count($workers) > 0) {
                error_log("[WorkerController::getAll] Sample worker: " . json_encode($workers[0]));
            }

            echo json_encode(["workers" => $workers]);
        } catch (Exception $e) {
            error_log("[WorkerController::getAll] Exception: " . $e->getMessage());
            http_response_code(500);
            echo json_encode(["error" => "Failed to fetch workers", "details" => $e->getMessage()]);
        }
    }

    public static function create(array $user): void
    {
        global $conn;

        $shopId = (int) $user['shop_id'];
        $data   = json_decode(file_get_contents("php://input"), true) ?? [];

        $name     = trim($data['name'] ?? '');
        $email    = trim($data['email'] ?? '');
        $password = (string) ($data['password'] ?? '');
        $role     = trim($data['role'] ?? '');
        error_log("[WorkerController::create] ========== STARTING WORKER CREATION ==========");
        error_log("[WorkerController::create] User ID: " . $user['id'] . ", User Role: " . $user['role']);
        error_log("[WorkerController::create] Shop ID: $shopId");
        error_log("[WorkerController::create] Received data: name='$name', email='$email', role='$role'");
        error_log("[WorkerController::create] Input JSON: " . file_get_contents("php://input"));

        if ($name === '' || $email === '' || $password === '' || $role === '') {
            http_response_code(422);
            echo json_encode(["error" => "name, email, password and role are required"]);
            return;
        }

        if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
            http_response_code(422);
            echo json_encode(["error" => "Invalid email format"]);
            return;
        }

        if (strlen($password) < 6) {
            http_response_code(422);
            echo json_encode(["error" => "Password must be at least 6 characters"]);
            return;
        }

        if (!in_array($role, self::ASSIGNABLE_ROLES, true)) {
            http_response_code(422);
            echo json_encode(["error" => "Invalid worker role"]);
            return;
        }

        $dup = $conn->prepare("SELECT id FROM users WHERE email = ? LIMIT 1");
        $dup->execute([$email]);
        if ($dup->fetch()) {
            http_response_code(409);
            echo json_encode(["error" => "This email is already registered"]);
            return;
        }

        error_log("[WorkerController::create] Email unique check passed");

        try {
            error_log("[WorkerController::create] Validation passed, preparing statement...");
            $stmt = $conn->prepare(
                "INSERT INTO users (shop_id, name, email, password, role, is_verified)
                 VALUES (?, ?, ?, ?, ?, ?)"
            );

            $hashedPassword = password_hash($password, PASSWORD_BCRYPT);
            error_log("[WorkerController::create] Password hashed. About to execute INSERT...");
            error_log("[WorkerController::create] Parameters: shopId=$shopId, name=$name, email=$email, role=$role, is_verified=1");

            $success = $stmt->execute([
                $shopId,
                $name,
                $email,
                $hashedPassword,
                $role,
                1,
            ]);

            error_log("[WorkerController::create] INSERT executed, success: " . ($success ? "true" : "false"));
            error_log("[WorkerController::create] Rows affected: " . $stmt->rowCount());

            if (!$success) {
                error_log("[WorkerController::create] ✗ INSERT FAILED - Error Info: " . json_encode($stmt->errorInfo()));
                http_response_code(500);
                echo json_encode(["error" => "Failed to create worker", "details" => $stmt->errorInfo()]);
                return;
            }

            $workerId = $conn->lastInsertId();
            error_log("[WorkerController::create] ✓ Worker created successfully with ID: $workerId");
            error_log("[WorkerController::create] ========== WORKER CREATION COMPLETE ==========");

            http_response_code(201);
            echo json_encode([
                "message" => "Worker created successfully",
                "worker_id" => $workerId,
                "name" => $name,
                "email" => $email,
                "role" => $role
            ]);
        } catch (Exception $e) {
            error_log("[WorkerController::create] ✗ EXCEPTION CAUGHT");
            error_log("[WorkerController::create] Exception message: " . $e->getMessage());
            error_log("[WorkerController::create] Exception code: " . $e->getCode());
            error_log("[WorkerController::create] Stack trace: " . $e->getTraceAsString());
            http_response_code(500);
            echo json_encode(["error" => "Database error: " . $e->getMessage()]);
        }
    }

    public static function updateRole(array $user, int $workerId): void
    {
        global $conn;

        $shopId   = (int) $user['shop_id'];
        $callerId = (int) $user['id'];
        $data     = json_decode(file_get_contents("php://input"), true) ?? [];
        $role     = trim($data['role'] ?? '');

        if ($role === '') {
            http_response_code(422);
            echo json_encode(["error" => "role is required"]);
            return;
        }

        if (!in_array($role, self::ASSIGNABLE_ROLES, true)) {
            http_response_code(422);
            echo json_encode(["error" => "Invalid worker role"]);
            return;
        }

        $stmt = $conn->prepare(
            "UPDATE users
             SET role = ?
             WHERE id = ? AND shop_id = ? AND role <> 'shop_admin' AND id <> ?"
        );
        $stmt->execute([$role, $workerId, $shopId, $callerId]);

        if ($stmt->rowCount() === 0) {
            http_response_code(404);
            echo json_encode(["error" => "Worker not found or cannot update this user"]);
            return;
        }

        echo json_encode(["message" => "Worker role updated successfully"]);
    }

    public static function delete(array $user, int $workerId): void
    {
        global $conn;

        $shopId   = (int) $user['shop_id'];
        $callerId = (int) $user['id'];

        $stmt = $conn->prepare(
            "DELETE FROM users
             WHERE id = ? AND shop_id = ? AND role <> 'shop_admin' AND id <> ?"
        );
        $stmt->execute([$workerId, $shopId, $callerId]);

        if ($stmt->rowCount() === 0) {
            http_response_code(404);
            echo json_encode(["error" => "Worker not found or cannot delete this user"]);
            return;
        }

        echo json_encode(["message" => "Worker removed successfully"]);
    }
}
