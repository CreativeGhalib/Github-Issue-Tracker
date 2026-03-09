// all issues globally rakhlam, filter er time baarbaar api call na kore ekhane theke nibo
let allIssues = [];

// label er name diye color class ber kori
const getLabelStyle = label => {
  const map = {
    bug: 'bg-red-100 text-red-600 border-red-300',
    'help wanted': 'bg-yellow-100 text-yellow-700 border-yellow-300',
    enhancement: 'bg-teal-100 text-teal-600 border-teal-300',
    invalid: 'bg-gray-100 text-gray-500 border-gray-300',
    question: 'bg-yellow-100 text-yellow-600 border-yellow-300',
    documentation: 'bg-indigo-100 text-indigo-600 border-indigo-300',
  };
  return map[label?.toLowerCase()] ?? 'bg-purple-100 text-purple-600 border-purple-300';
};

// shudhu bug r help wanted er jonno icon ache baki gulo empty string
const getLabelIcon = label => {
  const iconMap = {
    bug: `<img src="./assets/GitHub Issues Tracker_icon/BugDroid.svg" class="w-3 h-3 inline-block" alt="bug" />`,
    'help wanted': `<img src="./assets/GitHub Issues Tracker_icon/Lifebuoy.svg" class="w-3 h-3 inline-block" alt="help wanted" />`,
  };
  return iconMap[label?.toLowerCase()] ?? '';
};

// spinner dekhano r lukano
const showLoader = () => (document.getElementById('loader-section').style.display = 'block');
const hideLoader = () => (document.getElementById('loader-section').style.display = 'none');

// page load hoile ei function e API call hoy
const loadIssues = () => {
  showLoader();
  fetch('https://phi-lab-server.vercel.app/api/v1/lab/issues')
    .then(res => res.json())
    .then(json => {
      allIssues = json.data;
      displayIssues(allIssues);
    });
};

// issues gulo card baniye DOM e rakhi
const displayIssues = issues => {
  hideLoader();
  document.getElementById('issue-count').textContent = `${issues.length} Issues`;

  const issueWrapper = document.getElementById('issue-wrapper');
  issueWrapper.innerHTML = '';

  if (issues.length === 0) {
    issueWrapper.innerHTML = `<p class="col-span-4 text-center text-gray-400 py-10">No issues found.</p>`;
    return;
  }

  for (let issue of issues) {
    // open hole green, closed hole purple top border
    const borderColor = issue.status === 'open' ? 'border-t-green-500' : 'border-t-purple-500';

    const priority = issue.priority ?? 'n/a';

    // high=orange medium=blue low=green
    const priorityColor =
      priority === 'high'
        ? 'bg-orange-100 text-orange-600'
        : priority === 'medium'
          ? 'bg-blue-100 text-blue-600'
          : priority === 'low'
            ? 'bg-green-100 text-green-600'
            : 'bg-gray-100 text-gray-500';

    const labelBadges = issue.labels?.length
      ? issue.labels
          .map(
            l =>
              `<span class="text-[10px] font-semibold border px-2 py-0.5 rounded-full flex items-center gap-1 w-fit ${getLabelStyle(l)}">${getLabelIcon(l)} ${l.toUpperCase()}</span>`
          )
          .join('')
      : '<span class="text-[10px] text-gray-400">No Label</span>';

    const card = document.createElement('div');
    card.className = `bg-white rounded-xl shadow-sm p-5 flex flex-col gap-3 border-t-4 ${borderColor} cursor-pointer hover:shadow-md transition`;

    card.innerHTML = `
      <div class="flex justify-between items-center">
        ${
          issue.status === 'open'
            ? `<img src="./assets/GitHub Issues Tracker_icon/CircleDashed.svg" class="w-7 h-7" alt="open" />`
            : `<img src="./assets/Closed- Status .png" class="w-7 h-7" alt="closed" />`
        }
        <span class="text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${priorityColor}">${priority}</span>
      </div>

      <h3 class="font-semibold text-sm text-gray-800 line-clamp-2">${issue.title}</h3>
      <p class="text-xs text-gray-500 line-clamp-3">${issue.description ?? 'No description.'}</p>

      <div class="flex flex-wrap gap-1">${labelBadges}</div>

      <div class="text-xs text-gray-500 mt-auto pt-2 border-t border-gray-100 flex flex-col gap-0.5">
        <span>#${issue.id} by <b>${issue.author ?? 'Unknown'}</b></span>
        <span>${new Date(issue.createdAt).toLocaleDateString()}</span>
      </div>
    `;

    card.addEventListener('click', () => openModal(issue));
    issueWrapper.appendChild(card);
  }
};

// type diye filter kori, setTimeout na dile spinner dekhay na
const filterIssue = type => {
  showLoader();
  setTimeout(() => {
    if (type === 'all') {
      displayIssues(allIssues);
    } else {
      const filtered = allIssues.filter(issue => issue.status === type);
      displayIssues(filtered);
    }
  }, 300);
};

