// Everything should be inside this object to prevent conflict with other prgrams.
window.bonkHUD = {};

bonkHUD.windowHold = [];

//! not used but will be
// *Style Store
bonkHUD.styleHold = {};

//! styles added do not include color, to be added/changed by user
//! some innercss using these classes still has not been deleted(will do it)
bonkHUD.bonkHUDCSS = document.createElement("style");

bonkHUD.bonkHUDCSS.innerHTML = `
.bonkhud-settings-row {
    border-bottom: 1px solid;
    padding: 10px;
}
.bonkhud-settings-label {
    font-size: 0.9rem;
    font-weight: bold;
}
.bonkhud-window-container {
    position: fixed;
    min-width: 5rem;
    font-family: "futurept_b1";
    border-radius: 8px;
    z-index: 9990;
}
.bonkhud-header-button {
    position: absolute;
    top: 3px;
    width: 25px;
    height: 25px;
    border-radius: 3px;
}
.bonkhud-scrollbar-kit::-webkit-scrollbar {
    display: none;
}
.bonkhud-scrollbar-other {
    scrollbar-width: none;
}
.bonkhud-resizer {
    width: 10px;
    height: 10px;
    background: transparent;
    position: absolute;
}
.bonkhud-resizer.north-west {
    top: -5px;
    left: -5px;
    cursor: nwse-resize;
}
.bonkhud-resizer.north-east {
    top: -5px;
    right: -5px;
    cursor: nesw-resize;
}
.bonkhud-resizer.south-east {
    bottom: -5px;
    right: -5px;
    cursor: nwse-resize;
}
.bonkhud-resizer.south-west {
    bottom: -5px;
    left: -5px;
    cursor: nesw-resize;
}
`;
document.getElementsByTagName("head")[0].appendChild(bonkHUD.bonkHUDCSS);

