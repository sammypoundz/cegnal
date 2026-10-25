<?php
// Cegnal OTP endpoint — POST { "email": "...", "otp": "123456" }
// Responds with JSON: { "success": true } or { "success": false, "error": "..." }
// PHPMailer lives beside this file: phpmailer/src/

use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\Exception;

// Allow the Cegnal dev server and app origins to call this endpoint
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(204);
    exit;
}

// Load PHPMailer from this file's own folder
$otp_mailer_src = __DIR__ . '/phpmailer/src/';

if (
    file_exists($otp_mailer_src . 'PHPMailer.php') &&
    file_exists($otp_mailer_src . 'Exception.php') &&
    file_exists($otp_mailer_src . 'SMTP.php')
) {
    require_once $otp_mailer_src . 'Exception.php';
    require_once $otp_mailer_src . 'PHPMailer.php';
    require_once $otp_mailer_src . 'SMTP.php';
} else {
    error_log('otp_mailer.php: PHPMailer not found at ' . $otp_mailer_src);
    http_response_code(500);
    echo json_encode(['success' => false, 'error' => 'PHPMailer files missing on server']);
    exit;
}

// --- Read input (JSON body or form POST) ---
$input = json_decode(file_get_contents('php://input'), true);
if (!is_array($input)) {
    $input = $_POST;
}

$to_email = isset($input['email']) ? trim($input['email']) : '';
$otp      = isset($input['otp']) ? trim($input['otp']) : '';

if ($to_email === '' || !filter_var($to_email, FILTER_VALIDATE_EMAIL)) {
    http_response_code(400);
    echo json_encode(['success' => false, 'error' => 'A valid email is required']);
    exit;
}
if ($otp === '' || !preg_match('/^[0-9]{4,8}$/', $otp)) {
    http_response_code(400);
    echo json_encode(['success' => false, 'error' => 'A valid OTP code is required']);
    exit;
}

function send_otp_email($to_email, $otp) {
    $mail = new PHPMailer(true);

    try {
        $mail->isSMTP();
        $mail->Host       = 'www.pkluster.online';
        $mail->SMTPAuth   = true;
        $mail->Username   = 'cegnal@pkluster.online';
        $mail->Password   = 'Precious1035';
        $mail->SMTPSecure = 'tls';
        $mail->Port       = 587;

        $mail->SMTPOptions = [
            'ssl' => [
                'verify_peer'       => false,
                'verify_peer_name'  => false,
                'allow_self_signed' => true
            ]
        ];

        $mail->setFrom('cegnal@pkluster.online', 'Cegnal');
        $mail->addAddress($to_email);
        $mail->isHTML(true);

        $mail->Subject = 'Your Cegnal verification code';

        // Cegnal-branded email body (dark/gold design language)
        $mail->Body = "
        <html>
        <body style='margin:0;padding:0;font-family:Arial,Helvetica,sans-serif;background:#f4f1e8;padding:24px;'>
          <div style='max-width:480px;margin:auto;background:#101820;border-radius:16px;padding:36px 28px;text-align:center;'>
            <div style='font-size:22px;font-weight:800;color:#C99A2E;letter-spacing:2px;margin-bottom:22px;'>CEGNAL</div>
            <h2 style='margin:0 0 10px;color:#e6ecf2;font-size:20px;'>Verify your email</h2>
            <p style='margin:0 0 24px;color:#8b96a5;font-size:14px;line-height:1.5;'>
              Welcome to Cegnal.<br>Use this one-time code to finish creating your account:
            </p>
            <div style='font-size:34px;font-weight:800;letter-spacing:10px;color:#101820;background:#C99A2E;border-radius:12px;padding:16px 20px;margin:0 0 24px;'>$otp</div>
            <p style='margin:0;color:#8b96a5;font-size:13px;line-height:1.6;'>
              This code expires in <strong style='color:#e6ecf2;'>10 minutes</strong>.<br>
              If you didn't request it, you can safely ignore this email.
            </p>
            <div style='margin-top:26px;padding-top:18px;border-top:1px solid #26303b;font-size:11px;color:#5a6572;'>
              &copy; Cegnal &mdash; trader signal hub
            </div>
          </div>
        </body>
        </html>";

        // Plain-text fallback for clients that block HTML
        $mail->AltBody = "Your Cegnal verification code is $otp. It expires in 10 minutes.";

        $mail->send();
        return true;
    } catch (Exception $e) {
        error_log('OTP mail failed: ' . $mail->ErrorInfo);
        return false;
    }
}

$ok = send_otp_email($to_email, $otp);

if ($ok) {
    echo json_encode(['success' => true]);
} else {
    http_response_code(500);
    echo json_encode(['success' => false, 'error' => 'Failed to send email. Try again shortly.']);
}
