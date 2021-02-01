/**
 * jspsych-image-keyboard-response
 * Josh de Leeuw
 *
 * plugin for displaying a stimulus and getting a keyboard response
 *
 * documentation: docs.jspsych.org
 *
 * */

jsPsych.plugins['my-trial-keyboard-response'] = (function () {
  const plugin = {};

  jsPsych.pluginAPI.registerPreload('my-trial-keyboard-response', 'stimulus', 'image');

  plugin.info = {
    name: 'my-trial-keyboard-response',
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
      pretrial_duration: {
        type: jsPsych.plugins.parameterType.INT,
        pretty_name: 'Pre-trial duration',
        default: null,
        description: 'How long to show pretrial before it ends.',
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
    let redIndex;
    let imageData;
    function WorkerPreTrialListener(event) {
      [redIndex, imageData] = event.data;
      DrawBigDisk(CLONECONTEXT, redIndex);
      display_element.append(CLONECANVAS);
    }
    CLONECANVAS.id = 'jspsych-canvas-keyboard-response-stimulus';
    RenderImage(trial.stimulus);
    cloneCanvas(RENDERERCANVAS);
    const threeImageData = CLONECONTEXT.getImageData(0, 0,CLONECONTEXT.canvas.width,
      CLONECONTEXT.canvas.height);
    const oldImageData = Uint8ClampedArray.from(threeImageData.data);
    WORKER_PRETRIAL.postMessage([oldImageData,
      trial.stimulus.gammaRed, trial.stimulus.gammaGreen, 
      trial.stimulus.gammaBlue, CLONECONTEXT.canvas.width]);
    WORKER_PRETRIAL.addEventListener("message", WorkerPreTrialListener);

    // store response
    let response = {
      rt: null,
      key: null,
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
      display_element.innerHTML = '';

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

    // start the response listener after pretrial
    if (trial.choices !== jsPsych.NO_KEYS) {
      jsPsych.pluginAPI.setTimeout(() => {
        var keyboardListener = jsPsych.pluginAPI.getKeyboardResponse({
          callback_function: after_response,
          valid_responses: trial.choices,
          rt_method: 'performance',
          persist: false,
          allow_held_key: false,
        });
      }, trial.pretrial_duration);
    }

    // rerender image after pre trial with smaller pip
    jsPsych.pluginAPI.setTimeout(() => {
      WORKER_PRETRIAL.removeEventListener("message", WorkerPreTrialListener);
      CLONECONTEXT.putImageData(imageData, 0, 0);
    }, trial.pretrial_duration);

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
