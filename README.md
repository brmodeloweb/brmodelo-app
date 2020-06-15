# brModeloWeb

## Web application for database modeling and teaching

> Released under the [Apache License 2.0](https://choosealicense.com/licenses/apache-2.0/)

#### Dependencies

To run this application you'll need:
- [Node.js](https://nodejs.org/)
- [MongoDB](https://www.mongodb.com/)

#### Setup

1. Create database directory: `sudo mkdir -p /data/db`
1. Change database folder ownership to your user: `sudo chown YOUR_USER_NAME:users -R /data/db`
1. Install dependencies: `npm install`

#### Running application

1. Start database: `mongod`
1. Start application: `npm start`
1. Access it: [http://localhost:3000/](http://localhost:3000/)
