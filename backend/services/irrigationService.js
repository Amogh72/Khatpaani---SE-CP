const { getWeatherData } = require("./weatherService");
const { calculateET0 } = require("./et0Service");
const { getCropCoefficient } = require("./cropService");

const farmerDB = require("../data/farmers");

async function runDailyModel() {
    const weather = await getWeatherData();
    const et0 = calculateET0(weather);

    const farmers = farmerDB.getFarmers();

    const results = farmers.map(farmer => {
        // 🔧 default farm parameters
        const farm = {
            farmerName: farmer.name,
            crop: farmer.crop,
            sowingDays: 30,
            soilMoisture: 0.30,
            fieldCapacity: 0.40,
            wiltingPoint: 0.15,
            rootDepth: 0.5,
            area: 1
        };

        const kc = getCropCoefficient(farm.crop, farm.sowingDays);
        const etc = kc * et0;

        const rain = weather.rain;

        const soilBefore = farmer.soilMoisture ?? 0.30;

        const rainEffect = rain / (farm.rootDepth * 1000);
        const etcEffect = etc / (farm.rootDepth * 1000);

        let newSoil = soilBefore + rainEffect - etcEffect;

        if (newSoil > farm.fieldCapacity) newSoil = farm.fieldCapacity;
        if (newSoil < farm.wiltingPoint) newSoil = farm.wiltingPoint;

        const availableWater = farm.fieldCapacity - farm.wiltingPoint;
        const currentWater = newSoil - farm.wiltingPoint;
        const threshold = availableWater * 0.5;

        let irrigate = false;
        let waterNeeded = 0;
        let reason = "";

        if (currentWater < threshold) {
            irrigate = true;

            const deficit = farm.fieldCapacity - newSoil;

            waterNeeded =
                deficit *
                farm.rootDepth *
                farm.area *
                10000;

            newSoil = farm.fieldCapacity;

            reason = "Soil depleted after ET loss";
        } else {
            irrigate = false;
            reason = "Soil moisture sufficient";
        }

        farmer.soilMoisture = newSoil;

        return {
            farmer: farm.farmerName,
            crop: farmer.crop.toLowerCase(),
            et0: et0.toFixed(2),
            etc: etc.toFixed(2),
            rain,
            soilBefore: soilBefore.toFixed(3),
            irrigate,
            waterLiters: Math.round(waterNeeded),
            reason,
            soilAfter: newSoil.toFixed(3)
        };
    });

    return { weather, results };
}

module.exports = { runDailyModel };