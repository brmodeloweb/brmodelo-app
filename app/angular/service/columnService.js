export const buildColumn = ({ name = "", PK = false, FK = false, type = "INT", idOrigin = "", idLink = "" } = {}) => ({
  FK,
  PK,
  NOT_NULL: false,
  UNIQUE: false,
  AUTO_INCREMENT: false,
  defaultValue: "",
  name,
  tableOrigin: {
    idOrigin,
    idLink,
    idName: "",
  },
  type
});
