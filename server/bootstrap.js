Meteor.startup(function () {
    
    // see http://stackoverflow.com/questions/10476170/how-can-i-deploy-node-modules-in-a-meteor-app-on-meteor-com
    
    var require = __meteor_bootstrap__.require;
    var path = require('path');
    var base = path.resolve('.');
    var isBundle = path.existsSync(base + '/bundle');
    var modulePath = base + (isBundle ? '/bundle/static' : '/public') + '/node_modules';

    
    var faker = require(modulePath + '/charlatan'); 
    
    
    Trips = new Meteor.Collection("trips");
    Meteor.publish("trips", function () {
        return Trips.find(); // everything
    });
    
    Meteor.methods({
        fbUrl: function(userId){
            var fbId = Meteor.users.findOne({_id:userId}).services.facebook.id;
            return "http://graph.facebook.com/" + fbId + "/picture/?type=square";
        }
    });
    
	
        /* if ( Trips.find().count() === 0 ){
       
       
       
            // create some random data
       
            _.each( _.range(100), function(id){
                var trip = {};
                trip.title = faker.Lorem.sentence();
                trip.description = faker.Lorem.text();
                trip.categories = faker.Lorem.words();
                trip.partecipants = _.map( _.range( 1+Math.floor(Math.random()*3)), function(id){
                    return faker.Name.firstName() + ' ' + faker.Name.lastName();
                });        
                trip.created_at = 1325372400000 + Math.floor( Math.random()*390 )*24*60*60*1000; 
                trip.updated_at = trip.created_at + Math.floor( Math.random()*5 )*24*60*60*1000;
                trip.start_at = (new Date).getTime() + Math.floor( 5+Math.random()*10 )*24*60*60*1000;
                trip.end_at = trip.start_at + Math.floor( 3+Math.random()*10 )*24*60*60*1000;
                trip.comments = _.map( _.range( Math.floor(Math.random()*5)), function(id){
                    var created_at = trip.created_at + Math.floor( Math.random()*3 )*24*60*60*1000;
                    return {
                        title: faker.Lorem.sentence(),
                        content: faker.Lorem.text(),
                        author: faker.Name.firstName() + ' ' + faker.Name.lastName(),
                        created_at: created_at,
                        updated_at: created_at + Math.floor( Math.random()*2 )*24*60*60*1000
                  
                    };
                });
                trip.views = Math.floor( Math.random()*10 );
                trip.likes = Math.floor( Math.random()*10 );
                trip.read_by = [];
                trip.liked_by = [];
          
                Trips.insert( trip );
            });
       
        }*/


	
	
    });