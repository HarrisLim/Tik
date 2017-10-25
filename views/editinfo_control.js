			function cancelMembership() {
				if(confirm("Really want to cancel your membership ?") == true) {
					$("#cancelMember").submit();
				} else {
					return;
				}
			};

			window.onload = function() {
				var agegroupVal = document.getElementById('ages').value;
				$('#ageSel').val(agegroupVal);
			};

			function checkPW() {
				var firPW = $("#firPW").val();
				var secPW = $("#secPW").val();

				if((firPW || secPW) === "") {
					alert('Check password again.');
				} else if(firPW === secPW) {
					alert('Chceked password.');
					$("#tempFirPW").val(firPW);
					$("#tempSecPW").val(secPW);
				} else {
					alert('Check password again.');
				}
			};

			function checkNickname() {
				var curNick = $('#nickname').val();
				var existingNick = "<%= curNickname%>";

				var arrNick = [];
				console.log("<%=arrNick%>")
				arrNick = "<%=arrNick%>".split(',');
				var nicks = arrNick;

				if(checkStringFormat(curNick) === false){
					alert('Sorry, you can not put in some special character.\nex -> !, %, $, (, ), {, }, &, etc..');
				} else if(curNick === "") { <%# 입력값이 공백 %>
					alert('Fill box plz.');
				} else if((nicks.indexOf(curNick) === -1) || (curNick === "<%=curNickname%>")) { <%# 닉네임 목록에서 입력받은 닉네임 체크 %>
					alert('OK.');
					$("#tempNick").val(curNick);
				} else {
					alert('Nickname already exists.');
				}
				
			};

			function checkEmpty() {
				var curNick = $('#nickname').val();
				var tempNick = $("#tempNick").val();
				var firPW = $("#firPW").val();
				var secPW = $("#secPW").val();
				
				if(tempNick !== curNick) {
					alert('Push [Duplication check] button');
				} else if((firPW !== secPW) || (firPW === "") || (secPW === "")) {
					alert('Push [Check password] button.');
				} else if(curNick === "<%=curNickname%>") {
					$("#editinfo").submit();
				} else {
					$("#editinfo").submit();
				}
			};

			<%# 특수문자 체크 함수 %>
			function checkStringFormat(string) { 
				var stringRegx = /[~!@\#$%<>^&*\()\-=+\’'"{}[\]; ]/gi;
				var isValid = true; 
				if(stringRegx.test(string)) { 
					isValid = false; 
				} 
				return isValid; 
			};