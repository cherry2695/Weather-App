const apiKey = "062a6c9d9b57212b2f6d375af6bd7487";
const searchBtn = document.getElementById("searchBtn");
const cityInput = document.getElementById("cityInput");
const cityName = document.getElementById("cityName");
const temperature = document.getElementById("temperature");
const condition = document.getElementById("condition");
const humidity = document.getElementById("humidity");
const windSpeed = document.getElementById("windSpeed");
const weatherInfo = document.getElementById("weatherInfo");
const chartContainer = document.querySelector(".chart-container");

let chart;
function isValidCityName(city) {
  const cityRegex = /^[a-zA-Z\s\-']+$/;
  return cityRegex.test(city) && city.length > 1;
}

// Function to show error message
function showError(message) {
  let errorElement = document.getElementById("weatherError");
  if (!errorElement) {
    errorElement = document.createElement("div");
    errorElement.id = "weatherError";
    errorElement.style.color = "#e74c3c";
    errorElement.style.textAlign = "center";
    errorElement.style.margin = "15px 0";
    errorElement.style.padding = "10px";
    errorElement.style.backgroundColor = "rgba(231, 76, 60, 0.1)";
    errorElement.style.borderRadius = "8px";
    errorElement.style.border = "1px solid #e74c3c";
    weatherInfo.parentNode.insertBefore(errorElement, weatherInfo);
  }
  
  errorElement.textContent = message;
  errorElement.classList.remove("hidden");
  
  // Hide weather info and chart
  weatherInfo.classList.remove("visible");
  chartContainer.classList.remove("visible");
  
  // Auto-hide error after 5 seconds
  setTimeout(() => {
    errorElement.classList.add("hidden");
  }, 5000);
}

// Fetch Current Weather
async function getWeather(city) {
  try {
    // Validate city name
    if (!isValidCityName(city)) {
      showError("Please enter a valid city name");
      return;
    }
    
    // Show loading state
    cityName.textContent = "Loading...";
    temperature.textContent = "";
    condition.textContent = "";
    humidity.textContent = "";
    windSpeed.textContent = "";
    weatherInfo.classList.remove("hidden");
    weatherInfo.classList.add("visible");
    
    // Hide any previous error
    const errorElement = document.getElementById("weatherError");
    if (errorElement) {
      errorElement.classList.add("hidden");
    }
    
    const res = await fetch(
      `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}&units=metric`
    );
    const data = await res.json();

    if (data.cod === "404" || data.cod === "400") {
      showError("City not found! Please check the spelling and try again.");
      weatherInfo.classList.remove("visible");
      return;
    }
    
    // Additional check for invalid responses
    if (!data.name || !data.sys || !data.sys.country) {
      showError("Invalid response from weather service. Please try again.");
      weatherInfo.classList.remove("visible");
      return;
    }
    // Update Weather Info
    cityName.textContent = `${data.name}, ${data.sys.country}`;
    temperature.textContent = `${data.main.temp.toFixed(1)}°C`;
    condition.textContent = data.weather[0].description;
    humidity.textContent = `${data.main.humidity}%`;
    windSpeed.textContent = `${data.wind.speed} m/s`;

    weatherInfo.classList.remove("hidden");
    weatherInfo.classList.add("visible");

    // Fetch forecast for chart
    getForecast(city);
  } catch (error) {
    showError("Network error! Please check your connection and try again.");
    console.error("Weather fetch error:", error);
    weatherInfo.classList.remove("visible");
  }
}

// Fetch Forecast
async function getForecast(city) {
  try {
    const res = await fetch(
      `https://api.openweathermap.org/data/2.5/forecast?q=${city}&appid=${apiKey}&units=metric`
    );
    const data = await res.json();

    // Check if forecast data is valid
    if (data.cod === "404" || data.cod === "400" || !data.list || data.list.length === 0) {
      console.error("Invalid forecast data");
      chartContainer.classList.remove("visible");
      return;
    }

    const dailyTemps = [];
    const labels = [];

    for (let i = 0; i < data.list.length; i += 8) {
      dailyTemps.push(data.list[i].main.temp);
      const date = new Date(data.list[i].dt * 1000);
      labels.push(date.toLocaleDateString('en-US', { weekday: 'short' }));
    }

    chartContainer.classList.remove("hidden");
    chartContainer.classList.add("visible");

    if (chart) {
      chart.destroy();
    }

    const ctx = document.getElementById("weatherChart").getContext("2d");
    chart = new Chart(ctx, {
      type: "line",
      data: {
        labels: labels,
        datasets: [
          {
            label: "Temperature (°C)",
            data: dailyTemps,
            borderColor: "#ff6b6b",
            backgroundColor: "rgba(255, 107, 107, 0.2)",
            fill: true,
            tension: 0.3,
            pointRadius: 5,
            pointBackgroundColor: "#ff6b6b",
          },
        ],
      },
      options: {
        responsive: true,
        plugins: {
          legend: {
            labels: { color: "#343a40" },
          },
          tooltip: {
            mode: 'index',
            intersect: false,
          },
        },
        scales: {
          x: { 
            ticks: { color: "#343a40" },
            grid: {
              color: 'rgba(0, 0, 0, 0.05)'
            }
          },
          y: { 
            ticks: { color: "#343a40" },
            grid: {
              color: 'rgba(0, 0, 0, 0.05)'
            }
          },
        },
      },
    });
  } catch (error) {
    console.error("Forecast fetch error:", error);
    chartContainer.classList.remove("visible");
  }
}

// Event Listener for search button
searchBtn.addEventListener("click", () => {
  const city = cityInput.value.trim();
  if (city !== "") {
    getWeather(city);
  } else {
    showError("Please enter a city name");
  }
});

// Event Listener for Enter key in input field
cityInput.addEventListener("keypress", (e) => {
  if (e.key === "Enter") {
    const city = cityInput.value.trim();
    if (city !== "") {
      getWeather(city);
    } else {
      showError("Please enter a city name");
    }
  }
});

// Clear input when user starts typing
cityInput.addEventListener("input", () => {
  const errorElement = document.getElementById("weatherError");
  if (errorElement) {
    errorElement.classList.add("hidden");
  }
});

// Add some sample data for demo purposes on first load
window.addEventListener('load', () => {
  // Clear any demo city from input
  cityInput.value = "";
  cityInput.placeholder = "Enter a valid city name";
});