import { COUNTRIES } from "./countries";

function getMatchedCountries(
    countryValues: string[],
    countryObjects: ReadonlyArray<{ title: string; value: string }>
  ) {
    return countryObjects.reduce((acc, country) => {
      if (countryValues.includes(country.value)) {
        acc.push({ ...country });
      }
      return acc;
    }, [] as { title: string; value: string }[]);
  }
  
  export const fetchCountries = async () => {
    try {
      const response = await fetch(
        `https://internal.dodopayments.tech/checkout/supported_countries`,
        {
          method: "GET",
          headers: { "Content-Type": "application/json" },
        }
      );
  
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
  
      const data = await response.json();
      return getMatchedCountries(data, COUNTRIES);
    } catch (error) {
      console.error("An error occurred while fetching countries:", error);
      throw error;
    }
  };