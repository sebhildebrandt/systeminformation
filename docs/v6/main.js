function createMenu() {
  let menu = [
    [0, './#docs', 'Documentation'],
    [1, 'gettingstarted', 'Getting Started'],
    [1, 'general', 'General'],
    [1, 'system', 'System'],
    [1, 'cpu', 'CPU'],
    [1, 'memory', 'Memory'],
    [1, 'graphics', 'Graphics'],
    [1, 'filesystem', 'Disks / FS'],
    [1, 'printer', 'Printer'],
    [1, 'battery', 'Battery'],
    [1, 'audio', 'Audio'],
    [1, 'camera', 'Camera'],
    [1, 'keyboard', 'Keyboard'],
    [1, 'mouse', 'Mouse'],
    [1, 'os', 'OS'],
    [1, 'processes', 'Processes / Services'],
    [1, 'software', 'Software'],
    [1, 'network', 'Network'],
    [1, 'usb', 'USB'],
    [1, 'thunderbold', 'Thunderbold'],
    [1, 'pci', 'PCI'],
    [1, 'wifi', 'Wifi'],
    [1, 'bluetooth', 'Bluetooth'],
    [1, 'docker', 'Docker'],
    [1, 'vbox', 'Virtual Box'],
    [1, 'statsfunctions', 'Observers / Stats'],
    [0, '', 'More'],
    [1, 'security', 'Security Advisories'],
    [1, 'issues', 'Known Issues'],
    [1, 'changes', 'Version 6 Changes'],
    [1, 'v4/index', 'Version 4 Docs'],
    [1, 'history', 'Version History'],
    [1, 'tests', 'Testing'],
    [1, 'copyright', 'Copyright & License'],
    [1, 'contributors', 'Contributors'],
    [1, 'trademarks', 'Trademarks'],
  ];

  let path = window.location.pathname;
  let page = path.split('/').pop().replace('.html', '');

  let menuParent = document.getElementById('menu');
  let titleElement;
  let titleLink;
  let ulElement;
  let liElement;
  let aElement;
  for (let item of menu) {
    if (item[0] === 0) {
      titleElement = document.createElement('div');
      titleElement.classList.add('title');
      menuParent.appendChild(titleElement);
      if (!item[1]) {
        titleLink = document.createElement('div');
        titleLink.classList.add('medium');
        titleLink.classList.add('navtitle');
        titleLink.innerText = item[2];
      } else {
        titleLink = document.createElement('a');
        titleLink.classList.add('medium');
        titleLink.classList.add('navtitle');
        titleLink.setAttribute('href', item[1] + (item[1].indexOf('#') >= 0 ? '' : '.html'));
        titleLink.innerText = item[2];
      }
      titleElement.appendChild(titleLink);
      ulElement = document.createElement('ul');
      titleElement.appendChild(ulElement);
    } else {
      liElement = document.createElement('li');
      if (page === item[1]) {
        liElement.classList.add('active');
      }
      aElement = document.createElement('a');
      aElement.setAttribute('href', item[1] + '.html');
      aElement.innerText = item[2];
      ulElement.appendChild(liElement);
      liElement.appendChild(aElement);
    }
  }
}

