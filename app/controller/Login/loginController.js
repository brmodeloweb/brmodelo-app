angular.module('myapp').controller('LoginController', function ($scope, $rootScope, AuthService, $modal, $state, $cookies) {

  $scope.credentials = {
    username: '',
    password: ''
  };

  $scope.config = {
    submitted: false,
    validmail: false,
    validpassword: false
  }

  $scope.animationsEnabled = true;

  $scope.login = function (credentials) {

    $scope.config.submitted = true;

    isValidPassword(credentials.password);
    isValidEmail(credentials.username);

    if($scope.config.validmail && $scope.config.validpassword){

      AuthService.login(credentials).then(function (user) {

        $state.go('main');

      }, function () {
        console.log('deu ruim');
      });
    }
  };


  $scope.register = function () {

    var modalInstance = $modal.open({
      animation: $scope.animationsEnabled,
      templateUrl: 'register.html',
      controller: 'registerController',
      size: ""
    });

    modalInstance.result.then(function (result) {
      console.log("Result");
      //$scope.selected = selectedItem;
    }, function () {
      //$log.info('Modal dismissed at: ' + new Date());
    });

  };

  $scope.toggleAnimation = function () {
    $scope.animationsEnabled = !$scope.animationsEnabled;
  };

  function isValidPassword(pass) {
    if ((pass.length > 3)) {
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
