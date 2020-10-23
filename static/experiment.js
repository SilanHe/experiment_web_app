var SPLICE_SIZE = 50;
var EXPERIMENT_BUCKET_NAME = "experimentset1";
var TUTORIAL_BUCKET_NAME = "tutorialset1";

function createH3(text) {
  var h = document.createElement("h3");
    var t = document.createTextNode(text); 
    h.appendChild(t); 
    document.body.appendChild(h);
}

function createH1(text) {
  var h = document.createElement("h1");
    var t = document.createTextNode(text); 
    h.appendChild(t); 
    document.body.appendChild(h);
}

function createButton(text, trigger_function) {
  var b = document.createElement("BUTTON");
  var t = document.createTextNode(text); 
  b.appendChild(t);
  b.onclick = function() {trigger_function();}
  document.body.appendChild(b);
}

function createLoadingWheel() {
  var spinner = document.createElement("div");
  spinner.className = "loader";
  var t = document.createTextNode("Loading..."); 
  spinner.appendChild(t);
  document.body.appendChild(spinner);
}

function clearDocumentBody() {
  while(document.body.firstChild) {
    document.body.removeChild(document.body.firstChild);
  }
}

function EnableDisable(id) {
    //Reference the Button.
    var btnSubmit = document.getElementById("jspsych-survey-html-form-next");

    //Verify the TextBox value.
    if (id.value.trim() != "") {
        //Enable the TextBox when TextBox has value.
        btnSubmit.disabled = false;
    } else {
        //Disable the TextBox when TextBox is empty.
        btnSubmit.disabled = true;
    }
};

var pre_test = {
  type: 'my-image-keyboard-response',
  stimulus_name: jsPsych.timelineVariable('stimulus1_name'),
  stimulus: jsPsych.timelineVariable('stimulus1'),
  stimulus_height: screen.height,
  choices: jsPsych.NO_KEYS,
  trial_duration: 350,
}

var test = {
  type: "my-image-keyboard-response",
  stimulus_name: jsPsych.timelineVariable('stimulus2_name'),
  stimulus: jsPsych.timelineVariable('stimulus2'),
  stimulus_height: screen.height,
  choices: ['v', 'h'],
  trial_duration: 3150,
}


