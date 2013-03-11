
// simple routing for top level menu

Template.actionbar.showActionbar = function(){
    return Session.get("action") == 'showMain';
}
Template.page.showPage = function(){
    return Session.get("action") == 'showMain';
}
Template.about.showAbout = function(){
    return Session.get("action") == 'showAbout';
}
Template.contact.showContact = function(){
    return Session.get("action") == 'showContact';
}


Template.topbar.events({
   'click .action': function(event){
       var elem = $( event.srcElement );
       $('#topbar').find('.active').removeClass('active');
       elem.parent().addClass('active');
       Session.set('action', elem.data('action'));
   } 
});

Meteor.startup(function() {
    
    
    Session.set('action', 'showMain');
    
    


});
    



