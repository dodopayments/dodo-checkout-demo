import { COUNTRIES } from "@/components/ui/CountrySelector/countries";
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
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_DODO_TEST_API}/checkout/supported_countries`,
      {
        method: "GET",
        headers: { "Content-Type": "application/json" },
      }
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    const matchedCountries = getMatchedCountries(data, COUNTRIES);
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
