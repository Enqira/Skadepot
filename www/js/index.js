var app = {
    initialize: function() {
        document.addEventListener('deviceready', this.onDeviceReady.bind(this), false);
    },
    onDeviceReady: function() {
        var that = this;
        document.getElementById("start-scan").onclick = function() {
            window.plugins.GMVBarcodeScanner.scan({}, function(err, result) {
                //Handle Errors
                if(err) return that.updateResults(err, true);

                //Do something with the data.
                that.updateResults(result);
            });
        };
        // on take picture click
        document.getElementById("Take Pics").onclick = function() {
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

        document.getElementById("start-vin-scan").onclick = function() {
            window.plugins.GMVBarcodeScanner.scanVIN(function(err, result) {
                if(err) return that.updateResults(err, true);
                that.updateResults(result);
            });
        };

    },
    // Handle Results From Take Pics
    // on success
    ftw: function(imgURI) {
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
                
    },



    // Handle Results from bar-code Scan
    updateResults: function(result, err) {
        var ele = document.getElementById("last-result");
        if(err) {
            addClass(ele, "error");
        } else {
            removeClass(ele, "error");
        }
        if(typeof result == "object") {
            result = JSON.stringify(result, null, 2);
        }
        if(err) {
            result = "ERROR\n"+result;
        }
        if (ele.value === ""){
            ele.value = result
        }
        else{
            ele.value = ele.value + ", " + result
        }
        // document.getElementById("last-result").value = result
    }
};

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