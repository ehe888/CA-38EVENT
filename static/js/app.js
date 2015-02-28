function IsAndroid()  
{
    var userAgentInfo = navigator.userAgent;  
    var Agents = new Array("Android");  
    var flag = false;  
    for (var v = 0; v < Agents.length; v++) {  
        if (userAgentInfo.indexOf(Agents[v]) > 0) { flag = true; break; }  
    }  
    return flag;  
}

function IsIphone4 () {
    if (window.screen.width==320&&window.screen.height==480) {
        return true;
    }
    else {
        return false;
    }

}

function is_weixn(){  
    var ua = navigator.userAgent.toLowerCase();  

    if(ua.match(/MicroMessenger/i)=="micromessenger") {  
        return true;  
    } else {  
        return false;  
    }  
}          



function showWeiXinHint(){
    $("#weixin_hint").removeClass("f-dn");
}
function hideWeiXinHint(){
    $("#weixin_hint").addClass("f-dn");
}

function GetRequest() {
    var url = location.search; //获取url中"?"符后的字串
    var theRequest = new Object();
    if (url.indexOf("?") != -1) {
        var str = url.substr(1);
        strs = str.split("&");
        for(var i = 0; i < strs.length; i ++) {
            theRequest[strs[i].split("=")[0]]=unescape(strs[i].split("=")[1]);
        }
    }
    return theRequest;
}


function adaptive(){
    var w = $(window).width();
    $("body").css("font-size", 62.5 * w  / 320+"%");
}

// 禁止文版被拖动
document.body.style.userSelect = 'none';
document.body.style.mozUserSelect = 'none';
document.body.style.webkitUserSelect = 'none';

//禁止图片被选中
document.onselectstart = new Function('event.returnValue=false;');
//禁止图片被拖动
document.ondragstart = new Function('event.returnValue=false;');

$(window).on('touchmove.scroll', function (e) {e.preventDefault();});
$(window).on('scroll.scroll',function (e) {e.preventDefault();});




function loadimg(pics, progressCallBack, completeCallback) {
    $(".loading_page").find(".animated").removeClass("f-dn");
    var index = 0;
    var len = pics.length;
    var img = new Image();
    var load = function () {
        img.src = pics[index];
        img.onload = function () {
            // 控制台显示加载图片信息
            // console.log('第' + index + '个img被预加载', img.src);
            progressCallBack(Math.floor(((index + 1) / len) * 100) + "%");
            i = index;
            index++;

            if (index < len) {
                load();
            } else {
                completeCallback()
            }
        }
        return img;
    }
    if (len > 0) {
        load();
    } else {
        completeCallback();
    }
    return {
        pics:pics,
            load:load,
            progress:progressCallBack,
            complete:completeCallback
    };
}

//字体自适应
window.onresize=adaptive;

