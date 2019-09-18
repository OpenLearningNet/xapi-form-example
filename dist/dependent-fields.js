function updateDependentFields(form, evaluator, dependentFields) {
    for (var i = 0; i < dependentFields.length; i++) {
        var field = dependentFields[i];
        try {
            field.setAttribute('value', '' + evaluator(field.dataset.expression || ""));
        } catch (err) {
            field.setAttribute('value', 'N/A');
        }
    };
}

function initDependentFields(form, className, onChange) {
    var parser = initExpressions(function(term) {
        var field = form.elements[term];

        if (field.type === "number") {
            return parseFloat(field.value);
        } else {
            return field.value;
        }
    });
    var evaluator = function(exp) {
        return parser.expressionToValue(exp);
    };
    
    var dependentFields = form.getElementsByClassName(className);
    for (var i = 0; i < dependentFields.length; i++) {
        var field = dependentFields[i]; 
        field.disabled = true;
        field.dataset.expression = field.value;
    };

    updateDependentFields(form, evaluator, dependentFields);
    form.addEventListener("change", function(event) {
        updateDependentFields(event.currentTarget, evaluator, dependentFields);
        if (onChange) {
            onChange(event);
        }
    });
}