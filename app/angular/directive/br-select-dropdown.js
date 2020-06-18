angular.module("myapp").directive('brSelectDropdown', function ($timeout) {
	return {
		templateUrl: "angular/directive/br-select-dropdown.html",
		replace: true,
		restrict: "E",
		scope: {
			options: "=",
			selectedOptionParam: "=selected",
			'onSelectAction': "&"
		},
		link: function(scope, elem) {

			scope.selectedOption = scope.selectedOptionParam.value;

			resizeDropdowm = function(time) {
				return $timeout(function() {
					var dropList, dropW;
					dropW = $(elem).outerWidth();
					dropList = $(elem).children().closest('ul');
					return dropList.css({
						'min-width': dropW
					});
				}, time);
			};

			scope.toggle =  function(){
				resizeDropdowm(30);
				if (!$(elem).hasClass("disabled")) {
					$(elem).toggleClass("expanded");
				}
				if (!$(elem).hasClass("expanded")) {
					$timeout(function() {
						$(elem).blur();
					}, 250);
				}
			}

			$(elem).focusout(function(e) {
				return $timeout(function() {
					return $(elem).removeClass("expanded");
				}, 250);
			});

			scope.selectOption = function(option){
				scope.onSelectAction()(option);
				scope.selectedOption = option;
				scope.toggle();
			}
		}
	}
});
