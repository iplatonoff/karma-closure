var vm = require('vm');
var path = require('path');


// TODO(vojta): improve, this is lame
var parseProvideRequire = function(str) {
  var provides = [];
  var requires = [];
  var modules = [];
  var match;

  str.split('\n').forEach(function(line) {
    match = line.match(/^\s*goog\.provide\([\"\'](.*)[\"\']\)/);
    if (match) {
      provides.push(match[1]);
    }

    match = line.match(/^\s*goog\.module\([\"\'](.*)[\"\']\)/);
    if (match) {
      modules.push(match[1]);
    }

    match = line.match(/^\s*goog\.require\([\"\'](.*)[\"\']\)/);
    if (match) {
      requires.push(match[1]);
    }
  });

  return {
    provides: provides.sort(),
    requires: requires.sort(),
    modules: modules.sort()
  };
};

var parseDepsJs = function(filepath, content) {
  var parsed = {
    fileMap: {},
    provideMap: {}
  };
  var sandbox = {
    parsed: parsed,
    goog: {
      addDependency: function(relativePath, provides, requires) {
        parsed.fileMap[relativePath] = {provides: provides, requires: requires};
        provides.forEach(function(dep) {
          parsed.provideMap[dep] = relativePath;
        });
      }
    }
  };

  vm.runInNewContext(content, sandbox, filepath);

  return parsed;
};

exports.parseDepsJs = parseDepsJs;
exports.parseProvideRequire = parseProvideRequire;
