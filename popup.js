var pflag = false;

$(document).ready(function(){
	//get the state from background
	chrome.runtime.sendMessage({message: "popup-load"},function(data,page){
		
		updateState(data,page);

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

function checkChange(){
	//change bar text
	var val = $("input[name='state']:checked").val();
	//Send message to background
	chrome.runtime.sendMessage({message: "popup-select",state:val},function(data,page){
		//do the thing
		updateState(data,page);
	});
}

function updateState(state, pageFlag){
	pflag = pageFlag;
	$("#undospan").show();
	if (pageFlag){ //if the page is techincally found in the list of excepted stuff...
		//show that the current page is in the disabled list
		//dotted background or something. I dunno.
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