# DB Design

==========================

1. User {
   name,
   email,
   age,
   weight,
   email -- considering this as unique for userId
   password
   }

2. Workout {
   type,
   duration,
   calories burned,
   userId: email -- to fetch the details for specific user
   }

3. Goals {
   workouts per week,
   target weight,
   calories burned goal,
   userId: email -- to fetch the details for specific user
   status - enum type,value can be 'in progress','completed'
   }
