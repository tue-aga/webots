/* global webots: false */
/* exported dropDownMenu */
/* exported onEnableAll */
/* exported wifiConnect */
/* exported wifiDisconnect */

window.onload = function() {
  var progressBar = document.getElementById('uploadProgressBar');
  progressBar.style.visibility = 'hidden';

  // TODO DEBUG
  if (typeof webots === "undefined") {
    window.robotWindow = {};
    window.robotWindow.send = function(msg) {
      console.log("sending: " + msg);
    };
    window.robotWindow.setTitle = function() {};
  } else
    window.robotWindow = webots.window('e-puck');
  
  window.robotWindow.receive = function(value, robot) {
    if (value.indexOf('configure ') === 0) {
      try {
        var configure = JSON.parse(value.substring(10));
      } catch (e) {
        console.log(e);
        console.log('In: ' + value);
      }
      if (typeof webots === "undefined")
        configure.model = 'GCtronic e-puck2';  // TODO DEBUG
      robotLayout(configure);
    } else if (value.indexOf('ports') === 0) {
      updatePortsMenu(document.getElementById('ports'), value);
      updatePortsMenu(document.getElementById('ports'), value);
    } else if (value.startsWith('upload ')) {
      var uploadCommand = value.substring(7);
      var progressBar = document.getElementById('uploadProgressBar');
      if (uploadCommand === 'complete') {
        progressBar.className = 'uploadProgressBarCompleted';
        progressBar.value = 100;
        setTimeout(
          function() {
            progressBar.style.visibility = 'hidden';
          },
          3000
        );
      } else if (uploadCommand === 'reset') {
        progressBar.className = 'uploadProgressBarReset';
        progressBar.value = 100;
        progressBar.style.visibility = 'visible';
      } else {
        progressBar.className = 'uploadProgressBarUpload';
        progressBar.value = uploadCommand;
        progressBar.style.visibility = 'visible';
      }
    } else { // sensor values
      var values = value.split(' ');
      var ids = ['ps0', 'ps1', 'ps2', 'ps3', 'ps4', 'ps5', 'ps6', 'ps7',
                 'ls0', 'ls1', 'ls2', 'ls3', 'ls4', 'ls5', 'ls6', 'ls7',
                 'tof', 'left speed', 'right speed',
                 'left wheel position', 'right wheel position',
                 'accelerometer x', 'accelerometer y', 'accelerometer z']
      for (let i = 0; i < 24; i++)
        document.getElementById(ids[i]).innerHTML = values[i];
      document.getElementById('left wheel position').innerHTML = values[19].replace(/_/g, ' ');
      document.getElementById('right wheel position').innerHTML = values[20].replace(/_/g, ' ');
      document.getElementById('camera').src = values[24] + '#' + new Date().getTime();
      if (values.length > 25) {
        // optional ground sensors available
        setGroundSensorValue('gs0', values[25]);
        setGroundSensorValue('gs1', values[26]);
        setGroundSensorValue('gs2', values[27]);
      }
    }
  };

  window.robotWindow.send('configure');

  // TODO DEBUG
  if (typeof webots === "undefined") {
    window.robotWindow.receive('configure {}', 0);  // TODO DEBUG
  }

  document.getElementById('file-selector').onchange = function(e) {
    var filename = e.target.files[0].name;
    if (filename.lastIndexOf('.hex') !== filename.length - 4) {
      console.log(filename + ': Unsupported file type, should end with a .hex prefix');
      return;
    }
    var reader = new FileReader();
    reader.readAsText(e.target.files[0]);
    reader.onloadend = function(event) {
      window.robotWindow.send('upload ' + selectedPort + ' ' + event.target.result);
    };
  };
  onchange = 'onFileUpload();';
};

function setGroundSensorValue(id, valueString) {
  var value = parseInt(valueString);
  var elem = document.getElementById(id);
  var elemLabel = document.getElementById(id + ' label');
  if (value < 0) {
    // show label
    elem.style.backgroundColor = 'inherit';
    elem.style.borderWidth = '0px';
    elemLabel.innerHTML = id;
  } else {
    // show value
    var hexString = value.toString(16);
    elem.style.backgroundColor = '#' + hexString + hexString + hexString;
    elem.style.borderWidth = '1px';
    elemLabel.innerHTML = '';
  }
}

function updatePortsMenu(menu, value) {
  var values = value.split(' ');
  while (menu.childNodes.length)
    menu.removeChild(menu.firstChild);
  var a;
  for (var i = 1; i < values.length; i++) {
    var v = values[i];
    if (v.indexOf('\\\\.\\') === 0)
      v = v.substring(4);
    a = document.createElement('A');
    a.innerHTML = v;
    a.href = '#';
    a.setAttribute('name', values[i]);
    menu.appendChild(a);
  }
  /*a = document.createElement('A');
  a.innerHTML = 'Refresh';
  a.href = '#';
  a.setAttribute('name', 'refresh');
  menu.appendChild(a);*/
}

