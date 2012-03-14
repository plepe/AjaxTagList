<?
class tag {
  function __construct($value, $tag_list) {
    $this->value=$value;
    $this->tag_list=$tag_list;
  }

  function show() {
    $string_tag=strtr($this->value, array("\""=>"&quot;", "&"=>"&amp;"));
    $html_tag=strtr($this->value, array("&"=>"&amp;", "<"=>"&lt;", ">"=>"&gt;"));

    $ret="<span class='tag' value=\"{$string_tag}\">{$html_tag}</span>\n";

    return $ret;
  }
}

class tag_list {
  function __construct($values, $actions=array(), $param=array()) {
    $this->list=array();
    foreach($values as $v) {
      $this->list[]=new tag($v, $this);
    }

    $this->param=$param;

    if(!$this->param['id'])
      $this->param['id']="#".rand();
  }

  function show() {
    $ret.="<div class='tag_list' id='{$this->param['id']}'>\n";
    $ret.="  <span class='text'>Tags: </span>\n";
    $ret.="  <span class='tags'>\n";

    foreach($this->list as $tag) {
      $ret.="    ".$tag->show()."\n";
    }

    $ret.="  </span>\n";
    $ret.="  <span class='actions'>\n";

    $ret.="  </span>\n";
    $ret.="</div>\n";

    return $ret;
  }
}
