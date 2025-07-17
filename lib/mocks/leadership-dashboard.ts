import { v4 as uuidv4 } from "uuid";

export const mockLeadershipAgents = Array.from({ length: 80 }).map((_, i) => {
  const names = [
    "Vikram Singh",
    "Priya Sharma",
    "Rajesh Kumar",
    "Sneha Reddy",
    "Amit Patel",
    "Kavya Nair",
    "Arjun Mehta",
    "Deepika Singh",
    "Rohit Sharma",
    "Ananya Das",
  ];
  const name = names[i % names.length];
  const fullName = `${name}${i >= names.length ? " " + (Math.floor(i / names.length) + 1) : ""}`.trim();
  return {
    id: `AGT_${(i + 1).toString().padStart(3, "0")}`,
    uuid: uuidv4(),
    name: fullName,
    email: `${name.split(" ").join(".").toLowerCase()}${i >= names.length ? Math.floor(i / names.length) + 1 : ""}@vykc.co`,
    avatar: `/placeholder.svg?height=64&width=64&query=${name.split(" ")[0]}`,
    rank: i + 1,
    score: Math.round(2450 - i * 23.5),
    monthlyStats: {
      totalCalls: Math.max(200, Math.round(1400 - i * 15)),
      successRate: Math.max(75, 98 - i * 0.4),
      errorRate: Math.min(25, 2 + i * 0.4),
      customerRating: Math.max(3.5, 4.9 - i * 0.02),
      improvement: Math.max(-10, 5 - i * 0.05),
    },
    team: ["Alpha", "Beta", "Gamma", "Delta", "Epsilon"][i % 5],
    location: ["Mumbai", "Delhi", "Bangalore", "Hyderabad", "Chennai"][i % 5],
  };
}); 