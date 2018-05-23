/**
 * Created by ganyang on 16/11/11.
 */

(function () {
    'use strict';

    angular
        .module('vk')
        .factory('RegisterWithPwdService', RegisterWithPwdService);

    RegisterWithPwdService.$inject = ['$http', '$q', 'restUrlV2','restUrlV7'];

    function RegisterWithPwdService($http, $q, restUrlV2,restUrlV7) {
        return {
            register: register,
            registerWithWechat:registerWithWechat
        };

        function register(storeId, param) {
            // var bir = param.birthday;
            // var  m = bir.split("-");
            // var year = m[0];
            // var  month = m[1];
            // var  day = m[2];
            // if (month < 10) {
            //     month = "0" + month;
            // }
            //
            // if (day < 10) {
            //     day = "0" + day;
            // }

            return $http({
                method: 'POST',
                url: restUrlV2 + 'card',
                data: {
                    storeId: storeId,
                    mobile: param.mobile,
                    sms: param.vcode,
                    password: param.pwd,
                    birthday: param.birthday,
                    sex: param.gender,
                    name:param.name
                },
                dataType: "json"
            }).then(completed).catch(failed);
        }
        function registerWithWechat(storeId, param) {


            return $http({
                method: 'POST',
                url: restUrlV7 + 'rechargeRegister',
                data: {
                    storeId: storeId,
                    mobile: param.mobile,
                    sms: param.vcode,
                    password: param.pwd,
                    birthday: param.birthday,
                    sex: param.gender,
                    name:param.name,
                    openId:param.openId,
                    body:'VKA会员充值',
                    amount:param.amount,
                    curUrl:param.curUrl,
                    amountConfigId:param.amountConfigId


                },
                dataType: "json"
            }).then(completed).catch(failed);
        }

        function completed(response) {
            return response.data;
        }

        function failed(e) {
            return $q.reject(e);
        }
    }
})();
