var app = angular.module('myapp');

app.controller('optionsController', function($scope, $state, AuthService) {

	$scope.menuItens = [{
			text: "doAction1",
			action: function(){}
		}, {
			text: "doAction2",
			action: function(){}
		}, {
			text: "logout",
			action: function(){
				AuthService.logout();
				$state.go('login');
			}
	}];

});