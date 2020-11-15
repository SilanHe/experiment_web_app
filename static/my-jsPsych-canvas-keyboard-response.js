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
    const disk = (() => {
      if (trial.is_pretest) {
        return DISK;
      }
      return PIP;
    })();

    // set our mesh geometry
    // change positions
    const stimulusData = trial.stimulus.surfaceData;
    setMeshGeometryVerticesIndices(stimulusData.vertices, INDICES);
    // change material
    if (trial.stimulus.material === MATERIALS.MATTE) {
      setMeshMaterial(MATTEMATERIAL);
      MATTEMATERIAL.needsUpdate = true;
    } else {
      setMeshMaterial(GLOSSYMATERIAL);
      GLOSSYMATERIAL.needsUpdate = true;
    }
    // rotate
    MESH.rotateX(-THREE.Math.degToRad(trial.stimulus.surfaceSlant));
    MESH.geometry.computeVertexNormals();
    MESH.updateMatrixWorld();
    // set disk locations
    const x = stimulusData.vertices[stimulusData.extremaIndex];
    const y = stimulusData.vertices[stimulusData.extremaIndex + 1];
    const z = stimulusData.vertices[stimulusData.extremaIndex + 2];
    const diskLocation = new THREE.Vector3(x, y, z);
    MESH.localToWorld(diskLocation);

    if (trial.is_pretest === true) {
      // disk position
      DISK.position.set(diskLocation.x, diskLocation.y, diskLocation.z + DISKS_DISTANCES.DISK);
      DISK.updateMatrix();
    } else {
      // pip position
      PIP.position.set(diskLocation.x, diskLocation.y, diskLocation.z + DISKS_DISTANCES.PIP);
      PIP.updateMatrix();
    }

    // make the light in question visible
    if (trial.stimulus.light === LIGHTS.MATLAB) {
      MATLABLIGHT.visible = true;
    } else if (trial.stimulus.light === LIGHTS.MATHEMATICA) {
      setMathematicaLightsVisibility(true);
    } else {
      // directional
      DIRECTIONALLIGHTS.map.get(trial.stimulus.surfaceSlant)
        .get(trial.stimulus.lightSlant)
        .visible = true;
    }

    disk.visible = true;
    RENDERER.render(SCENE, CAMERA);
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
      disk.visible = false;
      if (trial.stimulus.is_pretest !== false) {
        // reset mesh rotation
        resetObject(MESH);
        resetObject(DISK);
        resetObject(PIP);

        // make the light in question non visible
        if (trial.stimulus.light === LIGHTS.MATLAB) {
          MATLABLIGHT.visible = false;
        } else if (trial.stimulus.light === LIGHTS.MATHEMATICA) {
          setMathematicaLightsVisibility(false);
        } else {
          // directional
          DIRECTIONALLIGHTS.map.get(trial.stimulus.surfaceSlant)
            .get(trial.stimulus.lightSlant)
            .visible = false;
        }
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
