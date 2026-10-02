import { searchCities } from "../../services/geocoding-api.js";
import { WeathersApi } from "../../services/weather-api.js"

const input = document.querySelector("#cityChoise");
const  resultContainer = document.querySelector("#holderChois");


input.addEventListener("keydown", async (event) => {
    if (event.key !== "Enter") {
        return;
    }
    const city = input.value.trim();

     if (!city) {
         return;
     }

     const results =  await searchCities(city);
     const weathers = await WeathersApi()

     resultContainer.innerHTML = "";

     results.forEach((city) => {
         const cityElement = document.createElement("div");

         cityElement.textContent = `${city.name}, ${city.country}`;

         cityElement.addEventListener("click",  () => {
             console.log(city);
         })

         resultContainer.append(cityElement);
     });
});

