# BRMW

<!-- ALL-CONTRIBUTORS-BADGE:START - Do not remove or modify this section -->
[![All Contributors](https://img.shields.io/badge/all_contributors-26-orange.svg?style=flat-square)](#contributors-)
<!-- ALL-CONTRIBUTORS-BADGE:END -->

BRMW is a web application for database modeling, built for teaching and learning. It runs entirely in the browser: there is no server, no account, and your models stay on your machine.

It follows the classic modeling workflow taught in database courses. You start with a **conceptual** model, convert it into a **logical** model, and generate the **SQL** to create the database. A **NoSQL** modeling module lets you explore the document-oriented alternative from the same conceptual model.

A hosted version, with accounts, cloud storage, sharing and other features, is available at [app.brmodeloweb.com](https://app.brmodeloweb.com/). Learn more at [brmodeloweb.com](https://www.brmodeloweb.com/).

## Features

- **Conceptual modeling** with the entity-relationship notation (Peter Chen, with the Heuser conventions common in Brazilian courses): entities, relationships, attributes, keys, cardinalities, weak entities, ISA hierarchies and associative entities
- **Logical modeling** with tables, columns, primary and foreign keys, and views with query expressions
- **NoSQL modeling** with collections, embedded documents and references
- **Automatic conversion** from conceptual to logical and from conceptual to NoSQL, with interactive choices for the ambiguous cases (ISA strategies, attribute placement, references vs embedding)
- **SQL generation** for the logical model
- **Diagram editing** with multi-selection, copy and paste, undo and redo, snaplines, grid, page breaks and printing
- **Local persistence**: models are saved in the browser's `localStorage`
- **Interface in English and Brazilian Portuguese**

## Technologies

- [React 19](https://react.dev/) with [TypeScript](https://www.typescriptlang.org/) and [styled-components](https://styled-components.com/)
- [JointJS](https://www.jointjs.com/) (`@joint/core`, open source) for the diagram canvas, with custom editor widgets in `app/editor/`
- [React Router 7](https://reactrouter.com/) for routing
- [react-i18next](https://react.i18next.com/) for internationalization
- [Radix UI](https://www.radix-ui.com/) for accessible dialogs
- [Webpack 5](https://webpack.js.org/), [Babel](https://babeljs.io/) and [Sass](https://sass-lang.com/) for the build
- [Jest](https://jestjs.io/) and [Testing Library](https://testing-library.com/) for tests

## Getting started

You will need:

- [Node.js 24.x](https://nodejs.org/) (we recommend installing it via [nvm](https://github.com/nvm-sh/nvm#readme) or [n](https://github.com/tj/n#readme))
- [pnpm 10.x](https://pnpm.io/)
- An editor with [EditorConfig](https://editorconfig.org/) support

Then:

```bash
pnpm install
pnpm run:fe
```

Open [http://localhost:9000](http://localhost:9000). Models are stored in your browser, so clearing site data erases them.

Other commands:

| Command | What it does |
| --- | --- |
| `pnpm build` | Production build into `app/dist` |
| `pnpm test` | Runs the test suite with coverage |
| `pnpm test:watch` | Runs the tests in watch mode |

## Project structure

```
app/
  editor/        editor widgets (canvas, selection, toolbar, clipboard, undo/redo, snaplines, print)
  joint/         JointJS shape definitions (conceptual, logical, NoSQL, links, notes)
  react/         React application
    pages/       one folder per screen: workspace, conceptual, logic, nosql
    components/  shared components and modals
    services/    local persistence and hooks
    router/      routes
    public/      translation files
  sass/          global styles
```

Each page is split into a `*PageWrapper.tsx`, which wires routing and services, and a `*Page.tsx`, which is a presentational component. The conversion engines live next to their editors in `pages/logic/conversor.js` and `pages/nosql/conversor.js`.

## Contributing

Contributions are welcome. Please read the [code of conduct](CODE_OF_CONDUCT.md) before opening an issue or a pull request.

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
      <td align="center" valign="top" width="14.28%"><a href="https://www.linkedin.com/in/telmo-trooper/"><img src="https://avatars.githubusercontent.com/u/9438853?v=4?s=100" width="100px;" alt="Telmo &quot;Trooper&quot;"/><br /><sub><b>Telmo &quot;Trooper&quot;</b></sub></a><br /><a href="https://github.com/brmodeloweb/brmodelo-app/commits?author=telmotrooper" title="Code">💻</a></td>
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
    <tr>
      <td align="center" valign="top" width="14.28%"><a href="https://github.com/walissonkuper"><img src="https://avatars.githubusercontent.com/u/185857098?v=4?s=100" width="100px;" alt="walissonkuper"/><br /><sub><b>walissonkuper</b></sub></a><br /><a href="#financial-walissonkuper" title="Financial">💵</a></td>
      <td align="center" valign="top" width="14.28%"><a href="https://github.com/dpldpc"><img src="https://avatars.githubusercontent.com/u/20994048?v=4?s=100" width="100px;" alt="David de Souza"/><br /><sub><b>David de Souza</b></sub></a><br /><a href="#financial-dpldpc" title="Financial">💵</a></td>
      <td align="center" valign="top" width="14.28%"><a href="https://github.com/JeversonMisaelDaCruz"><img src="https://avatars.githubusercontent.com/u/143036544?v=4?s=100" width="100px;" alt="Jeverson misael da cruz filho"/><br /><sub><b>Jeverson misael da cruz filho</b></sub></a><br /><a href="#financial-JeversonMisaelDaCruz" title="Financial">💵</a></td>
      <td align="center" valign="top" width="14.28%"><a href="https://github.com/joaoMarceloDelfino"><img src="https://avatars.githubusercontent.com/u/150634109?v=4?s=100" width="100px;" alt="João Marcelo de Oliveira Delfino"/><br /><sub><b>João Marcelo de Oliveira Delfino</b></sub></a><br /><a href="https://github.com/brmodeloweb/brmodelo-app/commits?author=joaoMarceloDelfino" title="Code">💻</a></td>
      <td align="center" valign="top" width="14.28%"><a href="https://github.com/estefanotuyama"><img src="https://avatars.githubusercontent.com/u/56903306?v=4?s=100" width="100px;" alt="Estéfano Tuyama Gerassi"/><br /><sub><b>Estéfano Tuyama Gerassi</b></sub></a><br /><a href="https://github.com/brmodeloweb/brmodelo-app/commits?author=estefanotuyama" title="Code">💻</a></td>
      <td align="center" valign="top" width="14.28%"><a href="https://github.com/Felipecluiz"><img src="https://avatars.githubusercontent.com/u/32517289?v=4?s=100" width="100px;" alt="Felipecluiz"/><br /><sub><b>Felipecluiz</b></sub></a><br /><a href="https://github.com/brmodeloweb/brmodelo-app/commits?author=Felipecluiz" title="Code">💻</a></td>
      <td align="center" valign="top" width="14.28%"><a href="https://github.com/EduardoCAHE"><img src="https://avatars.githubusercontent.com/u/98930150?v=4?s=100" width="100px;" alt="Eduardo Castro"/><br /><sub><b>Eduardo Castro</b></sub></a><br /><a href="#financial-EduardoCAHE" title="Financial">💵</a></td>
    </tr>
    <tr>
      <td align="center" valign="top" width="14.28%"><a href="https://github.com/claudiosanavria"><img src="https://avatars.githubusercontent.com/u/274329671?v=4?s=100" width="100px;" alt="claudiosanavria"/><br /><sub><b>claudiosanavria</b></sub></a><br /><a href="#financial-claudiosanavria" title="Financial">💵</a></td>
      <td align="center" valign="top" width="14.28%"><a href="https://github.com/TBMFOCABR"><img src="https://avatars.githubusercontent.com/u/175538326?v=4?s=100" width="100px;" alt="TBMFOCABR"/><br /><sub><b>TBMFOCABR</b></sub></a><br /><a href="#financial-TBMFOCABR" title="Financial">💵</a></td>
      <td align="center" valign="top" width="14.28%"><a href="https://github.com/fabriciocore"><img src="https://avatars.githubusercontent.com/u/96549758?v=4?s=100" width="100px;" alt="fabriciocore"/><br /><sub><b>fabriciocore</b></sub></a><br /><a href="#financial-fabriciocore" title="Financial">💵</a></td>
      <td align="center" valign="top" width="14.28%"><a href="https://github.com/Julsh2"><img src="https://avatars.githubusercontent.com/u/66392008?v=4?s=100" width="100px;" alt="Julianna Lemos"/><br /><sub><b>Julianna Lemos</b></sub></a><br /><a href="#financial-Julsh2" title="Financial">💵</a></td>
      <td align="center" valign="top" width="14.28%"><a href="https://github.com/VIVIANECOELHO1"><img src="https://avatars.githubusercontent.com/u/128558495?v=4?s=100" width="100px;" alt="VIVIANECOELHO1"/><br /><sub><b>VIVIANECOELHO1</b></sub></a><br /><a href="#financial-VIVIANECOELHO1" title="Financial">💵</a></td>
    </tr>
  </tbody>
</table>

<!-- markdownlint-restore -->
<!-- prettier-ignore-end -->

<!-- ALL-CONTRIBUTORS-LIST:END -->

This project follows the [all-contributors](https://github.com/all-contributors/all-contributors) specification. Contributions of any kind are welcome!

## License

Copyright 2026 Milton Bittencourt

Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with the License. You may obtain a copy of the License at

http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the [LICENSE](LICENSE) file for the specific language governing permissions and limitations under the License.

This project continues the work started in [brmodelo-app](https://github.com/brmodeloweb/brmodelo-app), also released under the Apache License 2.0.
