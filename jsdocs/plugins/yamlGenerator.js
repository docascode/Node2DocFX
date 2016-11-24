(function () {
  var items = [
    // add a default global object
    {
      uid: "global",
      id: "global",
      name: "global",
      fullName: "global",
      type: "Class",
      summary: "global object"
    }
  ];
  var itemsMap = {};

  function addItem(item) {
    items.push(item);
    itemsMap[item.uid] = item;
  }

  function handleClass(item, doclet) {
    item.type = "Class";
    // set syntax
    item.syntax = {};
    // hmm... anything better?
    item.syntax.content = item.name;
    // add a constructor
    var ctor = {
      id: item.id + ".#ctor",
      uid: item.uid + ".#ctor",
      parent: item.uid,
      name: item.id
    };
    handleFunction(ctor, doclet);
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
          type: p.type === undefined ? undefined : p.type.names[0],
          description: p.description
        };
      });
    }
    // set name
    var params = [];
    (item.syntax.parameters || []).forEach(function (p) {
      if (p.id.indexOf(".") < 0) params.push(p.id);
    });
    item.name += "(" + params.join(", ") + ")";
    // set return type
    if (doclet.returns != undefined) {
      item.syntax.return = {
        type: doclet.returns[0].type === undefined ? undefined : doclet.returns[0].type.names[0],
        description: doclet.returns[0].description
      };
    }
    // set syntax
    // which one is better:
    // 1. function method_name(arg1, arg2, ...);
    // 2. return_type function method_name(arg1, arg2)
    // 3. function method_name(arg1, arg2) -> return_type
    item.syntax.content = "function " + item.name + ";";
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
    var base = 'yml';
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
        case "Method":
        case "Field":
          var parentId = i.parent || "global";
          var parent = classes[parentId];
          if (parent === undefined) {
            console.log(parentId + " is not a class, ignored.");
            break;
          }
          parent.items.push(i);
          if (parentId === "global") {
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
            name: r,
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
      if (doclet.memberof !== undefined && itemsMap[doclet.memberof] === undefined) return;
      // ignore unrecognized kind
      if (typeMap[doclet.kind] === undefined) {
        console.log("unrecognized kind: " + doclet.kind);
        return;
      }
      // basic properties
      var item = {
        uid: doclet.longname,
        id: doclet.name,
        parent: doclet.memberof,
        name: doclet.name,
        summary: doclet.description
      };
      // set parent
      if (item.parent !== undefined) {
        var parent = itemsMap[item.parent];
        (parent.children = parent.children || []).push(item.uid);
      }
      addItem(item);
      typeMap[doclet.kind](item, doclet);
      // set full name
      item.fullName = (item.parent ? item.parent + "." : "") + item.name;
    },
    parseComplete: function () {
      serialize();
    }
  };
})();
