# brModeloWeb
### Web application for database modeling and teaching

#### Developed by [@miltonbsn](https://github.com/miltonbsn) and released under the [Apache License 2.0](https://choosealicense.com/licenses/apache-2.0/), currently being worked at by [@telmotrooper](https://github.com/telmotrooper).

#### Dependencies
To use this application you'll need:
* [Node.js](https://nodejs.org/)
* [Gulp](https://gulpjs.com/)
* [MongoDB](https://www.mongodb.com/)

#### Setup
1. Create a directory for the database with `sudo mkdir -p /data/db` and give your user ownership of it `sudo chown YOUR_USER_NAME:users -R /data/db`
1. Clone this repository
2. Install the dependencies with `npm i`

#### Running the application
1. Start the database with `mongod`
2. Start the application with `npm start`
3. Access the application at [http://localhost:3000/](http://localhost:3000/)
