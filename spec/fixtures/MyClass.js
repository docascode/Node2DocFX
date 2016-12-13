/**
 * This is a description of the MyClass constructor function.
 * @class
 * @classdesc This is a description of the MyClass class.
 */
function MyClass() {
  /**
  * @param {string} somebody Somebody's name.
  */
  function sayHello(somebody) {
    alert('Hello ' + somebody);
  }

  /**
  * @param {(string|string[])} [somebody=John Doe] - Somebody's name, or an array of names.
  */
  function sayHelloAllowsMultipleTypes(somebody) {
    if (!somebody) {
      somebody = 'John Doe';
    } else if (Array.isArray(somebody)) {
      somebody = somebody.join(', ');
    }
    alert('Hello ' + somebody);
  }
}