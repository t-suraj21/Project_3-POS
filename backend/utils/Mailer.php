<?php
require_once __DIR__ . "/../vendor/autoload.php";

use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\SMTP;
use PHPMailer\PHPMailer\Exception;

class Mailer
{
    /**
     * Send an HTML email.
     *
     * @param  string $toEmail   Recipient email address
     * @param  string $toName    Recipient display name
     * @param  string $subject   Email subject line
     * @param  string $htmlBody  Full HTML content of the email body
     * @return bool              true on success, false on failure
     */
    public static function send(
        string $toEmail,
        string $toName,
        string $subject,
        string $htmlBody
    ): bool {
        $cfg  = require __DIR__ . "/../config/email.php";

        // Guard: skip sending if SMTP credentials are not configured
        if (empty($cfg['username']) || empty($cfg['password'])) {
            error_log("[Mailer] SMTP credentials are not configured. Edit backend/.env to enable email sending.");
            return false;
        }

        $mail = new PHPMailer(true);

        try {
            // ── Server settings ───────────────────────────────────────────
            $mail->isSMTP();
            $mail->Host       = $cfg['host'];
            $mail->SMTPAuth   = true;
            $mail->Username   = $cfg['username'];
            $mail->Password   = $cfg['password'];
            $mail->SMTPSecure = $cfg['encryption'] === 'ssl' ? PHPMailer::ENCRYPTION_SMTPS
                                                             : PHPMailer::ENCRYPTION_STARTTLS;
            $mail->Port       = $cfg['port'];
            $mail->SMTPOptions = [
                'ssl' => [
                    'verify_peer'       => false,
                    'verify_peer_name'  => false,
                    'allow_self_signed' => true,
                ],
            ];

            // ── Sender & recipient ────────────────────────────────────────
            $mail->setFrom($cfg['from_email'], $cfg['from_name']);
            $mail->addAddress($toEmail, $toName);

            // ── Content ───────────────────────────────────────────────────
            $mail->isHTML(true);
            $mail->Subject = $subject;
            $mail->Body    = $htmlBody;
            $mail->AltBody = strip_tags(str_replace('<br>', "\n", $htmlBody));

            $mail->send();
            return true;

        } catch (Exception $e) {
            // Log the full SMTP error (visible in php error log / terminal)
            error_log("[Mailer] Failed to send to $toEmail — " . $mail->ErrorInfo);
            return false;
        }
    }

    /**
     * Send a 6-digit OTP verification email.
     *
     * @param  string $toEmail    Recipient email
     * @param  string $ownerName  Shop owner's full name
     * @param  string $shopName   Name of the shop
     * @param  string $otp        6-digit OTP code
     * @return bool
     */
    public static function sendOtp(
        string $toEmail,
        string $ownerName,
        string $shopName,
        string $otp
    ): bool {
        $subject = "Your verification code – {$shopName}";
        $html    = self::otpTemplate($ownerName, $shopName, $otp);
        return self::send($toEmail, $ownerName, $subject, $html);
    }

    /**
     * Send a password-reset link email.
     *
     * @param  string $toEmail    Recipient email
     * @param  string $ownerName  User's full name
     * @param  string $resetUrl   Full URL containing the reset token
     * @return bool
     */
    public static function sendPasswordReset(
        string $toEmail,
        string $ownerName,
        string $resetUrl
    ): bool {
        $subject = "Reset your POS password";
        $html    = self::passwordResetTemplate($ownerName, $resetUrl);
        return self::send($toEmail, $ownerName, $subject, $html);
    }

