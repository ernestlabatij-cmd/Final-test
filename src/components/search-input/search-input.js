import { searchCities } from "../../services/geocoding-api.js";
import { weatherApi } from "../../services/weather-api.js";



const input = document.querySelector("#cityChoise");
const holderChois = document.querySelector("#holderChois");

const temperatureElement = document.querySelector("#temperatyr");

const realFeel = document.querySelector("#realFeel");
const wind = document.querySelector("#wind");
const uvindex = document.querySelector("#uvindex");
const chanceofrain = document.querySelector("#chance of rain");
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


            console.log(weather);


            temperatureElement.textContent =
                `${weather.current.temperature_2m}°C`;

            realFeel.textContent =
                `${weather.current.apparent_temperature}°C`;

            wind.textContent =
                `${weather.current.wind_speed_10m}°C`;

            uvindex.textContent =
                `${weather.daily.uv_index_max}°C`;

            chanceofrain.textContent =
                `${precipitation_probability}°C`;

            Weather.textContent =
                `${weather.current.weather_code}°C`;

        });


        holderChois.append(cityElement);
    });
});