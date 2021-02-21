var request;
var objJSON;
var id_mongo;

function getRequestObject()      {
   if ( window.ActiveXObject)  {
      return ( new ActiveXObject("Microsoft.XMLHTTP")) ;
   } else if (window.XMLHttpRequest)  {
      return (new XMLHttpRequest())  ;
   } else {
      return (null) ;
   }
}
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                        zarzadzanie cookies
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
function setCookie(cvalue, expireTime) {
   var t = new Date();
   t.setSeconds(t.getSeconds() + expireTime);
   Date.prototype.addHours = function(h) {
      this.setTime(this.getTime() + (h*60*60*1000));
      return this;
    }
   t.addHours(1);
   document.cookie = 'sessionID='+cvalue+"; expires=" + t.toLocaleString() +"; path=/";//+ "; SameSite=None; Secure";// + "; SameSite=None; Secure";
}

function getCookie(name) {
   const value = `; ${document.cookie}`;
   const parts = value.split(`; ${name}=`);
   if (parts.length === 2) return parts.pop().split(';').shift();
 }
//sprawdzanie czy sesja nie wygasla lub czy jest jakas zapisana
function checkIfLogged(){
   request = getRequestObject() ;
   request.onreadystatechange = function() {
      if (request.readyState == 4)    {
         var response = request.response;
         response = JSON.parse(response);
         if(response['return'] == 'true'){//logged  
            console.log("logged");
            navWhenLogged();
            indexedTOmongo2();
            document.getElementById("trybLoginInfo").innerHTML = "<h2>Aktualny status: zalogowany</h2>";
         }else{
            console.log("logged out");
            navWhenLoggedOut();
            document.getElementById("trybLoginInfo").innerHTML = "<h2>Aktualny status: wylogowany</h2>";
         }
      }
   }
   var data = {};
   data.sessionID = getCookie('sessionID');
   txt = JSON.stringify(data);
   if(data.sessionID == '' || data.sessionID == null){
      navWhenLoggedOut();
   }else{
      request.open("POST", "http://pascal.fis.agh.edu.pl/~8sledzp/PROJEKT2v2/rest/isLogged", false);
      request.send(txt);      
   }

}
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                     sterowanie nawigacja i strona glowna, sprawdzanie stanu online/offline
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

function loadArticle(elem){
   var elements = document.getElementsByClassName("content");
   for(var i = 0; i<elements.length; i++)
       elements[i].style = "display : none;";
   document.getElementById(elem.id + "Art").style = "block";
   if(elem.id == "zaloguj")
      document.getElementById("loginInfo").innerHTML = "";
}

function navWhenLoggedOut(){
   var elementsToHide = document.getElementsByClassName("hideWhenLoggedOut");
   for(var i = 0; i<elementsToHide.length; i++)
      elementsToHide[i].style = "display : none;";
   var elementsToShow = document.getElementsByClassName("hideWhenLogged");
   for(var i = 0; i<elementsToShow.length; i++)
      elementsToShow[i].style = "";
}

function navWhenLogged(){
   var elementsToHide = document.getElementsByClassName("hideWhenLogged");
   for(var i = 0; i<elementsToHide.length; i++)
      elementsToHide[i].style = "display : none;";
   var elementsToShow = document.getElementsByClassName("hideWhenLoggedOut");
   for(var i = 0; i<elementsToShow.length; i++)
      elementsToShow[i].style = "";
}

window.addEventListener("online", ()=> {       
   document.getElementById("trybInfo").innerHTML = "<h2>Aktualny tryb: online</h2>";
   checkIfLogged();
   indexedTOmongo2();},false);//TODO: obsluga przesylania danych do MongoDB z IndexedDB

window.addEventListener("offline", ()=> {
   navWhenLoggedOut();
   document.getElementById("trybInfo").innerHTML = "<h2>Aktualny tryb: offline</h2>";
   document.getElementById("trybLoginInfo").innerHTML = "<h2>Aktualny status: wstrzymany</h2>";
}, false);

window.onload = () => {
   document.getElementById("aboutArt").style = "block";
   // navWhenLoggedOut();
   if(navigator.onLine){
      checkIfLogged();
      document.getElementById("trybInfo").innerHTML = "<h2>Aktualny tryb: online</h2>";
   }else{
      navWhenLoggedOut();
      document.getElementById("trybInfo").innerHTML = "<h2>Aktualny tryb: offline</h2>";
   }

}