bonkHUD.initialize = function () {
    //bonkHUD.stylesheet = document.createElement("style");
    let settingsMenu = document.createElement("div");
    settingsMenu.id = "bonkhud-settings";
    settingsMenu.classList.add("bonkhud-background-color");
    settingsMenu.classList.add("windowShadow");
    settingsMenu.style.position = "absolute";
    settingsMenu.style.top = "0";
    settingsMenu.style.left = "0";
    settingsMenu.style.right = "0";
    settingsMenu.style.bottom = "0";
    settingsMenu.style.width = "60%";//bonkHUD.pxTorem(450) + "rem";
    settingsMenu.style.height = "75%";//bonkHUD.pxTorem(385) + "rem";
    settingsMenu.style.fontFamily = "futurept_b1";
    settingsMenu.style.margin = "auto";
    settingsMenu.style.borderRadius = "8px";
    //settingsMenu.style.outline = "3000px solid rgba(0,0,0,0.30)";
    settingsMenu.style.pointerEvents = "auto";
    settingsMenu.style.zIndex = "9992";
    settingsMenu.style.visibility = "hidden";

    // Create the header
    let header = document.createElement("div");
    header.classList.add("newbonklobby_boxtop");
    header.classList.add("newbonklobby_boxtop_classic");
    header.classList.add("bonkhud-header-color");

    // Create the title span
    let title = document.createElement("span");
    title.classList.add("bonkhud-title-color");
    title.textContent = "BonkHUD Settings";
    title.style.flexGrow = "1";
    title.style.textAlign = "center";

    let closeButton = document.createElement("div");
    closeButton.classList.add("bonkhud-header-button");
    closeButton.classList.add("bonkhud-title-color");
    closeButton.innerText = "_"; // Use an appropriate icon or text
    closeButton.style.lineHeight = "9px";
    closeButton.style.right = "3px";
    closeButton.style.cursor = "pointer";

    let containerContainer = document.createElement("div");
    containerContainer.classList.add("bonkhud-text-color");
    containerContainer.style.overflowX = "hidden";
    containerContainer.style.overflowY = "hidden";
    containerContainer.style.display = "flex";
    containerContainer.style.width = "100%";
    containerContainer.style.height = "calc(100% - 32px)"; // Adjusted height for header

    let windowSettingsContainer = document.createElement("div");
    windowSettingsContainer.id = "bonkhud-window-settings-container";
    windowSettingsContainer.classList.add("bonkhud-border-color");
    windowSettingsContainer.classList.add("bonkhud-scrollbar-kit");
    windowSettingsContainer.classList.add("bonkhud-scrollbar-other");
    windowSettingsContainer.style.flexGrow = "1.5";
    windowSettingsContainer.style.overflowY = "scroll";
    windowSettingsContainer.style.height = "100%";
    windowSettingsContainer.style.borderRight = "1px solid";

    let settingsContainer = document.createElement("div");
    settingsContainer.classList.add("bonkhud-scrollbar-kit");
    settingsContainer.classList.add("bonkhud-scrollbar-other");
    settingsContainer.id = "bonkhud-settings-container";
    settingsContainer.style.flexGrow = "3";
    settingsContainer.style.float = "right";
    settingsContainer.style.height = "100%";

    let mainSettingsDiv = document.createElement("div");
    mainSettingsDiv.classList.add("bonkhud-border-color")
    mainSettingsDiv.classList.add("bonkhud-settings-row");

    let mainSettingsHeading = document.createElement("div");
    mainSettingsHeading.classList.add("bonkhud-text-color");
    mainSettingsHeading.textContent = "General Settings";
    mainSettingsHeading.style.marginBottom = "5px";
    mainSettingsHeading.style.fontSize = "1.2rem";

    let styleResetDiv = document.createElement("div");
    styleResetDiv.style.marginTop = "5px";

    let styleResetLabel = document.createElement("label");
    styleResetLabel.classList.add("bonkhud-text-color");
    styleResetLabel.classList.add("bonkhud-settings-label");
    styleResetLabel.style.marginRight = "5px";
    styleResetLabel.innerText = "Reset Style";

    let styleResetButton = bonkHUD.generateButton("Reset");
    styleResetButton.style.paddingLeft = "5px";
    styleResetButton.style.paddingRight = "5px";
    styleResetButton.style.display = "inline-block";

    let styleExportDiv = document.createElement("div");
    styleExportDiv.style.marginTop = "5px";

    let styleExportLabel = document.createElement("label");
    styleExportLabel.classList.add("bonkhud-text-color");
    styleExportLabel.classList.add("bonkhud-settings-label");
    styleExportLabel.style.marginRight = "5px";
    styleExportLabel.innerText = "Export Style";

    let styleExportButton = bonkHUD.generateButton("Export");
    styleExportButton.style.paddingLeft = "5px";
    styleExportButton.style.paddingRight = "5px";
    styleExportButton.style.display = "inline-block";

    let styleImportDiv = document.createElement("div");
    styleImportDiv.style.marginTop = "5px";

    let styleImportLabel = document.createElement("label");
    styleImportLabel.classList.add("bonkhud-text-color");
    styleImportLabel.classList.add("bonkhud-settings-label");
    styleImportLabel.style.marginRight = "5px";
    styleImportLabel.innerText = "Import Style";

    let styleImportButton = bonkHUD.generateButton("Import");
    styleImportButton.style.paddingLeft = "5px";
    styleImportButton.style.paddingRight = "5px";
    styleImportButton.style.display = "inline-block";

    let styleImportInput = document.createElement("input");
    styleImportInput.setAttribute("type", "file");
    styleImportInput.setAttribute("accept", ".style");
    styleImportInput.setAttribute("onChange", "bonkHUD.importStyleSettings(event)");
    styleImportInput.style.display = "none";

    let styleSettingsDiv = document.createElement("div");
    styleSettingsDiv.classList.add("bonkhud-border-color")
    styleSettingsDiv.classList.add("bonkhud-settings-row");

    let styleSettingsHeading = document.createElement("div");
    styleSettingsHeading.classList.add("bonkhud-text-color");
    styleSettingsHeading.style.fontSize = "1.2rem";
    styleSettingsHeading.style.marginBottom = "5px";
    styleSettingsHeading.textContent = "Style Settings";

    // Append children of style settings to rows
    styleResetDiv.appendChild(styleResetLabel);
    styleResetDiv.appendChild(styleResetButton);
    styleExportDiv.appendChild(styleExportLabel);
    styleExportDiv.appendChild(styleExportButton);
    styleImportDiv.appendChild(styleImportLabel);
    styleImportDiv.appendChild(styleImportButton);
    styleImportDiv.appendChild(styleImportInput);

    styleSettingsDiv.appendChild(styleSettingsHeading);
    styleSettingsDiv.appendChild(styleResetDiv);
    styleSettingsDiv.appendChild(styleExportDiv)
    styleSettingsDiv.appendChild(styleImportDiv);

    for (let prop in bonkHUD.styleHold) {
        let colorDiv = document.createElement("div");
        colorDiv.style.marginTop="5px";

        let colorLabel = document.createElement("label");
        colorLabel.classList.add("bonkhud-text-color");
        colorLabel.classList.add("bonkhud-settings-label");
        colorLabel.style.marginRight = "10px";
        colorLabel.innerText = bonkHUD.styleHold[prop].class;

        let colorEdit = document.createElement("input");
        colorEdit.setAttribute('type', 'color');
        colorEdit.value = bonkHUD.styleHold[prop].color;
        colorEdit.style.display = "inline-block";

        colorDiv.appendChild(colorLabel);
        colorDiv.appendChild(colorEdit);

        styleSettingsDiv.appendChild(colorDiv);
        colorEdit.addEventListener('change', (e) => {
            bonkHUD.styleHold[prop].color = e.target.value;
            bonkHUD.saveStyleSettings();
            bonkHUD.updateStyleSettings();
        });
    }

    //Create element in top bar
    let topBarOption = document.createElement("div");
    topBarOption.style.width = "58px";
    topBarOption.style.height = "34px";
    topBarOption.style.backgroundRepeat = "no-repeat";
    topBarOption.style.backgroundPosition = "center";
    topBarOption.style.position = "absolute";
    topBarOption.style.right = "290px";
    topBarOption.style.top = "0";
    topBarOption.style.visibility = "visible";
    topBarOption.style.borderBottom = "2px solid transparent";
    topBarOption.style.lineHeight = "34px";
    topBarOption.style.textAlign = "center";
    topBarOption.style.fontFamily = "futurept_b1";
    topBarOption.style.color = "#ffffff";
    topBarOption.classList.add("niceborderleft");
    topBarOption.classList.add("pretty_top_button");

    let topBarIcon = document.createElement("span");
    topBarIcon.innerText = "HUD";

    // Append Header
    header.appendChild(title);
    header.appendChild(closeButton)

    // Append children of general settings to rows
    //? not appending mainSettingsDiv since there is nothing to put in it yet
    //mainSettingsDiv.appendChild(mainSettingsHeading);

    // Append general setting rows to general settings container
    //settingsContainer.appendChild(mainSettingsDiv);
    settingsContainer.appendChild(styleSettingsDiv);

    // Append everything to main container (HUD window)
    containerContainer.appendChild(windowSettingsContainer);
    containerContainer.appendChild(settingsContainer);

    settingsMenu.appendChild(header);
    settingsMenu.appendChild(containerContainer);
    topBarOption.appendChild(topBarIcon);

    document.getElementById('prettymenu').appendChild(settingsMenu);
    //Place it before help button
    document.getElementById('pretty_top_bar').appendChild(topBarOption);

    // Make menu to control opacity + visibility visible
    closeButton.addEventListener('click', (e) => {
        settingsMenu.style.visibility = "hidden";
    })
    topBarOption.addEventListener('click', (e) => {
        if (settingsMenu.style.visibility == "hidden") {
            settingsMenu.style.visibility = "visible";
        }
        else {
            settingsMenu.style.visibility = "hidden";
        }
    });
    styleResetButton.addEventListener('click', (e) => {
        bonkHUD.resetStyleSettings();
        bonkHUD.updateStyleSettings();
    });
    styleExportButton.addEventListener('click', (e) => {
        bonkHUD.updateStyleSettings();
        bonkHUD.exportStyleSettings();
    });
    styleImportButton.addEventListener('click', (e) => {
        styleImportInput.click();
    });
};

