const socket = io("/");
const videoGrid = document.getElementById("video-grid");

let message = document.querySelector('.messages');


const myVideo = document.createElement("video");
myVideo.muted = true;

const myPeer = new Peer(undefined, {
    //host: "/",
    //port: "8001",
    //path:'/peerjs',
    host: 'peerjsvideochatapp.herokuapp.com',
    port: '443',
    secure:true
  });
  
  const user = prompt("Enter your name");
  
  const peers = {};
  
  let myVideoStream;
  navigator.mediaDevices
    .getUserMedia({
      video: true,
      audio: true,
    })
    .then((stream) => {
      myVideoStream = stream;
      addVideoStream(myVideo, stream);
  
      myPeer.on("call", (call) => {
        call.answer(stream);
        const video = document.createElement("video");
        call.on("stream", (userVideoStream) => {
          addVideoStream(video, userVideoStream);
        });
      });
  
      socket.on("user-connected", (userId) => {
        setTimeout(connectToNewUser, 1000, userId, stream);
        //connectToNewUser(userId, stream)
      });
      // input value
  let text = $("input");
  // when press enter send message
  $('html').keydown(function (e) {
    if (e.which == 13 && text.val().length !== 0) {
      socket.emit('message', text.val());
      text.val('')
    }
  });
  socket.on("createMessage", (message , userName) => {
    $("ul").append(`<li class="message"><b><i class="far fa-user-circle"></i> <span> ${
            userName === user ? "me" : userName
          }</span></b><br/>${message}</li>`);
    // messages.innerHTML =
    // messages.innerHTML +
    // `<div class="messages">
    //     <b><i class="far fa-user-circle"></i> <span> ${
    //       userName === user ? "me" : userName
    //       // user
    //     }</span> </b>
    //     <span>${message}</span>
    // </div>`;
    scrollToBottom()
  })
})
  
  socket.on("user-disconnected", (userId) => {
    if (peers[userId]) peers[userId].close();
  });
  
  
  myPeer.on("open", (id) => {
    socket.emit("join-room", ROOM_ID, id,user);
  });
  
  function connectToNewUser(userId, stream) {
    const call = myPeer.call(userId, stream);
    const video = document.createElement("video");
    call.on("stream", (userVideoStream) => {
      addVideoStream(video, userVideoStream);
    });
    call.on("close", () => {
      video.remove();
    });
  
    peers[userId] = call;
  }
  
  function addVideoStream(video, stream) {
    video.srcObject = stream;
    video.addEventListener("loadedmetadata", () => {
      video.play();
    });
    videoGrid.append(video);
  }
  
  if (adapter.browserDetails.browser == 'firefox') {
    adapter.browserShim.shimGetDisplayMedia(window, 'screen');
  }
  
  function handleSuccess(stream) {
    screenShareButton.disabled = true;
    const video = document.querySelector('video');
    video.srcObject = stream;
  
    // demonstrates how to detect that the user has stopped
    // sharing the screen via the browser UI.
    stream.getVideoTracks()[0].addEventListener('ended', () => {
      alert('The user has ended sharing the screen');
      screenShareButton.disabled = false;
    });
  }
  
  function handleError(error) {
    alert(`getDisplayMedia error: ${error.name}`, error);
  }
  
  function errorMsg(msg, error) {
    const errorElement = document.querySelector('#errorMsg');
    errorElement.innerHTML += `<p>${msg}</p>`;
    if (typeof error !== 'undefined') {
      alert.error(error);
    }
  }
  
  const screenShareButton = document.getElementById('screenShareButton');
  screenShareButton.addEventListener('click', () => {
    navigator.mediaDevices.getDisplayMedia({video: true})
        .then(handleSuccess, handleError);
  });
  
  if ((navigator.mediaDevices && 'getDisplayMedia' in navigator.mediaDevices)) {
    screenShareButton.disabled = false;
  } else {
    alert('getDisplayMedia is not supported');
  }
  
  const scrollToBottom = () => {
    var d = $('.main__chat_window');
    d.scrollTop(d.prop("scrollHeight"));
  }

const inviteButton = document.querySelector("#inviteButton");
const muteButton = document.querySelector("#muteButton");
const stopVideo = document.querySelector("#stopVideo");
muteButton.addEventListener("click", () => {
  const enabled = myVideoStream.getAudioTracks()[0].enabled;
  if (enabled) {
    myVideoStream.getAudioTracks()[0].enabled = false;
    html = `<i class="fas fa-microphone-slash"></i>`;
    muteButton.classList.toggle("background__red");
    muteButton.innerHTML = html;
  } else {
    myVideoStream.getAudioTracks()[0].enabled = true;
    html = `<i class="fas fa-microphone"></i>`;
    muteButton.classList.toggle("background__red");
    muteButton.innerHTML = html;
  }
});

stopVideo.addEventListener("click", () => {
  const enabled = myVideoStream.getVideoTracks()[0].enabled;
  if (enabled) {
    myVideoStream.getVideoTracks()[0].enabled = false;
    html = `<i class="fas fa-video-slash"></i>`;
    stopVideo.classList.toggle("background__red");
    stopVideo.innerHTML = html;
  } else {
    myVideoStream.getVideoTracks()[0].enabled = true;
    html = `<i class="fas fa-video"></i>`;
    stopVideo.classList.toggle("background__red");
    stopVideo.innerHTML = html;
  }
});

inviteButton.addEventListener("click", (e) => {
  prompt(
    "Copy this link and send it to people you want to meet with",
    window.location.href
  );
});

