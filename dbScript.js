// To open a connection to a database, you use the open() method of the window.indexedDB: returns a request object which is an instance of the IDBOpenDBRequest interface.
let request = indexedDB.open("Media", 1);
// IndexedDB databases store key-value pairs
let db;
// open() method, it can succeed or fail. 
request.onsuccess = function () {
    db = request.result;
}
request.onerror = function (e) {
    console.log(e);
}
// first time, you can use the onupgradeneeded event handler to initialize the object stores and indexes.
request.onupgradeneeded = function () {
    db = request.result;
    // IDBDatabase instance from the event.target.result
    db.createObjectStore("gallery", { keyPath: "mId" });
    // it is creating gallery object store with keyPath equal to mId.
    // It means that the IndexedDB will generate an keyPath starting at
    //  mId as the key for every new object inserted into the gallery object store.
}

function addMedia(data, type, mediaName, date) {
    let tx = db.transaction("gallery", "readwrite");
    let gallery = tx.objectStore("gallery");
    gallery.add({ mId: Date.now(), type, media: data, mediaName: mediaName, date:date })
}

function viewMedia() {
    let mediaArea = document.querySelector("#media_area")
// create a new transaction,open a new transaction.
// transaction() is a method of the IDBDatabase object.
// The readwrite mode allows you to read data from and write data to the database
let tx = db.transaction("gallery", "readwrite");
// get the Contacts object store
    let gallery = tx.objectStore("gallery");
    // then use a cursor to iterate through all the records in the object store. 
    // The cursor does not require us to select the data based on a key; we can just grab all of it. Also note that in each iteration of
    //  the loop, you can grab data from the current record under the cursor object using cursor.value.type
      
       let reqCursor = gallery.openCursor();
    // once you found any data on that cursor
    reqCursor.onsuccess = function (e) {
        let cursor = reqCursor.result;
        console.log("cursor",cursor)
        if (cursor) {
            let imageContainer = document.createElement("div");
            imageContainer.setAttribute("class", "image_container");
            imageContainer.setAttribute("data_mId", cursor.value.mId);

            if (cursor.value.type == "img") {
                imageContainer.classList.add("image");
                imageContainer.innerHTML = `
                <div class = "date">
                    ${cursor.value.date}
                </div>
                <div class="media_box">
                    <img src="${cursor.value.media}" alt="">
                </div> 
                <div class="function_box">
                    <div class= "display">
                        <div class = "displayName" id ="displayName">${cursor.value.mediaName}</div>
                    </div>
                    <div class="download dbtn" id="download">
                        <i class="far fa-save"></i>
                    </div>
                    <div class="delete dbtn" id="delete">
                        <i class="far fa-trash-alt"></i>
                    </div>
                </div>`;
            }
            else {
                cursor.value.type == "scrvideo" ? 
                imageContainer.classList.add("scrvideo") : 
                imageContainer.classList.add("video");
                imageContainer.innerHTML = `
                <div class = "date">
                    ${cursor.value.date}
                </div>
                <div class="media_box">
                    <video src="" id = "video"></video>
                </div> 
                <div class="function_box">
                    <div class= "display">
                        <div class = "displayName" id = "displayName">${cursor.value.mediaName}</div>
                    </div>
                    <div class="download dbtn" id="download">
                        <i class="far fa-save"></i>
                    </div>
                    <div class="delete dbtn" id="delete">
                        <i class="far fa-trash-alt"></i>
                    </div>
                </div>`;

                let video = imageContainer.querySelector("#video");
                video.src = window.URL.createObjectURL(cursor.value.media);
                video.autoplay = true;
                video.controls = true;
                video.loop = true;
            }
            let deleteBtn = imageContainer.querySelector("#delete");
            deleteBtn.addEventListener("click", deleteMedia);

            let downloadBtn = imageContainer.querySelector("#download");
            downloadBtn.addEventListener("click",function(e){
                let target = e.currentTarget;
                downloadMedia(target, cursor.value.mediaName);
            })

            let displayName = imageContainer.querySelector("#displayName");
            displayName.addEventListener("click",function(){
                let newName = displayName.innerText;
                cursor.value.mediaName = newName;
            })

            mediaArea.appendChild(imageContainer);

            cursor.continue();
        }
    };
}

function deleteMedia(e) {
    let mId = e.currentTarget.parentNode.parentNode.getAttribute("data_mId");
    let tx = db.transaction("gallery", "readwrite");
    let gallery = tx.objectStore("gallery");
    gallery.delete(Number(mId));
    e.currentTarget.parentNode.parentNode.remove();
}

function downloadMedia(target, mediaName) {
    let a = document.createElement("a");
    a.href = target.parentNode.parentNode.children[1].children[0].src;
    if (target.parentNode.parentNode.children[1].children[0].nodeName == "IMG") {
        a.download = mediaName + ".png";
    } else {
        a.download = mediaName + ".mp4";
    }
    a.click();
    a.remove();
}