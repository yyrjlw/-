const tsImportPluginFactory = require('ts-import-plugin')

module.exports = {
  //并行编译
  parallel:false,
  configureWebpack: {
    module: {
      rules: [
        //van按需引入
        {
          test: /\.(jsx|tsx|js|ts)$/,
          loader: 'ts-loader',
          options: {
            transpileOnly: true,
            getCustomTransformers: () => ({
              before: [tsImportPluginFactory({
                libraryName: 'vant',
                libraryDirectory: 'es',
                style: true
              })]
            }),
            compilerOptions: {
              module: 'es2015'
            }
          },
          exclude: /node_modules/
        },
        //css2viewport
        {
          test: /\.css$/i,
          use: ['postcss-loader']
        }
      ]
    }
  }
}