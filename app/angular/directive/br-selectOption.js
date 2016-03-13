angular.module("myapp").directive('brselectoption', function () {
	return {
		replace: false,
		restrict: "E",
		link: function(scope){
			angular.element(document).ready(function () {
				$('#br-selectoption').niceSelect();
			});
		}
	}
});