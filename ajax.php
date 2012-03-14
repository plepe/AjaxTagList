<?
/**
 * @file ajax.php
 * @brief Most ajax-requests call this file, it calls the specified function.
 */
session_start();
require("localconf.php");
require("conf.php");

include "mysql.php";
sem_connect();
include "inc/functions.php";
call_hooks("init");
call_hooks("http_head");

function build_request($param, $prefix, $ret) {
  if(is_array($param)) {
    foreach($param as $k=>$v) {
      build_request($v, "{$prefix}[$k]", &$ret);
    }
  }
  else {
    $param=strtr($param, array("#"=>"%23", "'"=>"%27"));
    array_push($ret, "$prefix=$param");
  }
}

Header("Content-Type: text/json; charset=UTF-8");

$postdata = file_get_contents("php://input");

$fun="ajax_$_REQUEST[func]";
$return=$fun($_REQUEST["param"], $xml, $postdata);
print json_encode($return);
