/*
GENERAL HELPER FUNCTIONS
*/
function getElement(elementName) {
   const element = document.querySelector(`#${elementName}`);
   return element;
}
function formatFloat(float, dp = Game.settings.dpp) {
   const mult = Math.pow(10, dp);
   const formattedFloat = Math.round((float + Number.EPSILON) * mult) / mult;
   return formattedFloat;
}
function formatProg(current, goal, preventOverflow = false) {
   const progressType = Game.settings.progressType;
   let progress = current / goal * 100;
   if (preventOverflow) progress = Math.min(progress, 100);

   let type;
   if (progress >= 100) {
      type = `<span class="progress-green">`;
   } else if (progress >= 50) {
      type = `<span class="progress-orange">`;
   } else {
      type = `<span class="progress-red">`;
   }

   switch (progressType) {
      case 1:
         return type + formatFloat(progress) + "%</span>";
      case 2:
         return type + formatFloat(current) + "</span>/" + formatFloat(goal);
      case 3:
         return formatFloat(current) + "/" + formatFloat(goal) + type + " (" + formatFloat(progress) + "%)</span>";
      default:
         console.warn(`WARNING! Progress type ${progressType} not found.`);
   }
}
function randomInt(min, max, inclusive = false) {
   const add = inclusive ? 1 : 0;
   const randomInt = Math.floor(Math.random() * (max - min + add)) + min;
   return randomInt;
}
function randomFloat(min, max) {
   const randomFloat = Math.random() * (max - min) + min;
   return randomFloat;
}
function randomSign() {
   const sign = Math.sign(randomFloat(1, -1));
   return sign;
}
function scalePX(px, scaleType) {
   switch (scaleType) {
      case 'vw':
         return 100 / window.innerWidth * px;
      case 'vh':
         return 100 / window.innerHeight * px;
      default:
         return 0;
   }
}
function getCurve() {
   const rand = randomFloat(-1, 1);
   const result = Math.sin((rand * Math.PI + Math.PI) / 2);
   return result;
}
function randElem(arr) {
   const elem = arr[randomInt(0, arr.length)];
   return elem;
}
function capitalize(str) {
   const first = str.split('')[0].toUpperCase();
   const rest = str.substring(1, str.split('').length);
   return first + rest;
}
function plural(str) {
   return str + 's';
}
function slugCase(str) {
   const slug = str.replace(/([A-Z])/g, '-$1').toLowerCase();
   return slug;
}
function topHeight() {
   return getElement("info-bar").getBoundingClientRect().height;
}
function randomiseArray(arr) {
   copyArr = arr.slice();
   returnArr = [];
   const len = copyArr.length;
   for (let i = 0; i < len; i++) {
      const randIdx = Math.floor(Math.random() * copyArr.length);
      returnArr.push(copyArr[randIdx]);
      copyArr.splice(randIdx, 1);
   }
   return returnArr;
}
function timer(ms) {
   return new Promise(res => setTimeout(res, ms));
}



/***** SOUNDS  *****/
class Sound {
   constructor({ path, volume = 1 }) {
      this.audio = new Audio(path);
      this.audio.volume = volume;
      this.audio.play();
   }
}



/***** LOOT TABLES *****/
class LootTable {
   constructor() {
      this.items = {};
   }
   addItem(item, weight) {
      if (this.items.hasOwnProperty(item)) {
         return new Error("Item already exists!");
      }

      this.items[item] = weight;
   }
   removeItem(item) {
      if (!this.items.hasOwnProperty(item)) {
         return new Error("Item does not exist!");
      }

      delete this.items[item];
   }
   listItems() {
      console.table(this.items);
   }
   getRandom() {
      let totalWeight = 0;
      for (const weight of Object.values(this.items)) {
         totalWeight += weight;
      }
      
      const itemWeight = randomInt(0, totalWeight) + 1;
      let currentWeight = 0;
      for (const item of Object.entries(this.items)) {
         currentWeight += item[1];
         if (itemWeight <= currentWeight) {
            return item[0];
         }
      }
   }
}



