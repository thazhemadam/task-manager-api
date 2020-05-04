# REST API - Deployed to Production
The API has been deployed to production <a href = "https://taz-task-manager-api.herokuapp.com">here</a>.<br>
However, since it would result in unnecessary API calls being made, and your sensitive data eventually being stored on my database, which may lead to it being routinely deleted, the API has been made unavailable for use.

# Request Format

## For Users
*   CREATE User:    POST - {{url}}/users
*   LOGIN User:    POST - {{url}}/users/login
*   READ Profile:   GET - {{url}}/users/me
*   UPDATE User:    PATCH - {{url}}/users/me
*   LOGOUT User:    POST - {{url}}/users/logout
*   LOGOUT User all sessions:  POST - {{url}}/users/logoutall
*   DELETE User:    DELETE - {{url}}/users/me
*   CREATE User Profile Picture:    POST - {{url}}/users/me/avatar
*   DELETE User Profile Picture:    DELETE - {{url}}/users/me/avatar

## For Tasks
*   CREATE Task:    POST - {{url}}/tasks
*   UPDATE Task:    PATCH - {{url}}/users/login
*   READ All Tasks:   GET - {{url}}/tasks    Options: ```completed, sortBy, limit, and skip, order```
*   READ One Task:  GET - {{url}}/tasks/{:_id}
*   DELETE One Task:  DELETE - {{url}}/tasks/{:_id}



# Environment Variables to be defined

* <b>PORT</b> : Port Number <br> 
* <b>SENDGRID_API</b> : API Key for SendGrid Services<br>
* <b>MONGO_DB</b> : Mongo DB Connection URL<br>
* <b>JWT_SECRET_KEY</b> : Secret Key for Authentication using jsonwebtokens<br>
