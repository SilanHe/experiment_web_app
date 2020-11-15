const SPLICE_SIZE = 50;

function createH3(text) {
  const h = document.createElement('h3');
  const t = document.createTextNode(text);
  h.appendChild(t);
  document.body.appendChild(h);
}

function createH1(text) {
  const h = document.createElement('h1');
  const t = document.createTextNode(text);
  h.appendChild(t);
  document.body.appendChild(h);
}

function createButton(text, trigger_function) {
  const b = document.createElement('BUTTON');
  const t = document.createTextNode(text);
  b.appendChild(t);
  b.onclick = function () { trigger_function(); };
  document.body.appendChild(b);
}

function createLoadingWheel() {
  const spinner = document.createElement('div');
  spinner.className = 'loader';
  const t = document.createTextNode('Loading...');
  spinner.appendChild(t);
  document.body.appendChild(spinner);
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

const pre_test = {
  type: 'my-canvas-keyboard-response',
  stimulus_name: jsPsych.timelineVariable('stimulus1_name'),
  stimulus: jsPsych.timelineVariable('stimulus'),
  is_pretest: true,
  stimulus_height: screen.height,
  choices: jsPsych.NO_KEYS,
  trial_duration: 350,
};

const test = {
  type: 'my-canvas-keyboard-response',
  stimulus_name: jsPsych.timelineVariable('stimulus2_name'),
  stimulus: jsPsych.timelineVariable('stimulus'),
  is_pretest: false,
  stimulus_height: screen.height,
  choices: ['v', 'h'],
  trial_duration: 3150,
};

function tutorial() {
  const static_path = 'static/images/tutorial/';
  const ergonomicsImage = `${static_path}ergonomics.jpg`;
  const trialImages = [
    `${static_path}DirectionalLightTest_Seed6012Hill_Matte_45_100_1.jpg`,
    `${static_path}DirectionalLightTest_Seed6012Hill_Matte_45_100_2.jpg`,
    `${static_path}DirectionalLightTest_Seed6065Valley_Glossy_30_60_1.jpg`,
    `${static_path}DirectionalLightTest_Seed6065Valley_Glossy_30_60_2.jpg`,
    `${static_path}DirectionalLightTest_Seed2201Hill_Matte_30_20_1.jpg`,
    `${static_path}DirectionalLightTest_Seed2201Hill_Matte_30_20_2.jpg`,
    `${static_path}DirectionalLightTest_Seed2241Valley_Glossy_60_120_1.jpg`,
    `${static_path}DirectionalLightTest_Seed2241Valley_Glossy_60_120_2.jpg`,
    `${static_path}MathematicaTest_Seed2251Valley_Matte_45_1.jpg`,
    `${static_path}MathematicaTest_Seed2251Valley_Matte_45_2.jpg`,
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
  });

  timeline.push({
    type: 'html-keyboard-response',
    stimulus: '<div class="display_text">'
    + '<p>This TUTORIAL trial will be in fullscreen mode. After the tutorial, you will be able to proceed with the ACTUAL experiment.</p>'
    + ' Press any key on the keyboard to begin.'
    + '<\div>',
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

  const instruction1 = {
    type: 'image-keyboard-response',
    stimulus_name: 'instruction1',
    stimulus: pairedImages[0].stimulus1,
    prompt: '<p>In this experiment, you will be shown images of surfaces like the above.</p> <p> Notice there is a large red circle. Press h to continue.</p>',
    stimulus_height: screen.height * 0.8,
    choices: ['h'],
  };
  timeline.push(instruction1);

  const instruction2 = {
    type: 'image-keyboard-response',
    stimulus_name: 'instruction2',
    stimulus: pairedImages[0].stimulus2,
    prompt: '<p>In this experiment, you will be shown images of surfaces like the above.</p><p> Notice there is a small red circle where the large red circle was. Press v to continue.</p>',
    stimulus_height: screen.height * 0.8,
    choices: ['v'],
  };
  timeline.push(instruction2);

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

  const instruction41 = {
    type: 'image-keyboard-response',
    stimulus_name: 'instruction4',
    stimulus: pairedImages[1].stimulus1,
    prompt: "<p>Let's try it. Look at the above. Press h to continue.</p>",
    stimulus_height: screen.height * 0.8,
    choices: ['h'],
  };
  timeline.push(instruction41);

  const instruction5 = {
    type: 'image-keyboard-response',
    stimulus_name: 'instruction4',
    stimulus: pairedImages[1].stimulus2,
    prompt: '<p>You will now have to make a choice. Press v to continue.</p>',
    stimulus_height: screen.height * 0.8,
    choices: ['v'],
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
    + '<\div>',
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
    + "<p>Nice! Remember press 'v' if you think the small red circle is in a VALLEY.</p>"
    + "<p>'h' if you think the small red circle is on a HILL</p>"
    + "<p>Place your fingers on the 'v' and 'h' key.</p>"
    + '<p>Press the VALLEY button to proceed to a little test run.'
    + '<\div>',
    choices: ['v'],
    post_trial_gap: 500,
  });

  const tutorial_pre_test = {
    type: 'image-keyboard-response',
    stimulus_name: jsPsych.timelineVariable('stimulus1_name'),
    stimulus: jsPsych.timelineVariable('stimulus1'),
    stimulus_height: screen.height * 0.8,
    choices: jsPsych.NO_KEYS,
    trial_duration: 350,
  };

  const tutorial_test = {
    type: 'image-keyboard-response',
    stimulus_name: jsPsych.timelineVariable('stimulus2_name'),
    stimulus: jsPsych.timelineVariable('stimulus2'),
    stimulus_height: screen.height * 0.8,
    choices: ['v', 'h'],
    trial_duration: 3150,
  };

  const trial_procedure = {
    timeline: [tutorial_pre_test, tutorial_test],
    timeline_variables: pairedImages,
  };
  timeline.push(trial_procedure);

  const lastinstruction = {
    type: 'html-keyboard-response',
    stimulus: '<div class="display_text">'
    + '<p>The images come pretty quick right? Make sure to stay focused. During the actual run, you will be given multiple breaks since there will be quite a few images to go through.</p>'
    + '<p>Press any key on the keyboard to continue.</p>'
    + '<\div>',
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
    on_finish() {
      // retry tutorial button
      createH3('You have finished the TUTORIAL!');
      createH3('Press the RETRY button below if you wish to view the tutorial again.');
      createButton('RETRY', tutorial);

      // start real experiment button
      createH3('Press the PROCEED button below if you have understood the instructions and wish to proceed with the actual experiment.');
      createButton('PROCEED', loadingScreen);
    },
  });
}

