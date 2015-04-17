/*global define*/
define([
    'backbone',
    'mustache',
    'text!common-objects/templates/file/file.html',
    'common-objects/views/alert'
], function (Backbone, Mustache, template,AlertView) {
	'use strict';
    var FileView = Backbone.View.extend({

        tagName: 'li',
        className: 'file',

        editMode: true,

        events: {
            'change input.file-check': 'fileCheckChanged',
            'dragstart a.fileName': 'dragStart',
            'click .edit-name ':'editName',
            'click .validate-name ':'validateName',
            'click .cancel-name ':'cancelName'
        },

        initialize: function () {
            this.editMode = this.options.editMode;
            this.model.url = this.options.deleteBaseUrl + '/files/' + this.model.get('shortName');
            this.fileUrl = this.options.uploadBaseUrl + this.model.get('shortName');
        },

        onModelChanged:function(){
            this.fileUrl = this.options.uploadBaseUrl + this.model.get('shortName');
        },

        fileCheckChanged: function () {
            if (this.checkbox.is(':checked')) {
                this.fileNameEl.addClass('stroke');
                this.options.filesToDelete.add(this.model);
            } else {
                this.fileNameEl.removeClass('stroke');
                this.options.filesToDelete.remove(this.model);
            }
        },

        dragStart: function (evt) {
            evt.dataTransfer.setData('DownloadURL', 'application/octet-stream:' + this.model.get('shortName') + ':' + window.location.origin + '/' + this.fileUrl);
        },

        render: function () {
            this.$el.html(Mustache.render(template,{
                url: this.fileUrl,
                shortName: this.model.get('shortName'),
                editMode: this.editMode
            }));

            this.bindDomElements();

            return this;
        },

        bindDomElements: function () {
            this.checkbox = this.$('input.file-check');
            this.fileNameEl = this.$('.fileName');
            this.fileNameInput = this.$('input[name=filename]');
            // TODO : remove global jquery calls, moreover, we don't know if we are in modal. Not reliable.
            this.notifications = $('.modal .notifications');
        },

        editName:function(){
            this.$el.toggleClass('edition');
            this.fileNameInput.focus();
        },

        validateName:function(){

            var _this = this;
            var oldModel = _this.model.clone();
            var newName = this.fileNameInput.val();

            if( this.model.getShortName() !== newName){
                this.model.setShortName(newName);
                this.model.save().success(function(){
                    _this.model.rewriteUrl();
                    _this.onModelChanged();
                    _this.notifications.text("");
                    _this.render();
                    _this.$el.toggleClass('edition');
                }).error(function(error){

                    _this.model = oldModel.clone();
                    _this.model.url = this.url;
                    _this.model.rewriteUrl();
                    _this.render();
                    _this.$el.toggleClass('edition');

                    var errorMessage = error ? error.responseText : _this.model;

                    _this.notifications.append(new AlertView({
                        type: 'error',
                        message: errorMessage
                    }).render().$el);


                });
            }else{
                this.$el.toggleClass('edition');
            }

        },

        cancelName:function(){
            this.$el.toggleClass('edition');
        }
    });

    return FileView;
});
