  var appData = {
    gasData: {}
  };

  chrome.runtime.onInstalled.addListener(() => {
    chrome.alarms.create('fetch_gas_price',{ 
    "periodInMinutes": 1
    });
  });

  chrome.alarms.onAlarm.addListener(alarm => {
    fetchGasPrice();
  });
  
  
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
            // Resolve promise on success
            resolve();
          })
          .catch((error) => {
            reject();
          });
      });
    });
  
  }
  
 
   
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

