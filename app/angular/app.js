var app = angular.module('myapp', [
	'ui.router',
	'ui.bootstrap',
	'ngCookies',
	'textAngular'
]);

app.config(['$urlRouterProvider', '$stateProvider',

	function($urlRouterProvider, $stateProvider) {
		$stateProvider.state('login', {
			url: '/',
			template: '<login></login>',
			data: {
				requireLogin: false
			}
		});

		$stateProvider.state('register', {
			url: '/register',
			template: '<signup></signup>',
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
			url: '/logic/{references:json}',
			templateUrl: 'angular/view/logic.html',
			data: {
				requireLogin: true
			}
		});

		$stateProvider.state('sql', {
			url: '/sql/{code}',
			templateUrl: 'angular/view/sql.html',
			data: {
				requireLogin: true
			}
		});

		$urlRouterProvider.otherwise("/")
	}
]);

app.run(function($transitions, $rootScope, AuthService, $state) {
	$transitions.onStart({}, function(trans) {
		var requireLogin = trans.to().data.requireLogin
		if (requireLogin) {
			if (AuthService.isAuthenticated()) {
				$rootScope.loggeduser = AuthService.loggeduser;
			} else {
				$state.go('login');
			}
		}
	});
})

app.config(function() {
	angular.lowercase = function(text){
		return (typeof text === 'string') ? text.toLowerCase() : text;
	}
})

app.$inject = ['$scope', '$http', '$cookies', '$uibModalInstance'];