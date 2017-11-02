	function cancelMembership() {
		if(confirm("Really want to cancel your membership ?") == true) {
			$("#cancelMember").submit();
		} else {
			return;
		}
	};

	window.onload = function() {
		var agegroupVal = document.getElementById('ages').value;
		$('#ageSel').text(agegroupVal);

		comboboxSelect();

		$('.ui.dropdown').dropdown();
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
		$('#editinfopw_username').val($('#email').val());
		$('#editinfopw_password').val($('#oriPassword').val());

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

	function comboboxSelect(){ // 콤보박스 셀렉트 기능
		$.widget( "custom.combobox", {
			_create: function() {
				this.wrapper = $( "<span>" )
				.addClass( "custom-combobox" )
				.insertAfter( this.element );

				this.element.hide();
				this._createAutocomplete();
				this._createShowAllButton();
				},

			_createAutocomplete: function() {
				var selected = this.element.children( ":selected" ),
				value = selected.val() ? selected.text() : "";

				this.input = $( "<input>" )
					.appendTo( this.wrapper )
					.val( value )
					.attr( "title", "" )
					.addClass( "custom-combobox-input ui-widget ui-widget-content ui-state-default ui-corner-left" )
					.autocomplete({
						delay: 0,
						minLength: 0,
						source: $.proxy( this, "_source" )
					})
					.tooltip({
						classes: {
						"ui-tooltip": "ui-state-highlight"
						}
					});

				this._on( this.input, {
					autocompleteselect: function( event, ui ) {
						ui.item.option.selected = true;
						this._trigger( "select", event, {
							item: ui.item.option
						});
					},

					autocompletechange: "_removeIfInvalid"
				});
			},

			_createShowAllButton: function() {
				var input = this.input,
					wasOpen = false;

				$( "<a>" )
					.attr( "tabIndex", -1 )
					.tooltip()
					.appendTo( this.wrapper )
					.button({
						icons: {
							primary: "ui-icon-triangle-1-s"
						},
						text: false
					})
					.removeClass( "ui-corner-all" )
					.addClass( "custom-combobox-toggle ui-corner-right" )
					.on( "mousedown", function() {
						wasOpen = input.autocomplete( "widget" ).is( ":visible" );
					})
					.on( "click", function() {
						input.trigger( "focus" );

						// Close if already visible
						if ( wasOpen ) {
						return;
						}

					// Pass empty string as value to search for, displaying all results
					input.autocomplete( "search", "" );
					});
			},

			_source: function( request, response ) {
				var matcher = new RegExp( $.ui.autocomplete.escapeRegex(request.term), "i" );
				response( this.element.children( "option" ).map(function() {
				var text = $( this ).text();
					if ( this.value && ( !request.term || matcher.test(text) ) )
					return {
						label: text,
						value: text,
						option: this
					};
				}));
			},

			_removeIfInvalid: function( event, ui ) {

				// Selected an item, nothing to do
				if ( ui.item ) {
					return;
				}

				// Search for a match (case-insensitive)
				var value = this.input.val(),
					valueLowerCase = value.toLowerCase(),
					valid = false;
				this.element.children( "option" ).each(function() {
					if ( $( this ).text().toLowerCase() === valueLowerCase ) {
						this.selected = valid = true;
						return false;
					}
				});

				// Found a match, nothing to do
				if ( valid ) {
					return;
				}

				// Remove invalid value
				this.input
					.val( "" )
					.attr( "title", value + " didn't match any item" )
					.tooltip( "open" );
				this.element.val( "" );
				this._delay(function() {
					this.input.tooltip( "close" ).attr( "title", "" );
				}, 2500 );
				this.input.autocomplete( "instance" ).term = "";
			},

			_destroy: function() {
				this.wrapper.remove();
				this.element.show();
				}
		});

		$( ".combobox" ).combobox();
		$( "#toggle" ).on( "click", function() {
			$( ".combobox" ).toggle();
		});
	};

