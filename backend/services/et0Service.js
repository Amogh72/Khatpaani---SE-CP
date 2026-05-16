function calculateET0(weather) {
    const tempMax = weather.tempMax ?? 30;
    const tempMin = weather.tempMin ?? 20;
    const tempMean = weather.tempMean ?? (tempMax + tempMin) / 2;
    const humidity = weather.humidity ?? 60;
    const windSpeed = weather.windSpeed ?? 2;
    const radiation = weather.radiation ?? 18;

    if (
        isNaN(tempMax) ||
        isNaN(tempMin) ||
        isNaN(tempMean) ||
        isNaN(humidity) ||
        isNaN(windSpeed) ||
        isNaN(radiation)
    ) {
        console.error("Invalid weather data:", weather);
        return 0;
    }

    const es =
        (0.6108 * Math.exp((17.27 * tempMax) / (tempMax + 237.3)) +
         0.6108 * Math.exp((17.27 * tempMin) / (tempMin + 237.3))) / 2;

    const ea = es * (humidity / 100);

    const delta =
        (4098 *
            (0.6108 * Math.exp((17.27 * tempMean) / (tempMean + 237.3)))) /
        Math.pow(tempMean + 237.3, 2);

    const gamma = 0.066;
    const Rn = radiation;
    const G = 0;

    const ET0 =
        (0.408 * delta * (Rn - G) +
            gamma * (900 / (tempMean + 273)) * windSpeed * (es - ea)) /
        (delta + gamma * (1 + 0.34 * windSpeed));

    return ET0;
}

module.exports = { calculateET0 };