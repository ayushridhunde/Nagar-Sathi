export const mockPredictions = [
  {
    id: "PRED-001",
    type: "Waterlogging Risk",
    location: "Wardha Road, Nagpur",
    riskLevel: "Critical",
    riskPercentage: 91,
    timeframe: "Next 24–48 hours",
    description: "Meteorological forecast indicates high-intensity precipitation (50mm+). Historic drainage flow data and topological mapping suggest a 91% probability of severe waterlogging in low-lying sections of Wardha Road.",
    recommendedAction: "Pre-position drainage response team and clear catch basins at underpass points.",
    category: "Drainage",
    status: "Action Suggested"
  },
  {
    id: "PRED-002",
    type: "Road Damage Risk",
    location: "Hingna Road, Nagpur",
    riskLevel: "High",
    riskPercentage: 82,
    timeframe: "Next 3-5 days",
    description: "Heavy multi-axle freight traffic combined with recent micro-cracking reports on Hingna Road points to active asphalt degradation and immediate pothole development risk.",
    recommendedAction: "Schedule pre-emptive road inspection and micro-surfacing repair crews.",
    category: "Roads & Potholes",
    status: "Inspection Scheduled"
  },
  {
    id: "PRED-003",
    type: "Garbage Overflow Risk",
    location: "Mahal Market Area, Nagpur",
    riskLevel: "High",
    riskPercentage: 76,
    timeframe: "Next 24 hours",
    description: "Upcoming local festival bazaar expected to double daily retail footfall in Mahal, overloading current sanitation dump bins by 76% above peak capacity.",
    recommendedAction: "Increase garbage truck collection frequency to 3 times daily and place auxiliary bins.",
    category: "Garbage",
    status: "Action Initiated"
  },
  {
    id: "PRED-004",
    type: "Streetlight Cluster Outage",
    location: "Sadar Commercial Belt, Nagpur",
    riskLevel: "Medium",
    riskPercentage: 64,
    timeframe: "Next 7 days",
    description: "Localized transformer load fluctuations and aged cabling show higher thermal stress profiles, suggesting a 64% chance of bulb or line failure in Sadar.",
    recommendedAction: "Verify capacitor banks and perform routine cable resistance diagnostics.",
    category: "Street Lights",
    status: "Monitoring"
  }
];

export const mockAiRecommendations = [
  {
    id: "REC-001",
    priority: "Priority 1",
    task: "Inspect drainage channels and clean silt traps near Wardha Road underpass.",
    targetDate: "Today",
    riskType: "Waterlogging (91%)",
    department: "Sewerage Operations",
    status: "Pending Action",
    actionText: "Deploy Team"
  },
  {
    id: "REC-002",
    priority: "Priority 2",
    task: "Deploy sanitation mobile team and 2 extra dumpsters to Mahal market square.",
    targetDate: "Tomorrow morning",
    riskType: "Garbage Overflow (76%)",
    department: "Sanitation Dept",
    status: "Assigned",
    actionText: "View Details"
  },
  {
    id: "REC-003",
    priority: "Priority 3",
    task: "Schedule pre-emptive asphalt patch test and compaction inspection at Hingna Road.",
    targetDate: "Next 48 Hours",
    riskType: "Road Crack Progression (82%)",
    department: "Road Maintenance",
    status: "Scheduled",
    actionText: "Confirm Crew"
  },
  {
    id: "REC-004",
    priority: "Priority 4",
    task: "Check electrical pole insulation and light sensors cluster in Sadar market.",
    targetDate: "This week",
    riskType: "Streetlight Outage (64%)",
    department: "Electrical Maintenance",
    status: "Monitoring",
    actionText: "Acknowledge"
  }
];
