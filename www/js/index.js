var app = {
  initialize: function () {
    document.addEventListener(
      "deviceready",
      this.onDeviceReady.bind(this),
      false
    )
  },
  onDeviceReady: function () {
    var that = this

    // // retrieve stored token and username
    // retrieveToken()
    // retrieveUsername()
    // // if (savedToken.length > 0) {
    // //   logedIn()
    // // }
    var token
    var getToken = () => {
      cordova.plugins.SecureKeyStore.get(
        function (res) {
          console.log(res) // res - string retrieved
          token = res
          logedIn()

          return token
        },
        function (error) {
          console.log(error)
          document.querySelector(".log-out").style.display = "none"
        },
        "key"
      )
    }

    var userName
    var getUsername = () => {
      cordova.plugins.SecureKeyStore.get(
        function (res) {
          console.log(res) // res - string retrieved
          userName = res
          return userName
        },
        function (error) {
          console.log(error)
        },
        "username"
      )
    }
    getToken()
    getUsername()

    document.getElementById("startScan").onclick = function () {
      window.plugins.GMVBarcodeScanner.scan({}, function (err, result) {
        //Do something with the data.
        that.updateResults(result)
      })
    }
    // on take picture click
    document.getElementById("takePics").onclick = function () {
      let opts = {
        quality: 100,
        destinationType: Camera.DestinationType.FILE_URI,
        sourceType: Camera.PictureSourceType.CAMERA,
        mediaType: Camera.MediaType.PICTURE,
        encodingType: Camera.EncodingType.JPEG,
        cameraDirection: Camera.Direction.BACK,
        targetWidth: 2048
        // targetHeight: 1600
      }

      navigator.camera.getPicture(app.ftw, app.wtf, opts)
    } // Take Pictures finishes here

    // send data on click (send btn)
    document.getElementById("send").onclick = function () {
      console.log("clicked send btn")
      token = undefined
      userName = undefined

      getToken()
      getUsername()

      setTimeout(() => {
        let myHeaders = new Headers()
        if (token != undefined) {
          myHeaders.append("auth-token", token)
          console.log("token added to headers")
        } else {
          navigator.notification.alert("Please log-in!")
          return
        }

        // to handle scan input
        const ele = document.getElementById("last-result")
        if (ele.value.length > 0) {
          scanResults = ele.value
        } else {
          navigator.notification.alert("Please scan or write barcode!")
          return
        }
        //   check if blobArr is empty
        if (blobArr.length < 1) {
          navigator.notification.alert("Please add images!")
          return
        }
        const commentInput = document.querySelector("#user-comment")
        // new formdata that will be send to server
        var formdata = new FormData()

        if (userName != undefined) {
          formdata.append("username", userName)
          console.log("username added to formdata")
        } else {
          navigator.notification.alert("user name not available")
          return
        }

        formdata.append("num", scanResults)

        if (commentInput.value != "") {
          formdata.append("comment", commentInput.value)
        }

        for (let i = 0; i < blobArr.length; i++) {
          formdata.append("image", blobArr[i])
        }

        var requestOptions = {
          method: "POST",
          headers: myHeaders,
          body: formdata,
          redirect: "follow"
        }

        fetch("/upload", requestOptions)
          .then(response => {
            if (response.ok) {
              dataSent()
            } else {
              console.log(response)
              if (response.statusText == "Unauthorized") {
                navigator.notification.alert("Please Log in")
              }
            }
          })
          .catch(error => {
            console.log("error", error)
            navigator.notification.beep(1)
            navigator.notification.alert(
              "There was a problem, check internet connection or contact system admin"
            )
          })
      }, 500)
    }
  },
  // Handle Results From Take Pics
  // on success

  ftw: function (imgURI) {
    //calling function to fetch image

    console.log("ftw function executed")
    console.log(imgURI)

    const divParrent = document.getElementById("pics-result")
    const listItem = document.createElement("li")
    listItem.className = "listItem"
    const img = document.createElement("img")
    img.src = imgURI
    img.id = imgURI
    const deleteBtn = document.createElement("button")
    deleteBtn.innerHTML = "Delete"
    deleteBtn.className = "delete"

    divParrent.appendChild(listItem)
    listItem.appendChild(img)
    listItem.appendChild(deleteBtn)
    deleteBtn.onclick = deleteTask

    // add imageURIs to array

    // use fileEntry and fileReader

    window.resolveLocalFileSystemURL(imgURI, function (fileEntry) {
      fileEntry.file(function (file) {
        console.log("file is " + file.type)
        const reader = new FileReader()
        reader.onloadend = function (e) {
          imgBlob = new Blob([this.result], { type: "image/jpeg" })
          console.log("converted image to blob")
          blobArr.push(imgBlob)
          console.log("this is the image array1" + blobArr)
        }
        reader.readAsArrayBuffer(file)
      })
    })
  },
  // test make new blob

  // Handle Results from bar-code Scan
  updateResults: function (result, err) {
    const ele = document.getElementById("last-result")
    if (result !== undefined) {
      ele.value = result
      scanResults = result
    }
  }
}