bonkHUD.createWindowControl = function (name, ind) {
    // Create container for the opacity controls with initial styles
    let sliderRow = document.createElement("div");
    sliderRow.classList.add("bonkhud-settings-row");
    sliderRow.classList.add("bonkhud-border-color");

    // Add a title to the slider row for visual clarity
    let sliderTitle = document.createElement("div");
    sliderTitle.textContent = name;
    sliderTitle.style.marginBottom = "5px";
    sliderTitle.style.fontSize = "1.2rem"; // Text size for readability
    sliderTitle.style.fontWeight = "bold"; // Make the title text bold
    sliderRow.appendChild(sliderTitle); // Insert the title into the slider container

    let holdLeft = document.createElement("div");
    holdLeft.style.display = "flex";
    holdLeft.style.alignContent = "center";

    // Create a label for the opacity slider for accessibility
    let opacityLabel = document.createElement("label");
    opacityLabel.classList.add("bonkhud-settings-label");
    opacityLabel.textContent = "Opacity";
    holdLeft.appendChild(opacityLabel); // Add the label to the slider container

    // Create the opacity slider input, configuring its range and appearance
    let opacitySlider = document.createElement("input");
    opacitySlider.type = "range"; // Slider type for range selection
    opacitySlider.min = "0.1"; // Minimum opacity value
    opacitySlider.max = "1"; // Maximum opacity value (fully opaque)
    opacitySlider.step = "0.05"; // Incremental steps for opacity adjustment
    opacitySlider.value = bonkHUD.windowHold[ind].opacity; // Default value set to fully opaque
    opacitySlider.style.minWidth = "20px";
    opacitySlider.style.flexGrow = "1"; // Width adjusted for the label
    opacitySlider.oninput = function () {
        let control = document.getElementById(bonkHUD.windowHold[ind].id + "-drag"); // Update the UI opacity in real-time;
        control.style.opacity = this.value;
        bonkHUD.windowHold[ind].opacity = control.style.opacity;
        bonkHUD.saveUISetting(bonkHUD.windowHold[ind].id);
    };
    holdLeft.appendChild(opacitySlider); // Place the slider into the slider container

    let holdRight = document.createElement("div");
    let visibilityLabel = document.createElement("label");
    visibilityLabel.classList.add("bonkhud-settings-label");
    visibilityLabel.textContent = "Visible";
    visibilityLabel.style.marginRight = "5px"; // Space between label and slider
    visibilityLabel.style.display = "inline-block"; // Allows margin-top adjustment
    visibilityLabel.style.verticalAlign = "middle";
    holdRight.appendChild(visibilityLabel);

    let visiblityCheck = document.createElement("input");
    visiblityCheck.id = bonkHUD.windowHold[ind].id + "-visibility-check";
    visiblityCheck.type = "checkbox"; // Slider type for range selection
    if (bonkHUD.windowHold[ind].display == "block") {
        visiblityCheck.checked = true;
    }
    else {
        visiblityCheck.checked = false;
    }
    visiblityCheck.style.display = "inline-block"; // Allows margin-top adjustment
    visiblityCheck.style.verticalAlign = "middle";
    visiblityCheck.oninput = function () {
        let control = document.getElementById(bonkHUD.windowHold[ind].id + "-drag"); // Update the UI opacity in real-time;
        control.style.display = this.checked ? "block" : "none";
        bonkHUD.windowHold[ind].block = control.style.block;
        bonkHUD.saveUISetting(bonkHUD.windowHold[ind].id);
    };
    holdRight.appendChild(visiblityCheck); // Place the slider into the slider container

    let windowResetButton = bonkHUD.generateButton("Reset");
    windowResetButton.style.paddingLeft = "5px";
    windowResetButton.style.paddingRight = "5px";
    windowResetButton.style.display = "inline-block";
    windowResetButton.addEventListener('click', (e) => {
        bonkHUD.resetUISetting(bonkHUD.windowHold[ind].id);
        bonkHUD.loadUISetting(bonkHUD.windowHold[ind].id);
    });

    sliderRow.appendChild(holdLeft);
    sliderRow.appendChild(holdRight);
    sliderRow.appendChild(windowResetButton);

    return sliderRow; // Return the fully constructed slider row element
};

