export const mockTrains = [
  {
    id: 1,
    name: "Chennai Express",
    number: "12601",
    from: "Chennai",
    to: "Bangalore",
    departure: "06:00",
    arrival: "12:00",
    duration: "6h",
    classes: [
      { type: "SL", available: true },
      { type: "3AC", available: true },
      { type: "2AC", available: false },
    ],
  },
  {
    id: 2,
    name: "Shatabdi Express",
    number: "12028",
    from: "Chennai",
    to: "Bangalore",
    departure: "07:30",
    arrival: "11:30",
    duration: "4h",
    classes: [
      { type: "CC", available: true },
      { type: "EC", available: false },
    ],
  },
];