/***** COOKIE STUFF *****/
class CookieObjectManager {
   constructor(name, obj, prop) {
      this.name = name;
      this.obj = obj;
      this.prop = prop;
      this.set();
   }
   set() {
      // If the value of the cookie is not set, make it a default value.
      if (getCookie(this.name) === '') {
         let newCookie = '';
         Object.keys(this.obj).forEach(() => newCookie += '0');
         setCookie(this.name, newCookie, 31);
      }
      // Set the values of the supplied object
      Object.keys(this.obj).forEach((propName, idx) => {
         this.obj[propName][this.prop] = parseInt(getCookie(this.name).split('')[idx]) === 0 ? false : true;
      });
   }
   update() {
      let newCookie = '';
      for (const item of Object.values(this.obj)) {
         newCookie += item[this.prop] ? '1' : '0';
      }
      setCookie(this.name, newCookie, 31);
   }
}

const cookies = {};
const LoadData = () => {
   cookies.unlockedMalware = new CookieObjectManager('unlockedMalware', popupData, 'unlocked');
   cookies.receivedLetters = new CookieObjectManager('receivedLetters', letters, 'received');
   cookies.openedLetters = new CookieObjectManager('openedLetters', letters, 'opened');
   cookies.unlockedShops = new CookieObjectManager('unlockedShops', blackMarketShops, 'unlocked');
   cookies.unlockedMalware = new CookieObjectManager("unlockedMalware", popupData, "unlocked");

   setSettingsCookie();
   setMiscCookie();
   setOpenedRewards();
   if (typeof Game !== "undefined") {
      setApplicationPositions();
      setOwnedApplications();
   }
}

const getSettingsCookie = () => {
   const dpp = Game.settings.dpp.toString();
   const progressType = Game.settings.progressType.toString();
   const animatedBGs = Game.settings.animatedBGs ? '1' : '0';
   const rainLetters = Game.settings.rainLetters ? '1' : '0';
   return dpp + progressType + animatedBGs + rainLetters;
}
function setSettingsCookie() {
   if (typeof Game === 'undefined') return;

   // Char 1: DPP (0-9) decimal
   // Char 2: Progress type (1-3)
   // Char 3: Animated BGs (0/1)
   // Char 4: Rain letters (0/1)

   let settingsCookie = getCookie('settings');
   if (settingsCookie === "") {
      settingsCookie = getSettingsCookie();
      setCookie('settings', settingsCookie);
      return;
   }

   settingsCookie.split('').forEach((char, idx) => {
      switch (idx + 1) {
         case 1:
            Game.settings.dpp = parseInt(char);
            break;
         case 2:
            Game.settings.progressType = parseInt(char);
            break;
         case 3:
            const animatedBGs = char === '1' ? true : false;
            Game.settings.animatedBGs = animatedBGs;
            break;
         case 4:
            const rainLetters = char === '1' ? true : false;
            Game.settings.rainLetters = rainLetters;
            break;
         default:
            console.warn(`WARNING! Char ${idx + 1} not found in the settings cookie.`);
      }
   });
}
function updateSettingsCookie() {
   setCookie('settings', getSettingsCookie());
}