// to toggle login popup
function openForm() {
  document.getElementById("myForm").style.display = "block"
}

function closeForm() {
  document.getElementById("myForm").style.display = "none"
}

// function after clicking sublit login button
var password

function loginFunc() {
  console.log("clicked submit")
  userName = document.getElementById("user-field").value
  password = document.getElementById("pass-field").value
  if ((userName.length < 5) | (password.length < 5)) {
    navigator.notification.alert(
      "user name of password must be at least 5 characters"
    )
  } else {
    const myHeaders = new Headers()
    myHeaders.append("Content-Type", "application/json")

    const raw = JSON.stringify({ name: userName, password: password })

    const requestOptions = {
      method: "POST",
      headers: myHeaders,
      body: raw,
      redirect: "follow"
    }

    fetch("http://185.143.45.137:9001/login", requestOptions)
      .then(response => response.text())
      .then(result => {
        if (result.length <= 30) {
          navigator.notification.alert(result)
        } else {
          const key = "key"
          storeValue(key, result)

          const username = "username"
          storeValue(username, userName)

          closeForm()
          logedIn()
        }
      })
      .catch(error => console.log("error", error))
  }
}

const logedIn = () => {
  document.querySelector(".open-button").style.display = "none"
  document.querySelector(".log-out").style.display = "inline-block"
}

// when log-out clicked
const logedOut = () => {
  logOutBtn.style.display = "none"
  document.querySelector(".open-button").style.display = "inline-block"
  removeToken()
  removeUsername()
  token = undefined
  userName = undefined
}
const logOutBtn = document.querySelector(".log-out")
logOutBtn.addEventListener("click", logedOut)

// function to store auth token locally
const storeValue = (name, value) => {
  cordova.plugins.SecureKeyStore.set(
    function (res) {
      console.log(res) // res - string securely stored
    },
    function (error) {
      console.log(error)
    },
    name,
    value
  )
}

// Remove stored token
const removeToken = () => {
  cordova.plugins.SecureKeyStore.remove(
    function (res) {
      console.log(res) // res - string removed
      token = undefined
    },
    function (error) {
      console.log(error)
    },
    "key"
  )
}

// Remove stored username
const removeUsername = () => {
  cordova.plugins.SecureKeyStore.remove(
    function (res) {
      console.log(res) // res - string removed
      token = undefined
    },
    function (error) {
      console.log(error)
    },
    "username"
  )
}

// Settings

// document.querySelector("#settings").addEventListener("click", settings)
// finishes here

var scanResults
var imageToBeSend
var imgBlob
var blobArr = []

// function that runs when data is sent to delete results and images
function dataSent() {
  console.log("Data was sent")
  blobArr = []
  // remove Scan results
  const ele = document.getElementById("last-result")
  ele.value = ""

  // remove all images
  const item = document.querySelector("#pics-result")

  while (item.firstChild) {
    item.removeChild(item.firstChild)
  }
  const commentInput = document.querySelector("#user-comment")
  commentInput.value = ""
}

// function to remove image on click on Delete botton
var deleteTask = function () {
  const listItem = this.parentNode
  const ul = listItem.parentNode
  ul.removeChild(listItem)
}
// function finishes here

function hasClass(ele, cls) {
  return !!ele.className.match(new RegExp("(\\s|^)" + cls + "(\\s|$)"))
}

function addClass(ele, cls) {
  if (!hasClass(ele, cls)) ele.className += " " + cls
}

function removeClass(ele, cls) {
  if (hasClass(ele, cls)) {
    var reg = new RegExp("(\\s|^)" + cls + "(\\s|$)")
    ele.className = ele.className.replace(reg, " ")
  }
}

app.initialize()
