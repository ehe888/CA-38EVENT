var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var request = require('request');
var urlencode = require('urlencode');
var crypto = require('crypto');
var url = require('url');
var sleep = require('sleep');
var util = require("util");


var config = require("./config")();
var conString = config.dbConStr;

var pg = require('pg');
//set connection pool size to 20
pg.defaults.poolSize = 20;

var rollback = function(client, done) {
  client.query('ROLLBACK', function(err) {
    //if there was a problem rolling back the query
    //something is seriously messed up.  Return the error
    //to the done function to close & remove this client from
    //the pool.  If you leave a client in the pool with an unaborted
    //transaction weird, hard to diagnose problems might happen.
    console.error("ROLLBACK error: " + err);
    return done(err);
  });
};

var routes = require('./routes/index');
var app = express();

app.use(express.static(path.join(__dirname, config.debug ? 'static' : 'release')));

global.access_token = null;
global.jsticket = null;
global.expires_at = 0; // getTime() a int represent time in seconds since 1970
global.retriev_lock = 0; //lock the process to retriev ticket

var authFilter = function(req, res, next){
    var pathname = url.parse(req.url).pathname;
    if(pathname && pathname.indexOf('wxoauth_callback') > -1){
        return next();
    }
    
    if(pathname.indexOf('images') > -1 || pathname.indexOf('js') > -1 || pathname.indexOf('css') > -1){
        return next();
    }
    
    var openid = config.debug ? 'test1' : req.cookies.openid;
    
    if(!openid){        
        return res.redirect("https://open.weixin.qq.com/connect/oauth2/authorize?appid=" 
            + config.wxAppId + "&redirect_uri=" 
            + urlencode("http://campaign.canda.cn/wxoauth_callback?redirect=" + urlencode(req.url))
            +"&response_type=code&scope=snsapi_userinfo&state=1234567890#wechat_redirect");
    }
    
    pg.connect(conString, function(err, client, done) {
        if(err) {
            return console.error('error fetching client from pool', err);
        }
        client.query('SELECT * from auth_users where openid=$1', [openid], function(err, result) {
            //call `done()` to release the client back to the pool
            done();
            
            if(err) {
                return console.error('error running query', err);
            }
            
            if(result.rows.length > 0 && result.rows[0]){
                next();
            }else{
                console.log("could not find any record associated with this openid");
                //else need redirect to weixin for auth
                return res.redirect("https://open.weixin.qq.com/connect/oauth2/authorize?appid=" 
                    + config.wxAppId + "&redirect_uri=" 
                    + urlencode("http://campaign.canda.cn/wxoauth_callback?redirect=" + urlencode(req.url))
                    +"&response_type=code&scope=snsapi_userinfo&state=1234567890#wechat_redirect");
            }
        
        });
    }); 
}

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
//app.use(logger('dev'));
// uncomment after placing your favicon in /public
//app.use(favicon(__dirname + '/public/favicon.ico'));

/*
app.use(bodyParser.urlencoded({ extended: false }));
*/
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser("MKGM-CA-CAMPAIGN-9588"));


//app.use('/', routes);


//get jsticket api
app.get('/jsticket', function(req, res){
    if((!global.jsticket || !global.expires_at 
        || (global.expires_at - Date.now()/1000) < (60 * 5)) && !global.retriev_lock ){
        global.retriev_lock = 1;
        console.log("get jsapikey from remote");
        
        //refresh jsapi ticket 5 minutes before its expiration
        //get global access token and jsapi ticket first
        var globalTokenUrl = "https://api.weixin.qq.com/cgi-bin/token?grant_type=client_credential&appid="
                + config.wxAppId + "&secret=" + config.wxAppSecret;
        console.log("app secret : " + config.wxAppSecret);
        
        request.get(globalTokenUrl, function(err, response, body){
            if(err){
                console.log("ERROR when try to get global access token");
                global.retriev_lock = 0;
                return next(err);
            }
            var resData = JSON.parse(body);
            if(body.errcode){
                var error = new Error(resData.errmsg);
                return next(error);
            }
            console.log("global access token body: " + JSON.stringify(resData));
            var getJsapiUrl = "https://api.weixin.qq.com/cgi-bin/ticket/getticket?access_token=" 
                            + resData.access_token+ "&type=jsapi"; 
            request.get(getJsapiUrl, function(err, response, body){
                if(err){
                    console.log("ERROR when try to get jsapi ticket");
                    global.retriev_lock = 0;
                    return next(err);
                }
                var apiInfo = JSON.parse(body);
                if(body.errcode){
                    var error = new Error(apiInfo.errmsg);
                    return next(error);
                }
            
                console.log("global jsapi_ticket body: " + JSON.stringify(apiInfo));
                
                global.jsticket = apiInfo.ticket;
                global.expires_at = Date.now()/1000 + parseInt(apiInfo.expires_in); // 7200 seconds = 2hrs
                global.retriev_lock = 0;
                return res.json({
                    jsticket: global.jsticket,
                    expires_at: global.expires_at
                });
            });
        });
    }else{
        console.log("get jsapikey from global cache");
        return res.json({
            jsticket: global.jsticket,
            expires_at: global.expires_at
        });
    }
    
})


