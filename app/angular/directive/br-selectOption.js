angular.module("myapp").directive('brselectoption', function () {
	return {
		replace: false,
		restrict: "A",
		link: function(scope){
			angular.element(document).ready(function () {
				$(function(){
				   function show_popup(){
				  		$('#br-selectoption').niceSelect();
				   };
				   window.setTimeout( show_popup, 200 ); // 5 seconds
				});
			});
		}
	}
});