// ==UserScript==
// @name         LBB_Injector
// @namespace    http://tampermonkey.net/
// @version      2.0.48
// @description  Injector
// @author       FeiFei
// @license MIT
// @match        https://bonk.io/gameframe-release.html
// @run-at       document-start
// @grant        none
// ==/UserScript==

// ! Matching Bonk Version 48

const injectorName = `LBB_Injector`;
const errorMsg = `Whoops! ${injectorName} was unable to load.
This may be due to an update to Bonk.io. If so, please report this error!
This could also be because you have an extension that is incompatible with \
${injectorName}`;

function injector(src) {
    let newSrc = src;

    // let inputStateVariable = newSrc.match(/(?<=inputState:).{1,15}(?=,)/)[0];

    let orgCode = `function E3(r1d,T$2){var N$w=[arguments];z7J.c94();N$w[9]=m8fvh;N$w[7]=N$w[0][1][N$w[9][138]]()[N$w[9][187]];N$w[5]=N$w[0][0][N$w[9][138]]()[N$w[9][115]];if(!M1j[87][N$w[7]]){M1j[87][N$w[7]]=[];}if(!M1j[87][N$w[7]][N$w[5]]){M1j[87][N$w[7]][N$w[5]]={count:1,players:[N$w[0][0][N$w[9][138]]()[N$w[9][141]]]};}else {M1j[87][N$w[7]][N$w[5]][N$w[9][188]]++;M1j[87][N$w[7]][N$w[5]][N$w[9][121]][N$w[9][101]](N$w[0][0][N$w[9][138]]()[N$w[9][141]]);}}`;
    let newCode = `
        function E3(r1d, T$2) {
            var N$w = [arguments];
            z7J.c94();
            N$w[9] = m8fvh;
            N$w[7] = N$w[0][1][N$w[9][138]]()[N$w[9][187]];
            N$w[5] = N$w[0][0][N$w[9][138]]()[N$w[9][115]];
            
            // Check if LBB_Main is loaded
            if (window.LBB_Main.capZoneEvent) {
                window.LBB_Main.capZoneEvent(N$w[0][0].m_userData.arrayID);
            }
            
            if (!M1j[87][N$w[7]]) {
                M1j[87][N$w[7]] = [];
            }
            if (!M1j[87][N$w[7]][N$w[5]]) {
                M1j[87][N$w[7]][N$w[5]] = {
                    count: 1,
                    players: [N$w[0][0][N$w[9][138]]()[N$w[9][141]]],
                };
            } else {
                M1j[87][N$w[7]][N$w[5]][N$w[9][188]]++;
                M1j[87][N$w[7]][N$w[5]][N$w[9][121]][N$w[9][101]](
                    N$w[0][0][N$w[9][138]]()[N$w[9][141]]);}}`;

    newSrc = newSrc.replace(orgCode, newCode);
    
    orgCode = `return M1j[945];`;
    newCode = `
        // Check if LBB_Main is loaded
        if (window.LBB_Main.stepEvent) {
            window.LBB_Main.stepEvent(M1j[945]);
        }
        
        return M1j[945];`;

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
