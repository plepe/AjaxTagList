/* ajax.js
 * - JavaScript code that is used globally
 *
 * Copyright (c) 1998-2006 Stephan Plepelits <skunk@xover.mud.at>
 *
 * This program is free software; you can redistribute it and/or
 * modify it under the terms of the GNU General Public License
 * as published by the Free Software Foundation; either version 2
 * of the License, or (at your option) any later version.
 * 
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 * 
 * You should have received a copy of the GNU General Public License
 * along with this program; if not, write to the Free Software
 * Foundation, Inc., 59 Temple Place - Suite 330, Boston, MA  02111-1307, USA.
 */
var last_params;

// ajax - calls a php_function with params
// parameter:
// funcname       the name of the php-function. the php-function has to 
//                be called "ajax_"+funcname
// param          an associative array of parameters
// postdata       (optional) data which should be posted to the server. it will
//                be passed to the ajax_[funcname] function as third parameter.
// callback       a function which will be called when the request ist 
//                finished. if empty the call will be syncronous and the
//                result will be returned
//
// return value/parameter to callback
// response       the status of the request
//  .responseText the response as plain text
//  .responseXML  the response as DOMDocument (if valid XML)
//  .return_value the return value of the function
function ajax(funcname, param, postdata, callback) {
  // private
  this.xmldata;
  // public
  var req=false;
  var sync;

  function get_return() {
    req.return_value=json_decode(req.responseText);
  }

  function req_change() {
    if(req.readyState==4) {
      if(req.status==0)
	return;

      get_return();

      if(callback)
        callback(req);
    }
  }

  // branch for native XMLHttpRequest object
  if(window.XMLHttpRequest) {
    try {
      req = new XMLHttpRequest();
    }
    catch(e) {
      req = false;
    }
    // branch for IE/Windows ActiveX version
  } else if(window.ActiveXObject) {
    try {
      req = new ActiveXObject("Msxml2.XMLHTTP");
    }
    catch(e) {
      try {
        req = new ActiveXObject("Microsoft.XMLHTTP");
      }
      catch(e) {
        req = false;
      }
    }
  }

  if(req) {
    var p=new Array();
    ajax_build_request(param, "param", p);
    p=p.join("&");

    if(typeof(postdata)=="function") {
      callback=postdata;
      postdata="";
    }
    else if(!postdata)
      postdata="";

    req.onreadystatechange = req_change;
    sync=callback!=null;
    req.open((postdata==""?"GET":"POST"),
             "ajax.php?func="+funcname+"&"+p, sync);
    last_params=p;

    if(postdata!="") {
      req.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
      req.setRequestHeader("Content-length", postdata.length);
      req.setRequestHeader("Connection", "close");
    }

    req.send(postdata);

    if(!sync) {
      get_return();
    }
  }

  return req;
}

function ajax_build_request(param, prefix, ret) {
  if(typeof param=="object") {
    for(var k in param) {
      if(!prefix)
	ajax_build_request(param[k], k, ret);
      else
	ajax_build_request(param[k], prefix+"["+k+"]", ret);
    }
  }
  else if(typeof param=="number") {
    ret.push(prefix+"="+String(param));
  }
  else if(typeof param=="string") {
    ret.push(prefix+"="+urlencode(param));
  }
  else if(typeof param=="undefined") {
    ret.push(prefix+"="+0);
  }
  else if(typeof param=="function") {
    // ignore functions
  }
  else {
    alert("not supported var type: "+typeof param);
  }
}

// Source: http://phpjs.org/functions/urlencode:573
function urlencode (str) {
    str = (str + '').toString();

    // Tilde should be allowed unescaped in future versions of PHP (as reflected below), but if you want to reflect current
    // PHP behavior, you would need to add ".replace(/~/g, '%7E');" to the following.
    return encodeURIComponent(str).replace(/!/g, '%21').replace(/'/g, '%27').replace(/\(/g, '%28').
    replace(/\)/g, '%29').replace(/\*/g, '%2A').replace(/%20/g, '+');
}


