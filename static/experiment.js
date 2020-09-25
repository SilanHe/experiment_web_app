var SPLICE_SIZE = 50;

$.get('/allexperimentimages').then(
  function(data) {
    $("#loadingMessage").hide();

    var test_stimuli = data.pairedImages;

    /* create timeline */
    var timeline = [];

    /* define identification message trial */
    var identification = {
      type: "survey-html-form",
      preamble: '<p> What is your <b>Mechanical Turk ID?</b>. Please ensure you have entered the correct ID or we will not be able to pay you.</p>',
      html: '<p> My MTurk ID is <input name="id" type="text" />.</p>'
    };
    timeline.push(identification);

    timeline.push({
      type: 'fullscreen',
      fullscreen_mode: true
    });

    timeline.push({
      type: 'html-keyboard-response',
      stimulus: "<div class=\"display_text\">" +
      "This trial will be in fullscreen mode. Press any key on the keyboard to begin." +
      "<\div>"
    });

    /* define welcome message trial */
    var welcome = {
      type: "html-keyboard-response",
      stimulus: "<div class=\"display_text\">" +
      "Welcome to the visual perception experiment. Press any key on the keyboard to begin." +
      "<\div>"
    };
    timeline.push(welcome);

    /* define instructions trial */
    var instructions = {
      type: "html-keyboard-response",
      stimulus: "<div class=\"display_text\">" +
          "<p>In this experiment, a large <b style=\"color:red;\">red</b> disk will appear near the center of the screen on top of some hills or valleys.</p>" +
          "<p>Please look at the large <b style=\"color:red;\">red</b> disk. After a few milliseconds, a much smaller red sphere will mark either a hill or a valley.</p>" +
          "<p>If you believe the point is located on a <b style=\"color:red;\">hill</b>, press the letter <b style=\"color:red;\">F</b> on the keyboard as fast as you can.</p>" +
          "<p>If you believe the point is located in a <b style=\"color:blue;\">valley</b>, press the letter <b style=\"color:blue;\">J</b> as fast as you can.</p>" +
          "<p>Press the <b style=\"color:red;\">hill</b> key on the keyboard to begin.</p>" +
          "<\div>",
      choices: ['f'],
      post_trial_gap: 500

    };
    timeline.push(instructions);

    /* define instructions trial */
    var instructionsHill = {
      type: "html-keyboard-response",
      stimulus: "<div class=\"display_text\">" +
          "<p>Press the <b style=\"color:red;\">hill</b> key on the keyboard to begin.</p>" +
          "<\div>",
      choices: ['f'],
      post_trial_gap: 500
    };

    /* define instructions trial */
    var instructionsValley = {
      type: "html-keyboard-response",
      stimulus: "<div class=\"display_text\">" +
          "<p>Press the <b style=\"color:blue;\">valley</b> key on the keyboard to begin.</p>" +
          "<\div>",
      choices: ['j'],
      post_trial_gap: 500

    };
    timeline.push(instructionsValley);

    var pre_test = {
      type: 'image-keyboard-response',
      stimulus_name: jsPsych.timelineVariable('stimulus1_name'),
      stimulus: jsPsych.timelineVariable('stimulus1'),
      stimulus_height: window.innerHeight,
      choices: jsPsych.NO_KEYS,
      trial_duration: 350,
    }

    var test = {
      type: "image-keyboard-response",
      stimulus_name: jsPsych.timelineVariable('stimulus2_name'),
      stimulus: jsPsych.timelineVariable('stimulus2'),
      stimulus_height: window.innerHeight,
      choices: ['f', 'j'],
      trial_duration: 3150,
    }

    let pushPauseMessage = false;

    while (test_stimuli.length > 0) {
      if (pushPauseMessage) {
        // add pause message only if not first set of images
        var breakInstructions = {
          type: "html-keyboard-response",
          stimulus: "<div class=\"display_text\">" +
              "<p>You have finished the first set of images! Stay on this page to take a break." +
              "<p>Press the <b>space</b> key on the keyboard to resume the experiment.</p>" +
              "<\div>",
          choices: [32],
          post_trial_gap: 500
        };
        timeline.push(breakInstructions);

        timeline.push(instructionsHill);
        timeline.push(instructionsValley);
      } else {
        pushPauseMessage = true;
      }

      let spliced_stimuli = test_stimuli.splice(0, SPLICE_SIZE);

      let test_procedure = {
        timeline: [pre_test, test],
        timeline_variables: spliced_stimuli
      }
      timeline.push(test_procedure);
    }

    // exit fullscreen mode
    timeline.push({
      type: 'fullscreen',
      fullscreen_mode: false
    });

    var exit = {
      type: "html-keyboard-response",
      stimulus: "<div class=\"display_text\">" +
      "You have finished! Press any key on the keyboard to continue." +
      "<\div>",
      trial_duration: 5000
    };
    timeline.push(exit);

    /* start the experiment */
    jsPsych.init({
      timeline: timeline,
      exclusions: {
        min_width: 800,
        min_height: 600
      },
      on_finish: function() {
        let all_data = JSON.parse(jsPsych.data.get().json());
        let interaction_data = JSON.parse(jsPsych.data.getInteractionData().json());
        console.log(all_data);
        console.log(interaction_data);

        // publish data to dynamodb
        let experimentData = new Object();
        experimentData.id = JSON.parse(all_data[0].responses).id;
        experimentData.data = new Object();
        experimentData.data.all_data = all_data;
        experimentData.data.interaction_data = interaction_data;

        console.log(experimentData);

        function createH1(text) {
          var h = document.createElement("h1");
            var t = document.createTextNode(text); 
            h.appendChild(t); 
            document.body.appendChild(h);
        }

        $.post('/submitexperiment',experimentData).then(
          function(data2) {
            createH1("Success! Your experiment data has been successfully submitted. Feel free to close this browser.");
          },
          function(error2) {
            createH1("Well this is embarrassing. It looks like we're having trouble submitting your experiment data.");
          }
          );
      }
    });
  },
  function(error) {
    console.log("experiment js" + error);
  }
);







