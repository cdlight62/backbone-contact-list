ContactManager.module("ContactsApp.List", function(List, ContactManager, Backbone, Marionette, $, _){
  List.Controller = {
    listContacts: function(criterion){
      var loadingView = new ContactManager.Common.Views.Loading();
      ContactManager.regions.loading.show(loadingView);

      var fetchingContacts = ContactManager.request("contact:entities");

      var contactsListLayout = new List.Layout();
      var contactsListPanel = new List.Panel();

      $.when(fetchingContacts).done(function(contacts){
        var filteredContacts = ContactManager.Entities.FilteredCollection({
          collection: contacts,
          filterFunction: function(filterCriterion){
            var criterion = filterCriterion.toLowerCase();
            return function(contact){
              if(contact.get("firstName").toLowerCase().indexOf(criterion) !== -1
                || contact.get("lastName").toLowerCase().indexOf(criterion) !== -1
                || contact.get("phoneNumber").toLowerCase().indexOf(criterion) !== -1){
                  return contact;
              }
            };
          }
        });

        if(criterion){
          filteredContacts.filter(criterion);
          contactsListPanel.once("show", function(){
            contactsListPanel.triggerMethod("set:filter:criterion", criterion);
          });
        }

        var contactsListView = new List.Contacts({
          collection: filteredContacts
        });

        contactsListPanel.on("contacts:filter", function(filterCriterion){
          filteredContacts.filter(filterCriterion);
          ContactManager.trigger("contacts:filter", filterCriterion);
        });

        contactsListLayout.on("show", function(){
          contactsListLayout.panelRegion.show(contactsListPanel);
          contactsListLayout.contactsRegion.show(contactsListView);
        });

        contactsListPanel.on("contact:new", function(){
          var newContact = new ContactManager.Entities.Contact();

          var view = new ContactManager.ContactsApp.New.Contact({
            model: newContact
          });

          view.on("form:submit", function(data){
            if(contacts.length > 0){
              var highestId = contacts.max(function(c){ return c.id; }).get("id");
              data.id = highestId + 1;
            }
            else{
              data.id = 1;
            }
            if(newContact.save(data)){
              contacts.add(newContact);
              view.trigger("dialog:close");
              var newContactView = contactsListView.children.findByModel(newContact);
              if(newContactView){
                  newContactView.flash("success");
              }
            }
            else{
              view.triggerMethod("form:data:invalid", newContact.validationError);
            }
          });

          contactsListView.render();
          ContactManager.regions.dialog.show(view);
        });

        ContactManager.on("contacts:emergency", function () {
            var fetchingContacts = ContactManager.request("contact:entities");
            $.when(fetchingContacts).done(function (contacts) {
                var contactsListLayout = new List.Layout();
                var contactsListPanel = new List.Panel();
                var emergencyContacts = new List.Contacts({
                    collection: contacts,
                    childView: ContactManager.ContactsApp.Emergency.Contact
                });
                emergencyContacts.filter = function (contact, index, collection) {
                    return contact.get('emergency') === true;
                };
                emergencyContacts.filter;
                ContactManager.regions.main.show(contactsListLayout);
                contactsListLayout.panelRegion.show(contactsListPanel);
                contactsListLayout.contactsRegion.show(emergencyContacts);
                $("#panel-region").css("visibility", "hidden");

                emergencyContacts.on("childview:contact:remove", function (childView, args) {
                    args.model.set("emergency", false);
                    args.model.save();
                    emergencyContacts.render();
                });
            });
        });

        contactsListView.on("childview:contact:show", function(childView, args){
          ContactManager.trigger("contact:show", args.model.get("id"));
        });

        contactsListView.on("childview:contact:edit", function(childView, args){
          var model = args.model;
          var view = new ContactManager.ContactsApp.Edit.Contact({
            model: model
          });

          view.on("form:submit", function(data){
            if(model.save(data)){
              childView.render();
              view.trigger("dialog:close");
              childView.flash("success");
            }
            else{
              view.triggerMethod("form:data:invalid", model.validationError);
            }
          });

          ContactManager.regions.dialog.show(view);
        });

        contactsListView.on("childview:contact:delete", function(childView, args){
          args.model.destroy();
        });


        ContactManager.regions.loading.reset();
        ContactManager.regions.main.show(contactsListLayout);
      });
    }
  }
});