///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                              logowanie, rejestracja, wylogowywanie
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

function loginFunction(){
   var login = document.getElementById("login").value;
   var pass = document.getElementById("password").value;

   if(navigator.onLine){
      if(!login || login.length < 4){
         alert("Wprowadź login o dł. min. 4 znaki/liczby");
      }
      if(!pass || pass.length < 4){
         alert("Wprowadź hasło o dł. min. 4 znaki/liczby");
      }else{
         request = getRequestObject() ;
         request.onreadystatechange = function() {
            if (request.readyState == 4)    {
               var response = request.response;
               response = JSON.parse(response);
               if(response['status'] == 'true'){
                  navWhenLogged();
                  indexedTOmongo2();
                  setCookie(response['sessionID'], response['sessionIDtimeout']);
                  document.getElementById("trybLoginInfo").innerHTML = "<h2>Aktualny status: zalogowany</h2>";
               }
               document.getElementById('loginInfo').innerHTML = response['return'];
            }
         }
         var user = {};
         user.login = login;
         user.pass = pass;
         txt = JSON.stringify(user);
         request.open("POST", "http://pascal.fis.agh.edu.pl/~8sledzp/PROJEKT2v2/rest/login", true);
         request.send(txt);
      }
   }else{
      document.getElementById("trybLoginInfo").innerHTML = "<h2>Aktualny status: wylogowany</h2>";
      alert("Błąd logowania. Jesteś w trybie offline!");
   }
}


function logoutFunction(elem){
   loadArticle(elem);
   if(navigator.onLine){
      request = getRequestObject() ;
      request.onreadystatechange = function() {
         if (request.readyState == 4)    {
            var response = request.response;
            response = JSON.parse(response);
            if(response['return'] == 'Wylogowano'){
               navWhenLoggedOut();
               setCookie('','');
               document.getElementById("trybLoginInfo").innerHTML = "<h2>Aktualny status: wylogowany</h2>";
            }
               document.getElementById('logoutInfo').innerHTML = response['return'];
         }
      }
      var data = {};
      data.sessionID = getCookie('sessionID');
      txt = JSON.stringify(data);
      request.open("POST", "http://pascal.fis.agh.edu.pl/~8sledzp/PROJEKT2v2/rest/logout", true);
      request.send(txt);
   }else{
      alert("Błąd. Jesteś w trybie offline!");
      document.getElementById("trybLoginInfo").innerHTML = "<h2>Aktualny status: wylogowany</h2>";
   }
}

function signInFunction(){
   document.getElementById("signInForm").addEventListener("submit", function(event){event.preventDefault();});
   var login = document.getElementById("loginSignIn").value;
   var pass = document.getElementById("passwordSignIn").value;
   var rePass = document.getElementById("repasswordSignIn").value;


   if(navigator.onLine){
      if(pass != rePass){
         alert("Hasło potwierdzające się nie zgadza.");
      }else if(!login || login.length < 4){
         alert("Wprowadź login o dł. min. 4 znaki/liczby");
      }else if(!pass || pass.length < 4){
         alert("Wprowadź hasło o dł. min. 4 znaki/liczby");
      }else{
         request = getRequestObject() ;
         request.onreadystatechange = function() {
         if (request.readyState == 4)    {
            var response = request.response;
            response = JSON.parse(response);
            if(response['return'] != null){
               document.getElementById('SignInInfo').innerHTML = response['return'];
            }else{
               document.getElementById('SignInInfo').innerHTML = 
                  "Pomyślnie zarejestrowano użytkownika: [login]: " + "[" + response['login'] + "]";
            }
            }
         }
         var user = {};
         user.login = login;
         user.pass = pass;
         txt = JSON.stringify(user);
         request.open("POST", "http://pascal.fis.agh.edu.pl/~8sledzp/PROJEKT2v2/rest/signin", true);
         request.send(txt);
      }
      
   }else{
      alert("Błąd rejestracji. Jesteś w trybie offline!");
   }
}
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                        obsluga przyciskow nawigacyjnych
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

