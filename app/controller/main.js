var app = angular.module('myapp', ['ui.router', 'ui.bootstrap', 'angularModalService', 'ngCookies']);

app.config(['$urlRouterProvider', '$stateProvider',

    function ($urlRouterProvider, $stateProvider) {
        $stateProvider.state('login', {
          url:'/',
          templateUrl:'/view/login.html',
          data: {requireLogin: false}
        });
        $stateProvider.state('main', {
            url:'/main',
            templateUrl:'/view/main.html',
            data: {requireLogin: true}
          });
        $urlRouterProvider.otherwise("/")
    }

]);


app.run(function ($rootScope, $state, $cookies, AuthService) {

  $rootScope.$on('$stateChangeStart', function (event, toState, toParams) {

    var requireLogin = toState.data.requireLogin;

    if(requireLogin){

      if(AuthService.isAuthenticated()){
          $rootScope.currentUser = $cookies.getObject('user');
      } else {
          event.preventDefault();
          $state.go('login');
      }

    }

  });

});


app.$inject = [ '$scope', '$http', '$cookies', 'ModalService' ];
