angular.module('myapp').factory('AuthService', function ($http, $cookies) {
  var authService = {};

  authService.login = function (credentials) {
    return $http
      .post('/login', credentials)
      .then(function (res) {

        console.log("Resposta: " + res);

        var user = res.data;

        var today = new Date();
        var expired = new Date(today);
        expired.setDate(today.getDate() + 1);

        $cookies.put('sessionId', user.sessionId, {expires : expired });
        $cookies.put('userId', user.userId, {expires : expired });
        $cookies.put('userName', user.userName, {expires : expired });

         return user;
      });
  };

  authService.register = function (credentials) {
    return $http
      .post('/createUser', credentials)
      .then(function (res) {

        console.log(res);

        // Session.create(res.data.id, res.data.user.id);
        // return res.data.user;
      });
  };

  authService.isAuthenticated = function () {
    return !!$cookies.get('userId');
  };

  return authService;
});
