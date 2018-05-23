(function () {
    'use strict';

    angular
        .module('vk')
        .controller('RegisterController', RegisterController);

    /** @ngInject */
    RegisterController.$inject = ['$interval', '$timeout', '$location', 'RegisterService', '$sessionStorage','SessionStorageService',"$window","$scope",'LoginService'];

    function RegisterController($interval, $timeout, $location, RegisterService, $sessionStorage,SessionStorageService,$window,$scope,LoginService) {
        var waitSec = 60;
        var send = "false";

        var ischange = false;
        var  csessionid;
        var  sig;
        var tokenStr;
        var scene;
        var vCodeWait = waitSec;
        var urlParam = $location.search();
        var token = $sessionStorage.token;
        var storeId = urlParam.storeId || $sessionStorage.storeId;
        var openId = $sessionStorage.weChatOpenId;
        var vm = this;
        var amountConfigId='';
        var amount = 0;
        vm.showAmount = false;
        vm.showdom = false;
        vm.agreement = agreement;
        // vm.list = [{id:1},{id:2}];
        vm.msg = {
            warning: false,
            message: ''
        };
        vm.vcodeTitle = "获取验证码";
        vm.checked = true;
        vm.getVcode = getVcode;
        vm.submit = submit;
        vm.goBack = goBack;
        vm.goBuy = goBuy;
        vm.changeSel = changeSel;
        vm.gochange = gochange;
        vm.isWeChat = 1;
        // vm.changedate = changedate;
        // vm.birthday="1956-01-01"
        ali()
        initOne()

        first();
        function first() {
            LoginService.getStoreConfig( storeId).then(function (data) {
                if (data.code != 200) {
                    alert(data.message);
                    return
                }
                //showRes

                var REGISTER_SIMPLE = data.data.REGISTER_SIMPLE;
                if (REGISTER_SIMPLE == 1 ) {
                 //获取微信
                    vm.isWeChat = 0;
                    LoginService.getInfo( token,openId).then(function (data) {
                        if (data.code != 200) {
                            alert(data.errmsg);
                            return
                        }
                        vm.name = data.nickname;
                        // vm.
                        vm.gender = data.sex;


                    }, function (e) {
                        //error msg
                    });
                }else {

                }


            }, function (e) {
                //error msg
            });
        }




        $("#USER_AGE").change(function(){
            // console.log(document.getElementById("USER_AGE"))
            if (!ischange){
                alert("生日信息一经设置无法修改，请谨慎选择！")
                ischange = true
            }
        });

        function gochange() {
            document.getElementById("sex").style.display="block";;
        }
        function initOne() {



            RegisterService.amountConfigs(storeId).then(function (data) {
                if (data.code != 200) {

                    vm.msg.warning = true;
                    vm.msg.message = data.message;
                    $timeout(function () {
                        vm.msg.warning = false;
                        vm.msg.message = '';
                    }, 2000);
                    $timeout(function () {
                        $scope.reloadRoute();
                    }, 3000);
                    document.getElementById("sex").style.display="none";;
                    return;
                }
                if (data.data.length >0) {
                    document.getElementById("sex").style.display="block";;
                    vm.showAmount = true

                }
                for (var i = 0; i <data.data.length; i++){
                    if (i==0){
                        data.data[i].show = 1;
                        amountConfigId =  data.data[i].id;
                        amount = data.data[i].amount;
                        vm.amountName = data.data[i].title;
                    } else {
                        data.data[i].show = 0;
                    }

                }
                vm.amountList = data.data;

            }, function (e) {
                alert(e.message);
            });
        }

        function changeSel(li) {
            amountConfigId = li.id;
            amount = li.amount;
            vm.amountName = li.title;
            for ( var i = 0; i <vm.amountList.length;i++){
                if (vm.amountList[i].id == li.id){
                    vm.amountList[i].show = 1;

                }else {
                    vm.amountList[i].show = 0;
                }
            }
        }


        // alert("生日信息一经设置无法修改，请谨慎选择！");
        function goBack() {
            $location.url('/loginByVKApi?storeId=' + storeId);
        }
        function goBuy() {
            $location.url('/agreement?storeId=' + storeId+"&type="+"register");
        }
        if (!openId && angular.isUndefined($sessionStorage.debug) && !window.isDebug) {
            //console.log("没有openId,请通过微信重新登录");
            SessionStorageService.setOneSessionStorage("redirectUrl", $location.path());
            $location.url('/loginByWeChat?storeId=' + storeId);
            return;
        }
        setTimeout(function () {
            // alert("生日信息一经设置无法修改，请谨慎选择！")
        }, 1000);

        function countDown() {
            var timePromise = $interval(function () {
                if (vCodeWait <= 0) {
                    $interval.cancel(timePromise);
                    timePromise = undefined;
                    vCodeWait = waitSec;
                    vm.vcodeTitle = "重新发送";
                    vm.vcodeCss = "";
                    send = "false";
                } else {
                    vm.vcodeTitle = "重发(" + vCodeWait + ")";
                    vCodeWait--;
                    vm.vcodeCss = "my_greyout";
                }
            }, 1000, 100);

        }

        function getVcode() {
            if (!vm.mobile) {
                vm.msg.warning = true;
                vm.msg.message = "请输入手机号";
                $timeout(function () {
                    vm.msg.warning = false;
                    vm.msg.message = '';
                }, 2000);
                return;
            }
            if (send == "false"){
                document.getElementById("star-dialog").style.display="block";;
                return
            }
            if (vCodeWait < waitSec) {
                return
            }

            RegisterService.getVcode(storeId, vm.mobile,csessionid,sig,tokenStr,scene).then(function (data) {
                if (data.code != 200) {

                    vm.msg.warning = true;
                    vm.msg.message = data.message;
                    $timeout(function () {
                        vm.msg.warning = false;
                        vm.msg.message = '';
                    }, 2000);

                    $timeout(function () {
                        // $scope.reloadRoute();
                    }, 3000);

                    return;
                }

                countDown();
            }, function (e) {
                alert(e.message);
            });
        }

        function submit() {
            vm.birthday =  $("#USER_AGE").val();
            if (vm.isWeChat == 1) {
                if (!vm.mobile || !vm.vcode || !vm.birthday || !vm.gender || !vm.name) {
                    vm.msg.warning = true;
                    vm.msg.message = '请填写所有星号项';
                    $timeout(function () {
                        vm.msg.warning = false;
                        vm.msg.message = '';
                    }, 2000);
                    return
                }
            }else {
                if (!vm.mobile || !vm.vcode ) {
                    vm.msg.warning = true;
                    vm.msg.message = '请填写所有星号项';
                    $timeout(function () {
                        vm.msg.warning = false;
                        vm.msg.message = '';
                    }, 2000);
                    return
                }
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




            // var y = vm.birthday.getFullYear();
            // var m = vm.birthday.getMonth() + 1;
            // m = m < 10 ? '0' + m : m;
            // var d = vm.birthday.getDate();
            // d = d < 10 ? ('0' + d) : d;

            // if (month < 10){
            //     month = "0" + month;
            //
            // }
            // if (day < 10){
            //     day = "0" + day;
            // }
            $location.url('/registerWithPwd?storeId=' + storeId
                + '&mobile=' + vm.mobile
                + '&vcode=' + vm.vcode
                + '&birthday= '+vm.birthday
                + '&gender=' + vm.gender
                + '&name=' + vm.name
                +"&amountConfigId=" + amountConfigId
                +"&amount="+amount
            );
        }
        function agreement() {
            document.getElementById("sex").style.display="none";;
        }


        function ali() {
            var nc = new noCaptcha();
            var nc_appkey = 'FFFF00000000017A69F4';  // 应用标识,不可更改
            var nc_scene = 'register';  //场景,不可更改
            var nc_token = [nc_appkey, (new Date()).getTime(), Math.random()].join(':');
            var nc_option = {
                renderTo: '#dom_id',//渲染到该DOM ID指定的Div位置
                appkey: nc_appkey,
                scene: nc_scene,
                token: nc_token,
                //   trans: '{"name1":"code100"}',//测试用，特殊nc_appkey时才生效，正式上线时请务必要删除；code0:通过;code100:点击验证码;code200:图形验证码;code300:恶意请求拦截处理
                callback: function (data) {// 校验成功回调
                    // console.log(data.csessionid);
                    // console.log(data.sig);
                    // console.log(nc_token);
                    $timeout(function () {
                        document.getElementById("star-dialog").style.display="none";;
                        getVcode()
                    }, 1000);


                    console.log(vm.showdom);
                    document.getElementById('csessionid').value = data.csessionid;
                    document.getElementById('sig').value = data.sig;
                    document.getElementById('token').value = nc_token;
                    document.getElementById('scene').value = nc_scene;
                    send = "true";
                    csessionid = data.csessionid;
                    sig =  data.sig;
                    tokenStr = nc_token;;
                    scene = nc_scene;;

                }
            };
            nc.init(nc_option);
        }



        $scope.reloadRoute = function () {
            $window.location.reload();

        };

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
                endYear: currYear + 10 //结束年份
            };

            $("#USER_AGE").mobiscroll($.extend(opt['date'], opt['default']));

        });
    }
})();
