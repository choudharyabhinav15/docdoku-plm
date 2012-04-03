var FolderListItemView = ListItemView.extend({
	tagName: "li",
	className: "folder",
	template: "#folder-list-item-tpl",
	collection: FolderList,
	initialize: function () {
		ListItemView.prototype.initialize.apply(this, arguments);
		this.isOpen = false;
		if (this.model) {
			this.collection.parent = this.model;
		}
		this.events = _.extend(this.events, {
			"click .header .actions .new-folder":	"actionNewFolder",
			"click .header .actions .edit":			"actionEdit",
			"click .header .actions .delete":		"actionDelete",
			"mouseleave .header":					"hideActions",
		});
		this.events['click [data-target="#items-' + this.cid + '"]'] = "toggle";
	},
	hideActions: function () {
		// Prevents the actions menu to stay opened all the time
		this.$el.find(".header .btn-group").first().removeClass("open");
	},
	modelToJSON: function () {
		data = this.model.toJSON();
		if (data.id) {
			data.path = data.id.replace(/^[^:]*:?/, "");
			this.modelPath = data.path;
		}
		return data;
	},
	rendered: function () {
		var isHome = this.model ? this.model.get("home") : false;
		var isRoot = this.model ? false : true;
		if (isHome) this.$el.addClass("home");
		if (isRoot || isHome) {
			this.$el.find(".actions .delete").remove();
			this.$el.find(".actions .edit").remove();
		}

		this.foldersView = this.addSubView(new FolderListView({
			el: "#items-" + this.cid,
			collection: this.collection
		}));
		this.bind("shown", this.shown);
		this.bind("hidden", this.hidden);
	},
	show: function (routePath) {
		this.routePath = routePath;
		this.isOpen = true;
		this.foldersView.show();
		this.trigger("shown");
		this.collection.fetch({
			success: this.traverse
		});
	},
	shown: function () {
		this.$el.addClass("open");
		if (this.routePath) {
			// If from direct url acces (address bar)

			// show documents only if not traversed
			var pattern = new RegExp("^" + this.modelPath);
			if (this.routePath.match(pattern)) {
				this.showContent();
			}
		} else {
			// If not from direct url acces (click)
			this.showContent();
			this.navigate();
		}
	},
	showContent: function () {
		this.setActive();
		this.addSubView(new FolderDocumentListView({
			model: this.model
		})).render();
	},
	hide: function () {
		this.isOpen = false;
		this.foldersView.hide();
		this.trigger("hidden");
	},
	hidden: function () {
		this.$el.removeClass("open");
		this.navigate();
		this.showContent();
	},
	navigate: function () {
		var path = this.modelPath ? "/" + this.modelPath : "";
		app.router.navigate("folders" + path, {trigger: false});
	},
	setActive: function () {
		$("#nav .active").removeClass("active");
		this.$el.find(".header").first().addClass("active");
	},
	toggle: function () {
		this.isOpen ? this.hide() : this.show();
		return false;
	},
	traverse: function () {
		if (this.routePath) {
			var modelPath = this.modelPath;
			var routePath = this.routePath;
			_.each(this.foldersView.subViews, function (view) {
				var pattern = new RegExp("^" + view.modelPath);
				if (routePath.match(pattern)) {
					view.show(routePath);
				}
			});
		}
	},
	actionNewFolder: function (evt) {
		//console.debug(new Date().getTime(), this.cid, "actionNewFolder", evt);
		this.hideActions();
		var view = this.addSubView(new FolderNewView({collection: this.collection}));
		view.show();
		return false;
	},
	actionEdit: function () {
		this.hideActions();
		var view = this.addSubView(new FolderEditView({model: this.model}));
		view.show();
		return false;
	},
	actionDelete: function () {
		this.hideActions();
		if (confirm(app.i18n["DELETE_FOLDER_?"])) {
			this.model.destroy();
		}
		return false;
	}
});
