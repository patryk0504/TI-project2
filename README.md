# TI-project2
Online/Offline RESTfull website. Application for registering and analyzing survey data.

App stores data about movie preferences.

Link (MS Azure) LINK


<h3>How it works?</h3>
When user is offline or logged out app stores data in local IndexedDB database. <br>
After switching from offline to online mode server checks if the user's session is still valid (sessionid is stored in cookie). <br>
If session is active survey data moves from local to server database (MongoDB). <br>
If session expired user have to login to upload data. <br>
Only logged user is able to watch statistics and survey answers. <br>

<h3>Demo</h3>
