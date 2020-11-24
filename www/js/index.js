var app = {
  initialize: function () {
    document.addEventListener(
      "deviceready",
      this.onDeviceReady.bind(this),
      false
    );
  },
  onDeviceReady: function () {
    var that = this;

    document.getElementById("startScan").onclick = function () {
      window.plugins.GMVBarcodeScanner.scan({}, function (err, result) {
        //Do something with the data.
        that.updateResults(result);
      });
    };
    // on take picture click
    document.getElementById("takePics").onclick = function () {
      let opts = {
        quality: 80,
        destinationType: Camera.DestinationType.FILE_URI,
        sourceType: Camera.PictureSourceType.CAMERA,
        mediaType: Camera.MediaType.PICTURE,
        encodingType: Camera.EncodingType.JPEG,
        cameraDirection: Camera.Direction.BACK,
        targetWidth: 1024,
        targetHeight: 1600,
      };

      navigator.camera.getPicture(app.ftw, app.wtf, opts);
    }; // Take Pictures finishes here

    document.getElementById("history").onclick = function () {
      console.log("clicked History Button");
    };

    // test send reques json
    document.getElementById("send").onclick = function () {
      console.log("clicked send btn");

      //   const formdata = new FormData();
      //   formdata.append("auth-token", tokenKey);
      //   formdata.append("title", scanResults);
      //   // formdata.append('image', imgBlob);
      //   for (let i = 0; i < blobArr.length; i++) {
      //     formdata.append("image", blobArr[i]);
      //   }

      //   const requestOptions = {
      //     method: "POST",
      //     body: formdata,
      //     redirect: "follow",
      //   };
      console.log(tokenKey);
      var myHeaders = new Headers();
      myHeaders.append("auth-token", tokenKey);

      var formdata = new FormData();
      formdata.append("title", scanResults);
      formdata.append("image", imgBlob);
      for (let i = 0; i < blobArr.length; i++) {
        formdata.append("image", blobArr[i]);
      }

      var requestOptions = {
        method: "POST",
        headers: myHeaders,
        body: formdata,
        redirect: "follow",
      };

      if (tokenKey === undefined) {
        navigator.notification.alert("Please Log-in");
        return;
      } else {
        fetch("http://192.168.0.195:3001/upload", requestOptions)
          .then((response) => {
            if (response.ok) {
              dataSent();
            } else {
              console.log(response);
              if (response.statusText == "Unauthorized") {
                navigator.notification.alert("Please Log in");
              }
            }
          })
          .catch((error) => {
            console.log("error", error);
            navigator.notification.beep(1);
            navigator.notification.alert(
              "There was a problem, check internet connection or contact system admin"
            );
          });
      }
    };
  },
  // Handle Results From Take Pics
  // on success

  ftw: function (imgURI) {
    //coling function to fetch image added 14-11

    console.log("ftw function executed");
    console.log(imgURI);

    const divParrent = document.getElementById("pics-result");
    const listItem = document.createElement("li");
    listItem.className = "listItem";
    const img = document.createElement("img");
    img.src = imgURI;
    img.id = imgURI;
    const deleteBtn = document.createElement("button");
    deleteBtn.innerHTML = "Delete";
    deleteBtn.className = "delete";

    divParrent.appendChild(listItem);
    listItem.appendChild(img);
    listItem.appendChild(deleteBtn);
    deleteBtn.onclick = deleteTask;

    // new blob

    // use fileEntry and fileReader

    window.resolveLocalFileSystemURL(imgURI, function (fileEntry) {
      fileEntry.file(function (file) {
        console.log("file is " + file.type);
        const reader = new FileReader();
        reader.onloadend = function (e) {
          imgBlob = new Blob([this.result], { type: "image/jpeg" });
          console.log("converted image to blob");
          blobArr.push(imgBlob);
        };
        reader.readAsArrayBuffer(file);
      });
    });
  },
  // test make new blob

  // Handle Results from bar-code Scan
  updateResults: function (result, err) {
    const ele = document.getElementById("last-result");

    if (ele.value === "" || ele.value === "undefined") {
      ele.value = result;
      scanResults = result;
    } else {
      const btResult = ele.value + ", " + result;
      ele.value = btResult;
      scanResults = btResult;
    }
  },
};

// to toggle login popup
function openForm() {
  document.getElementById("myForm").style.display = "block";
}

function closeForm() {
  document.getElementById("myForm").style.display = "none";
}

// function after clicking sublit login button
var userName;
var password;
var tokenKey;
function loginFunc() {
  console.log("clicked submit");
  userName = document.getElementById("user-field").value;
  password = document.getElementById("pass-field").value;
  if ((userName.length < 5) | (password.length < 5)) {
    navigator.notification.alert(
      "user name of password must be at least 5 characters"
    );
  } else {
    const myHeaders = new Headers();
    myHeaders.append("Content-Type", "application/json");

    const raw = JSON.stringify({ name: userName, password: password });

    const requestOptions = {
      method: "POST",
      headers: myHeaders,
      body: raw,
      redirect: "follow",
    };

    fetch("http://192.168.0.195:3001/login", requestOptions)
      .then((response) => response.text())
      .then((result) => {
        if (result.length <= 30) {
          navigator.notification.alert(result);
        } else {
          tokenKey = result;
          console.log(tokenKey);
          closeForm();
        }
      })
      .catch((error) => console.log("error", error));
  }
}

// finishes here

var scanResults;
var imageToBeSend;
var imgBlob;
var blobArr = [];

// function that runs when data is sent to delete results and images
function dataSent() {
  console.log("Data was sent");
  blobArr = [];
  // remove Scan results
  const resultsTag = document.getElementById("last-result");
  resultsTag.value = "";

  // remove all images
  const item = document.querySelector("#pics-result");
  while (item.firstChild) {
    item.removeChild(item.firstChild);
  }
}

// function to remove image on click on Delete botton
var deleteTask = function () {
  const listItem = this.parentNode;
  const ul = listItem.parentNode;
  ul.removeChild(listItem);
};
// function finishes here

function hasClass(ele, cls) {
  return !!ele.className.match(new RegExp("(\\s|^)" + cls + "(\\s|$)"));
}

function addClass(ele, cls) {
  if (!hasClass(ele, cls)) ele.className += " " + cls;
}

function removeClass(ele, cls) {
  if (hasClass(ele, cls)) {
    var reg = new RegExp("(\\s|^)" + cls + "(\\s|$)");
    ele.className = ele.className.replace(reg, " ");
  }
}

app.initialize();
