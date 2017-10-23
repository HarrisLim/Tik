
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
				var arrNick = [];
				console.log("<%=arrNick%>")
				arrNick = "<%=arrNick%>".split(',');

				var curNick = $('#nickname').val();
				var nicks = arrNick;
				if(checkStringFormat(curNick) === false){
					alert('Sorry, you can not put in some special character.\nex -> !, %, $, (, ), {, }, &, etc..');
				} else if(curNick === "") {
					alert('Fill box plz.');
				} else if(nicks.indexOf(curNick) === -1) {
					console.log('hi');
					alert('OK.');
					$("#tempNick").val(curNick);
				} else {
					alert('Nickname already exists.');
				}
			};

			function checkEmpty() {
				var curNick = $("#nickname").val();
				var tempNick = $("#tempNick").val();
				var tempFirPW = $("#tempFirPW").val();
				var tempSecPW = $("#tempSecPW").val();
				var tempEmail = $("#tempEmail").val();
				var firPW = $("#firPW").val();
				var secPW = $("#secPW").val();
				var curEmail = $("#email").val();
				var country = $("#country").val();

				if(tempNick !== curNick) {
					alert('Push [Duplication check] button');
				} else if(tempEmail !== curEmail) {
					alert('Push [Duplication check & Verify Email] button.');
				} else if(firPW !== secPW || (firPW === "") || (secPW === "")) {
					alert('Push [Check password] button.');
				} else if(nickname && country) {
					$("#signup").submit();
				} else {
					alert('you need to fill empty box except Instagram ID.')
				}
			};

			function checkEmail() {
				var arrEmail = [];
				console.log("<%=arrEmail%>");

				arrEmail = "<%=arrEmail%>".split(',');
				var curEmail = $("#email").val();
				if (curEmail.indexOf('@') === -1){
					alert('make email form plz.')
				} else if(arrEmail.indexOf(curEmail) === -1) {
					console.log('hi');
					alert('OK.');
					$("#tempEmail").val(curEmail);
				} else if (curEmail === ""){
					alert('Fill box plz.');
				} else {
					alert('Email already exists.');
				}
			};

			<%# 특수문자 체크 함 %>
			function checkStringFormat(string) { 
				var stringRegx = /[~!@\#$%<>^&*\()\-=+_\’'"{}[\]; ]/gi; 
				var isValid = true; 
				if(stringRegx.test(string)) { 
					isValid = false; 
				} 
				return isValid; 
			};

			$(function() {
			});
