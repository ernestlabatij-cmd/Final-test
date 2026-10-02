export async function WeathersApi(weather) { const url =
`https://api.open-meteo.com/v1/forecast?latitude=52.52&longitude=13.41&hourly=temperature_2m`
    const response = await fetch(url);

    if (!response.ok) {
        throw new Error("Failed to search city");
    }

    const data = await response.json();

    return data.results ?? [];
}