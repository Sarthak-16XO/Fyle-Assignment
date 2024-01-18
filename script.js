// JS code for fucntionality
const itemsPerPage = 10; //indicating 10 repos per page
let currentPage = 1;
let allRepositories = [];

// Function used for getting user profile and repositories
function getProfileAndRepositories() {

    const username = document.getElementById('usernameInput').value;

    // API url for fetching the data
    const apiUrl = `https://api.github.com/users/${username}`;
    const repositoriesApiUrl = `https://api.github.com/users/${username}/repos`;

    // Show the loader while API calls are in progress
    showLoader();

    // Fetch the user profile
    fetch(apiUrl)
        .then(response => response.json())
        .then(user => {
            displayUserProfile(user);

            // Show the repository search input when user is found
            document.getElementById('repoSearchDiv').style.display = 'block';
        })
        .catch(error => {
            // Show the message if the user with the given username is not found
            console.error('Error fetching user profile:', error);
            alert('Error fetching user profile. Please try again.');
        })
        .finally(() => {
            // Hide loader when API calls are complete
            hideLoader();
        });

    // Fetch all repositories
    fetch(repositoriesApiUrl)
        .then(response => response.json())
        .then(repositories => {
            allRepositories = repositories;
            displayRepositories(allRepositories);
            displayPagination(allRepositories);
        })
        .catch(error => {
            console.error('Error fetching repositories:', error);
            alert('Error fetching repositories. Please try again.');
        });
}

// Function used for displaying the user profile information
function displayUserProfile(user) {
    const profileSection = document.getElementById('profileSection');
    profileSection.innerHTML = '';

    // Creating the profile HTML elements using JS 
    const profileContent = `
      <div style="display: flex; flex-direction: row; align-items: center;">
          <div>
              <img src="${user.avatar_url}" alt="Profile Image" class="profile-image">
          </div>
          <div style="margin-left: 20px; text-align: left;">
          <h3>${user.name || user.login}</h3>
          <p>${user.login}</p>
          <p>${user.bio || 'No bio available'}</p>
          ${user.location ? `<div style="display: flex; align-items: center; gap: 5px; margin-bottom: 10px;"><i class="fa-solid fa-location-dot"></i><p style="margin-bottom: 0; ">${user.location}</p></div>` : ''}
          <p><a href="${user.html_url}" target="_blank">View on GitHub <i class="fa fa-arrow-right" aria-hidden="true"></i></a></p>
        </div>
      </div>
    `;

    profileSection.innerHTML = profileContent;
}

// Function used for searching repositories
function searchRepositories() {
    const repoSearchInput = document.getElementById('repoSearchInput').value.trim().toLowerCase();

    // If the repoSearchInput is empty, display all repositories without filtering
    if (repoSearchInput === '') {
        displayRepositories(allRepositories);
        displayPagination(allRepositories);
    } else {
        // Filter repositories based on the repoSearchInput
        const filteredRepositories = allRepositories.filter(repo =>
            repo.name.toLowerCase().includes(repoSearchInput)
        );

        // Display filtered repositories and reset current page to 1
        currentPage = 1;
        displayRepositories(filteredRepositories);
        displayPagination(filteredRepositories);
    }
}

