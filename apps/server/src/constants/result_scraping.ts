
export const LIST_TYPE = {
  ALL: "all",
  BACKLOG: "has_backlog",
  NEW_SEMESTER: "new_semester",
  DUAL_DEGREE: "dual_degree",
  NEW_BATCH: "new_batch",
  FULL_RESET: "full_reset",
}
export type listType = typeof LIST_TYPE[keyof typeof LIST_TYPE]

export const EVENTS = {
  TASK_STATUS: "task_status",

  TASK_PAUSED_RESUME: "task_paused_resume",

  STREAM_SCRAPING: "stream_scraping",

  TASK_DELETE: "delete_task",
  TASK_CLEAR_ALL: "clear_all_tasks",
  TASK_GET_LIST: "task_list",
  TASK_RETRY_FAILED: "task_retry_failed",

} as const;


export const TASK_STATUS = {
  SCRAPING: "scraping",
  COMPLETED: "completed",
  FAILED: "failed",
  CANCELLED: "cancelled",
} as const;


export const headerMap = new Map<
  string | number,
  {
    url: string;
    Referer: string;
    CSRFToken: string;
    RequestVerificationToken: string;
  }
>([
  [
    "scheme20",
    {
      url: "http://results.nith.ac.in/scheme20/studentresult/result.asp",
      Referer: "http://results.nith.ac.in/scheme20/studentresult/index.asp",
      CSRFToken: "{782F96DF-5115-4492-8CB2-06104ECFF0CA}",
      RequestVerificationToken: "094D0BF7-EE18-E102-8CBF-23C329B32E1C",
    },
  ],
  [
    "scheme21",
    {
      url: "http://results.nith.ac.in/scheme21/studentresult/result.asp",
      Referer: "http://results.nith.ac.in/scheme21/studentresult/index.asp",
      CSRFToken: "{D5D50B24-2DDE-4C35-9F41-10426C59EEA7}",
      RequestVerificationToken: "7BA3D112-507E-5379-EE25-9539F0DE9076",
    },
  ],
  [
    "scheme22",
    {
      url: "http://results.nith.ac.in/scheme22/studentresult/result.asp",
      Referer: "http://results.nith.ac.in/scheme22/studentresult/index.asp",
      CSRFToken: "{AF6DB03B-F6EC-475E-B331-6C9DE3846923}",
      RequestVerificationToken: "DA92D62F-BF6E-B268-4E04-F419F5EA6233",
    },
  ],
  [
    "scheme23",
    {
      url: "http://results.nith.ac.in/scheme23/studentresult/result.asp",
      Referer: "http://results.nith.ac.in/scheme23/studentresult/index.asp",
      CSRFToken: "{F1E16363-FEDA-48AF-88E9-8A186425C213}",
      RequestVerificationToken: "4FFEE8F3-14C9-27C4-B370-598406BF99C1",
    },
  ],
  [
    "scheme24",
    {
      url: "http://results.nith.ac.in/scheme24/studentresult/result.asp",
      Referer: "http://results.nith.ac.in/scheme24/studentresult/index.asp",
      CSRFToken: "{0696D16E-58AD-472B-890E-6537BE62A5EA}",
      RequestVerificationToken: "F797B72F-DC73-D06D-6B19-012ED5EBA98B",
    },
  ],
]);

export const Programmes = {
  "dual_degree": {
    name: "Dual Degree",
    scheme: "dualdegree",
    identifiers: ["dcs", "dec"],
  },
  "btech": {
    name: "B.Tech",
    scheme: "scheme",
    identifiers: ["bce", "bme", "bms", "bma", "bph", "bee", "bec", "bcs", "bch"],
  },
  "barch": {
    name: "B.Arch",
    scheme: "scheme",
    identifiers: ["bar"],
  },
  "mtech": {
    name: "M.Tech",
    scheme: "mtech",
    identifiers: ["mce", "mme", "mms", "mma", "mph", "mee", "mec", "mcs", "mch"],
  },
}

export const getProgrammeByIdentifier = (identifier: string, defaultBTech: boolean): typeof Programmes[keyof typeof Programmes] => {
  for (const programme of Object.values(Programmes)) {
    if (programme.identifiers.includes(identifier)) {
      if (defaultBTech && programme.scheme === Programmes["dual_degree"].scheme) {
        return Programmes["btech"]; // Return B.Tech if defaultBTech is true
      }
      return programme.name ? programme : Programmes["btech"]; // Default to B.Tech if no name is found
    }
  }
  return Programmes["btech"];
}

export const PROGRAMME_KEYS = {
  "Dual Degree": ["dcs", "dec"],
  "B.Tech": ["bce", "bme", "bms", "bma", "bph", "bee", "bec", "bcs", "bch"],
  "B.Arch": ["bar"],
  "M.Tech": ["mce", "mme", "mms", "mma", "mph", "mee", "mec", "mcs", "mch"],
};


export const RESPONSE = {
  ERROR: {
    INVALID_ROLL_NO: "Invalid Roll No",
    BATCH_NOT_SUPPORTED: "Batch not supported",
    NO_SIMILAR_BRANCH: "No Similar branch",
    NO_PROGRAMME: "No Programme",
    NO_BRANCH: "No Branch",
    NO_URL: "No URL",
    NO_HEADERS: "No Headers",
    OTHER: "Something went wrong",
  },
  SUCCESS: {
    RESULT_FETCHED: "Result fetched successfully!",
  },
  OTHER: {
    WELCOME: "Welcome to the server!",
    HEALTHY: "Healthy",
    SOMETHING_WRONG: "Something went wrong!",
    OTHER: "Other",
  },
};