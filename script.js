// Отримання елементів з HTML
const characterList = document.getElementById("characterList");
const characterInfo = document.getElementById("characterInfo");
const prevBtn = document.getElementById("prevBtn");
const nextBtn = document.getElementById("nextBtn");
const loadingSpinner = document.getElementById("loadingSpinner");

let currentPage = 1;

// Асинхронна функція для отримання списку персонажів за певну сторінку
async function fetchCharacters(page) {
  const apiUrl = `https://swapi.dev/api/people/?page=${page}`;
  try {
    const response = await fetch(apiUrl);
    const data = await response.json();
    return data.results;
  } catch (error) {
    console.error("Помилка при отриманні даних:", error);
    return [];
  }
}

// Асинхронна функція для отримання деталей фільмів
async function fetchFilmDetails(filmUrls) {
  const filmPromises = filmUrls.map(url => fetch(url).then(response => response.json()));
  return await Promise.all(filmPromises);
}

// Асинхронна функція для отримання деталей рідної планети
async function fetchHomeworldDetails(homeworldUrl) {
  if (!homeworldUrl) {
    return "Невідомо";
  }
  try {
    const response = await fetch(homeworldUrl);
    const data = await response.json();
    return data.name;
  } catch (error) {
    console.error("Помилка при отриманні даних про рідну планету:", error);
    return "Невідомо";
  }
}

// Асинхронна функція для отримання деталей підвиду
async function fetchSpeciesDetails(speciesUrl) {
  if (!speciesUrl) {
    return "Невідомо";
  }
  try {
    const response = await fetch(speciesUrl);
    const data = await response.json();
    return data.name;
  } catch (error) {
    console.error("Помилка при отриманні даних про підвид:", error);
    return "Невідомо";
  }
}

// Асинхронна функція для отримання деталей персонажа
async function fetchCharacterDetails(characterUrl) {
  try {
    const response = await fetch(characterUrl);
    const character = await response.json();
    const filmDetails = await fetchFilmDetails(character.films);
    const homeworldDetails = await fetchHomeworldDetails(character.homeworld);
    const speciesDetails = await fetchSpeciesDetails(character.species[0]);
    displayCharacterDetails(character, filmDetails, homeworldDetails, speciesDetails);
  } catch (error) {
    console.error("Помилка при отриманні деталей персонажа:", error);
  }
}

// Функція для відображення деталей персонажа
function displayCharacterDetails(character, films, homeworld, species) {
  characterInfo.innerHTML = `
    <div class="character-info-card">
      <span id="closeBtn" class="close-btn">&times;</span>
      <h2>${character.name}</h2>
      <table>
        <tr>
          <td>Рік народження:</td>
          <td>${character.birth_year}</td>
        </tr>
        <tr>
          <td>Пол:</td>
          <td>${character.gender}</td>
        </tr>
        <tr>
          <td>Фільми:</td>
          <td>
            <ul>
              ${films.map(film => `<li>${film.title}</li>`).join("")}
            </ul>
          </td>
        </tr>
        <tr>
          <td>Рідна планета:</td>
          <td>${homeworld}</td>
        </tr>
        <tr>
          <td>Підвид:</td>
          <td>${species}</td>
        </tr>
      </table>
    </div>
  `;

  const closeBtn = document.getElementById("closeBtn");
  closeBtn.addEventListener("click", () => {
    closeCharacterDetails();
  });

  characterInfo.classList.add("active"); // Додаємо клас "active"
  localStorage.setItem("openCharacter", JSON.stringify(character));
}

// Функція для закриття картки з інформацією
function closeCharacterDetails() {
  characterInfo.classList.remove("active"); // Забираємо клас "active"
  localStorage.removeItem("openCharacter");
}

// Функція для відображення списку персонажів
function displayCharacters(characters) {
  characterList.innerHTML = "";
  characters.forEach(character => {
    const characterCard = document.createElement("div");
    characterCard.className = "character-card";
    characterCard.textContent = character.name;
    characterCard.dataset.url = character.url;
    characterCard.addEventListener("click", () => {
      fetchCharacterDetails(character.url);
    });
    characterList.appendChild(characterCard);
  });
  loadingSpinner.style.display = "none";
  characterList.style.display = "grid";
  characterInfo.innerHTML = "";
}

// Функція для завантаження даних для конкретної сторінки
function loadPage(page) {
  loadingSpinner.style.display = "block";
  fetchCharacters(page)
    .then(characters => {
      displayCharacters(characters);
      const openCharacter = JSON.parse(localStorage.getItem("openCharacter"));
      if (openCharacter) {
        fetchCharacterDetails(openCharacter.url);
      }
    })
    .catch(error => {
      console.error("Помилка при отриманні даних:", error);
      loadingSpinner.style.display = "none";
    });
}

// Обробники подій для кнопок "Назад" і "Вперед"
prevBtn.addEventListener("click", () => {
  if (currentPage > 1) {
    currentPage--;
    loadPage(currentPage);
  }
});

nextBtn.addEventListener("click", () => {
  currentPage++;
  loadPage(currentPage);
});

// Завантаження першої сторінки при завантаженні сторінки
loadPage(currentPage);