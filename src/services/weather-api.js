export async function weatherApi(latitude, longitude) {
    const url =
        `https://api.open-meteo.com/v1/forecast` +
        `?latitude=${latitude}` +
        `&longitude=${longitude}` +
        `&current=temperature_2m` +
        `&timezone=auto`;

    const response = await fetch(url);

    if (!response.ok) {
        throw new Error("Weather request failed");
    }

    const data = await response.json();

    return data;
}