// 3 tab er data
const tabsData = [
  { id: 'btn-all', label: 'All', type: 'all' },
  { id: 'btn-open', label: 'Open', type: 'open' },
  { id: 'btn-closed', label: 'Closed', type: 'closed' },
];

// tab buttons dynamically banai
const renderTabs = () => {
  const container = document.getElementById('filter-container');
  container.innerHTML = '';

  for (let tab of tabsData) {
    const btn = document.createElement('button');
    btn.id = tab.id;
    btn.textContent = tab.label;
    btn.className = `btn ${tab.type === 'all' ? 'btn-primary' : 'btn-ghost'}`;

    btn.addEventListener('click', () => {
      // age shob theke active sora, tarpor clicked ta active kora
      for (let t of tabsData) {
        document.getElementById(t.id).classList.remove('btn-primary');
        document.getElementById(t.id).classList.add('btn-ghost');
      }
      btn.classList.add('btn-primary');
      btn.classList.remove('btn-ghost');
      filterIssue(tab.type);
    });

    container.appendChild(btn);
  }
};

// card click e modal e full details
const openModal = issue => {
  const modalWrapper = document.getElementById('modal-wrapper');

  const modalLabels = issue.labels?.length
    ? issue.labels
        .map(
          l =>
            `<span class="text-xs font-semibold border px-3 py-1 rounded-full flex items-center gap-1 w-fit ${getLabelStyle(l)}">${getLabelIcon(l)} ${l.toUpperCase()}</span>`
        )
        .join('')
    : '<span class="text-xs text-gray-400">No Label</span>';

  const priority = issue.priority ?? 'n/a';
  const priorityColor =
    priority === 'high'
      ? 'bg-red-100 text-red-600'
      : priority === 'medium'
        ? 'bg-blue-100 text-blue-600'
        : priority === 'low'
          ? 'bg-green-100 text-green-600'
          : 'bg-gray-100 text-gray-500';

  const isOpen = issue.status === 'open';
  const statusBadge = isOpen
    ? `<span class="text-xs font-semibold px-3 py-1 rounded-full border border-green-500 text-green-600 bg-green-50">Opened</span>`
    : `<span class="text-xs font-semibold px-3 py-1 rounded-full border border-purple-500 text-purple-600 bg-purple-50">Closed</span>`;

  const createdDate = new Date(issue.createdAt).toLocaleDateString('en-GB', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });

  modalWrapper.innerHTML = `
    <dialog class="modal modal-open">
      <div class="modal-box max-w-lg">

        <h3 class="font-bold text-lg mb-3">${issue.title}</h3>

        <div class="flex items-center gap-2 mb-4 text-sm text-gray-500">
          ${statusBadge}
          <span>• Opened by <b>${issue.author ?? 'Unknown'}</b> • ${createdDate}</span>
        </div>

        <div class="flex flex-wrap gap-2 mb-4">${modalLabels}</div>

        <p class="text-sm text-gray-500 mb-6">${issue.description ?? 'No description.'}</p>

        <div class="grid grid-cols-2 gap-4 text-sm mb-5 border border-gray-200 rounded-lg p-4 bg-gray-50">
          <div class="flex flex-col gap-1">
            <span class="text-xs text-gray-400">Assignee:</span>
            <span class="font-semibold">${issue.assignee ?? 'Unassigned'}</span>
          </div>
          <div class="flex flex-col gap-1 items-end">
            <span class="text-xs text-gray-400">Priority:</span>
            <span class="text-xs font-bold uppercase px-3 py-1 rounded-full w-fit ${priorityColor}">${priority}</span>
          </div>
        </div>

        <div class="modal-action">
          <button onclick="closeModal()" class="btn btn-primary">Close</button>
        </div>
      </div>
      <form method="dialog" class="modal-backdrop">
        <button onclick="closeModal()">close</button>
      </form>
    </dialog>
  `;
};

// modal er div khali korle modal chle jay
const closeModal = () => {
  document.getElementById('modal-wrapper').innerHTML = '';
};

// search e click or enter dile API te query pathao
document.getElementById('btn-search').addEventListener('click', () => {
  const query = document.getElementById('issue-search').value.trim();

  if (!query) {
    displayIssues(allIssues);
    return;
  }

  showLoader();
  fetch(`https://phi-lab-server.vercel.app/api/v1/lab/issues/search?q=${encodeURIComponent(query)}`)
    .then(res => res.json())
    .then(json => displayIssues(json.data ?? []));
});

document.getElementById('issue-search').addEventListener('keydown', e => {
  if (e.key === 'Enter') document.getElementById('btn-search').click();
});

// shuru korchi
renderTabs();
loadIssues();