bonkHUD.createWindow = function (name, id, bodyHTML, minHeight) {
    let ind = bonkHUD.getWindowIndexByID(id);
    if (ind == -1) {
        bonkHUD.windowHold.push(bonkHUD.getUISetting(id));
        ind = bonkHUD.windowHold.length - 1;
    }

    // Create the main container 'dragItem'
    let dragItem = document.createElement("div");
    dragItem.classList.add("bonkhud-window-container");
    dragItem.classList.add("bonkhud-background-color");
    dragItem.classList.add("windowShadow");
    dragItem.classList.add("bonkhud-scrollbar-kit");
    dragItem.classList.add("bonkhud-scrollbar-other");
    dragItem.id = id + "-drag";
    dragItem.style.overflowX = "hidden";
    dragItem.style.bottom = bonkHUD.windowHold[ind].bottom; //top ? top : "0";
    dragItem.style.right = bonkHUD.windowHold[ind].right; //left ? left : "0";
    dragItem.style.width = bonkHUD.windowHold[ind].width; //width ? width : "172";
    dragItem.style.height = bonkHUD.windowHold[ind].height; //height ? height : minHeight;
    //dragItem.style.minHeight = minHeight; // Minimum height to prevent deformation
    dragItem.style.display = bonkHUD.windowHold[ind].display;
    dragItem.style.visibility = "visible";
    dragItem.style.opacity = bonkHUD.windowHold[ind].opacity;

    let dragNW = document.createElement("div");
    dragNW.classList.add("bonkhud-resizer");
    dragNW.classList.add("north-west");

    let dragNE = document.createElement("div");
    dragNE.classList.add("bonkhud-resizer");
    dragNE.classList.add("north-east");

    let dragSE = document.createElement("div");
    dragSE.classList.add("bonkhud-resizer");
    dragSE.classList.add("south-east");

    let dragSW = document.createElement("div");
    dragSW.classList.add("bonkhud-resizer");
    dragSW.classList.add("south-west");

    // Create the header
    let header = document.createElement("div");
    header.classList.add("bonkhud-drag-header");
    header.classList.add("newbonklobby_boxtop");
    header.classList.add("newbonklobby_boxtop_classic");
    header.classList.add("bonkhud-header-color");
    header.style.visibility = "visible";

    // Create the title span
    let title = document.createElement("span");
    title.classList.add("bonkhud-drag-header");
    title.classList.add("bonkhud-title-color");
    title.textContent = name;
    title.style.flexGrow = "1";
    title.style.textAlign = "center";

    // Create the resize button
    let openCloseButton = document.createElement("div");
    openCloseButton.classList.add("bonkhud-header-button");
    openCloseButton.classList.add("bonkhud-title-color");
    openCloseButton.classList.add("bonkhud-resize");
    openCloseButton.innerText = "△"; // Use an appropriate icon or text
    openCloseButton.style.fontSize = "15px";
    openCloseButton.style.lineHeight = "25px";
    openCloseButton.style.textIndent = "5px";
    openCloseButton.style.cursor = "cell";

    let closeButton = document.createElement("div");
    closeButton.classList.add("bonkhud-header-button");
    closeButton.classList.add("bonkhud-title-color");
    closeButton.innerText = "_"; // Use an appropriate icon or text
    closeButton.style.lineHeight = "9px";
    closeButton.style.right = "3px";
    closeButton.style.cursor = "pointer";

    // Append the title and resize button to the header
    header.appendChild(title);
    header.appendChild(openCloseButton);
    header.appendChild(closeButton);

    // Append the header to the dragItem
    dragItem.appendChild(dragNW);
    dragItem.appendChild(dragNE);
    dragItem.appendChild(dragSE);
    dragItem.appendChild(dragSW);
    dragItem.appendChild(header);

    // Create the key table
    bodyHTML.id = id;
    bodyHTML.classList.add("bonkhud-text-color");
    bodyHTML.style.padding = "5px";
    bodyHTML.style.width = "calc(100% - 10px)";
    bodyHTML.style.height = "calc(100% - 42px)"; // Adjusted height for header

    // Append the keyTable to the dragItem
    dragItem.appendChild(bodyHTML);

    // Append the opacity control to the dragItem
    let opacityControl = bonkHUD.createWindowControl(name, ind);
    document.getElementById("bonkhud-window-settings-container").appendChild(opacityControl);

    // Append the dragItem to the body of the page
    document.body.appendChild(dragItem);

    closeButton.addEventListener('click', (e) => {
        dragItem.style.display = "none";
        let visCheck = document.getElementById(id + "-visibility-check");
        visCheck.checked = false;
        bonkHUD.windowHold[ind].display = dragItem.style.display;
        bonkHUD.saveUISetting(id);
    });

    // Add event listeners for dragging
    dragItem.addEventListener('mousedown', (e) => bonkHUD.dragStart(e, dragItem));

    // Add event listeners for resizing
    openCloseButton.addEventListener('mousedown', (e) => {
        if(openCloseButton.innerText == "△") {
            dragItem.style.visibility = "hidden";
            openCloseButton.innerText = "▽";
        } else {
            dragItem.style.visibility = "visible";
            openCloseButton.innerText = "△";
        }
    });
    dragNW.addEventListener('mousedown', (e) => bonkHUD.startResizing(e, dragItem, "nw"));
    dragNE.addEventListener('mousedown', (e) => bonkHUD.startResizing(e, dragItem, "ne"));
    dragSE.addEventListener('mousedown', (e) => bonkHUD.startResizing(e, dragItem, "se"));
    dragSW.addEventListener('mousedown', (e) => bonkHUD.startResizing(e, dragItem, "sw"));

    bonkHUD.updateStyleSettings(); //! probably slow but it works, its not like someone will have 100's of windows
};

