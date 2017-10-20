# Tik (Travel in Korea)

외국인을 위한 무료 여행플래너. 무료로 여행 플랜을 세워주지만, 후기를 올려주는 것을 약속한다.<br> 예약같은 것은 하지 않고 정보만 알려준다. 플랜 A와 플랜 B, 2가지를 준다.

## What's different from other travel planner

다른 여행 플래너는 항공, 호텔, 패키지 여행, 가이드를 돈읇 받고 예약해주거나 수수료를 받지만,<br>
Tik은 메일로 한 번에 문의하여 신청할 수 있고, 비용없이 여행 후기만으로 한국 여행 플랜을 받을 수 있다.

## Project Period

* 2017.09.18(Mon) ~ ing

## Built With

* [HTML](https://www.w3.org/html/)
* [CSS](https://www.w3.org/Style/CSS/) (Framework - [Bootstrap](https://getbootstrap.com/))
* [Javascript](https://www.javascript.com/) (Library - [jQuery](https://jquery.com/), Framework - [Vue.js](https://vuejs.org/))
* [node.js](https://nodejs.org/en/) - Server-side
* [EJS](http://www.embeddedjs.com/) - Javascript View Template
* [MySQL](https://www.mysql.com/) - Database
* [Sublime Text 2](http://www.sublimetext.com/2) - Text Editor

## AS IS

* MySQL 연동
* session 처리
* passport.js로 로그인.
* ejs(뷰 템플릿) 설정.
* 자신이 작성한 글만 edit 버튼 활성화.
* edit에서 자신의 글, 정보 변경 가능.
* pagination
* 댓글, 대댓글 기능
*  

## TO DO

* `Tik's logo`
	태극기를 들고 익살스러운 얼굴로 찍은 셀카를 드로잉화 시킨 후 머리 뒤에 배경으로 Talk Tik이라는 단어를 넣자.

* `main (글 목록, 등)`<br>
	1. 해쉬태그 검색하는 기능 추가.<br>
	2. gmail처럼 우측 하단에 메일 보내는 기능 or 페이스북 메신저처럼<br>
	3. 작게만 나와서 문의할 수 있게.(체크박스로 몇 명, 몇 박, 호텔 or 게스트하우스, 등등) ex) 페이스북에서 에신저처럼

* `signup`<br>
	1. 이메일 허가<br>
	2. 패스워드 두 칸에 있는 것이 같은지 확인하는 버튼 기능<br>
	4. 빈 칸이 있는데 signup 버튼을 누르면 빈 칸을 채우라는 alert창<br>
	6. nickname, email 중복검사.

* `signin`
	3. 이메일 틀리거나 비밀번호 틀리면 alert창.

* `forgetemail, forgetpassword (Email이나 Password를 찾는 라우터)`

* `addpost`<br>
	1. 해쉬태그할 수 있는 공간 추가. - Tistory처럼 or 인스타처럼 그냥 #을 쓰면 해쉬태그로 변경.
	2. addphoto는 어떻게 하지 ?, picpath포함. 
	3. 글 조회가 되면 views +1 되게 하자.
	4. WANNA GO 버튼을 누르면 +1 되게 하자.
	6. 달력으로 며칠부터 며칠까지인지 받아서 DB에 저장.

* `showpost (main에서 글 목록 중 글을 클릭했을 때 보여주는 라우터)`<br>
	1. 인스타그램 아이디를 인스타 app 이미지로 가져와서 그것을 누르면 사용자의 id로 가게.
	5. 

* `mypost (로그인하고 내가 쓴 글이나 나의 정보를 수정할 수 있는 라우터)`

* `myinfo (내 정보)`
	1. 여기도 signup과 마찬가지로 ageGroup에 있는 라디오버튼을 누르면 변경되게 하자 그리고 변경하는 것이니까 db의 값을 가져와서 나이대에 맞는 곳에 체크되어 있게 하자.
	2. *****말고 password를 표현하는 다른 방법 생각해봐.
	3. change own info를 누르면 password 확인하고 editinfo 페이지로 갈 수 있게 만들자. (passport를 이용해서 password비교해야 하는 것 같은데 어려워.)
	4. nickname 변경할 시에 중복확인.

* `editpost (글 정보 변경)`
	1. update를 누르면 confirm(ok or cancle)창 뜨게 하자.

* `editaccount (계정 정보 변경)`

* `MySQL (MySQL database)`<br>

* `ETC`<br>
	1. 카카오봇 만들어서 카카오로도 문의할 수 있도록 ? 하자.
	2. 메일로 문의하는 거 말고 문의하는 창(?)을 하나 만들자.

## Difficult tings
1. 댓글 삭제하는 것. 댓글의 id값을 각각 받아서 지워야되는데 showpost에서 하나하나 받기가 어렵다.
2. 댓글에 대댓글 다는데 하나의 댓글에 대댓글을 여러개 남기면 왜 보여지는 건 대댓글 수에 맞춰서 댓글이 하나씩 다 나올까. 
3. 대댓글 - 하나의 테이블로 groupnum과 grconum을 주면서 간단하게 구현.

## Author

* [HarrisLim](https://github.com/HarrisLim)<br><br>