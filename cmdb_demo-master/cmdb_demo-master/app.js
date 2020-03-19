//config files
const {config} = require('./config/serversetup');

const express=require('express');
var router = express.Router();
const path=require('path');
const bodyParser=require('body-parser');
const cors = require('cors');
const helmet = require('helmet')
const {SEC_MIDDLEWARE} = require('./config/middleware');

const JWT_SECURITY=process.env.JWT_SECURITY||config.security.JWT_SECURITY;

if(process.env.USER_ASSET_INTEGRATION.toUpperCase()=='YES'){
    console.log("EXECUTE SCHEDULER");
    const scheduler = require('./config/schedulers');
}else{
    console.log("DON'T EXECUTE SCHEDULER");
}


const app = express();
app.set('port', process.env.PORT||config.server.port);

//Enable All CORS Requests

app.use(cors())
app.use(helmet())
/**
 * Parse incoming request bodies in a middleware before your handlers, 
 * available under the req.body property.
 */
app.use(bodyParser.json({limit: '50mb'}));
app.use(bodyParser.urlencoded({limit: '50mb', extended: false}));



/**
 * get log genrated file
 */
app.get('/', function(req, res, next) {
    
    var time = process.uptime(); 
    
    res.status(200).send({message:`UPTIME is : ${time} `});

});
app.get('/log', (req, res) => {
    res.sendFile(__dirname +'/'+config.server.log_file_name);
});
app.get('/db', (req, res) => {    
    res.send(db);   
});
app.get('/dbquery', (req, res) => {    
    db.query('SELECT current date FROM sysibm.sysdummy1 ',function(err,data){
        if(err)     res.send(err);    
        res.send(data);          }); });


// public folder
app.use(express.static(path.join(__dirname, 'public')));

logger.info(`JWT_SECURITY ENABLED : ${JWT_SECURITY.toUpperCase()}`);
if(JWT_SECURITY.toUpperCase()=='YES'){ 
    app.use(SEC_MIDDLEWARE);
}


//app.use('/scripts', require('./routes/scripts'));
app.use('/api/menulist',require('./routes/api/menulist'));
app.use('/api/config_items',require('./routes/api/config_items'));
app.use('/api/classes',require('./routes/api/classes'));
app.use('/api/categories',require('./routes/api/categories'));
app.use('/api/audit',require('./routes/api/audit'));



// stop fake get request
app.get('*', function(req, res, next) {
    var err = new Error(`The requested(${req.url}) resource couldn\'t be found`);
    err.status = 404;   
    throw err;
});

// error handler
app.use( (err, req, res, next)=> {	
    logger.error(err);  
    err.message = err.message || 'Internal Server Error';  
    res.status(err.status || 500).json({message:err.message,status:err.status});    
});


app.listen(app.get('port'),()=>{
    logger.info(`Server start listening at port ${app.get('port')}`);
});
  

module.exports=app;