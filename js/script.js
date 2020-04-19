var canvasA, contextA; 
var original = new MarvinImage(); // original image 
var image; // process image (MarvinImage Object)


var image_load = false; var last_mode;

// mouse position for image crop
var x_in, y_in, x_out, y_out;
var flag = false; var crop_enable = false;

$(function() {

    canvasA = document.getElementById("canvasA"); 
    contextA = canvasA.getContext("2d"); 

    $("canvas").mousedown(function(event) {
        getMousePosition(this, event);
    });

    $("canvas").mousemove(function(event) {
        getMousePosition(this, event);
    });

    $("canvas").mouseup(function(event) {
        getMousePosition(this, event);
    });

    $("canvas").mouseout(function(event) {
        getMousePosition(this, event);
    });



    // brightness and contrast
    $("#brightness,#contrast").on("change", function(){
        brightnessAndContrast($("#brightness").val(), $("#contrast").val());
    })

});

function getMousePosition(canvas, event) { 
    let rect = canvas.getBoundingClientRect(); 
    let x = parseInt( event.clientX - rect.left ); 
    let y = parseInt( event.clientY - rect.top ); 

    var str = "Coordinate x: " + x + ", Coordinate y: " + y; 
    
    if(!crop_enable) {return;}
    
    switch(event.type) {
        case "mousedown": 
            flag = true; 

            x_in = x; 
            y_in = y;
            break; 

        case "mousemove": 
            if(!flag) {return;}

            x_out = x; 
            y_out = y;

            // clear the canvas
            // contextA.clearRect(0,0,canvasA.width,canvasA.height);

            resetCurrent();

            // calculate the rectangle width/height based
            // on starting vs current mouse position
            var width = x_out - x_in;
            var height = y_out - y_in;

            // draw a new rect from the start position 
            // to the current mouse position
            contextA.strokeRect(x_in,y_in,width,height);

            break; 

        case "mouseup": 
            flag = false; 

            x_out = x; 
            y_out = y;

            // calculate the rectangle width/height based
            // on starting vs current mouse position
            var width = x_out - x_in;
            var height = y_out - y_in;

            // draw a new rect from the start position 
            // to the current mouse position
            contextA.strokeRect(x_in,y_in,width,height);
            break; 

        case "mouseout": 
            flag = false;
            break;
    } //--- end switch event type ---//

}

// load image from input
function readURL(input) {
    if (input.files && input.files[0]) {
        image_load = true; 
        last_mode = "single";

        var reader = new FileReader();

        reader.onload = function (e) {
            //Initiate the JavaScript Image object.
            var objImage = new Image();
            //Set the Base64 string return from FileReader as source.
            objImage.src = e.target.result;
            //Validate the File Height and Width.
            objImage.onload = function () {
                canvasA.height = this.height;
                canvasA.width = this.width;
            }
            // clear the canvas
            contextA.clearRect(0, 0, canvasA.width, canvasA.height);
            // load selected image to canvas
            original.load(e.target.result, function(){
                canvasA.style.border =  "1px solid black"; 
                original.draw(canvasA);
            });

        };

        reader.readAsDataURL(input.files[0]);
    }
}


//----- brightness and contrast -----//
function brightnessAndContrast(b, c) {
    
    image = original.clone();
    

    $("#str_brightness").html(b);
    $("#str_contrast").html(c);

    Marvin.brightnessAndContrast(original, image, b, c);
    image.draw(canvasA);
}


//----- basic filter -----//
function grayScale(){
    image = original.clone();
    Marvin.grayScale(original, image);
    image.draw(canvasA);
}

function blackAndWhite(){
    image = original.clone();
    Marvin.blackAndWhite(original, image, 20);
    image.draw(canvasA);
}

function thresholding(){
    image = original.clone();
    Marvin.thresholding(original, image, 160);
    image.draw(canvasA);
}

function sepia(){
    image = original.clone();
    Marvin.sepia(original, image, 30);
    image.draw(canvasA);
}

function emboss(){
    image = original.clone();
    Marvin.emboss(original, image, 30);
    image.draw(canvasA);
}

function halftone(){
    image = original.clone();
    Marvin.halftoneErrorDiffusion(original, image);
    image.draw(canvasA);
}

function invert(){
    image = original.clone();
    Marvin.invertColors(original, image);
    image.draw(canvasA);
}

function gaussianBlur() {
    image = original.clone();
    Marvin.gaussianBlur(original, image, 8.0);
    image.draw(canvasA);
}

