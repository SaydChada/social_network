'use strict';
let blocks = Object.create(null);

let debug = function(varToDebug) {

    console.log("==============VIEW DEBUG ==============" );
    console.log(varToDebug);

};

module.exports =  {
    "extends" : function(name, context) {
        let block = blocks[name];
        if (!block) {
            block = blocks[name] = [];
        }

        block.push(context.fn(this));
    },
    "block" : function(name) {
        let val = (blocks[name] || []).join('\n');

        // clear the block
        blocks[name] = [];
        return val;
    },
    "debug" : debug,
    "dump"  :  debug,
    'dateFormat' : function(date, format, options){
        if(date){
            let dateObj = new Date(date);
            return moment(dateObj).format(format);
        }else{
            return '';
        }
    },
    'init' : function(name, value, context){
        this[name] = value;
    },
    'xif'   : function (v1, operator, v2, options) {

        switch (operator) {
            case '==':
                return (v1 == v2) ? options.fn(this) : options.inverse(this);
            case '===':
                return (v1 === v2) ? options.fn(this) : options.inverse(this);
            case '!=':
                return (v1 != v2) ? options.fn(this) : options.inverse(this);
            case '!==':
                return (v1 !== v2) ? options.fn(this) : options.inverse(this);
            case '<':
                return (v1 < v2) ? options.fn(this) : options.inverse(this);
            case '<=':
                return (v1 <= v2) ? options.fn(this) : options.inverse(this);
            case '>':
                return (v1 > v2) ? options.fn(this) : options.inverse(this);
            case '>=':
                return (v1 >= v2) ? options.fn(this) : options.inverse(this);
            case '&&':
                return (v1 && v2) ? options.fn(this) : options.inverse(this);
            case '||':
                return (v1 || v2) ? options.fn(this) : options.inverse(this);
            default:
                return options.inverse(this);
        }
    },
    "math" : function(lvalue, operator, rvalue, options) {
        lvalue = parseFloat(lvalue);
        rvalue = parseFloat(rvalue);

        return {
            "+": lvalue + rvalue,
            "-": lvalue - rvalue,
            "*": lvalue * rvalue,
            "/": lvalue / rvalue,
            "%": lvalue % rvalue
        }[operator];
    }
};