bonkHUD.saveUISetting = function (id) {
    let ind = bonkHUD.getWindowIndexByID(id);
    let save_id = 'bonkHUD_Setting_' + id;
    localStorage.setItem(save_id, JSON.stringify(bonkHUD.windowHold[ind]));
};

bonkHUD.getUISetting = function (id) {
    let save_id = 'bonkHUD_Setting_' + id;
    let setting = JSON.parse(localStorage.getItem(save_id));
    if (!setting) {
        setting = {
            id: id,
            width: "154px",
            height: "100px",
            bottom: "0rem",
            right: "0rem",
            opacity: "1",
            display: "block",
        }
    }
    return setting;
};

bonkHUD.loadUISetting = function (id) {
    let windowElement = document.getElementById(id + "-drag");
    if (windowElement) {
        Object.assign(windowElement.style, bonkHUD.getUISetting(id));
    } else {
        console.log(`bonkHUD.loadUISetting: Window element not found for id: ${id}. Please ensure the window has been created.`);
    }
};

bonkHUD.resetUISetting = function (id) {
    let windowElement = document.getElementById(id + "-drag");
    if (windowElement) {
        let save_id = 'bonkHUD_Setting_' + id;
        localStorage.removeItem(save_id);
        Object.assign(windowElement.style, bonkHUD.getUISetting(id));
    } else {
        console.log(`bonkHUD.resetUISetting: Window element not found for id: ${id}. Please ensure the window has been created.`);
    }
};

