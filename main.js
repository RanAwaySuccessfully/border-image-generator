"use strict";
var currentlyActiveHR = false;

function toggleActiveHR(element) {
    if (!element) {
        currentlyActiveHR = false;
    } else {
        currentlyActiveHR = element;
    }
}

window.onload = function() {imageChange("images/border.png", false, true);};
window.onresize = imageCheck;

function defaultPageConfiguration() {
    /* this class exists solely for convenience purposes and it gets removed quickly */
    /* open the .html file on a text editor to see what elements have this class */
    var elements = document.getElementsByClassName("temporaryAddAonchangeElementHere");
    var extra = "";
    var i;
    for (i = 0; i < elements.length; i++) {
        if (i < 4) {
            extra = ", " + i;
            tableChange(elements[i], 27, i, true);
        } else {
            extra = "";
            tableChange(elements[i], 0, false, true);
        }
        
        elements[i].children[0].setAttribute("onchange", "tableChange(this.parentElement, this.value" + extra + ");"); //IE11
        elements[i].children[0].setAttribute("oninput", "tableChange(this.parentElement, this.value" + extra + ");");
        elements[i].children[2].setAttribute("oninput", "tableChange(this.parentElement, this.value" + extra + ");");
    }
    while (elements[0]) {
        elements[0].removeAttribute("class");
    }
}

function imageChange(string, event, pageJustLoaded) {
    var sideeditor = document.getElementById("sideeditor");
    var errorimg = document.getElementById("errorimg");
    var loadingimg = document.getElementById("loadingimg");
    errorimg.style.display = "none";
    
    var image = new Image();
        
    image.onload = function() {
        
        loadingimg.style.display = "none";
        
        sideeditor.removeChild(sideeditor.children[1]);
        
        var section = sideeditor.parentElement;
        var styles = getComputedStyle(section);
        var maxDivWidth = section.clientWidth - styles.paddingLeft.replace("px", "") - styles.paddingRight.replace("px", "");
        if (document.body.clientWidth > 1000) {maxDivWidth -= section.children[0].clientWidth;}
        var i;
        for (i = 4; i > 1; i--) {
            if (image.width < (maxDivWidth / i)) {
                image.width = image.width * i;
                image.height = image.height * i;
                sideeditor.setAttribute("zoom", i);
                break;
            }
        }
        if (i === 1) {sideeditor.removeAttribute("zoom");}
        var zoom = i;
        
        var width = parseInt(image.width / zoom);
        var height = parseInt(image.height / zoom);
        var inputs = document.getElementsByClassName("inputvalues");
        for (i = 0; i < (inputs.length - 2); i++) {
            if (i % 2 == 0) {
                inputs[i].max = height;
                inputs[i].parentElement.children[0].max = height;
                if (Number(inputs[i].value) > Number(inputs[i].max)) {inputs[i].value = height;}
            } else {
                inputs[i].max = width;
                inputs[i].parentElement.children[0].max = width;
                if (Number(inputs[i].value) > Number(inputs[i].max)) {inputs[i].value = width;}
            }
        }
        
        sideeditor.style.width = image.width + "px";
        sideeditor.style.height = image.height + "px";
        
        sideeditor.appendChild(image);
        
        setTimeout(function(){
            imageCheck(pageJustLoaded);
            document.getElementById("preview-style").innerHTML = "";
            document.getElementById("preview").innerHTML = "<img src='images/loading.gif' width='40' style='margin: 0 auto; display: block;'>";
            setTimeout(grabAllElements, 199);
            // the preview takes a bit of time to render with large images
            // let's make sure that everything else on the page is fine before trying to render it
        }, 1);
        /*
            IE11 executes statements too quickly after the appendChild(), without giving enough time for the DOM to update
            This means that code put here will execute before the image element has actually been appended
            The image will return with width=0 & height=0, and we need to know its original size so we can resize it correctly
            So the solution was to separate the function into two and wait a bit before executing the next few statements
            This is not a good hack. Damn you, IE11
        */
    }
    
    image.onerror = function() {
        loadingimg.style.display = "none";
        errorimg.removeAttribute("style");
        if (string) {
            console.error("Could not load an image from the URL " + string);
        } else if (event) {
            console.error("Could not load an image from the file.");
        }
    }
    
    if (event) {
        if (window.File && window.FileReader && window.FileList && window.Blob) {
            
            var file = event.target.files[0];
            if (!file) {return;}
            if (!file.type.match('image/')) {
                errorimg.removeAttribute("style");
                console.error("File loaded is not an image.");
                return;
            }
            var reader = new FileReader();
            
            reader.onload = function(event) {
                image.src = event.target.result;
            }
            
            reader.readAsDataURL(file);
            loadingimg.removeAttribute("style");
            
        } else {
            alert('Your browser does not fully support the File API. Therefore, the image could not be loaded. See: https://caniuse.com/#feat=fileapi');
        }
    } else {
        image.src = string;
    }
}

function imageCheck(pageJustLoaded) {
    var sideeditor = document.getElementById("sideeditor");
    var image = sideeditor.children[1];
    var temp;
    
    if (sideeditor.clientWidth != sideeditor.style.width.replace("px", "")) {
        image.removeAttribute("height");
        image.removeAttribute("width");
        /*
        image.height = (image.height * sideeditor.clientWidth) / image.width;
        image.width = sideeditor.clientWidth; */
        sideeditor.style.height = image.height + "px";
        sideeditor.style.width = image.width + "px";
    }
    
    if (pageJustLoaded) {
        defaultPageConfiguration();
    } else {
        var inputs = document.getElementsByClassName("inputvalues");
        var i;
        for (i = 0; i < 4; i++) {
            tableChange(inputs[i].parentElement, inputs[i].value, i, true);
        }
    }
}

