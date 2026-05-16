function getCropCoefficient(crop, days) {
    const stages = {
        cotton: [
            { maxDays: 30, kc: 0.3 },
            { maxDays: 60, kc: 0.7 },
            { maxDays: 120, kc: 1.15 }
        ],
        wheat: [
            { maxDays: 20, kc: 0.4 },
            { maxDays: 50, kc: 0.8 },
            { maxDays: 120, kc: 1.1 }
        ]
    };

    const cropStages = stages[crop];

    for (let stage of cropStages) {
        if (days <= stage.maxDays) return stage.kc;
    }

    return 1.0;
}

module.exports = { getCropCoefficient };