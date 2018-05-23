/**
 * Created by fengli on 17/8/9.
 */
/**
 * Created by ganyang on 2017/3/22.
 */
(function () {
    'use strict';

    angular
        .module('vk')
        .controller('HeyTeaMyExperienceController', HeyTeaMyExperienceController);

    HeyTeaMyExperienceController.$inject = ['$sessionStorage', '$location', '$timeout', 'PointShopService', 'lodash'];

    /** @ngInject */
    function HeyTeaMyExperienceController($sessionStorage, $location, $timeout, PointShopService, lodash) {
        var cardId = $sessionStorage.cardId;
        var token = $sessionStorage.token;
        var storeId = $sessionStorage.storeId;
        var vm = this;
        vm.levelName = $sessionStorage.levelName;
        vm.name = $sessionStorage.memberName;
        vm.cardType = $sessionStorage.cardType || '普通卡';
        vm.cardId = $sessionStorage.cardId;
        vm.pointsRecords = [];
        vm.currentPoints = $sessionStorage.point || 0;
        vm.experience = $sessionStorage.experience ||0;
        vm.goBack = goBack;
        var creatTime = $sessionStorage.activated  ;
        var creatOne = creatTime.split(" ")[0];
        var  creatonearr = creatOne.split("-");
        var creatTwoyear =parseInt(creatonearr[0])  + 1;
        var creatTwo = creatTwoyear +"-"+creatonearr[1]+"-"+creatonearr[2];
        vm.timeStr ="累计积分周期:"+ creatOne +"至" +creatTwo;


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
        if(cardId =="" ||cardId=="null"||!cardId){
            return
        }


        PointShopService.getMyPointsRecords(cardId, token).then(function (data) {
            if (data.code != 200) {
                alert(data.message);
                // vm.msg.warning = true;
                // vm.msg.message = data.message;
                // $timeout(function () {
                //     vm.msg.warning = false;
                //     vm.msg.message = '';
                // }, 2000);
                return;
            }

            var aaa = 0;

            // lodash.groupBy(res.data, 'templateId');
            lodash.each(data.data, function (each) {

                var  one = each.point.charAt(0);
                if (one == "+") {
                    aaa += parseFloat(each.point)
                }


            });
            console.log(aaa);
            vm.leve = data.levels;
            if (vm.experience <=vm.leve[1].lowerLimit) {
                // line
                document.getElementById("line").style.width = "calc((100% )/3)";
                var  r  =  vm.experience / vm.leve[1].lowerLimit;
                var s = document.getElementById("lineBG");
                var w = s.offsetWidth; //宽度
                var  d  = (w/3*r) ;
                if (w/3*r<12){
                    d  = (w/3*r) ;
                }else  {
                    d  = (w/3*r)-12 ;
                }
                var optionValue= vm.leve[1].lowerLimit - vm.experience;
                vm.option = "再获得"+optionValue +"积分，"+"可升级为'白银卡'";
                document.getElementById("pcImg").style.marginLeft = d +"px";

            }else if (vm.experience <=vm.leve[2].lowerLimit) {
                document.getElementById("line").style.width = "calc((100% )/3 *2)";
                // var  r  =  (vm.currentPoints-1000) / 4000;
                // document.getElementById("pcImg").style.left = "calc((100% )/3*r + ((100% )/3))";

                var  r  = (vm.experience-vm.leve[1].lowerLimit) / (vm.leve[2].lowerLimit - vm.leve[1].lowerLimit);
                var s = document.getElementById("lineBG");
                var w = s.offsetWidth; //宽度
                var  d  = w/3+(w/3*r)-12 ;
                document.getElementById("pcImg").style.marginLeft = d +"px";
                var optionValue= vm.leve[2].lowerLimit - vm.experience;
                vm.option = "再获得"+optionValue +"积分，"+"可升级为'黑金卡'";
                document.getElementById("pcImg").style.marginLeft = d +"px";
                // alert(d);
            }else  {
                document.getElementById("line").style.width = "100%";
                var  r  = (vm.experience-vm.leve[2].lowerLimit) / 1000;
                if (r >1) {
                    r = 1;
                }
                var s = document.getElementById("lineBG");
                var w = s.offsetWidth; //宽度
                var  d  = w/3*2+(w/3*r)-12 ;
                document.getElementById("pcImg").style.marginLeft = d +"px";
                vm.option ="您已经成为黑金卡用户";
            }
            vm.pointsRecords = data.data
            // var len = data.data.length;
            //
            // vm.timeStr ="累计积分周期:"+ data.data[len - 1].created.split(" ")[0] +"至" +data.data[0].created.split(" ")[0];
            if (data.data.length <1) {
                document.getElementById("bottom-box").style.backgroundImage="url()";
            }

        });

        if(cardId =="" ||cardId=="null"||!cardId){
            return
        }



        function goBack() {
            $location.url('/heytea-my?storeId=' + storeId + '&theme=heytea');
        }


    }
})();
