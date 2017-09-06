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
    'dateToYears' : function(date){
      if(date){
          return  moment().diff(new Date(date), 'years');
      }  else{
          return '';
      }
    },
    'init' : function(name, value, context){
        this[name] = value;
    },
    'concat' : function(v1, v2, options){
        return v1+v2;
    },
    'toJSON' : function(obj, options){
        return (typeof obj === 'object') ? JSON.stringify(obj) : obj;
    },
    'getTemplateBtnFriend' : function(status, userId, options){

        let btnDisabled = '';
        let bootstrapBtnCls, btnCls, label;
        switch(status){
            case 'confirmé' :
                btnCls = 'delete_friend';
                label = '<i title="supprimer" class="fa fa-trash">&nbsp;</i>';
                bootstrapBtnCls = 'danger';
                break;
            case 'invitation en cours' :
                btnCls = '';
                label = 'En attente';
                bootstrapBtnCls = 'default';
                btnDisabled = 'disabled';
                break;
            case 'recommandé' :
                btnCls = 'accept_reject_recommendation';
                label = 'Accepter / Refuser';
                bootstrapBtnCls = 'warning';
                break;
            case 'en attente de confirmation' :
                btnCls="accept_reject_invitation";
                label = 'Accepter / Refuser';
                bootstrapBtnCls = 'warning';
                break;
        }
        return `<button class="btn btn-${bootstrapBtnCls} ${btnCls}" ${btnDisabled} data-user-id="${userId}">${label}</button>`;

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