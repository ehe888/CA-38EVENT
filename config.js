/**
    Configuration module 
*/
module.exports = function(){
    switch(process.env.NODE_ENV){
        case 'development':
            return {
                jsTicketHost: 'localhost',
                dbConStr: "postgres://pguser:001@Helei@121.40.123.135/test_mkgm_ca_camp2"
            };
            
        case 'testing':
            return {
                dbConStr: "postgres://pguser:001@Helei@121.40.123.135/test_mkgm_ca_camp2"
            };
            
        case 'staging':
            return {
                
            };
            
        case 'production':
            return {
                debug: false,
                jsTicketHost: '10.171.254.62',
                wxAppId: 'wx891111d0998d92f5',
                wxAppSecret: '00033763ef83d362d3e00a14f576b963',
                smsGateway: 'http://www.canda.cn/campaign/mobile/register/',
                smsAppSecret: 'xx4RjNXUZAEgFzZVuwnoWCvM',
                dbConStr: "postgres://pguser:001@Helei@10.171.254.62/mkgm_ca_camp2"
            };
        default:
            return {
                debug: true,
                jsTicketHost: 'localhost',
                wxAppId: 'wx891111d0998d92f5',
                wxAppSecret: '00033763ef83d362d3e00a14f576b963',
                smsGateway: 'http://www.canda.cn/campaign/mobile/register/',
                smsAppSecret: 'xx4RjNXUZAEgFzZVuwnoWCvM',
                dbConStr: "postgres://pguser:001@Helei@121.40.123.135/test_mkgm_ca_camp2"
            };
    }
};