function generateImageData() {
  const [surfaceDataList, testDataList] = getSurfaceDataList();
  const pairedImagesPromise = Promise.all(surfaceDataList).then((surfaceDataArray) => {
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
    for (let i = 0; i < testDataList.length; i += 1) {
      testDataList[i].surfaceData = surfaceDataArray[i];
      pairedImages.push({
        stimulus1_name: getSurfaceInfoString(testDataList[i], 1),
        stimulus2_name: getSurfaceInfoString(testDataList[i], 2),
        stimulus: testDataList[i],
      });
    }

    shuffle(pairedImages);
    return pairedImages;
  });
  return pairedImagesPromise;
}

function experiment(data) {
  const test_stimuli = data;

  /* create timeline */
  const timeline = [];

  const consent = {
    type: 'html-button-response',
    stimulus: '<div class="display_text">'
    + '<p>By submitting your responses to this task, you are consenting to be in this research study as described before.</p>'
    + '<br>'
    + '<p>If you decide at any time to withdraw from the study before the data is submitted, you may do so without any negative consequences.</p>'
    + '<p>Simply close the experiment browser window. Your data will not be submitted until you reach the end of the experiment.</p>'
    + '<p>Once the data is submitted, it cannot be withdrawn.</p>'
    + '<\div>',
    choices: ['OK, I understand.'],
  };
  timeline.push(consent);

  /* define identification message trial */
  const identification = {
    type: 'html-submit-form',
    preamble: '<br><p> What is your <b>Mechanical Turk ID?</b>. Please ensure you have entered the correct ID or we will not be able to pay you.</p>',
    html: '<p> My MTurk ID is <input name="id" type="text" onkeyup="EnableDisable(this)"/>.</p>',
  };
  timeline.push(identification);

  const payme = {
    type: 'html-button-response',
    stimulus: '<div class="display_text">'
    + '<br>'
    + '<p>In ordered to get payed, you must complete the experiment truthfully and to the best of your ability.</p>'
    + '<p>We will be screening the data before approving payment.</p>'
    + '<\div>',
    choices: ['OK, I understand.'],
  };
  timeline.push(payme);

  timeline.push({
    type: 'fullscreen',
    fullscreen_mode: true,
  });

  timeline.push({
    type: 'html-keyboard-response',
    stimulus: '<div class="display_text">'
    + 'This trial will be in fullscreen mode. Press any key on the keyboard to begin.'
    + '<\div>',
  });

  /* define welcome message trial */
  const welcome = {
    type: 'html-keyboard-response',
    stimulus: '<div class="display_text">'
    + "<p>Welcome to the ACTUAL visual perception experiment.</p><p>Put your fingers on the 'v' and 'h' keys.</p><p>Press 'v' or 'h' to continue.</p>"
    + '<\div>',
  };
  timeline.push(welcome);

  let pushPauseMessage = false;

  const numSetsImages = Math.ceil(test_stimuli.length / SPLICE_SIZE);
  let setNum = 0;
  while (test_stimuli.length > 0) {
    if (pushPauseMessage) {
      // add pause message only if not first set of images
      const breakInstructions = {
        type: 'html-keyboard-response',
        stimulus: `${'<div class="display_text">'
            + '<p>You have finished '}${setNum}/${numSetsImages} set of images! Stay on this page to take a break.`
            + '<p>Place your fingers on the \'v\' and \'h\' key. Press \'v\' or \'h\' to continue.</p>'
            + '<\div>',
        choices: ['h', 'v'],
        post_trial_gap: 500,
      };
      timeline.push(breakInstructions);
    } else {
      pushPauseMessage = true;
    }

    const spliced_stimuli = test_stimuli.splice(0, SPLICE_SIZE);

    const test_procedure = {
      timeline: [pre_test, test],
      timeline_variables: spliced_stimuli,
    };
    timeline.push(test_procedure);
    setNum++;
  }

  // exit fullscreen mode
  timeline.push({
    type: 'fullscreen',
    fullscreen_mode: false,
  });

  /* start the experiment */
  jsPsych.init({
    timeline,
    on_finish() {
      const all_data = JSON.parse(jsPsych.data.get().json());
      const interaction_data = JSON.parse(jsPsych.data.getInteractionData().json());

      // publish data to dynamodb
      const experimentData = new Object();
      experimentData.id = JSON.parse(all_data[1].responses).id; // id page is the second of the experiment now
      experimentData.data = new Object();
      experimentData.data.all_data = all_data;
      experimentData.data.interaction_data = interaction_data;
      experimentData.data = JSON.stringify(experimentData.data);

      function createH1(text) {
        const h = document.createElement('h1');
        const t = document.createTextNode(text);
        h.appendChild(t);
        document.body.appendChild(h);
      }

      $.post('/submitexperiment', experimentData).then(
        (data2) => {
          createH1('Success! Your experiment data has been successfully submitted. Feel free to close this browser.');
        },
        (error2) => {
          createH1("Well this is embarrassing. It looks like we're having trouble submitting your experiment data.");
        },
      );
    },
  });
}

function loadingScreen() {
  clearDocumentBody();
  createH1('Loading the experiment. This may take a few minutes... Thank you for your patience.');
  createLoadingWheel();
  createH3('Hello and thank you for taking the time to participate in this experiment!');
  createH3('The data collected will be used to help complete my Masters thesis in Computer Science.');
  createH3('You must complete this next section in order to get paid.');

  pairedImagesPromise.then((data) => {
      experiment(data);
  });
}

var pairedImagesPromise;
tutorial();
pairedImagesPromise = generateImageData();
