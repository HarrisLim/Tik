
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
		var country = $("#country").text();
		var agegroup = $("#agegroup").text();

		if(tempNick !== curNick) {
			alert('Push [Duplication check] button');
		} else if(tempEmail !== curEmail) {
			alert('Push [Duplication check & Verify Email] button.');
		} else if(firPW !== secPW || (firPW === "") || (secPW === "")) {
			alert('Push [Check password] button.');
		} else if(country === "Select Country") {
			alert('select [Country].');
		} else if(agegroup === "Select Age group") {
			alert('select [Age group].');
		} else if(nickname && country) {
			alert('Plz check your email. I sent you the permission mail.');
			$('#getCountry').val(country);
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
		var stringRegx = /[~!@\#$%<>^&*\()\-=+\’'"{}[\]; ]/gi;
		var isValid = true; 
		if(stringRegx.test(string)) { 
			isValid = false; 
		} 
		return isValid; 
	}

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

	$(function() {
		comboboxSelect();

		$('.ui.dropdown').dropdown();	
	});
