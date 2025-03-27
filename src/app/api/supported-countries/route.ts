import { COUNTRIES } from "@/components/ui/CountrySelector/countries";
import { dodopayments } from "@/lib/dodopayments";
import { NextResponse } from "next/server";



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



export async function GET() {
  try {
    const response = await dodopayments.misc.listSupportedCountries()

    const matchedCountries = getMatchedCountries(response, COUNTRIES);
    return NextResponse.json({ countries: matchedCountries });

  } catch (error) {
    console.error("An error occurred while fetching countries:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "An unknown error occurred",
      },
      { status: 500 }
    );
  }
}
