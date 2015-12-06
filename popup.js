$(document).ready(function(){
	//get the state from background
	chrome.runtime.sendMessage({message: "popup-load"},function(data){
		switch(data){
			case "enabled-temp":
				$("#statusbar").text("PageAge is enabled (temporarily)");
				$("#statusbar").css({"background-color":"#336600"});
				$("#renabled").prop("checked",true);
				break;
			case "enabled":
				$("#statusbar").text("PageAge is enabled");
				$("#statusbar").css({"background-color":"#336600"});
				$("#renabled").prop("checked",true);
				break;
			case "temp":
				$("#statusbar").text("PageAge is disabled for this instance");
				$("#statusbar").css({"background-color":"#808080"});
				$("#rtemp").prop("checked",true);
				break;
			case "tab":
				$("#statusbar").text("PageAge is disabled for this tab");
				$("#statusbar").css({"background-color":"#0066cc"});
				$("#rtab").prop("checked",true);
				break;
			case "page":
				$("#statusbar").text("PageAge is disabled for this page");
				$("#statusbar").css({"background-color":"#cc9900"});
				$("#rpage").prop("checked",true);
				break;
		}



		$("input:radio").change(function(){
			update();
		})
	});
});

$("#settings").click(function(){
	chrome.tabs.create({ url: "options.html" });
})

function update(){
	//change bar text
	var val = $("input[name='state']:checked").val();
	switch(val){
		case "enabled":
			$("#statusbar").text("PageAge is enabled");
			$("#statusbar").css({"background-color":"#336600"});
			break;
		case "temp":
			$("#statusbar").text("PageAge is disabled for this instance");
			$("#statusbar").css({"background-color":"#808080"});
			break;
		case "tab":
			$("#statusbar").text("PageAge is disabled for this tab");
			$("#statusbar").css({"background-color":"#0066cc"});
			break;
		case "page":
			$("#statusbar").text("PageAge is disabled for this page");
			$("#statusbar").css({"background-color":"#cc9900"});
			break;
	}
	//Send message to background
	//
	chrome.runtime.sendMessage({message: "popup-select",state:val},function(data){
		//do the thing
		console.log("data");
	});
}