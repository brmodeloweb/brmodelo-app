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
- [MongoDB Community Edition](https://www.mongodb.com/) (Check [installation guides](https://docs.mongodb.com/manual/installation/))

#### Running application

1. Install dependencies: `yarn install`
1. Duplicate `.env.example` and rename it to `.env`
1. Make sure you have MongoDB running (To know more: [MacOS](https://docs.mongodb.com/manual/tutorial/install-mongodb-on-os-x/#run-mongodb-community-edition), [Windows](https://docs.mongodb.com/manual/tutorial/install-mongodb-on-windows/#run-mongodb-community-edition-as-a-windows-service) [CentOS](https://docs.mongodb.com/manual/tutorial/install-mongodb-on-red-hat/#run-mongodb-community-edition), [Ubuntu](https://docs.mongodb.com/manual/tutorial/install-mongodb-on-ubuntu/#run-mongodb-community-edition) or [Debian](https://docs.mongodb.com/manual/tutorial/install-mongodb-on-debian/#run-mongodb-community-edition)) 
1. Start frontend: `yarn start:frontend`
1. Start server: `yarn start:dev`
1. Access it: [http://localhost:9000/](http://localhost:9000/)

### Running with Docker

*Note:* Docker setup is still a work in progress and does not offer a good developer experience. For now we recommend you to run the project locally following the instructions listed above. If you still want to use docker, here's how:

1. Make sure you have [Docker Desktop](https://www.docker.com/get-started) running 
1. Start docker: `docker-compose up`
1. Access it: [http://localhost:9000/](http://localhost:9000/)
1. Once your done, finish docker: `docker-compose down`

### Tests

First, make sure you have the project up and running with database, backend, and frontend.

1. Duplicate `cypress.env.example.json` and rename it to `cypress.env.json`
1. Edit `cypress.env.json` adding valid user credentials (Username and password)
	*Note:* Tests will delete all models from your user. To avoid lost your work we recommend you to create a different user to run the tests
1. To run the tests you have two options:
	1. Run headless mode in your terminal window: `yarn test`
	1. Run interactive mode: `yar cy:open`

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