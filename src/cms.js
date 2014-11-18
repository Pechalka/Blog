function find(array, cb) {
  for(var i=0; i<array.length; i++) {
    if (cb(array[i])) return array[i];
  }
    
  return null;
}


var connection = require('./connection').read;

var loadPage = function(page_id, cb){
    var result = {}
    connection.query('select * from blocks', function(e, blocks){
        if (e) return cb(e);

        var c = {};
        blocks.forEach(function(b){
            c[b.key] = b.value;
        });

        result.constants = c;
        connection.query('select * from pages', function(e, rows){
            var page;

            if (e) return cb(e);
            if (page_id){
                page = find(rows, function(p){ return p.id == page_id});    
            } else {
                page = find(rows, function(p){ return !!p.isHomePage; })
                page_id = page.id;
            }
            
            result.title = page.title;
            result.content = page.content;
            result.template = page.template;

            result.nav = rows.map(function(p){
                var url = p.isHomePage == 1 ? '/' : "/pages/" + p.id; 
                return { url : url, title : p.title, id : p.id, active : page_id == p.id };
            })
            
            

            cb(null, result)
        })
    })
}

module.exports = {
    loadPage : loadPage
}