if(!config.debug){
    app.use(authFilter);    
}

/*
    params:
        1. sharedby - the initiators open id
        2. shareid - sharing identification used to get title and content
*/
app.get('/', function(req, res, next) {
    var sharedby = req.query.sharedby,
        shareid = req.query.shareid, //the unique shareing id that can help us to get shared content and title
        mobile = req.query.mobile; 
    var openid = req.cookies.openid;
    /*if sharedby is not null then 
     check if the user has been send 50 bonus, if not send 50 bonus to him/her */
    if(sharedby && openid){
        pg.connect(conString, function(err, client, done) {
            if(err) {
                console.error('error get connection from pool', err);
                return next(err);
            }
            
            client.query("select * from bonus_record where sharedby=$1", [sharedby], 
                        function(err, result){
                done(); 
                if(err) {  
                  console.error('error running query', err);
                  next(err);
                  return;
                }
                        
                if(result.rows.length === 0 ){
                    //first time bonus hit, insert into bonus_record
                    pg.connect(conString, function(err, client, done) {
                        if(err) {
                            return next(err);
                        }
                        client.query('BEGIN', function(err) {
                            if(err) return rollback(client, done);

                            process.nextTick(function() {
                                var text = "INSERT INTO bonus_record(mobile, openid, sharedby, shareid) " 
                                    + "VALUES($1, $2, $3, $4)";
                                client.query(text, [mobile, openid, sharedby, shareid], 
                                    function(err) {
                                        if(err) {
                                            console.error(err);
                                            return rollback(client, done);
                                        }
                                        client.query('COMMIT', done);
                                        //if insert success then send 50 yuan short message
                                        var rawString = util.format("mobile=%s&promo_type=2", config.debug ? '13764211365' : input.mobile.trim());
                        
                                        var hmac = crypto.createHmac('sha256', config.smsAppSecret);
                                        hmac.update(rawString);
                                        var smsSign = hmac.digest();
                                        
                                        request.post({
                                                url: config.smsGateway,
                                                form: {
                                                    mobile: config.debug ? '13764211365' : input.mobile.trim(),
                                                    promo_type: 2,
                                                    sign: smsSign
                                                }
                                            }, function(err, res, bd){
                                                if(err){
                                                    console.error(err);
                                                    //TODO: If there is any error we'd better save the record into recover pool
                                                }
                                                console.log("send 50 sms without error the result => " + bd);
                                            }
                                        );
                                });
                            });
                        });
                    });
                }
            });
        });
    }
     
    
    var jsTicketUrl = "http://" + config.jsTicketHost + ":" + app.get('port') + "/jsticket";
    request.get(jsTicketUrl, function(err, response, body){
        if(err){
            console.error("Failed to get jsapi ticket information");
            return next(err);
        }
        var ticketInfo = JSON.parse(body);
        
        //signature string
        var now = Math.round(Date.now()/1000);
        var fullUrl = req.protocol + '://' + req.get('host') + req.originalUrl;
        var nonceStr = '123456790';
        var rawSig = "jsapi_ticket=" + ticketInfo.jsticket 
                    + "&noncestr=" + nonceStr
                    + "&timestamp=" + now
                    + "&url=" + fullUrl;
        
        console.log("signature request url : " + rawSig);
        var shasum = crypto.createHash('sha1');
        shasum.update(rawSig);
        
        var signature = shasum.digest('hex');
        
        console.log("get the signature : " + signature);
        var jsticketCookie = config.wxAppId + "," + now + "," + nonceStr + "," + signature;
        
                
        res.cookie('jsticket', jsticketCookie, { maxAge: (parseInt(ticketInfo.expires_at) - Date.now()/1000 - 60*5) * 1000 });
        
        
        
        res.sendFile(path.join(__dirname, config.debug ? './static' : './release', 'home.html'));
    });
});




