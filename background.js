var default_entries = [
		{"d":0,"fill":{"a":0,"b":0,"g":0,"r":0},"h":0,"m":0,"s":0,"stroke":{"a":0,"b":0,"g":255,"r":0}},
		{"d":0,"fill":{"a":0,"b":0,"g":0,"r":255},"h":1,"m":0,"s":0,"stroke":{"a":1,"b":0,"g":255,"r":0}},
		{"d":0,"fill":{"a":0,"b":255,"g":0,"r":0},"h":11,"m":0,"s":0,"stroke":{"a":1,"b":255,"g":255,"r":0}},
		{"d":0,"fill":{"a":0,"b":255,"g":0,"r":0},"h":12,"m":0,"s":0,"stroke":{"a":1,"b":255,"g":0,"r":0}},
		{"d":6,"fill":{"a":0,"b":0,"g":0,"r":255},"h":0,"m":0,"s":0,"stroke":{"a":1,"b":0,"g":0,"r":255}},
		{"d":7,"fill":{"a":1,"b":0,"g":0,"r":255},"h":0,"m":0,"s":0,"stroke":{"a":1,"b":0,"g":0,"r":255}}
	];

function getFavicon(request, sender, callback) {
	var time = Date.now() - request.startTime;
	var err = false;
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
		getTabState(sender.tab, function(state, pageFlag){
			console.log("load state: " + state);
			if ((state === "enabled" || state === "temp") && !pageFlag){
				sessionStorage.setItem("PageAge+"+sender.tab.id,"enabled");
				callback(true);
			}else if (pageFlag){
				sessionStorage.setItem("PageAge+"+sender.tab.id,"page");
			}
		})
	}else if (request.message === "popup-select") {
		chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
		    var tab = tabs[0];
		    var newstate = request.state;
			getTabState(tab, function(state,pageFlag){
				if (state === "page"){
					//callback("page",pageFlag);
					pageFlag = true;
				}
				console.log("pageflag="+pageFlag);
				switch(newstate){
					case "enabled":
						chrome.tabs.sendMessage(tab.id,{message:"enable"},function(){console.log("enabled");});
						if (state ==="page" || pageFlag){
							//ONLY ENABLE TEMPORARILY
							sessionStorage.setItem("PageAge+"+tab.id,"enabled-temp");
							callback({selection: "enabled-temp", p: pageFlag})
						}
						else {
							sessionStorage.setItem("PageAge+"+tab.id,"enabled");
							callback({selection: "enabled", p: pageFlag});
						}
						break;
					case "temp":
						sessionStorage.setItem("PageAge+"+tab.id,"temp");
						chrome.tabs.sendMessage(tab.id,{message:"disable"},function(){console.log("temp disabled");});
						callback({selection: "temp", p: pageFlag});
						break;
					case "tab":
						sessionStorage.setItem("PageAge+"+tab.id,"tab");
						chrome.tabs.sendMessage(tab.id,{message:"disable"},function(){console.log("tab disabled");});
						callback({selection: "tab", p: pageFlag});
						break;
					case "page":
						chrome.tabs.sendMessage(tab.id,{message:"disable"},function(){console.log("pagedisabled");});
						callback({selection: "page", p: pageFlag});
						break;
				}
			})
		});
	}
	else if(request.message === "popup-load"){
		chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
		    var tab = tabs[0];
		    console.log(tab.url);
			getTabState(tab, function(state,pageFlag){
				callback({selection: state, p: pageFlag});
			});
		});
	}
	else if (request.message === "filter-add") {
		chrome.storage.sync.get({
			exceptions: []
		},function(items){
			console.log("adding filter: " + request.filter)
			if (items.exceptions.indexOf(request.filter) === -1) {
				items.exceptions.push(processFilter(request.filter));
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
			var filter;
			for(filter of items.exceptions){
				try{
					if (matchFilter(filter,tab.url)){
						if (ss === "tab" || ss === "temp" || ss === "enabled-temp"){
							console.log("SS PAGE");
							callback(ss,"page")
						}else{
							console.log("PAGE PAGE");
							callback("page","page");
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
			if (ss === "enabled-temp"){
				console.log("ETEMP");
				callback(ss,"page");
			}else{
				console.log("DEFAULT SS");
				callback(ss);
			}
			return;
		}
		console.log("DEFAULT");
		callback("enabled");
	})
}

function processFilter(input){
	filter = splitFilter(input);
	filter[1] = cleanDomain(filter[1]);
	filter[2] = cleanDir(filter[2]);
	//var display = filter[0]+"://"+filter[1].display+"/"+filter[2].display+"?"+filter[3].join("&");
	filter = filterToRegex(filter);
	//filter.display = display;
	return filter;
}

function matchFilter(filter, url){
	var q = url.split(/[\?\&]/g);
  //console.log(q);
	if (new RegExp(filter.re,"i").test(q[0])){
  	for(var query of filter.q){
    	var matches = false;
      for(var i = 1; !matches && i < q.length; i++){
      	matches = new RegExp(query).test(q[i])
        //console.log(query + "  :  " + q[i] + "    " + matches);
      }
      if (!matches) return false;
    }
    return true;
  }
  return false;
}

function filterToRegex(filter){
	//create expression and add scheme
  var re = "^" + filter[0].replace("*","[\\-\\.\\+\\w]*") + ":(?:\\/\\/)?";
  //add domain
  if (filter[1].addwww){
  	re += "(?:www\\.)?";
  }
  re += filter[1].domain.replace(".*.","\uFFFD").replace(".*","\uFFFE").replace("*.","\uFFFF").replace("*","[\\-\\w]*").replace("\uFFFD","(?:\\.(?:[\\-\\w]+\\.)+)?").replace("\uFFFE","(?:\\.[\\-\\w]+)*").replace("\uFFFF","(?:[\\-\\w]+\\.)*") + "\\/";
  //add path
  re += filter[2].dir.replace(/([\(\)\[\]\{\}\^\$\|\?\+\.\<\>\-\=\!])/g,"\\$1").replace("/*/","\uFFFD").replace("/*","\uFFFE").replace("*/","\uFFFF").replace("*","[^\\/\\?\\&]*").replace("\uFFFD","(?:\\/(?:[^\\/\\?\\&]+\\/)+)?").replace("\uFFFE","(?:\\/[^\\/\\?\\&]+)*").replace("\uFFFF","(?:[^\\/\\?\\&]+\\/)*");
  if (filter[2].addwc){
  	re += "(?:\\/[^\\/\\?\\&]+)*";
  }
  re += "\\/?$"
  var queries = [];
  for(var q of filter[3]){
  	queries.push("^"+q.replace(/([\(\)\[\]\{\}\^\$\|\?\+\.\<\>\-\=\!])/g,"\\$1").replace("*","[^\\&\\?]*")+"$");
  }
  return {re:re ,q: queries, display: filter[0]+"://"+filter[1].display+"/"+filter[2].display+(filter[3].length ?"?"+filter[3].join("&") : "")};
}

function cleanDomain(domain){
	if (domain[0] === "."){
  	domain = "*" + domain;
  }
  if (domain[domain.length-1] === "."){
  	domain += "*";
  }
  if (domain.split(".")[0] !== "*"){
  	domain = domain.split(".");
    if (domain[0] === "www") {
      domain.shift();
    }
    domain = domain.join(".");
    return {domain: domain === "*" ? "*.*" : domain, display: "(www.)"+domain, addwww: true}
  }
  return {domain: domain === "*" ? "*.*" : domain, display: domain, addwww: false};
}

function cleanDir(dir){
	var split = (" "+dir+" ").split("/");
  var last = split.length-1;
  split[0] = split[0].trim();
  split[last] = split[last].trim();
  if (split[last] && split[last] !== "*"){
  	return {dir: split.join("/"),addwc: true, display: split.join("/")+"(/*)"}
  }
	return {dir: split.join("/"), addwc: false, display: split.join("/")};
}

function splitFilter(input){
	var scheme = "*";
	var domain = "*";
	var dir = "*";
	var query = [];
	var unprocessed = input;
  
  if (unprocessed[0]=== "?" || unprocessed[0] === "&"){
  	unprocessed = "*://*/*"+unprocessed;
  }

	var s1 = unprocessed.split(/:(?:\/\/)?/);
	if (s1.length > 1){
		scheme = s1[0];
		unprocessed = s1[1];
	}
	//var s2 = unprocessed.split("/");
	var s2 = [unprocessed.substring(0,unprocessed.indexOf("/") > -1 ? unprocessed.indexOf("/") : unprocessed.length), unprocessed.indexOf("/") > -1 ? unprocessed.substring(unprocessed.indexOf("/")+1) : undefined];
	if (s2[1] === undefined) s2.pop();
	domain = s2[0] ? s2[0] : "*";
	if (s2.length > 1) {
		unprocessed = s2[1];
		if (unprocessed.indexOf("?") > -1){
			var s3 = [unprocessed.substring(0,unprocessed.indexOf("?") > -1 ? unprocessed.indexOf("?") : unprocessed.length), unprocessed.indexOf("?") > -1 ? unprocessed.substring(unprocessed.indexOf("?")+1) : undefined];
    }else if(unprocessed.indexOf("&")){
    	var s3 = [unprocessed.substring(0,unprocessed.indexOf("&") > -1 ? unprocessed.indexOf("&") : unprocessed.length), unprocessed.indexOf("&") > -1 ? unprocessed.substring(unprocessed.indexOf("&")+1) : undefined];
    }
		if (!s3[1]) s3.pop();
		dir = s3[0];
		if (s3.length > 1) {	//if there is no query, try using & instead of ?
			query = s3[1];
			query = query.split("&");
		}
	}



	//console.log("scheme = " + scheme);
	//console.log("domain = " + domain);
	//console.log("dir = " + dir);
	//console.log("query = " + query);
	return [scheme,domain,dir,query];
}