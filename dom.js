/*********************************
*  CP/KM web written by Katsumi  *
*    This script is released     *
*      under the LGPL v2.1.      *
*********************************/

window.onkeydown=function(e){
 	i8255.keydown(e.keyCode,e.shiftKey,e.ctrlKey);
	return false;
};
window.onkeyup=function(e){
 	i8255.keyup(e.keyCode,e.shiftKey,e.ctrlKey);
	return false;
};

dom=Object();
dom.getElement=function(id){
	try {
		var ret=document.getElementById(id);
		return ret;
	} catch(e) {
		alert("'"+id+"' isn't an element!");
	}
};
dom.getContext=function(id){
	try {
		var ret=document.getElementById(id).getContext("2d");
		return ret;
	} catch(e) {
		alert("'"+id+"' isn't a context!");
	}
};
dom.x=function(obj,e){
	var x;
	if (typeof e.pageX != "undefined") { 
	  x = e.pageX;
	} else {
	  x = e.clientX + document.body.scrollLeft + document.documentElement.scrollLeft; 
	}
	x -= obj.offsetLeft;
	return x;
};
dom.y=function(obj,e){
	var y;
	if (typeof e.pageY != "undefined") { 
	  y = e.pageY;
	} else {
	  y = e.clientY + document.body.scrollTop + document.documentElement.scrollTop; 
	}
	y -= obj.offsetTop;
	return y;
};
dom.showSpeed=function(speed){
	document.getElementById("speed").innerHTML="clock: "+speed+" hz";
};
dom.showDebug=function(){
	var classes=document.getElementsByClassName("debug");
	for(i=0;i<classes.length;i++){
		classes[i].style.display="block";
	}
};
dom.debug=function(str){
	document.getElementById("debug").innerHTML=str;
};
dom.displaylog=function(str){
	document.getElementById("displaylog").innerHTML+=str;
};
dom.dump=function(str){
	document.getElementById("dump").innerHTML=str;
};
dom.clickStep=function(){
	clickStep();
};
dom.clickCont=function(){
	clickCont();
};
dom.clickStopAt=function(){
	clickStopAt(prompt('Break at (hex):'));
};
dom.clickLogTo=function(){
	clickLogTo(prompt('Log to (hex):'));
};
dom.clickDump=function(){
	clickDump(prompt('Dump at (hex):'));
};

