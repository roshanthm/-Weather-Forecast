document.addEventListener('DOMContentLoaded', function() {
  const apiKey = 'YOUR_API_KEY_HERE';  // <-- Replace with real WeatherAPI key
  const searchBtn = document.getElementById('search-btn');
  const locationInput = document.getElementById('location');
  const currentWeather = document.getElementById('current-weather');
  const loading = document.getElementById('loading');
  const errorMessage = document.getElementById('error-message');
  const recentList = document.getElementById('recent-list');

  let recentSearches = JSON.parse(localStorage.getItem('recentSearches')) || [];

  // Update recent searches
  function updateRecentSearches() {
    recentList.innerHTML = '';
    recentSearches.slice(0, 5).forEach(search => {
      const searchItem = document.createElement('button');
      searchItem.className = 'w-full text-left p-2 bg-white bg-opacity-10 hover:bg-opacity-20 rounded-lg transition';
      searchItem.textContent = search;
      searchItem.addEventListener('click', () => {
        locationInput.value = search;
        fetchWeather(search);
      });
      recentList.appendChild(searchItem);
    });
  }

  updateRecentSearches();

  // Fetch weather
  function fetchWeather(location) {
    if (!location) return;

    currentWeather.classList.add('hidden');
    errorMessage.classList.add('hidden');
    loading.classList.remove('hidden');

    fetch(`https://api.weatherapi.com/v1/current.json?key=${apiKey}&q=${encodeURIComponent(location)}&aqi=yes`)
      .then(response => {
        if (!response.ok) throw new Error('Location not found');
        return response.json();
      })
      .then(data => {
        displayWeather(data);

        if (!recentSearches.includes(location)) {
          recentSearches.unshift(location);
          localStorage.setItem('recentSearches', JSON.stringify(recentSearches));
          updateRecentSearches();
        }
      })
      .catch(error => {
        console.error('Error fetching weather data:', error);
        loading.classList.add('hidden');
        errorMessage.classList.remove('hidden');
      });
  }

  // Display weather
  function displayWeather(data) {
    const location = `${data.location.name}, ${data.location.country}`;
    const temp = data.current.temp_c;
    const condition = data.current.condition.text;
    const icon = data.current.condition.icon;
    const wind = data.current.wind_kph;
    const humidity = data.current.humidity;
    const pressure = data.current.pressure_mb;

    document.getElementById('location-name').textContent = location;
    document.getElementById('temperature').textContent = temp;
    document.getElementById('weather-condition').textContent = condition;
    document.getElementById('weather-icon').src = icon.replace('64x64', '128x128');
    document.getElementById('wind-speed').textContent = `${wind} km/h`;
    document.getElementById('humidity').textContent = `${humidity}%`;
    document.getElementById('pressure').textContent = `${pressure} hPa`;

    loading.classList.add('hidden');
    currentWeather.classList.remove('hidden');
  }

  // Event listeners
  searchBtn.addEventListener('click', () => {
    const location = locationInput.value.trim();
    if (location) fetchWeather(location);
  });

  locationInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
      const location = locationInput.value.trim();
      if (location) fetchWeather(location);
    }
  });

  // Default
  if (recentSearches.length === 0) {
    fetchWeather('London');
  }
});