function tutorial() {
  var static_path = "static/images/tutorial/";
  var trialImages = [
  static_path + 'DirectionalLightTest_Seed2201Hill_Matte_30_20_1.jpg',
  static_path + 'DirectionalLightTest_Seed2201Hill_Matte_30_20_2.jpg',
  static_path + 'DirectionalLightTest_Seed2241Valley_Glossy_60_120_1.jpg',
  static_path + 'DirectionalLightTest_Seed2241Valley_Glossy_60_120_2.jpg',
  static_path + 'MathematicaTest_Seed2251Valley_Matte_45_1.jpg',
  static_path + 'MathematicaTest_Seed2251Valley_Matte_45_2.jpg',
  ];

  var ergonomicsImage = static_path + 'ergonomics.jpg';

  // pair up the images
  let pairedImages = [];
  for (var i = 0; i < trialImages.length; i += 2) {
      pairedImages.push({
          stimulus1_name: 'image1',
          stimulus2_name: 'image2',
          stimulus1: trialImages[i],
          stimulus2: trialImages[i+1]
      });
  }

  // tutorial
  var timeline = [];
  // enter fullscreen mode
  timeline.push({
    type: 'fullscreen',
    fullscreen_mode: true
  });

  timeline.push({
    type: 'html-keyboard-response',
    stimulus: "<div class=\"display_text\">" +
    "<p>This TUTORIAL trial will be in fullscreen mode. After the tutorial, you will be able to proceed with the ACTUAL experiment.</p>" +
    " Press any key on the keyboard to begin." +
    "<\div>"
  });

  var ergonomicInstruction = {
    type: 'image-keyboard-response',
    stimulus_name: "sitting position",
    stimulus: ergonomicsImage,
    prompt:"<p>For this experiment, try to position your monitor at a reasonable height such that you do not need to hunch or strain yourself to see the monitor.</p>" +
   "<p>Ideally, position your eyes 0.53 m away from the screen. So within about half a meter or within 1 foot and 7 inches of the screen.</p>" +
   "<p>Once you are comfortable, press any key on the keyboard to continue.</p>" + 
   "<br>" +
   "<p>(image credits to Grand Valley State University)</p>",
    stimulus_height: screen.height * 0.8,
  };
  timeline.push(ergonomicInstruction);


  var instruction1 = {
    type: 'image-keyboard-response',
    stimulus_name: "instruction1",
    stimulus: pairedImages[0].stimulus1,
    prompt:"<p>In this experiment, you will be shown images of surfaces like the above. Notice there is a large red circle. Press h to continue.</p>",
    stimulus_height: screen.height * 0.8,
    choices: ['h'],
  };
  timeline.push(instruction1);

  var instruction2 = {
    type: 'image-keyboard-response',
    stimulus_name: "instruction2",
    stimulus: pairedImages[0].stimulus2,
    prompt:"<p>In this experiment, you will be shown images of surfaces like the above. Notice there is a small red circle where the large red circle was. Press v to continue.</p>",
    stimulus_height: screen.height * 0.8,
    choices: ['v'],
  };
  timeline.push(instruction2);

  var instruction3 = {
    type: 'image-keyboard-response',
    stimulus_name: "instruction3",
    stimulus: pairedImages[0].stimulus1,
    prompt:"<p>In this experiment, a large red disk will appear on top of some valleys or hills. Focus your attention on it. Press h to continue.</p>",
    stimulus_height: screen.height * 0.8,
    choices: ['h'],
  };
  timeline.push(instruction3);

  var instruction4 = {
    type: 'image-keyboard-response',
    stimulus_name: "instruction4",
    stimulus: pairedImages[0].stimulus2,
    prompt:"<p>After a few milliseconds (so very fast), a much smaller red sphere will mark a spot beneath the large red circle. Press v to continue.</p>",
    stimulus_height: screen.height * 0.8,
    choices: ['v'],
  };
  timeline.push(instruction4);

  var instruction41 = {
    type: 'image-keyboard-response',
    stimulus_name: "instruction4",
    stimulus: pairedImages[1].stimulus1,
    prompt:"<p>Let's try it. Look at the above. Press q to continue.</p>",
    stimulus_height: screen.height * 0.8,
    choices: ['q'],
  };
  timeline.push(instruction41);

  var instruction5 = {
    type: 'image-keyboard-response',
    stimulus_name: "instruction4",
    stimulus: pairedImages[1].stimulus2,
    prompt:"<p>You will now have to make a choice. Press q to continue.</p>",
    stimulus_height: screen.height * 0.8,
    choices: ['q'],
  };
  timeline.push(instruction5);

  var instruction6 = {
    type: 'image-keyboard-response',
    stimulus_name: "instruction4",
    stimulus: pairedImages[1].stimulus2,
    prompt:"<p>If you believe the point is located in a VALLEY, press the letter 'v' as quickly as you can. Try pressing v now.</p>",
    stimulus_height: screen.height * 0.8,
    choices: ['v'],
  }
  timeline.push(instruction6);

  timeline.push({
    type: 'html-keyboard-response',
    stimulus: "<div class=\"display_text\">" +
    "<p>Nice! You got it. Press any key on the keyboard to continue." +
    "<\div>",
  });

  var instruction7 = {
    type: 'image-keyboard-response',
    stimulus_name: "instruction4",
    stimulus: pairedImages[1].stimulus2,
    prompt:"<p>However, if you believe the point is located on a HILL, press the letter 'h' as quickly as you can. Try it now.</p>",
    stimulus_height: screen.height * 0.8,
    choices: ['h'],
  }
  timeline.push(instruction7);

  timeline.push({
    type: 'html-keyboard-response',
    stimulus: "<div class=\"display_text\">" +
    "<p>Nice! Remember press 'v' if you think the small red circle is in a VALLEY.</p>" +
    "<p>'h' if you think the small red circle is on a HILL</p>" +
    "<p>Press the VALLEY button to proceed to a little test run." +
    "<\div>",
    choices: ['v'],
    post_trial_gap: 750
  });

  var tutorial_pre_test = {
  type: 'image-keyboard-response',
  stimulus_name: jsPsych.timelineVariable('stimulus1_name'),
  stimulus: jsPsych.timelineVariable('stimulus1'),
  stimulus_height:  screen.height * 0.8,
  choices: jsPsych.NO_KEYS,
  trial_duration: 350,
}

  var tutorial_test = {
    type: "image-keyboard-response",
    stimulus_name: jsPsych.timelineVariable('stimulus2_name'),
    stimulus: jsPsych.timelineVariable('stimulus2'),
    stimulus_height: screen.height * 0.8,
    choices: ['v', 'h'],
    trial_duration: 3150,
  }

  let trial_procedure = {
      timeline: [tutorial_pre_test, tutorial_test],
      timeline_variables: pairedImages
    }
  timeline.push(trial_procedure);

  var lastinstruction = {
    type: "html-keyboard-response",
    stimulus: "<div class=\"display_text\">" +
    "<p>The images come pretty quick right? Make sure to stay focused. During the actual run, you will be given multiple breaks since there will be quite a few images to go through.</p>" + 
    "<p>Press any key on the keyboard to continue.</p>" +
    "<\div>",
  };
  timeline.push(lastinstruction);

  // exit fullscreen mode
  timeline.push({
    type: 'fullscreen',
    fullscreen_mode: false
  });

  jsPsych.init({
    timeline: timeline,
    on_finish: function() {
      // retry tutorial button
      createH3("You have finished the TUTORIAL! Press any key on the keyboard to continue.");
      createH3("Press the RETRY button below if you wish to view the tutorial again.");
      createButton("RETRY", tutorial);

      // start real experiment button
      createH3("Press the PROCEED button below if you have understood the instructions and wish to proceed with the actual experiment.");
      createButton("PROCEED", loadingScreen);
    }
  });
}

