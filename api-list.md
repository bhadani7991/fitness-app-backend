# user

===============
POST /signup -- to register the user in the platform
POST /login --- to allow user to login into the application
POST /logout --- to allow user to signout from the application

# workout

====================
POST /workouts -- to save the workout details entered by the users , also allow to save  
 multiple workouts at a time as well

GET /view --- to show the details of workout entered by the logged in user

PATCH /edit -- allow user to edit the workout detail from his history
DELETE /workout -- allow user to delete specific workout detail from his history

# goal

====================
POST /goal -- allows user to save the goal details (It can be no of workout per week or specific target weight)

GET /goal/progress -- get the progress detail of the user goal

# Notification for Goal Progress

\*\* If no of user is less :- in the /goal/progress api , if we find user is close to achieving his goal or achieved his goal trigger an email notification

\*\* If no of user is more:-

# Cron Job

==============

1.  If user is close to achieving the goal or completed the goal will trigger an email to send notification.
2.  Will run this Job every day at morning 8:00
