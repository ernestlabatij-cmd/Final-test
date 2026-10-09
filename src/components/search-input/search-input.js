
import { searchCities } from "../../services/geocoding-api.js";
import { weatherApi } from "../../services/weather-api.js";

let forecastChart = null;
let barometerChart = null;


const input = document.querySelector("#cityChoise");
const holderChois = document.querySelector("#holderChois");

const temperatureElement = document.querySelector("#temperatyr");

const realFeel = document.querySelector("#realFeel");
const wind = document.querySelector("#wind");
const uvindex = document.querySelector("#uvindex");
const chanceofrain = document.getElementById("chance of rain");
const Weather = document.querySelector("#Weather");


input.addEventListener("keydown", async (event) => {

    if (event.key !== "Enter") {
        return;
    }

    const cityName = input.value.trim();

    if (!cityName) {
        return;
    }


    const results = await searchCities(cityName);

    console.log(results);


    results.forEach((city) => {

        const cityElement = document.createElement("button");

        cityElement.textContent =
            `${city.name}, ${city.country}`;

        cityElement.classList.add("city-option");


        cityElement.addEventListener("click", async () => {

            input.value =
                `${city.name}, ${city.country}`;


            holderChois
                .querySelectorAll(".city-option")
                .forEach((element) => {
                    element.remove();
                });


            const weather = await weatherApi(
                city.latitude,
                city.longitude
            );

            createForecastChart(weather);
            createBarometerChart(weather);

     const weatherCode = weather.current.weather_code;

    const weatherType = getWeatherType(weatherCode);

    document.body.dataset.weather = weatherType;




            console.log(weather);


            temperatureElement.textContent =
                `${weather.current.temperature_2m}°C`;

            realFeel.textContent =
                `${weather.current.apparent_temperature}°C`;

            wind.textContent =
                `${weather.current.wind_speed_10m} km/h`;

            uvindex.textContent =
                `${weather.daily.uv_index_max}`;

            chanceofrain.textContent =
                `${weather.hourly.precipitation_probability[0]}%`;

            Weather.textContent =
                weatherType;


        });


        holderChois.append(cityElement);
    });

    function getWeatherType(weatherCode) {

        if (weatherCode === 0) {
            return "sunny";
        }

        if (weatherCode >= 1 && weatherCode <= 3) {
            return "cloudy";
        }

        if (weatherCode === 45 || weatherCode === 48) {
            return "fog";
        }

        if (weatherCode >= 51 && weatherCode <= 67) {
            return "rain";
        }

        if (weatherCode >= 71 && weatherCode <= 77) {
            return "snow";
        }

        if (weatherCode >= 80 && weatherCode <= 82) {
            return "rain";
        }

        if (weatherCode === 85 || weatherCode === 86) {
            return "snow";
        }

        if (weatherCode >= 95 && weatherCode <= 99) {
            return "thunderstorm";
        }

        return "cloudy";
    }



});


function createForecastChart(weather) {
    const canvas = document.querySelector("#forecastChart");

    if (!canvas) {
        return;

    }

    const currentTime = weather.current.time;

    const startIndex = weather.hourly.time.findIndex(
        (time) => time >= currentTime.slice(0, 13)
    );

    const index = startIndex === -1 ? 0 : startIndex;

    const times = weather.hourly.time.slice(index, index + 12);
    const temperatures = weather.hourly.temperature_2m.slice(
        index,
        index + 12
    );

    const labels = times.map((time) => {
        const date = new Date(time);

        return date.toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit"
        });
    });

    if (forecastChart) {
        forecastChart.destroy();
    }

    const ctx = canvas.getContext("2d");

    forecastChart = new Chart(ctx, {
        type: "line",

        data: {
            labels: labels,

            datasets: [
                {
                    data: temperatures,

                    borderWidth: 2,

                    tension: 0.45,

                    pointRadius: 3,

                    pointHoverRadius: 5,

                    fill: false
                }
            ]
        },
        

        options: {
            responsive: true,

            maintainAspectRatio: false,

            plugins: {
                legend: {
                    display: false
                }
            },

            scales: {
                x: {
                    grid: {
                        display: false
                    },

                    ticks: {
                        display: true
                    },

                    border: {
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


function createBarometerChart(weather) {
    const canvas = document.querySelector("#barometerChart");
    if (!canvas) {
        return;
    }

    const pressure = weather.hourly.surface_pressure.slice(0, 8);

    if (barometerChart) {
        barometerChart.destroy();
    }

    const ctx = canvas.getContext("2d");

    barometerChart = new Chart(ctx, {
        type: "line",

        data: {
            labels: pressure.map((_, index) => index),

            datasets: [
                {
                    data: pressure,

                    borderWidth: 3,

                    tension: 0.45,

                    pointRadius: 6,

                    fill: false
                }
            ]
        },

        options: {
            responsive: true,
            maintainAspectRatio: false,

            plugins: {
                legend: {
                    display: false
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



