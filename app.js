// Your OpenWeatherMap API key
const apiKey = '1b73ed5a14e3509b5baff130526620d1';

// Cities to fetch weather for
const cities = ['Sausar', 'Pandhurna', 'Chhindwara', 'Nagpur', 'Bengaluru', 'Indore', 'Pune'];

// Store all weather data for the cities
let allCityData = []; // This will hold the weather data for all cities

// Keep track of the chart instance
let chartInstance = null; // This will hold the current chart instance

// Function to fetch weather data for a specific city
async function fetchWeather(city) {
    try {
        // URL to fetch weather data from OpenWeatherMap API
        let url = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}&units=metric`; // 'units=metric' for Celsius
        let res = await fetch(url);

        // Check if the response is okay (status 200)
        if (!res.ok) {
            throw new Error('Weather data not available');
        }

        let weatherData = await res.json();

        // Log the data for debugging (optional)
        console.log(weatherData);

        // Store the city weather data in the allCityData array
        allCityData.push({
            city: weatherData.name,
            temperatures: [weatherData.main.temp]  // For now, we're only showing the current temperature
        });

        // Populate weather data into a table
        let weatherTableBody = document.querySelector('#weather-table tbody');
        let tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${weatherData.name}</td> <!-- City name -->
            <td>${weatherData.weather[0].description}</td> <!-- Weather description -->
            <td>${weatherData.main.temp}°C</td> <!-- Temperature -->
            <td>${weatherData.main.temp_max}°C</td> <!-- Max Temp -->
            <td>${weatherData.main.temp_min}°C</td> <!-- Min Temp -->
        `;
        weatherTableBody.appendChild(tr);

        // Optionally, check for weather alerts (e.g., temperature threshold)
        checkForAlerts([{
            city: weatherData.name,
            temperature: weatherData.main.temp,
            windSpeed: weatherData.wind.speed,
            description: weatherData.weather[0].main
        }]);

    } catch (error) {
        console.error('Error fetching weather:', error);
    }
}

// Function to check for weather alerts based on the fetched data
const checkForAlerts = (weatherData) => {
    const alertList = document.getElementById('alert-list');
    alertList.innerHTML = ''; // Clear any existing alerts

    weatherData.forEach(cityData => {
        // Trigger alert if the temperature exceeds a threshold (e.g., 35°C)
        if (cityData.temperature > 35) {
            const alertItem = document.createElement('li');
            alertItem.textContent = `High temperature alert in ${cityData.city}: ${cityData.temperature}°C`;
            alertList.appendChild(alertItem);
        }

        // Wind speed alert (e.g., wind speed > 20 m/s)
        if (cityData.windSpeed > 20) {
            const windAlertItem = document.createElement('li');
            windAlertItem.textContent = `High wind speed alert in ${cityData.city}: ${cityData.windSpeed} m/s`;
            alertList.appendChild(windAlertItem);
        }

        // Storm or Severe Weather alert
        const severeWeatherConditions = ['Thunderstorm', 'Snow', 'Extreme'];
        if (severeWeatherConditions.includes(cityData.description)) {
            const stormAlertItem = document.createElement('li');
            stormAlertItem.textContent = `Severe weather alert in ${cityData.city}: ${cityData.description}`;
            alertList.appendChild(stormAlertItem);
        }
    });
};

// Generate the chart for daily weather summary (with actual data from API)
const generateWeatherChart = (weatherData) => {
    const ctx = document.getElementById('weatherChart').getContext('2d');

    // Destroy the previous chart if it exists
    if (chartInstance) {
        chartInstance.destroy();
    }

    const chartData = weatherData.map(cityData => ({
        label: cityData.city,
        data: cityData.temperatures,  // Real data from API
        borderColor: getRandomColor(),
        backgroundColor: getRandomColor(0.2),
        fill: true
    }));

    // Create a new chart instance
    chartInstance = new Chart(ctx, {
        type: 'line',
        data: {
            labels: ['2024-12-20', '2024-12-21', '2024-12-22', '2024-12-23', '2024-12-24'],  // Simulated dates (you may want actual date data)
            datasets: chartData
        },
        options: {
            responsive: true,
            scales: {
                y: {
                    beginAtZero: false
                }
            }
        }
    });
};

// Helper function to generate random color for chart lines
const getRandomColor = (opacity = 1) => {
    const randomColor = () => Math.floor(Math.random() * 256);
    return `rgba(${randomColor()}, ${randomColor()}, ${randomColor()}, ${opacity})`;
};

// Fetch weather data for each city when the page loads
document.addEventListener('DOMContentLoaded', async () => {
    // Fetch weather data for all cities
    const fetchPromises = cities.map(city => fetchWeather(city));

    // Wait for all fetches to complete
    await Promise.all(fetchPromises);

    // After all data is fetched, generate the chart
    generateWeatherChart(allCityData);
});
