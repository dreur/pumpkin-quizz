$(function($){

var Question = Backbone.Model.extend({
  defaults: {
    "question": "Who first celebrated what we've come to know as Halloween?",
    "choices": ["The Druids.", "The Romans.", "The Christians."],
    "answer": 1,
    "source": "http://quizzes.familyeducation.com/halloween/history-of-halloween/halloween-quiz.html"
  }
});

var QuestionStore = Backbone.Collection.extend({
  model: Question,

  resetAndShuffle: function() {
    this.reset(this.shuffle(), {silent:true});
  }
});

var questionBank = new QuestionStore();
questionBank.add(new Question({}));
questionBank.add(new Question({
  question: "The tradition of dressing up started because:",
  choices: ["We try to scare away evil spirits.", "It's a way to honor the dead.", "When the evil spirits came, they wouldn't recognize you."],
  answer: 1,
  source: "http://quizzes.familyeducation.com/halloween/history-of-halloween/halloween-quiz.html"
}));

questionBank.resetAndShuffle();
var quizz = new QuestionStore(questionBank.slice(0, 10));

quizz.forEach(function(question) {
  console.log(question.cid + " -> " + question.get("question"));
});

var QuestionView = Backbone.View.extend({
//template: _.template($('#question-template').html())
});

var AppView = Backbone.View.extend({
  el: $("#pump-quizz"),

  initialize: function() {
    this.startQuizz();
  },

  startQuizz: function() {
    var template = _.template($('#question-template').html());
    var currentQuestion = quizz.pop();
    $("#pump-quizz").html(template({question: "" + currentQuestion.get("question"), choices:currentQuestion.get("choices")}));
  }
});

var app = new AppView();

if ("WebSocket" in window) {
  ws = new WebSocket("ws://" + document.domain + ":8080/websocket");
  ws.onmessage = function (msg) {
    var message = JSON.parse(msg.data);
    $("p#log").html(message.output);
  };

  ws.onclose = function (evt) {
    if (!evt.wasClean && evt.code == 1006) {
      setTimeout(function () { location.reload(true); }, 5 * 1000);
    } else {
      console.dir(evt);
    }
  };

  // Bind send button to websocket
  var $send = $("button#send");
  var $say = $("input#say");

  $send.on("click", function() {
    ws.send(JSON.stringify({'text': $say.val()}));
  });

  // Cleanly close websocket when unload window
  window.onbeforeunload = function() {
    ws.onclose = function () {}; // disable onclose handler first
    ws.close()
  };
}

});
