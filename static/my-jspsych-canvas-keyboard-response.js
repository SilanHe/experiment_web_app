/**
 * jspsych-image-keyboard-response
 * Josh de Leeuw
 *
 * plugin for displaying a stimulus and getting a keyboard response
 *
 * documentation: docs.jspsych.org
 *
 * */

jsPsych.plugins['my-canvas-keyboard-response'] = (function () {
  const plugin = {};

  jsPsych.pluginAPI.registerPreload('my-canvas-keyboard-response', 'stimulus', 'image');

  plugin.info = {
    name: 'my-canvas-keyboard-response',
    description: '',
    parameters: {
      stimulus_name: {
        type: jsPsych.plugins.parameterType.STRING,
        pretty_name: 'Stimulus Name',
        default: undefined,
        description: 'The name of the image to be displayed',
      },
      stimulus: {
        type: jsPsych.plugins.parameterType.OBJECT,
        pretty_name: 'Stimulus',
        default: undefined,
        description: 'The image to be rendered',
      },
      is_pretest: {
        type: jsPsych.plugins.parameterType.BOOL,
        pretty_name: 'Is the PreTest',
        default: true,
        description: 'If true, this is the image with the large disk. If not, this image should contain the small pip',
      },
      choices: {
        type: jsPsych.plugins.parameterType.KEYCODE,
        array: true,
        pretty_name: 'Choices',
        default: jsPsych.ALL_KEYS,
        description: 'The keys the subject is allowed to press to respond to the stimulus.',
      },
      stimulus_duration: {
        type: jsPsych.plugins.parameterType.INT,
        pretty_name: 'Stimulus duration',
        default: null,
        description: 'How long to hide the stimulus.',
      },
      trial_duration: {
        type: jsPsych.plugins.parameterType.INT,
        pretty_name: 'Trial duration',
        default: null,
        description: 'How long to show trial before it ends.',
      },
      response_ends_trial: {
        type: jsPsych.plugins.parameterType.BOOL,
        pretty_name: 'Response ends trial',
        default: true,
        description: 'If true, trial will end when subject makes a response.',
      },
    },
  };

  plugin.trial = function (display_element, trial) {
    // const t0 = performance.now();
    RenderImage(trial.stimulus, trial.is_pretest);
    display_element.appendChild(RENDERERCANVAS);
    // const t1 = performance.now();
    // console.log("Call to render took " + (t1 - t0) + " milliseconds.");

    // store response
    let response = {
      rt: null,
      key: null,
    };

    // function to rotate stuff back to their original positions
    const resetObjects = function () {
      if (!trial.stimulus.is_pretest) {
        ResetRenderImage(trial.stimulus);
      }
    };

    // function to end trial when it is time
    const end_trial = function () {
      // kill any remaining setTimeout handlers
      jsPsych.pluginAPI.clearAllTimeouts();

      // kill keyboard listeners
      if (typeof keyboardListener !== 'undefined') {
        jsPsych.pluginAPI.cancelKeyboardResponse(keyboardListener);
      }

      // gather the data to store for the trial
      const trial_data = {
        rt: response.rt,
        filename: trial.stimulus_name,
        key_press: response.key,
      };

      // clear the display
      display_element.removeChild(RENDERERCANVAS);
      display_element.innerHTML = '';

      resetObjects();

      // move on to the next trial
      jsPsych.finishTrial(trial_data);
    };

    // function to handle responses by the subject
    const after_response = function (info) {
      // after a valid response, the stimulus will have the CSS class 'responded'
      // which can be used to provide visual feedback that a response was recorded
      display_element.querySelector('#jspsych-canvas-keyboard-response-stimulus').className += ' responded';

      // only record the first response
      if (response.key == null) {
        response = info;
      }

      if (trial.response_ends_trial) {
        end_trial();
      }
    };

    // start the response listener
    if (trial.choices != jsPsych.NO_KEYS) {
      var keyboardListener = jsPsych.pluginAPI.getKeyboardResponse({
        callback_function: after_response,
        valid_responses: trial.choices,
        rt_method: 'performance',
        persist: false,
        allow_held_key: false,
      });
    }

    // hide stimulus if stimulus_duration is set
    if (trial.stimulus_duration !== null) {
      jsPsych.pluginAPI.setTimeout(() => {
        display_element.querySelector('#jspsych-canvas-keyboard-response-stimulus').style.visibility = 'hidden';
      }, trial.stimulus_duration);
    }

    // end trial if trial_duration is set
    if (trial.trial_duration !== null) {
      jsPsych.pluginAPI.setTimeout(() => {
        end_trial();
      }, trial.trial_duration);
    }
  };

  return plugin;
}());
