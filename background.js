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
	    	canvas.width = img.width;
	    	canvas.height = img.height;
	    	var context = canvas.getContext("2d");
	    	context.translate(0.5,0.5);
			context.fillStyle=state.fill;
			context.strokeStyle=state.stroke;
			context.fillRect(0,0,img.width-1,img.height-1);
	    	context.drawImage(img, -0.5, -0.5);
	    	context.strokeRect(0, 0, img.width-1,img.height-1);
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
	    var img = document.createElement("img");
	    img.addEventListener("load", onImageLoaded);
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
	}else if(request.message === "load"){
		chrome.browserAction.getBadgeText({tabId: sender.tab.id},function(txt){
		if (!txt){
			callback(true);
		}
	});
	}
	return true;
});

/*
chrome.browserAction.onClicked.addListener(function(tab){
	chrome.browserAction.getBadgeText({tabId: tab.id},function(txt){
		if (txt){
			chrome.browserAction.setBadgeText({text:"",tabId:tab.id});
			chrome.tabs.sendMessage(tab.id,{message:"enable"},function(){console.log("enabled");});
		}else {
			chrome.browserAction.setBadgeText({text:"X",tabId:tab.id});
			chrome.tabs.sendMessage(tab.id,{message:"disable"},function(){console.log("disabled");});
		}
	});
	
});
*/