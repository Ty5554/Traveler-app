<?php
class Validator {
  public static function requireParams($q, $keys){
    foreach ($keys as $k){
      if (!isset($q[$k]) || $q[$k] === ''){
        http_response_code(422);
        echo json_encode(['error'=>"Missing parameter: $k"], JSON_UNESCAPED_UNICODE);
        exit;
      }
    }
  }
}
