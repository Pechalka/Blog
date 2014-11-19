$.ajaxSetup({ 
		cache: false ,
		contentType: "application/json; charset=utf-8",
		dataType:"json"
	});


var http = {
	get : function(url, q){
		return $.get(url, q);
	},
	post : function(url, data){
		return $.post(url, JSON.stringify(data))
	},
	del : function(url){
		return $.ajax({
			url : url,
			type : 'DELETE'
		})
	},
	put : function(url ,data){
		return $.ajax({
				url : url,
				type : 'PUT',
				contentType: "application/json; charset=utf-8",
				data : JSON.stringify(data)
			})
	}
}


var app = {
	selectedPage : ko.observable(),
	content : ko.observable()
}


var PagesList = function(){
	var self = this;
	self.title = "Страницы";

	self.pages = ko.observableArray([])
	
	self.removePage = function(page){
		if (!confirm("Вы уверены?")) return;

		http.del('/api/pages/' + page.id)
			.then(function(){
				self.pages.remove(page)
			})
	}

	self.activate = function(){
		$.get('/api/pages', self.pages)
	}

	self.template = 'pages-list'
}



var PageForm = function(){
	var self = this;

	self.page = ko.observable({
		title : '',
		content : '',
		template : 'home'
	});

	self.templates = [
		"home",
		"page"
	];

	var page_id;

	self.activate = function(id){
		page_id = id;
		if (page_id){
			$.get('/api/pages/' + page_id, self.page);
		}
	}

	self.save = function(){
		var redirect = function(){
			window.location = '#'
		}

		if (page_id) 
			http.put('/api/pages/' + page_id, self.page()).then(redirect);
		else 
			http.post('/api/pages', self.page()).then(redirect)  
	}

	self.template = 'edit-form';
}

var Block = function(data){
	var self = this;
	self.key = data.key;
	self.id = data.id;
	self.value = ko.observable(data.value)
	self.value.subscribe(function(value){
		data.value = self.value();
		http.put('/api/blocks/' + data.id, data)
	})
}

var EditBlock = function(){
	var self = this;

	self.blocks = ko.observableArray([])

	self.activate = function(){
		http.get('/api/blocks').done(function(json){
			var blocks = ko.utils.arrayMap(json, function(d){ return new Block(d)})
			self.blocks(blocks)
		})
	}

	self.key = ko.observable();
	self.value = ko.observable();

	self.removeBlock = function(b){
		if (!confirm("Вы уверены?")) return;

		http.del('/api/blocks/' + b.id)
			.then(function(){
				self.blocks.remove(b);
			})
	}

	self.add = function(){
		var duplicate =	ko.utils.arrayFirst(self.blocks(), function(b){ return b.key == self.key()});

		if (duplicate) {
			alert('Такой блок уже есть.');
			return;
		}

		http.post('/api/blocks', { 
			key : self.key(),
			value : self.value()
		}).done(function(block){
			self.key('');
			self.value('');
			self.blocks.push(new Block(block));
		})
	}

	self.template = 'edit-blocks';
}


var updatestate = function(){//todo: use router
	var content = location.hash.slice(1);

	if (!content){
		var view = new PagesList();
		app.content(view);
		view.activate();
		app.selectedPage('pages');
	}
	if (content == "blocks"){
		var view = new EditBlock();
		app.content(view);
		view.activate();	
		app.selectedPage('blocks');	
		
	}
	if (content == "newPage" || content.indexOf("edit/")!=-1){
		var id = content.split('/')[1];// #edit/1 => 1
		var view = new PageForm();
		app.content(view);
		app.selectedPage('pages');

		view.activate(id);		
	}
}

$(window)
	.on('hashchange', updatestate)
	.on('load', updatestate)

$(function(){
	
	ko.applyBindings(app)
	
})