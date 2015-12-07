(function(){
if (!$("link[rel~='icon'").length){
	link = document.createElement("link");
	link.setAttribute("rel", "icon");
	link.href = getBaseURL()+"favicon.ico";
	document.head.appendChild(link);
}

$("link[rel~='icon'").each(function(index, element){
	var link = element;
	var iconUrl = link.href;
	var startTime = Date.now();
	var timer = false;;
	function getIcon(){
		var payload = {message:"icon", base: getBaseURL(), url: window.location.href, iconurl: iconUrl, startTime: startTime};
		chrome.runtime.sendMessage(payload,function(response) {
		    link.type = "image/x-icon";
		    link.href = response.data;
		    if (response.delay > -1){
				if (timer){
					clearInterval(timer);
					timer = false;
				}
				timer = setTimeout(getIcon, response.delay);
			}
		});
	}
	chrome.runtime.sendMessage({message: "load"},function(data){
		getIcon();
	});

	chrome.runtime.onMessage.addListener(function(request,sender,callback){
		if (request.message === "enable"){
			if (timer){
				clearInterval(timer);
				timer = false;
			}
			getIcon();
		}else if(request.message === "disable"){
			if (timer){
				clearInterval(timer);
				timer = false;
			}
			link.type = "";
		    link.href = iconUrl;
		}
	});
});

function getBaseURL () {
   return location.protocol + "//" + location.hostname + 
      (location.port && ":" + location.port) + "/";
}
}())
