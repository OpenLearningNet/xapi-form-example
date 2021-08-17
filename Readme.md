# xAPI Form Example

This demonstrates how a form can be submitted using xAPI. This package can be uploaded to OpenLearning (via the HTML5/xAPI widget) and can be used as a starting point to build an HTML form where the data is submitted over xAPI.

## Additional Functionality

This example also includes some additional fancy functionality which provides:
 * Mobile responsive tables (which stacks rows into a single column when the screen size diminishes)
 * Form fields which contain formulas that automatically update from other fields and calculate results

## File structure
 * `formSubmit.html` - the main form which can be edited
 * `formulaTable.html` - a more complex form with a table and calculated formulae
 * `publishAttachment.html` - an example for publishing created content
 * `style.css`  - the style sheet which customises the look and feel
 * `dist/`      - a folder containing libraries which power the xAPI features and other fancy functionalities
 * `libs/`      - not required for a production environment, this folder contains the underlying source code for the formula's expression language which is used to build `dist/expression-language.js`

