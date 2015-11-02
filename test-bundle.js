var assets = require('.');
module.exports = {
  bundle: {
    app: {
      scripts: [
        './bower_components/jquery/dist/jquery.min.js',
        './bower_components/boostrap/dist/js/bootstrap.min.js'
      ],
      styles: [
        './bower_components/bootstrap/dist/css/bootstrap.min.css'
      ],
      options: {
        uglify: false,
        minCSS: false,
        transforms: {
          styles: assets.append
        },
        result: {
          type: {
            scripts: 'plain',
            styles: 'plain'
          }
        }
      }
    }
  }
};
