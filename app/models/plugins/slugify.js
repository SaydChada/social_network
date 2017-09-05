
module.exports = function slugifyPlugin (schema, options) {

    let slugField = 'slug';
    let titleField = 'title';

    if(options){
        if(options.slugField){
            slugField = options.slugField;
        }


        if(options.titleField){
            titleField = options.titleField;
        }
    }
    // Add slug field
    schema.add({ [slugField]: String });

    // Add hook preSave save slug
    schema.pre('save', function (next) {
        this.slug = slugify(this[titleField], {lower : true});
        next();
    });
};