import { searchCities } from "../../services/geocoding-api.js";
import { weatherApi } from "../../services/weather-api.js";

let forecastChart = null;
let barometerChart = null;

let currentWeather = null;
let selectedDayIndex = 0;
let currentCityName = "";

const input = document.querySelector("#cityChoise");
const holderChois = document.querySelector("#holderChois");

const temperatureElement = document.querySelector("#temperatyr");
const dateElement = document.querySelector("#day-time");
const weatherElement = document.querySelector("#Weather");

const indoorTemperature = document.querySelector("#temperatyr1");
const indoorHumidity = document.querySelector("#water");
const barometerValue = document.querySelector("#barometer");

const dailyDays = document.querySelector("#dailyDays");
const prevDayButton = document.querySelector("#prevDay");
const nextDayButton = document.querySelector("#nextDay");

const dailyCity = document.querySelector("#dailyCity");
const dailySummary = document.querySelector("#dailySummary");
const dailyMax = document.querySelector("#dailyMax");
const dailyMin = document.querySelector("#dailyMin");
const dailyWeatherIcon = document.querySelector("#dailyWeatherIcon");

const realFeel = document.querySelector("#realFeel");
const wind = document.querySelector("#wind");
const chanceOfRain = document.querySelector("#chanceOfRain");
const uvindex = document.querySelector("#uvindex");


// --------------------------------------------------
// WEATHER HELPERS
// --------------------------------------------------

function getWeatherType(code) {
    if (code === 0) return "sunny";

    if (code >= 1 && code <= 3) return "cloudy";

    if (code === 45 || code === 48) return "fog";

    if (code >= 51 && code <= 67) return "rain";

    if (code >= 71 && code <= 77) return "snow";

    if (code >= 80 && code <= 82) return "rain";

    if (code === 85 || code === 86) return "snow";

    if (code >= 95 && code <= 99) return "thunderstorm";

    return "cloudy";
}


function getWeatherEmoji(type) {
    const icons = {
        sunny: "☀️",
        cloudy: "⛅",
        fog: "🌫️",
        rain: "🌧️",
        snow: "❄️",
        thunderstorm: "⛈️"
    };

    return icons[type] ?? "☁️";
}


function formatDate(dateString, options) {
    // Use the date returned by the API without changing its day.
    const date = new Date(`${dateString}T12:00:00`);

    return date.toLocaleDateString("en-US", options);
}


function getCurrentHourIndex(weather) {
    const currentTime = weather.current.time;

    const index = weather.hourly.time.findIndex(
        time => time.slice(0, 13) === currentTime.slice(0, 13)
    );

    return index >= 0 ? index : 0;
}


// --------------------------------------------------
// CITY SEARCH
// --------------------------------------------------

input.addEventListener("keydown", async event => {
    if (event.key !== "Enter") return;

    const cityName = input.value.trim();

    if (!cityName) return;

    removeCityOptions();

    const loadingMessage = document.createElement("div");
    loadingMessage.className = "city-option";
    loadingMessage.textContent = "Searching...";
    holderChois.append(loadingMessage);

    try {
        const results = await searchCities(cityName);

        removeCityOptions();

        if (!results.length) {
            showSearchMessage("City not found");
            return;
        }

        results.forEach(city => {
            const cityElement = document.createElement("button");

            cityElement.type = "button";
            cityElement.className = "city-option";
            cityElement.textContent =
                `${city.name}, ${city.country}`;

            cityElement.addEventListener("click", async () => {
                await selectCity(city);
            });

            holderChois.append(cityElement);
        });

    } catch (error) {
        console.error("City search failed:", error);

        removeCityOptions();
        showSearchMessage("Could not search cities");
    }
});


function removeCityOptions() {
    holderChois.querySelectorAll(".city-option").forEach(element => {
        element.remove();
    });
}


function showSearchMessage(message) {
    const element = document.createElement("div");

    element.className = "city-option";
    element.textContent = message;

    holderChois.append(element);
}


// --------------------------------------------------
// SELECT CITY AND LOAD WEATHER
// --------------------------------------------------

async function selectCity(city) {
    input.value = `${city.name}, ${city.country}`;

    removeCityOptions();

    try {
        const weather = await weatherApi(
            city.latitude,
            city.longitude
        );

        if (!weather.current || !weather.hourly || !weather.daily) {
            throw new Error("Weather response is missing required data");
        }

        currentWeather = weather;
        currentCityName = `${city.name}, ${city.country}`;
        selectedDayIndex = 0;

        document.body.dataset.weather = getWeatherType(
            weather.current.weather_code
        );

        updateCurrentWeather(weather);
        renderDailyForecast(weather);

    } catch (error) {
        console.error("Could not load weather:", error);
        dailySummary.textContent = "Could not load weather";
    }
}


