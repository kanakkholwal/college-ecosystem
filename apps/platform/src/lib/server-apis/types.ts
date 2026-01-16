import type { z } from "zod";

import type {
  RawResultType,
  freshersDataSchema,
  rollNoSchema,
} from "~/types/result";
/*
 **  APIs schemas
 */

export type rollNoSchemaType = z.infer<typeof rollNoSchema>;
export type rawResultSchemaType = RawResultType;
export type ResultType = rawResultSchemaType & {
  _id: string;
  gender: "male" | "female" | "not_specified";
};

export interface AbNormalResult {
  _id: string;
  name: string;
  rollNo: string;
  batch: number;
  programme: string;
  semesterCount: number;
  avgSemesterCount: number;
}

export type FunctionaryType = {
  name: string;
  email: string;
  role: string;
  phoneNumber: string;
};

export type HostelType = {
  name: string;
  slug: string;
  gender: "male" | "female" | "guest_hostel";
  warden: {
    name: string;
    email: string;
    phoneNumber: string;
  };
  administrators: FunctionaryType[];
};

export type FacultyType = {
  _id: string;
  name: string;
  email: string;
  department: string;
};

export type Department = {
  name: string;
  code: string;
  short: string;
  roll_keys: string[];
  course_prefix: string;
  page: string;
};

/*
 **  APIs Payload types
 */

export type deleteResponseType = {
  acknowledged: boolean;
  deletedCount: number;
  identifiers?: string[];
};
export type ApiResponse<T> = {
  error: boolean;
  message: string;
  data: T;
};

export type APITypes = {
  results: {
    importFreshers: {
      payload: z.infer<typeof freshersDataSchema>;
      response: Record<string, string>;
    };
    assignRank: {
      payload: undefined;
      response: Record<string, string>;
    };
    assignBranchChange: {
      payload: undefined;
      response: Record<string, string>;
    };
    getResultByRollNoFromSite: {
      payload: z.infer<typeof rollNoSchema>;
      response: rawResultSchemaType;
    };
    getResultByRollNo: {
      payload: z.infer<typeof rollNoSchema>;
      response: ResultType;
    };
    addResultByRollNo: {
      payload: z.infer<typeof rollNoSchema>;
      response: ResultType;
    };
    deleteResultByRollNo: {
      payload: z.infer<typeof rollNoSchema>;
      response: deleteResponseType;
    };
    updateResultByRollNo: {
      payload: [z.infer<typeof rollNoSchema>, Partial<rawResultSchemaType>];
      response: ResultType;
    };
    getAbnormalResults: {
      payload: undefined;
      response: AbNormalResult[];
    };
    deleteAbNormalResults: {
      payload: undefined;
      response: deleteResponseType;
    };
    bulkUpdateResults: {
      payload: z.infer<typeof rollNoSchema>[];
      response: {
        total: number;
        updated: number;
        errors: {
          rollNo: z.infer<typeof rollNoSchema>;
          error: string;
        }[];
      };
    };
    bulkDeleteResults: {
      payload: z.infer<typeof rollNoSchema>[];
      response: deleteResponseType;
    };
  };
  hostels: {
    getAll: {
      payload: undefined;
      response: {
        in_charges: FunctionaryType[];
        hostels: HostelType[];
      };
    };
    // hostels/allotment/rooms-from-excel
    allotRoomsFromExcel: {
      payload: FormData;
      response: Blob;
    };
  };
  faculties: {
    searchByEmail: {
      payload: string;
      response: FacultyType;
    };
    refresh: {
      payload: undefined;
      response: FacultyType[];
    };
    getByDepartment: {
      payload: string;
      response: FacultyType[];
    };
  };
  departments: {
    getAll: {
      payload: undefined;
      response: string[];
    };
    getList: {
      payload: undefined;
      response: Department[];
    };
  };
  mail: {
    sendResultUpdate: {
      payload: {
        template_key: "result_update";
        targets: string[];
        subject: string;
        payload: {
          batch: string;
        };
      };
      response: {
        accepted: string[];
        rejected: string[];
      };
    };
  };
};
