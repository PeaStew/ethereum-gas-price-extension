var appData = {
  gasData: {}
};

var logData = '';

var themeData = [
  {
    id: 0,
    name: "dark",
    background: "#000000ff",
    fontcolour: "#13b5ecff"
  },
  {
    id: 1,
    name: "light",
    background: "#13b5ecff",
    fontcolour: "#ffffffff"
  }
]



function updateBadge() {
  chrome.storage.sync.get({
    gasPriceOption: "fast",
  }, function (items) {
    const gasPrice = appData.gasData[items.gasPriceOption].gwei;
    chrome.action.setBadgeText({ text: String(gasPrice) });
  });
}

function getProviderUrl(provider) {
  switch (provider) {
    case 'ftmscan':
      return "https://gftm.blockscan.com/gasapi.ashx/gasoracle?apikey=key&method=gasoracle";
      break;
  }
}

function addToLog(logEntry) {
  logData = logData + '<p>' + logEntry;
  document.getElementById("logData").innerHTML = logData;
}

function fetchGasPrice() {

  return new Promise((resolve, reject) => {
    chrome.storage.sync.get({
      provider: "ftmscan",
    }, function (items) {
      const url = getProviderUrl(items.provider);

      fetch(url).then((res) => { return res.json() })
        .then(data => {
          // Store the current data for the popup page
          appData.gasData = parseApiData(data, items.provider);
          // Update badge
          updateBadge();
          // Update Popup
          updateDom();
          // Resolve promise on success
          resolve();
        })
        .catch((error) => {
          reject();
        });
    });
  });

}

function updateDom() {
  document.getElementById("ftmprice").innerHTML = 'FTM/' + appData.gasData.price.currency + ': ' + appData.gasData.price.symbol + appData.gasData.price.value;
  document.getElementById("ftmlastblock").innerHTML = 'Block: ' + appData.gasData.blockchain.lastblock;
  document.getElementById("standardname").innerHTML = appData.gasData.standard.name;
  document.getElementById("fastname").innerHTML = appData.gasData.fast.name;
  document.getElementById("rapidname").innerHTML = appData.gasData.rapid.name;
  document.getElementById("standardgwei").innerHTML = appData.gasData.standard.gwei;
  document.getElementById("fastgwei").innerHTML = appData.gasData.fast.gwei;
  document.getElementById("rapidgwei").innerHTML = appData.gasData.rapid.gwei;
  document.getElementById("standardwait").innerHTML = appData.gasData.standard.wait;
  document.getElementById("fastwait").innerHTML = appData.gasData.fast.wait;
  document.getElementById("rapidwait").innerHTML = appData.gasData.rapid.wait;
}

function setDefaultTheme()
{
  var x = document.getElementById("themeButton");
  chrome.storage.sync.get(['theme'], function(result) {
    if(result.theme === "" || result.theme === null){
      chrome.storage.sync.set({"theme": 0});
    }       
  });
  setExistingTheme();
}

function setExistingTheme()
{
    chrome.storage.sync.get(['theme'], function(result) {
        changeColor(result.theme);           
     });
}

function toggleTheme() { 
  var x = document.getElementById("themeButton");   
    chrome.storage.sync.get(['theme'], function(result) {
      if(result.theme + 1 >= themeData.length){
        changeColor(0);
        fetchGasPrice();     
      } 
      else{
        changeColor(result.theme + 1);
        fetchGasPrice();     
      }     
    });
}

function changeColor(themeId) {
  var themeButton = document.getElementById("themeButton");
  var refreshButton = document.getElementById("refreshButton");
  var githubLink = document.getElementById("githubLink");
  var ftmscanlogo = document.getElementById("ftmscanlogo");
  
        document.body.style.background = themeData[themeId].background;
        document.body.style.color = themeData[themeId].fontcolour;
        themeButton.className = "fantom-theme-" + themeId;
        refreshButton.className = "fantom-theme-" + themeId;
        githubLink.className = "fantom-theme-" + themeId;
        themeButton.src = getSvgSrc("theme", themeId);
        ftmscanlogo.src = getSvgSrc("ftmscan", themeId);
        refreshButton.src = getSvgSrc("refresh", themeId);
        githubLink.src = getSvgSrc("github", themeId);
        // x.innerHTML = buttonText;
        chrome.storage.sync.set({"theme": themeId});  
}

function getSvgSrc(svgName, themeId)
{
  var imageDir = "../static/";
  return imageDir + svgName + "-" + themeId + ".svg";
}

document.addEventListener('DOMContentLoaded', function () {
  document.getElementById('themeButton').addEventListener('click', toggleTheme);
});

document.addEventListener('DOMContentLoaded', function () {
  document.getElementById('refreshButton').addEventListener('click', fetchGasPrice);
});



function parseApiData(apiData, provider) {
  if (provider === "ftmscan") {
    console.log("parseApiData" + apiData);
    return {
      "standard": {
        "name": "Standard",
        "gwei": parseInt(apiData.result.SafeGasPrice),
        "wait": "30-60 seconds"
      },
      "fast": {
        "name": "Fast",
        "gwei": parseInt(apiData.result.ProposeGasPrice),
        "wait": "10-30 seconds"
      },
      "rapid": {
        "name": "Rapid",
        "gwei": parseInt(apiData.result.FastGasPrice),
        "wait": "5-10 seconds"
      },
      "price": {
        "value": parseFloat(apiData.result.UsdPrice),
        "currency": "USD",
        "symbol": "$"
      },
      "blockchain": {
        "lastblock": parseInt(apiData.result.LastBlock)
      }
    };
  }
}
fetchGasPrice();
setDefaultTheme();