// --------------------------------------------------
// CURRENT WEATHER AND INDOOR PANEL
// --------------------------------------------------

function updateCurrentWeather(weather) {
    const current = weather.current;

    temperatureElement.textContent =
        `${Math.round(current.temperature_2m)}°C`;

    weatherElement.textContent =
        getWeatherType(current.weather_code);

    dateElement.textContent =
        formatDate(current.time.slice(0, 10), {
            weekday: "long",
            day: "numeric",
            month: "short",
            year: "numeric"
        });

    // Open-Meteo provides outdoor conditions.
    // These are placeholders for the Indoor panel,
    // not measurements from a real indoor sensor.
    indoorTemperature.textContent =
        `${Math.round(current.temperature_2m)}°C`;

    indoorHumidity.textContent =
        weather.current.relative_humidity_2m ?? "--";

    updateBarometerValue(current.surface_pressure);

    createForecastChart(weather, selectedDayIndex);
    createBarometerChart(weather, selectedDayIndex);
}


function updateBarometerValue(pressureHpa) {
    if (pressureHpa == null) {
        barometerValue.textContent = "--";
        return;
    }

    // Convert hPa to inches of mercury (inHg).
    barometerValue.textContent =
        (pressureHpa / 33.8639).toFixed(2);
}


// --------------------------------------------------
// DAILY FORECAST AND DAY CAROUSEL
// --------------------------------------------------

function renderDailyForecast(weather) {
    const daily = weather.daily;

    if (!daily?.time?.length) {
        dailySummary.textContent = "Daily forecast unavailable";
        return;
    }

    dailyCity.textContent = currentCityName;
    dailyDays.replaceChildren();

    const dayCount = Math.min(daily.time.length, 7);

    // Keep the selected index inside the available range.
    selectedDayIndex = Math.max(
        0,
        Math.min(selectedDayIndex, dayCount - 1)
    );

    for (let i = 0; i < dayCount; i++) {
        const button = document.createElement("button");

        button.type = "button";
        button.className = "daily-day";

        const type = getWeatherType(daily.weather_code[i]);

        const dayName = formatDate(daily.time[i], {
            weekday: "short"
        });

        const dateLabel = formatDate(daily.time[i], {
            day: "numeric",
            month: "short"
        });

        const temperature = Math.round(
            daily.temperature_2m_max[i]
        );

        const nameElement = document.createElement("span");
        nameElement.className = "daily-day-name";
        nameElement.textContent = dayName;

        const iconElement = document.createElement("span");
        iconElement.className = "daily-day-icon";
        iconElement.textContent = getWeatherEmoji(type);

        const dateElement = document.createElement("span");
        dateElement.className = "daily-day-date";
        dateElement.textContent = dateLabel;

        const temperatureElement = document.createElement("span");
        temperatureElement.className = "daily-day-temp";
        temperatureElement.textContent = `${temperature}°`;

        button.append(
            nameElement,
            iconElement,
            dateElement,
            temperatureElement
        );

        button.classList.toggle(
            "active",
            i === selectedDayIndex
        );

        button.setAttribute(
            "aria-pressed",
            String(i === selectedDayIndex)
        );

        button.addEventListener("click", () => {
            selectedDayIndex = i;
            renderDailyForecast(weather);
        });

        dailyDays.append(button);
    }

    prevDayButton.disabled = selectedDayIndex === 0;
    nextDayButton.disabled = selectedDayIndex === dayCount - 1;

    renderSelectedDay(weather);
}


function renderSelectedDay(weather) {
    const daily = weather.daily;
    const index = selectedDayIndex;

    if (!daily.time[index]) return;

    const type = getWeatherType(daily.weather_code[index]);

    dailySummary.textContent =
        type.charAt(0).toUpperCase() + type.slice(1);

    dailyWeatherIcon.textContent = getWeatherEmoji(type);

    dailyMax.textContent =
        `${Math.round(daily.temperature_2m_max[index])}°`;

    dailyMin.textContent =
        `${Math.round(daily.temperature_2m_min[index])}°`;

    const apparentTemperature =
        daily.apparent_temperature_max?.[index];

    realFeel.textContent = apparentTemperature != null
        ? `${Math.round(apparentTemperature)}°C`
        : "--°C";

    const windSpeed = daily.wind_speed_10m_max?.[index];

    wind.textContent = windSpeed != null
        ? `${Math.round(windSpeed)} km/h`
        : "-- km/h";

    const rainChance =
        daily.precipitation_probability_max?.[index];

    chanceOfRain.textContent = rainChance != null
        ? `${rainChance}%`
        : "--%";

    const uv = daily.uv_index_max?.[index];

    uvindex.textContent = uv != null
        ? String(Math.round(uv))
        : "--";

    // Update both charts to show the selected date.
    createForecastChart(weather, index);
    createBarometerChart(weather, index);
}


