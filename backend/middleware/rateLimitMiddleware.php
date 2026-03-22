<?php
/**
 * rateLimitMiddleware.php — Request Rate Limiting
 *
 * Implements a simple in-memory rate limiter using PHP's APC or a file-based fallback.
 * This protects against brute force attacks (login, OTP verify, password reset, etc.)
 * by limiting the number of requests per IP address within a time window.
 *
 * Configuration: See .env
 *   RATE_LIMIT_REQUESTS=100    (max requests per window)
 *   RATE_LIMIT_WINDOW=3600     (time window in seconds, default 1 hour)
 */

class RateLimiter
{
    private static $maxRequests = 100;
    private static $window = 3600;
    private static $storageFile = __DIR__ . '/../tmp/rate_limit.json';

    /**
     * Initialize rate limiter settings from environment
     */
    public static function init(): void
    {
        self::$maxRequests = (int) ($_ENV['RATE_LIMIT_REQUESTS'] ?? 100);
        self::$window = (int) ($_ENV['RATE_LIMIT_WINDOW'] ?? 3600);
        
        // Ensure temp directory exists
        if (!is_dir(dirname(self::$storageFile))) {
            mkdir(dirname(self::$storageFile), 0755, true);
        }
    }

    /**
     * Check if a request from this IP should be allowed.
     *
     * Returns a set of headers for the response:
     *   X-RateLimit-Limit      — max requests per window
     *   X-RateLimit-Remaining  — remaining requests in current window
     *   X-RateLimit-Reset      — Unix timestamp when window resets
     *
     * @param string $identifier  Usually the IP address, but can be email for login attempts
     * @param int $requestLimit   Override default limit for this specific endpoint
     * @return array              ['allowed' => bool, 'headers' => [...], 'message' => string]
     */
    public static function checkLimit(string $identifier, int $requestLimit = null): array
    {
        self::init();
        
        if (!$requestLimit) {
            $requestLimit = self::$maxRequests;
        }

        $now = time();
        $data = self::loadData();
        $key = md5($identifier);

        if (!isset($data[$key])) {
            $data[$key] = [
                'count' => 1,
                'reset_at' => $now + self::$window,
            ];
        } else {
            // If window has passed, reset the counter
            if ($data[$key]['reset_at'] <= $now) {
                $data[$key]['count'] = 1;
                $data[$key]['reset_at'] = $now + self::$window;
            } else {
                $data[$key]['count']++;
            }
        }

        self::saveData($data);

        $remaining = $requestLimit - $data[$key]['count'];
        $allowed = $data[$key]['count'] <= $requestLimit;
        $resetTime = $data[$key]['reset_at'];

        return [
            'allowed' => $allowed,
            'headers' => [
                'X-RateLimit-Limit' => $requestLimit,
                'X-RateLimit-Remaining' => max(0, $remaining),
                'X-RateLimit-Reset' => $resetTime,
            ],
            'message' => !$allowed 
                ? "Too many requests. Please try again after " . date('H:i:s', $resetTime)
                : null,
        ];
    }

    /**
     * Get the client's IP address (accounting for proxies)
     */
    public static function getClientIp(): string
    {
        // Check for shared internet
        if (!empty($_SERVER['HTTP_CLIENT_IP'])) {
            return $_SERVER['HTTP_CLIENT_IP'];
        }
        // Check for IP passed from proxy
        elseif (!empty($_SERVER['HTTP_X_FORWARDED_FOR'])) {
            $ips = explode(',', $_SERVER['HTTP_X_FORWARDED_FOR']);
            return trim($ips[0]);
        }
        // Check for remote address
        else {
            return $_SERVER['REMOTE_ADDR'] ?? '127.0.0.1';
        }
    }

    /**
     * Load rate limit data from file storage
     */
    private static function loadData(): array
    {
        if (!file_exists(self::$storageFile)) {
            return [];
        }

        $json = @file_get_contents(self::$storageFile);
        if (!$json) {
            return [];
        }

        $data = @json_decode($json, true);
        return is_array($data) ? $data : [];
    }

    /**
     * Save rate limit data to file storage
     */
    private static function saveData(array $data): void
    {
        // Clean up old entries (older than 24 hours)
        $now = time();
        $data = array_filter($data, function ($entry) use ($now) {
            return $entry['reset_at'] > $now - 86400;
        });

        @file_put_contents(self::$storageFile, json_encode($data), LOCK_EX);
    }
}

/**
 * Middleware function: Check rate limit and exit if exceeded
 *
 * Usage at the start of a sensitive endpoint:
 *   requireRateLimit($_SERVER['REQUEST_METHOD'] . ':' . $_SERVER['REQUEST_URI']);
 *
 * @param string $endpoint      Unique identifier for this endpoint (e.g., 'POST:/api/auth/login')
 * @param int $requestLimit     Override default limit for this endpoint
 */
function requireRateLimit(string $endpoint, int $requestLimit = null): void
{
    $identifier = RateLimiter::getClientIp() . ':' . $endpoint;
    $check = RateLimiter::checkLimit($identifier, $requestLimit);

    // Add rate limit headers to response
    foreach ($check['headers'] as $header => $value) {
        header("$header: $value");
    }

    if (!$check['allowed']) {
        http_response_code(429); // 429 Too Many Requests
        echo json_encode(["error" => $check['message']]);
        exit;
    }
}
?>