bonkHUD.saveStyleSettings = function () {
    localStorage.setItem('bonkHUD_Style_Settings', JSON.stringify(bonkHUD.styleHold));
};

bonkHUD.exportStyleSettings = function() {
    let out = JSON.stringify(bonkHUD.styleHold);
    let save = new File([out], "bonkHUDStyle-" + Date.now() + ".style", {type: 'text/plain',});

    let url = URL.createObjectURL(save);
    let link = document.createElement("a");
    link.href = url;
    link.download = save.name;
    document.body.appendChild(link);
    link.click();

    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
}

bonkHUD.importStyleSettings = function(event) {
    if(!event || !event.target || !event.target.files || event.target.files.length === 0) {
        return;
    }
    let fileReader = new FileReader();
    fileReader.addEventListener("load", (e) => {
        //! No error handling for incorrect file, only protection is that it is in .style file
        console.log(e.target.result);
        bonkHUD.loadStyleSettings(JSON.parse(e.target.result));
        bonkHUD.updateStyleSettings();
        bonkHUD.saveStyleSettings();
    }, false);
    //let file = event.target.files[0];
    fileReader.readAsText(event.target.files[0]);
}

bonkHUD.loadStyleSettings = function (settings) {
    if(!settings) {
        settings = JSON.parse(localStorage.getItem('bonkHUD_Style_Settings'));
    }
    if (settings) {
        bonkHUD.styleHold = {};
        for (let prop in settings) {
            bonkHUD.styleHold[prop] = settings[prop];
        }
    }
    else {
        bonkHUD.resetStyleSettings();
    }
};

bonkHUD.resetStyleSettings = function () {
    localStorage.removeItem('bonkHUD_Style_Settings');
    //Add bonkhud to key for class name
    bonkHUD.styleHold = {
        backgroundColor: {class:"bonkhud-background-color", css:"background-color", color:"#cfd8cd"},
        borderColor: {class:"bonkhud-border-color", css:"border-color", color:"#b4b8ae"},
        headerColor: {class:"bonkhud-header-color", css:"background-color", color:"#009688"},
        titleColor: {class:"bonkhud-title-color", css:"color", color:"#ffffff"},
        textColor: {class:"bonkhud-text-color", css:"color", color:"#000000"},
        buttonColor: {class:"bonkhud-button-color", css:"background-color", color:"#bcc4bb"},
        buttonColorHover: {class:"bonkhud-button-color", css:"background-color", color:"#acb9ad"},
    };
};

