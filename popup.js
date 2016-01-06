var pflag = false;

$(document).ready(function(){
	//get the state from background
	chrome.runtime.sendMessage({message: "popup-load"},function(data){
		
		updateState(data.selection,data.p);

		$("input:radio").change(function(){
			checkChange();
		})
	});
});

$("#settings").click(function(){
	chrome.tabs.create({ url: "options.html" });
});

$("#undo").click(function(){
	if (pflag) $("#rpage").prop("checked",true);
	else $("#renabled").prop("checked",true);
	checkChange();
});

$("#addfilter").click(function(){
		chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
		    var tab = tabs[0];
		    console.log(tab);
		    var url = tab.url.split("://")[1].split("/")[0];
		    console.log(url)
		    chrome.runtime.sendMessage({message:"filter-add",filter:url},function(data){
		    	console.log("added or something: "+ data)
		    	$("#addfilter").hide();
		    	chrome.runtime.sendMessage({message: "popup-load"},function(data){
					updateState(data.selection,data.p);
				});
		    });
		});
});

function checkChange(){
	//change bar text
	var val = $("input[name='state']:checked").val();
	//Send message to background
	chrome.runtime.sendMessage({message: "popup-select",state:val},function(data){
		//do the thing
		updateState(data.selection,data.p);
	});
}

function updateState(state, pageFlag){
	pflag = pageFlag;
	$("#undospan").show();
	if (pageFlag){ //if the page is techincally found in the list of excepted stuff...
		//show that the current page is in the disabled list
		//dotted background or something. I dunno.
	}
	if (pflag){
		$("#addfilter").hide();
	}else{
		$("#addfilter").show();
	}
	$("#denabled").removeClass("checked");
	$("#dtemp").removeClass("checked");
	$("#dtab").removeClass("checked");
	switch(state){
		case "enabled-temp":
			$("#statustext").text("PageAge is enabled (temporarily)");
			//$("#statusbar").css({"background-color":"#336600"});
			$("#renabled").prop("checked",true);
			$("#denabled").addClass("checked");
			break;
		case "enabled":
			$("#statustext").text("PageAge is enabled");
			//$("#statusbar").css({"background-color":"#336600"});
			$("#renabled").prop("checked",true);
			$("#denabled").addClass("checked");
			if (!pageFlag) $("#undospan").hide();
			break;
		case "temp":
			$("#statustext").text("PageAge is disabled for this instance");
			//$("#statusbar").css({"background-color":"#808080"});
			$("#rtemp").prop("checked",true);
			$("#dtemp").addClass("checked");
			break;
		case "tab":
			$("#statustext").text("PageAge is disabled for this tab");
			//$("#statusbar").css({"background-color":"#0066cc"});
			$("#rtab").prop("checked",true);
			$("#dtab").addClass("checked");
			break;
		case "page":
			$("#statustext").text("PageAge is disabled for this site");
			//$("#statusbar").css({"background-color":"#cc9900"});
			$("#rpage").prop("checked",true);
			$("#undospan").hide();
			break;
	}
}