function getLocalTime(){
   let options = {
      timeZone: 'Europe/Warsaw',
      year: 'numeric',
      month: 'numeric',
      day: 'numeric',
      hour: 'numeric',
      minute: 'numeric',
      second: 'numeric',
    };
    var formatter = new Intl.DateTimeFormat([], options);
    return formatter.format(new Date());
}

function zapiszAnkiete(){
   document.getElementById("surveyForm").addEventListener("submit", function(event){event.preventDefault();});
   var plec = document.getElementById("plec").value;
   var gatunek = document.getElementById("gatunek").value;
   var aktor = document.getElementById("aktor").value;
   var film = document.getElementById("film").value;
   var platforma = document.getElementById("platforma").value;
   var czas = document.getElementById("czas").value;

   if(aktor.length < 4){
      alert("Popraw pole ulubiony aktor => (min. 4 znaki)");
   }else if(film.length < 4){
      alert("Popraw pole ulubiony film => (min. 4 znaki)");
   }else{
      var formArr = {};
      formArr.data = getLocalTime().toLocaleString();
      formArr.plec = plec;
      formArr.gatunek = gatunek;
      formArr.aktor = aktor;
      formArr.film = film;
      formArr.platforma = platforma;
      formArr.czas = czas;
   
      //sprawdzenie online czy offline
      if(navigator.onLine){
         insertToMongo(formArr,null,true);
      }else{
         insertToIndexedDB(formArr);
      }
   }
}


function odpowiedziFunction(elem){
   loadArticle(elem);
   deleteInsertTable();
   deleteListTable();
   if(navigator.onLine){//wyswietl odpowiedzi z bazy danych MongoDB
      getAllFromMongoDB();//jesli uzytkownik bedzie niezalogowany, wywolanie zwroci baze indexedDB
   }else{//wyswietl odpowiedzi z IndexedDB
      getAllFromIndexedDB();
   }
}

function analizaDanychFunction(elem){
   loadArticle(elem);
   drawHistogram();
}

///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                  przesylanie danych do bazy po stronie serwera MongoDB
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

// Przesyła zgromadzone dane w bazie lokalnej IndexedDB do bazy po stronie serwera MongoDB. 
// Gdy dany rekord zostanie przesłany z powodzeniem jest usuwany, gdy nie zostanie przesłany - jest zachowywany

function indexedTOmongo2(){
   var dbName = "surveyDB";
   const connection = window.indexedDB.open(dbName, 4);
   
   connection.onupgradeneeded = function (event) {
      event.target.transaction.abort();
      console.log(event);
   };
   connection.onsuccess = function (event) {
      const db = event.target.result;
      const transaction = db.transaction('results', 'readwrite');
      const objectStore = transaction.objectStore('results');
      const objectRequest = objectStore.openCursor();

      
      objectRequest.onerror = function (event) {
         console.log("error");
         console.log(event);
      };

      objectRequest.onsuccess = function (event) {
         let cursor = event.target.result;
         if (cursor) {
            let key = cursor.primaryKey;
            let value = cursor.value;
            //przesylamy key, value do mongoDB (jesli przeslanie zakonczy sie sukcesem, wpis z kluczem key zostanie usunięty)
            insertToMongo(value, key, false);
            console.log(key, value);
            cursor.continue();
         }
      };
   }
}

// Przesyla dane do bazy MongoDB. W zależności od odpowiedzi od serwera:
//    gdy whatToDo = true: zwraca dodany rekord w przypadku powodzenia, zapisuje tymczasowo rekord w bazie lokalnej IndexedDB w przypadku,gdy uzytkownik niezalogowany
//    gdy whatToDo = false:      -||-                                 oraz usuwa rekord o odpowiednim kluczu z bazy lokalnej, w przypadku gdy uzytkownik niezalogowany wyswietlany jest tylko monit