bonkHUD.updateStyleSettings = function () {
    for(let prop in bonkHUD.styleHold) {
        if(prop == "buttonColorHover")
            continue;
        else if(prop == "headerColor") {
            elements = document.getElementsByClassName(bonkHUD.styleHold[prop].class);
            for (let j = 0; j < elements.length; j++) {
                elements[j].style.setProperty(bonkHUD.styleHold[prop].css, bonkHUD.styleHold[prop].color, "important");
            }
            continue;
        }
        else {
            elements = document.getElementsByClassName(bonkHUD.styleHold[prop].class);
            for (let j = 0; j < elements.length; j++) {
                elements[j].style.setProperty(bonkHUD.styleHold[prop].css, bonkHUD.styleHold[prop].color);
            }
        }
    }
};

bonkHUD.dragStart = function (e, dragItem) {
    bonkHUD.focusWindow(dragItem);
    // Prevents dragging from starting on the opacity slider
    if (e.target.classList.contains("bonkhud-drag-header") && !e.target.classList.contains("bonkhud-resize")) {
        let startX = e.clientX;
        let startY = e.clientY;
        let startRight = parseInt(window.getComputedStyle(dragItem).right, 10);
        let startBottom = parseInt(window.getComputedStyle(dragItem).bottom, 10);
        const boundDragMove = bonkHUD.dragMove.bind(null, startX, startY, startRight, startBottom, dragItem);
        document.addEventListener('mousemove', boundDragMove);
        document.addEventListener('mouseup', () => bonkHUD.dragEnd(boundDragMove, dragItem), { once: true });
    }
};

bonkHUD.dragMove = function (startX, startY, startRight, startBottom, dragItem, e) {
    let w = parseFloat(window.getComputedStyle(dragItem).width) / 2;
    let h = parseFloat(window.getComputedStyle(dragItem).height) / 2;
    let moveX = bonkHUD.clamp(startRight + startX - e.clientX, -w, window.innerWidth - w);
    let moveY = bonkHUD.clamp(startBottom + startY - e.clientY, -h, window.innerHeight - h * 2 + 15);
    dragItem.style.right = bonkHUD.pxTorem(moveX) + "rem";
    dragItem.style.bottom = bonkHUD.pxTorem(moveY) + "rem";
};

bonkHUD.dragEnd = function (dragMoveFn, dragItem) {
    document.removeEventListener('mousemove', dragMoveFn);
    let ind = bonkHUD.getWindowIndexByID(dragItem.id.substring(0, dragItem.id.length - 5));
    bonkHUD.windowHold[ind].width = dragItem.style.width;
    bonkHUD.windowHold[ind].height = dragItem.style.height;
    bonkHUD.windowHold[ind].bottom = dragItem.style.bottom;
    bonkHUD.windowHold[ind].right = dragItem.style.right;
    bonkHUD.saveUISetting(bonkHUD.windowHold[ind].id);
};

// Function to start resizing the UI
bonkHUD.startResizing = function (e, dragItem, dir) {
    e.stopPropagation(); // Prevent triggering dragStart for dragItem

    let startX = e.clientX;
    let startY = e.clientY;
    let windowX = parseInt(window.getComputedStyle(dragItem).right, 10);
    let windowY = parseInt(window.getComputedStyle(dragItem).bottom, 10);
    let startWidth = parseInt(window.getComputedStyle(dragItem).width, 10);
    let startHeight = parseInt(window.getComputedStyle(dragItem).height, 10);

    function doResize(e) {
        bonkHUD.resizeMove(e, startX, startY, windowX, windowY, startWidth, startHeight, dragItem, dir);
    }

    function stopResizing() {
        bonkHUD.resizeEnd(doResize, dragItem);
    }

    document.addEventListener('mousemove', doResize);
    document.addEventListener('mouseup', stopResizing, { once: true });
};

