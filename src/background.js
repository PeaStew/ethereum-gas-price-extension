var appData = {
  gasData: {}
};

chrome.alarms.create('fetch_gas_price',{
  "periodInMinutes": 2
});

chrome.alarms.onAlarm.addListener(alarm => {
  fetchGasPrice();
});

function updateBadge() {
  chrome.storage.sync.get({
    gasPriceOption: "standard",
  }, function(items) {
    const gasPrice = appData.gasData[items.gasPriceOption].gwei;
    chrome.browserAction.setBadgeText({text: String(gasPrice)});
  });
}

function getProviderUrl(provider) {
  switch(provider) {
    case 'ftmscan':
      return "https://gftm.blockscan.com/gasapi.ashx/gasoracle?apikey=key&method=gasoracle";
      break;
  }
}

function fetchGasPrice() {
  return new Promise((resolve, reject)=>{
    chrome.storage.sync.get({
      provider: "ftmscan",
    }, function(items) {
      const url = getProviderUrl(items.provider);

      fetch(url).then((res) => {return res.json()})
      .then(data => {
        // Store the current data for the popup page
        appData.gasData = parseApiData(data, items.provider);
        // Update badge
        updateBadge();

        // Resolve promise on success
        resolve();
      })
      .catch((error) => {
        reject();
      });
    });
  });
}

// Create a consistent structure for data so we can use multiple providers
function parseApiData(apiData, provider) {

  if(provider === "ftmscan") {
    return {
      "slow": {
        "gwei": parseFloat(apiData.SafeGasPrice),
        "wait": ">60 seconds"
      },
      "standard": {
        "gwei": parseFloat(apiData.ProposeGasPrice),
        "wait": "30-60 seconds"
      },
      "fast": {
        "gwei": parseFloat(apiData.FastGasPrice),
        "wait": "10-30 seconds"
      },
      "rapid": {
        "gwei": parseFloat(apiData.FastGasPrice),
        "wait": "5-10 seconds"
      }
    }
  }
  
}

fetchGasPrice(); // Initial fetch