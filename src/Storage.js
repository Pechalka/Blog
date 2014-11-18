var read = require('./connection').read;
var write = require('./connection').read;

var loadJoin = function(rows, table, condition, field_name, cb){
	var table1_id = condition.split('=')[0];
	var table2_id = condition.split('=')[1];

	var ids = rows.map(function(r){ return r[table1_id]});
	if (ids.length == 0){
		rows.forEach(function(r){
			rp[field_name] = [];
		})
		return cb();
	}


	var sql = 'select * from ' + table + ' where ' + table2_id +' in (' + ids.join(',') + ') ';
	read.query(sql, function(e, data){
		console.log('data>', data);
		var h = {};
		data.forEach(function(r){
			var id = r[table2_id];
            if (!h[id]) h[id] = [];
            
            h[id].push(r);
        });

        rows.forEach(function(r){
            var id = r[table1_id];
            if (h[id])    
                r[field_name] = h[id];
            else
                r[field_name] = [];
        });

        cb();
	})
}

var startsWith = function(value, str) {
	return value.slice(0, str.length) == str;
};

var make_where = function(dbc, where) {
for(var key in where){
    	if (!where[key] || where[key]=='')
    		delete where[key];
    }
var result = '';
for (var key in where) {
	var value = where[key],
		clause = key;
	if (typeof(value) === 'number') clause = key+' = '+value;
	else if (typeof(value) === 'string') {
		/**/ if (startsWith(value, '>=')) clause = key+' >= '+dbc.escape(value.substring(2));
		else if (startsWith(value, '<=')) clause = key+' <= '+dbc.escape(value.substring(2));
		else if (startsWith(value, '<>')) clause = key+' <> '+dbc.escape(value.substring(2));
		else if (startsWith(value, '>' )) clause = key+' > ' +dbc.escape(value.substring(1));
		else if (startsWith(value, '<' )) clause = key+' < ' +dbc.escape(value.substring(1));
		else if (startsWith(value, '(' )) clause = key+' IN ('+value.substr(1, value.length-2).split(',').map(function(s) { 
			if (typeof(s) === 'number') 
				return dbc.escape(parseInt(s)) 
			else
				return dbc.escape(s);
		}).join(',')+')';
		else if (value.indexOf('..') !== -1) {
			value = value.split('..');
			clause = '('+key+' BETWEEN '+dbc.escape(value[0])+' AND '+dbc.escape(value[1])+')';
		} else if ((value.indexOf('*') !== -1) || (value.indexOf('?') !== -1)) {
			value = value.replace(/\*/g, '%').replace(/\?/g, '_');
			clause = key+' LIKE '+dbc.escape(value);
		} else clause = key+' = '+dbc.escape(value);
	}
	if (result) result = result+' AND '+clause; else result = clause;
}
return result;
}

//select r.status, a.first_name, a.phone_number  from gratify_client_rating AS r inner join account AS a on (r.gratify_id = a.id)
var paging = function(sql, q, cb){ //todo: handle errors
	var page = q.page || 1;
		perPage = q.perPage || 10;

//	params = params || [];
	var result = {};
	var count = 'select COUNT(*) as count from ( ' + sql + ' ) as t';
	sql += ' LIMIT ' + (page-1)*perPage +  ', ' +  perPage;
	console.log('select>>', sql);
	read.query(sql , function(e, rows){
		result.items = rows;
		
		var q = read.query(count, function(e, rows){
			console.log('e', e);
			result.totalCount = rows[0]['count'];
			cb(null, result);
		})
		console.log('count', q.sql);
		
	})
}

var readAll = function(table) {
	return function(q, cb) {
        var page= parseInt(q.page,10);
        var perPage= parseInt(q.perPage,10);
        delete q._;

        delete q.page;
        delete q.perPage;

        var sort = '';

        if (q.sortField){
        	sort += "  ORDER BY " + table +"." + q.sortField + " " + (q.sortDist == 'asc'? 'ASC':'DESC');
		}
        delete q.sortField;
        delete q.sortDist;

        var limit='';
        if(page)
        {
            limit=' LIMIT ' + (page-1)*perPage +  ', ' +  perPage;
        }
        for(var key in q){
        	if (!q[key] || q[key]=='')
        		delete q[key];
        }
		var where = make_where(read, q);
		
		if (where!='') where = " where " + where + sort; 
		var sql = 'SELECT * from ' + table + where+ limit;
        var result = {};
        console.log('readALl:', sql);
        read.query(sql, function(e, rows){
        	if (page){
	            result.items = rows;
	            var sql = 'SELECT COUNT(*) as count FROM ' + table + where;
	            read.query(sql, function(e, rows){
	                result.totalCount = rows[0]['count'];
	                cb(null, result);
	            })
        	} else {
    		    cb(null, rows);
        	}
        });
	}
}

var readTable = function(table) {
	return function(id, cb) {
		var sql = 'SELECT * from ' + table + ' where id = ' + read.escape(id) ;
		console.log();
		console.log('read one:');
		console.log(sql);
		console.log();
		
		read.query(sql, function(err, rows, fields) {
			if (err) {
				cb(err);
			}
			else {
				cb(null, rows[0]);
			}
		});
	}
}



var create = function(table){ 
	return function(data, cb) {
		//todo return obj
		var q = write.query('INSERT INTO ' + table + ' SET ?', data, cb);
		console.log(q.sql);
	}
}

var remove = function(table){
	return function(id, cb){
		var sql = 'DELETE from ' + table + ' where id = ' + write.escape(id);
        write.query(sql, cb);
	}
}

var update = function(table){
	//todo return obj
	return function(data, id, cb){
		
console.log('>>>', data);
        var q = write.query('UPDATE ' + table + ' SET ? WHERE id = ' + write.escape(id), data, cb);
		console.log('update:>> ');
		console.log(q.sql);
		console.log();
	}
}



var makeREST = function(table){
	return function(app, url, befor){
		var readallHandlers = [function(req, res){
		    readAll(table)(req.query, function(e, data){
		        res.json(data)
		    })
		}];
		if (befor) readallHandlers.unshift(befor);
		app.get(url, readallHandlers)

		var r = [function(req, res){
            readTable(table)(req.params["id"], function(e, data){
            	if (data)
		        	res.json(data);
		    	else
		    		res.send(404);
		    })
		}]

		if (befor) r.unshift(befor);
		app.get(url + '/:id', r)


		var c = [function(req, res){
			var o = req.body;
		    create(table)(req.body, function(e, result){
		        o.id = result.insertId
		        res.json(o);
		    })
		}]

		if (befor) c.unshift(befor);
		app.post(url, c);

		var d = [function(req, res){
		    remove(table)(req.params["id"], function(e, result){
		        res.json({ success : true });
		    })
		}];

		if (befor) d.unshift(befor);
		app.delete(url + '/:id', d)

		var u = [function(req, res){
			
		    update(table)(req.body, req.params["id"], function(e, obj){
		        res.json(obj);
		    })
		}];

		if (befor) u.unshift(befor);
		app.put(url + '/:id', u)
	}
}

module.exports = function(table){
	return {
		readAll : readAll(table),
		read : readTable(table),
		create : create(table),
		remove : remove(table),
		update : update(table),
		paging : paging, 
		makeREST : makeREST(table),
		loadJoin : loadJoin,
		make_where : make_where
	}
};
