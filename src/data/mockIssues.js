export const mockIssues = [
  {
    id: "NGP-2026-00124",
    category: "Water Supply",
    subcategory: "Water Pipeline Leakage",
    location: "Dharampeth, Nagpur",
    status: "In Progress",
    priority: "High",
    aiScore: 87,
    description: "Main water supply pipeline leaking near Dharampeth square. Water logging is starting to occur on the main road.",
    reportedDate: "2026-08-15",
    assignedOfficer: "Ramesh Deshmukh (Water Works Dept)",
    timeline: [
      { stage: "Reported", done: true, date: "2026-08-15 09:30 AM" },
      { stage: "AI Classified", done: true, date: "2026-08-15 09:32 AM" },
      { stage: "Assigned", done: true, date: "2026-08-16 11:00 AM" },
      { stage: "Field Action", done: true, date: "2026-08-17 08:30 AM" },
      { stage: "Resolution", done: false, date: "" }
    ],
    factors: {
      citizenReports: 25,
      severity: 30,
      populationImpact: 20,
      historicalFrequency: 10,
      locationRisk: 2
    }
  },
  {
    id: "NGP-2026-00125",
    category: "Roads & Potholes",
    subcategory: "Large Potholes Cluster",
    location: "Wardha Road, Near Airport Metro Station",
    status: "Pending",
    priority: "Critical",
    aiScore: 94,
    description: "Huge potholes causing traffic bottleneck and near-miss accidents on the main flyover link to Wardha Road.",
    reportedDate: "2026-08-17",
    assignedOfficer: "Sunita Joshi (Road Construction Dept)",
    timeline: [
      { stage: "Reported", done: true, date: "2026-08-17 07:15 AM" },
      { stage: "AI Classified", done: true, date: "2026-08-17 07:18 AM" },
      { stage: "Assigned", done: true, date: "2026-08-17 09:00 AM" },
      { stage: "Field Action", done: false, date: "" },
      { stage: "Resolution", done: false, date: "" }
    ],
    factors: {
      citizenReports: 30,
      severity: 35,
      populationImpact: 25,
      historicalFrequency: 2,
      locationRisk: 2
    }
  },
  {
    id: "NGP-2026-00118",
    category: "Garbage",
    subcategory: "Unauthorized Dump Site",
    location: "Mahal, Nagpur",
    status: "Resolved",
    priority: "Medium",
    aiScore: 68,
    description: "Garbage piled up near the historic Mahal gateway. Severe odor and stray animal gathering.",
    reportedDate: "2026-08-12",
    assignedOfficer: "Vikas Patil (Sanitation Dept)",
    timeline: [
      { stage: "Reported", done: true, date: "2026-08-12 10:00 AM" },
      { stage: "AI Classified", done: true, date: "2026-08-12 10:05 AM" },
      { stage: "Assigned", done: true, date: "2026-08-12 02:00 PM" },
      { stage: "Field Action", done: true, date: "2026-08-13 09:00 AM" },
      { stage: "Resolution", done: true, date: "2026-08-14 04:30 PM" }
    ],
    factors: {
      citizenReports: 12,
      severity: 15,
      populationImpact: 15,
      historicalFrequency: 20,
      locationRisk: 6
    }
  },
  {
    id: "NGP-2026-00130",
    category: "Drainage",
    subcategory: "Clogged Sewer Line",
    location: "Sadar, Nagpur",
    status: "In Progress",
    priority: "High",
    aiScore: 82,
    description: "Overflowing sewage from a manhole in the main market road. Creating unhygienic conditions and slow traffic movement.",
    reportedDate: "2026-08-16",
    assignedOfficer: "Milind Gawande (Sewerage Operations)",
    timeline: [
      { stage: "Reported", done: true, date: "2026-08-16 02:22 PM" },
      { stage: "AI Classified", done: true, date: "2026-08-16 02:25 PM" },
      { stage: "Assigned", done: true, date: "2026-08-16 04:00 PM" },
      { stage: "Field Action", done: true, date: "2026-08-17 11:30 AM" },
      { stage: "Resolution", done: false, date: "" }
    ],
    factors: {
      citizenReports: 18,
      severity: 28,
      populationImpact: 18,
      historicalFrequency: 12,
      locationRisk: 6
    }
  },
  {
    id: "NGP-2026-00131",
    category: "Street Lights",
    subcategory: "Dark Street Cluster",
    location: "Manish Nagar, Nagpur",
    status: "Pending",
    priority: "Low",
    aiScore: 45,
    description: "A series of 3 streetlights are broken on Road No. 4, making the road completely dark at night.",
    reportedDate: "2026-08-17",
    assignedOfficer: "Aniket Sen (Electrical Maintenance)",
    timeline: [
      { stage: "Reported", done: true, date: "2026-08-17 11:15 AM" },
      { stage: "AI Classified", done: true, date: "2026-08-17 11:18 AM" },
      { stage: "Assigned", done: false, date: "" },
      { stage: "Field Action", done: false, date: "" },
      { stage: "Resolution", done: false, date: "" }
    ],
    factors: {
      citizenReports: 5,
      severity: 10,
      populationImpact: 12,
      historicalFrequency: 10,
      locationRisk: 8
    }
  },
  {
    id: "NGP-2026-00109",
    category: "Traffic",
    subcategory: "Signal Malfunction",
    location: "Sitabuldi, Nagpur",
    status: "Resolved",
    priority: "High",
    aiScore: 89,
    description: "Main traffic lights at Sitabuldi square are flashing orange or dead, causing complete gridlock.",
    reportedDate: "2026-08-10",
    assignedOfficer: "P. K. Verma (Traffic Admin)",
    timeline: [
      { stage: "Reported", done: true, date: "2026-08-10 08:00 AM" },
      { stage: "AI Classified", done: true, date: "2026-08-10 08:02 AM" },
      { stage: "Assigned", done: true, date: "2026-08-10 08:15 AM" },
      { stage: "Field Action", done: true, date: "2026-08-10 08:45 AM" },
      { stage: "Resolution", done: true, date: "2026-08-10 10:15 AM" }
    ],
    factors: {
      citizenReports: 35,
      severity: 20,
      populationImpact: 30,
      historicalFrequency: 2,
      locationRisk: 2
    }
  },
  {
    id: "NGP-2026-00132",
    category: "Roads & Potholes",
    subcategory: "Unfinished Patchwork",
    location: "Hingna, Nagpur",
    status: "Pending",
    priority: "Medium",
    aiScore: 62,
    description: "Unpaved loose gravel left after pipeline repairs near Hingna Industrial Area. Highly slippery for two-wheelers.",
    reportedDate: "2026-08-17",
    assignedOfficer: "Sunita Joshi (Road Construction Dept)",
    timeline: [
      { stage: "Reported", done: true, date: "2026-08-17 04:30 PM" },
      { stage: "AI Classified", done: true, date: "2026-08-17 04:33 PM" },
      { stage: "Assigned", done: false, date: "" },
      { stage: "Field Action", done: false, date: "" },
      { stage: "Resolution", done: false, date: "" }
    ],
    factors: {
      citizenReports: 8,
      severity: 18,
      populationImpact: 15,
      historicalFrequency: 15,
      locationRisk: 6
    }
  },
  {
    id: "NGP-2026-00114",
    category: "Garbage",
    subcategory: "Overflowing Bin",
    location: "Trimurti Nagar, Nagpur",
    status: "Resolved",
    priority: "Low",
    aiScore: 48,
    description: "The municipal community bin in Trimurti Nagar park is overflowing for two days.",
    reportedDate: "2026-08-11",
    assignedOfficer: "Vikas Patil (Sanitation Dept)",
    timeline: [
      { stage: "Reported", done: true, date: "2026-08-11 03:00 PM" },
      { stage: "AI Classified", done: true, date: "2026-08-11 03:05 PM" },
      { stage: "Assigned", done: true, date: "2026-08-11 05:00 PM" },
      { stage: "Field Action", done: true, date: "2026-08-12 09:30 AM" },
      { stage: "Resolution", done: true, date: "2026-08-12 01:00 PM" }
    ],
    factors: {
      citizenReports: 4,
      severity: 10,
      populationImpact: 10,
      historicalFrequency: 20,
      locationRisk: 4
    }
  },
  {
    id: "NGP-2026-00133",
    category: "Drainage",
    subcategory: "Stormwater Blockage",
    location: "Besa, Nagpur",
    status: "Pending",
    priority: "High",
    aiScore: 81,
    description: "Pre-monsoon drainage channels are blocked with construction debris. Risk of major flooding in case of heavy showers.",
    reportedDate: "2026-08-17",
    assignedOfficer: "Milind Gawande (Sewerage Operations)",
    timeline: [
      { stage: "Reported", done: true, date: "2026-08-17 02:00 PM" },
      { stage: "AI Classified", done: true, date: "2026-08-17 02:02 PM" },
      { stage: "Assigned", done: true, date: "2026-08-17 04:30 PM" },
      { stage: "Field Action", done: false, date: "" },
      { stage: "Resolution", done: false, date: "" }
    ],
    factors: {
      citizenReports: 14,
      severity: 27,
      populationImpact: 22,
      historicalFrequency: 10,
      locationRisk: 8
    }
  },
  {
    id: "NGP-2026-00129",
    category: "Water Supply",
    subcategory: "Low Water Pressure",
    location: "Jaripatka, Nagpur",
    status: "In Progress",
    priority: "Medium",
    aiScore: 71,
    description: "Entire housing block receiving water with extremely low pressure for the past 3 days.",
    reportedDate: "2026-08-16",
    assignedOfficer: "Ramesh Deshmukh (Water Works Dept)",
    timeline: [
      { stage: "Reported", done: true, date: "2026-08-16 08:30 AM" },
      { stage: "AI Classified", done: true, date: "2026-08-16 08:34 AM" },
      { stage: "Assigned", done: true, date: "2026-08-16 01:00 PM" },
      { stage: "Field Action", done: true, date: "2026-08-17 10:00 AM" },
      { stage: "Resolution", done: false, date: "" }
    ],
    factors: {
      citizenReports: 22,
      severity: 15,
      populationImpact: 20,
      historicalFrequency: 8,
      locationRisk: 6
    }
  }
];