function lineMove(event) {
    if (currentlyActiveHR === false) {return;}

    var sideeditor = document.getElementById("sideeditor");
    var sideeditorPosition = sideeditor.getBoundingClientRect();
    
    var zoom = sideeditor.getAttribute("zoom");
    if (!zoom) {zoom = 1;}
    
    var left = parseInt((event.clientX - sideeditorPosition.left) / zoom);
    var top = parseInt((event.clientY - sideeditorPosition.top) / zoom);
    var right = parseInt((sideeditor.clientWidth - (event.clientX - sideeditorPosition.left)) / zoom);
    var bottom = parseInt((sideeditor.clientHeight - (event.clientY - sideeditorPosition.top)) / zoom);
    
    var element = currentlyActiveHR;
    var i;
    for (i = 0; i < element.parentElement.children.length; i++) {
        if (element.parentElement.children[i] === element) {break;}
    }
    
    var inputs = document.getElementsByClassName("inputvalues");
    var names = ["top", "right", "bottom", "left"];
    var values = [top, right, bottom, left];
    
    if (values[i] < 0) {values[i] = 0;}
    if (values[i] > inputs[i].max) {values[i] = inputs[i].max;}
    element.style[names[i]] = (values[i] * zoom) + "px";
    
    tableChange(inputs[i].parentElement, values[i]);
}

function tableChange(parent, value, offsetNumber, noUpdate) {
    var range = parent.children[0];
    var number = parent.children[2];
    var max = Number(number.max);
    value = Number(value);
    
    if (value < 0 || !value) {value = 0;}
    if (max && (value > max)) {value = max;}
    
    range.value = value;
    number.value = value;
    
    if (offsetNumber || offsetNumber === 0) {
        var element = document.getElementById("sideeditor");
        var x = element.clientWidth;
        var y = element.clientHeight;
        
        var names = ["top", "right", "bottom", "left"];
        var size = [y, x, y, x];
        var result = (size[offsetNumber] * value) / max;
        
        element = element.children[0].children[offsetNumber];
        element.style[names[offsetNumber]] = result + "px";
    }
    
    if (!noUpdate) {grabAllElements();}
}

function grabAllElements() {
    var offsetsArray = [];
    var sizesArray = [];
    var repeatArray = [];
    var elements = document.getElementsByClassName("inputvalues");
    
    var i;
    for (i = 0; i < elements.length; i++) {
        if (i < 4) {
            offsetsArray.push(Number(elements[i].value));
        } else if (i < 8) {
            sizesArray.push(Number(elements[i].value));
        } else {repeatArray.push(elements[i].value);}
    }
    
    var image = document.getElementById("sideeditor").children[1].src;
    var copyOffset = document.getElementById("copyoffset").checked;
    var fillCenter = document.getElementById("fillcenter").checked;
    
    updateRender(image, offsetsArray, sizesArray, repeatArray, copyOffset, fillCenter);
}

function updateRender(image, offsetsArray, sizesArray, repeatArray, copyOffset, fillCenter) {
    var preview = document.getElementById("preview");
    
    if (fillCenter) {fillCenter = " fill";} else {fillCenter = " ";}
    if (copyOffset) {sizesArray = offsetsArray.slice(0);}
    // .slice(0) is important as it is a function that will return a duplicate array
    // if you don't do this, everything that happens to sizesArray will happen to offsetsArray too
    
    var sizes = formatArray(sizesArray, true);
    var offsets = formatArray(offsetsArray);
    
    if (repeatArray[0] === repeatArray[1]) {
        var repeat = " " + repeatArray[0];
    } else {
        var repeat = " " + repeatArray[0] + " " + repeatArray[1];
    }
    
    var previewStyle = document.getElementById("preview-style");
    
    previewStyle.innerHTML = "#preview {\r\n";
    previewStyle.innerHTML += "  border-style: solid;\r\n" + "border-width: " + sizes + ";\r\n";
    previewStyle.innerHTML += "  border-image: url('" + image + "') " + offsets + fillCenter + repeat + ";\r\n";
    previewStyle.innerHTML += "}";
    
    var source = image;
    if (source.match(/data:image\/\w*;base64,/)) {source = "base64." + image.substring(11, image.indexOf(";"));}
    
    preview.innerHTML = "border-style: solid;<br>";
    preview.innerHTML += "border-width: " + sizes + ";<br>";
    preview.innerHTML += "border-image: url('" + source + "') " + offsets + fillCenter + repeat + ";";
}

function formatArray(array, addPX) {
    var i;
    var sum = 0;
    
    for (i = 0; i < array.length; i++) {
        sum += array[i];
    }
    sum /= array.length;
    
    if (array[0] === sum) {
        if (addPX) {array[0] += "px";}
        return array[0];
    } else {
        
        if (array[1] === array[3]) {
            if (array[0] === array[2]) {array.pop();}
            array.pop();
        }
        
        if (addPX) {
            var string = array.join("px ");
            string += "px";
        } else {
            var string = array.join(" ");
        }
        return string;
    }
}