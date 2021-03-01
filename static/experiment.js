const SPLICE_SIZE = 50;
const HILL_BUTTON = 72;
const VALLEY_BUTTON = 86;
let pairedImagesPromise;
let canvasCtx;
const WORKER_PRETRIAL = new Worker('static/experiment1ww.js');

const CONSENTFORM = '<p>This MTurk experiment is part of a research project at McGill University in Montreal, Canada. The research examines how well people can judge the shape of surfaces that are rendered with computer graphics. The researchers are Silan He and Prof. Michael Langer in the School of Computer Science. The study is funded by the Natural Science and Engineering Research Council of Canada (NSERC).</p><p>The experiment will take less than 10 minutes, including a practice phase at the start. You will be shown a sequence of 160 rendered images and you will have to make a quick judgment about the surface shown in each image, by pressing one of two keys on your keyboard. If you do not answer within 2 seconds, we will provide a random guess answer for you and move on to the next image.</p><p>You will be paid 1 USD for this work. To receive this payment, you must answer correctly on at least 55% of the examples (score 88 or better out of 160). We also require that your answers and the correct MTurk ID are successfully posted at the end of the experiment.</p><p>Since MTurk terms of use do not allow us to collect your name, your responses are anonymous.</p><p>By submitting your responses to this task, you are consenting to be in this research study.</p><p>If you have questions, you may contact Prof. Langer by email at langer@cim.mcgill.ca. If you have any ethical concerns and wish to speak with someone not on the research team, please contact the McGill Ethics Manager at lynda.mcneil@mcgill.ca.</p>';

function createDisplayText() {
  const d = document.createElement('div');
  d.className = 'display_text';
  document.body.appendChild(d);
  return d;
}

function createH3(element = document.body, text) {
  const h = document.createElement('h3');
  const t = document.createTextNode(text);
  h.appendChild(t);
  element.appendChild(h);
}

function createH1(element = document.body, text) {
  const h = document.createElement('h1');
  const t = document.createTextNode(text);
  h.appendChild(t);
  element.appendChild(h);
}

function createButton(element = document.body, text, trigger_function) {
  const b = document.createElement('BUTTON');
  const t = document.createTextNode(text);
  b.appendChild(t);
  b.onclick = function () { trigger_function(); };
  element.appendChild(b);
}

function createLoadingWheel(element = document.body) {
  const spinner = document.createElement('div');
  spinner.className = 'loader';
  const t = document.createTextNode('Loading...');
  spinner.appendChild(t);
  element.appendChild(spinner);
}

function clearDocumentBody() {
  while (document.body.firstChild) {
    document.body.removeChild(document.body.firstChild);
  }
}

function EnableDisable(id) {
  // Reference the Button.
  const btnSubmit = document.getElementById('jspsych-survey-html-form-next');

  // Verify the TextBox value.
  if (id.value.trim() !== '') {
    // Enable the TextBox when TextBox has value.
    btnSubmit.disabled = false;
  } else {
    // Disable the TextBox when TextBox is empty.
    btnSubmit.disabled = true;
  }
}

function getScore(data) {
  let total = 0;
  let correct = 0;
  for (let i = 0; i < data.length; i += 1) {
    if (data[i].trial_type === 'my-canvas-keyboard-response') {
      const filenameList = data[i].filename.split('_');

      if (filenameList[filenameList.length - 1] === '2') {
        if ((filenameList[2] === 'Hill'
        && data[i].key_press === HILL_BUTTON)
        || (filenameList[2] === 'Valley'
        && data[i].key_press === VALLEY_BUTTON)) {
          correct += 1;
        }
        total += 1;
      }
    }
  }
  return (correct / total) * 100;
}

const pretest = {
  type: 'my-canvas-keyboard-response',
  stimulus_name: jsPsych.timelineVariable('stimulus1_name'),
  stimulus: jsPsych.timelineVariable('stimulus'),
  stimulus_height: screen.height,
  choices: ['v', 'h'],
  trial_duration: 350,
  is_pretest: true,
};

const test = {
  type: 'my-canvas-keyboard-response',
  stimulus_name: jsPsych.timelineVariable('stimulus2_name'),
  stimulus: jsPsych.timelineVariable('stimulus'),
  stimulus_height: screen.height,
  choices: ['v', 'h'],
  trial_duration: 3150,
  is_pretest: false,
};

