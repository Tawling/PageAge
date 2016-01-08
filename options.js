var target = null;

$("#delfilter").click(function(){
	if ($("#filters li.selected label").length > 0){
		deleteFilter($("#filters li.selected label").text(),function(){
			refreshFilters();
		});
	}
});

$("#addfilter").click(function(){
	if ((""+$("#filtertxt").val()).trim()){
		addFilter((""+$("#filtertxt").val()).trim(),function(success){
			if (!success){
				$("#alreadyadded").show();
				$("#alreadyadded").fadeOut(2000);
			}
			else {
				$("#filtertxt").val("");
			}
			refreshFilters();
		});
	}
})

$("#filters li").click(function(){
	$("#filters li").removeClass("selected");
	$(this).addClass("selected");
});

$("#red").on('input',function(){
	updateValues()
});
$("#green").on('input',function(){
	updateValues()
});
$("#blue").on('input',function(){
	updateValues()
});
$("#alpha").on('input',function(){
	updateValues()
});

$(".color").click(colorClick);

$("#picker").click(function(){
	event.stopPropagation();
	return false;
});

$(document).click(function(){
	target = null;
	$("#picker").hide();
	if ($("#filters li.selected").length === 0) {
		$("#delfilter").attr("disabled",true);
	}else{
		$("#delfilter").removeAttr("disabled");
	}
});

$(document).ready(function(){
	$( "#entries" ).sortable();
    $( "#entries" ).disableSelection();
    if ($("#filters li.selected").length === 0) {
		$("#delfilter").attr("disabled",true);
	}else{
		$("#delfilter").removeAttr("disabled");
	}
	refreshFilters();
});

function updateValues(){
	$("#redspan").text($("#red").val());
	$("#greenspan").text($("#green").val());
	$("#bluespan").text($("#blue").val());
	$("#alphaspan").text($("#alpha").val());

	if (target){
		$(target).find(".r").val($("#red").val());
		$(target).find(".g").val($("#green").val());
		$(target).find(".b").val($("#blue").val());
		$(target).find(".a").val($("#alpha").val());
	}

	recolor();
}

function recolor(){
	if (target){
		var r = $(target).find(".r").val();
		var g = $(target).find(".g").val();
		var b = $(target).find(".b").val();
		var a = $(target).find(".a").val();
		$(target).find(".incolor").css("background-color","rgba("+r+","+g+","+b+","+a+")");
	}
}

function loadColor(){
	if (target){
		$("#red").val($(target).find(".r").val());
		$("#green").val($(target).find(".g").val());
		$("#blue").val($(target).find(".b").val());
		$("#alpha").val($(target).find(".a").val());
	}
}

function addEntry(data){
	var entry = document.createElement("li");
	entry.className = "entry";
	$(entry).append('<table>\
						<tr>\
							<td class="delbtn">X</td>\
							<td>\
								<div class="entry_top">\
									<p>\
										Fill:\
									</p>\
									<div class="color fill">\
										<div class="alphabg"></div>\
										<div class="incolor"></div>\
										<input class="r" type="hidden" value="255" />\
										<input class="g" type="hidden" value="0" />\
										<input class="b" type="hidden" value="0" />\
										<input class="a" type="hidden" value="1" />\
									</div>\
									<p>\
										Stroke: \
									</p>\
									<div class="color stroke">\
										<div class="alphabg"></div>\
										<div class="incolor"></div>\
										<input class="r" type="hidden" value="255" />\
										<input class="g" type="hidden" value="0" />\
										<input class="b" type="hidden" value="0" />\
										<input class="a" type="hidden" value="1" />\
									</div>\
								</div>\
								<div class="time">\
									<input class="d" type="number" max="99" min="0" step="1" value="0" size="2" /> d\
									<input class="h" type="number" max="24" min="0" step="1" value="0" size="2" /> h\
									<input class="m" type="number" max="60" min="0" step="1" value="5" size="2" /> m\
									<input class="s" type="number" max="60" min="0" step="1" value="0" size="2" /> s\
								</div>\
							</td>\
					</tr>\
				</table>');
	$(entry).find(".color").click(colorClick);
	$(entry).find(".delbtn").click(deleteClick);
	if (data){
		var fill = $(entry).find(".fill")
		$(fill).find(".r").val(data.fill.r);
		$(fill).find(".g").val(data.fill.g);
		$(fill).find(".b").val(data.fill.b);
		$(fill).find(".a").val(data.fill.a);

		$(entry).find(".stroke .r").val(data.stroke.r);
		$(entry).find(".stroke .g").val(data.stroke.g);
		$(entry).find(".stroke .b").val(data.stroke.b);
		$(entry).find(".stroke .a").val(data.stroke.a);

		$(entry).find(".d").val(data.d);
		$(entry).find(".h").val(data.h);
		$(entry).find(".m").val(data.m);
		$(entry).find(".s").val(data.s);
	}
	$("#entries").append(entry);
	return entry;
}

