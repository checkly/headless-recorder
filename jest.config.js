module.exports = {
  // moduleNameMapper: {
  //   "^vue$": "vue/dist/vue.common.js"
  // },
  moduleFileExtensions: [
    "js",
    "vue",
    "json",
  ],
  transform: {
    "^.+\\.js$": "babel-jest",
    ".*\\.(vue)$": "vue-jest"
    // "^.+\\.js$": "<rootDir>/node_modules/babel-jest",
    // ".*\\.(vue)$": "<rootDir>/node_modules/vue-jest"
    // ".*\\.(vue)$": "<rootDir>/node_modules/jest-vue-preprocessor"
  }
}
