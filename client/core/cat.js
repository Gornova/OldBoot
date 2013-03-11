/**
 * Cat module organizes the code in a compositional way (symmetric monoidal category)
 * 
 * See Retracing some paths in Process Algebra (1996) by Samson Abramsky for theory
 * 
 */
( function(root, _){
    
    var modules = {};
    
    var Context = function(listener){
        
        listener = listener || {};
        
        this.trigger = function( event ){
            var params = Array.prototype.slice.call(arguments, 1);
            listener[event].apply( null, params);
        };
        
        this.listen = function( events, handler ){
            _.each( events, function(event){
               listener[ event ] = handler[event]; 
            });
        };
        
    };
    
    root.Cat = Cat = {
        
      
        define: function(name, builder){
            return modules[ name ] = {
                name: name,
                builder: builder
            };
        },
      
        /*
         * sequential composition M;N
         */
        seq: function( m, n){
            var name =  m.name + ';' + n.name;
            return modules[ name ] = {
                name: name,
                builder: function(context){         
                    var nInstance = modules[n.name].builder( context );
                    var mInstance = modules[m.name].builder( new Context( nInstance ) );
                    return _.extend({}, mInstance);            
                }
            };
              
        },
      
        /*
         * parallel composition or dot product M|N
         */
        dot: function(m, n){
            var name = m.name + '*' + n.name;
            return modules[ name ] = {
                name: name,
                builder:function( context ){
                    var nInstance = modules[n.name].builder( context );
                    var mInstance = modules[m.name].builder( context );
                    return _.extend( mInstance, nInstance);
                }
            };  
        },
      
        /*
         * trace M^
         */
        trace: function(m, events){
           var name =  m.name + '^';
           return modules[name] = {
               name: name,
               builder: function( context ){
                   var mCtx = _.clone( context );
                   var mInstance = modules[m.name].builder(mCtx);
                   mCtx.listen(events, mInstance);
                   return mInstance;
               }
           };
        },
      
        /*
         * int construction
         */
        intc: function(m, n){
          var name = '[' + m.name + ',' + n.name + ']'
          return modules[ name ] = {
              name: name,
              builder: function( context ){
                  var ctx = _.clone( context );
                  var nInstance = modules[n.name].builder( ctx );
                  var mInstance = modules[m.name].builder( ctx );
                  var dot = _.extend( mInstance, nInstance);
                  ctx.listen( _.keys(nInstance), nInstance );
                  ctx.listen( _.keys(mInstance), mInstance );
                  return dot;
              }
          };
        },
      
        /*
         * start a module with a given name
         */
        start: function( m ){
            return modules[m.name].builder( new Context );
        }
      
    };
    
    
})(this, _);