function colorClick(){
	target = this;
	loadColor();
	updateValues();
	$("#picker").css({left: $(this).offset().left + $(this).width()*2/3, top:$(this).height()*2/3 + $(this).offset().top})
	$("#picker").show();
	event.stopPropagation();
}

function deleteClick(){
	console.log($(this).parent);
	$(this).parent().parent().parent().parent().remove();
}
$("#add").click(function(){addEntry()});

$("#save").click(save_options);

$(document).ready(function(){
	restore_options();
});

function restore_options(){
	chrome.storage.sync.get({entries: [
		{"d":0,"fill":{"a":0,"b":0,"g":0,"r":0},"h":0,"m":0,"s":0,"stroke":{"a":0,"b":0,"g":255,"r":0}},
		{"d":0,"fill":{"a":0,"b":0,"g":0,"r":255},"h":1,"m":0,"s":0,"stroke":{"a":1,"b":0,"g":255,"r":0}},
		{"d":0,"fill":{"a":0,"b":255,"g":0,"r":0},"h":11,"m":0,"s":0,"stroke":{"a":1,"b":255,"g":255,"r":0}},
		{"d":0,"fill":{"a":0,"b":255,"g":0,"r":0},"h":12,"m":0,"s":0,"stroke":{"a":1,"b":255,"g":0,"r":0}},
		{"d":6,"fill":{"a":0,"b":0,"g":0,"r":255},"h":0,"m":0,"s":0,"stroke":{"a":1,"b":0,"g":0,"r":255}},
		{"d":7,"fill":{"a":1,"b":0,"g":0,"r":255},"h":0,"m":0,"s":0,"stroke":{"a":1,"b":0,"g":0,"r":255}}
		]	
		/*[
		{stroke: {r:0, g:0, b:0, a:1}, fill: {r:0, g:0, b:0, a:1}, d: 0, h: 0, m: 0, s: 5},
		{stroke: {r:255, g:0, b:0, a:1}, fill: {r:255, g:0, b:0, a:1}, d: 0, h: 0, m: 0, s: 10},
		{stroke: {r:0, g:0, b:255, a:1}, fill: {r:0, g:0, b:255, a:1}, d: 0, h: 0, m: 0, s: 30},
		{stroke: {r:0, g:0, b:255, a:0}, fill: {r:0, g:0, b:255, a:0}, d: 0, h: 0, m: 5, s: 0}
	]*/}, function(items){
		for(var i = 0; i < items.entries.length; i++){
			var e = addEntry(items.entries[i]);
			target = $(e).find(".fill");
			loadColor();
			recolor();
			target = $(e).find(".stroke");
			loadColor();
			recolor();
		}
		target = null;
	});
}

