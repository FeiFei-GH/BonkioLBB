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

const injectorName = `LBB_Injector`;
const errorMsg = `Whoops! ${injectorName} was unable to load.
This may be due to an update to Bonk.io. If so, please report this error!
This could also be because you have an extension that is incompatible with \
${injectorName}`;

function injector(src) {
    let newSrc = src;
    
    let inputStateVariable = newSrc.match(/(?<=inputState:).{1,15}(?=,)/)[0];
    
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
    
    newSrc = newSrc.replace(orgCode, newCode);

    return newSrc;
}

// Compatibility with Excigma's code injector userscript
if (!window.bonkCodeInjectors) window.bonkCodeInjectors = [];
window.bonkCodeInjectors.push((bonkCode) => {
    try {
        return injector(bonkCode);
    } catch (error) {
        alert(errorMsg);
        throw error;
    }
});

console.log(injectorName + " injector loaded");