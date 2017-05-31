ContactManager.module("ContactsApp", function(ContactsApp, ContactManager, Backbone, Marionette, $, _){
  ContactsApp.Router = Marionette.AppRouter.extend({
    appRoutes: {
        "contacts(/filter/criterion::criterion)": "listContacts",
        "contacts/:id": "showContact",
        "contacts/:id/edit": "editContact",
        "emergencycontacts": "emergencyContacts"
    }
  });

  var API = {
    listContacts: function(criterion){
      ContactsApp.List.Controller.listContacts(criterion);
      $("#page").html("Contacts");
      ContactManager.execute("set:active:header", "contacts");
      $('.serviceslist > li').removeClass("nav-current");
      $("#contactsList").addClass("nav-current");
    },

    showContact: function(id){
      ContactsApp.Show.Controller.showContact(id);
      $("#page").html("Contact Info");
      ContactManager.execute("set:active:header", "contacts");
    },

    editContact: function(id){
      ContactsApp.Edit.Controller.editContact(id);
      $("#page").html("Edit Contact");
      ContactManager.execute("set:active:header", "contacts");
    },

    emergencyContacts: function () {
      ContactManager.trigger("contacts:emergency");
      $("#page").html("Emergency Contacts");
      ContactManager.execute("set:active:header", "contacts");
      $('.serviceslist > li').removeClass("nav-current");
      $("#emergencyList").addClass("nav-current");
    }
  };

  ContactManager.on("contacts:list", function(){
    ContactManager.navigate("contacts");
    API.listContacts();
  });

  ContactManager.on("contacts:filter", function(criterion){
    if(criterion){
      ContactManager.navigate("contacts/filter/criterion:" + criterion);
    }
    else{
      ContactManager.navigate("contacts");
    }
  });

  ContactManager.on("contact:show", function(id){
    ContactManager.navigate("contacts/" + id);
    API.showContact(id);
  });

  ContactManager.on("contact:edit", function(id){
    ContactManager.navigate("contacts/" + id + "/edit");
    API.editContact(id);
  });

  ContactsApp.on("start", function(){
    new ContactsApp.Router({
      controller: API
    });
  });
});
