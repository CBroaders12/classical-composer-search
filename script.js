const baseURL = 'https://api.openopus.org';
const popComposersURL = `${baseURL}/composer/list/pop.json`;
const composerSearchURL = `${baseURL}/composer/list/search`;
const composerWorksURL = `${baseURL}/work/list/composer`;

const main = document.getElementById('main');
const form = document.getElementById('form');
const search = document.getElementById('search');

getComposers(popComposersURL);

async function getComposers(url) {
	let response = await fetch(url);
	let data = await response.json();

	fillComposers(data);
}

function fillComposers(data) {
	let { status, composers } = data;

	if (status.success === 'true') {
		main.innerHTML = '';

		composers.forEach(async (composer) => {
			let composerEl = document.createElement('div');
			composerEl.classList.add('composer');

			let worksEl = document.createElement('div');
			worksEl.classList.add('selected-works');

			const { id, complete_name, birth, death, portrait } = composer;

			// Format birth and death years
			const birthYear = birth.slice(0, 4);
			const deathYear = death ? death.slice(0, 4) : null;

			// Get selected works
			let works = await getSelectedWorks(id);

			worksEl.innerHTML = `
                <h3>Selected Works</h3>
                <ul>
                    <li>${works[0].title}</li>
                    <li>${works[1].title}</li>
                    <li>${works[2].title}</li>
                </ul>
            `;

			composerEl.innerHTML = `
                <img
                src="${portrait}"
                alt="${complete_name}"
                />
                <div class="composer-info">
                    <h3>${complete_name}</h3>
                    <div class="composer-dates">
                        <span class="birth-year">${birthYear}</span> - <span class="death-year">${
				deathYear ? deathYear : 'now'
			}</span>
                    </div>
                </div>
            `;

			// Insert elements into DOM
			composerEl.appendChild(worksEl);
			main.appendChild(composerEl);
		});
	} else {
		main.innerHTML = `<div class="no-results-message">
            Search Error: ${status.error}
        </div>`;
	}
}

async function getSelectedWorks(composerId) {
	let response = await fetch(
		`${composerWorksURL}/${composerId}/genre/all.json`
	);

	let data = await response.json();

	let works = data.works;

	return selectRandomWorks(works);
}

function selectRandomWorks(worksList) {
	let numWorks = worksList.length;

	let randomWorks = [];

	for (let i = 0; i < 3; i++) {
		let idx = Math.floor(Math.random() * numWorks);

		randomWorks.push(worksList[idx]);
	}

	return randomWorks;
}

form.addEventListener('submit', (e) => {
	e.preventDefault();

	let searchTerm = search.value;

	if (searchTerm && searchTerm !== '') {
		let searchURL = `${composerSearchURL}/${searchTerm}.json`;
		getComposers(searchURL);
		search.value = '';
	} else {
		window.location.reload();
	}
});
