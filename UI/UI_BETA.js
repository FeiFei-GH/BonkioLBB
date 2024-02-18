// ==UserScript==
// @name         Enhanced Keyboard Overlay for Bonk.io
// @version      2.0
// @description  Adds a customizable keyboard overlay to enhance gameplay in bonk.io.
// @author       BZD Modified
// @namespace    http://tampermonkey.net/
// @license      MIT
// @match        https://bonk.io/gameframe-release.html
// @run-at       document-body
// @grant        none
// ==/UserScript==

(function() {
    'use strict';

    // Defining the main namespace for our script
    const EnhancedOverlay = {};

    // Initial configuration for the overlay
    const overlayConfig = {
        posX: "0px",
        posY: "0px",
        overlayWidth: "172px",
        overlayHeight: "100px"
    };

    // Toggle function for activating color selection
    function activateColorSelection() {
        EnhancedOverlay.colorSelectionActive = !EnhancedOverlay.colorSelectionActive;
        document.querySelectorAll('.overlay-component').forEach(element => {
            element.style.cursor = EnhancedOverlay.colorSelectionActive ? 'crosshair' : 'default';
        });
    }

    // Apply color to a specific component
    function setColorForComponent(component, color) {
        component.style.backgroundColor = color;
        // Placeholder for any save function
    }

    // Function to handle color picking
    function initiateColorPicker(targetComponent) {
        const colorInput = document.createElement('input');
        colorInput.setAttribute('type', 'color');
        colorInput.hidden = true;

        colorInput.addEventListener('change', () => {
            setColorForComponent(targetComponent, colorInput.value);
            document.body.removeChild(colorInput);
            EnhancedOverlay.colorSelectionActive = false;
        });

        document.body.appendChild(colorInput);
        colorInput.click();
    }

    // Making elements eligible for color change
    function enableColorChangeForElements() {
        document.querySelectorAll('.key-display, .drag-area, .transparency-control, .resize-control, .keyboard-overlay').forEach(el => {
            el.classList.add('overlay-component');
        });
    }

    // Keyboard shortcut for toggling the color pick mode
    document.addEventListener('keydown', event => {
        if (event.shiftKey && event.ctrlKey) activateColorSelection();
    });

    // Click event for picking color
    document.addEventListener('click', event => {
        if (EnhancedOverlay.colorSelectionActive && event.target.classList.contains('overlay-component')) {
            event.preventDefault();
            initiateColorPicker(event.target);
        }
    });

    // Setup color change capability after the document loads
    document.addEventListener("DOMContentLoaded", enableColorChangeForElements);

    // Function to update visual state of keys
    const updateVisualStateOfKeys = () => {
        const keys = ['Left', 'Up', 'Right', 'Down', 'Heavy', 'Special'];
        keys.forEach(key => {
            const keyElement = document.querySelector(`#${key}`);
            keyElement.style.backgroundColor = EnhancedOverlay.currentInput & keys[key] ? 'grey' : '#333';
        });
    };

    // Function to reset the key table to its default state
    const resetKeyTable = () => {
        const keys = ['Left', 'Up', 'Right', 'Down', 'Heavy', 'Special'];
        keys.forEach(key => {
            const keyElement = document.querySelector(`#${key}`);
            keyElement.style.backgroundColor = '#333333';
        });
    };

    // Apply opacity to the key table based on user input
    const applyKeyTableOpacity = opacity => {
        const keyTable = document.querySelector("#keyboard-overlay");
        keyTable.style.opacity = opacity;
        // Placeholder for saving the setting
    };

    // Handling input for updating key visuals
    EnhancedOverlay.processInput = (inputData) => {
        // Assuming inputData is a JSON string with input flags
        const inputFlags = JSON.parse(inputData);
        EnhancedOverlay.currentInput = inputFlags.input;
        updateVisualStateOfKeys();
    };

    // Main function to setup the keyboard overlay
    const setupKeyboardOverlay = () => {
        
    };

    // Initialization
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', setupKeyboardOverlay);
    } else {
        setupKeyboardOverlay();
    }
})();