function insertToMongo(formArr, key, whatToDo=true){
   deleteInsertTable();
   request = getRequestObject() ;
   request.onreadystatechange = function() {
      if (request.readyState == 4 && request.status == 200)    {
         var myDiv = document.getElementById('insertedDiv');//.innerHTML = response['return'];
         var response = request.response;
         response = JSON.parse(response);
         if(whatToDo){
            if(response['return'] != null){
               myDiv.innerHTML = "<h2>" + response['return'] + "</h2>";
            }else{
               createInsertTable(response,myDiv,"Wprowadzono następujący rekord do bazy danych MongoDB");
            }
         }else{
            if(response['return'] != null){
               console.log("insertOnlyToMono: " + response["return"]);
            }else{
               var dbName = "surveyDB";
               const connection = window.indexedDB.open(dbName, 4);
               
               connection.onupgradeneeded = function (event) {
                  event.target.transaction.abort();
                  console.log(event);
               };
               connection.onsuccess = function (event) {
                  const db = event.target.result;
                  const transaction = db.transaction('results', 'readwrite');
                  const objectStore = transaction.objectStore('results');
                  console.log("USUWAM!!!!");
                  const objectRequest = objectStore.delete(key);
                  
                  
                  objectRequest.onerror = function (event) {
                     console.log("error");
                     console.log(event);
                  };
            
                  objectRequest.onsuccess = function (event) {
                     console.log("insertToMongo: pomyslnie usunieto wpis z indexedDB o kluczu: " + key);
                  };
               }
            }
         }
      }else if(request.readyState == 4 && request.status == 401 && whatToDo == true){
         navWhenLoggedOut();
         alert("Jesteś niezalogowany więc ankieta została zapisana offline.");
         insertToIndexedDB(formArr);
      }else if(request.readyState == 4 && request.status == 401 && whatToDo == false){
         navWhenLoggedOut();
         alert("Jesteś niezalogowany więc ankieta została zapisana offline.");
      }
   }
   
   txt = JSON.stringify(formArr);
   request.open("POST", "http://pascal.fis.agh.edu.pl/~8sledzp/PROJEKT2v2/rest/insert", false);
   request.send(txt);
}

///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                              Zwrócenie danych zgromadzonych w bazach
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

function getAllFromIndexedDB(){
   var myDiv = document.getElementById("odpowiedziDiv");
   var dbName = "surveyDB";
   const connection = window.indexedDB.open(dbName, 4);

   connection.onupgradeneeded = function (event) {
      event.target.transaction.abort();
      console.log(event);
   };
   connection.onsuccess = function (event) {
      const db = event.target.result;
      const transaction = db.transaction('results', 'readwrite');
      const objectStore = transaction.objectStore('results');

      var table = document.createElement('table');
      table.setAttribute("class", "listTable");

      var countRequest = objectStore.count();
      countRequest.onsuccess = function() {
         console.log(countRequest.result);
         if(countRequest.result == 0){
            var h2 = document.createElement('h2');
            h2.appendChild(document.createTextNode("Nie znaleziono rekordów w IndexedDB"));
            myDiv.appendChild(h2);
         }else{
            var h2 = document.createElement('h2');
            h2.appendChild(document.createTextNode("Zwrócono rekordy z bazy lokalnej IndexedDB"));
            myDiv.appendChild(h2);
            createTitleRow(table);
         }
      }

      const objectRequest = objectStore.openCursor();

      objectRequest.onerror = function(event) {
         console.err("error fetching data");
      };

      objectRequest.onsuccess = function(event) {
         let cursor = event.target.result;
         if (cursor) {
             let key = cursor.primaryKey;
             let value = cursor.value;
            var a = {};
            a.id = key;
            dict = Object.assign({}, a, value);
            createListTable(dict,table);
            myDiv.appendChild(table);
            cursor.continue();
         }
         else {
             // no more results
         }
      };
   }
}


function getAllFromMongoDB(){
   var myDiv = document.getElementById("odpowiedziDiv");
   request = getRequestObject() ;
   request.onreadystatechange = function() {
      if (request.readyState == 4 && request.status == 200)    {
         var response = request.response;
         // console.log(response);
         response = JSON.parse(response);
         if(response['return'] != null){
            alert(response['return']);
         }else{//zwracamy mongodb
            var h2 = document.createElement('h2');
            h2.appendChild(document.createTextNode("Zwrócono rekordy z bazy MongoDB"));
            myDiv.appendChild(h2);
            var table = document.createElement('table');
            table.setAttribute("class", "listTable");
            createTitleRow(table);
            response.forEach(element => {
               createListTable(element,table);
            });

            myDiv.appendChild(table);
         }
      }else if(request.readyState == 4 && request.status == 401){//uzytkownik niezalogowany, zwracamy indexedDB i zmieniamy nav
         navWhenLoggedOut();
         getAllFromIndexedDB();
      }
   }

   request.open("GET", "http://pascal.fis.agh.edu.pl/~8sledzp/PROJEKT2v2/rest/getAll", true);
   request.send(null);
}


