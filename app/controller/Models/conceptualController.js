angular.module('myapp').controller("conceptualController", ['$scope', '$http', function($scope ,$http) {

$(document).ready(function () {

    var graph = new joint.dia.Graph;
    var paper = new joint.dia.Paper({
      el: $('#myholder'),
      width: $('#content').width(),
      height: $('#content').height(),
      gridSize: 1,
      model: graph
    });

    paper.on('cell:pointerup', function(cellView) {
    // We don't want a Halo for links.
    if (cellView.model instanceof joint.dia.Link) return;
      // var halo = new joint.ui.Halo({ graph: graph, paper: paper, cellView: cellView });
      // new teste
      // var halo = new joint.ui.Halo({cellView: cellView });
      // halo.render();
      // var freetransform = new joint.ui.FreeTransform({ cellView: cellView, allowRotation: false });
      var halo = new joint.ui.Halo({ cellView: cellView });
      halo.removeHandle('resize');
      halo.changeHandle('clone', { position: 'se' });
      halo.render();
    });

  var stencil = new joint.ui.Stencil({ graph: graph, paper: paper });
  $('#stencil-holder').append(stencil.render().el);

   //  var graph = new joint.dia.Graph;
   //  var paper = new joint.dia.Paper({
   //      el: $('#paper-holder-loading'),
   //      width: 300,
   //      height: 200,
   //      gridSize: 25,
   //      color: "green",
   //      model: graph
   //  });

   //  var stencil = new joint.ui.Stencil({
   //      graph: graph,
   //      paper: paper,
   //      width: 200,
   //      height: 200
   //  });
   //  $('#stencil-holder-loading').append(stencil.render().el);

    var r = new joint.shapes.basic.Rect({
        position: { x: 10, y: 10 }, size: { width: 50, height: 30 },
        attrs: { rect: { fill: '#2ECC71' }, text: { text: 'rect', fill: 'black' } }
    });
    var c = new joint.shapes.basic.Circle({
        position: { x: 70, y: 10 }, size: { width: 50, height: 30 },
        attrs: { circle: { fill: '#9B59B6' }, text: { text: 'circle', fill: 'white' } }
    });

   stencil.load([r, c]);

    var erd = joint.shapes.erd;

    var element = function(elm, x, y, label) {
        var cell = new elm({ position: { x: x, y: y }, attrs: { text: { text: label }}});
        graph.addCell(cell);
        return cell;
    };

    var employee = element(erd.Entity, 100, 200, "Employee");


});

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
