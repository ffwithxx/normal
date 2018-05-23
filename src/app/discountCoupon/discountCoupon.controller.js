(function () {
    'use strict';

    angular
        .module('vk')
        .controller('DiscountCouponController', DiscountCouponController);

    DiscountCouponController.$inject = ['$location', '$sessionStorage', 'MyService','lodash','SessionStorageService'];

    /** @ngInject */
    function DiscountCouponController($location, $sessionStorage, MyService,lodash,SessionStorageService) {
        var storeId = $sessionStorage.storeId;
        var cardId = $sessionStorage.cardId;
        var token = $sessionStorage.token;
        var urlParam = $location.search();
        var theme = urlParam.theme || $sessionStorage.theme;
        var vm = this;
        vm.active = 'one';
        vm.switchTab = switchTab;
        vm.goBack = goBack;
        vm.goBarCodePage = goBarCodePage;
        vm.shareCode = shareCode;
        vm.note = note;
        //init list
        vm.switchTab('one');
        vm.openTaste=openTaste;
        var levelInterests = 0;
        vm.showBlack = true;







        function getList(flag) {
            vm.list = [];
            if(cardId =="" ||cardId=="null"||!cardId){
                return
            }

            MyService.levelPrivileges(cardId,storeId,token).then(function (res) {

                if (res.code == 200) {
                    levelInterests = res.data.levelInterests;
                    if (levelInterests === 1 ){
                        vm.name = res.data.levelName;
                        vm.levelConsumptionCount = res.data.levelConsumptionCount;
                        vm.cardConsumptionCount = res.data.cardConsumptionCount;
                        vm.ticketName = res.data.ticketName;
                        vm.showBlack = true;
                        var leve = 0;

                        if (res.data.cardConsumptionCount <  res.data.levelConsumptionCount) {
                           leve =  res.data.levelConsumptionCount - res.data.cardConsumptionCount;
                           if (res.data.type == 1){
                               vm.ticketNameStr ="再消费"+leve+"次"+ "获得"+res.data.ticketCount+"张"+"【"+res.data.ticketName+"】";
                           } else {
                               vm.ticketNameStr ="再购买"+leve+"件商品"+ "获得"+res.data.ticketCount+"张"+"【"+res.data.ticketName+"】";
                           }

                        }else {
                            if (res.data.type == 1) {
                                vm.ticketNameStr = "您已消费" + res.data.cardConsumptionCount + "次" + "获得" + res.data.ticketCount + "张" + "【" + res.data.ticketName + "】";
                            }else {
                                vm.ticketNameStr = "您已购买" + res.data.cardConsumptionCount + "件商品" + "获得" + res.data.ticketCount + "张" + "【" + res.data.ticketName + "】";
                            }

                        }


                            if (theme =="black") {
                                var s = document.getElementById("lineGary");
                                var w = s.offsetWidth; //宽度
                                var r = res.data.cardConsumptionCount/res.data.levelConsumptionCount;
                                var widthone =0;
                                if (r >1)  {
                                    widthone = w;
                                }else {
                                    widthone = r*w;
                                }


                                document.getElementById("lineblack").style.width = widthone +'px';

                            }else {
                                var s = document.getElementById("lineGaryone");
                                var w = s.offsetWidth; //宽度
                                var r = res.data.cardConsumptionCount/res.data.levelConsumptionCount;
                                var widthone =0;
                                if (r >1)  {
                                    widthone = w;
                                }else {
                                    widthone = r*w;
                                }


                                document.getElementById("lineblackone").style.width = widthone +'px';

                            }


                    }
                }


            })



            MyService.getDiscountCouponList(cardId, storeId, token, flag).then(function (res) {
                // vm.list = res.data;
                var tempArr = lodash.groupBy(res.data, 'id');
                //  var tempArr = lodash.filter(res.data, function (each) {
                //     return each.num > 0;
                // });
                for (var i = 0; i < res.data.length; i++) {
                    var li = res.data[i];
                    var isShare = li.isShare;
                    var nameStr = li.name;
                    if (isShare==1) {
                        nameStr = nameStr+" [可分享]";
                    }
                    var day = getDays(li.beginTime,li.endTime);
                    var timeStr;
                    var st = days(li.endTime);


                    if  (day <= 1) {
                        timeStr  = "有效期:" + li.beginTime ;
                    }else {
                        timeStr = "有效期:" + li.beginTime + "至" + st;
                    }

                    li.dateStr = timeStr;
                    li.titleName = nameStr;

                }
                lodash.forEach(tempArr, function (v, k) {

                    v[0].nums = v.length;
                    vm.list.push(v[0]);
                });

            });
        }
        Date.prototype.format = function(fmt) {
            var o = {
                "M+" : this.getMonth()+1,                 //月份
                "d+" : this.getDate(),                    //日
                "h+" : this.getHours(),                   //小时
                "m+" : this.getMinutes(),                 //分
                "s+" : this.getSeconds(),                 //秒
                "q+" : Math.floor((this.getMonth()+3)/3), //季度
                "S"  : this.getMilliseconds()             //毫秒
            };
            if(/(y+)/.test(fmt)) {
                fmt=fmt.replace(RegExp.$1, (this.getFullYear()+"").substr(4 - RegExp.$1.length));
            }
            for(var k in o) {
                if(new RegExp("("+ k +")").test(fmt)){
                    fmt = fmt.replace(RegExp.$1, (RegExp.$1.length==1) ? (o[k]) : (("00"+ o[k]).substr((""+ o[k]).length)));
                }
            }
            return fmt;
        }
        function days(strDateEnd) {
            // var a = strDateEnd.split(" ");
            // var b = a[0].split("-");
            // var c = a[1].split(":");
            // var date = new Date(b[0], b[1], b[2], c[0], c[1], c[2]);

            var date = new Date(strDateEnd);
            var preDate = new Date(date.getTime() - 24*60*60*1000); //前一天
            var str=preDate.format("yyyy-MM-dd");
            // document.write(str)
            // alert(str)
            return str;
        }
        function getDays(strDateStart,strDateEnd){
            var strSeparator = "-"; //日期分隔符
            var oDate1;
            var oDate2;
            var iDays;
            oDate1= strDateStart.split(strSeparator);
            oDate2= strDateEnd.split(strSeparator);
            var strDateS = new Date(oDate1[0], oDate1[1]-1, oDate1[2]);
            var strDateE = new Date(oDate2[0], oDate2[1]-1, oDate2[2]);
            iDays = parseInt(Math.abs(strDateS - strDateE ) / 1000 / 60 / 60 /24)//把相差的毫秒数转换为天数
            return iDays ;
        }
        function note(remark) {
            var remarkStr ;
            if (remark == "null" ||remark == "" || !remark) {
                remarkStr = "不能与其他抵用券同时用";
            }else  {
                remarkStr = remark.replace(/<\/br>/g, "\n");
            }
            return remarkStr;
        }
        function shareCode(p) {

            var dayCount = getDays(p.beginTime,p.endTime);
            var timeStr;
            var st = days(p.endTime);
            if  (dayCount <= 1) {
                timeStr  = "有效期:" + p.beginTime;
            }else {
                timeStr = p.beginTime + "至" + st;
            }
            var des = p.remark;
            if (!des){
                des = "不能与其他抵用券同时用";

            }
            SessionStorageService.setOneSessionStorage("discountRemark", des);
            $location.url('/couponRedemption?storeId=' + storeId
                + "&remark=" + des+ "&title=" + p.name +"&time=" +timeStr+ "&barcode=" + p.code +"&url=" +p.url+"&ishare=" +p.isShare
            );


            // $location.url('/couponRedemption?storeId=' + storeId
            //     + "&barcode=" + barcode+"&theme=" + theme
            // );
        }
        function openTaste(p) {
            var  str = p.remark|| "不能与其他抵用券同时用";
            var pStr = str.replace(/\&/g, "~");
            var dayCount = getDays(p.beginTime,p.endTime);
            var timeStr;
            var st = days(p.endTime);
            if  (dayCount <= 1) {
                timeStr  = "有效期:" + p.beginTime;
            }else {
                timeStr = p.beginTime + "至" + st;
            }
            SessionStorageService.setOneSessionStorage("discountRemark", pStr);
            $location.url('/discountCouponDetail?storeId=' + storeId
                + "&remark=" + pStr+ "&title=" + p.name +"&time=" +timeStr+ "&barcode=" + p.code +"&url=" +p.url+"&ishare=" +p.isShare);


        }
        function switchTab(tab) {
            vm.active = tab;
            //filter data
            if (tab === 'one') {
                getList('bleft');
            } else if (tab === 'two') {
                getList('bcenter');
            } else {
                getList('bright');
            }
        }

        function goBack() {
            if(cardId =="" ||cardId=="null"||!cardId){
                return
            }
            MyService.getMemberInfo(cardId, token).then(function (data) {
                if (data.code != 200) {
                    alert(data.message);
                    console.log(data.message);
                    $location.url("/my?storeId=" + storeId+"&theme=" + theme);
                    return
                }

                $sessionStorage.balance = data.data.balance;
                $sessionStorage.point = data.data.point;
                $sessionStorage.ticketsCount= data.data.ticketsCount;

                $location.url("/my?storeId=" + storeId+"&theme=" + theme);

            });

        }

        function goBarCodePage(barcode) {
            $location.url("/barcode?storeId=" + storeId + "&barcode=" + barcode+"&theme=" + theme);
        }
    }
})();
