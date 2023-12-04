// ==UserScript==
// @name         LBB_Injector
// @namespace    http://tampermonkey.net/
// @version      1.0
// @description  Injector
// @author       FeiFei
// @license MIT
// @match        https://bonk.io/gameframe-release.html
// @run-at       document-start
// @grant        none
// ==/UserScript==

// Name of the injector and the error message to be displayed in case of failure
const injectorName = `LBB_Injector`;
const errorMsg = `Whoops! ${injectorName} was unable to load.
This may be due to an update to Bonk.io. If so, please report this error!
This could also be because you have an extension that is incompatible with \
${injectorName}`;

function injector(src) { // Main injection function, meant to modify the input code
    let newSrc = src; // copy of origin

    // Searching for a specific variable name within the code using regex
    let inputStateVariable = newSrc.match(/(?<=inputState:).{1,15}(?=,)/)[0];

    // The original z4 function, which will replace with new code
    let orgCode = `function z4(J7H,e9I){var X5C=[arguments];X5C[2]=i4jFD;X5C[4]=X5C[0][1][X5C[2][138]]()[X5C[2][184]];X5C[3]=X5C[0][0][X5C[2][138]]()[X5C[2][115]];if(!z0F[1][X5C[4]]){z0F[1][X5C[4]]=[];}j2b.o$G();if(!z0F[1][X5C[4]][X5C[3]]){z0F[1][X5C[4]][X5C[3]]={count:1,players:[X5C[0][0][X5C[2][138]]()[X5C[2][141]]]};}else {z0F[1][X5C[4]][X5C[3]][X5C[2][185]]++;z0F[1][X5C[4]][X5C[3]][X5C[2][121]][X5C[2][101]](X5C[0][0][X5C[2][138]]()[X5C[2][141]]);}}`;
    let newCode = `function z4(J7H, e9I) { 
                        var X5C = [arguments];
                        X5C[2] = i4jFD;
                        X5C[4] = X5C[0][1][X5C[2][138]]()[X5C[2][184]];
                        X5C[3] = X5C[0][0][X5C[2][138]]()[X5C[2][115]];
                        
                        if (window.LBB_Main.playerInCZ) {
                            window.LBB_Main.playerInCZ(X5C[0][0].m_userData.arrayID);
                        }
                        
                        if (!z0F[1][X5C[4]]) {
                            z0F[1][X5C[4]] = [];
                        }
                        j2b.o$G();
                        if (!z0F[1][X5C[4]][X5C[3]]) {
                            z0F[1][X5C[4]][X5C[3]] = { count: 1, players: [X5C[0][0][X5C[2][138]]()[X5C[2][141]]] };
                        } else {
                            console.log("Meow 3");
                            z0F[1][X5C[4]][X5C[3]][X5C[2][185]]++;
                            z0F[1][X5C[4]][X5C[3]][X5C[2][121]][X5C[2][101]](X5C[0][0][X5C[2][138]]()[X5C[2][141]]);
                        }
                        
                        //console.log("z4");
                    }`;
    // replace the old code with new code
    newSrc = newSrc.replace(orgCode, newCode);

    return newSrc;
}

// Compatibility with Excigma's code injector userscript
//check if other userscripts are also attempting to modify Bonk.io's code
// If not, create an empty array to hold these injectors
if (!window.bonkCodeInjectors) window.bonkCodeInjectors = [];
window.bonkCodeInjectors.push((bonkCode) => {
    // Add our injection function to the array of injectors
    // If the injection fails, display an error message
    try {
        return injector(bonkCode);
    } catch (error) {
        alert(errorMsg);
        throw error;
    }
});
// Print a message to the console informing the user that the injector has been loaded
console.log(injectorName + " injector loaded");