// Function to handle the resize event
bonkHUD.resizeMove = function (e, startX, startY, windowX, windowY, startWidth, startHeight, dragItem, dir) {
    let newWidth = 0;
    let newHeight = 0;
    if(dir == "nw") {
        newWidth = startWidth - (e.clientX - startX);
        newHeight = startHeight - (e.clientY - startY);
        dragItem.style.height = bonkHUD.pxTorem(Math.max(30, newHeight)) + 'rem';
        dragItem.style.width = bonkHUD.pxTorem(Math.max(154, newWidth)) + 'rem';
    } else if(dir == "sw") {
        newWidth = startWidth - (e.clientX - startX);
        newHeight = startHeight + (e.clientY - startY);
        dragItem.style.height = bonkHUD.pxTorem(Math.max(30, newHeight)) + 'rem';
        dragItem.style.bottom = bonkHUD.pxTorem(windowY - (newHeight < 30 ? 30 - startHeight : e.clientY - startY)) + 'rem';
        dragItem.style.width = bonkHUD.pxTorem(Math.max(154, newWidth)) + 'rem';
    } else if(dir == "ne") {
        newWidth = startWidth + (e.clientX - startX);
        newHeight = startHeight - (e.clientY - startY);
        dragItem.style.height = bonkHUD.pxTorem(Math.max(30, newHeight)) + 'rem';
        dragItem.style.width = bonkHUD.pxTorem(Math.max(154, newWidth)) + 'rem';
        dragItem.style.right = bonkHUD.pxTorem(windowX - (newWidth < 154 ? 154 - startWidth : e.clientX - startX)) + 'rem';
    } else {
        newWidth = startWidth + (e.clientX - startX);
        newHeight = startHeight + (e.clientY - startY);
        dragItem.style.height = bonkHUD.pxTorem(Math.max(30, newHeight)) + 'rem';
        dragItem.style.bottom = bonkHUD.pxTorem(windowY - (newHeight < 30 ? 30 - startHeight : e.clientY - startY)) + 'rem';
        dragItem.style.width = bonkHUD.pxTorem(Math.max(154, newWidth)) + 'rem';
        dragItem.style.right = bonkHUD.pxTorem(windowX - (newWidth < 154 ? 154 - startWidth : e.clientX - startX)) + 'rem';
    }
};

// Function to stop the resize event
bonkHUD.resizeEnd = function (resizeMoveFn, dragItem, dir) {
    document.removeEventListener('mousemove', resizeMoveFn);
    let ind = bonkHUD.getWindowIndexByID(dragItem.id.substring(0, dragItem.id.length - 5));
    bonkHUD.windowHold[ind].width = dragItem.style.width;
    bonkHUD.windowHold[ind].height = dragItem.style.height;
    bonkHUD.windowHold[ind].bottom = dragItem.style.bottom;
    bonkHUD.windowHold[ind].right = dragItem.style.right;
    bonkHUD.saveUISetting(bonkHUD.windowHold[ind].id);
};

bonkHUD.focusWindow = function (focusItem) {
    let elements = document.getElementsByClassName("bonkhud-window-container");
    focusItem.style.zIndex = "9991";
    for (let i = 0; i < elements.length; i++) {
        if (focusItem.id != elements[i].id) {
            elements[i].style.zIndex = "9990";
        }
    }
};

bonkHUD.getWindowIndexByID = function (id) {
    for (let i = 0; i < bonkHUD.windowHold.length; i++) {
        if (bonkHUD.windowHold[i].id == id) {
            return i;
        }
    }
    return -1;
};

// ================HELPER METHODS=====================
bonkHUD.clamp = function (val, min, max) {
    //? supposedly faster than Math.max/min
    if (val > min) {
        if (val < max) {
            return val;
        }
        else {
            return max;
        }
    }
    return min;
};

bonkHUD.pxTorem = function (px) {
    return px / parseFloat(getComputedStyle(document.documentElement).fontSize);
};

bonkHUD.remTopx = function (rem) {
    return rem * parseFloat(getComputedStyle(document.documentElement).fontSize);
};

//? might make more of these for use in the main settings window
//? and so others can use these to make a unified look of bonkhud
//? windows
bonkHUD.generateButton = function (name) {
    let newButton = document.createElement("div");
    newButton.classList.add("bonkhud-button-color");
    newButton.classList.add("bonkhud-text-color");
    newButton.style.cursor = "pointer";
    newButton.style.borderRadius = "3px";
    newButton.style.textAlign = "center";
    newButton.style.backgroundColor = bonkHUD.styleHold.buttonColor.color;
    newButton.innerText = name;

    newButton.addEventListener('mouseover', (e) => {
        e.target.style.backgroundColor = bonkHUD.styleHold.buttonColorHover.color;
    });
    newButton.addEventListener('mouseleave', (e) => {
        e.target.style.backgroundColor = bonkHUD.styleHold.buttonColor.color;
    });
    return newButton;
}

if (document.readyState === "complete" || document.readyState === "interactive") {
    bonkHUD.loadStyleSettings();
    bonkHUD.updateStyleSettings();

    bonkHUD.initialize();
} else {
    document.addEventListener("DOMContentLoaded", () => {
        bonkHUD.loadStyleSettings();
        bonkHUD.updateStyleSettings();

        bonkHUD.initialize();
    });
}