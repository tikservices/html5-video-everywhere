"use struct";
var el_ver = document.getElementById("version");
var ver = location.hash.match(/[#&]v=([0-9.]*)/);

if(ver)
	el_ver.textContent = "Version: " + ver[1];