function experiment(data) {
  /* create timeline */
  const timeline = [];

  const consent = {
    type: 'my-html-button-response',
    stimulus: CONSENTFORM,
    choices: ['OK, I consent.'],
  };
  timeline.push(consent);

  /* define identification message trial */
  const identification = {
    type: 'html-submit-form',
    preamble: '<br><p> What is your <b>Mechanical Turk ID?</b>. Please ensure you have entered the correct ID or we will not be able to pay you.</p>',
    html: '<p> My MTurk ID is <input name="id" type="text" onkeyup="EnableDisable(this)"/>.</p>',
  };
  timeline.push(identification);

  timeline.push({
    type: 'fullscreen',
    fullscreen_mode: true,
  });

  /* define welcome message trial */
  const welcome = {
    type: 'html-keyboard-response',
    stimulus: '<div class="display_text">'
    + "<p>Welcome to the ACTUAL visual perception experiment.</p><p>Put your fingers on the 'v' and 'h' keys.</p><p>Press 'v' or 'h' to continue.</p>"
    + '</div>',
  };
  timeline.push(welcome);

  let pushPauseMessage = false;

  const numSetsImages = Math.ceil(data.length / SPLICE_SIZE);
  let setNum = 0;
  while (data.length > 0) {
    if (pushPauseMessage) {
      // add pause message only if not first set of images
      const breakInstructions = {
        type: 'html-keyboard-response',
        stimulus: `${'<div class="display_text">'
            + '<p>You have finished '}${setNum}/${numSetsImages} set of images! Stay on this page to take a break.`
            + '<p>Place your fingers on the \'v\' and \'h\' key. Press \'v\' or \'h\' to continue.</p>'
            + '</div>',
        choices: ['h', 'v'],
        post_trial_gap: 500,
      };
      timeline.push(breakInstructions);
    } else {
      pushPauseMessage = true;
    }

    const splicedStimuli = data.splice(0, SPLICE_SIZE);

    const testProcedure = {
      timeline: [pretest, test],
      timeline_variables: splicedStimuli,
    };
    timeline.push(testProcedure);
    setNum += 1;
  }

  // exit fullscreen mode
  timeline.push({
    type: 'fullscreen',
    fullscreen_mode: false,
  });

  /* start the experiment */
  jsPsych.init({
    timeline,
    min_width: 1920,
    min_height: 1200,
    on_finish() {
      createLoadingWheel(document.body);
      createH1(document.body, 'Please do not close browser window yet, wait for submission confirmation message.');
      createH1(document.body, 'This may take a few minutes.');

      const allData = JSON.parse(jsPsych.data.get().json());
      const interactionData = JSON.parse(jsPsych.data.getInteractionData().json());

      // publish data to dynamodb
      const experimentData = {};
      // id page is the second of the experiment now
      experimentData.id = JSON.parse(allData[1].responses).id;
      experimentData.data = {};
      experimentData.data.all_data = allData;
      experimentData.data.interaction_data = interactionData;
      experimentData.data = JSON.stringify(experimentData.data);

      $.post('/submitexperiment', experimentData).then(
        (data2) => {
          clearDocumentBody();
          createH1(document.body, 'Success! Your experiment data has been successfully submitted.');
          // calculate score
          const score = Math.round(getScore(allData));
          createH3(document.body, `You scored ${score}%! You may now close this browser window.`);
        },
        (error2) => {
          createH1(document.body, "Well this is embarrassing. It looks like we're having trouble submitting your experiment data.");
        },
      );
    },
  });
}

function loadingScreen() {
  clearDocumentBody();
  createH1(document.body, 'Loading the experiment. This may take a few minutes... Thank you for your patience.');
  createLoadingWheel(document.body);
  createH3(document.body, 'Thank you for taking the time to participate in this experiment!');

  pairedImagesPromise.then((data) => {
    experiment(data);
  });
}

