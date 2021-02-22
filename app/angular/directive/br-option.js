const directive = angular.module("app", []).directive('broption', function ($timeout) {

	return function(scope, elem, attr, ctrl) {

		console.log("broption");

		var resizeDropdowm;
		$(elem).attr("tabindex", "0");
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

		resizeDropdowm(150);
		elem.bind('click', function(e) {
			console.log("Clicked");
			resizeDropdowm(10);
			if (!$(elem).hasClass("disabled")) {
				$(elem).toggleClass("expanded");
			}
			if (!$(elem).hasClass("expanded")) {
				return $(elem).blur();
			}
		});

		return $(elem).focusout(function(e) {
			return $timeout(function() {
				return $(elem).removeClass("expanded");
			}, 250);
		});
	};
});

export default directive.name