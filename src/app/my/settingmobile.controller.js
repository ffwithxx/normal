(function () {
    'use strict';

    angular
        .module('vk')
        .controller('SettingMobileController', SettingMobileController);

    /** @ngInject */
    SettingMobileController.$inject = ['$interval', '$location', '$sessionStorage', 'lodash', 'ForgetPwdService', 'MyService', 'UtilService', '$timeout',"$window","$scope",'RegisterService'];

    function SettingMobileController($interval, $location, $sessionStorage, lodash, ForgetPwdService, MyService, UtilService, $timeout,$window,$scope,RegisterService) {
        var storeId = $sessionStorage.storeId;
        //要复制的
        var send = "false";
        var  csessionid;
        var  sig;
        var tokenStr;
        var scene;
        //到这
        var waitSec = 60;
        var vCodeWait = waitSec;
        var cardId = $sessionStorage.cardId;
        var token = $sessionStorage.token;
        var vm = this;
        vm.msg = {
            warning: false,
            message: ''
        };
        vm.vcodeTitle = "获取验证码";
        vm.getVcode = getVcode;
        vm.submit = submit;
        vm.goBack = goBack;
        vm.onPwdChange = onPwdChange;
        ali()

        function onPwdChange(item) {
            if (isNaN(item)) {
                vm.pwd = item.substring(0, item.length - 1);
                return
            }
            if (item.length > 6) {
                vm.pwd = item.substring(0, item.length - 1);
                vm.msg.warning = true;
                vm.msg.message = '密码长度只能为6位';
                $timeout(function () {
                    vm.msg.warning = false;
                    vm.msg.message = '';
                }, 2000);
                return
            }
            console.log(item)
        }

        function goBack() {
            $location.url("/memberInfo?storeId=" + storeId);
        }

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
            if (!vm.mobile || vCodeWait < waitSec) {
                return
            }
            //要复制的
            if (send == "false"){
                document.getElementById("star-dialog").style.display="block";;
                return;
            }

            //这
            RegisterService.getmobileVcode(storeId, vm.mobile,csessionid,sig,tokenStr,scene).then(function (data) {
                if (data.code != 200) {
                    //  vm.msg.warning = true;
                    // vm.msg.message = data.message;
                    vm.showDialog = false;
                    $timeout(function () {
                        vm.msg.warning = false;
                        vm.msg.message = '';
                    }, 2000);
                    $timeout(function () {
                        // $scope.reloadRoute();
                    }, 3000);

                    return;
                }
                ali()
                countDown();
            }, function (e) {
                alert(e.message);
            });


        }

        function submit() {
            if (vm.mobile.length != 11 && vm.mobile =="") {

                vm.msg.warning = true;
                vm.msg.message = "请输入手机号";
                $timeout(function () {
                    vm.msg.warning = false;
                    vm.msg.message = '';
                }, 2000);
                return;
            }

            if (vm.vcode.length<1 || vm.vcode =="") {
                vm.msg.warning = true;
                vm.msg.message = "请输验证码";
                $timeout(function () {
                    vm.msg.warning = false;
                    vm.msg.message = '';
                }, 2000);
                return
            }
            // getmobileVcode
            RegisterService.checkSms(vm.vcode, vm.mobile).then(function (retData) {
                if (retData.code != 200) {
                    alert(retData.message);
                    console.log(retData.message);
                    vm.otherMobile = $sessionStorage.otherMobile;
                    vm.vcodeTitle = "验证码";
                    vm.vcodeCss = "";
                    vCodeWait =0;
                    vm.vcode = "";
                    return
                }
                MyService.updateMemberInfo(cardId, token, {otherMobile: vm.mobile}).then(function (retData) {
                    if (retData.code != 200) {
                        alert(retData.message);




                        return
                    }
                    vm.showDialog = false;
                    alert("修改成功!");
                    vm.vcodeTitle = "验证码";
                    vm.vcodeCss = "";
                    vCodeWait =0;
                    vm.vcodeNum = "";
                    $sessionStorage.otherMobile = vm.mobile;
                    $location.url("/memberInfo?storeId=" + storeId);


                })
                // $sessionStorage.otherMobile = vm.otherMobile;
            })
        }
//复制
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
        // function goRegister() {
        //     $location.url('/register');
        // }
    }
})();
