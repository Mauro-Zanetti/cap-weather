@Capabilities.KeyAsSegmentSupported: true
service WeatherService {
    @readonly
    entity CurrentWeather {
        key id   : Integer;
            name : String;
            cod  : Integer;
            main : WeatherCondition
    };

    type WeatherCondition : {
        humidity : Decimal(4, 1);
        temp     : Decimal(5, 2);
        temp_min : Decimal(5, 2);
        temp_max : Decimal(5, 2);
    }
}
