$(function($){

var SoundController = {
  sounds: {},

  init: function() {
    var thisctler = this;
    _.each([
        { name: "evil_laugh", url:"/static/sounds/dark-laugh.wav" },
        { name: "scary", url:"/static/sounds/scary.wav" }
      ], function(sound) {
        // preloading
        thisctler.sounds[sound.name] = new Audio(sound.url);
      }
    );
  },

  get: function(name) {
    return this.sounds[name];
  },

  play: function(name, volume, callbacks) {
    var snd = this.get(name);
    callbacks = callbacks || {};
    console.log("Playing sound: " + name);
    snd.volume = volume || 1;
    snd.onended = callbacks.onended || function() {console.log("Finished Playing sound: " + name);};
    snd.play();
    return snd;
  }
};

var Question = Backbone.Model.extend({
  getAnswer: function() {
    return _.find(this.get("choices"), function(choice) {return choice.is_answer;}).text;
  },
  getChoice: function(idx) {
    return this.get("choices")[idx].text;
  },
  isAnswer: function(idx) {
    return this.get("choices")[idx].is_answer;
  }
});

var QuestionStore = Backbone.Collection.extend({
  model: Question,
  url: "/static/data/questionBank.json",

  resetAndShuffle: function() {
    this.reset(this.shuffle(), {silent:true});
  }
});

var StartScreenView = Backbone.View.extend({
  template: _.template($("#startQuizz-template").html()),

  render: function() {
    var html = this.template();
    this.$el.html(html);
    return this;
  },

  events: {
    "click a#startQuizzButton": "buttonPressed"
  },

  buttonPressed: function() {
    SoundController.play("scary");
    window.pumpkinQuizzApp.startQuizz();
  }
});

var QuestionView = Backbone.View.extend({
  template: _.template($("#question-template").html()),

  render: function() {
    var html = this.template({
        question: this.model.get("question"),
        choices: this.model.get("choices")
      });
    this.$el.html(html);
    return this;
  },

  events: {
    "click a.choice": "buttonPressed"
  },

  buttonPressed: function(e) {
    var index = 0;
    if (e.currentTarget) {
      var target = $(e.currentTarget);
      index = target.index();
    } else {
      index = e;
    }

    console.log("Button Pressed = " + index);

    var question = this.model.get("question");
    var choice = this.model.getChoice(index);
    var answer = this.model.getAnswer();

    this.model.set("isRight", choice === answer);
    this.model.set("choice", choice);
    this.model.set("answer", answer);

    if (choice === answer) {
      console.log(choice + "==" + answer);
    } else {
      SoundController.play("evil_laugh");
    }
    var qModel = this.model;
    window.pumpkinQuizzApp.nextQuestion({ model: this.model });
  }
});

var AppView = Backbone.View.extend({
  el: $("#pump-quizz"),

  initialize: function() {
    var appView = this;
    SoundController.init();

    this.quizz = new QuestionStore(questionBank.slice(0, 10));
    questionBank.remove(this.quizz.toArray());
    this.quizzAnswer = new QuestionStore();

    if ("WebSocket" in window) {
      this.ws = new WebSocket("ws://" + document.domain + ":8080/websocket");
      this.ws.onmessage = function (msg) {
        console.dir(msg.data);
        var message = JSON.parse(msg.data);

        var command = appView[message.command];
        if (_.isFunction(command)) {
          console.log("The command " + message.command + " is a function!");
          command.apply(appView, [message.args]);
        } else {
          console.dir(message);
        }
      };

      this.ws.onclose = function (evt) {
        if (!evt.wasClean && evt.code == 1006) {
          setTimeout(function () { location.reload(true); }, 7 * 1000);
        } else {
          console.dir(evt);
        }
      };

      //this.ws.send(JSON.stringify({"text": $say.val()}));

      // Cleanly close websocket when unload window
      window.onbeforeunload = function() {
        appView.ws.onclose = function () {}; // disable onclose handler first
        appView.ws.close()
      };
    }

    console.log("Initializing Quizz ("+ this.quizz.length +")");

    var thisAppView = this;
    this.replaceView(new StartScreenView({ appViewQuizz:thisAppView }));
  },

  replaceView: function(newView) {
    if (this.currentView) {
      this.currentView.remove();
    }
    this.currentView = newView;
    this.$el.html(this.currentView.render().el);
  },

  startQuizz: function() {
    this.nextQuestion();
  },

  nextQuestion: function(previousQuestion) {
    if (previousQuestion) {
      this.quizzAnswer.add(previousQuestion);
    }

    var nextQuestion = this.quizz.pop();
    if (nextQuestion) {
      this.replaceView(new QuestionView({ model: nextQuestion }));
    } else {
      alert("Quizz is over!!");
    }
  },

  buttonPressed: function(args) {
    if (this.currentView && this.currentView.buttonPressed && ! _.undefined(args.idx)) {
      this.currentView.buttonPressed(args.idx);
    } else {
      console.log("Button press not implemented by current view");
    }
  }

});

var questionBank = new QuestionStore();
questionBank.fetch({
  success: function() {
    window.console.log("Fetching Questions");
    questionBank.resetAndShuffle();
    window.pumpkinQuizzApp = new AppView();
  }
});

console.log("Done");

});
