function updateDom() {
    chrome.storage.sync.get(['fgpe_app_data'], (data) => {
        var appData = data.fgpe_app_data;
        document.getElementById("ftmprice").innerHTML = 'FTM/' + appData.price.currency + ': ' + appData.price.symbol + appData.price.value;
        document.getElementById("ftmlastblock").innerHTML = 'Block: ' + appData.blockchain.lastblock;
        document.getElementById("standardname").innerHTML = appData.standard.name;
        document.getElementById("fastname").innerHTML = appData.fast.name;
        document.getElementById("rapidname").innerHTML = appData.rapid.name;
        document.getElementById("standardgwei").innerHTML = appData.standard.gwei;
        document.getElementById("fastgwei").innerHTML = appData.fast.gwei;
        document.getElementById("rapidgwei").innerHTML = appData.rapid.gwei;
        document.getElementById("standardwait").innerHTML = appData.standard.wait;
        document.getElementById("fastwait").innerHTML = appData.fast.wait;
        document.getElementById("rapidwait").innerHTML = appData.rapid.wait;
    });
}

function loadTheme() {
    chrome.storage.sync.get(['fgpe_selected_theme'], (data) => {
        var selectedTheme = data.fgpe_selected_theme;
        var themeButton = document.getElementById("themeButton");
        var refreshButton = document.getElementById("refreshButton");
        var githubLink = document.getElementById("githubLink");
        var ftmscanlogo = document.getElementById("ftmscanlogo");
        document.body.style.background = selectedTheme.background;
        document.body.style.color = selectedTheme.fontcolour;
        themeButton.className = selectedTheme.class;
        refreshButton.className = selectedTheme.class;
        githubLink.className = selectedTheme.class;
        themeButton.src = selectedTheme.icons.theme;
        ftmscanlogo.src = selectedTheme.icons.ftmscan;
        refreshButton.src = selectedTheme.icons.refresh;
        githubLink.src = selectedTheme.icons.github;
    });
}

// #region Event Functions functions

document.addEventListener('DOMContentLoaded', function () {
    document.getElementById('themeButton').addEventListener('click', chrome.runtime.sendMessage({ message: "toggleThemeData" }, () => {
        loadTheme();
    })
    );
});


document.addEventListener('DOMContentLoaded', function () {
    document.getElementById('refreshButton').addEventListener('click', chrome.runtime.sendMessage({ message: "updateGasPrice" }, () => {
        updateDom();
    })
    );

});

// #endregion