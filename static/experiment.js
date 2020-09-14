/* get filenames for all our stimulus ahead of time */
var data = getExperimentSet1ObjectList(s3);

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
      "<p>In this experiment, a red sphere will appear near the center of the screen on top of some hills and valleys.</p>" +
      "<p>If you believe the point is located on a hill, press the letter F on the keyboard as fast as you can.</p>" +
      "<p>If you believe the point is located in a valley, press the letter J as fast as you can.</p>" +
      "<p>Press any key on the keyboard to begin.</p>" +
      "<\div>",
  post_trial_gap: 2000

};
timeline.push(instructions);

var fixation = {
  type: 'html-keyboard-response',
  stimulus: '<div class=\"display_text\" style="font-size:60px;">+</div>',
  choices: jsPsych.NO_KEYS,
  trial_duration: 1000,
}

var pre_test = {
  type: 'image-keyboard-response',
  stimulus_name: jsPsych.timelineVariable('stimulus1_name'),
  stimulus: jsPsych.timelineVariable('stimulus1'),
  choices: jsPsych.NO_KEYS,
  trial_duration: 350,
}

var test = {
  type: "image-keyboard-response",
  stimulus_name: jsPsych.timelineVariable('stimulus2_name'),
  stimulus: jsPsych.timelineVariable('stimulus2'),
  choices: ['f', 'j'],
  trial_duration: 3150,
}

var test_procedure = {
  timeline: [fixation, pre_test, test],
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
  on_finish: function() {
    jsPsych.data.displayData();
  }
});
