# Tik (Travel in Korea)

외국 사람을 위한 무료 여행플래너. 무료로 여행 플랜을 세워주지만, 후기를 올려주는 것을 약속한다.<br> 예약같은 것은 하지 않고 정보만 알려준다. 플랜 A와 플랜 B, 2가지를 준다.

## Project Period

* 2017.09.18(Mon) ~ ing

## Built With

* [HTML](https://www.w3.org/html/)
* [CSS](https://www.w3.org/Style/CSS/) (Framework - [Bootstrap](https://getbootstrap.com/))
* [Javascript](https://www.javascript.com/) (Library - [jQuery](https://jquery.com/), Framework - [Vue.js](https://vuejs.org/))
* [node.js](https://nodejs.org/en/) - Server-side
* [MySQL](https://www.mysql.com/) - Database
* [Sublime Text 2](http://www.sublimetext.com/2) - Text Editor


## Work in progress

*  각 라우터를 만들고 db연결.

## AS IS

* MySQL 연동
* session 처리
* passport.js로 로그인.
* 

## TO DO

* main (글 목록, 등)<br>
	1. 해쉬태그 검색하는 기능 추가.<br>
	2. gmail처럼 우측 하단에 메일 보내는 기능 or 페이스북 메신저처럼<br>
	3. 작게만 나와서 문의할 수 있게.(체크박스로 몇 명, 몇 박, 호텔 or 게스트하우스, 등등)

* signup<br>
	1. 이메일 허가<br>
	2. 패스워드 두 칸에 있는 것이 같은지 확인하는 버튼 기능<br>
	3. 10대 20대 버튼 클릭하면 그에 맞게 DB에 저장<br>
	4. 빈 칸이 있는데 signup 버튼을 누르면 빈 칸을 채우라는 alert창<br>
	5. DB에 created_at이랑 updated_at이 자동으로 데이터가 안들어가는데 확인하자.
	6. nickname 중복검사.

* signin
	1. alert창을 띄우려고 하는데. 내 생각에는 html이나 get에서 또 넣는 거 같은데 ? 일단 보류. 

* forgetemail, forgetpassword (Email이나 Password를 찾는 라우터)

* addpost<br>
	1. 해쉬태그할 수 있는 공간 추가. - Tistory처럼
	2. addphoto는 어떻게 하지 ? 

* showpost (main에서 글 목록 중 글을 클릭했을 때 보여주는 라우터)<br>
	1. 인스타아이디를 db에서 가져와서 누르면 글 작성자의 인스타페이지로 갈 수 있게 하자.<br>
	2. tik.postings에 아직 데이터가 없기 때문에, app.js에 그냥 넣으면 error다. 그러니까 postings에 넣고 난 후에 showpost.ejs에 있는 것 주석 풀자. 그리고 members에 있는 건 req.user로 잡으면 잡히는데 (ex)req.user.email) postings에 있는 것 어케 잡지 ?

* edit (로그인하고 내가 쓴 글이나 나의 정보를 수정할 수 있는 라우터)

* MySQL (MySQL database)<br>
	1. signup하면 created_at에 date가 안들어가. 어떻게 하는지 검색해서 넣자.


* ETC<br>
	카카오봇 만들어서 카카오로도 문의할 수 있도록 ? 하자.
## Author

* [HarrisLim](https://github.com/HarrisLim)<br><br>