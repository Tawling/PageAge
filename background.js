var default_entries = [
	{stroke: {r:0, g:0, b:0, a:1}, fill: {r:0, g:0, b:0, a:1}, d: 0, h: 0, m: 0, s: 5},
	{stroke: {r:255, g:0, b:0, a:1}, fill: {r:255, g:0, b:0, a:1}, d: 0, h: 0, m: 0, s: 10},
	{stroke: {r:0, g:0, b:255, a:1}, fill: {r:0, g:0, b:255, a:1}, d: 0, h: 0, m: 0, s: 30},
	{stroke: {r:0, g:0, b:255, a:0}, fill: {r:0, g:0, b:255, a:1}, d: 0, h: 0, m: 5, s: 0}
];

function getFavicon(request, sender, callback) {
	var time = Date.now() - request.startTime;
	chrome.storage.sync.get({
		entries: default_entries
	}, function(items) {
		var faviconUrl = 'chrome://favicon/' + request.url;
	    var state = getState(items.entries, time);
	    var failed = false;
	    function onImageLoaded() {
	    	var canvas = document.createElement("canvas");
	    	canvas.width = 16;//img.width;
	    	canvas.height = 16;//img.height;
	    	var context = canvas.getContext("2d");
	    	context.translate(0.5,0.5);
			context.fillStyle=state.fill;
			context.strokeStyle=state.stroke;
			context.fillRect(0,0,15,15);

			var targetHeight, ratio = img.width / img.height;
			var targetWidth = targetHeight = Math.min(16,Math.max(img.width, img.height));

			if (ratio < 1){
				targetWidth = targetHeight * ratio;
			} else {
				targetHeight = targetWidth / ratio;
			}

	    	context.drawImage(img, 7.5 - targetWidth/2, 7.5 - targetHeight/2, targetWidth, targetHeight);
	    	context.strokeRect(0, 0, 15, 15);

	    	try{
	    		callback({data: canvas.toDataURL(), delay: getDelay(state.time)});
	    	}catch(e){
	    		//in case of cross-origin issues
	    		//I didn't really care about this much
	    		if (failed){
	    			callback(request.base+"favicon.ico")
	    			return false;
	    		}
	    		failed = true;
	    		img.src=faviconUrl; //try using chrome's cached url
	    	}
	    };
	    function onError(){
	    	if (!err){
	    		img.src=faviconUrl;
	    		err = true;
	    	}
	    }
	    var img = document.createElement("img");
	    img.addEventListener("load", onImageLoaded);
	    img.addEventListener("error",onError);
	    img.src = request.iconurl;
	});
    
    return true;
};

function getColorBetween(c1, c2, t){
	return {
		r: Math.min(255,Math.max(0,Math.floor(c1.r + (c2.r - c1.r) * t))),
		g: Math.min(255,Math.max(0,Math.floor(c1.g + (c2.g - c1.g) * t))),
		b: Math.min(255,Math.max(0,Math.floor(c1.b + (c2.b - c1.b) * t))),
		a: Math.min(1,Math.max(0,c1.a + (c2.a - c1.a) * t))
	};
}

function getState(arr, time){
	var timesum = 0;
	var curGoal = null;
	var prevGoal = null;
	var timeIntoGoal = time;
	for(var i = 0; i < arr.length; i++){
		timesum += convertTime(arr[i]);
		if (timesum > time){
			curGoal = arr[i];
			if (!prevGoal){
				prevGoal = {stroke: {r: arr[i].stroke.r, g: arr[i].stroke.g, b: arr[i].stroke.b, a: 0},fill: {r: arr[i].fill.r, g: arr[i].fill.g, b: arr[i].fill.b, a: 0}, d: 0, h: 0, m: 0, s: 0};
			}
			break;
		}
		timeIntoGoal -= convertTime(arr[i]);
		prevGoal = arr[i];
	}
	if (curGoal){
		var goalTime = convertTime(curGoal);
		var p = timeIntoGoal / goalTime;
		var c = getColorBetween(prevGoal.stroke, curGoal.stroke, p);
		var stroke = rgba(getColorBetween(prevGoal.stroke, curGoal.stroke, p));
		var fill = rgba(getColorBetween(prevGoal.fill, curGoal.fill, p));
		return {stroke: stroke, fill: fill, time: goalTime};
	}
	else if (prevGoal){
		var stroke = rgba({r: prevGoal.stroke.r, g: prevGoal.stroke.g, b: prevGoal.stroke.b, a: prevGoal.stroke.a});
		var fill = rgba({r: prevGoal.fill.r, g: prevGoal.fill.g, b: prevGoal.fill.b, a: prevGoal.fill.a});
		var goalTime = -1;
		return {stroke: stroke, fill: fill, time: goalTime};
	} else {
		return {stroke: rgba({r: 0, g: 0, b: 0, a: 0}), fill: rgba({r: 0, g: 0, b: 0, a: 0}), time: -1};
	}
}

