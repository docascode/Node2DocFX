(function (){
  var assert = require('assert');
  var dfm = require('../jsdocs/plugins/dfm');

  assert.equal(dfm.convertLinkToGfm('{@link MyClass}'), '<xref:MyClass>');
  assert.equal(dfm.convertLinkToGfm('[MyClass\'s foo property]{@link MyClass#foo}'), '[MyClass\'s foo property](xref:MyClass#foo)');
  assert.equal(dfm.convertLinkToGfm('{@link http://www.google.com|Google}'), '[Google](http://www.google.com)');
  assert.equal(dfm.convertLinkToGfm('{@link https://github.com GitHub}'), '[GitHub](https://github.com)');
  assert.equal(
    dfm.convertLinkToGfm('/**\n * See {@link MyClass} and [MyClass\'s foo property]{@link MyClass#foo}.\n * Also, check out {@link http://www.google.com|Google} and\n * {@link https://github.com GitHub}.\n */'),
    '/**\n * See <xref:MyClass> and [MyClass\'s foo property](xref:MyClass#foo).\n * Also, check out [Google](http://www.google.com) and\n * [GitHub](https://github.com).\n */'
  );
  assert.equal(dfm.convertLinkToGfm('{@link MyClass}', 'packageName.'), '<xref:packageName.MyClass>');
  assert.equal(dfm.convertLinkToGfm('[MyClass\'s foo property]{@link MyClass#foo}', 'packageName.'), '[MyClass\'s foo property](xref:packageName.MyClass#foo)');
})();