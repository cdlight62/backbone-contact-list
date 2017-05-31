ContactManager.module("ContactsApp.Emergency", function (Emergency, ContactManager, Backbone, Marionette, $, _) {
    Emergency.Contact = Marionette.ItemView.extend({
        tagName: "tr",
        template: "#emergency-list-item",
        
        regions: {
            panelRegion: "#panel-region",
            contactsRegion: "#contacts-region"
        },

        triggers: {
            "click button.js-remove": "contact:remove"
        },

        events: {
            "click": "highlightName"
        },

        flash: function (cssClass) {
            var $view = this.$el;
            $view.hide().toggleClass(cssClass).fadeIn(800, function () {
                setTimeout(function () {
                    $view.toggleClass(cssClass)
                }, 500);
            });
        },

        highlightName: function (e) {
            this.$el.toggleClass("warning");
        }
    });
});
