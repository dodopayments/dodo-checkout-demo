export const ITEMS_LIST = [
    {
      id: "pdt_iSwFr5TWhK9MmXdvrpTHl",
      imageSrc: "/books/lost-in-time.webp",
      altText: "Item 1",
      title: "Lost in Time",
      discount: "$12.80",
      price: "$16.00",
    },
    {
      id: "pdt_l1YmkrdEHcU9ZT5B302as",
      imageSrc: "/books/memoirs-of-a-wanderer.webp",
      altText: "Item 2",
      title: "Memoirs of a Wanderer",
      price: "$7.99",
    },
    {
      id: "pdt_DoLCsscuPM0BzcPtxynh9",
      imageSrc: "/books/himalyan-escape.webp",
      altText: "Item 3",
      title: "The Himalyan Escape",
      discount: "$12.80",
      price: "$16.00",
    },
    {
      id: "pdt_X6gfeufWfvGZIp2JXE5Qs",
      imageSrc: "/books/echoes-of-past.webp",
      altText: "Item 4",
      title: "Echoes of the Past",
      price: "$13.99",
    },
    {
      id: "pdt_0CA5DAf9umbBmXjIuE1NK",
      imageSrc: "/books/darkend-path.webp",
      altText: "Item 4",
      title: "The Darkened Path",
      price: "$8.99",
    },
    {
      id: "pdt_8PBJHxzdtBKFO7FL7Ikbj",
      imageSrc: "/books/whisper-of-wind.webp",
      altText: "Item 4",
      title: "Whispers in the Wind",
      price: "$13.50",
    },
  ];

  export const SUBSCRIPTION_PLANS = [
    {
      id: "pdt_ACeg1XEwVQfolABsCOT5g",
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
      id: "pdt_m9BBIHiVJqcMd7y2EHkST",
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