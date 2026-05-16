function clean(value, fallback) {
    if (
        value === -999 ||
        value === undefined ||
        value === null ||
        isNaN(value)
    ) {
        return fallback;
    }
    return value;
}

let simDate = new Date();
simDate.setDate(simDate.getDate() - 20);

async function getWeatherData() {
    const lat = 18.5;
    const lon = 73.8;

    simDate.setDate(simDate.getDate() + 1);

    const dateStr = simDate.toISOString().slice(0, 10).replace(/-/g, "");

    const url = `https://power.larc.nasa.gov/api/temporal/daily/point?latitude=${lat}&longitude=${lon}&start=${dateStr}&end=${dateStr}&parameters=T2M_MAX,T2M_MIN,WS2M,RH2M,ALLSKY_SFC_SW_DWN,PRECTOTCORR&community=AG&format=JSON`;

    const response = await fetch(url);
    const data = await response.json();

    const daily = data.properties.parameter;
    console.log("NASA RAW RAIN:", daily.PRECTOTCORR[dateStr]);

    const tempMax = clean(daily.T2M_MAX[dateStr], 30);
    const tempMin = clean(daily.T2M_MIN[dateStr], 20);

    return {
        tempMax,
        tempMin,
        tempMean: (tempMax + tempMin) / 2,
        humidity: clean(daily.RH2M[dateStr], 60),
        windSpeed: clean(daily.WS2M[dateStr], 2),
        radiation: clean(daily.ALLSKY_SFC_SW_DWN[dateStr], 18),
        rain: clean(daily.PRECTOTCORR[dateStr], 0)
    };
}

module.exports = { getWeatherData };