function downloadExperiment() {
  return $.get('/allexperimentimages').then(function(data) {
    // fetch all images asyncrhonously
    let trialImageRequests = [];
    for (var i = 0; i < data.sortedKeys.length; i++) {
        let params = {
            Bucket: EXPERIMENT_BUCKET_NAME,
            Key: data.sortedKeys[i].Key
        };
        let getObjectPromise = $.get('/getimage',params);
        trialImageRequests.push(getObjectPromise);
    }

    // nested promise then chaining. not sure if this is good practice
    let pairedImagesPromise =  Promise.all(trialImageRequests).then(function(s3Images) {
      // shuffle the s3Images
      function shuffle(array) {
          for (let i = array.length - 1; i > 0; i--) {
              const j = Math.floor(Math.random() * i);
              const temp = array[i];
              array[i] = array[j];
              array[j] = temp;
          }
      }
      // pair up the images
      let pairedImages = [];
      for (var i = 0; i < s3Images.length; i += 2) {
          pairedImages.push({
              stimulus1_name: data.sortedKeys[i].Key,
              stimulus2_name: data.sortedKeys[i+1].Key,
              stimulus1: s3Images[i].s3Object,
              stimulus2: s3Images[i+1].s3Object
          });
      }
      
      shuffle(pairedImages);
      return pairedImages;
    });

    return pairedImagesPromise;
  });
}

function experiment(data) {
  var test_stimuli = data;

  /* create timeline */
  var timeline = [];

  /* define identification message trial */
  var identification = {
    type: "html-submit-form",
    preamble: '<p> What is your <b>Mechanical Turk ID?</b>. Please ensure you have entered the correct ID or we will not be able to pay you.</p>',
    html: '<p> My MTurk ID is <input name="id" type="text" onkeyup="EnableDisable(this)"/>.</p>'
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
    "Welcome to the ACTUAL visual perception experiment. Put your fingers on the 'v' and 'h' keys. Press 'v' or 'h' to continue." +
    "<\div>"
  };
  timeline.push(welcome);

  let pushPauseMessage = false;

  var numSetsImages = Math.ceil(test_stimuli.length / SPLICE_SIZE);
  var setNum = 0;
  while (test_stimuli.length > 0) {
    if (pushPauseMessage) {
      // add pause message only if not first set of images
      var breakInstructions = {
        type: "html-keyboard-response",
        stimulus: "<div class=\"display_text\">" +
            "<p>You have finished " + setNum + "/" + numSetsImages + " set of images! Stay on this page to take a break." +
            "<p>Place your fingers on the 'v' and 'h' key. Press 'v' or 'h' to continue.</p>" +
            "<\div>",
        choices: ['h','v'],
        post_trial_gap: 500
      };
      timeline.push(breakInstructions);
    } else {
      pushPauseMessage = true;
    }

    let spliced_stimuli = test_stimuli.splice(0, SPLICE_SIZE);

    let test_procedure = {
      timeline: [pre_test, test],
      timeline_variables: spliced_stimuli
    };
    timeline.push(test_procedure);
    setNum ++;
  }

  // exit fullscreen mode
  timeline.push({
    type: 'fullscreen',
    fullscreen_mode: false
  });

  /* start the experiment */
  jsPsych.init({
    timeline: timeline,
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
      experimentData.data = JSON.stringify(experimentData.data);

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
      });
    }
  });
}

function loadingScreen() {
  clearDocumentBody();
  createH1("Loading the experiment. This may take a few minutes... Thank you for your patience.");
  createLoadingWheel();
  createH3("Hello and thank you for taking the time to participate in this experiment!");
  createH3("The data collected will be used to help complete my Masters thesis in Computer Science.");
  createH3("You must complete this next section in order to get paid.");

  console.log(pairedImagesPromise);
  pairedImagesPromise.then(function(data) {
    data.then(function(data2) {
      experiment(data2);
    })
  })
}

var pairedImagesPromise = downloadExperiment();
tutorial();