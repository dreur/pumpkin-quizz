$(function($){

function playSound() {
  var snd = new Audio("static/sounds/wrong-answer-1.wav"); // buffers automatically when created
  snd.play();
}

var Util = {
  newChoice: function(choice, isAnswer=false) {
    return {text: choice, is_answer: isAnswer};
  }
};

var Question = Backbone.Model.extend({
});

var QuestionStore = Backbone.Collection.extend({
  model: Question,
  url: '/static/data/questionBank.json',

  resetAndShuffle: function() {
    this.reset(this.shuffle(), {silent:true});
  }
});


var QuestionView = Backbone.View.extend({
  template: _.template($('#question-template').html()),

  render: function() {
    var html = this.template({
        question: "" + this.model.get("question"),
        choices: this.model.get("choices")
      });
    this.$el.html(html);
    return this;
  },

  events: {
    'click div.choice a': 'answer'
  },

  answer: function(e) {
    if ($(e.currentTarget).hasClass('answer')) {
      alert("Good");
    } else {
      playSound();
    }
  }
});

var AppView = Backbone.View.extend({
  el: $("#pump-quizz"),

  initialize: function() {
    this.quizz = new QuestionStore(questionBank.slice(0, 10));
    questionBank.remove(this.quizz.toArray());

    console.log("Initializing Quizz");
    console.dir(this.quizz);

    this.startQuizz();
  },

  startQuizz: function() {
    var view = new QuestionView({ model: this.quizz.pop() });
    this.$el.html(view.render().el);
  }
});
var questionBank = new QuestionStore();
questionBank.fetch({success: function() {
  questionBank.resetAndShuffle();
  window.pumpkinQuizzApp = new AppView();
  }
});


if ("WebSocket" in window) {
  ws = new WebSocket("ws://" + document.domain + ":8080/websocket");
  ws.onmessage = function (msg) {
    window.pumpkinQuizzApp = 0;
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
    console.log(questionBank.length);
questionBank.forEach(function(question) {
  console.log(question.cid + " -> " +question.id + question.get("question"));
});
    ws.send(JSON.stringify({'text': $say.val()}));
  });

  // Cleanly close websocket when unload window
  window.onbeforeunload = function() {
    ws.onclose = function () {}; // disable onclose handler first
    ws.close()
  };
}

});