// Function used for displaying the user repositories
function displayRepositories(repositories) {
    const repositoriesList = document.getElementById('repositoriesList');
    repositoriesList.innerHTML = '';

    const repoSearchInput = document.getElementById('repoSearchInput').value.trim().toLowerCase();

    // Filter repositories based on the repoSearchInput if it's not empty
    const filteredRepositories = repoSearchInput === ' '
        ? repositories
        : repositories.filter(repo => repo.name.toLowerCase().includes(repoSearchInput));

    if (filteredRepositories.length === 0) {
        repositoriesList.innerHTML = '<p class="text-muted">No matching repositories found.</p>';
        return;
    }

    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const displayedRepos = filteredRepositories.slice(startIndex, endIndex);

    // Looping through the repositories array and displaying each repository using card
    displayedRepos.forEach(repo => {
        const repoCard = document.createElement('div');
        repoCard.className = 'col-md-6 repo-card';

        const cardContent = `
      <div class="card">
        <div class="card-body">
          <h5 class="card-title">${repo.name}</h5>
          <p class="card-text">${repo.description || 'No description available'}</p>
          <div class="">
            <p class="btn btn-primary">${repo.language || 'Not specified'}</p>
            <div style="display: flex; flex-direction: row; align-items: center; margin-bottom: 10px;">
            <p class="list-group-item"><i style="margin-right: 10px;" class="fa-regular fa-star"></i> Stars: ${repo.stargazers_count}</p>
            <p class="list-group-item"><i style="margin-right: 10px;" class="fa-solid fa-code-fork"></i>Forks: ${repo.forks_count}</p>
            </div>
            
          </div>
          <a href="${repo.html_url}" class="btn btn-primary" target="_blank" style="margin-left: auto; display: block;">View on GitHub<i class="fa-solid fa-square-up-right" style="margin-left: 10px; font-size:24px;"></i></a>
        </div>
      </div>
    `;

        repoCard.innerHTML = cardContent;
        repositoriesList.appendChild(repoCard);
    });

    // Check if there are more pages and update the pagination
    if (filteredRepositories.length > itemsPerPage) {
        displayPagination(filteredRepositories);
    }
}
// Add an event listener for the Enter key on the username input
document.getElementById('usernameInput').addEventListener('keyup', function (event) {
    if (event.key === 'Enter') {
        getProfileAndRepositories();
    }
});

// Add an event listener for the Enter key on the repo search input
document.getElementById('repoSearchInput').addEventListener('keyup', function (event) {
    if (event.key === 'Enter') {
        searchRepositories();
    }
});

// Implementing pagination and shwoing 10 repos per page
function displayPagination(repositories) {
    const totalPages = Math.ceil(repositories.length / itemsPerPage);
    const paginationList = document.getElementById('pagination');
    paginationList.innerHTML = '';

    const prevPageItem = document.createElement('li');
    prevPageItem.className = `page-item ${currentPage === 1 ? 'disabled' : ''}`;
    const prevPageLink = document.createElement('a');
    prevPageLink.className = 'page-link';
    prevPageLink.innerText = 'Previous';
    prevPageLink.addEventListener('click', () => {
        if (currentPage > 1) {
            currentPage--;
            displayRepositories(allRepositories);
            displayPagination(allRepositories);
        }
    });
    prevPageItem.appendChild(prevPageLink);
    paginationList.appendChild(prevPageItem);

    for (let i = 1; i <= totalPages; i++) {
        const pageItem = document.createElement('li');
        pageItem.className = `page-item ${i === currentPage ? 'active' : ''}`;
        const pageLink = document.createElement('a');
        pageLink.className = 'page-link';
        pageLink.innerText = i;
        pageLink.addEventListener('click', () => {
            currentPage = i;
            displayRepositories(allRepositories);
            displayPagination(allRepositories);
        });
        pageItem.appendChild(pageLink);
        paginationList.appendChild(pageItem);
    }

    const nextPageItem = document.createElement('li');
    nextPageItem.className = `page-item ${currentPage === totalPages ? 'disabled' : ''}`;
    const nextPageLink = document.createElement('a');
    nextPageLink.className = 'page-link';
    nextPageLink.innerText = 'Next';
    nextPageLink.addEventListener('click', () => {
        if (currentPage < totalPages) {
            currentPage++;
            displayRepositories(allRepositories);
            displayPagination(allRepositories);
        }
    });
    nextPageItem.appendChild(nextPageLink);
    paginationList.appendChild(nextPageItem);
}

// Showing and hiding the loader while the information loads
function showLoader() {
    document.getElementById('repositoriesList').innerHTML = '<div class="text-center"><div class="loader"></div></div>';
}

function hideLoader() {
    document.getElementById('repositoriesList').innerHTML = '';
}