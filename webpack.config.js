const path = require("path");

module.exports = {
  entry: [
    "./app/angular/app.js",
    "./app/sass/app.scss",
  ],
  output: {
    path: path.resolve(__dirname, "dist"),
    filename: "js/app.min.js"
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /(node_modules)/,
        use: {
          loader: "babel-loader",
          options: {
            presets: ["@babel/preset-env"]
          }
        }
      },
      {
        test: /\.(png|jpg|ico|gif|eps)$/i,
        exclude: /node_modules/,
        use: [
          {
            loader: 'file-loader',
            options: { outputPath: 'img/', name: '[name].[ext]'}
          },
        ]
      },
      {
        test: /\.s?css$/,
        exclude: /node_modules/,
        use: [
          {
            loader: 'file-loader',
            options: { outputPath: 'css/', name: '[name].min.css'}
          },
          'sass-loader'
        ]
      },
    ]
  }
}