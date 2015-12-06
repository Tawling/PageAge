$("input:radio").change(function(){
	update();
})
$(document).ready(function(){
	//get the state from background
	update();
});

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
		case "site":
			$("#statusbar").text("PageAge is disabled for this site");
			$("#statusbar").css({"background-color":"#cc0000"});
			break;
	}
	//Send message to background
	//
	chrome.runtime.sendMessage({message: "popup-select",state:val},function(data){
		//do the thing
	});
}