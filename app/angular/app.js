var app = angular.module('myapp', ['ui.router', 'ui.bootstrap', 'angularModalService', 'ngCookies']);

app.config(['$urlRouterProvider', '$stateProvider',

	function($urlRouterProvider, $stateProvider) {
		$stateProvider.state('login', {
			url: '/',
			templateUrl: 'angular/view/login.html',
			data: {
				requireLogin: false
			}
		});

		$stateProvider.state('register', {
			url: '/register',
			templateUrl: 'angular/view/register.html',
			data: {
				requireLogin: false
			}
		});

		$stateProvider.state('workspace', {
			url: '/workspace',
			templateUrl: 'angular/view/workspace.html',
			data: {
				requireLogin: true
			}
		});

		$stateProvider.state('main', {
			url: '/main',
			templateUrl: 'angular/view/main.html',
			data: {
				requireLogin: true
			}
		});

		$stateProvider.state('conceptual', {
			url: '/conceptual/{modelid}',
			templateUrl: 'angular/view/conceptual.html',
			data: {
				requireLogin: true
			}
		});

		$stateProvider.state('logic', {
			url: '/logic',
			templateUrl: 'angular/view/logic.html',
			data: {
				requireLogin: true
			}
		});

		$urlRouterProvider.otherwise("/")
	}
]);

app.run(function($rootScope, $state, $cookies, AuthService, ConceptualFactory) {
	$rootScope.$on('$stateChangeStart', function(event, toState, toParams) {
		var requireLogin = toState.data.requireLogin;
		if (requireLogin) {
			if (AuthService.isAuthenticated()) {
				$rootScope.loggeduser = AuthService.loggeduser;
			} else {
				event.preventDefault();
				$state.go('login');
			}
		}
	});
});

app.$inject = ['$scope', '$http', '$cookies', 'ModalService'];
