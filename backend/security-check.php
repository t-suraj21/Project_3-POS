<?php
/**
 * security-check.php — Pre-Deployment Security Validation
 * 
 * Run this script before deploying to production:
 *   php backend/security-check.php
 * 
 * Checks:
 *   - Environment variables are properly configured
 *   - Secrets are strong and not exposed
 *   - File permissions are secure
 *   - Safety of hardcoded credentials
 */

echo "===============================================\n";
echo "  POS SYSTEM SECURITY PRE-DEPLOYMENT CHECK\n";
echo "===============================================\n\n";

$errors = [];
$warnings = [];
$success = [];

// ── 1. Load environment file
echo "Loading environment configuration...\n";
if (!file_exists(__DIR__ . "/.env")) {
    $errors[] = ".env file not found! Copy .env.example to .env";
} else {
    $dotenv = Dotenv\Dotenv::createImmutable(__DIR__);
    $dotenv->load();
    $success[] = ".env file loaded successfully";
}

// ── 2. Check JWT_SECRET
echo "Checking JWT_SECRET...\n";
$jwtSecret = $_ENV['JWT_SECRET'] ?? '';
if (empty($jwtSecret)) {
    $errors[] = "JWT_SECRET is not set in .env";
} elseif (strlen($jwtSecret) < 32) {
    $errors[] = "JWT_SECRET is too short (must be 32+ characters, got " . strlen($jwtSecret) . ")";
} elseif (strpos($jwtSecret, 'CHANGE_ME') !== false || strpos($jwtSecret, 'REPLACE') !== false) {
    $errors[] = "JWT_SECRET still contains placeholder - please configure properly";
} else {
    $success[] = "JWT_SECRET is properly configured (length: " . strlen($jwtSecret) . ")";
}

// ── 3. Check CORS configuration
echo "Checking CORS configuration...\n";
$frontendUrl = $_ENV['FRONTEND_URL'] ?? '';
if (empty($frontendUrl)) {
    $warnings[] = "FRONTEND_URL not set - CORS will use default http://localhost:5173";
} elseif ($frontendUrl === '*') {
    $errors[] = "FRONTEND_URL is set to '*' - too permissive for production!";
} else {
    $success[] = "FRONTEND_URL set to: " . $frontendUrl;
}

// ── 4. Check database credentials
echo "Checking database configuration...\n";
$dbHost = $_ENV['DB_HOST'] ?? '';
$dbName = $_ENV['DB_NAME'] ?? '';
$dbUser = $_ENV['DB_USER'] ?? '';
if (empty($dbHost) || empty($dbName) || empty($dbUser)) {
    $errors[] = "Database credentials incomplete";
} else {
    $success[] = "Database configured: $dbUser@$dbHost/$dbName";
}

// ── 5. Check APP_ENV
echo "Checking application environment...\n";
$appEnv = $_ENV['APP_ENV'] ?? 'production';
if ($appEnv !== 'production' && $appEnv !== 'development') {
    $warnings[] = "APP_ENV is set to unexpected value: $appEnv (should be 'production' or 'development')";
}
$success[] = "Application environment: " . $appEnv;

// ── 6. Check file permissions
echo "Checking file permissions...\n";
if (!is_writable(__DIR__ . "/tmp")) {
    $errors[] = "backend/tmp directory is not writable (needed for rate limiting)";
} else {
    $success[] = "backend/tmp directory is writable";
}

if (!is_writable(__DIR__ . "/uploads")) {
    $warnings[] = "backend/uploads directory might not be writable";
} else {
    $success[] = "backend/uploads directory is writable";
}

// ── 7. Check for hardcoded secrets in source
echo "Checking for hardcoded secrets in source files...\n";
$secretFiles = [
    'config/database.php',
    'config/email.php',
    'utils/jwt.php',
    'utils/Mailer.php',
];

