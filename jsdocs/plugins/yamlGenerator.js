(function () {
  var dfm = require('./dfm');

  var items = [];
  var itemsMap = {};
  var base = 'obj';
  var globalUid = '_global';
  var uidPrefix = '';
  var builtInTypes = [];

  function addItem(item) {
    items.push(item);
    itemsMap[item.uid] = item;
  }

  function handleClass(item, doclet) {
    item.type = "Class";
    item.summary = dfm.convertLinkToGfm(doclet.classdesc);
    // set syntax
    // item.syntax = {};
    // hmm... anything better? -- seems no need to add class syntax?
    // item.syntax.content = item.name;
    // add a constructor
    var ctor = {
      id: item.id + ".#ctor",
      uid: item.uid + ".#ctor",
      parent: item.uid,
      name: item.name,
      fullName: item.fullName + '.' + item.name,
      summary: dfm.convertLinkToGfm(doclet.description)
    };
    handleFunction(ctor, doclet);
    item.children = [ctor.uid];
    addItem(ctor);
  }

  function handleFunction(item, doclet) {
    item.type = doclet.kind === "function" ? "Method" : "Constructor";
    item.syntax = {};
    // set parameters
    if (doclet.params !== undefined) {
      item.syntax.parameters = doclet.params.map(function (p) {
        return {
          id: p.name,
          type: handleParameterType(p.type),
          description: dfm.convertLinkToGfm(p.description)
        };
      });
    }
    // set name and fullName
    var params = [];
    (item.syntax.parameters || []).forEach(function (p) {
      if (p.id.indexOf(".") < 0) params.push(p.id);
    });
    item.name += "(" + params.join(", ") + ")";
    item.fullName += "(" + params.join(", ") + ")";
    // set return type
    if (doclet.returns != undefined) {
      item.syntax.return = {
        type: handleParameterType(doclet.returns[0].type),
        description: dfm.convertLinkToGfm(doclet.returns[0].description)
      };
    }
    // set syntax
    // which one is better:
    // 1. function method_name(arg1, arg2, ...);
    // 2. return_type function method_name(arg1, arg2)
    // 3. function method_name(arg1, arg2) -> return_type
    item.syntax.content = (item.type === "Method" ? "function " : "new ") + item.name;

    function handleParameterType(type) {
      if (!type) return undefined;
      var result = type.names[0];
      if (builtInTypes.indexOf(result.toLowerCase()) == -1) {
        result = uidPrefix + result;
      }
      return result;
    }
  }

  function handleMember(item, doclet) {
    item.type = "Field";
    // set type
    item.syntax = {};
    if (doclet.type != undefined) {
      item.syntax.return = {
        type: doclet.type.names[0]
      };
    }
    // set syntax
    item.syntax.content = item.name;
  }

  function serialize() {
    var serializer = require("js-yaml");
    var fs = require("fs");
    var classes = {};
    var fileMap = {};
    if (!fs.existsSync(base)) {
      fs.mkdirSync(base);
    }
    items.forEach(function (i) {
      switch (i.type) {
        case "Class":
          classes[i.uid] = {
            items: [i],
            referenceMap: {}
          };
          fileMap[i.uid] = i.uid;
          break;
        case "Constructor":
        case "Method":
        case "Field":
          var parentId = i.parent || globalUid;
          var parent = classes[parentId];
          if (parent === undefined) {
            console.log(parentId + " is not a class, ignored.");
            break;
          }
          parent.items.push(i);
          if (parentId === globalUid) {
            (parent.items[0].children = parent.items[0].children || []).push(i.uid);
          }
          fileMap[i.uid] = parentId;
          (i.syntax.parameters || []).forEach(function (p) {
            classes[parentId].referenceMap[p.type] = true;
          });
          if (i.syntax.return) {
            classes[parentId].referenceMap[i.syntax.return.type] = true;
          }
          break;
      }
    });

    var toc = [];
    for (var id in classes) {
      var c = classes[id];
      // build references
      c.references = [];
      for (var r in c.referenceMap) {
        var f = fileMap[r];
        if (f !== id) {
          c.references.push({
            uid: r,
            name: r.indexOf(".") == -1 ? r : r.substring(r.indexOf(".") + 1),
            fullName: r,
            isExternal: f === undefined
          });
        }
      }
      c.referenceMap = undefined;
      if (c.references.length == 0) {
        c.references = undefined;
      }

      // something wrong in js-yaml, workaround it by serialize and deserialize from JSON
      var c = JSON.parse(JSON.stringify(c));
      // replace \r, \n, space with dash
      var fileName = id.replace(/[ \n\r]/g, "-");
      fs.writeFileSync(base + '/' + fileName + ".yml", serializer.safeDump(c));
      console.log(fileName + ".yml generated.");
      toc.push({
        uid: id,
        name: c.items[0].name
      });
    };
    toc.sort(function (a, b) {
      // sort classes alphabetically, but GLOBAL at last
      if (a.uid === globalUid) {
        return 1;
      }
      if (b.uid === globalUid) {
        return -1;
      }
      var nameA = a.name.toUpperCase();
      var nameB = b.name.toUpperCase();
      if (nameA < nameB) {
        return -1;
      }
      if (nameA > nameB) {
        return 1;
      }

      return 0;
    });

    fs.writeFileSync(base + "/toc.yml", serializer.safeDump(toc));
    console.log("toc.yml generated.");
  }

  var typeMap = {
    "member": handleMember,
    "function": handleFunction,
    "class": handleClass
  };

  exports.handlers = {
    newDoclet: function (e) {
      var doclet = e.doclet;
      // ignore anything whose parent is not a doclet
      // except it's a class made with help function
      if (doclet.memberof !== undefined && itemsMap[uidPrefix + doclet.memberof] === undefined && doclet.kind !== "class") {
        return;
      }
      // ignore unrecognized kind
      if (typeMap[doclet.kind] === undefined) {
        console.log("unrecognized kind: " + doclet.kind);
        return;
      }
      // ignore unexported global member
      if (doclet.memberof === undefined && doclet.kind != "class" && !(doclet.meta && doclet.meta.code && doclet.meta.code.name && doclet.meta.code.name.indexOf("exports") == 0)) {
        return;
      }
      // ignore empty longname
      if (!doclet.longname) {
        return;
      }
      var parent = '';
      if (doclet.memberof === undefined && doclet.kind !== "class") {
        parent = "_global.";
      }
      // basic properties
      var item = {
        uid: uidPrefix + parent + doclet.longname,
        id: uidPrefix + parent + doclet.longname,
        parent: (doclet.memberof && doclet.kind !== "class") ? (uidPrefix + doclet.memberof) : undefined,
        name: doclet.name,
        summary: doclet.description ? dfm.convertLinkToGfm(doclet.description) : dfm.convertLinkToGfm(doclet.summary)
      };
      // set parent
      if (item.parent !== undefined) {
        var parent = itemsMap[item.parent];
        (parent.children = parent.children || []).push(item.uid);
      }
      // set full name
      item.fullName = (item.parent ? item.parent + "." : uidPrefix) + item.name;
      addItem(item);
      typeMap[doclet.kind](item, doclet);
    },
    parseBegin: function () {
      var fs = require('fs');
      var config = JSON.parse(fs.readFileSync('config.json'));
      var yamlGeneratorConfig = JSON.parse(fs.readFileSync(config.jsdoc.yamlGeneratorConfig));
      if (yamlGeneratorConfig) {
        base = yamlGeneratorConfig.dest;
      }
      // add a default global object
      if (yamlGeneratorConfig.packageName) {
        globalUid = yamlGeneratorConfig.packageName + "." + globalUid;
        uidPrefix = yamlGeneratorConfig.packageName + ".";
      }
      items.push(
        {
          uid: globalUid,
          id: globalUid,
          name: "GLOBAL",
          fullName: "GLOBAL",
          type: "Class",
          summary: "global object"
        }
      )
      builtInTypes = JSON.parse(fs.readFileSync('built-in.json')).map(function (t) { return t.toLowerCase(); });
    },
    parseComplete: function () {
      serialize();
      // no need to generate html, directly exit process
      process.exit(0);
    }
  };
})();
