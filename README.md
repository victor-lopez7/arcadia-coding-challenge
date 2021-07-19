# Arcadia coding challenge
Repository to store the solution for the arcadia coding challenge along with relevant information involved in the development.

## Running in docker
`docker-compose up`

## Running locally

Install the packages:
`npm install`

Build and run client app (webpack server [http://localhost:8080](http://localhost:8080)) and backend microservice ([http://localhost:3000](http://localhost:3000))) :
`npm run dev`

You can see the app in [http://localhost:8080](http://localhost:8080).

## Backend
I have used NodeJS, ExpressAPI and a hosted (Atlas) MongoDB database to build the microservice that provides:

- An endpoint to provide retrieve available airports `/airports?limit=<numMaxResults>&search=<query>`
- An endpoint to retrieve an specific airport data `/airports/:id/`
- An endpoint to rerieve arrivals in an specific date range `/airports/:id?begin=<beginDateInMillis>&end=<endDateInMillis>`

The second endpoint was intended to look for departure airports that appeared in arrivals airports query to populate the map component, but due to available time this has been decided to not be implemented.

Some validation has been made in server side so it could be consumed by any other application, not only the current one, reducing response time in this other possible apps, so we do not make invalid calls to OpenSKy.

## Frontend
The idea was to implement by hand every single component (to show coding skills) and not using any external component, but, to meet requirements a table component (DataGrid, from materialUI) has been used.

Several considerations:
- Every field in the form needs to be filled in order to make a submission
- To fill airport code input you need to click a search result.
- End date is restricted to begin date value to fit the OpenSky API max range (7 days), begin date can be changed freely and end date value changes to mantain its correctness with begin date changes. 
- We avoid validation (time consuming development task) not allowing the user to input invalid values and not allowing submission.

## Conclusion
Thanks for the opportunity, I've enjoyed a lot this challenge!
