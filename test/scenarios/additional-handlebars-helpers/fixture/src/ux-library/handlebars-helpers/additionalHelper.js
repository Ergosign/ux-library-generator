module.exports.register = function (Handlebars, options){
    Handlebars.registerHelper('additionalHelper', (parameter, options) => {
        return parameter;
    });

};
