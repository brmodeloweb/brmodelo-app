angular.module('myapp').controller("taskListController", ['$scope', '$http', function($scope ,$http) {

    $scope.taskLists = [
    {
        "listName": "List1",
        "user": "",
        "done": false,
        "tasks": [
            {
                "text": "learnangular",
                "done": true,
                "date": new Date(),
                "tags": ["impartante", "facil"]
            },
            {
                "text": "buildanangularapp",
                "done": false
            }
        ]
    },
    {
        "listName": "Ai meu peru",
        "tasks": [
            {
                "text": "Que lindo",
                "done": true
            },
            {
                "text": "show",
                "done": false
            }
        ]
    }
    ]

    $scope.addTask = function(taskText) {
    //  $scope.tasks.push({text:taskList.taskText, done:false});
    //  taskList.taskText = '';
    // Simple POST request example (passing data) :

    $http.post('/addTask', {msg: taskText}).
      then(function(response) {
        // this callback will be called asynchronously
        // when the response is available
        $scope.tasks.push({text:taskText, done:false});


      }, function(response) {
        console.log(response);
        // called asynchronously if an error occurs
        // or server returns response with an error status.
      });

    };

    $scope.remaining = function() {
      var count = 0;
      angular.forEach($scope.tasks, function(task) {
        count += task.done ? 0 : 1;
      });
      return count;
    };

    $scope.archive = function() {
      var oldtasks = taskList.tasks;
      taskList.tasks = [];
      angular.forEach(oldtasks, function(task) {
        if (!task.done) taskList.tasks.push(task);
      });
    };
}]);


app.$inject = [ '$scope', '$http', '$cookies' ];
