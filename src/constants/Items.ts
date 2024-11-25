export const ITEMS_LIST = [
    {
      id: "pdt_QWovnGwqARBqUQQbmlEI7",
      imageSrc: "/books/lost-in-time.webp",
      altText: "Item 1",
      title: "Lost in Time",
      discount: "$12.80",
      price: "$16.00",
    },
    {
      id: "pdt_JVrQujYp8ERLONIGtYkgT",
      imageSrc: "/books/memoirs-of-a-wanderer.webp",
      altText: "Item 2",
      title: "Memoirs of a Wanderer",
      price: "$7.99",
    },
    {
      id: "pdt_YKmbI4CyHGmlyrg5XZl7g",
      imageSrc: "/books/himalyan-escape.webp",
      altText: "Item 3",
      title: "The Himalyan Escape",
      discount: "$12.80",
      price: "$16.00",
    },
    {
      id: "pdt_MApgjMlmLgXogiraKSeK3",
      imageSrc: "/books/echoes-of-past.webp",
      altText: "Item 4",
      title: "Echoes of the Past",
      price: "$13.99",
    },
    {
      id: "pdt_rkL69GfadxDLOiEk3LFNs",
      imageSrc: "/books/darkend-path.webp",
      altText: "Item 4",
      title: "The Darkened Path",
      price: "$8.99",
    },
    {
      id: "pdt_NIRgy5TTjBiFZxSSkRO8Q",
      imageSrc: "/books/whisper-of-wind.webp",
      altText: "Item 4",
      title: "Whispers in the Wind",
      price: "$13.50",
    },
  ];

  export const SUBSCRIPTION_PLANS = [
    {
      id: "pdt_a7rZcncnbD9sySxO4lj2Y",
      title: "Monthly plan",
      price: 15.0,
      image: {
        src: "/books/stack/Monthly.webp",
        width: "lg:w-[35vw] w-[90vw]",
      },
      features: [
        "Get 2 books every month",
        "Early access to new releases",
        "Weekly newsletter",
        "Monthly webinar invite",
      ],
      imagePosition: "right",
      interval: "monthly",
    intervalCount: 1,
    trialDays: 0, 
    },
    {
      id: "pdt_PKfYkaNVJ7m8QncvaaVip",
      title: "Yearly plan",
      price: 100.0,
      image: {
        src: "/books/stack/Yearly.webp",
        width: "lg:w-[45vw]  w-[90vw]",
      },
      features: [
        "Get 20 books every Year",
        "Early access to new releases",
        "Weekly newsletter",
        "Monthly webinar invite",
        "Dinner with author",
      ],
      imagePosition: "left",
      interval: "yearly",
      intervalCount: 1,
      trialDays: 0, // Added trial period
    },
  ];