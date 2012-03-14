function init() {
  var t=new tag_list(["foo", "bar", "\"", "'", "\\", "\\\\", "\\\"", "&", "<", ">", "<foo>"], {}, { text: "fadf" });
  var d=document.getElementById("js1");
  d.appendChild(t.dom);
}

window.onload=init;