function getDelay(goalTime){
	if (goalTime < 0){
		return 3600000;
	}
	return Math.max(500,goalTime/255);
}

function rgba(color){
	return "rgba("+color.r+","+color.g+","+color.b+","+color.a+")";
}

function convertTime(entry){
	 return 1000 * ( 60 * ( 60 * ( 24 * entry.d + entry.h) + entry.m) + entry.s);
}

chrome.runtime.onMessage.addListener(function(request, sender, callback){
	if (request.message === "icon"){
		getFavicon(request,sender,callback);
	}else if (request.message === "load"){
		getTabState(sender.tab, function(state){
			console.log("load state: " + state);
			if (state === "enabled" || state === "temp"){
				sessionStorage.setItem("PageAge+"+sender.tab.id,"enabled");
				callback(true);
			}
		})
	}else if (request.message === "popup-select") {
		chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
		    var tab = tabs[0];
		    var newstate = request.state;
			getTabState(tab, function(state){
				if (state === "page"){
					callback(true);
				}
				switch(newstate){
					case "enabled":
						chrome.tabs.sendMessage(tab.id,{message:"enable"},function(){console.log("enabled");});
						if (state ==="page"){
							//ONLY ENABLE TEMPORARILY
							sessionStorage.setItem("PageAge+"+tab.id,"enabled-temp");
							callback("enabled-temp")
						}
						else {
							sessionStorage.setItem("PageAge+"+tab.id,"enabled");
							callback("enabled");
						}
						break;
					case "temp":
						sessionStorage.setItem("PageAge+"+tab.id,"temp");
						chrome.tabs.sendMessage(tab.id,{message:"disable"},function(){console.log("temp disabled");});
						callback("temp");
						break;
					case "tab":
						sessionStorage.setItem("PageAge+"+tab.id,"tab");
						chrome.tabs.sendMessage(tab.id,{message:"disable"},function(){console.log("tab disabled");});
						callback("tab");
						break;
					case "page":
						chrome.tabs.sendMessage(tab.id,{message:"disable"},function(){console.log("pagedisabled");});
						callback("page");
						break;
				}
			})
		});
	}
	else if(request.message === "popup-load"){
		chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
		    var tab = tabs[0];
			getTabState(tab, function(state){
				callback(state);
			});
		});
	}
	else if (request.message === "filter-add") {
		chrome.storage.sync.get({
			exceptions: []
		},function(items){
			if (items.exceptions.indexOf(message.filter) === -1) {
				items.exceptions.push(message.filter);
				chrome.storage.sync.set({
					exceptions:items.exceptions
				},function(){
					callback(true);
				});
			}else {
				callback(false);
			}
		});
	}
	return true;
});



function getTabState(tab, callback){
	chrome.storage.sync.get({
		exceptions: []
	},function(items){
		var ss = tab.id ? sessionStorage.getItem("PageAge+"+tab.id) : null;
		if (tab.url){
			var re, pat;
			for(pat of items.exceptions){
				try{
					re = patternToRegExp(pat);
					if (re.test(tab.url)){
						if (ss === "tab" || ss === "temp" || ss === "enabled-temp"){
							callback(ss,"page")
						}else{
							callback("page");
						}
						return;
					}
				}catch(e){
					//do nothing for now
					console.error(e);
				}
			}
		}
		if (ss === "temp" || ss === "tab" || ss === "enabled" || ss === "enabled-temp"){
			callback(ss);
			return;
		}
		callback("enabled");
	})
}


function patternToRegExp(pattern){
  if(pattern == "<all_urls>") return /^(?:http|https|file|ftp):\/\/.*/;

  var split = /^(\*|http|https|file|ftp):\/\/(.*)$/.exec(pattern);
  if(!split) throw Error("Invalid schema in " + pattern);
  var schema = split[1];
  var fullpath = split[2];

  var split = /^([^\/]*)\/(.*)$/.exec(fullpath);
  if(!split) throw Error("No path specified in " + pattern);
  var host = split[1];
  var path = split[2];

  // File 
  if(schema == "file" && host != "")
    throw Error("Non-empty host for file schema in " + pattern);

  if(schema != "file" && host == "")
    throw Error("No host specified in " + pattern);  

  if(!(/^(\*|\*\.[^*]+|[^*]*)$/.exec(host)))
    throw Error("Illegal wildcard in host in " + pattern);

  var reString = "^";
  reString += (schema == "*") ? "https*" : schema;
  reString += ":\\/\\/";
  // Not overly concerned with intricacies
  //   of domain name restrictions and IDN
  //   as we're not testing domain validity
  reString += host.replace(/\*\.?/, "[^\\/]*");
  reString += "\\/";
  reString += path.replace("*", ".*");
  reString += "$";

  return RegExp(reString);
}