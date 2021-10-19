module.exports = {
  preset: '@vue/cli-plugin-unit-jest',
  transform: {
    '^.+\\.vue$': 'vue-jest',
    "^.+\\.js$": "babel-jest",
  },
  setupFilesAfterEnv: ['./jest.setup.js'],
  moduleFileExtensions: ["js", "json", "vue"],
}
