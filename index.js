'use strict';
var through = require('through2'),
  gutil = require('gulp-util');
var rework = require('rework'),
  url = require('rework-plugin-url');
var path = require('path'),
  fs = require('fs'),
  urlNode = require('url');

var revHash = require('rev-hash'),
  revPath = require('rev-path'),
  modifyFilename = require('modify-filename');

function transformFilename(file) {
  file.revOrigPath = file.path;
  file.revOrigBase = file.base;
  file.revHash = revHash(file.contents);

  file.path = modifyFilename(file.path, function(filename, extension) {
    var extIndex = filename.indexOf('.');

    filename = extIndex === -1 ?
      revPath(filename, file.revHash) :
      revPath(filename.slice(0, extIndex), file.revHash) + filename.slice(extIndex);

    return filename + extension;
  });
}

var PLUGIN_NAME = 'nodelol';

module.exports = {
  append: function() {
    var isInline = new RegExp("^data:", "i");
    var isURL = new RegExp("^http", "i");

    var subDirectory = 'assets';
    var assets = [];
    return through.obj(function(file, enc, cb) {
      if (file.isStream()) {
        this.emit('error', new gutil.PluginError(PLUGIN_NAME, 'Streams are not supported!'));
        return cb();
      }
      if (file.isBuffer()) {
        var example = rework(file.contents.toString('utf8'), {
            source: 'source.css'
          })
          .use(url(function(url) {

            if (isInline.test(url) || isURL.test(url)) return url;


            var newFile = urlNode.parse(url);
            var dirname = path.dirname(file.path);
            var fileRequired = path.resolve(dirname, newFile.pathname);

            var newFileVinyl = file.clone();
            newFileVinyl.path = path.join(file.bundleOptions.bundleName, path.basename(newFile.pathname));
            newFileVinyl.contents = fs.readFileSync(fileRequired);
            transformFilename(newFileVinyl);
            assets.push(newFileVinyl);
            return urlNode.format({
              pathname: path.join(path.basename(file.bundleOptions.bundleName), path.basename(newFileVinyl.path)),
              hash: newFile.hash
            });
          }))
          .toString({
            sourcemap: false
          });

        var newFile = file.clone();
        newFile.contents = new Buffer(example);
        newFile._assets = assets;
        this.push(newFile);
        cb();
      }
    });
  },
  addMissingAssets: function(rev) {
    return through.obj(function(file, enc, cb) {
      if (file._assets) {
        var self = this;
        file._assets.forEach(function(file, index) {
          self.push(file);
        });
      }
      this.push(file);
      cb();
    });
  }
};