function setMiscCookie() {
   if (typeof Game === 'undefined') return;

   // Bit 1: Black market (binary) (0/1 unlocked/locked)
   // Bits 2-3: Lorem Promotion Status (hexadecimal)
   // Bit 4: Job (0 = intern, etc.)
   // Bits 5-6: Background image (generator)

   let miscCookie = getCookie('misc');
   if (miscCookie === "") {
      miscCookie = "0000";
      setCookie('misc', miscCookie);
   }

   const bits = miscCookie.split('');
   let promotionHex = "";
   let currentBackgroundImage = "";
   bits.forEach((bit, idx) => {
      switch (idx + 1) {
         case 1:
            // Black Market
            if (bit === '1') {
               Game.blackMarket.unlockBlackMarket();
            }
            break;
         case 2:
            // Lorem promotion status
            promotionHex += bit;
            break;
         case 3:
            // Lorem promotion status
            promotionHex += bit;
            const quotaIndex = parseInt(promotionHex, 16);
            Game.loremQuota.quotaIdx = quotaIndex;
            
            const quota = loremQuotaData[quotaIndex].requirement;
            Game.loremQuota.setup(quota);
            break;
         case 4:
            const jobIdx = parseInt(bit);
            const jobArr = Object.entries(loremCorpData.jobs);
            const job = jobArr[jobIdx][0];

            Game.loremCorp.setup(job);
            break;
         case 5:
            currentBackgroundImage += bit;
            break;
         case 6:
            currentBackgroundImage += bit;
            Game.startMenu.applications["menu-preferences"].currentBackgroundImage = parseInt(currentBackgroundImage);
            break;
         default:
            console.warn('Bit ' + (idx + 1) + ' not accessed in misc cookie!')
      }
   });
}
function updateMiscCookie() {
   let newCookie = "";

   // Black market
   newCookie += Game.blackMarket.unlocked ? '1' : '0';

   // Lorem promotion status
   // Find index of current quota
   let quotaIndex = 0;
   for (const quota of Object.values(loremQuotaData)) {
      if (quota.requirement == Game.loremQuota.quota) {
         break;
      }
      quotaIndex++;
   }
   let quotaHex = quotaIndex.toString(16);
   // Add additional 0 if malformed length
   if (quotaHex.length === 1) {
      quotaHex = '0' + quotaHex;
   }
   newCookie += quotaHex;

   // Lorem Corp Job
   let jobIndex = -1;
   Object.keys(loremCorpData.jobs).every((position, idx) => {
      if (position === Game.loremCorp.job) {
         jobIndex = idx;
         return false;
      }
      return true;
   });
   newCookie += jobIndex;

   let currentBackgroundImage = Game.startMenu.applications["menu-preferences"].currentBackgroundImage.toString();
   if (currentBackgroundImage.length === 1) {
      currentBackgroundImage = "0" + currentBackgroundImage;
   }
   newCookie += currentBackgroundImage;

   setCookie("misc", newCookie, 31);
}

function setOpenedRewards() {
   if (getCookie("openedRewards") == "") {
      let resultCookie = "";
      Object.keys(letters).forEach(() => resultCookie += "0");
      setCookie("openedRewards", resultCookie, 31);
   }

   Object.keys(letters).forEach((letter, index) => {
      if (letters[letter].rewards != undefined) {
         letters[letter].rewards.opened = parseInt(getCookie("openedRewards").split("")[index]) == 1 ? true : false;
      }
   });
}
function updateOpenedRewardsCookie() {
   let newCookie = "";
   for (const letter of Object.values(letters)) {
      if (letter.rewards == undefined) {
         newCookie += "0";
      } else {
         newCookie += letter.rewards.opened ? "1" : "0";
      }
   }

   setCookie("openedRewards", newCookie, 31);
}

