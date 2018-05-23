(function () {
    'use strict';

    angular
        .module('vk')
        .controller('HeyTeaRegisterController', HeyTeaRegisterController);

    /** @ngInject */
    HeyTeaRegisterController.$inject = ['$interval', '$timeout', '$location', 'RegisterService', 'UtilService','$sessionStorage','LoginService','SessionStorageService'];

    function HeyTeaRegisterController($interval, $timeout, $location, RegisterService, UtilService,$sessionStorage,LoginService,SessionStorageService) {
        var waitSec = 60;
        var ischange = false;
        var vCodeWait = waitSec;
        var storeId = $sessionStorage.storeId;
        var openId = $sessionStorage.weChatOpenId;
        var vm = this;
         vm.list = [3,4];
        vm.msg = {
            warning: false,
            message: ''
        };
        vm.vcodeTitle = "获取验证码";
        vm.checked = true;
        vm.getVcode = getVcode;
        vm.submit = submit;
        vm.goBack = goBack;
        vm.onPwdChange=onPwdChange;
        vm.doLogin=doLogin;
        vm.sexClick=sexClick;
        vm.goBuy = goBuy;
        vm.changeSel = changeSel;
        // vm.changedate = changedate;
        vm.vcardNum = $sessionStorage.dengLuID || "" ;
        vm.vpwd = $sessionStorage.pwd || "";

        // $("#USER_AGE").val(new Date("1990-01-01T00:00:00.000Z")) ;

        // function changedate() {
        //
        //     if (!ischange){
        //         alert("生日信息一经设置无法修改，请谨慎选择！")
        //         ischange = true
        //     }
        // }


        function sexClick () {
//             document.getElementById("sex").style.display="block";
// //				$(".register-dialog-date").fadeIn();
// //             $(this).find(".input-fix span").removeClass("c-a0a0a0");
        }


        document.getElementById("sexChange").addEventListener("click",function(event){
                        document.getElementById("sex").style.display="block";;
        },false);
        document.getElementById("sex-close").addEventListener("click",function(event){
            document.getElementById("sex").style.display="none";;
    },false);
        document.getElementById("girl").addEventListener("click",function(event){
           vm.gender = "1";
            document.getElementById("sex-input").innerHTML="女";
            document.getElementById("sex").style.display="none";;
        },false);
        document.getElementById("boy").addEventListener("click",function(event){
            vm.gender = "0";
            document.getElementById("sex-input").innerHTML="男";
            document.getElementById("sex").style.display="none";;
        },false);
//         $(".sex-box").click(function(){
//             document.getElementById("sex").style.display="block";
//         });
        function goBack() {
            $location.url('/loginByVKApiHeyTea?storeId=' + storeId+'&theme=heytea');
        }
        function onPwdChange(item) {
            if (isNaN(item)) {
                vm.vpwd = item.substring(0, item.length - 1);
                return
            }
            if (item.length > 6) {
                vm.vpwd = item.substring(0, item.length - 1);
                vm.msg.warning = true;
                vm.msg.message = '密码只能为6位数字';
                $timeout(function () {
                    vm.msg.warning = false;
                    vm.msg.message = '';
                }, 2000);
                return
            }
            console.log(item)
        }
        function countDown() {
            var timePromise = $interval(function () {
                if (vCodeWait <= 0) {
                    $interval.cancel(timePromise);
                    timePromise = undefined;
                    vCodeWait = waitSec;
                    vm.vcodeTitle = "重新发送";
                    vm.vcodeCss = "";
                } else {
                    vm.vcodeTitle = "重发(" + vCodeWait + ")";
                    vCodeWait--;
                    vm.vcodeCss = "heycha_greyout";
                }
            }, 1000, 100);

        }
        function doLogin(card, pwd, redirect) {
            var params = {mobile: card, password: pwd, openId: openId};
            LoginService.loginHeyteaByVKApi(storeId, params).then(function (data) {
                if (data.code != 200) {
                    if (data.code = 1351) {
                        $location.url('/heytea-register?storeId=' + storeId);

                    }
                    if (redirect) {
                        $location.url(redirect + '?storeId=' + storeId + "&message=" + data.message);
                        return
                    }
                    vm.msg.warning = true;
                    vm.msg.message = data.message;
                    $timeout(function () {
                        vm.msg.warning = false;
                        vm.msg.message = '';
                    }, 2000);
                    return;
                }

                var timestamp = formatDateTime(data.data.activated);
                SessionStorageService.setOneSessionStorage("activated", timestamp);
                SessionStorageService.setOneSessionStorage("cardId", data.cardId);
                SessionStorageService.setOneSessionStorage("token", data.token);
                SessionStorageService.setOneSessionStorage("levelName", data.data.levelName);
                SessionStorageService.setAllSessionStorage(data.data, function (res) {
                    $sessionStorage.memberName = $sessionStorage.name;
                    $sessionStorage.activated = timestamp;
                });

                var url = $sessionStorage.redirectUrl;
                if (url != "/heytea-myPayCode" && url != "/heytea-pointShop") {
                    url = "";
                }
                if (url) {
                    $location.url(url + '?storeId=' + storeId);
                } else {
                    $sessionStorage.showSplash = true;
                    $sessionStorage.showagreeMent = true;
                    $location.url('/heytea-my?storeId=' + storeId);
                }

            }, function (e) {
                // vm.msg.warning = true;
                // vm.msg.message = '账号/密码输入错误';
                // $timeout(function () {
                //     vm.msg.warning = false;
                //     vm.msg.message = '';
                // }, 2000);
            });
        }

        function goBuy() {
            $location.url('/heytea-buy?storeId=' + storeId+ "&remark=" + "heytea-register");
        }
        function formatDateTime(inputTime) {


            var date = new Date(inputTime);
            var y = date.getFullYear();
            var m = date.getMonth() + 1;
            m = m < 10 ? ('0' + m) : m;
            var d = date.getDate();
            d = d < 10 ? ('0' + d) : d;
            var h = date.getHours();
            h = h < 10 ? ('0' + h) : h;
            var minute = date.getMinutes();
            var second = date.getSeconds();
            minute = minute < 10 ? ('0' + minute) : minute;
            second = second < 10 ? ('0' + second) : second;
            return y + '-' + m + '-' + d+' '+h+':'+minute+':'+second;
        };
        function getVcode() {
            if(!vm.mobile){
                return
            }
            if (vm.mobile.length != 11) {
                vm.msg.warning = true;
                vm.msg.message = "手机号码有误";
                $timeout(function () {
                    vm.msg.warning = false;
                    vm.msg.message = '';
                }, 2000);
                return;
            }

            if (vCodeWait < waitSec) {
                return
            }

            RegisterService.getVcode(storeId, vm.mobile).then(function (data) {
                if (data.code != 200) {
                    vm.msg.warning = true;
                    vm.msg.message = data.message;
                    $timeout(function () {
                        vm.msg.warning = false;
                        vm.msg.message = '';
                    }, 2000);
                    return;
                }
                countDown();

            }, function (e) {
                alert(e.message);
            });
        }

        function submit() {
            vm.birthday =  $("#USER_AGE").val();
            if (!vm.mobile || !vm.vcode || !vm.birthday || !vm.name || !vm.gender || !vm.vcardNum ||!vm.vpwd) {
                vm.msg.warning = true;
                vm.msg.message = '请填写所有星号项';
                $timeout(function () {
                    vm.msg.warning = false;
                    vm.msg.message = '';
                }, 2000);
                return
            }
            if (vm.vpwd.length != 6) {
                vm.msg.warning = true;
                vm.msg.message = '密码只能为6位数字';
                $timeout(function () {
                    vm.msg.warning = false;
                    vm.msg.message = '';
                }, 2000);
                return
            }
            if (!vm.checked) {
                vm.msg.warning = true;
                vm.msg.message = '您还未同意相关条款';
                $timeout(function () {
                    vm.msg.warning = false;
                    vm.msg.message = '';
                }, 2000);
                return
            }
            // var birthStr = vm.birthday.toLocaleDateString();
            // var birArr = birthStr.split("/");
            // var year = birArr[0];
            // var month = birArr[1];
            // var  day = birArr[2];
            //
            // if (month < 10){
            //     month = "0" + month;
            //
            // }
            // if (day < 10){
            //     day = "0" + day;
            // }

            // var y = vm.birthday.getFullYear();
            // var m = vm.birthday.getMonth() + 1;
            // m = m < 10 ? '0' + m : m;
            // var d = vm.birthday.getDate();
            // d = d < 10 ? ('0' + d) : d;
            // // vm.birthday = [y, m, d].join("-");
            // var  bir = [y, m, d].join("-");
            var pra = {
                "mobile":vm.mobile,
                "vcode":vm.vcode,
                "birthday":vm.birthday,
                "name":vm.name,
                "gender":vm.gender,
                "vcardNum":vm.vcardNum,
                "vpwd":vm.vpwd,


            }
            RegisterService.register(storeId, pra).then(function (data) {
                if (data.code != 200) {
                    vm.msg.warning = true;
                    vm.msg.message = data.message;
                    $timeout(function () {
                        vm.msg.warning = false;
                        vm.msg.message = '';
                    }, 2000);
                    return;
                }
                doLogin(vm.vcardNum, vm.vpwd);
                // UtilService.showToast(vm, "激活成功", function () {
                //
                //
                //
                //
                //
                //         $location.url('/loginByVKApiHeyTea?storeId=' + storeId);
                //     }
                // );
            }, function (e) {
                alert(e.message);
            });

            // $location.url('/heytea-registerWithPwd?storeId=' + storeId
            //     + '&mobile=' + vm.mobile
            //     + '&vcode=' + vm.vcode
            //     + '&birthday=' + vm.birthday.toLocaleDateString().replace(/\//g, "-")
            //     + '&gender=' + vm.gender
            //     + '&name=' + vm.name
            // );
        }

      function changeSel(){

      }
        $(function () {
            var currYear = (new Date()).getFullYear();
            var opt={};
            opt.date = {preset : 'date'};
            opt.datetime = {preset : 'datetime'};
            opt.time = {preset : 'time'};
            opt.default = {
                theme: 'android-ics light', //皮肤样式
                display: 'modal', //显示方式
                mode: 'scroller', //日期选择模式
                dateFormat: 'yyyy-mm-dd',
                lang: 'zh',
                showNow: false,
                nowText: "今天",
                multiSelect: true,
                startYear: currYear - 50, //开始年份
                endYear: currYear + 1, //结束年份
                // date:new Date('1995','01','01')
            };

            $("#USER_AGE").mobiscroll($.extend(opt['date'], opt['default']));

        });


        $("#USER_AGE").change(function(){
            if (!ischange){
                alert("生日信息一经设置无法修改，请谨慎选择！")
                ischange = true
            }
        });

    }
})();