///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                        Zapisanie danych w lokalnej bazie danych IndexedDB
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

function insertToIndexedDB(formArr){
   deleteInsertTable();
   var dbName = "surveyDB";
   const connection = window.indexedDB.open(dbName, 4);
   connection.onupgradeneeded = function (event) {
      const db = event.target.result;
      const objectStore = db.createObjectStore('results', {autoIncrement: true});
      let index = objectStore.createIndex('data', 'data', {
         unique: true
     });
      console.log(objectStore);
   };


   connection.onsuccess = function (event) {
      const db = event.target.result;
      const transaction = db.transaction('results', 'readwrite');
      const objectStore = transaction.objectStore('results');
      const objectRequest = objectStore.put(formArr);
      objectRequest.onerror = function (event) {
         console.log("error");
         console.log(event);
      };

      objectRequest.onsuccess = function (event) {
         createInsertTable(formArr, document.getElementById("insertedDiv"),"Wprowadzono następujący rekord do bazy danych IndexedDB", false);
         console.log("success");
      };
   }
    
}

///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                          dynamiczne tworzenie tabel z zawartoscia baz danych
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

function createInsertTable(valuesArr, myDiv, info, flag = true){
   var table = document.createElement('table');
   table.setAttribute("class", "listTable");
   if(flag)
      createTitleRow(table);
   else
      createTitleRow(table,false);

   var tr = document.createElement('tr');   
   for (const [key, value] of Object.entries(valuesArr)) {
      var td1 = document.createElement('td');
      var text1 = document.createTextNode(value);
      td1.appendChild(text1);
      tr.appendChild(td1);
   }
   table.appendChild(tr);
   var h2 = document.createElement('h2');
   h2.setAttribute("class", "h2Title");
   h2.appendChild(document.createTextNode(info))
   myDiv.appendChild(h2);
   myDiv.appendChild(table);
}

function createListTable(row, table){
   var tr = document.createElement('tr');   
   for (const [key, value] of Object.entries(row)) {
      var td1 = document.createElement('td');
      var text1 = document.createTextNode(value);
      td1.appendChild(text1);
      tr.appendChild(td1);
   }
   table.appendChild(tr);
}

function deleteInsertTable(){
   document.getElementById("insertedDiv").innerHTML = "";
}

function deleteListTable(){
   document.getElementById("odpowiedziDiv").innerHTML = "";
}

