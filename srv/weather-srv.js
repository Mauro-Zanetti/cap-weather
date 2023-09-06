const cds = require('@sap/cds')
const constants = require('./Constants.json');

module.exports = cds.service.impl(async function() {

    const bupa = await cds.connect.to('OpenWeatherApi');

    this.on('READ', 'CurrentWeather', async req => {
        console.log("READ CurrentWeather")
        const query = beforeCurrentWeather(req);
        console.log("req.query", query) // req.query GET /weather?appid=<apiKey>&units=metric&id=2643743
        const aux = await bupa.run(query); // GET /weather?units=metric&id=2643743
        console.log(aux);
        return aux;
    });

    // ?$filter=id eq 2643743
    // /2643743

    function beforeCurrentWeather(req) {
        try {
            console.log("READ CurrentWeather2", req.query)
            const queryParams = parseQueryParams(req.query.SELECT);
            const queryString = Object.keys(queryParams)
                .map((key) => `${key}=${queryParams[key]}`)
                .join("&");
            return `GET /weather?${queryString}`;
        } catch (error) {
            req.reject(400, error.message);
        }
    }

    function parseQueryParams(select) {
        const filter = {};
        Object.assign(
            filter,
            parseExpression(select.from.ref[0].where),
            parseExpression(select.where)
        );

        if (!Object.keys(filter).length) {
            throw new Error("At least one filter is required");
        }

        const apiKey = constants.APIKey; // Conseguir su apiKey en https://home.openweathermap.org/api_keys
        if (!apiKey) {
            throw new Error("API key is missing.");
        }

        const params = {
            appid: apiKey,
            units: "metric",
        };

        for (const key of Object.keys(filter)) {
            switch (key) {
                case "id":
                    params["id"] = filter[key];
                    break;
                case "city":
                    params["q"] = filter[key];
                    break;
                default:
                    throw new Error(`Filter by '${key}' is not supported.`);
            }
        }

        return params;
    }

    function parseExpression(expr) {
        if (!expr) {
            return {};
        }
        const [property, operator, value] = expr;
        if (operator !== "=") {
            throw new Error(`Expression with '${operator}' is not allowed.`);
        }
        const parsed = {};
        if (property && value) {
            parsed[property.ref[0]] = value.val;
        }
        return parsed;
    }
});