// Close the dropdown if the user clicks outside of it
var selectedPort = 'simulation';

// on page load
$(function() {
  $('.background').on('click', function() {
    hideAllDropDownMenus();
  });
    
  $('.dropdown-button').on('click', function() {
    hideAllDropDownMenus();
    let dropdown = $(this).parent().children('.dropdown-content')[0];
    $(dropdown).show();
    return false;
  });

  // simulation
  $('#simulation-button').on('click', function() {
    hideAllDropDownMenus();
    wifiDisconnect();
  });
  
  // Wi-Fi
  $('#wifi-button').on('click', function() {
    hideAllDropDownMenus();
    showModal('#wifi-modal');
  });
  $('#wifi-connect-button').on('click', function() {
    hideAllDropDownMenus();
    hideModal();
    wifiConnect();
  });
  
  // Bluetooth
  $('#bluetooth-button').on('click', function() {
    hideAllDropDownMenus();
    showModal('#bluetooth-modal');
  });
  $('#bluetooth-connect-button').on('click', function() {
    hideAllDropDownMenus();
    hideModal();
    bluetoothConnect();
  });
  
  $('.dropdown-menu').on('click', function() {
    return false;
  });
  
  $('.backdrop').on('click', function() {
    hideModal();
  });
});

function wifiConnect() {
  let ip = $('#wifi-ip-field').val();
  window.robotWindow.send('connect ' + ip);
  $('#mode-button').text('Wi-Fi (' + ip + ') \u25BC');
}

function wifiDisconnect() {
  window.robotWindow.send('disconnect');
  $('#mode-button').text('Simulation \u25BC');
}

function hideAllDropDownMenus() {
  $('.dropdown-content').hide();
}

function showModal(modal) {
  hideModal();
  $('.backdrop').show();
  $(modal).show();
}

function hideModal() {
  $('.backdrop').hide();
  $('.modal').hide();
}

/*window.onclick = function(event) {
  if (!event.target.classList.contains('dropdown-button'))
    hideAllDropDownMenus();
  if (event.target.nodeName === 'A') {
    var menu = event.target.parentNode.id;
    var action = event.target.getAttribute('name');
    if (action !== 'refresh') {
      if (menu === 'mode') {
        var button = document.getElementById('mode-button');
        var previousValue = button.innerHTML;
        var previousName = button.getAttribute('name');
        button.innerHTML = event.target.innerHTML + ' &#x2BC6;';
        button.setAttribute('name', event.target.getAttribute('name'));
        var mode = event.target.parentNode;
        mode.removeChild(event.target);
        var a = document.createElement('A');
        a.innerHTML = previousValue.substring(0, previousValue.length - 2);
        a.href = '#';
        a.setAttribute('name', previousName);
        mode.insertBefore(a, mode.childNodes[0]); // prepend
        if (action === 'simulation') {
          a = document.createElement('A');
          a.innerHTML = 'Refresh';
          a.href = '#';
          a.setAttribute('name', 'refresh');
          mode.appendChild(a);
          selectedPort = 'simulation';
        } else {
          mode.removeChild(mode.lastChild); // Refresh
          selectedPort = 'remote control';
          action = 'remote control ' + action;
        }
      } else if (menu === 'upload') {
        document.getElementById('file-selector').click();
        selectedPort = action;
        action = '';
      }
    }
    if (action)
      window.robotWindow.send(action);
  }
};*/

/*function dropDownMenu(id) {
  hideAllDropDownMenus();
  if (selectedPort === 'remote control' && id === 'upload') {
    console.log('Please revert to simulation before uploading HEX to the e-puck robot.');
    return;
  }
  document.getElementById(id).classList.toggle('show');
}*/

function robotLayout(configure) {
  window.robotWindow.setTitle('Robot: ' + configure.name, configure.name);
  if (configure.model === 'GCtronic e-puck2') { // e-puck2: Wifi remote control only
    var image = document.getElementById('robot image');
    image.src = 'images/e-puck2.png';

    var tof = document.getElementById('tof');
    tof.style.visibility = 'visible';

    var mode = document.getElementById('mode');
    mode.children[1].style.display = 'block'; // enable Wi-Fi
  } else { // first e-puck: use Bluetooth communication only
    var uploadButton = document.getElementById('upload hex');
    uploadButton.style.visibility = 'visible';

    var image = document.getElementById('robot image');
    image.src = 'images/e-puck.png';
  }
}

function onEnableAll() {
  window.robotWindow.send('enable');
}
