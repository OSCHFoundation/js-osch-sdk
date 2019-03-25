require('es6-promise').polyfill();

// osch-sdk classes to expose
export * from "./errors";
export {Config} from "./config";
export {Server} from "./server";
export {OschTomlResolver, OSCH_TOML_MAX_SIZE} from "./osch_toml_resolver";

// expose classes and functions from osch-base
export * from "stellar-base";

export default module.exports;
