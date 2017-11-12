window.onload = function() {
	// 태그 검색
	var s_tags = [];
	var s_tag = [];
	var arrTemp = [];
	var arrTag = [];

	<%for(var j=0; j < results.length; j++) {%>
		s_tag = '<%=results[j].hashtag%>';
		s_tags.push(s_tag);
	<%}%>
	var joinTag = s_tags.join();
	var arrTemp = joinTag.split(', ');
	for(var i = 0; i < arrTemp.length; i++) {
		arrTag.push(arrTemp[i].replace(',',''));
	}

	console.log('arrTag -> ' + arrTag);
	var content = [];
	// for(var i = 0; i < arrTag.length - 1; i++) { // 맨 마지막은 공백이기 때문에 -1
	// 	var icontent = [];
	// 	content.push({ title: arrTag[i] });
	// 	icontent = content[i].title;
	// 	console.log('content -> ' + content[i].title);
	// 	for(var x =0; x < content.length; x++) {
	// 		var xcontent = [];
	// 		xcontent = content[x].title;
	// 		// console.log('i '+content[i].title);
	// 		// console.log('x '+content[x].title);
	// 		console.log('indexOf - ' +icontent.indexOf(xcontent));
	// 		// if(icontent.indexOf(content[x].title)){
	// 		// 	console.log('this is notnotnotnotnot');
	// 		// 	// content.pop({ title: arrTag[x] });
	// 		// }
	// 	}
	// 	// console.dir('content '+i+' -> ' + content[i].title);
	// 	// console.log('content -> ' + content);
	// 	// console.log(content.indexOf(content[i]));
	// 	// if(content.indexOf(content[i]) !== -1){
	// 	// 	console.log('haha I have found it #'+i);
	// 	// }
	// }

	$('.ui.search')
		.search({
		source: content
		})
	;
}