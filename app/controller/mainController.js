var app = angular.module('myapp');

app.controller('mainController', function ($scope, $state, AuthService) {

  $scope.logout = function () {
    AuthService.logout();
    $state.go('login');
  };

});
