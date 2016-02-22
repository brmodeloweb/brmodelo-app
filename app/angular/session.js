angular.module('myapp').service('Session', function($cookies) {

	this.create = function(sessionId, userId, userName) {
		this.id = sessionId;
		this.userId = userId;
		this.userName = userName;
	};

	this.destroy = function() {
		this.id = null;
		this.userId = null;
		this.userName = null;

		$cookies.remove('sessionId');
		$cookies.remove('userId');
		$cookies.remove('userName');
	};

	this.sessionDetails = {

	}

});