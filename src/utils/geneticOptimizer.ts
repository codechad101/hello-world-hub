import { CandleData, StrategyParams, backtestStrategy, DEFAULT_PARAMS } from "./mlTraining";

export interface Individual {
    params: StrategyParams;
    fitness: number;
    accuracy: number;
    profit: number;
}

const POPULATION_SIZE = 20;
const MUTATION_RATE = 0.1;

// Generate a random integer between min and max (inclusive)
const randomInt = (min: number, max: number) => Math.floor(Math.random() * (max - min + 1)) + min;

// Generate a random float between min and max
const randomFloat = (min: number, max: number) => Math.random() * (max - min) + min;

export const generateRandomStrategy = (): StrategyParams => {
    return {
        rsiPeriod: randomInt(5, 30),
        rsiOverbought: randomInt(60, 90),
        rsiOversold: randomInt(10, 40),
        macdFast: randomInt(5, 20),
        macdSlow: randomInt(21, 50),
        macdSignal: randomInt(5, 15),
        smaFastPeriod: randomInt(5, 50),
        smaSlowPeriod: randomInt(51, 200),
        volatilityPeriod: randomInt(10, 50),
        volumeThreshold: randomFloat(1.1, 3.0),
    };
};

export const createInitialPopulation = (): Individual[] => {
    const population: Individual[] = [];
    // Always include the default strategy as a baseline
    population.push({
        params: DEFAULT_PARAMS,
        fitness: 0,
        accuracy: 0,
        profit: 0,
    });

    for (let i = 1; i < POPULATION_SIZE; i++) {
        population.push({
            params: generateRandomStrategy(),
            fitness: 0,
            accuracy: 0,
            profit: 0,
        });
    }
    return population;
};

export const evaluatePopulation = (population: Individual[], candles: CandleData[]): Individual[] => {
    return population.map((ind) => {
        // Skip if already evaluated (optimization)
        if (ind.fitness !== 0) return ind;

        const result = backtestStrategy(candles, ind.params);

        // Fitness function: Balance between profit and accuracy
        // We want positive profit and decent accuracy
        // If profit is negative, fitness is low
        let fitness = result.profit;

        // Penalize low accuracy
        if (result.accuracy < 40) fitness -= 50;

        // Penalize very few trades (overfitting/inactivity)
        if (result.trades < 5) fitness -= 20;

        return {
            ...ind,
            fitness,
            accuracy: result.accuracy,
            profit: result.profit,
        };
    }).sort((a, b) => b.fitness - a.fitness); // Sort by fitness descending
};

const crossover = (parent1: StrategyParams, parent2: StrategyParams): StrategyParams => {
    // Uniform crossover
    return {
        rsiPeriod: Math.random() > 0.5 ? parent1.rsiPeriod : parent2.rsiPeriod,
        rsiOverbought: Math.random() > 0.5 ? parent1.rsiOverbought : parent2.rsiOverbought,
        rsiOversold: Math.random() > 0.5 ? parent1.rsiOversold : parent2.rsiOversold,
        macdFast: Math.random() > 0.5 ? parent1.macdFast : parent2.macdFast,
        macdSlow: Math.random() > 0.5 ? parent1.macdSlow : parent2.macdSlow,
        macdSignal: Math.random() > 0.5 ? parent1.macdSignal : parent2.macdSignal,
        smaFastPeriod: Math.random() > 0.5 ? parent1.smaFastPeriod : parent2.smaFastPeriod,
        smaSlowPeriod: Math.random() > 0.5 ? parent1.smaSlowPeriod : parent2.smaSlowPeriod,
        volatilityPeriod: Math.random() > 0.5 ? parent1.volatilityPeriod : parent2.volatilityPeriod,
        volumeThreshold: Math.random() > 0.5 ? parent1.volumeThreshold : parent2.volumeThreshold,
    };
};

const mutate = (params: StrategyParams): StrategyParams => {
    const newParams = { ...params };

    if (Math.random() < MUTATION_RATE) newParams.rsiPeriod = randomInt(5, 30);
    if (Math.random() < MUTATION_RATE) newParams.rsiOverbought = randomInt(60, 90);
    if (Math.random() < MUTATION_RATE) newParams.rsiOversold = randomInt(10, 40);
    if (Math.random() < MUTATION_RATE) newParams.macdFast = randomInt(5, 20);
    if (Math.random() < MUTATION_RATE) newParams.macdSlow = randomInt(21, 50);
    if (Math.random() < MUTATION_RATE) newParams.macdSignal = randomInt(5, 15);
    if (Math.random() < MUTATION_RATE) newParams.smaFastPeriod = randomInt(5, 50);
    if (Math.random() < MUTATION_RATE) newParams.smaSlowPeriod = randomInt(51, 200);
    if (Math.random() < MUTATION_RATE) newParams.volatilityPeriod = randomInt(10, 50);
    if (Math.random() < MUTATION_RATE) newParams.volumeThreshold = randomFloat(1.1, 3.0);

    // Ensure logical constraints
    if (newParams.smaFastPeriod >= newParams.smaSlowPeriod) {
        newParams.smaFastPeriod = Math.floor(newParams.smaSlowPeriod / 2);
    }
    if (newParams.macdFast >= newParams.macdSlow) {
        newParams.macdFast = Math.floor(newParams.macdSlow / 2);
    }

    return newParams;
};

export const evolvePopulation = (population: Individual[]): Individual[] => {
    const newPopulation: Individual[] = [];

    // Elitism: Keep the best 2
    newPopulation.push(population[0]);
    newPopulation.push(population[1]);

    // Generate rest
    while (newPopulation.length < POPULATION_SIZE) {
        // Tournament selection
        const p1 = population[randomInt(0, Math.min(10, population.length - 1))];
        const p2 = population[randomInt(0, Math.min(10, population.length - 1))];

        let childParams = crossover(p1.params, p2.params);
        childParams = mutate(childParams);

        newPopulation.push({
            params: childParams,
            fitness: 0, // Needs evaluation
            accuracy: 0,
            profit: 0,
        });
    }

    return newPopulation;
};