function setApplicationPositions() {
   let cookie = getCookie("application-positions");
   if (cookie === "") {
      console.log("default engaged");
      for (const applicationCategory of Object.values(Game.startMenu.applications["menu-application-shop"].applications)) {
         for (const applicationName of Object.keys(applicationCategory)) {
            const DEFAULT_VISIBLE_APPLICATIONS = ["loremCounter"];
            const isVisible = DEFAULT_VISIBLE_APPLICATIONS.includes(applicationName) ? "1" : "0";
            cookie += `0x0x${isVisible},`
         }
      }
      cookie = cookie.substring(0, cookie.length - 1);
   }

   const applicationPositions = cookie.split(",");
   let i = 0;
   for (const applicationCategory of Object.values(Game.startMenu.applications["menu-application-shop"].applications)) {
      for (const {objID} of Object.values(applicationCategory)) {
         if (objID === "") return;

         const applicationPosition = applicationPositions[i];
         i++;
         console.log(applicationPosition);
         const parts = applicationPosition.split("x");
         const obj = getElement(objID);
         const x = parseFloat(parts[0]),
         y = parseFloat(parts[1]);
         obj.style.left = `${x}px`;
         obj.style.top = `${y}px`;
         
         const isVisible = parseInt(parts[2]);
         if (isVisible) {
            obj.classList.remove("hidden");
            applications[objID].open = true;
         } else {
            obj.classList.add("hidden");
            applications[objID].open = false;
         }
      }
   }
}
function updateApplicationPositions() {
   const previousCookie = getCookie("application-positions");
   console.log("Previous cookie: " + previousCookie);
   let newCookie = "";
   let i = 0;
   for (const applicationCategory of Object.values(Game.startMenu.applications["menu-application-shop"].applications)) {
      for (const application of Object.values(applicationCategory)) {
         const objID = application.objID;
         if (objID === "") {
            newCookie += "0x0x0,";
            continue;
         }

         const obj = getElement(objID);
         const bounds = obj.getBoundingClientRect();
         console.log(bounds);

         const previousCookieSegment = previousCookie.split(",")[i];
         console.log(previousCookieSegment);
         
         if (bounds.y === 0) {
            // newCookie += "0x0x0,";
            const x = previousCookieSegment.split("x")[0];
            const y = previousCookieSegment.split("x")[1];
            newCookie += `${x}x${y}x0,`;
            console.log(`${x}x${y}x0,`);
            continue;
         }
         
         const applicationData = applications[objID];
         const isVisible = applicationData.open ? "1" : "0";
         console.log(isVisible);
         const x = Math.max(bounds.x, 0);
         const y = Math.max(bounds.y - topHeight(), 0);
         newCookie += `${x}x${y}x${isVisible},`;
         i++;
      }
   }
   console.log(newCookie);
   newCookie = newCookie.substring(0, newCookie.length - 1);
   setCookie("application-positions", newCookie);
}

function setOwnedApplications() {
   let cookie = getCookie("owned-applications");
   if (cookie === "") {
      cookie = 0;
      let num = 0;
      for (const applicationCategory of Object.values(Game.startMenu.applications["menu-application-shop"].applications)) {
         for (const application of Object.values(applicationCategory)) {
            if (application.isDefaultApplication) cookie += Math.pow(2, num);
            num++;
         }
      }
   }

   let binary = parseInt(cookie).toString(2);
   
   let applicationCount = 0;
   for (const applicationCategory of Object.values(Game.startMenu.applications["menu-application-shop"].applications)) {
      Object.values(applicationCategory).forEach(() => applicationCount++);
   }
   while (binary.length < applicationCount) {
      binary = "0" + binary;
   }

   let num = 0;
   for (const applicationCategory of Object.values(Game.startMenu.applications["menu-application-shop"].applications).reverse()) {
      for (const application of Object.values(applicationCategory).reverse()) {
         if (binary[num++] === "1") {
            application.owned = true;
         } else {
            application.owned = false;
         }
      }
   }
}
function updateOwnedApplications() {
   let decimal = 0;
   let num = 0;
   for (const applicationCategory of Object.values(Game.startMenu.applications["menu-application-shop"].applications)) {
      for (const application of Object.values(applicationCategory)) {
         if (application.owned) decimal += Math.pow(2, num);
         num++;
      }
   }
   setCookie("owned-applications", decimal);
}

function setCookie(cname, cvalue, exdays) {
   if (exdays) {
      var d = new Date();
      d.setTime(d.getTime() + (exdays * 24 * 60 * 60 * 1000));
      var expires = 'expires=' + d.toGMTString();
   } else {
      var expires = "";
   }
   document.cookie = cname + '=' + cvalue + ';' + expires + ';path=/';
}

function getCookie(cname) {
   var name = cname + '=';
   var decodedCookie = decodeURIComponent(document.cookie);
   var ca = decodedCookie.split(';');
   for (var i = 0; i < ca.length; i++) {
      var c = ca[i];
      while (c.charAt(0) == ' ') {
         c = c.substring(1);
      }
      if (c.indexOf(name) == 0) {
         return c.substring(name.length, c.length);
      }
   }
   return '';
}