$(function(){
    /*
     * 图片预加载
     * pics 预加载图片的对象数组
     * progressCallBack 加载中回调函数
     * completeCallback 图片加载完成回调函数
     */
    $(".m-progress").removeClass("f-dn");

    var weixin = 0,
        usedNumber = 0,
        cardIndex = 0;
//点击发送手机号
var clicked = 0;
var pics = new Array();
//cookie中获取微信config需要的参数，后台给
var jsapiTicket = $.cookie("jsticket"),
    openid = $.cookie("openid"),
    shareid = openid + '_' + Date.now(),
    jsapiElements = jsapiTicket.split(","),
    jsapiAppId = jsapiElements[0],
    jsapiTimestamp = parseInt(jsapiElements[1]),
    jsapiNonceStr = jsapiElements[2],
    jsapiSignature = jsapiElements[3];



//自定义祝福语
var wishLine1 = "乍见之欢，久处不腻，";

var wishLine2 = "闺蜜大过天!"; 

//获取url中 shareid参数作为shareby
var Request = GetRequest(),
    sharedBy = Request['sharedby'],
    originShareId = Request['shareid'],
    weixin =  sharedBy ? 1 : 0;


$(document).find(".preload").each(function(e){
    if(this.src.indexOf("images")!=-1){
        pics.push(this.src+"?"+e);
    }
});

loadimg(pics,function(w){

    var len = pics.length;
    //console.log(w);
    var per = parseInt(w);
    //console.log(per);
    $(".loading_num").html(w);

},function(){
    $(".loading_num").html('100%');
    adaptive();
    $(".loading_page").remove();

    // weixin = 1;
    //微信config
    wx.config({
        debug: false, 
        appId: jsapiAppId, // 必填，公众号的唯一标识
        timestamp: jsapiTimestamp, // 必填，生成签名的时间戳
        nonceStr: jsapiNonceStr, // 必填，生成签名的随机串
        signature: jsapiSignature,// 必填，签名，见附录1
        jsApiList: ["onMenuShareTimeline","onMenuShareAppMessage","chooseImage","uploadImage","downloadImage"] // 必填，需要使用的JS接口列表
    });
    if(weixin === 1){
        $(".m-screen8").removeClass("f-dn");
        //获取原分享人贺卡和祝福
        $.ajax({
            url:'/originUser?shareid='+originShareId,
            type:'GET',
            dataType:'json',
            success:function(response){
                var shareTitle = response.title;
                var shareContent = response.content;
                var cardIndex = parseInt(response.value || 0);
                //TODO: 袁叶浩把分享后的导入页面内容加进来
                //alert(shareTitle + "  " + shareContent + "   " + cardIndex);
                document.getElementById("page8_line1").value = shareTitle;
                document.getElementById("page8_line2").value = shareContent;
                switch(cardIndex){
                    case 1:
                        $(".page8_card1").removeClass("f-dn");
                        break;
                    case 2:
                        $(".page8_card2").removeClass("f-dn");
                        break;
                    case 3:
                        $(".page8_card3").removeClass("f-dn");
                        break;
                    default:
                        break;    
                }

            }
        });
    }
    else{
        $(".m-screen1").removeClass("f-dn");
        $(".m-screen1").find(".animated").removeClass("f-ann");
    }
});

//微信分享朋友，分享朋友圈逻辑
function weixinShare(){
    var arrayIndex = cardIndex;
        
    
    //分享各个参数初始化
    var shareUrl = "http://" + window.location.host + "?sharedby=" + openid 
             + "&shareid=" + shareid + "&mobile=" + phone + "&utm_source=share&utm_medium=share&utm_campaign=38social",
    shareImg = "http://" + window.location.host + '/images/icon.jpg',
    random = Math.random();
    
    if(random<0.33){
        title ='什么鬼？没有闺蜜折扣怎么幸福过三八！';
    }else if (random>=0.33&&random<0.66) {
        title ='理想中的妇女节，就该这个样子！';
    }else if (random>=0.66) {
        title ='比男票壁咚还更让人小鹿乱撞的三八节！';
    };

    wx.onMenuShareAppMessage({
        title: title, // 分享标题
        desc: "致闺蜜，和你在一起", // 分享描述
        link: shareUrl, // 分享链接
        imgUrl: shareImg, // 分享图标
        success: function () { 
            //tracking
            //ga('send', 'event', 'CNY-friends', 'success', 'click');
            
            // 用户确认分享后执行的回调函数
            //分享成功后调用后台接口
            $.ajax({
                url: '/shareInfos',
                type: 'post',
                dataType: 'json',
                data: {
                    openid: openid,
                    shareid: shareid,
                    sharedby: sharedBy,
                    value: wishIndex,
                    title: wishLine1,
                    mobile: phone,
                    content:wishLine2
                    
                },
                success:function(responseObj){
                    alert(response.success);
                },
                error:  function(data){
                    alert("err" + data);
                    
                }
            }); 
        },
        cancel: function () { 
            // 用户取消分享后执行的回调函数
        }
    });
    //分享给朋友圈
    wx.onMenuShareTimeline({
        title: title, // 分享标题
        desc: "致闺蜜，和你在一起",
        link: shareUrl, // 分享链接
        imgUrl:shareImg, // 分享图标
        success: function () { 
            //tracking
            //ga('send', 'event', 'CNY-social', 'success', 'click');
            
            // 用户确认分享后执行的回调函数
            $.ajax({
                url: '/shareInfos',
                type: 'post',
                dataType: 'json',
                data: {
                    openid: openid,
                    shareid: shareid,
                    sharedby: sharedBy,
                    value: wishIndex,
                    title: wishLine1,
                    mobile: phone,
                    content:wishLine2
                },
                success: function(responseObj){
                    // alert(response.success);
                },
                error: function(data){
                    
                }
            });
        },
        cancel: function () { 
            // 用户取消分享后执行的回调函数
        }
    });
}


//微信接口初始化
 wx.ready(function(){
     weixinShare();
 });


var imgURL = "",
    userMobile = "",
    awardCode = "",
    deviceWidth = $(window).width(),
    deviceHeight = $(window).height();

var  infoMasked = !1;

//iphone4适应
if (IsIphone4()==true) {
    $(".campInfo_ip4").attr("src","images/pageInfo_ip4.jpg");
    $(".page_bg_ip4").attr("src","images/page_bg_ip4.jpg");
};



// 活动说明
$(".page_info").click(function(e){
    infoMasked = !0;
    $(".pageInfo").removeClass("f-dn");
    $(".pageInfo_back").removeClass("f-dn");
});


$(".pageInfo_back").click(function(e){

    if(infoMasked){
        infoMasked = !1;
        $(".pageInfo").addClass("f-dn");
        $(".pageInfo_back").addClass("f-dn");
    }
});

//进入插画页
$(".page1_btn").click(function(e){

    $(".m-screen1").addClass("animated fadeOut f-ad1");                
    $('.m-screen2').removeClass("f-dn");
    $(".m-screen2").addClass("animated fadeInScale f-ad5" );            
    $(".m-screen2").find(".animated").removeClass("f-ann")
});




//滑动漫画
var comicIndex=0,
    maxIndex=3,
    wishIndex=0,
    minDistance = 30;

var tsPoint = {
    x:0,
    y:0
}

var tePoint = {
    x:0,
    y:0
}

var swpieDistance = function(point1,point2){
    var distanceX = tePoint.x - tsPoint.x;
    var distanceY = tePoint.y - tsPoint.y;

    //console.log("distanceX:"+distanceX+",distanceY:"+distanceY);

}


var swipeEvent2 = function(e){
    // console.log(e)
    var type = e.type;
    var touch = e.touches[0];
    switch(type){
        case "touchstart":

            tsPoint.x = touch.pageX
                tsPoint.y = touch.pageY
                tePoint.x = touch.pageX
                tePoint.y = touch.pageY
                break;

        case "touchend":

            swipeDirection2(tsPoint,tePoint);
            swpieDistance(tsPoint,tePoint);
            break;
        case "touchmove":
            tePoint.x=touch.pageX
                tePoint.y=touch.pageY
                break;

    }


}


var comicSwiper = document.getElementById("comicSwiper");
comicSwiper.addEventListener("touchstart",swipeEvent2);
comicSwiper.addEventListener("touchmove",swipeEvent2);
comicSwiper.addEventListener("touchend",swipeEvent2);


var swipeDirection2 = function(tsPoint,tePoint){
    var distanceY = tsPoint.y - tePoint.y
        //wishIndex = wishIndex%maxIndex;
        console.log(comicIndex);
    if (distanceY > minDistance || distanceY < minDistance*(-1) ) {
        $(".page2_comic0").removeClass("animated fadeOutUp");
        $(".page2_comic0").removeClass("animated fadeInDown");
        $(".page2_comic1").removeClass("animated fadeInUp");
        $(".page2_comic1").removeClass("animated fadeOutUp");
        $(".page2_comic1").removeClass("animated fadeOutDown");
        $(".page2_comic1").removeClass("animated fadeInDown");
        $(".page2_comic2").removeClass("animated fadeInUp");
        $(".page2_comic2").removeClass("animated fadeOutDown");
    }


    if(distanceY > minDistance){
        console.log("往上滑");


        switch(comicIndex){
            case 0:    
                $(".page2_comic2").addClass("f-dn");
                $(".page2_comic0").addClass("animated fadeOutUp");
                $(".page2_comic1").removeClass("f-dn");
                $(".page2_comic1").addClass("animated fadeInUp");
                ga('send', 'event', '38social', 'swap1', 'click');
                comicIndex++;                               
                break;

            case 1:
                $(".page2_comic0").addClass("f-dn");
                $(".page2_comic1").addClass("animated fadeOutUp");
                $(".page2_comic2").removeClass("f-dn");
                $(".page2_comic2").addClass("animated fadeInUp");
                ga('send', 'event', '38social', 'swap2', 'click');
                comicIndex++;

                break;

            case 2:
                $(".page2_comic1").addClass("f-dn");
                $(".page2_comic2").addClass("animated fadeOutUp");
                $(".m-screen2").addClass("animated fadeOutUp1");               
                $(".m-screen3").removeClass("f-dn");
                $(".m-screen3").addClass("animated fadeInUp1 f-ad1");
                ga('send', 'event', '38social', 'swap3', 'click');

                break;

            default:
                comicIndex =0;
                break;


        }


    }else if (distanceY < minDistance*(-1)){
        console.log("往下滑");



        switch(comicIndex){
            case 0:
                $(".page2_comic1").addClass("f-dn");
                $(".page2_comic2").addClass("f-dn");
                break;

            case 1:
                $(".page2_comic2").addClass("f-dn");
                $(".page2_comic1").addClass("animated fadeOutDown");  
                $(".page2_comic0").removeClass("f-dn");
                $(".page2_comic0").addClass("animated fadeInDown");

                comicIndex--;
                break;

            case 2:
                $(".page2_comic0").addClass("f-dn");
                $(".page2_comic2").addClass("animated fadeOutDown");  
                $(".page2_comic1").removeClass("f-dn");
                $(".page2_comic1").addClass("animated fadeInDown");

                comicIndex--;
                break;

            default:

                comicIndex = 0;

                break;

        }


    }

}

var phone;

//抽取红包(验证手机号)
$(".page3_drawBtn").click(function(e){
    phone = $("#input_mobile").val();
    var phoneRex =  /^(13[0-9]{9})|(14[0-9]{9})|(15[0-9]{9})|(18[0-9]{9})|(17[0-9]{9})$/;
    // phone = 13800138000;
    if (phone=="" || phoneRex.test(phone)==false || phone.length>11){
        $(".wrongNumber").removeClass("f-dn");
        $(".wrongNumber_btn").removeClass("f-dn");
        //跳出确认手机号方法
        return;
    }
    else if(!clicked){
        clicked = 1;
        $.ajax({
           url: '/lottery',
           type: 'post',
           dataType: 'json',
           data: { 
               mobile: phone,
               openid:openid,
               shareid:shareid,
               sharedby:sharedBy
           }, 
           success: function(data){
                clicked = 0;
                console.dir(data);     
                if(data.success) 
                {
                    console.log("value: "+data.data.value + "code: "+data.data.code);
                    lotteryValue = 25;
                    $(".m-screen3").addClass("animated fadeOutUp1");
                    $(".m-screen4").removeClass("f-dn");
                    $(".m-screen4").addClass("animated fadeInUp1 f-ad1");
                }
                else{
                    $(".usedNumber").removeClass("f-dn");
                    $(".usedNumber_btn").removeClass("f-dn");
                }
            },
            error:function(data){
                clicked = 0;
            }
        });  

    }   
}); 

//抽取红包（微信页）
$(".page8_draw").click(function(){
    phone = $("#input_mobile2").val();
    var phoneRex =  /^(13[0-9]{9})|(14[0-9]{9})|(15[0-9]{9})|(18[0-9]{9})|(17[0-9]{9})$/;
    // phone = 13800138000;
    if (phone=="" || phoneRex.test(phone)==false || phone.length>11){
        $(".wrongNumber").removeClass("f-dn");
        $(".wrongNumber_btn").removeClass("f-dn");
        //跳出确认手机号方法
        return;
    }
    else if(!clicked){
        clicked = 1;
        $.ajax({
           url: '/lottery',
           type: 'post',
           dataType: 'json',
           data: { 
               mobile: phone,
               openid:openid,
               shareid:shareid,
               sharedby:sharedBy
           }, 
           success: function(data){
                clicked = 0;
                console.dir(data);     
                if(data.success) 
                {
                    console.log("value: "+data.data.value + "code: "+data.data.code);
                    lotteryValue = 25;
                    $(".m-screen8").addClass("animated fadeOutUp1");
                    $(".m-screen4").removeClass("f-dn");
                    $(".m-screen4").addClass("animated fadeInUp1 f-ad1");
                }
                else{
                    $(".usedNumber").removeClass("f-dn");
                    $(".usedNumber_btn").removeClass("f-dn");
                }
            },
            error:function(data){
                clicked = 0;
            }
        });  

    }  
  
});

//红包页
$(".page4_creat").click(function(){
    $(".m-screen4").addClass("animated fadeOutUp1");
    $(".m-screen5").removeClass("f-dn");
    $(".m-screen5").addClass("animated fadeInUp1 f-ad1");
})

//点击选择贺卡
$(".page5_arrowR").click(function(e){
    
    console.log("cardIndex:"+cardIndex);
    $(".page5_card1").removeClass("animated fadeOutRight1");
    $(".page5_card1").removeClass("animated fadeInLeft1");
    $(".page5_card2").removeClass("animated fadeOutRight1");
    $(".page5_card2").removeClass("animated fadeInLeft1");
    $(".page5_card3").removeClass("animated fadeOutRight1");
    $(".page5_card3").removeClass("animated fadeInLeft1");


    $(".page5_card1").removeClass("animated fadeOutLeft1");
    $(".page5_card1").removeClass("animated fadeInRight1");
    $(".page5_card2").removeClass("animated fadeOutLeft1");
    $(".page5_card2").removeClass("animated fadeInRight1");
    $(".page5_card3").removeClass("animated fadeOutLeft1");
    $(".page5_card3").removeClass("animated fadeInRight1");

    switch(cardIndex){
        case 0:    
            $(".page5_card1").addClass("animated fadeOutRight1");
            $(".page5_card1").removeClass("f-ad2");
            $(".page5_card2").removeClass("f-ann");
            $(".page5_card2").addClass("animated fadeInLeft1");
            $(".page5_card3").addClass("f-ann");
            cardIndex++;
            break;
        case 1:
            $(".page5_card2").addClass("animated fadeOutRight1");
            $(".page5_card3").removeClass("f-ann");
            $(".page5_card3").addClass("animated fadeInLeft1");
            $(".page5_card1").addClass("f-ann");
            cardIndex++;
            break;
        case 2:
            $(".page5_card3").addClass("animated fadeOutRight1");
            $(".page5_card1").removeClass("f-ann");
            $(".page5_card1").addClass("animated fadeInLeft1");
            $(".page5_card2").addClass("f-ann");
            cardIndex++;
            break;
        default:
            cardIndex =0;
            break;
    }

    if(cardIndex<0){
        cardIndex = cardIndex+3;
    }
    cardIndex = cardIndex%3;
    wishIndex = cardIndex+1;
    wishLine1=$("#card"+wishIndex+"_line1").val();
    wishLine2=$("#card"+wishIndex+"_line2").val();
    weixinShare();//重新初始化分享接口，动态改变分享描述
});

$(".page5_arrowL").click(function(e){
    
    console.log("cardIndex:"+cardIndex);
    $(".page5_card1").removeClass("animated fadeOutRight1");
    $(".page5_card1").removeClass("animated fadeInLeft1");
    $(".page5_card2").removeClass("animated fadeOutRight1");
    $(".page5_card2").removeClass("animated fadeInLeft1");
    $(".page5_card3").removeClass("animated fadeOutRight1");
    $(".page5_card3").removeClass("animated fadeInLeft1");


    $(".page5_card1").removeClass("animated fadeOutLeft1");
    $(".page5_card1").removeClass("animated fadeInRight1");
    $(".page5_card2").removeClass("animated fadeOutLeft1");
    $(".page5_card2").removeClass("animated fadeInRight1");
    $(".page5_card3").removeClass("animated fadeOutLeft1");
    $(".page5_card3").removeClass("animated fadeInRight1");

    switch(cardIndex){
        case 0:    

            $(".page5_card1").addClass("animated fadeOutLeft1");
            $(".page5_card1").removeClass("f-ad2");

            $(".page5_card3").removeClass("f-ann");
            $(".page5_card3").addClass("animated fadeInRight1");
            $(".page5_card2").addClass("f-ann");


            cardIndex--;


            break;

        case 1:

            $(".page5_card2").addClass("animated fadeOutLeft1");

            $(".page5_card1").removeClass("f-ann");
            $(".page5_card1").addClass("animated fadeInRight1");
            $(".page5_card3").addClass("f-ann");

            cardIndex--;

            break;

        case 2:

            $(".page5_card3").addClass("animated fadeOutLeft1");

            $(".page5_card2").removeClass("f-ann");
            $(".page5_card2").addClass("animated fadeInRight1");
            $(".page5_card1").addClass("f-ann");




            cardIndex--;
            break;

        default:

            cardIndex =0;
            break;


    }
    if(cardIndex<0){
        cardIndex = cardIndex+3;
    }
    cardIndex = cardIndex%3;
    wishIndex = cardIndex+1;
    wishLine1=$("#card"+wishIndex+"_line1").val();
    wishLine2=$("#card"+wishIndex+"_line2").val();
    weixinShare();//重新初始化分享接口，动态改变分享描述
});


$(".page3_gesture").click(function(){
    $(".pageBag").removeClass("f-dn");
    $(".pageBag_btn").removeClass("f-dn");
});

// 分享图层
$(".page5_share").click(function(){
    $(".share-screen").removeClass("f-dn");
    wishLine1=$("#card"+wishIndex+"_line1").val();
    wishLine2=$("#card"+wishIndex+"_line2").val();
    weixinShare();//重新初始化分享接口，动态改变分享描述
});

$(".sharePage").click(function(){
    $(".share-screen").addClass("f-dn");
});


//神秘大奖浮层
$(".page3_secret").click(function(){
    $(".pageBag").removeClass("f-dn");
    $(".pageBag_btn").removeClass("f-dn");
});

$(".pageBag_btn").click(function(){
    $(".pageBag").addClass("f-dn");
    $(".pageBag_btn").addClass("f-dn");
});

// 手机号码输错确认
$(".wrongNumber_btn").click(function(){
    $(".wrongNumber").addClass("f-dn");
    $(".wrongNumber_btn").addClass("f-dn");
})

// 手机号码重复确认
$(".usedNumber_btn").click(function(){
    $(".usedNumber").addClass("f-dn");
    $(".usedNumber_btn").addClass("f-dn");
})

/* 手机号验证框 */

$(".m-screen3").find(".page3_phoneNumber").on('blur', 'input', function(){
    if($(this).attr('id') === 'input_mobile' ){
        if($.trim($(this).val()) === ''){
            $(this).val('请输入手机号');

        }
    }
}).on('focus', 'input', function(){
    if($(this).attr('id') === 'input_mobile' ){
        if($.trim($(this).val()) === '请输入手机号'){
            $(this).val('');
        }
    } 
});

$(".m-screen8").find(".page8_input").on('blur', 'input', function(){
    if($(this).attr('id') === 'input_mobile2' ){
        if($.trim($(this).val()) === ''){
            $(this).val('请输入手机号');

        }
    }
}).on('focus', 'input', function(){
    if($(this).attr('id') === 'input_mobile2' ){
        if($.trim($(this).val()) === '请输入手机号'){
            $(this).val('');
        }
    } 
});


//显示waiting
function showWaiting(){
    var shield = $("#waiting_shield");
    shield.css("top",$(document).scrollTop());
    shield.show();
    document.documentElement.style.overflow='hidden';
}

function hideWaiting(){
    $("#waiting_shield").hide();
    document.documentElement.style.overflow='auto';
}
showWaiting();

// trackingCode    
    $(".track_data").click(function(){
        var track = $(this).attr("track");
        var data = $(this).attr("track-data");
        ga('send','event','38social',track,data);
    })
});



