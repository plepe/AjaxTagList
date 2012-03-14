<?
Header("Content-Type: text/html; charset=utf-8");
session_start();

include "inc/tags.php";
?>
<html>
<head><title>AjaxTagList</title></head>
<link rel="stylesheet" type="text/css" href="img/tags.css">
<script type="text/javascript" src="inc/ajax.js"></script>
<script type="text/javascript" src="inc/tags.js"></script>
<script type="text/javascript" src="index.js"></script>
<body>
<?

print "Testing special characters (JS):<br>\n";
print "<div id='js1'></div>\n";

print "Testing special characters (PHP):<br>\n";
$t=new tag_list(array("foo", "bar", "\"", "'", "\\", "\\\\", "\\\"", "&", "<", ">", "<foo>"), array(), array("id"=>"foo"));
//$t->add_action("add", array("mode"=>"link", "href"=>"http://orf.at"));
print $t->show();

?>
</body>
</html>
