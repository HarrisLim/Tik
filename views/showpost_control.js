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

// I wanna go ajax 
function getwant() {
	// 밑에서 ""로 curMemberId를 가져오니까 문자열로 가져와서 "false"로 해야해.
	if(($('#curMemberId').val()) !== "false") {

		// $('#num').html('');
		console.log('true ? -> ' + $('#curMemberId').val());
		$.ajax({
			url: '/process/getwant',
			dataType: 'json',
			type: 'POST',
			data: {
				'msg':$('#msg').val(),
				'curGetwant' : $('#curGetwant').val(),
				'curGetwant_members' : $('#curGetwant_members').val(),
				'curMemberId' : $('#curMemberId').val(),
				'curPostnum' : $('#curPostnum').val()
			},
			success: function(result) {
				if ( result['result'] == true ) {
					$('#curGetwant_members').val(result['curGetwant_members']);
					$('#num').html(result['curGetwant']);
				}
			} 
		}); 
	} else {
		// $('#num').html('');
		console.log('false ? -> ' + $('#curMemberId').val());
		
		$.ajax({
			url: '/process/notgetwant',
			dataType: 'json',
			type: 'POST',
			data: {
				'msg':$('#msg').val(),
				'curGetwant' : $('#curGetwant').val(),
				'curGetwant_ip' : $('#curGetwant_ip').val(),
				'curIp' : $('#curIp').val(),
				'curPostnum' : $('#curPostnum').val()
			},
			success: function(result) {
				if ( result['result'] == true ) {
					$('#curGetwant_ip').val(result['curGetwant_ip']);
					$('#num').html(result['curGetwant']);
				}
			}
		});
	}
};

window.onload = function() {
	
}