var app = angular.module('myapp');

app.controller('registerController', function ($scope, $modalInstance, AuthService) {

  $scope.credentials = {
    username: '',
    email: '',
    password: ''
  };

  $scope.config = {
    submitted: false,
    validmail: false,
    validname: false,
    validpassword: false
  }

  $scope.register = function (credentials, repassword) {

    $scope.config.submitted = true;

    isValidName(credentials.username);
    isValidPassword(credentials.password, repassword)
    isValidEmail(credentials.email)

    if($scope.config.validmail && $scope.config.validname && $scope.config.validpassword){

      AuthService.register(credentials).then(function (user) {
        // $rootScope.$broadcast(AUTH_EVENTS.loginSuccess);
        // $scope.setCurrentUser(user);
        $modalInstance.close("Result ok");
      }, function () {
        // $rootScope.$broadcast(AUTH_EVENTS.loginFailed);
      });

    }
  };

  $scope.cancel = function () {
    $modalInstance.dismiss('cancel');
  };

  function isValidName(field) {
    console.log(field);
    if (field == null || field == "") {
      $scope.config.validname = false;
      return false;
    } else {
      $scope.config.validname = true;
      return true;
    }
  }

  function isValidPassword(pass1, pass2) {
    if ((pass1 == pass2 && pass1.length > 3)) {
      $scope.config.validpassword = true;
      return true;
    } else {
      $scope.config.validpassword = false;
      return false;
    }
  }

  function isValidEmail(field) {
    var re = /^([a-zA-Z0-9_\.\-])+\@(([a-zA-Z0-9\-])+\.)+([a-zA-Z0-9]{2,4})+$/;

    if (!re.test(field)) {
      $scope.config.validmail = false;
      return false;
    } else {
      $scope.config.validmail = true;
      return true;
    }
  }

});