app.get('/wxoauth_callback', function(req, res, next){
    var redirectUrl = urlencode.decode(req.query.redirect);
    console.log("OAuth Redirect Callback redirect url : " + redirectUrl);
    
    var accessTokenUrl = "https://api.weixin.qq.com/sns/oauth2/access_token?appid=" 
        + config.wxAppId + "&secret=" + config.wxAppSecret 
        + "&code=" + req.query.code + "&grant_type=authorization_code";
    
    request.get(accessTokenUrl, function(err, response, bd){
        if(err){
            console.error("ERROR ocurred when request for access token : " + err);
            return next(err);
        }
        console.log("auth token response : " + JSON.stringify(bd));
        var resData = JSON.parse(bd);

    	if(resData.errcode){
    	    console.error("some error happened when tring to get access token");
    		var error = new Error(resData.errmsg);
    		error.status = 500;
    		return next(error);
    	}else{
    		console.log("body access_token: " + resData.access_token);
            console.log("body openid: " + resData.openid);
            var access_token = resData.access_token;
    		var refresh_token = resData.refresh_token;
    		var openid = resData.openid;
    		
    		res.cookie('openid', openid, { maxAge: 365 * 24 * 60 * 60 * 1000 }); //Save openid for 365 days
    		
            var getUserInfoUrl = "https://api.weixin.qq.com/sns/userinfo?access_token=" 
                    + access_token + "&openid=" + openid + "&lang=zh_CN";
            request.get(getUserInfoUrl, function(err, response, body){
                if(err){
                    console.error("ERROR ocurred when request for user info : " + err);
                    return next(err);
                }
                
                console.log("get userinfo body : " + body);
                var userInfo = JSON.parse(body);
                var nickname = userInfo.nickname,
                    sex = userInfo.sex,
                    province = userInfo.province,
                    city = userInfo.city,
                    country = userInfo.country,
                    headimgurl = userInfo.headimgurl,
                    privilege = userInfo.privilege,
                    unionid = userInfo.unionid || '';
                
                pg.connect(conString, function(err, client, done) {
                    if(err) {
                        console.error('error get connection from pool');
                        return next(err);
                    }
                    
                    client.query("select * from auth_users where openid=$1", [openid], function(err, result){
                        done();
                        if(err) {  
                          console.error('error running query', err);
                          return next(err);
                        }
                        var rows = result.rows;
                        
                        
                        if(rows.length > 0 ){
                            pg.connect(conString, function(err, client, done) {
                                if(err) {
                                    return next(err);
                                }
                                client.query('BEGIN', function(err) {
                                    if(err) return rollback(client, done);
    
                                    process.nextTick(function() {
                                        var text = "UPDATE auth_users " 
                                                + "SET nickname=$1, sex=$2, province=$3, city=$4, country=$5, " 
                                                + " headimgurl=$6, privilege=$7, unionid=$8, access_token=$9, " 
                                                + " refresh_token=$10 "
                                                + " WHERE openid = $11";
                                        client.query(text, [nickname, sex, province, 
                                            city, country, headimgurl, privilege, 
                                            unionid, access_token, refresh_token, openid], 
                                            function(err) {
                                                console.log("get openid from db : " + openid);
                                                if(err) return rollback(client, done);
                                                client.query('COMMIT', done);
                                                console.log("Reset openid in cookie : " + openid);
                                                return res.redirect(redirectUrl);
                                        });
                                    });
                                });
                            });
                            
                        }else{
                            pg.connect(conString, function(err, client, done) {
                                if(err) {
                                    return next(err);
                                }
                                client.query('BEGIN', function(err) {
                                    if(err) return rollback(client, done);
    
                                    process.nextTick(function() {
                                        var text = "INSERT INTO auth_users(openid, nickname, sex, province, " 
                                            + "city, country, headimgurl, privilege, unionid, access_token, refresh_token)"
                                            + "VALUES($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)";
                                        client.query(text, [openid, nickname, sex, province, 
                                            city, country, headimgurl, privilege, 
                                            unionid, access_token, refresh_token], 
                                            function(err) {
                                                if(err) return rollback(client, done);
                                                client.query('COMMIT', done);
                                                console.log("Reset openid in cookie : " + openid);
                                                return res.redirect(redirectUrl);
                                        });
                                    });
                                });
                            });
                        }
                    });
                });
            });
    	}
    });
})

