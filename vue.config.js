module.exports = {
  css: {
    extract: false,
  },

  pages: {
    popup: {
      template: 'public/browser-extension.html',
      entry: './src/popup/main.js',
      title: 'Popup',
    },
    options: {
      template: 'public/browser-extension.html',
      entry: './src/options/main.js',
      title: 'Options',
    },
  },
  pluginOptions: {
    browserExtension: {
      componentOptions: {
        background: {
          entry: 'src/background/index.js',
        },
        contentScripts: {
          entries: {
            'content-script': ['src/content-scripts/index.js'],
          },
        },
      },
    },
  },
}
