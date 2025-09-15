// ~/constants/whisper.dummy.ts
import { WhisperPostT } from "~/constants/community.whispers";

export const DUMMY_WHISPERS: WhisperPostT[] = [
  {
    _id: "1",
    
    authorId: "user-101",
    visibility: "ANONYMOUS",
    category: "CONFESSION",
    content: "I once accidentally walked into the wrong lecture hall and sat there for 30 minutes before realizing 😭",
    reactions: [
      { type: "LIKE", userId: "u1" },
      { type: "LAUGH", userId: "u2" },
      { type: "LAUGH", userId: "u3" },
    ],
    reports: [],
    moderationStatus: "APPROVED",
    score: 12,
    pinned: false,
    pinnedUntil: undefined,
    poll: undefined,

    createdAt: new Date("2025-09-10T10:00:00Z"),
    updatedAt: new Date("2025-09-10T10:30:00Z"),
  },
  {
    _id: "2",
    
    authorId: "user-202",
    visibility: "PSEUDO",
    category: "CRITICISM",
    content: "Canteen food portions are shrinking every semester 🍛⬇️",
    
    pseudo: { handle: "HungryHippo", avatar: undefined, color: "#FF69B4" },
    reactions: [
      { type: "RELATE", userId: "u5" },
      { type: "AGREE", userId: "u6" },
      { type: "AGREE", userId: "u7" },
    ],
    reports: [],
    moderationStatus: "APPROVED",
    score: 8,
    pinned: false,
    pinnedUntil: undefined,
    poll: {
      question: "Should we start a petition for better canteen food?",
      options: [
        { id: "opt1", text: "Yes! 💪", votes: 15 },
        { id: "opt2", text: "No, it's fine 🙃", votes: 3 },
      ],
      expiresAt: new Date("2025-09-20T23:59:59Z"),
      anonymousVotes: true,
    },
    createdAt: new Date("2025-09-11T15:20:00Z"),
    updatedAt: new Date("2025-09-11T15:30:00Z"),
  },
  {
    _id: "3",
    
    authorId: "user-303",
    visibility: "IDENTIFIED",
    category: "PRAISE",
    content: "Shoutout to the library staff 📚 for being absolute lifesavers during finals week!",
    
    reactions: [
      { type: "LIKE", userId: "u8" },
      { type: "LIKE", userId: "u9" },
      { type: "AGREE", userId: "u10" },
    ],
    reports: [],
    moderationStatus: "APPROVED",
    score: 20,
    pinned: true,
    pinnedUntil: new Date("2025-09-30T23:59:59Z"),
    poll: undefined,
    
    createdAt: new Date("2025-09-12T08:00:00Z"),
    updatedAt: new Date("2025-09-12T08:15:00Z"),
  },
  {
    _id: "4",
    
    authorId: "user-404",
    visibility: "PSEUDO",
    category: "SHOWER_THOUGHT",
    content: "Technically, our campus cats own us, not the other way around 🐈",
    
    pseudo: { handle: "CatPhilosopher", avatar: undefined, color: "#FFD700" },
    reactions: [
      { type: "LAUGH", userId: "u11" },
      { type: "RELATE", userId: "u12" },
    ],
    reports: [],
    moderationStatus: "APPROVED",
    score: 5,
    pinned: false,
    pinnedUntil: undefined,
    poll: undefined,
    createdAt: new Date("2025-09-13T12:00:00Z"),
    updatedAt: new Date("2025-09-13T12:05:00Z"),
  },
  {
    _id: "5",
    authorId: "user-505",
    visibility: "ANONYMOUS",
    category: "OTHER",
    content: "Anyone know if the WiFi works better at the new block? 🤔",
    
    reactions: [],
    reports: [{ reporterId: "u15", reason: "Spam", createdAt: new Date() }],
    moderationStatus: "FLAGGED",
    score: 0,
    pinned: false,
    pinnedUntil: undefined,
    poll: {
      question: "How’s the new block WiFi?",
      options: [
        { id: "o1", text: "Super fast ⚡", votes: 2 },
        { id: "o2", text: "Same old 🐌", votes: 5 },
        { id: "o3", text: "Non-existent ❌", votes: 8 },
      ],
      expiresAt: new Date("2025-09-18T20:00:00Z"),
      anonymousVotes: false,
    },
    createdAt: new Date("2025-09-13T18:00:00Z"),
    updatedAt: new Date("2025-09-13T18:10:00Z"),
  },
];