function save_options(){
	var entries = [];
	$(".entry").each(function(i,entry){
		var fill = $(entry).find(".fill")
		var stroke = $(entry).find(".stroke")
		var data = {
			fill:{
				r: parseInt($(fill).find(".r").val()),
				g: parseInt($(fill).find(".g").val()),
				b: parseInt($(fill).find(".b").val()),
				a: parseFloat($(fill).find(".a").val())
			},
			stroke: {
				r: parseInt($(stroke).find(".r").val()),
				g: parseInt($(stroke).find(".g").val()),
				b: parseInt($(stroke).find(".b").val()),
				a: parseFloat($(stroke).find(".a").val())
			},
			d: parseFloat($(entry).find(".d").val()),
			h: parseFloat($(entry).find(".h").val()),
			m: parseFloat($(entry).find(".m").val()),
			s: parseFloat($(entry).find(".s").val())
		}
		entries.push(data);
	});

	//do the same for filters

	chrome.storage.sync.set({
		entries: entries
	}, function() {
		alert("saved");
	});
}


function addFilter(filter,callback){
	//callback true if added properly
	//callback false if filter already exists
	chrome.storage.sync.get({
		exceptions: []
	},function(items){
		if (items.exceptions.indexOf(filter) === -1) {
			items.exceptions.push(processFilter(filter));
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

function deleteFilter(filter,callback){
	//callback true if deleted properly
	//callback false if filter didn't exist
	chrome.storage.sync.get({
		exceptions: []
	},function(items){
		for(var i = 0; i < items.exceptions.length; i++){
			if (items.exceptions[i].display === filter){
				items.exceptions.splice(i,1);
				chrome.storage.sync.set({
					exceptions:items.exceptions
				},function(){
					callback(true);
				});
				return;
			}
		}
		callback(false);
	});
}

function refreshFilters(){
	$("#filters").empty();
	chrome.storage.sync.get({
		exceptions: []
	},function(items){
		for (var i of items.exceptions){
			var li = document.createElement("li");
			$(li).click(function(){
				$("#filters li").removeClass("selected");
				$(this).addClass("selected");
			});
			$(li).append("<label>"+i.display+"</label>");
			$("#filters").append(li);
		}
	});
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
  re += filter[1].domain.replace(".*.","\uFFFD").replace(".*","\uFFFE").replace("*.","\uFFFF").replace("*","[\\-\\w]*").replace("\uFFFD","(?:\\.(?:[\\-\\w]+\\.)+)?").replace("\uFFFE","(?:\\.[\\-\\w]+)*").replace("\uFFFF","(?:[\\-\\w]+\\.)*");
  //add path
  re += filter[2].dir.replace(/([\(\)\[\]\{\}\^\$\|\?\+\.\<\>\-\=\!])/g,"\\$1").replace("/*/","\uFFFD").replace("/*","\uFFFE").replace("*/","\uFFFF").replace(/\//g,"\\/").replace("*","[^\\/\\?\\&]*").replace("\uFFFD","(?:\\/(?:[^\\/\\?\\&]+\\/)+)?").replace("\uFFFE","(?:\\/[^\\/\\?\\&]+)*").replace("\uFFFF","(?:[^\\/\\?\\&]+\\/)*");
  if (filter[2].addwc){
  	re += "(?:\\/[^\\/\\?\\&]+)*";
  }
  re += "\\/?$"
  var queries = [];
  for(var q of filter[3]){
  	queries.push("^"+q.replace(/([\(\)\[\]\{\}\^\$\|\?\+\.\<\>\-\=\!])/g,"\\$1").replace("*","[^\\&\\?]*")+"$");
  }
  return {re:re,q: queries, display: filter[0]+"://"+filter[1].display+"/"+filter[2].display+(filter[3].length ?"?"+filter[3].join("&") : "")};
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
  	return {dir: "/" + split.join("/"),addwc: true, display: split.join("/")+"(/*)"}
  }
	return {dir: "/" + split.join("/"), addwc: false, display: split.join("/")};
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