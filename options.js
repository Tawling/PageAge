var target = null;

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
})

$(document).click(function(){
	target = null;
	$("#picker").hide();
});

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
	var entry = document.createElement("div");
	entry.className = "entry";
	$(entry).append('<div class="delbtn">X</div>\
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
				</div>');
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
	$(this).parent().remove();
}
$("#add").click(function(){addEntry()});

$("#save").click(save_options);

$(document).ready(function(){
	restore_options();
});

function restore_options(){
	chrome.storage.sync.get({entries: [
		{stroke: {r:0, g:0, b:0, a:1}, fill: {r:0, g:0, b:0, a:1}, d: 0, h: 0, m: 0, s: 5},
		{stroke: {r:255, g:0, b:0, a:1}, fill: {r:255, g:0, b:0, a:1}, d: 0, h: 0, m: 0, s: 10},
		{stroke: {r:0, g:0, b:255, a:1}, fill: {r:0, g:0, b:255, a:1}, d: 0, h: 0, m: 0, s: 30},
		{stroke: {r:0, g:0, b:255, a:0}, fill: {r:0, g:0, b:255, a:0}, d: 0, h: 0, m: 5, s: 0}
	]}, function(items){
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
				a: parseInt($(fill).find(".a").val())
			},
			stroke: {
				r: parseInt($(stroke).find(".r").val()),
				g: parseInt($(stroke).find(".g").val()),
				b: parseInt($(stroke).find(".b").val()),
				a: parseInt($(stroke).find(".a").val())
			},
			d: parseInt($(entry).find(".d").val()),
			h: parseInt($(entry).find(".h").val()),
			m: parseInt($(entry).find(".m").val()),
			s: parseInt($(entry).find(".s").val())
		}
		entries.push(data);
	});

	chrome.storage.sync.set({
		entries: entries
	}, function() {
		alert("saved");
	});
}