// Previous day button.
prevDayButton.addEventListener("click", () => {
    if (!currentWeather || selectedDayIndex === 0) return;

    selectedDayIndex--;
    renderDailyForecast(currentWeather);
});


// Next day button.
nextDayButton.addEventListener("click", () => {
    if (!currentWeather) return;

    const lastDay = Math.min(
        currentWeather.daily.time.length,
        7
    ) - 1;

    if (selectedDayIndex >= lastDay) return;

    selectedDayIndex++;
    renderDailyForecast(currentWeather);
});


// --------------------------------------------------
// 12-HOUR TEMPERATURE CHART
// --------------------------------------------------

function createForecastChart(weather, dayIndex = 0) {
    const canvas = document.querySelector("#forecastChart");

    if (!canvas) return;

    const selectedDate = weather.daily.time[dayIndex];

    let startIndex;

    if (dayIndex === 0) {
        startIndex = getCurrentHourIndex(weather);
    } else {
        startIndex = weather.hourly.time.findIndex(
            time => time.startsWith(selectedDate)
        );
    }

    if (startIndex < 0) return;

    const times = weather.hourly.time.slice(
        startIndex,
        startIndex + 12
    );

    const temperatures = weather.hourly.temperature_2m.slice(
        startIndex,
        startIndex + 12
    );

    const labels = times.map(time => {
        return new Date(time).toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit"
        });
    });

    if (forecastChart) {
        forecastChart.destroy();
    }

    forecastChart = new Chart(canvas.getContext("2d"), {
        type: "line",

        data: {
            labels,

            datasets: [{
                data: temperatures,
                borderColor: "#FFFFFF",
                backgroundColor: "rgba(255,255,255,0.12)",
                borderWidth: 2,
                tension: 0.45,
                pointRadius: 3,
                pointHoverRadius: 5,
                pointBackgroundColor: "#FFFFFF",
                fill: false
            }]
        },

        options: {
            responsive: true,
            maintainAspectRatio: false,

            plugins: {
                legend: {
                    display: false
                },
                tooltip: {
                    callbacks: {
                        label: context => `${context.parsed.y}°C`
                    }
                }
            },

            scales: {
                x: {
                    grid: {
                        display: false
                    },
                    border: {
                        display: false
                    },
                    ticks: {
                        color: "#FFFFFF",
                        maxTicksLimit: 6
                    }
                },

                y: {
                    display: false,
                    grid: {
                        display: false
                    }
                }
            }
        }
    });
}


function createBarometerChart(weather, dayIndex = 0) {
    const canvas = document.querySelector("#barometerChart");

    if (!canvas) return;

    const selectedDate = weather.daily.time[dayIndex];

    const pressure = weather.hourly.surface_pressure.filter(
        (_, index) => {
            return weather.hourly.time[index].startsWith(selectedDate);
        }
    ).slice(0, 8);

    if (!pressure.length) return;

    if (barometerChart) {
        barometerChart.destroy();
    }

    barometerChart = new Chart(canvas.getContext("2d"), {
        type: "line",

        data: {
            labels: pressure.map((_, index) => index),

            datasets: [{
                data: pressure,
                borderColor: "#FFFFFF",
                backgroundColor: "rgba(255,255,255,0.10)",
                borderWidth: 2,
                tension: 0.45,
                pointRadius: 2,
                pointHoverRadius: 4,
                pointBackgroundColor: "#FFFFFF",
                fill: false
            }]
        },

        options: {
            responsive: true,
            maintainAspectRatio: false,

            plugins: {
                legend: {
                    display: false
                },
                tooltip: {
                    callbacks: {
                        label: context => `${context.parsed.y} hPa`
                    }
                }
            },

            scales: {
                x: {
                    display: false,
                    grid: {
                        display: false
                    }
                },

                y: {
                    display: false,
                    grid: {
                        display: false
                    }
                }
            }
        }
    });
}