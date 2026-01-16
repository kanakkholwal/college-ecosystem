export const FEATURE_FLAGS = {
  hostel_n_outpass: {
    prod: true,
  },
  hostel_n_outpass_requests: {
    prod: true,
  },
  hostel_n_outpass_requests_page: {
    prod: false,
  },
  hostel_n_outpass_for_students: {
    prod: false,
  },
};

export const isAllowedFlag = (feature: keyof typeof FEATURE_FLAGS) => {
  return FEATURE_FLAGS[feature].prod;
};
