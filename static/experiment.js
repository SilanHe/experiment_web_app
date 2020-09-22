
$.get('/allexperimentimages').then(
  function(data) {
    var test_stimuli = data.pairedImages;

    /* create timeline */
    var timeline = [];

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
      "Welcome to the experiment. Press any key on the keyboard to begin." +
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
    var instructions = {
      type: "html-keyboard-response",
      stimulus: "<div class=\"display_text\">" +
          "<p>Press the <b style=\"color:blue;\">valley</b> key on the keyboard to begin.</p>" +
          "<\div>",
      choices: ['j'],
      post_trial_gap: 500

    };

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

    var test_procedure = {
      timeline: [pre_test, test],
      timeline_variables: test_stimuli
    }

    timeline.push(test_procedure);

    // exit fullscreen mode
    timeline.push({
      type: 'fullscreen',
      fullscreen_mode: false
    });

    /* start the experiment */
    jsPsych.init({
      timeline: timeline,
      exclusions: {
        min_width: 800,
        min_height: 600
      },
      on_finish: function() {
        jsPsych.data.displayData();
      }
    });
  },
  function(error) {
    console.log("experiment js" + error);
  }
);