    // ── Private: Password-reset email template ────────────────────────────────
    private static function passwordResetTemplate(
        string $name,
        string $resetUrl
    ): string {
        return <<<HTML
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Reset Your Password</title>
</head>
<body style="margin:0;padding:0;background:#f4f6f8;font-family:'Segoe UI',Arial,sans-serif;">

  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f6f8;padding:40px 0;">
    <tr>
      <td align="center">

        <table width="520" cellpadding="0" cellspacing="0"
               style="background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);">

          <!-- Header -->
          <tr>
            <td align="center"
                style="background:linear-gradient(135deg,#4f46e5 0%,#7c3aed 100%);padding:36px 40px;">
              <div style="font-size:40px;margin-bottom:8px;">🔑</div>
              <h1 style="margin:0;color:#ffffff;font-size:22px;font-weight:700;letter-spacing:-0.3px;">
                Password Reset Request
              </h1>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding:36px 40px;text-align:left;">
              <p style="margin:0 0 12px;font-size:16px;color:#374151;line-height:1.6;">
                Hi <strong>{$name}</strong> 👋
              </p>
              <p style="margin:0 0 28px;font-size:15px;color:#6b7280;line-height:1.7;">
                We received a request to reset your POS System password.
                Click the button below to set a new password. This link expires in <strong>30 minutes</strong>.
              </p>

              <!-- CTA Button -->
              <table cellpadding="0" cellspacing="0" width="100%">
                <tr>
                  <td align="center">
                    <a href="{$resetUrl}" target="_blank"
                       style="display:inline-block;background:linear-gradient(135deg,#4f46e5,#7c3aed);
                              color:#ffffff;text-decoration:none;font-weight:700;font-size:16px;
                              padding:14px 40px;border-radius:10px;letter-spacing:0.2px;
                              box-shadow:0 4px 14px rgba(79,70,229,0.4);">
                      Reset My Password →
                    </a>
                  </td>
                </tr>
              </table>

              <p style="margin:28px 0 0;font-size:13px;color:#9ca3af;line-height:1.7;">
                If the button doesn't work, copy and paste this URL into your browser:<br />
                <a href="{$resetUrl}" style="color:#4f46e5;word-break:break-all;">{$resetUrl}</a>
              </p>

              <hr style="border:none;border-top:1px solid #e5e7eb;margin:28px 0 20px;" />

              <p style="margin:0;font-size:12px;color:#9ca3af;line-height:1.6;">
                If you didn't request a password reset, you can safely ignore this email.<br />
                Your password will not be changed until you click the link above.
              </p>
              <p style="margin:12px 0 0;font-size:12px;color:#9ca3af;">
                © POS System &nbsp;·&nbsp; This is an automated email, please do not reply.
              </p>
            </td>
          </tr>

        </table>

      </td>
    </tr>
  </table>

</body>
</html>
HTML;
    }

    // ── Private: OTP email template ───────────────────────────────────────────
    private static function otpTemplate(
        string $name,
        string $shopName,
        string $otp
    ): string {
        return <<<HTML
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Your OTP Code</title>
</head>
<body style="margin:0;padding:0;background:#f4f6f8;font-family:'Segoe UI',Arial,sans-serif;">

  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f6f8;padding:40px 0;">
    <tr>
      <td align="center">

        <table width="520" cellpadding="0" cellspacing="0"
               style="background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);">

          <!-- Header -->
          <tr>
            <td align="center"
                style="background:linear-gradient(135deg,#4f46e5 0%,#7c3aed 100%);padding:36px 40px;">
              <div style="font-size:40px;margin-bottom:8px;">🔐</div>
              <h1 style="margin:0;color:#ffffff;font-size:22px;font-weight:700;letter-spacing:-0.3px;">
                Email Verification
              </h1>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding:36px 40px;text-align:center;">
              <p style="margin:0 0 8px;font-size:16px;color:#374151;line-height:1.6;text-align:left;">
                Hi <strong>{$name}</strong> 👋
              </p>
              <p style="margin:0 0 28px;font-size:15px;color:#6b7280;line-height:1.7;text-align:left;">
                Thanks for registering <strong style="color:#4f46e5;">{$shopName}</strong>.
                Use the code below to verify your email address. It expires in <strong>10 minutes</strong>.
              </p>

              <!-- OTP Box -->
              <div style="background:#f0f0ff;border:2px dashed #4f46e5;border-radius:12px;
                          padding:24px 32px;margin:0 auto 28px;display:inline-block;">
                <p style="margin:0 0 4px;font-size:12px;color:#6b7280;letter-spacing:1px;text-transform:uppercase;">
                  Your verification code
                </p>
                <p style="margin:0;font-size:42px;font-weight:800;color:#4f46e5;letter-spacing:10px;line-height:1.2;">
                  {$otp}
                </p>
              </div>

              <p style="margin:0;font-size:13px;color:#9ca3af;line-height:1.6;">
                Enter this code in the app to activate your account.<br />
                If you didn't create this account, you can safely ignore this email.
              </p>

              <hr style="border:none;border-top:1px solid #e5e7eb;margin:28px 0 20px;" />

              <p style="margin:0;font-size:12px;color:#9ca3af;">
                © POS System &nbsp;·&nbsp; This is an automated email, please do not reply.
              </p>
            </td>
          </tr>

        </table>

      </td>
    </tr>
  </table>

</body>
</html>
HTML;
    }
}
