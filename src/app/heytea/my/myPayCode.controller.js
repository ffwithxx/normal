(function () {
    'use strict';

    angular
        .module('vk')
        .controller('HeyTeaMyPayCodeController', HeyTeaMyPayCodeController);

    /** @ngInject */
    HeyTeaMyPayCodeController.$inject = ['$interval', '$location', '$sessionStorage', 'MyService', 'JsBarcode', 'SessionStorageService'];

    function HeyTeaMyPayCodeController($interval, $location, $sessionStorage, MyService, JsBarcode, SessionStorageService) {
        var cardId = $sessionStorage.cardId;
        var token = $sessionStorage.token;
        var storeId = $sessionStorage.storeId;
        var vm = this;
        vm.refresh = refresh;
        vm.goBack = goBack;

        function goBack() {
            $location.url('/heytea-my?storeId=' + storeId);
        }

        function refresh() {
            if(cardId =="" ||cardId=="null"||!cardId){
                return
            }
            MyService.getPayCode(cardId, token).then(function (data) {
                if (data.code != 200) {
                    // alert(data.message);
                    return
                }
                vm.qrcode = data.data.code;
                SessionStorageService.setOneSessionStorage("payCode", data.data.code);
                JsBarcode("#barcode")
                    .CODE128C(data.data.code, {width:2.5, fontSize: 25, textMargin: 0, fontWeight: 500, textPosition: "bottom"})
                    .render();
            }, function (e) {
                //error msg
            });
        }

        //每三分钟更新一次
        refresh();
        $interval(function () {
                refresh()
            }
            , 180000
        );

    }
})();
