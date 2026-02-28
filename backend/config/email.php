<?php
/**
 * Email / SMTP Configuration
 * ──────────────────────────────────────────────────────────────────────────────
 * All values are read from the .env file in the backend root.
 * Never hard-code credentials here — edit backend/.env instead.
 *
 * Required .env keys:
 *   MAIL_HOST        smtp.gmail.com
 *   MAIL_PORT        587
 *   MAIL_ENCRYPTION  tls            (tls | ssl | none)
 *   MAIL_USERNAME    you@gmail.com
 *   MAIL_PASSWORD    xxxx xxxx xxxx xxxx   ← Gmail App Password (NOT login password)
 *   MAIL_FROM_EMAIL  you@gmail.com
 *   MAIL_FROM_NAME   "POS System"
 *   APP_URL          http://localhost:5173
 *   MAIL_TOKEN_TTL   60             (minutes until verification link expires)
 *
 * How to get a Gmail App Password:
 *   Google Account → Security → 2-Step Verification → App Passwords
 * ──────────────────────────────────────────────────────────────────────────────
 */

return [
    'host'       => $_ENV['MAIL_HOST']        ?? 'smtp.gmail.com',
    'port'       => (int)($_ENV['MAIL_PORT']  ?? 587),
    'encryption' => $_ENV['MAIL_ENCRYPTION']  ?? 'tls',
    'username'   => $_ENV['MAIL_USERNAME']    ?? '',
    'password'   => $_ENV['MAIL_PASSWORD']    ?? '',
    'from_email' => $_ENV['MAIL_FROM_EMAIL']  ?? ($_ENV['MAIL_USERNAME'] ?? ''),
    'from_name'  => $_ENV['MAIL_FROM_NAME']   ?? 'POS System',
    'app_url'    => rtrim($_ENV['APP_URL']    ?? 'http://localhost:5173', '/'),
    'token_ttl'  => (int)($_ENV['MAIL_TOKEN_TTL'] ?? 60),
];
