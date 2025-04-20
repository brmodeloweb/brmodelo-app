# [app.brmodeloweb.com](https://app.brmodeloweb.com)
<!-- ALL-CONTRIBUTORS-BADGE:START - Do not remove or modify this section -->
[![All Contributors](https://img.shields.io/badge/all_contributors-14-orange.svg?style=flat-square)](#contributors-)
<!-- ALL-CONTRIBUTORS-BADGE:END -->

## Web application for database modeling and teaching

![Hero shot](https://www.brmodeloweb.com/img/hero-shot-pt-br.png)
> Released under the [Apache License 2.0](https://choosealicense.com/licenses/apache-2.0/)

## Dependencies

To run this application you'll need:

- [EditorConfig](https://editorconfig.org/)
- [Node.js](https://nodejs.org/) (Strongly recommended to install it via [nvm](https://github.com/nvm-sh/nvm#readme) or [n](https://github.com/tj/n#readme))
- [Yarn](https://yarnpkg.com/)
- [MongoDB Community Edition](https://www.mongodb.com/) (Check [installation guides](https://docs.mongodb.com/manual/installation/))

## Running application

1. Install dependencies: `yarn install`
1. Duplicate `.env.example` and rename it to `.env`
1. Make sure you have MongoDB running (To know more: [MacOS](https://docs.mongodb.com/manual/tutorial/install-mongodb-on-os-x/#run-mongodb-community-edition), [Windows](https://docs.mongodb.com/manual/tutorial/install-mongodb-on-windows/#run-mongodb-community-edition-as-a-windows-service), [CentOS](https://docs.mongodb.com/manual/tutorial/install-mongodb-on-red-hat/#run-mongodb-community-edition), [Ubuntu](https://docs.mongodb.com/manual/tutorial/install-mongodb-on-ubuntu/#run-mongodb-community-edition) or [Debian](https://docs.mongodb.com/manual/tutorial/install-mongodb-on-debian/#run-mongodb-community-edition))
1. Start frontend: `yarn start:frontend`
1. Start server: `yarn start:dev`
1. Access it: [http://localhost:9000/](http://localhost:9000/)

## Running with docker-compose

> **Note:** Docker setup is still a work in progress and does not offer a good developer experience. For now we recommend you to run the project locally following the instructions listed above. If you still want to use docker, here's how:

1. Make sure you have [Docker Desktop](https://www.docker.com/get-started) running
1. Start docker: `docker-compose up` or `docker-compose up -d`
1. Access it: [http://localhost:9000/](http://localhost:9000/)
1. Once your done, finish docker: `docker-compose down`

## Tests

### Setup tests

1. Duplicate `cypress.env.example.json` and rename it to `cypress.env.json`
1. Update `cypress.env.json` with valid user credentials (Username and password)

> [!WARNING]
> The data from the accound you set in `cypress.env.json` will be wiped out after the tests run.
> So, don't use your real account here!

### E2E tests

To run E2E tests you have two options:

1. Run headless mode in your terminal window: `yarn test:cy`
1. Run interactive mode: `yarn cy:open`


### Unit Tests

To run the unit tests you have two options:

- `yarn test` to run all the tests and collect the coverage report. Or;
- Execute in a `watch` mode by running `yarn test:watch`


## Production environments

- Stable: [https://app.brmodeloweb.com](https://app.brmodeloweb.com)
- Staging: [https://brmodelo-stage.herokuapp.com](https://brmodelo-stage.herokuapp.com/)

## Contributors ✨

Thanks goes to these wonderful people ([emoji key](https://allcontributors.org/docs/en/emoji-key)):

<!-- ALL-CONTRIBUTORS-LIST:START - Do not remove or modify this section -->
<!-- prettier-ignore-start -->
<!-- markdownlint-disable -->
<table>
  <tbody>
    <tr>
      <td align="center" valign="top" width="14.28%"><a href="https://github.com/miltonbsn"><img src="https://avatars2.githubusercontent.com/u/881231?v=4?s=100" width="100px;" alt="Milton Bittencourt de Souza Neto"/><br /><sub><b>Milton Bittencourt de Souza Neto</b></sub></a><br /><a href="https://github.com/brmodeloweb/brmodelo-app/commits?author=miltonbsn" title="Code">💻</a> <a href="https://github.com/brmodeloweb/brmodelo-app/commits?author=miltonbsn" title="Tests">⚠️</a> <a href="https://github.com/brmodeloweb/brmodelo-app/issues?q=author%3Amiltonbsn" title="Bug reports">🐛</a> <a href="#maintenance-miltonbsn" title="Maintenance">🚧</a></td>
      <td align="center" valign="top" width="14.28%"><a href="http://id.etc.br"><img src="https://avatars3.githubusercontent.com/u/301545?v=4?s=100" width="100px;" alt="Idmar Ramos Junior (Id)"/><br /><sub><b>Idmar Ramos Junior (Id)</b></sub></a><br /><a href="https://github.com/brmodeloweb/brmodelo-app/commits?author=idmarjr" title="Code">💻</a> <a href="#design-idmarjr" title="Design">🎨</a> <a href="#projectManagement-idmarjr" title="Project Management">📆</a> <a href="#maintenance-idmarjr" title="Maintenance">🚧</a></td>
      <td align="center" valign="top" width="14.28%"><a href="https://about.me/feekosta"><img src="https://avatars3.githubusercontent.com/u/13004903?v=4?s=100" width="100px;" alt="Felipe de Souza da Costa"/><br /><sub><b>Felipe de Souza da Costa</b></sub></a><br /><a href="https://github.com/brmodeloweb/brmodelo-app/commits?author=feekosta" title="Code">💻</a> <a href="#infra-feekosta" title="Infrastructure (Hosting, Build-Tools, etc)">🚇</a> <a href="https://github.com/brmodeloweb/brmodelo-app/pulls?q=is%3Apr+reviewed-by%3Afeekosta" title="Reviewed Pull Requests">👀</a></td>
      <td align="center" valign="top" width="14.28%"><a href="https://github.com/oicramps"><img src="https://avatars.githubusercontent.com/u/7519115?v=4?s=100" width="100px;" alt="Márcio Santos"/><br /><sub><b>Márcio Santos</b></sub></a><br /><a href="https://github.com/brmodeloweb/brmodelo-app/commits?author=oicramps" title="Code">💻</a> <a href="https://github.com/brmodeloweb/brmodelo-app/pulls?q=is%3Apr+reviewed-by%3Aoicramps" title="Reviewed Pull Requests">👀</a></td>
      <td align="center" valign="top" width="14.28%"><a href="https://www.linkedin.com/in/telmo-trooper/"><img src="https://avatars.githubusercontent.com/u/9438853?v=4?s=100" width="100px;" alt="Telmo "Trooper""/><br /><sub><b>Telmo "Trooper"</b></sub></a><br /><a href="https://github.com/brmodeloweb/brmodelo-app/commits?author=telmotrooper" title="Code">💻</a></td>
      <td align="center" valign="top" width="14.28%"><a href="https://www.linkedin.com/in/arthurmota/"><img src="https://avatars.githubusercontent.com/u/25749372?v=4?s=100" width="100px;" alt="Arthur Mota"/><br /><sub><b>Arthur Mota</b></sub></a><br /><a href="https://github.com/brmodeloweb/brmodelo-app/commits?author=ArthurMota9" title="Code">💻</a> <a href="https://github.com/brmodeloweb/brmodelo-app/pulls?q=is%3Apr+reviewed-by%3AArthurMota9" title="Reviewed Pull Requests">👀</a></td>
      <td align="center" valign="top" width="14.28%"><a href="https://github.com/joaomfiumari"><img src="https://avatars.githubusercontent.com/u/7141759?v=4?s=100" width="100px;" alt="joaomfiumari"/><br /><sub><b>joaomfiumari</b></sub></a><br /><a href="https://github.com/brmodeloweb/brmodelo-app/commits?author=joaomfiumari" title="Code">💻</a> <a href="#infra-joaomfiumari" title="Infrastructure (Hosting, Build-Tools, etc)">🚇</a></td>
    </tr>
    <tr>
      <td align="center" valign="top" width="14.28%"><a href="https://walmyr.dev"><img src="https://avatars.githubusercontent.com/u/2768415?v=4?s=100" width="100px;" alt="Walmyr"/><br /><sub><b>Walmyr</b></sub></a><br /><a href="https://github.com/brmodeloweb/brmodelo-app/commits?author=wlsf82" title="Tests">⚠️</a></td>
      <td align="center" valign="top" width="14.28%"><a href="https://github.com/Tarliton"><img src="https://avatars.githubusercontent.com/u/7471617?v=4?s=100" width="100px;" alt="Tárliton Basso de Godoy"/><br /><sub><b>Tárliton Basso de Godoy</b></sub></a><br /><a href="https://github.com/brmodeloweb/brmodelo-app/commits?author=Tarliton" title="Code">💻</a> <a href="#infra-Tarliton" title="Infrastructure (Hosting, Build-Tools, etc)">🚇</a></td>
      <td align="center" valign="top" width="14.28%"><a href="http://johnfercher.com"><img src="https://avatars.githubusercontent.com/u/4752636?v=4?s=100" width="100px;" alt="John Fercher"/><br /><sub><b>John Fercher</b></sub></a><br /><a href="#financial-johnfercher" title="Financial">💵</a></td>
      <td align="center" valign="top" width="14.28%"><a href="https://www.ofnet.com.br"><img src="https://avatars.githubusercontent.com/u/3935214?v=4?s=100" width="100px;" alt="Henrique Ferraz"/><br /><sub><b>Henrique Ferraz</b></sub></a><br /><a href="#financial-henriqueferraz" title="Financial">💵</a></td>
      <td align="center" valign="top" width="14.28%"><a href="http://www.paulo.eti.br"><img src="https://avatars.githubusercontent.com/u/2488937?v=4?s=100" width="100px;" alt="Paulo Ricardo Stradioti"/><br /><sub><b>Paulo Ricardo Stradioti</b></sub></a><br /><a href="#financial-paulostradioti" title="Financial">💵</a></td>
      <td align="center" valign="top" width="14.28%"><a href="https://github.com/salimNabbout"><img src="https://avatars.githubusercontent.com/u/75948052?v=4?s=100" width="100px;" alt="Salim Nabbout"/><br /><sub><b>Salim Nabbout</b></sub></a><br /><a href="#financial-salimNabbout" title="Financial">💵</a></td>
      <td align="center" valign="top" width="14.28%"><a href="https://github.com/ailtonferrazjr"><img src="https://avatars.githubusercontent.com/u/52893006?v=4?s=100" width="100px;" alt="Justin Ferraz"/><br /><sub><b>Justin Ferraz</b></sub></a><br /><a href="#financial-ailtonferrazjr" title="Financial">💵</a></td>
    </tr>
  </tbody>
</table>

<!-- markdownlint-restore -->
<!-- prettier-ignore-end -->

<!-- ALL-CONTRIBUTORS-LIST:END -->

This project follows the [all-contributors](https://github.com/all-contributors/all-contributors) specification. Contributions of any kind welcome!
