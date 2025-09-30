<?php
class Response {
  public static function ok($data){
    return json_encode($data, JSON_UNESCAPED_UNICODE|JSON_UNESCAPED_SLASHES);
  }
  public static function err($message, $code=400){
    http_response_code($code);
    return json_encode(['error'=>$message], JSON_UNESCAPED_UNICODE|JSON_UNESCAPED_SLASHES);
  }
}
