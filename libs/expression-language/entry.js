import ExpressionParser from './ExpressionParser';
import language from './language';

window.initExpressions = function(evalTerm) {
    let funcs = {};
    const termDelegate = (term) => {
        if (funcs[term.toUpperCase()]) {
            // Return a string reference to the function
            return term;
        } else {
        return evalTerm(term);
        }
    };
    const defn = language(termDelegate, {});
    funcs = defn.PREFIX_OPS;
    return new ExpressionParser(defn);
};
