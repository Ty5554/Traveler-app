<?php
// backend/api.php
// シンプルなルータ: /api.php/{resource}
// 例) /api.php/flights?from=HND&to=CTS&date=2025-10-01&pax=1

header('Content-Type: application/json; charset=UTF-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') { http_response_code(204); exit; }

require __DIR__ . '/lib/Response.php';
require __DIR__ . '/lib/Validator.php';

$secret = 'traveler-demo-secret-key';

$path = $_SERVER['REQUEST_URI'];
$script = $_SERVER['SCRIPT_NAME'];
$resource = trim(str_replace($script, '', $path), '/'); // 'flights' など
$resource = strtok($resource, '?');

// クエリパラメータ
$q = $_GET;

switch ($resource) {
  case 'login':
    if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
      http_response_code(405);
      echo Response::err('Method Not Allowed', 405);
      break;
    }
    $input = json_decode(file_get_contents('php://input'), true);
    if (!is_array($input)) {
      http_response_code(400);
      echo Response::err('Invalid JSON payload', 400);
      break;
    }
    Validator::requireParams($input, ['email','password']);
    $users = json_decode(file_get_contents(__DIR__ . '/data/users.json'), true) ?? [];
    $found = null;
    foreach ($users as $user) {
      if (strcasecmp($user['email'], $input['email']) === 0) {
        $found = $user;
        break;
      }
    }
    if (!$found || !password_verify($input['password'], $found['password'])) {
      http_response_code(401);
      echo Response::err('メールアドレスまたはパスワードが正しくありません', 401);
      break;
    }
    $profile = [
      'id' => $found['id'],
      'name' => $found['name'],
      'email' => $found['email'],
      'avatar' => $found['avatar'] ?? null,
      'role' => $found['role'] ?? 'member'
    ];
    $payload = [
      'sub' => $found['id'],
      'email' => $found['email'],
      'role' => $profile['role'],
      'exp' => time() + 60 * 60 * 12
    ];
    $payloadJson = json_encode($payload, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
    $base = rtrim(strtr(base64_encode($payloadJson), '+/', '-_'), '=');
    $signature = hash_hmac('sha256', $base, $secret);
    $token = $base . '.' . $signature;
    echo Response::ok([
      'token' => $token,
      'user' => $profile
    ]);
    break;

  case 'airports':
    $data = json_decode(file_get_contents(__DIR__ . '/data/airports.json'), true);
    echo Response::ok($data);
    break;

  case 'flights':
    Validator::requireParams($q, ['from','to']);
    $all = json_decode(file_get_contents(__DIR__ . '/data/flights.json'), true);
    $items = array_values(array_filter($all, function($f) use ($q){
      $ok = true;
      if (!empty($q['from'])) $ok = $ok && ($f['from'] === strtoupper($q['from']));
      if (!empty($q['to'])) $ok = $ok && ($f['to'] === strtoupper($q['to']));
      return $ok;
    }));
    echo Response::ok(['items' => $items]);
    break;

  case 'hotels':
    Validator::requireParams($q, ['city']);
    $all = json_decode(file_get_contents(__DIR__ . '/data/hotels.json'), true);
    $items = array_values(array_filter($all, function($h) use ($q){
      $ok = true;
      if (!empty($q['city'])) $ok = $ok && (mb_strpos($h['city'], $q['city']) !== false);
      return $ok;
    }));
    echo Response::ok(['items' => $items]);
    break;

  default:
    http_response_code(404);
    echo Response::err('Not Found: ' . $resource);
}
