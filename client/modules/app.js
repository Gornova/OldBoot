

App = {

    build: function(){
        return Cat.start( Cat.define('app', function(context){
    
            Cat.define('topbar', function(context){
                return {
                    action: function(x){
                        context.trigger('send', x);
                    }
                };
            });
    
            var ui = 
            Cat.intc(
                Cat.define('actionbar', function(context){

                    Template.actionbar.rendered = function(){
                        // fix the navbar on the top
                        $('#main-navbar').affix();                   
                    };
                    
                    Template.actionbar.isGuest = function(){
                        return Meteor.user()===null;
                    };
                
                    Template.actionbar.events({
                        'click .action': function( event ){
                            var elem = $( event.currentTarget );
                            context.trigger('action', elem.data('action') );
                        }
                    });

                    return {
                        error: function(msg){
                            console.error(msg);
                        }
                    };
                }),
                Cat.define('page', function(context){
                    
                    function now(){
                        var d = new Date();
                        return d.getMilliseconds();  
                    };
                    
                    /**
                     *
                     *@param sort, string field asc|desc
                     */
                    function setSort( sort ){
                        var array = sort.split(' ');
                        Session.set('sort', [ array ]);
                    }
                    
                    function getSort() {
                        if (!Session.get('sort')) {                                       
                            return [["start_at", "asc"]];
                        }
                        return Session.get('sort');
                    };
                
                    function getFilter(){
                        if (!Session.get('filter')){
                            return {'start_at':{ '$gte':(new Date).getTime() } };
                        }
                        return Session.get('filter');
                    };
                
                    Meteor.subscribe( 'trips' );
                    var trips = new Meteor.Collection( 'trips' );
                    Template.trips.upcomings = function () {
                        var filter =  getFilter(); 
                        return trips.find( 
                        filter, {
                            sort: getSort()
                        } );
                    };    
                    
                    Template.page.now = function(){
                        return (new Date()).getTime();
                    };
                    
                    Template.createTrip.rendered = function(){
                        
                         $('.editable').wysihtml5({
                                "font-styles": false, //Font styling, e.g. h1, h2, etc. Default true
                                "emphasis": true, //Italics, bold, etc. Default true
                                "lists": true, //(Un)ordered lists, e.g. Bullets, Numbers. Default true
                                "html": false, //Button which allows you to edit the generated HTML. Default false
                                "link": false, //Button to insert a link. Default true
                                "image": false, //Button to insert an image. Default true,
                                "color": false //Button to change color of font  
                            });
                        
                        var map = L.map('map').setView([51.505, -0.09], 13);
                        L.tileLayer('http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                            maxZoom: 18
                        }).addTo(map);
                    };
                    
                    Template.page.events({
                        'click .filter': function( event ){
                            var elem = $( event.currentTarget );
                            $('.filter').parent().removeClass('active');
                            elem.parent().addClass('active');
                            var sort = elem.data('sort');
                            setSort( sort );
                            Session.set('filter',  elem.data('filter')  );
                        }
                    });
                    
                    Template.trips.events({
                       'click s': function( event ){
                           var elem = $( event.currentTarget );
                           if ( elem.hasClass('empty')){
                               // add current user to db
                               var tripId = elem.closest('tr').data('id');
                               trips.update({_id:tripId},{$addToSet:{ liked_by:Meteor.userId() }});
                           } else if ( elem.hasClass('full')){
                               // remove current user from db
                               var tripId = elem.closest('tr').data('id');
                               trips.update({_id:tripId}, {$pull: {"liked_by": Meteor.userId()}});
                           }
                           
                           
                       }
                    });
               
                    Template.trips.isStarred = function( tripId ){
                        var results = trips.find( {_id:tripId, liked_by:{ $in:[ Meteor.userId()] } } );
                        return ( results.count() > 0 );
                    }
                
                    // TODO onlogin show favorites and unread
                    function openLoginWindow(){
                        
                        Meteor.loginWithFacebook(
                            function(err){
                                if (err){
                                    return console.log('Cannot login with Facebook. ' + err);
                                }
                                $('#loginWindow').modal('hide');
                            });
                        
                        $('#loginWindow .modal-body').height(200);
                        $('#loginWindow').modal('show');  
                   
                    };
                    
                    
                    return {
                        action:
                        function( type ){
                        
                            switch ( type ){
                                case 'login':
                                    openLoginWindow();
                                    break;
                                case 'logout':
                                    Meteor.logout();
                                    break;
                                case 'search':
                                    break;
                                default:
                                    context.trigger('error', 'No action associated to name ' + type);
                                    break;
                            }
                        }
                    };
                })
                );

    
    
            return {
                start: function(){
                    Cat.start(ui);
                }
        
            };
        }) );
    }
  
};

// must be called before templates are created
App.build().start();