function edgeDetection1(){
    image = original.clone();
    image.clear(0xFF000000);
    Marvin.prewitt(original, image);
    image.draw(canvasA);
}

function edgeDetection2(){
    image = original.clone();
    image.clear(0xFF000000);
    Marvin.prewitt(original, image);
    Marvin.invertColors(image, image);
    Marvin.thresholding(image, image, 200);
    image.draw(canvasA);
}

//---------- crop function ----------//
function crop(){
    if(!image_load){return;}
    crop_enable = true;
    $("div#btn-crop").removeClass("d-none"); 
}


function confirmCrop(con) {
    if(con) {
        if(image != undefined) {
            original = image.clone(); 
        } else {
            image = original.clone();
        }

        
        var width = x_out - x_in;
        var height = y_out - y_in;
        canvasA.width = width; 
        canvasA.height = height; 

        Marvin.crop(original, image, x_in, y_in, width, height);
        canvasA.getContext("2d").clearRect(0,0,canvasA.width, canvasA.height);
        image.draw(canvasA);

        original = image.clone();
    } else {
        resetCurrent(); 
    }
    crop_enable = false; 
    $("div#btn-crop").addClass("d-none"); 
}



function scale(){
    if(image != undefined) {
        original = image.clone(); 
    } else {
        image = original.clone();
    }

    var new_width, new_height;
    while(new_width == undefined || new_width <= 0 || !Number.isInteger(new_width) ){
        new_width = prompt("Image new width?"); 
        if(new_width === null) 
            break; 

        new_width = parseInt(new_width); 
    }
    if(new_width === null) 
        return false;

    while(new_height == undefined || new_height <= 0 || !Number.isInteger(new_height) ){
        new_height = prompt("Image new height?"); 
        if(new_height === null) 
            break; 

        new_height = parseInt(new_height); 
    }
    if(new_height === null) 
        return false;

    // resize canvas
    canvasA.width = new_width; 
    canvasA.height = new_height; 

    Marvin.scale(original, image, new_width, new_height);
    canvasA.getContext("2d").clearRect(0,0,canvasA.width, canvasA.height);
    image.draw(canvasA);

    original = image.clone();
}

function reset(){
    // original.draw(canvasA);
    switch(last_mode) {
        case "single": $("#imageInput").trigger("change"); break;
        case "multiple": $("#imageInput2").trigger("change"); break;
    }
    
    image = undefined;
}


function resetCurrent() {
    if(image != undefined) {
        image.draw(canvasA);
    } else {
        original.draw(canvasA); 
    }
}



function save() {
    if(!image_load){return;}
    var dataURL = canvasA.toDataURL("image/png"); 
    document.getElementById("btn-download").href = dataURL;
    // window.location.href=image; // it will save locally
}


// remove white background
function removeWhiteBackground(){
    image = original.clone(); 
    whiteToAlpha(original);
    Marvin.alphaBoundary(image, original, 8);
    Marvin.scale(image, original, 400);
    image.draw(canvasA);
}

function whiteToAlpha(image){
    for(var y=0; y < image.getHeight(); y++){

        for(var x=0; x<image.getWidth(); x++){
            var r = image.getIntComponent0(x,y);
            var g = image.getIntComponent1(x,y);
            var b = image.getIntComponent2(x,y);

            if(r >= 250 && g >= 250 && b >= 250){
                image.setIntColor(x, y, 0);
            }
        }
    }
}


// merge iamge
var arr_image = []; 
function readMultiple(input) {
    if(input.files.length > 0) {
        image_load = true; 
        last_mode = "multiple";

        var reader = new FileReader();
        function readFile(index) {
            if( index >= input.files.length ) return;
            var file = input.files[index];
            reader.onload = function(e) {  
              // get file content  
              var img_url = e.target.result;

              var temp_image = new MarvinImage(); 
              var key = arr_image.length; 

              arr_image.push(temp_image); 
              arr_image[key].load(img_url, imageMerge); 

              // do sth with bin
              readFile(index+1)
            }
            reader.readAsDataURL(file);  
        }
        readFile(0);
    }
}

    

function imageMerge(){
    var width = arr_image[0].getWidth(); 
    var height = arr_image[0].getHeight(); 

    canvasA.width = width;
    canvasA.height = height;

    original = new MarvinImage(width, height);


    Marvin.mergePhotos(arr_image, original, 38);
    original.draw(canvasA);
    
}