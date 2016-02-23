angular.module("myapp").directive('brdropdown', function () {
	return {
		templateUrl: "angular/view/br-dropdown.html",
		replace: true,
		restrict: "E",
		scope: {
			list: "=",
			title: "@"
		},
		link: function(scope){
			scope.opened = false;

			scope.show = function(){
				scope.opened = !scope.opened;
			}

			scope.doAction = function(item){
				item.action();
			}
		}
	}
});