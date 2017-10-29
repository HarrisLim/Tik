function button_delPost() {
	if(confirm("Really want to delete this post ?") == true) {
		$("#button_delPost").submit();
	} else {
		return;
	}
};

function button_delCommBu(groupnum) {
	if(confirm('Really want to delete this comment ?') == true) {
		$("#curGroupnum").val(groupnum);
		$("#button_delComm").submit();
	} else {
		return;
	}
};

function button_delSeCommBu(id) {
	if(confirm('Really want to delete this comment ?') == true) {
		$("#c_id").val(id);
		$("#button_delSeComm").submit();
	} else {
		return;
	}
};

function button_edit() {
	if(confirm("Really want to edit this post ?") == true) {
		location.href="http://localhost:10468/process/editpost";
	} else {
		return;
	}
}

function updaComment(i) {
	$("#curComm"+i).css("display", "none");
	$("#updaText"+i).css("display", "");
	$("#showUpdaButton"+i).css("display", "none");
	$("#updaButton"+i).css("display", "");
	$("#updaCancel"+i).css("display", "");
};

function updaCancleBu(i) {
	$("#curComm"+i).css("display", "");
	$("#updaText"+i).css("display", "none");
	$("#showUpdaButton"+i).css("display", "");
	$("#updaButton"+i).css("display", "none");
	$("#updaCancel"+i).css("display", "none");
};

function updaSubmit(i) {
	if(confirm('Really want to update this comment ?') == true) {
		$("#updaSubmit"+i).submit();
	} else {
		return;
	}
};

function updaSeSubmit(i) {
	if(confirm('Really want to update this comment ?') == true) {
		$("#updaSeSubmit"+i).submit();
	} else {
		return;
	}
};

function showSC(i) {
	$('#SC'+i).css('display','');
};
function hideSC(i) {
	$('#SC'+i).css('display','none');
};

window.onload = function() {
	
}