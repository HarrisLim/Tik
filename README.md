# Tik (Travel in Korea)

외국인을 위한 무료 여행플래너. 무료로 여행 플랜을 세워주지만, 후기를 올려주는 것을 약속한다.<br> 예약같은 것은 하지 않고 정보만 알려준다. 플랜 A와 플랜 B, 2가지를 준다.

## What's different from other travel planners

다른 여행 플래너는 항공, 호텔, 패키지 여행, 가이드를 돈읇 받고 예약해주거나 수수료를 받지만,<br>
Tik은 메일로 한 번에 문의하여 신청할 수 있고, 다른 비용없이 여행 후기로 한국 여행 플랜을 구입할 수 있다.

## Project Period

* 2017.09.18(Mon) ~ ing

## Built With

* [HTML](https://www.w3.org/html/)
* [CSS](https://www.w3.org/Style/CSS/) (Framework - [Semantic-UI](https://semantic-ui.com/))
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
* 회원탈퇴
* nickname 특수문자 입력 불가
* nickname, email 중복 검사
* country select box에 flag 추가.
* 글쓰기 권한 부여, 부여받지 못한다면 글쓰기 불가.
* 패스워드 분실 시, 패스워드 reset 링크 메일로 받기.
* I wanna go ajax
* 태그 추가
* tag 찾기

## TO DO

* `Tik's logo`
	태극기를 들고 익살스러운 얼굴로 찍은 셀카를 드로잉화 시킨 후 머리 뒤에 배경으로 Talk Tik이라는 단어를 넣자.

* `main (글 목록, 등)`<br>
	1. 해쉬태그 검색하는 기능 추가.<br>
	2. gmail처럼 우측 하단에 메일 보내는 기능 or 페이스북 메신저처럼<br>
	3. 작게만 나와서 문의할 수 있게.(체크박스로 몇 명, 몇 박, 호텔 or 게스트하우스, 등등) ex) 페이스북에서 에신저처럼

* `signup`<br>
	1. sendEmail() 함수에서 메일 보내는 거에 로고 만들면 welcome 위에 추가하자.

* `signin`<br>

* `forgetemail, forgetpassword (Email이나 Password를 찾는 라우터)`<br>

* `addpost`<br>
	1. 해쉬태그할 수 있는 공간 추가. - Tistory처럼 or 인스타처럼 그냥 #을 쓰면 해쉬태그로 변경.
	2. addphoto는 어떻게 하지 ?, picpath포함. 
	3. 글 조회가 되면 views +1 되게 하자.
	4. WANNA GO 버튼을 누르면 +1 되게 하자.
	6. 달력으로 며칠부터 며칠까지인지 받아서 DB에 저장.

* `showpost (main에서 글 목록 중 글을 클릭했을 때 보여주는 라우터)`<br>
	5. 

* `mypost (로그인하고 내가 쓴 글이나 나의 정보를 수정할 수 있는 라우터)`<br>

* `myinfo (내 정보)`<br>
	2. *****말고 password를 표현하는 다른 방법 생각해봐. (무엇을 말하는 건지 모르겠음 . - 2017.10.25)

* `editpost (글 정보 변경)`<br>

* `editaccount (계정 정보 변경)`<br>

* `MySQL (MySQL database)`<br>

* `ETC`<br>
	1. 카카오봇 만들어서 카카오로도 문의할 수 있도록 ? 하자.
	2. 메일로 문의하는 거 말고 문의하는 창(?)을 하나 만들자.

## Difficult tings
1. 댓글 삭제하는 것. 댓글의 id값을 각각 받아서 지워야되는데 showpost에서 하나하나 받기가 어렵다.
2. 댓글에 대댓글 다는데 하나의 댓글에 대댓글을 여러개 남기면 왜 보여지는 건 대댓글 수에 맞춰서 댓글이 하나씩 다 나올까. 
3. 대댓글 - 하나의 테이블로 groupnum과 grconum을 주면서 간단하게 구현.
4. signin에서 email or pw가 틀렸을 시에 flash메시지를 띄워주는 것. 이틀 째 (해결, 검색해본 것을 자세히 보고 어떤 식으로 구동되는지 곰곰이 생각을 하니까 동작.)
5. 이메일을 확인하고 이메일 인증. - 가입자의 이메일에 메일을 보내고, 그 메일 안에 링크를 넣어서 링크를 클릭했을 시에만, 이메일 인증이 되도록 하는 기능인데 하려고 하려고 해도 안되서 미뤄두다가 드디어 했다. random 숫자를 갖고 get방식으로 ?id=00 이런 식으로 준다. 이메일로 보낸 random 숫자와 그 숫자를 받아놓고 있다가 email에서 link를 타고 와서 permission 버튼을 눌렀을 때만 동작하게 하는 것.
6. 글 중간에 있는 image의 경로를 db로 보내는 것은 했는데 db에서 이미지 경로를 가져와서 글 중간 중간에 뿌려주는 것이 너무 어렵다. 삼일 째. (<%=%>를 <%-%>로 변경하며 쉽게 해결, 삽질 했다.)

## Author

* [HarrisLim](https://github.com/HarrisLim)<br><br>