function tutorial(gammaRed, gammaGreen, gammaBlue) {
  const staticPath = 'static/images/tutorial/';
  const ergonomicsImage = `${staticPath}ergonomics.jpg`;
  const valleyHillImage = `${staticPath}valleyhill.jpg`;
  const trialImages = [
    `${staticPath}DirectionalLightTest_Seed6012Hill_Matte_45_100_1.jpg`,
    `${staticPath}DirectionalLightTest_Seed6012Hill_Matte_45_100_2.jpg`,
    `${staticPath}DirectionalLightTest_Seed6065Valley_Glossy_30_60_1.jpg`,
    `${staticPath}DirectionalLightTest_Seed6065Valley_Glossy_30_60_2.jpg`,
    `${staticPath}DirectionalLightTest_Seed2201Hill_Matte_30_20_1.jpg`,
    `${staticPath}DirectionalLightTest_Seed2201Hill_Matte_30_20_2.jpg`,
    `${staticPath}DirectionalLightTest_Seed2241Valley_Glossy_60_120_1.jpg`,
    `${staticPath}DirectionalLightTest_Seed2241Valley_Glossy_60_120_2.jpg`,
    `${staticPath}MathematicaTest_Seed2251Valley_Matte_45_1.jpg`,
    `${staticPath}MathematicaTest_Seed2251Valley_Matte_45_2.jpg`,
    ergonomicsImage,
  ];

  // pair up the images
  const pairedImages = [];
  for (let i = 0; i < trialImages.length - 1; i += 2) {
    pairedImages.push({
      stimulus1_name: 'image1',
      stimulus2_name: 'image2',
      stimulus1: trialImages[i],
      stimulus2: trialImages[i + 1],
    });
  }

  // tutorial
  const timeline = [];
  // enter fullscreen mode
  timeline.push({
    type: 'fullscreen',
    fullscreen_mode: true,
    on_load: () => {
      pairedImagesPromise = generateImageData(gammaRed, gammaGreen, gammaBlue, 2);
    },
  });

  timeline.push({
    type: 'html-keyboard-response',
    stimulus: '<div class="display_text">'
    + '<p>After the tutorial, you will be able to proceed with the ACTUAL experiment.</p>'
    + ' Press any key on the keyboard to begin.'
    + '</div>',
  });

  const ergonomicInstruction = {
    type: 'image-keyboard-response',
    stimulus_name: 'sitting position',
    stimulus: ergonomicsImage,
    prompt: '<p>For this experiment, try to position your monitor at a reasonable height such that </p><p>you do not need to hunch or strain yourself to see the monitor.</p>'
   + '<p>Ideally, position your eyes at around 2 screen widths away from the screen.</p><p>So typically around about <b>1/2 a meter</b> or around <b>1 foot and 7 inches</b> of the screen.</p>'
   + '<p>Once you are comfortable, press any key on the keyboard to continue.</p>'
   + '<br>'
   + '<p>(image credits to Grand Valley State University)</p>',
    stimulus_height: screen.height * 0.6,
  };
  timeline.push(ergonomicInstruction);

  const instruction3 = {
    type: 'image-keyboard-response',
    stimulus_name: 'instruction3',
    stimulus: pairedImages[0].stimulus1,
    prompt: '<p>In this experiment, a large red disk will appear on top of some valleys or hills.</p><p> Focus your attention on it. Press h to continue.</p>',
    stimulus_height: screen.height * 0.8,
    choices: ['h'],
  };
  timeline.push(instruction3);

  const instruction4 = {
    type: 'image-keyboard-response',
    stimulus_name: 'instruction4',
    stimulus: pairedImages[0].stimulus2,
    prompt: '<p>After a few milliseconds (so very fast), a much smaller red sphere will mark a spot beneath the large red circle. Press v to continue.</p>',
    stimulus_height: screen.height * 0.8,
    choices: ['v'],
  };
  timeline.push(instruction4);

  const instructionDefinition = {
    type: 'image-keyboard-response',
    stimulus_name: 'hill and valley',
    stimulus: valleyHillImage,
    prompt: '<p>Illustrated above are cross sections of a valley and a hill (including the small reference circle).</p><p>In this experiment, you will have to identify whether the spot marked by the small red sphere is in a valley or on a hill.</p><p>Press any key to continue.</p>',
  };
  timeline.push(instructionDefinition);

  const instruction5 = {
    type: 'image-keyboard-response',
    stimulus_name: 'instruction4',
    stimulus: pairedImages[1].stimulus1,
    prompt: "<p>Let's try it. Look at the above. Press h to continue.</p>",
    stimulus_height: screen.height * 0.8,
    choices: ['h'],
  };
  timeline.push(instruction5);

  const instruction6 = {
    type: 'image-keyboard-response',
    stimulus_name: 'instruction4',
    stimulus: pairedImages[1].stimulus2,
    prompt: "<p>If you believe the point is located in a VALLEY, press the letter 'v' as quickly as you can.</p><p> Try pressing v now.</p>",
    stimulus_height: screen.height * 0.8,
    choices: ['v'],
  };
  timeline.push(instruction6);

  timeline.push({
    type: 'html-keyboard-response',
    stimulus: '<div class="display_text">'
    + '<p>Nice! You got it. Press any key on the keyboard to continue.'
    + '</div>',
  });

  const instruction7 = {
    type: 'image-keyboard-response',
    stimulus_name: 'instruction4',
    stimulus: pairedImages[0].stimulus2,
    prompt: "<p>However, if you believe the point is located on a HILL, press the letter 'h' as quickly as you can.</p><p> Try it now.</p>",
    stimulus_height: screen.height * 0.8,
    choices: ['h'],
  };
  timeline.push(instruction7);

  timeline.push({
    type: 'html-keyboard-response',
    stimulus: '<div class="display_text">'
    + "<p>Remember press 'v' if you think the small red circle is in a VALLEY.</p>"
    + "<p>'h' if you think the small red circle is on a HILL</p>"
    + "<p>Place your fingers on the 'v' and 'h' key.</p>"
    + '<p>Press the VALLEY button to proceed to a little test run.'
    + '</div>',
    choices: ['v'],
    post_trial_gap: 500,
  });

  const tutorialPreTest = {
    type: 'image-keyboard-response',
    stimulus_name: jsPsych.timelineVariable('stimulus1_name'),
    stimulus: jsPsych.timelineVariable('stimulus1'),
    stimulus_height: screen.height * 0.8,
    choices: jsPsych.NO_KEYS,
    trial_duration: 350,
  };

  const tutorialTest = {
    type: 'image-keyboard-response',
    stimulus_name: jsPsych.timelineVariable('stimulus2_name'),
    stimulus: jsPsych.timelineVariable('stimulus2'),
    stimulus_height: screen.height * 0.8,
    choices: ['v', 'h'],
    trial_duration: 3150,
  };

  const trialProcedure = {
    timeline: [tutorialPreTest, tutorialTest],
    timeline_variables: pairedImages,
  };
  timeline.push(trialProcedure);

  const lastinstruction = {
    type: 'html-keyboard-response',
    stimulus: '<div class="display_text">'
    + '<p>The images come pretty quick right? Make sure to stay focused. During the actual run, you will be given multiple breaks since there will be quite a few images to go through.</p>'
    + '<p>Press any key on the keyboard to continue.</p>'
    + '</div>',
  };
  timeline.push(lastinstruction);

  // exit fullscreen mode
  timeline.push({
    type: 'fullscreen',
    fullscreen_mode: false,
  });

  jsPsych.init({
    timeline,
    show_preload_progress_bar: false,
    preload_images: trialImages,
    min_width: 1920,
    min_height: 1200,
    on_finish() {
      // retry tutorial button
      const displayText = createDisplayText();
      createH3(displayText, 'You have finished the TUTORIAL!');
      createH3(displayText, 'Press the RETRY button below if you wish to view the tutorial again.');
      createButton(displayText, 'RETRY', tutorial);

      // start real experiment button
      createH3(displayText, 'Press the PROCEED button below if you have understood the instructions and wish to proceed.');
      createButton(displayText, 'PROCEED', loadingScreen);
    },
  });
}

