
var app = {
    initialize: function() {
        document.addEventListener('deviceready', this.onDeviceReady.bind(this), false);
    },
    onDeviceReady: function() {
        
        var that = this;
        
        


        document.getElementById("startScan").onclick = function() {
            window.plugins.GMVBarcodeScanner.scan({}, function(err, result) {
                
                //Do something with the data.
                that.updateResults(result);
                
            });
        };
        // on take picture click
        document.getElementById("takePics").onclick = function() {
            let opts = {
            quality: 20,
            destinationType: Camera.DestinationType.FILE_URI,
            sourceType: Camera.PictureSourceType.CAMERA,
            mediaType: Camera.MediaType.PICTURE,
            encodingType: Camera.EncodingType.JPEG,
            cameraDirection: Camera.Direction.BACK,
            targetWidth: 300,
            targetHeight: 400
        };

        navigator.camera.getPicture(app.ftw, app.wtf, opts);
        }; // Take Pictures finishes here

        document.getElementById("history").onclick = function() {
            console.log("clicked History Button")
        };


        // test send reques json
        document.getElementById("send").onclick = function() {
            console.log("clicked send btn")
            var formdata = new FormData();
            formdata.append("title", scanResults);
            formdata.append('image', imgBlob);

            const requestOptions = {
            method: 'POST',
            body: formdata,
            redirect: 'follow'
            };

            fetch("http://192.168.0.195:3000/upload", requestOptions)
            .then(response => response.text())
            .then(result => console.log(result))
            .catch(error => console.log('error', error));

        };

    },
    // Handle Results From Take Pics
    // on success
    
      ftw: function(imgURI) {
            //coling function to fetch image added 14-11
            
            console.log("ftw function executed")
            console.log(imgURI)
            
            var divParrent = document.getElementById("pics-result");
            var listItem = document.createElement("li")
            var img = document.createElement('img');
            img.src = imgURI;
            img.id = imgURI;
            var deleteBtn = document.createElement("button")
            deleteBtn.innerHTML = "Delete";
            deleteBtn.className = "delete";

            divParrent.appendChild(listItem);
            listItem.appendChild(img);
            listItem.appendChild(deleteBtn);
            deleteBtn.onclick = deleteTask;


            // use fileEntry and fileReader
            
            window.resolveLocalFileSystemURL(imgURI, function(fileEntry) {
                fileEntry.file(function(file) {
                    var reader = new FileReader();
                    reader.onloadend = function(e) {
                        imgBlob = new Blob([this.result], {type:"image/jpeg"});
                        
                        //post formData here
                    };
                    reader.readAsArrayBuffer(file);
                });
            });

                
         },
    


    
    // Handle Results from bar-code Scan
    updateResults: function(result, err) {
        var ele = document.getElementById("last-result");
       
        if (ele.value === "" || ele.value === "undefined"){
            ele.value = result
            scanResults = result
           
            
        }
        else{
            const btResult = ele.value + ", " + result
            ele.value = btResult
            scanResults = btResult
            
        }
        
    }
};

// fetch form


// finishes here
var scanResults 
var imageToBeSend
var imgBlob




   


 // function to remove images on click on Delete botton
    var deleteTask = function(){
        var listItem = this.parentNode;
        var ul = listItem.parentNode;
        ul.removeChild(listItem);
    }
    // function finishes here

function hasClass(ele,cls) {
    return !!ele.className.match(new RegExp('(\\s|^)'+cls+'(\\s|$)'));
}

function addClass(ele,cls) {
    if (!hasClass(ele,cls)) ele.className += " "+cls;
}

function removeClass(ele,cls) {
    if (hasClass(ele,cls)) {
        var reg = new RegExp('(\\s|^)'+cls+'(\\s|$)');
        ele.className=ele.className.replace(reg,' ');
    }
}

app.initialize();