function createTitleRow(table, flag=true){
   var trtitle = document.createElement('tr');
   var arr;
   if(flag)
      arr = ["Numer ankiety [ID]","Data wypełnienia","Płeć", "Gatunek filmowy", "Ulubiony aktor", "Ulubiony film", "Platforma", "Średni tygodniowy czas oglądania"];
   else
      arr = ["Data wypełnienia","Płeć", "Gatunek filmowy", "Ulubiony aktor", "Ulubiony film", "Platforma", "Średni tygodniowy czas oglądania"];
   for(const [key, value] of Object.entries(arr)){
      var th1 = document.createElement('th');
      var text1 = document.createTextNode(value);
      th1.appendChild(text1);
      trtitle.appendChild(th1);
   }
   table.appendChild(trtitle);
   return table;
}
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                    analiza danych
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
function drawHistogram(){

   //plec
   var xplec = ['kobieta','mezczyzna'];
   var yplec = [];
   yplec['kobieta']=0;
   yplec['mezczyzna']=0;
   //gatunek
   var xgatunek = ['akcja','przygodowy','fantasy', 'horror', 'thriller', 'sci-fi', 'dokumentalny', 'sensacyjny', 'komedia'];
   var ygatunek = [];
   xgatunek.forEach(x=> ygatunek[x] = 0);
   //platforma
   var xplatforma = ['hbo','netflix','tv', 'amazon_prime', 'apple_tv', 'cda', 'player', 'chili'];
   var yplatforma = [];
   xplatforma.forEach(x=>yplatforma[x] = 0);
   //czas ogladania
   var xczas = ['0-2','3-5', '6-10', '11-22', '>23'];
   var yczas = [];
   xczas.forEach(x=>yczas[x] = 0);


   //get data from mongoDB
if(navigator.onLine){
   request = getRequestObject() ;
   request.onreadystatechange = function() {
      if (request.readyState == 4)    {
         var response = request.response;
         response = JSON.parse(response);
         if(response['return'] != null){
            alert(response['return']);
         }else{//zwracamy mongodb
            response.forEach(element => {
               for (const [key, value] of Object.entries(element)) {
                  if(key == 'plec'){
                     yplec[value]++;
                  }else if(key == 'gatunek'){
                     ygatunek[value]++;
                  }else if(key == 'platforma'){
                     yplatforma[value]++;
                  }else if(key == 'czas'){
                     yczas[value]++;
                  }

               }
            });
         
            var layout = {
               autosize: false,
               width: 700,
               height: 500
            };
            //histogram plci
            var data1 = [
               {
                 histfunc: "sum",
                 y: [yplec['kobieta'],yplec['mezczyzna']],
                 x: xplec,
                 width : [0.4, 0.4],
                 marker:{
                  color: ['rgba(191, 140, 255, 1)', 'rgba(0, 65, 0, 0.54)']
                },
                  type: 'bar',
                 name: "sum"
               }
             ]
             Plotly.newPlot('histogramPlecDiv', data1, layout);
             //histogram gatunek
             var data2 = [
               {
                 histfunc: "sum",
                 y: [ygatunek['akcja'],ygatunek['przygodowy'],ygatunek['fantasy'], ygatunek['horror'], ygatunek['thriller'], ygatunek['sci-fi'], ygatunek['dokumentalny'], ygatunek['sensacyjny'], ygatunek['komedia']],
                 x: xgatunek,
                 width : [0.2, 0.2, 0.2, 0.2, 0.2, 0.2, 0.2, 0.2, 0.2],
                 marker:{
                  color: ['rgba(191, 140, 255, 1)', 'rgba(191, 140, 0, 1)', 'rgba(0, 140, 0, 1)', 'rgba(0, 116, 138, 1)','rgba(252, 116, 138, 1)','rgba(0, 159, 235, 0.3)','rgba(123, 0, 46, 1)','rgba(40, 66, 0, 1)','rgba(198, 66, 0, 0.32)']
               },
                 type: "bar",
                 name: "sum"
               }
             ]
             Plotly.newPlot('histogramGatunekDiv', data2, layout);
             //histogram platforma
            var data3 = [
               {
                 histfunc: "sum",
                 y: [yplatforma['hbo'],yplatforma['netflix'],yplatforma['tv'], yplatforma['amazon_prime'], yplatforma['apple_tv'], yplatforma['cda'], yplatforma['player'], yplatforma['chili']],
                 x: xplatforma,
                 marker:{
                  color: ['rgba(191, 140, 255, 1)', 'rgba(198, 66, 0, 0.32)', 'rgba(0, 140, 0, 1)', 'rgba(0, 116, 138, 1)','rgba(252, 116, 138, 1)','rgba(0, 159, 235, 0.3)','rgba(123, 0, 46, 1)','rgba(40, 66, 0, 1)']
               },
                 type: "bar",
                 name: "sum"
               }
             ]
             Plotly.newPlot('histogramPlatformaDiv', data3, layout);
             //histogram czas ogladania
             var data4 = [
               {
                 histfunc: "sum",
                 y: [yczas['0-2'],yczas['3-5'], yczas['6-10'], yczas['11-22'], yczas['>23']],
                 x: xczas,
                 marker:{
                  color: ['rgba(191, 140, 255, 1)', 'rgba(198, 66, 0, 0.32)', 'rgba(0, 140, 0, 1)', 'rgba(0, 116, 138, 1)','rgba(40, 66, 0, 1)']
               },
                 type: "bar",
                 name: "sum"
               }
             ]
             Plotly.newPlot('histogramCzasDiv', data4, layout);
            
         }
      }else if(request.readyState == 4 && request.status == 401){
         alert("Nie masz dostępu do analizy danych! Zaloguj się.");
         navWhenLoggedOut();
      }
   }

   request.open("GET", "http://pascal.fis.agh.edu.pl/~8sledzp/PROJEKT2v2/rest/getAll", true);
   request.send(null);
}else{
      alert("Opcja niedostępna w trybie offline");
}

}