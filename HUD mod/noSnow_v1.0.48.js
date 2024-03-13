// ==UserScript==
// @name        No Snow
// @namespace   http://tampermonkey.net/
// @match       https://bonk.io/gameframe-release.html
// @run-at      document-start
// @grant       none
// @version     1.0.48
// @author      FeiFei
// @license     MIT
// @description No snow
// ==/UserScript==

// ! Matching Bonk Version 48

const injectorName = `No Snow`;
const errorMsg = `Whoops! ${injectorName} was unable to load.
This may be due to an update to Bonk.io. If so, please report this error!
This could also be because you have an extension that is incompatible with \
${injectorName}`;

function injector(src) {
    let newSrc = src;

    let orgCode = `z4R[96][z4R[7][1106]]=function(){var l9J=[arguments];l9J[1]=m8fvh;l9J[8]=z4R[96][l9J[1][1630]]();z7J.B6A();return l9J[8] >= 335 || l9J[8] <= 3;}`;
    let newCode = `z4R[96][z4R[7][1106]] = function () {
        var l9J = [arguments];
        l9J[1] = m8fvh;
        l9J[8] = z4R[96][l9J[1][1630]]();
        z7J.B6A();
        return false;
    };`;

    newSrc = newSrc.replace(orgCode, newCode);

    if (src === newSrc) throw "Injection failed!";
    console.log(injectorName + " injector run");

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
