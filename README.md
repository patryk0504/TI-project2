# TI-project2
Online/Offline RESTfull website.

App stores survey data about movie preferences.

Link (MS Azure) [LINK](https://movie-survey.azurewebsites.net/client.html)


<h3>Used technologies</h3>
<h3>Client side</h3>
<ul>
  <li>HMTL5</li>
  <li>JavaScript</li>
  <li>IndexedDB</li>
  <li>CSS3</li>
  <li>JS-Plotly</li>
</ul>

<h3>Server side</h3>
<ul>
  <li>PHP</li> 
  <li>MongoDB</li>
</ul>

<h3>How it works?</h3>
When user is offline or logged out app stores data in local IndexedDB database. <br>
After switching from offline to online mode server checks if the user's session is still valid (sessionid is stored in cookie). <br>
If session is active survey data moves from local to server database (MongoDB). <br>
If session expired user have to login to upload data. <br>
Only logged user is able to watch statistics and survey answers. <br>

<h3>Demo</h3>

<img src="/screenshots/demo.gif?raw=true" width="1000px">
