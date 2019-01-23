"use strict";
function styleSheetToggle() {
    var element = document.getElementById("theme2");
    if (!element.href) {
        element.href = "theme2.css";
    } else {
        element.removeAttribute("href");
    }
    createCookie("theme2", element.href, 365);
}
(function () {
    var element = document.getElementById("theme2");
    if (readCookie("theme2")) {styleSheetToggle();}
})();


function createCookie(name, value, days) {
    if (days) {
	    var date = new Date();
	    date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
	    var expires = "; expires=" + date.toGMTString();
	}
	else var expires = "";
	document.cookie = name + "=" + value + expires + "; path=/";
}

function readCookie(name) {
	var nameEQ = name + "=";
    if (!document.cookie || !document.cookie.match(name)) {return;} //added this to prevent errors
	var ca = document.cookie.split(';');
	for (var i=0; i < ca.length; i++) {
		var c = ca[i];
		while (c.charAt(0) == ' ') c = c.substring(1, c.length);
		if (c.indexOf(nameEQ) == 0) return c.substring(nameEQ.length, c.length);
	}
    return c;
}
function eraseCookie(name) {createCookie(name, "", -1);}