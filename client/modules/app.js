function now(){
    var d = new Date();
    return d.getMilliseconds();
};

App = {

    build: function(){
        return Cat.start( Cat.define('app', function(context){

            // TODO use same style also for topbar
            Cat.define('topbar', function(context){
                return {
                    action: function(x){
                        context.trigger('send', x);
                    }
                };
            });

            var ui =  Cat.intc(
                Cat.define('actionbar', function(context){

                    // TODO move #loginWindow to actionbar template
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
                            var type = elem.data('action');
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
                                    console.log('No action associated to name ' + type);
                                    break;
                            }
                        }
                    });

                    return {

                    };
                }), /* end actionbar */
                Cat.intc(
                    Cat.define('filter', function(context){

                        // store info about filter and sort in session
                        function setSort( sort ){
                            var array = sort.split(' ');
                            Session.set('sort', [ array ]);
                        }

                        function setFilter(filter){
                            Session.set('sort', filter);
                        };

                        Template.page.now = function(){
                            return now();
                        };

                        Template.page.events({
                            'click .filter': function( event ){
                                // get clicked element
                                var elem = $( event.currentTarget );
                                // change active element
                                $('.filter').parent().removeClass('active');
                                elem.parent().addClass('active');
                                // save filter and sort in session
                                setSort( elem.data('sort') );
                                setFilter(  elem.data('filter') );
                            }
                        });

                        return {
                        };
                    }), /* end filter */
                    Cat.intc(
                        Cat.define('list-trips', function(context){

                            function getSort() {
                                if (!Session.get('sort')) {
                                    return [["start_at", "asc"]];
                                }
                                return Session.get('sort');
                            };

                            function getFilter(){
                                if (!Session.get('filter')){
                                    return {
                                        'start_at':{
                                            '$gte':(new Date).getTime()
                                        }
                                    };
                                }
                                return Session.get('filter');
                            };

                            // get collection for trips
                            Meteor.subscribe( 'trips' );
                            var trips = new Meteor.Collection( 'trips' );

                            Template.trips.upcomings = function () {
                                var filter =  getFilter();
                                return trips.find(
                                    filter, {
                                        sort: getSort()
                                    });
                            };

                            Template.trips.events({
                                'click s': function( event ){
                                    var elem = $( event.currentTarget );
                                    if ( elem.hasClass('empty')){
                                        // add current user to db
                                        var tripId = elem.closest('tr').data('id');
                                        trips.update({
                                            _id:tripId
                                        },{
                                            $addToSet:{
                                                liked_by:Meteor.userId()
                                            }
                                        });
                                    } else if ( elem.hasClass('full')){
                                        // remove current user from db
                                        var tripId = elem.closest('tr').data('id');
                                        trips.update({
                                            _id:tripId
                                        }, {
                                            $pull: {
                                                "liked_by": Meteor.userId()
                                            }
                                        });
                                    }
                                }
                            });

                            Template.trips.isStarred = function( tripId ){
                                var results = trips.find( {
                                    _id:tripId,
                                    liked_by:{
                                        $in:[ Meteor.userId()]
                                    }
                                } );
                                return ( results.count() > 0 );
                            }

                            return {
                                add: function( trip ){
                                    trips.insert( trip );
                                }
                            };
                        }), /* end list-trips */
                        Cat.define('create-trip', function(context){

                            var form = {
                              
                              format : 'DD/MM/YY HH:mm',
                              getTitle: function(){
                                  return $('[name="title"]').val();
                              },
                              getMilliseconds: function(datetime){
                                  return moment( datetime, this.format).valueOf();
                              },
                              getStartDateTime: function(){
                                 return this.getMilliseconds(
                                        $('[name="startDate"]').val() + 
                                            ' ' + ( $('[name="startTime"]').val() === '' ? '00:00' : $('[name="startTime"]').val() ));
                              },
                              getEndDateTime: function(){
                                 return this.getMilliseconds(
                                        $('[name="endDate"]').val() + 
                                            ' ' + ( $('[name="endTime"]').val() === '' ? '00:00' : $('[name="endTime"]').val() ));  
                              },
                              getCategories: function(){
                                  return _.map( $('[name="categories"]').val().split(','), function(cat){
                                     return cat.trim();  
                                  });
                              },
                              getDescription: function(){
                                  return $('.editable').data("wysihtml5").editor.getValue();
                              }, 
                              clean: function(){
                                  $('[name="title"]').val('');
                                  $('[name="startDate"]').val('');
                                  $('[name="startTime"]').val('');
                                  $('[name="endDate"]').val('');
                                  $('[name="endTime"]').val('');
                                  $('[name="categories"]').val('');
                                  $('.editable').data("wysihtml5").editor.clear();
                              }
                              
                            };

                            Template.createTrip.rendered = function(){
                                
                                // create start and end datetime pickers
                                $('[name="startDate"]').datepicker({
                                    dateFormat: 'dd/mm/yy',
                                    onSelect: function(){
                                        // force blur in order to trigger validation
                                        $('[name="startDate"]').blur();
                                    }
                                });
                                $('[name="startTime"]').timepicker();
                                $('[name="endDate"]').datepicker({ 
                                    dateFormat: 'dd/mm/yy',
                                    onSelect: function(){
                                        // force blur in order to trigger validation
                                        $('[name="endDate"]').blur();
                                    }
                                });
                                $('[name="endTime"]').timepicker();
                                
                                $.validator.addMethod("dateIntervalValidator", function(value, element) {
                                    var format = 'DD/MM/YY HH:mm';
                                    var start = 
                                        $('[name="startDate"]').val() + 
                                            ' ' + ( $('[name="startTime"]').val() === '' ? '00:00' : $('[name="startTime"]').val() );
                                    var end = 
                                        $('[name="endDate"]').val() + 
                                            ' ' + ( $('[name="endTime"]').val() === '' ? '00:00' : $('[name="endTime"]').val() );
                                    return moment(start, format).valueOf() < moment(end, format).valueOf();
                                }, "* end date must be greater than start date");
                                

                                $("#createTripForm").validate({
                                    // do not display error message
                                    errorPlacement: function(error,element) {
                                        return true;
                                    },
                                    rules:{
                                        endDate:{
                                            dateIntervalValidator: {
                                                depends: function(element) {
                                                    return $("#startDate").val() !== '';
                                                }
                                            }
                                        },
                                        endTime:{
                                            dateIntervalValidator: {
                                                depends: function(element) {
                                                    return $("#startTime").val() !== '';
                                                }
                                            }
                                        }
                                    }
                                });

                                

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





                            Template.createTrip.events({
                                'blur, change': function(event){
                                    if ( $("#createTripForm").valid() ){
                                        $('#createTripBtn').removeClass('disabled').addClass('create');
                                    } else {
                                        $('#createTripBtn').addClass('disabled').removeClass('create');
                                    }
                                },
                                'click .create': function(event, template){

                                    // create a trip object from field values
                                    var trip = {
                                        title: form.getTitle(),
                                        categories: form.getCategories(),
                                        description: form.getDescription(),
                                        created_at: (new Date).getTime(),
                                        updated_at: (new Date).getTime(),
                                        read_by: [],
                                        liked_by: [],
                                        partecipants: [],
                                        comments: [],
                                        start_at: form.getStartDateTime(),
                                        end_at: form.getEndDateTime(),
                                        author: Meteor.userId()
                                    }
                                    console.log( trip );
                                    // clean on finish
                                    form.clean();
                                    // save trip
                                    context.trigger('add', trip);
                                    // close outer panel (in theory I should send an event
                                    $("#createTripPanel").collapse('hide');




                                },
                                'click .cancel': function(event, template){
                                    // clean form
                                    _.each( template.findAll('input'), function(el, id){
                                        $(el).val('');
                                    });
                                    $('.editable').data("wysihtml5").editor.clear();
                                    // close outer panel (in theory I should send an event
                                    $("#createTripPanel").collapse('hide');
                                },
                                'click .toggle-map': function(event){

                                }
                            });

                            return {

                            };
                        }) /* end create-trip */
                        ) /* end list-trip | create-trip */
                    ) /* end filter | list-trip | create-trip */
                ); /* end action-bar | filter | list-trip | create-trip */

            return {
                start: function(){
                    Cat.start(ui);
                }
            };
        }));
    }

}; /* end App */

// must be called before templates are created
App.build().start();