function generateImageData(gammaRed, gammaGreen, gammaBlue, numSets = 1) {
  const surfaceDataList = getSurfaceDataList( gammaRed, gammaGreen, gammaBlue, numSets);
  const promise = Promise.all(surfaceDataList).then((surfaceDataArray) => {
    // shuffle the s3Images
    function shuffle(array) {
      for (let i = array.length - 1; i > 0; i -= 1) {
        const j = Math.floor(Math.random() * i);
        const temp = array[i];
        array[i] = array[j];
        array[j] = temp;
      }
    }
    // pair up the images
    const pairedImages = [];
    for (let i = 0; i < surfaceDataArray.length; i += 1) {
      pairedImages.push({
        stimulus1_name: getSurfaceInfoString(surfaceDataArray[i], 1),
        stimulus2_name: getSurfaceInfoString(surfaceDataArray[i], 2),
        stimulus: surfaceDataArray[i],
      });
    }

    shuffle(pairedImages);
    return pairedImages;
  });
  return promise;
}

// do gamma correction first
const rangeSliderRed = GammaCorrectionWidget('#FF0000', '#7F0000', 'sliderGroupRed', 'sliderRangeRed',
'demoRed', 'minusRed', 'plusRed');
const rangeSliderGreen = GammaCorrectionWidget('#00FF00', '#007F00', 'sliderGroupGreen', 'sliderRangeGreen',
'demoGreen', 'minusGreen', 'plusGreen');
const rangeSliderBlue = GammaCorrectionWidget('#0000FF', '#00007F', 'sliderGroupBlue', 'sliderRangeBlue',
'demoBlue', 'minusBlue', 'plusBlue');

// on submit start tutorial
const submitGammaCalibrationButton = document.getElementById('submitGammaCalibration');
submitGammaCalibrationButton.onclick = function() {
  const gammaRed = parseFloat(rangeSliderRed.val());
  const gammaGreen = parseFloat(rangeSliderGreen.val());
  const gammaBlue = parseFloat(rangeSliderBlue.val());
  console.log(`${gammaRed}, ${gammaGreen}, ${gammaBlue}`);
  clearDocumentBody();
  tutorial(gammaRed, gammaGreen, gammaBlue);
};