$foundHardcoded = false;
foreach ($secretFiles as $file) {
    $path = __DIR__ . "/" . $file;
    if (file_exists($path)) {
        $content = file_get_contents($path);
        if (preg_match('/password\s*=\s*["\'](?!.*\$_ENV)[\w\-]{6,}["\']/', $content) ||
            preg_match('/secret\s*=\s*["\'][^"\']*["\'].*?=\s*["\'](?!.*\$_ENV)/i', $content)) {
            // Allow if it's using $_ENV
            if (strpos($content, '$_ENV') === false) {
                $errors[] = "Possible hardcoded secret in $file";
                $foundHardcoded = true;
            }
        }
    }
}
if (!$foundHardcoded) {
    $success[] = "No obvious hardcoded secrets found in source files";
}

// ── 8. Check email configuration
echo "Checking email configuration...\n";
$mailHost = $_ENV['MAIL_HOST'] ?? '';
$mailUsername = $_ENV['MAIL_USERNAME'] ?? '';
$mailPassword = $_ENV['MAIL_PASSWORD'] ?? '';
if (empty($mailHost) || empty($mailUsername)) {
    $warnings[] = "Email configuration incomplete - verify emails won't be sent";
} else {
    $success[] = "Email configured: $mailUsername@$mailHost";
}

// ── 9. Check Razorpay configuration (if payment enabled)
echo "Checking Razorpay configuration...\n";
$razorKey = $_ENV['RAZORPAY_KEY_ID'] ?? '';
if (empty($razorKey)) {
    $warnings[] = "Razorpay KEY_ID not configured - online payments disabled";
} elseif (strpos($razorKey, 'rzp_test_') === 0) {
    $success[] = "Razorpay using TEST keys (remember to switch to LIVE for production)";
} elseif (strpos($razorKey, 'rzp_live_') === 0) {
    $success[] = "Razorpay configured with LIVE keys";
} else {
    $warnings[] = "Razorpay KEY_ID format unexpected";
}

// ── 10. Check rate limiting
echo "Checking rate limiting configuration...\n";
$rateLimit = (int)($_ENV['RATE_LIMIT_REQUESTS'] ?? 100);
$rateLimitWindow = (int)($_ENV['RATE_LIMIT_WINDOW'] ?? 3600);
if ($rateLimit > 1000) {
    $warnings[] = "Rate limit is very high ($rateLimit/window) - may not protect against attacks";
} else {
    $success[] = "Rate limiting: $rateLimit requests per " . ($rateLimitWindow / 60) . " minutes";
}

// ── SUMMARY
echo "\n===============================================\n";
echo "  SECURITY CHECK SUMMARY\n";
echo "===============================================\n\n";

if (!empty($errors)) {
    echo "[ERRORS - " . count($errors) . "]\n";
    foreach ($errors as $error) {
        echo "  ✗ " . $error . "\n";
    }
    echo "\n";
}

if (!empty($warnings)) {
    echo "[WARNINGS - " . count($warnings) . "]\n";
    foreach ($warnings as $warning) {
        echo "  ⚠ " . $warning . "\n";
    }
    echo "\n";
}

if (!empty($success)) {
    echo "[PASSED - " . count($success) . "]\n";
    foreach ($success as $item) {
        echo "  ✓ " . $item . "\n";
    }
    echo "\n";
}

// ── FINAL STATUS
$totalIssues = count($errors) + count($warnings);
if (count($errors) > 0) {
    echo "[DEPLOYMENT STATUS: ❌ NOT READY]\n";
    echo "Fix " . count($errors) . " error(s) before deploying to production!\n";
    exit(1);
} elseif (count($warnings) > 0) {
    echo "[DEPLOYMENT STATUS: ⚠️  READY WITH WARNINGS]\n";
    echo "Please address " . count($warnings) . " warning(s) if possible.\n";
    exit(0);
} else {
    echo "[DEPLOYMENT STATUS: ✅ READY]\n";
    echo "All security checks passed! Safe to deploy.\n";
    exit(0);
}
?>
