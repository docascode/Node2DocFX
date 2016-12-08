Specification
=============

1. Design
--------

### 1.1 UID Specification
Based on the [namepath] in JSDoc, to avoid UID conflict between packages, the format of UID is designed to include [package name](https://docs.npmjs.com/files/package.json#name) as:
```
{packageName}.namepath
```
For global members that hasn't parent class, the format of UID is designed as:
```
{packageName}._global.namepath
```

### 1.2 New DocumentProcessor for DocFX
JavaScript has some language features hard to fit DocFX's PageViewModel, like [optional parameter](221-an-optional-parameter-using-jsdoc-syntax), [multiple types parameter](231-allows-one-type-or-another-type-type-union), so some new properties are needed and some existing properties' type need to be changed.

2. JavaScript Language Features
--------
### 2.1 Parameters with properties
See http://usejsdoc.org/tags-param.html#parameters-with-properties
#### 2.1.1 Documenting a parameter's properties
#### 2.1.2 Documenting properties of values in an array (🛠**TO BE IMPLEMENTED**)
### 2.2 Optional parameters and default values
See http://usejsdoc.org/tags-param.html#optional-parameters-and-default-values
#### 2.2.1 An optional parameter (using JSDoc syntax) (🛠**TO BE IMPLEMENTED**)
#### 2.2.2 An optional parameter and default value (🛠**TO BE IMPLEMENTED**)
### 2.3 Multiple types and repeatable parameters
See http://usejsdoc.org/tags-param.html#multiple-types-and-repeatable-parameters
#### 2.3.1 Allows one type OR another type (type union) (🛠**TO BE IMPLEMENTED**)
#### 2.3.2 Allows any type (🛠**TO BE IMPLEMENTED**)
#### 2.3.3 Allows a parameter to be repeated (🛠**TO BE IMPLEMENTED**)


### 2.2 parameter with properties
3. Other Features in JSDoc
--------
### 3.1 {@link}
