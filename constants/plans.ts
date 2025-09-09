export type Card = {
    heading: string;
    description: string;
    price: number;
    list: string[];
    discount?: number;
    listHeading?: string;
    className?: string;
    name: string;
};

export const PLANS: Card[] = [
    {
        heading: "Starter",
        name: "starter",
        description: "Perfect for individuals just starting out with basic usage limits.",
        price: 199,
        discount: 100,
        list: ["75 monthly tokens", "Interviews with our AI", "Detailed evaluation reports"],
        className: "",
    },
    {
        heading: "Essential",
        name: "essential",
        description: "Ideal for advanced users seeking increased limits.",
        price: 999,
        discount: 50,
        list: ["400 monthly tokens", "Interviews with our AI", "Detailed evaluation reports"],
        className: "",
    },
    {
        heading: "Pro",
        name: "pro",
        description: "Best suited for power users requiring the highest limits.",
        price: 1999,
        discount: 50,
        list: ["1000 monthly tokens", "Interviews with our AI", "Detailed evaluation reports"],
        className: "",
    },
];