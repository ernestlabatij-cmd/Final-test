export async function weatherApi(latitude, longitude) {
    const url =
        `https://api.open-meteo.com/v1/forecast` +
        `?latitude=${latitude}` +
        `&longitude=${longitude}` +
        `&current=temperature_2m,apparent_temperature,wind_speed_10m,weather_code,surface_pressure` +
        `&hourly=temperature_2m,precipitation_probability,surface_pressure` +
        `&daily=uv_index_max` +
        `&timezone=auto`;

    const response = await fetch(url);

    if (!response.ok) {
        throw new Error("Weather request failed");
    }

    return await response.json();
}