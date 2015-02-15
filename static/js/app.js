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
    // var jsapiTicket = $.cookie("jsticket"),
    //     openid = $.cookie("openid"),
    //     shareid = openid + '_' + Date.now(),
    //     jsapiElements = jsapiTicket.split(","),
    //     jsapiAppId = jsapiElements[0],
    //     jsapiTimestamp = parseInt(jsapiElements[1]),
    //     jsapiNonceStr = jsapiElements[2],
    //     jsapiSignature = jsapiElements[3];
    
    

     //自定义祝福语
    var wishLine1 = ["乍见之欢，久处不腻，","匆匆那些年，有笑也有泪，","我的世界，",""];

    var wishLine2 = ["闺蜜大过天!","我们永远不说再见~","因你而暖暖~",""]; 

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
        
        
        //微信config
        // wx.config({
        //     debug: false, // 开启调试模式,调用的所有api的返回值会在客户端alert出来，若要查看传入的参数，可以在pc端打开，参数信息会通过log打出，仅在pc端时才会打印。
        //     appId: jsapiAppId, // 必填，公众号的唯一标识
        //     timestamp: jsapiTimestamp, // 必填，生成签名的时间戳
        //     nonceStr: jsapiNonceStr, // 必填，生成签名的随机串
        //     signature: jsapiSignature,// 必填，签名，见附录1
        //     jsApiList: ["onMenuShareTimeline","onMenuShareAppMessage","chooseImage","uploadImage","downloadImage"] // 必填，需要使用的JS接口列表，所有JS接口列表见附录2
        // });
        if(weixin === 1){
            $(".m-screen8").removeClass("f-dn");
            //获取原分享人贺卡和祝福
            // $.ajax({
            //     url:'/originUser?shareid='+originShareId,
            //     type:'GET',
            //     dataType:'json',
            //     success:function(response){
            //         var shareTitle = response.title;
            //         var shareContent = response.content;
            //         myShareValue = parseInt(response.value || 0);
            //         myTotalShareValue = 200 - myShareValue;

            //         $(".page0_cash").html(myTotalShareValue);
            //         if(shareTitle.length === 0){
            //             $(".page0_wishCus").removeClass("f-dn");
            //             $("#page0_wishC").html(shareContent);
            //         }  
            //         else{
            //             $(".page0_wishText").removeClass("f-dn");
            //             $("#page0_wishTitle").html(shareTitle);
            //             $("#page0_wish").html(shareContent);
            //         }
            //         $(".profile0_image").attr("src",response.headimgurl);
            //         $(".page0_shareId").html(response.nickname);
                    

                    
                    
            //     }
            // });
           
            //TODO: 通过Ajax调用 /users,
           
        }
        else{
             $(".m-screen1").removeClass("f-dn");
             $(".m-screen1").find(".animated").removeClass("f-ann");
        }

    });
    
    
    
    //分享各个参数初始化
    // var shareUrl = "http://" + window.location.host + "?sharedby=" + openid 
    //             + "&shareid=" + shareid + "&utm_source=share&utm_medium=share&utm_campaign=CNYsocial",
    var shareImg = "http://" + window.location.host + '/images/logo.png',
        random = Math.random(),
        title = random<0.5?'这个三八节怎么过最幸胡？和闺蜜来C&A让扮靓～':'妇女节我最大！邀闺蜜齐享C&A三八壕气折扣～';
    

    //微信分享朋友，分享朋友圈逻辑
    function weixinShare(){
        var arrayIndex = cardIndex;
        
    }


    //微信接口初始化
    // wx.ready(function(){
        
    //     // var arrayIndex = ;
    //     // var shareData = {
    //     //             openid:openid,
    //     //             shareid:shareid,
    //     //             title:wishTitleContent[wishIndex<=-100?3:wishIndex],
    //     //             content:wishContent[wishIndex<=-100?3:wishIndex]
    //     //         };
    //     weixinShare();

    // });


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
         $(".m-screen2").removeClass("animated fadeOutDown1");
         $(".m-screen1").addClass("animated fadeOutUp1");
         $('.m-screen2').removeClass("f-dn");
         $(".m-screen2").addClass("animated fadeInUp1");            
         $(".m-screen2").find(".animated").removeClass("f-ann")
    });

    $(".page2_back").click(function(e){
        $(".m-screen1").removeClass("animated fadeOutUp1");
        $(".m-screen2").addClass("animated fadeOutDown1");
        $(".m-screen1").addClass("animated fadeInDown1");
    });
   

    //滑动漫画
        var comicIndex=0,
        maxIndex=3,
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
         
   

        if(comicIndex<0){
                wishIndex = wishIndex+maxIndex;
        }

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
            $(".page2_comic").removeClass("animated fadeOutUp");
            $(".page2_comic").removeClass("animated fadeInDown");
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
                    $(".page2_comic").addClass("animated fadeOutUp");
                    $(".page2_comic1").removeClass("f-dn");
                    $(".page2_comic1").addClass("animated fadeInUp");
                    
                    comicIndex++;                               
                    break;

                case 1:
                    $(".page2_comic").addClass("f-dn");
                    $(".page2_comic1").addClass("animated fadeOutUp");
                    $(".page2_comic2").removeClass("f-dn");
                    $(".page2_comic2").addClass("animated fadeInUp");
                    
                    comicIndex++;
                    
                    break;

                case 2:
                    $(".page2_comic1").addClass("f-dn");
                    $(".page2_comic2").addClass("animated fadeOutUp");
                    $(".m-screen2").addClass("animated fadeOutUp1");               
                    $(".m-screen3").removeClass("f-dn");
                    $(".m-screen3").addClass("animated fadeInUp1");
                   
                    break;

                default:
                    comicIndex =0;
                    break;


            }

  
        }else if (distanceY < minDistance*(-1)){
            console.log("往下滑");

            

            switch(comicIndex){
                case 0:
                    break;

                case 1:
                    $(".page2_comic2").addClass("f-dn");
                    $(".page2_comic1").addClass("animated fadeOutDown");  
                    $(".page2_comic").removeClass("f-dn");
                    $(".page2_comic").addClass("animated fadeInDown");

                    comicIndex--;
                    break;

                case 2:
                    $(".page2_comic").addClass("f-dn");
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

    //抽取红包(验证手机号)
    $(".page3_drawBtn").click(function(e){
        var phone = $("#input_mobile").val();
       
        var phoneRex =  /^(13[0-9]{9})|(14[0-9]{9})|(15[0-9]{9})|(18[0-9]{9})|(17[0-9]{9})$/;
        phone = 13800138000;
            if (phone=="" || phoneRex.test(phone)==false || phone.length>11){
                        alert("您输入的手机号有误")
                        //跳出确认手机号方法
                        return;
            }
            else if(!clicked){
                clicked = 1;
                // $.ajax({

                // url: '/lottery',
                // type: 'post',
                // dataType: 'json',
                // data: { 
                //     mobile: phone,
                //     openid:openid,
                //     shareid:shareid,
                //     sharedby:sharedBy
                // }, 

                //     if(data.success) 
                //     {


                //         console.log("value: "+data.data.value + "code: "+data.data.code);
                //         lotteryValue = parseInt(data.data.value);
                //         if (lotteryValue == 888) 
                //         {
                //             firstPrize = 1;
                //             lotteryValue = 200;
                //         }
                //         else{
                //             firstPrize = 0;
                //             $(".page3_cash1").html(lotteryValue);
                //             $(".page3_cash2").html(200-lotteryValue);
                //             $(".page5_cash").html(lotteryValue);
                //         }
                    
        
                //         $('.m-screen1').addClass("animated fadeOutUp1");

                //         if(firstPrize==0){

                //             $('.draw-screen1').removeClass("f-dn");
                //             $('.draw-screen1').addClass("animated f-ad1 fadeInUp1")
                //             $(".draw-screen1").find(".animated").removeClass("f-ann")

                //         }
                //         else{
                //             $('.draw-screen2').removeClass("f-dn"); 
                //             $('.draw-screen2').addClass("animated f-ad1 fadeInUp1")
                //             $(".draw-screen2").find(".animated").removeClass("f-ann")
                //         }                                                        
                        
                //     }
                //     else{
                //         if (data.errorCode === 'PHONE_USED') 
                //         {
                //             $('.usedNumber').removeClass("f-dn");
                //             $('.usedBtn').removeClass("f-dn");

                //             clicked = 0;

                //         }
                //         else if (data.errorCode === 'OVER') 
                //         {
                //             //活动结束
                //             $('.lateInfo').removeClass("f-dn");
                //             $('.lateBtn').removeClass("f-dn");
                //             clicked = 0;
                //         }else{
                //             clicked = 0;    
                //         };
                //     }
                // },
                // error:function(data){
                //     clicked = 0;
                // }
                // });  
                $(".m-screen3").addClass("animated fadeOutUp1");
                $(".m-screen4").removeClass("f-dn");
                $(".m-screen4").addClass("animated fadeInUp1");
            }
    }); 
  
    $(".page8_draw").click(function(){
        $(".m-screen8").addClass("animated fadeOutUp1");
        $(".m-screen4").removeClass("f-dn");
        $(".m-screen4").addClass("animated fadeInUp1");
    });

    $(".page4_creat").click(function(){
        $(".m-screen4").addClass("animated fadeOutUp1");
        $(".m-screen5").removeClass("f-dn");
        $(".m-screen5").addClass("animated fadeInUp1");
    })

    //点击选择贺卡
    $(".page5_arrowR").click(function(e){
        cardIndex = cardIndex%3;
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
            weixinShare();//重新初始化分享接口，动态改变分享描述
    });

    $(".page5_arrowL").click(function(e){
        cardIndex = cardIndex%3;
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
            weixinShare();//重新初始化分享接口，动态改变分享描述
    });

    // 编辑自定义文字
    $(".page5_cus").click(function(){
        alert("点击文本自定义祝福");
        switch(cardIndex){
                case 0:    
                    document.getElementById("card1_line1").readOnly=false;
                    document.getElementById("card1_line2").readOnly=false;                                               
                    break;

                case 1:
                    document.getElementById("card2_line1").readOnly=false;
                    document.getElementById("card2_line2").readOnly=false;   
                   
                    break;

                case 2:
                    document.getElementById("card3_line1").readOnly=false;
                    document.getElementById("card3_line2").readOnly=false;  
                  
                    break;

                default:
                    
                    cardIndex =0;
                    break;
        }   
        
    });


    // 分享图层
    $(".page5_share").click(function(){
        $(".share-screen").removeClass("f-dn");
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
   


    /* 手机号验证框 */
    
     $(".m-screen3").find(".page3_phoneNumber").on('blur', 'input', function(){
            if($(this).attr('id') === 'input-mobile' ){
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
            if($(this).attr('id') === 'input-mobile2' ){
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
//     $(".track_data").click(function(){
//         var track = $(this).attr("track");
//         var data = $(this).attr("track-data");
//         ga('send','event','CNY-social',track,data);
//     })
});
    

    
