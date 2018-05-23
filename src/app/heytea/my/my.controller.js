(function () {
    'use strict';
    angular
        .module('vk')
        .controller('HeyTeaMyController', HeyTeaMyController);

    HeyTeaMyController.$inject = ['$scope', '$sessionStorage', '$location', '$timeout', 'MyService', 'SessionStorageService', 'Upload', 'webApiUrl',"$sce"];

    /** @ngInject */
    function HeyTeaMyController($scope, $sessionStorage, $location, $timeout, MyService, SessionStorageService, Upload, webApiUrl,$sce) {
        document.title = "喜茶星球";
        var cardId = $sessionStorage.cardId;
        var token = $sessionStorage.token;
        var storeId = $sessionStorage.storeId;

        var vm = this;
        vm.name = $sessionStorage.memberName;
        vm.levelName = $sessionStorage.levelName;
        vm.cardType = $sessionStorage.cardType || '普通卡';
        vm.cardId = $sessionStorage.cardId;
        vm.showWelcome = true;
        vm.logo = $sessionStorage.headUrl
        ;
        vm.goDetailPage = goDetailPage;
        vm.changeLogo = changeLogo;
        vm.uploadPhoto = uploadPhoto;
        vm.picFile = undefined;
        vm.agreement = agreement;
        vm.goShop = goShop;
        vm.msg = {
            warning: false,
            message: ''
        };
        var urlParam = $location.search();
        var theme = urlParam.theme || $sessionStorage.theme;
       var activeted = $sessionStorage.activated;
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
        initone();


        // document.getElementById("sex-close").addEventListener("click",function(event){
        //     document.getElementById("sex").style.display="none";;
        //     document.getElementById("page__bd").style.overflow="inherit";;
        //     $sessionStorage.showagreeMent = false;
        // },false);
        function one() {
            // getUserRule
            if(cardId =="" ||cardId=="null"||!cardId){
                return
            }
            MyService.getUserRule(storeId).then(function (res) {
         // alert(res);

                // $sce.trustAsHtml(data.content);
                // vm.detail = $sce.trustAsHtml(res.largevalue);

                vm.detail =
                    $sce.trustAs($sce.RESOURCE_URL,res.largevalue);;


            }, function (e) {
                //error msg
            });
        }
    function goShop() {
    // window.open("https://m.seeapp.com/see/static_wechat/detail/mall.html?id=95522&source_flag=95522&f_id=95522,1,1330,3354,0,0,0,0");
    window.location.href="https://m.seeapp.com/see/static_wechat/detail/mall.html?id=95522&source_flag=95522&f_id=95522,1,1330,3354,0,0,0,0";
}
        function  initone() {
            if ($sessionStorage.showSplash) {
                vm.showSplash = true;
                $timeout(function () {
                    vm.showSplash = false;
                    $sessionStorage.showSplash = false;
                    init()
                }, 1500);
            } else {
                vm.showSplash = false;
                $sessionStorage.showSplash = false;
                init()
            }
        }
        function init() {


            if ($location.search().showSplash) {
                $timeout(function () {
                    vm.showWelcome = false;
                    $location.search().showSplash = false;
                }, 1500);
            } else {
                vm.showWelcome = false;
            }

            one();
            if(cardId =="" ||cardId=="null"||!cardId){
                return
            }
            MyService.getMemberInfo(cardId, token).then(function (res) {
                // showagreeMent
              console.log('userinfo: ', res.data)
                vm.experience = res.data.experience || 0;
                // vm.balance = res.data.balance ||0;
                // balance
                vm.point = res.data.point || 0;
                vm.ticketsCount = res.data.ticketsCount || 0;
                vm.mobile = res.data.mobile;
                vm.logo =  res.data.headUrl  ||"./assets/images/heytea/head.png";
                vm.levelName = res.data.levelName || '普通会员';
                var timestamp;
                if(res.data.activated == "null" || res.data.activated == "" ||!res.data.activated)
                {
                    timestamp = "";
                }else  {
                    timestamp = formatDateTime(res.data.activated);
                }
                if (res.data.agreement == 0 || res.data.agreement == "null" || !res.data.agreement) {
                    if ($sessionStorage.showagreeMent) {
                        document.getElementById("sex").style.display = "block";
                        document.getElementById("page").style.overflow="hidden";;
                        // document.querySelector('body').addEventListener('touchmove',function (e) {
                        //     if(!document.querySelector('.register-dialog-sex').contains(e.target)) {
                        //         e.preventDefault();
                        //     }
                        // })
                    } else {

                    }

                }
                SessionStorageService.setOneSessionStorage("levelName", res.data.levelName);
                SessionStorageService.setOneSessionStorage("levelId", res.data.levelId);

                SessionStorageService.setAllSessionStorage(res.data, function (res) {

                    $sessionStorage.memberName = $sessionStorage.name;
                    $sessionStorage.headUrl = vm.logo;
                    $sessionStorage.activated = timestamp;

                });
            }, function (e) {
                //error msg
            });
        }
function agreement () {
    // agreement

    MyService.agreement(cardId, token).then(function (res) {
        document.getElementById("sex").style.display="none";;
        $sessionStorage.showagreeMent = false;
        document.getElementById("page").style.overflow="inherit";;

    }, function (e) {
        //error msg
    });
}
        function changeLogo() {
            window.alert('abc')
        }

        function goDetailPage(url) {
            // $location.url("/heytea-test" + '?storeId=' + $sessionStorage.storeId);
            $location.url(url + '?storeId=' + $sessionStorage.storeId+ "&theme=" + theme);

        }

        $scope.$watch('picFile', function (file) {


            uploadPhoto(file)
        })


        function  resizeFile(file) {

        }
        function uploadPhoto(file) {
            if (!file) return;
            console.log('file:', file)
            // var size = file.size;
            // var sizeM = size/1024;
            // if (sizeM > 2000) {
            //
            //     alert("请上传2M以内的图片");
            //     return
            // }

            Upload.upload({
                url: webApiUrl + 'uploadFile/v2/upload',
                method: 'POST',
                headers : {
                  'Content-Type': 'multipart/form-data'
                },
                data: {'file': file}
            }).then(function (resp) {

                if (resp.status !=200) {
                    vm.msg.warning = true;
                    vm.msg.message = resp.data.message;
                    $timeout(function () {
                        vm.msg.warning = false;
                        vm.msg.message = '';
                    }, 2000);
                    return;
                }
                console.log('data: ', resp.data)
                vm.logo = resp.data.data[0]
                SessionStorageService.setOneSessionStorage("headUrl", vm.logo);

                var params = {
                    headUrl:resp.data.data[0]
                };

                if(cardId =="" ||cardId=="null"||!cardId){
                    return
                }
                MyService.updateMemberInfo(cardId, token, params).then(function (tranData) {
                    if (tranData.code != 200) {
                        alert(tranData.message);
                        console.log(tranData.message);
                        vm.logo = "";
                        return
                    }
                    $sessionStorage.headUrl =resp.data.data[0] ;

                    vm.logo = resp.data.data[0];
                })
            }, function (resp) {
                console.log('Error status: ' + resp.status);
            }, function (evt) {
                //var progressPercentage = parseInt(100.0 * evt.loaded / evt.total);
                //console.log('progress: ' + progressPercentage + '% ' + evt.config.data.file.name);
            });
        }
    }
})();
