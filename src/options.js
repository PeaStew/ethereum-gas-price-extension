const options = {
  'provider': ''
};

chrome.storage.sync.get({
  'provider': 'ftmscan'
}, (items)=>{
  options.provider = items.provider;
  renderOptions();
});

function renderOptions(){
  let providersHtml = 
    `<li data-provider="ftmscan" class="js-provider ${options.provider == 'ftmscan' ? 'active':''}">FTMScan ${options.provider == 'ftmscan' ? '✓':''}</li>`;

  document.getElementsByClassName('js-providers')[0].innerHTML = DOMPurify.sanitize(providersHtml);
  addClickListeners();
}

function selectProvider(option) {
  // Curry function with option
  return function(e){
    options.provider = option;
    chrome.storage.sync.set({
      'provider': option
    });

    renderOptions();

    chrome.runtime.getBackgroundPage(backgroundPage=>{
      backgroundPage.fetchGasPrice();
    }); 
  };
}

function addClickListeners() {
  // Add click listeners
  let elements = document.getElementsByClassName('js-provider');
  for(let i=0; i<elements.length; i++) {
    const element = elements[i];
    // Select option when clicked
    element.addEventListener('click', selectProvider(element.dataset.provider));
  }
}