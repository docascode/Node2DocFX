(function () {
  function convertLinkToGfm(text, uidPrefix) {
    var linkRules = [
      {
        // [link text]{@link namepathOrURL}
        regexp: /\[(?:([^\]]+))\]{(@link|@linkcode|@linkplain) +([^}| ]+)}/g,
        callback: function (match, p1, p2, p3) {
          return generateDfmLink(p2, p3, p1);
        }
      },
      {
        // {@link namepathOrURL}
        // {@link namepathOrURL|link text}
        // {@link namepathOrURL link text (after the first space)}
        regexp: /\{(@link|@linkcode|@linkplain) +([^}| ]+)(?:(?:\|| +)([^}]+))?\}/g,
        callback: function (match, p1, p2, p3) {
          return generateDfmLink(p1, p2, p3);
        }
      }
    ];

    var result = text;
    linkRules.forEach(function (r) {
      result = result.replace(r.regexp, r.callback);
    });
    return result;

    function generateDfmLink(tag, target, text) {
      var result = '';
      if (!text) {
        // if link text is undefined, it must link to namepath(uid)
        if (uidPrefix) {
          target = uidPrefix + target;
        }
        result = '<xref:' + target + '>';
        if (tag === '@linkcode') {
          return '<code>' + result + '</code>';
        }
      } else {
        result = text;
        if (tag === '@linkcode') {
          result = '<code>' + result + '</code>';
        }
        result = '[' + result + '](';
        if (!/^(https?:\/\/)?([\da-z\.-]+)\.([a-z\.]{2,6})([\/\w \.-]*)*\/?$/.test(target)) {
          // if target isn't a url, it must be a namepath(uid)
          result += 'xref:';
          if (uidPrefix) {
            target = uidPrefix + target;
          }
        }
        result += target + ')';
      }
      return result;
    };
  }

  module.exports = {
    convertLinkToGfm: convertLinkToGfm
  }
})();