$(function($){

var SoundController = {
  sounds: {},

  init: function() {
    var thisctler = this;
    _.each([
        { name: "background_armel", url:"/static/sounds/background-armel.wav" },
        { name: "evil_laugh", url:"/static/sounds/dark-laugh.wav" },
        { name: "thriller", url:"/static/sounds/thriller.wav" },
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
    //console.log("Playing sound: " + name);
    snd.pause();
    snd.volume = volume || 1;
    snd.currentTime = 0;
    //snd.onended = callbacks.onended || function() {console.log("Finished Playing sound: " + name);};
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
    this.each(function(question) { question.set("choices", _.shuffle(question.get("choices"))); });
    this.reset(this.shuffle(), {silent:true});
  }
});

var themes = [];

var StartScreenView = Backbone.View.extend({
  template: _.template($("#startQuizz-template").html()),

  render: function() {
    var html = this.template();
    this.$el.html(html).hide().slideDown(600);
    return this
  },

  events: {
    "click a#startQuizzButton": "buttonPressed"
  },

  buttonPressed: function() {
    SoundController.play("scary");
    pumpkinQuizzApp.startQuizz();
  }
});

var AnswersView = Backbone.View.extend({
  template: _.template($("#answers-template").html()),

  initialize: function() {
    console.dir(this.model);
  },

  render: function() {
    var html = this.template({ rightAnswers: this.model.countBy(function(q) { return q.get("isRight") ? "right" : "wrong";}), questions: this.model.models});
    this.$el.html(html);
    return this;
  },

  buttonPressed: function() {
    pumpkinQuizzApp.startQuizz();
  }
});

var QuestionView = Backbone.View.extend({
  template: _.template($("#question-template").html()),

  render: function() {
    var html = this.template({
        question: this.model.get("question"),
        choices: this.model.get("choices"),
        theme: themes.pop()
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

    console.dir($('a.choice'));


    var theChoiceEl = $('a.choice')[index];
    console.dir(theChoiceEl);

    $(theChoiceEl).css('color', 'red');

    /*console.log("Button Pressed = " + index);
    _.each(this.model.get("choices"), function(choice, index) {
      console.log(index + " - " + choice.text + " - " + choice.is_answer);
    });*/

    var question = this.model.get("question");
    var choice = this.model.getChoice(index);
    var answer = this.model.getAnswer();

    this.model.set("isRight", choice === answer);
    this.model.set("choice", choice);
    this.model.set("answer", answer);

    if (choice !== answer) {
      SoundController.play("evil_laugh");
    }
    var qModel = this.model;
    pumpkinQuizzApp.nextQuestion(this.model);
  }
});

var questionBank = new QuestionStore();

var AppView = Backbone.View.extend({
  el: $("#pump-quizz"),

  initQuizz: function() {
    var appView = this;
    this.quizz = new QuestionStore(questionBank.slice(0, 10));
    if (this.quizz.size() != 10) {
      window.location.reload(true);
    }
    console.log("Initializing Quizz ("+ this.quizz.length +")");
    questionBank.remove(this.quizz.toArray());
    this.quizzAnswer = new QuestionStore();

    if ("WebSocket" in window) {
      this.ws = new WebSocket("ws://" + document.domain + ":8080/websocket");
      this.ws.onmessage = function (msg) {
        var message = JSON.parse(msg.data);

        var command = appView[message.command];
        if (_.isFunction(command)) {
          command.apply(appView, [message.args]);
        } else {
          console.dir(message);
        }
      };

      this.ws.onclose = function (evt) {
        if (!evt.wasClean && evt.code == 1006) {
          setTimeout(function () { window.location.reload(true); }, 7 * 1000);
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

  },

  initialize: function() {
    var appView = this;
    SoundController.init();

    questionBank.fetch({
      success: function() {
        console.log("QuestionBank fetched!");
        questionBank.resetAndShuffle();
        $.ajax({url : '/static/data/theme.json'}).done(function(data) {
            console.log("Themes fetched!");
            _.each(data, function(img) {
              img.preload = new Image();
              img.preload.src = img.background;
            });
            themes = _.shuffle(data);
            appView.initQuizz();
            appView.replaceView(new StartScreenView({ appViewQuizz:appView }));
        });
      }
    });
  },

  replaceView: function(newView) {
    var theThis = this;
    setTimeout(function() {
      if (theThis.currentView) {
        theThis.currentView.remove();
      }
      theThis.currentView = newView;
      theThis.$el.hide().html(theThis.currentView.render().el).slideDown(800);
    }, 500);
  },

  startQuizz: function() {
    SoundController.play("background_armel").loop = true;
    this.nextQuestion();
  },

  nextQuestion: function(previousQuestion) {
    var theWs = this.ws;
    this.ws.send(JSON.stringify({"command": "DO IT"}));
    /*setInterval(function() {
      this.ws.send(JSON.stringify({"command_nop": "DONT"}));
    }, 500);
    setInterval(function() {
      this.ws.send(JSON.stringify({"command": "DO IT"}));
    }, 1000);
    */
    setTimeout(function() {
      theWs.send(JSON.stringify({"command_nop": "DONT"}));
    }, 1500);
    if (previousQuestion) {
      this.quizzAnswer.add(previousQuestion);
    }

    var nextQuestion = this.quizz.pop();
    if (nextQuestion) {
      $('html').css('background', 'url("'+themes.pop().background+'") black');
      //$('body').css('background-color', 'inherit');
      this.replaceView(new QuestionView({ model: nextQuestion }));
    } else {
      $('html').css('background', '');
      $('body').css('background-color', 'black');
      if (! _.isUndefined(this.count)) {
        this.count = this.count - 5;
      } else {
        this.count = 13;
        $("#timer").html(thecount);
        SoundController.get("background_armel").pause();
        SoundController.play("thriller");
        this.replaceView(new AnswersView({ model: this.quizzAnswer }));
        var thecount = this.count;
        var counter = setInterval(function() {
          thecount=thecount-1;
          $("#timer").html(thecount);
          if (thecount <= 0) {
             window.location.reload(true);
             return;
          }
        }, 1000);
      }
    }
  },

  buttonPressed: function(args) {
    if (this.currentView && this.currentView.buttonPressed && ! _.isUndefined(args.idx)) {
      this.currentView.buttonPressed(args.idx);
    } else {
      console.log("Button press not implemented by current view");
    }
  }

});

var pumpkinQuizzApp = new AppView();

});
