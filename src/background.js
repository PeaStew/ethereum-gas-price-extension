var appData = {
    gasData: {}
};

const providers = [
    {
        id: "ftmscan",
        name: "FTMScan",
        url: "https://gftm.blockscan.com/gasapi.ashx/gasoracle?apikey=key&method=gasoracle"
    }
]

const themeData = [
    {
        id: 0,
        name: "dark",
        background: "#000000ff",
        fontcolour: "#13b5ecff",
        class: "fantom-theme-0",
        icons: {
            fantom: "../static/fantom-dark.svg",
            ftmscan: "../static/ftmscan-dark.svg",
            refresh: "../static/refresh-dark.svg",
            github: "../static/github-dark.svg",
            theme: "../static/theme-dark.svg",
            badge: "../static/icon.png"
        }
    },
    {
        id: 1,
        name: "light",
        background: "#13b5ecff",
        fontcolour: "#ffffffff",
        class: "fantom-theme-1",
        icons: {
            fantom: "../static/fantom-1.svg",
            ftmscan: "../static/ftmscan-light.svg",
            refresh: "../static/refresh-light.svg",
            github: "../static/github-light.svg",
            theme: "../static/theme-light.svg",
            badge: "../static/icon.png"
        }
    }
];


chrome.runtime.onInstalled.addListener(() => {
    chrome.alarms.create('fetch_gas_price', {
        "periodInMinutes": 1
    });
    chrome.storage.sync.set({ fgpe_app_data: appData });

    chrome.storage.sync.set({ fgpe_theme_data: themeData });

    chrome.storage.sync.set({ fgpe_providers: providers });

    chrome.storage.sync.set({ fgpe_selected_provider: providers[0] });

    chrome.storage.sync.set({ fgpe_selected_theme: themeData[0] });

});

chrome.alarms.onAlarm.addListener(alarm => {
    fetchGasPrice();
});

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    console.log(request.message);
    if (request.message === 'updateGasPrice') {
        fetchGasPrice();
    }
    else if (request.message === 'toggleThemeData') {
        chrome.storage.sync.get(['fgpe_selected_theme'],(data) => {
            var selectedTheme = data.fgpe_selected_theme;
        if (selectedTheme.id === themeData.length - 1) {
            chrome.storage.sync.set({ fgpe_selected_theme: themeData[0]});
        }
        else {
            chrome.storage.sync.set({ fgpe_selected_theme: themeData[selectedTheme.id + 1]});
        }
    })
    sendResponse(true);
    }
});

function updateBadge() {
    chrome.storage.sync.get(['fgpe_app_data'], (data) => {
        var priceData = data.fgpe_app_data;
        chrome.action.setBadgeText({ text: String(priceData["fast"].gwei) });
    });
    
}

function fetchGasPrice() {
    return new Promise((resolve, reject) => {
        chrome.storage.sync.get(['fgpe_selected_provider'], (provider) => {
        var url = provider.fgpe_selected_provider.url;
        fetch(url)
        .then((res) => { 
            return res.json();
         })
        .then((response) =>{
            chrome.storage.sync.set({ fgpe_app_data: parseApiData(response.result, provider.fgpe_selected_provider) });
            updateBadge();
            resolve();
        })
        .catch((error) => {
            reject();
        })
    })
    });
    
}

function parseApiData(apiData, provider) {
    //console.log("parseApiData: " +  JSON.stringify(apiData));
    //console.log("parseProvider: " + JSON.stringify(provider));
    if (provider.id === "ftmscan") {
        
        return {
            "standard": {
                "name": "Standard",
                "gwei": parseInt(apiData.SafeGasPrice),
                "wait": "30-60 seconds"
            },
            "fast": {
                "name": "Fast",
                "gwei": parseInt(apiData.ProposeGasPrice),
                "wait": "10-30 seconds"
            },
            "rapid": {
                "name": "Rapid",
                "gwei": parseInt(apiData.FastGasPrice),
                "wait": "5-10 seconds"
            },
            "price": {
                "value": parseFloat(apiData.UsdPrice),
                "currency": "USD",
                "symbol": "$"
            },
            "blockchain": {
                "lastblock": parseInt(apiData.LastBlock)
            }
        };
    }
}

fetchGasPrice();

