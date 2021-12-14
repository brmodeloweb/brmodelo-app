import { createGlobalStyle } from "@xstyled/styled-components";

const GlobalStyles = createGlobalStyle`
  body {
    height: 100%;
    font-family: 'Fira Sans', sans-serif;
    font-weight: 400;
    color: rgba(0,0,0, 0.8);
  }

  h1 {
    font-size: 2.5em;
    font-weight: bold;
  }

  h2 {
    font-size: 1.5em;
  }
`;

export default GlobalStyles;
