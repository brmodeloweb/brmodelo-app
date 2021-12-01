# [app.brmodeloweb.com](https://app.brmodeloweb.com)
<!-- ALL-CONTRIBUTORS-BADGE:START - Do not remove or modify this section -->
[![All Contributors](https://img.shields.io/badge/all_contributors-8-orange.svg?style=flat-square)](#contributors-)
<!-- ALL-CONTRIBUTORS-BADGE:END -->

## Web application for database modeling and teaching

![Hero shot](https://raw.githubusercontent.com/brmodeloweb/brmodelo-site/master/img/hero-shot.png)
> Released under the [Apache License 2.0](https://choosealicense.com/licenses/apache-2.0/)

### Dependencies

To run this application you'll need:

- [Node.js](https://nodejs.org/) (Strongly recomended to install it via [nvm](https://github.com/nvm-sh/nvm#readme) or [n](https://github.com/tj/n#readme)
- [Yarn](https://yarnpkg.com/)
- [MongoDB](https://www.mongodb.com/) (Check [installation guides](https://docs.mongodb.com/manual/installation/))

#### One time database setup

1. Create database directory: `sudo mkdir -p /data/db`
1. Change database folder ownership to your user: `sudo chown YOUR_USER_NAME:users -R /data/db`

#### Running application

1. Install dependencies: `yarn install`
1. Start database: `mongod`
1. Duplicate `.env.example` and rename it to `.env`
1. Start frontend: `yarn start:frontend`
1. Start server: `yarn start:dev`
1. Access it: [http://localhost:9000/](http://localhost:9000/)

### Running with Docker

If you already have docker installed you can skip the [Setup](#setup) and [Run](#run) steps above with:

1. to start: `docker-compose up`
1. to finish: `docker-compose down`

### Tests

With the database, backend, and frontend up-and-running:

Run `yarn test` to run Cypress tests in headless mode.

Or, run `yarn cy:open` to open the test runner for running tests in interactive mode.

> **Note:** For the tests to work, you will have to copy the `cypress.env.example.json` file as `cypress.env.json` (included on `.gitignore`) and update the `user` and `password` with valid credentials.

### Production environments

- Stable: [https://app.brmodeloweb.com](https://app.brmodeloweb.com)
- Staging: [https://brmodelo-stage.herokuapp.com](https://brmodelo-stage.herokuapp.com/)

## Contributors ✨

Thanks goes to these wonderful people ([emoji key](https://allcontributors.org/docs/en/emoji-key)):

<!-- ALL-CONTRIBUTORS-LIST:START - Do not remove or modify this section -->
<!-- prettier-ignore-start -->
<!-- markdownlint-disable -->
<table>
  <tr>
    <td align="center"><a href="https://github.com/miltonbsn"><img src="https://avatars2.githubusercontent.com/u/881231?v=4?s=100" width="100px;" alt=""/><br /><sub><b>Milton Bittencourt de Souza Neto</b></sub></a><br /><a href="https://github.com/brmodeloweb/brmodelo-app/commits?author=miltonbsn" title="Code">💻</a> <a href="https://github.com/brmodeloweb/brmodelo-app/commits?author=miltonbsn" title="Tests">⚠️</a> <a href="https://github.com/brmodeloweb/brmodelo-app/issues?q=author%3Amiltonbsn" title="Bug reports">🐛</a> <a href="#maintenance-miltonbsn" title="Maintenance">🚧</a></td>
    <td align="center"><a href="http://id.etc.br"><img src="https://avatars3.githubusercontent.com/u/301545?v=4?s=100" width="100px;" alt=""/><br /><sub><b>Idmar Ramos Junior (Id)</b></sub></a><br /><a href="https://github.com/brmodeloweb/brmodelo-app/commits?author=idmarjr" title="Code">💻</a> <a href="#design-idmarjr" title="Design">🎨</a> <a href="#projectManagement-idmarjr" title="Project Management">📆</a> <a href="#maintenance-idmarjr" title="Maintenance">🚧</a></td>
    <td align="center"><a href="https://about.me/feekosta"><img src="https://avatars3.githubusercontent.com/u/13004903?v=4?s=100" width="100px;" alt=""/><br /><sub><b>Felipe de Souza da Costa</b></sub></a><br /><a href="https://github.com/brmodeloweb/brmodelo-app/commits?author=feekosta" title="Code">💻</a> <a href="#infra-feekosta" title="Infrastructure (Hosting, Build-Tools, etc)">🚇</a> <a href="https://github.com/brmodeloweb/brmodelo-app/pulls?q=is%3Apr+reviewed-by%3Afeekosta" title="Reviewed Pull Requests">👀</a></td>
    <td align="center"><a href="https://github.com/oicramps"><img src="https://avatars.githubusercontent.com/u/7519115?v=4?s=100" width="100px;" alt=""/><br /><sub><b>Márcio Santos</b></sub></a><br /><a href="https://github.com/brmodeloweb/brmodelo-app/commits?author=oicramps" title="Code">💻</a> <a href="https://github.com/brmodeloweb/brmodelo-app/pulls?q=is%3Apr+reviewed-by%3Aoicramps" title="Reviewed Pull Requests">👀</a></td>
    <td align="center"><a href="https://www.linkedin.com/in/telmo-trooper/"><img src="https://avatars.githubusercontent.com/u/9438853?v=4?s=100" width="100px;" alt=""/><br /><sub><b>Telmo "Trooper"</b></sub></a><br /><a href="https://github.com/brmodeloweb/brmodelo-app/commits?author=telmotrooper" title="Code">💻</a></td>
    <td align="center"><a href="https://www.linkedin.com/in/arthurmota/"><img src="https://avatars.githubusercontent.com/u/25749372?v=4?s=100" width="100px;" alt=""/><br /><sub><b>Arthur Mota</b></sub></a><br /><a href="https://github.com/brmodeloweb/brmodelo-app/commits?author=ArthurMota9" title="Code">💻</a> <a href="https://github.com/brmodeloweb/brmodelo-app/pulls?q=is%3Apr+reviewed-by%3AArthurMota9" title="Reviewed Pull Requests">👀</a></td>
    <td align="center"><a href="https://github.com/joaomfiumari"><img src="https://avatars.githubusercontent.com/u/7141759?v=4?s=100" width="100px;" alt=""/><br /><sub><b>joaomfiumari</b></sub></a><br /><a href="https://github.com/brmodeloweb/brmodelo-app/commits?author=joaomfiumari" title="Code">💻</a> <a href="#infra-joaomfiumari" title="Infrastructure (Hosting, Build-Tools, etc)">🚇</a></td>
  </tr>
  <tr>
    <td align="center"><a href="https://walmyr.dev"><img src="https://avatars.githubusercontent.com/u/2768415?v=4?s=100" width="100px;" alt=""/><br /><sub><b>Walmyr</b></sub></a><br /><a href="https://github.com/brmodeloweb/brmodelo-app/commits?author=wlsf82" title="Tests">⚠️</a></td>
  </tr>
</table>

<!-- markdownlint-restore -->
<!-- prettier-ignore-end -->

<!-- ALL-CONTRIBUTORS-LIST:END -->

This project follows the [all-contributors](https://github.com/all-contributors/all-contributors) specification. Contributions of any kind welcome!