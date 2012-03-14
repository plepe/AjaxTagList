var tag_lists;

/**
 * DOM Layout:
 * <div class='tag_list'>
 *   <span class='text'>Tags: </span>
 *   <span class='tags'>
 *     <span class='tag' value='Foo'>Foo</span>
 *     <span class='tag' value='Bar'>Bar</span>
 *   </span>
 *   <span class='actions'>
 *      <span ...><a ...>new</a></span>
 *   </span>
 * </div>
 *
 * Javascript representation:
 * tag_list:
 *   .dom             points to div.tag_list
 *   .dom_parts.text  points to span.text
 *   .dom_parts.tags  points to span.tags
 *   .dom_parts.actions points to span.actions
 *
 *   .update_list()   re-reads list of tags from dom representation
 *   .add(value)      adds a tag 'value' to the tag_list
 *
 * tag:
 *   .dom             points to a span.tag
 *   .value           value of the tag (string)
 *
 * Define actions:
 * tag_list:
 *   .action_add('id', { param })
 *   param:
 *     .mode         values: 'add' ... add new tags
 *                           'link' .. link to a page
 *  mode 'add', possible params:
 *     .callback_save((string)tag, callback)    called to save a new tag
 *        returns: null -> function calls callback after attempt to save
 *                 false -> not saved (no reason)
 *                 "...." -> not saved (reason)
 *                 true -> successfully saved
 *     .callback_saved((string)tag)             called after successful saving a new tag
*/
function tag(value, tag_list) {
  this.tag_list=tag_list;
  if(value.parentNode) {
    this.value=value.getAttribute("value");
    this.dom=value;
  }
  else {
    this.dom=document.createElement("span");
    this.dom.className="tag";
    this.dom.setAttribute("value", value);

    var x=document.createTextNode(value);
    this.dom.appendChild(x);
    this.value=value;
  }
}

// list can be either:
// - an existing dom-element where tags are read from
// - the id of an existing dom-element -- " --
// - or an array of strings with the tags - then a new div will be created
//   which can be accessed as object.dom
function tag_list(list, actions, param) {
  if((typeof(list)== "string")||(list.parentNode)) {
    if(typeof(list)=="string") {
      if(!(this.dom=document.getElementById(list))) {
        alert("tag_list: no dom element found!");
        return;
      }
    }
    else
      this.dom=list;

    var current=this.dom.firstChild;
    this.dom_parts={};
    while(current) {
      if(this.dom.nodeType==1)
        this.dom_parts[current.className]=current;
      current=current.nextSibling;
    }

    this.actions=actions;
    if(!actions)
      this.actions={};

    this.update_list();
  }
  else {
    this.dom=document.createElement("div");
    this.dom.className="tag_list";

    this.dom_parts={};
    this.dom_parts.text=document.createElement("span");
    this.dom_parts.text.className="text";
    this.dom.appendChild(this.dom_parts.text);
    this.dom_parts.tags=document.createElement("span");
    this.dom_parts.tags.className="tags";
    this.dom.appendChild(this.dom_parts.tags);
    this.dom_parts.actions=document.createElement("span");
    this.dom_parts.actions.className="actions";
    this.dom.appendChild(this.dom_parts.actions);

    this.list=[];

    for(var i=0; i<list.length; i++) {
      this.add(list[i], this);
    }

    this.actions=actions;
    if(!actions)
      this.actions={};
  }
}

tag_list.prototype.values=function() {
  var ret=[];

  for(var i=0; i<this.list.length; i++) {
    ret.push(this.list[i].value);
  }

  return ret;
}

tag_list.prototype.update_list=function() {
  this.list=[];
  if(!this.dom_parts.tags)
    return;

  var current=this.dom_parts.tags.firstChild;
  while(current) {
    var v;

    if(current.className=="tag")
      this.list.push(new tag(current, this));

    current=current.nextSibling;
  }
}

tag_list.prototype.add=function(id) {
  var ob;
  if(typeof id=="string")
    ob=new tag(id, this);
  else
    ob=id;

  this.list.push(ob);
  this.dom_parts.tags.appendChild(ob.dom);

  var x=document.createTextNode("\n");
  this.dom_parts.tags.appendChild(x);
}

tag_list.prototype.add_action=function(id, param) {
  var span=document.createElement("span");
  this.dom_parts.actions.appendChild(span);

  param.id=id;
  param.tag_list=this;
  this.actions[id]=param;

  var a=document.createElement("a");
  if(param.href)
    a.href=param.href;
  else
    a.href="#";
  span.appendChild(a);

  switch(param.mode) {
    case "link":
      if(param.callback)
        a.onclick=param.callback;
      break;
    case "add":
        a.onclick=this.action_add.bind(this, this.actions[id]);
      break;
    default:
      alert("tag_list::add_action: invalid action mode '"+param.mode+"'");
  }

  var x=document.createTextNode(param.name);
  a.appendChild(x);
}

tag_list.prototype.action_add=function(action) {
  var span=document.createElement("span");
  span.className="tag";
  span.action=action;

  this.dom_parts.tags.appendChild(span);

  var form=document.createElement("form");
  form.onsubmit=this.action_add_submit.bind(this, span);
  span.appendChild(form);

  var input=document.createElement("input");
  input.name="tag";
  form.appendChild(input);
  span.input=input;
  input.focus();
  input.onblur=this.action_add_blur.bind(this, span);
  input.id="current_input";
  register_hook("keydown", this.action_add_keypress.bind(this, span), span);
}

tag_list.prototype.action_add_save_callback=function(span, _tag, success) {
  span.parentNode.removeChild(span);

  if(success===false) {
    alert("Tag konnte nicht gespeichert werden!");
    return;
  }
  else if(typeof success == "string") {
    alert(success);
    return;
  }

  this.add(_tag);
  if(span.action.callback_saved)
    span.action.callback_saved(span.action, _tag);
}

tag_list.prototype.action_add_save=function(span) {
  var value=span.input.value;
  unregister_hooks_object(span);

  if(value=="") {
    span.parentNode.removeChild(span);
  }
  else {
    var save_result;
    var _tag=new tag(value, this);

    if(span.action.callback_save) {
      save_result=span.action.callback_save(span.action, _tag,
        this.action_add_save_callback.bind(this, span, _tag));
    }
    else
      save_result=true;

   // null: action_add_save_callback will be called by callback function
   if(save_result!==null)
     this.action_add_save_callback(span, _tag, save_result);
  }
}

tag_list.prototype.action_add_submit=function(span) {
  span.input.onblur=null;
  this.action_add_save(span);
  return false;
}

tag_list.prototype.action_add_blur=function(span) {
  this.action_add_save(span);
}

tag_list.prototype.action_add_keypress=function(span, event) {
}

//$(document).keydown(function(event) { call_hooks("keydown", event); });
