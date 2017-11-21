	// window.onload = function() {안에 넣어야 동작.}
	// 태그 검색
	var s_tags = [];
	var s_tag = [];
	var arrTemp = [];
	var arrTag = [];

	<%for(var j=0; j < mainResults.length; j++) {%>
		s_tag = '<%=mainResults[j].hashtag%>';
		s_tags.push(s_tag);
	<%}%>

	var joinTag = s_tags.join();
	var arrTemp = joinTag.split(', ');
	for(var i = 0; i < arrTemp.length -1; i++) {
		arrTag.push(arrTemp[i].replace(',',''));
	}

	var sorted_tag = arrTag.sort();
	var results = [];

	for(var x = 0; x < arrTag.length; x++) {
		if(sorted_tag[x + 1] !== sorted_tag[x]){
			results.push(sorted_tag[x]);
		}
	}

	var content = [];
	for(var i = 0; i < results.length; i++) {
		content.push({ title: results[i] });
	}

	$('.ui.search').search({
		source: content,
		onSelect : function(result, response) {
			console.log('selected -> ' + result.title);
			$('#gettag').val(result.title);
			$('#searched').submit();
			return false;
		}
	});