app.post('/lottery', function(req, res, next){
    /*
    var ua = req.headers['user-agent'].toLowerCase();
    if(!ua ||  ua.indexOf("micromessenger") < 0 ) {
        console.log("==============not weixin===========");
        return res.json({
                success: false,
                message: '请在微信中打开'
        });
    }*/


    var input = JSON.parse(JSON.stringify(req.body));
    
    console.log(req.body);
    /*
    if(input.mobile === '输入手机号来抢ta的福袋!' || input.mobile === ''){
        console.log("=====invalid mobile=== " + input.mobile);
        return res.json({
                success: false,
                message: '无效的手机号码'
        });
    }
    
        
    if(input.openid !== req.cookies.openid){
        return res.json({success:false, message: 'ILLEGAL'});
    }
    */
    /*
     *  insert mobile number into the lottery record table, if success then send sms of 25元   
    */
    
    pg.connect(conString, function(err, client, done) {
        if(err) {
            return next(err);
        }
        client.query('BEGIN', function(err) {
            if(err) {
                rollback(client, done);
                return next(err);
            }

            process.nextTick(function() {
                var text = "INSERT INTO lottery_record(mobile, openid, shareid, sharedby)" 
                    + "VALUES($1, $2, $3, $4)";
                client.query(text, [ input.mobile, input.openid, input.shareid, input.sharedby ], 
                    function(err, result) {
                        console.error(err);
                        if(err) {
                            rollback(client, done);
                            return res.json({
                                success: false,
                                data: "INTERNAL_ERROR"
                            });
                        }
                        client.query('COMMIT', done);
                        
                        /*if success send sms */
                        console.log("===> send 25 yuan sms to the mobile");
                        
                        var rawString = util.format("mobile=%s&promo_type=1", config.debug ? '13764211365' : input.mobile.trim());
                        
                        var hmac = crypto.createHmac('sha256', config.smsAppSecret);
                        hmac.update(rawString);
                        var smsSign = hmac.digest();
                        
                        request.post({
                                url: config.smsGateway,
                                form: {
                                    mobile: config.debug ? '13764211365' : input.mobile.trim(),
                                    promo_type: 1,
                                    sign: smsSign
                                }
                            }, function(err, res, bd){
                                if(err){
                                    console.error(err);
                                    //TODO: If there is any error we'd better save the record into recover pool
                                }
                                console.log("send sms without error the result => " + bd);
                                
                            }
                        );
                        
                        return res.json({
                            success: true,
                            data: result
                        });
                });
            });
        });
    });
   
});

app.post('/shareInfos', function(req, res, next) {
    var input = JSON.parse(JSON.stringify(req.body));

    var data = {
        openid : input.openid,
        shareid : input.shareid,
        sharedby : input.sharedby,
        title : input.title,
        content : input.content,
        value: input.value,
        mobile: input.mobile
    }
    console.log("share infos : " + JSON.stringify(data));
    
    pg.connect(conString, function(err, client, done) {
        if(err) {
            return next(err);
        }
        client.query('BEGIN', function(err) {
            if(err) {
                rollback(client, done);
                return next(err);
            }

            process.nextTick(function() {
                var text = "INSERT INTO share_info(openid, shareid, sharedby, title, content, value, mobile)" 
                    + "VALUES($1, $2, $3, $4, $5, $6, $7)";
                client.query(text, [data.openid, data.shareid, data.sharedby, data.title, data.content, data.value, data.mobile], 
                    function(err) {
                        console.error(err);
                        if(err) return rollback(client, done);
                        client.query('COMMIT', done);
                        return res.json({
                            success: true,
                            data: data
                        });
                });
            });
        });
    });

});


app.get('/originUser', function(req, res, next){
    var shareid = req.query.shareid;
    
    console.log("shareid = " + shareid);
    pg.connect(conString, function(err, client, done) {
        if(err) {
            console.error('error get connection from pool', err);
            return next(err);
        }
        
        client.query("select a.title, a.content, a.value, b.nickname, b.headimgurl from share_info a join auth_users b on a.openid=b.openid where a.shareid=$1", [shareid], 
                    function(err, result){
            done(); 
            if(err) {  
              console.error('error running query', err);
              next(err);
              return;
            }
                    
            if(result.rows.length === 0 ){
                return res.json({});
            }
            
            return res.json(result.rows[0]);
        });
    });
});

app.get('/luckybag', function(req, res, next){
    pg.connect(conString, function(err, client, done) {
        if(err) {
            console.error('error get connection from pool', err);
            return next(err);
        }
        
        client.query("select count(*) + 55321 as lotteryCount from lottery_record where used=true", [], 
                    function(err, result){
            done();
            if(err) {  
              console.error('error running query', err);
              next(err);
              return;
            }
            return res.json(result.rows[0]);
        });
    });
});

app.get('/users', function(req, res, next){
    pg.connect(conString, function(err, client, done) {
        if(err) {
            console.error('error get connection from pool', err);
            return next(err);
        }
        
        client.query("select b.openid, b.nickname, b.headimgurl, sum(a.value) as value from lottery_record a join auth_users b on a.openid=b.openid  where a.sharedby=$1 group by b.openid, b.nickname, b.headimgurl", [req.query.sharedby], 
                    function(err, result){
            done();
            if(err) {  
              console.error('error running query', err);
              next(err);
              return;
            }
                    
            return res.json(result.rows);
        });
    });    
});

// catch 404 and forward to error handler
app.use(function(req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
    app.use(function(err, req, res, next) {
        res.status(err.status || 500);
        res.render('error', {
            message: err.message,
            error: err
        });
    });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
        message: err.message,
        error: {}
    });
});



module.exports = app;
