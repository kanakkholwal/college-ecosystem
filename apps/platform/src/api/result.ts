import { isValidRollNumber } from "~/constants/common.result";
import dbConnect from "~/lib/dbConnect";
import ResultModel, { IResultType, ResultTypeWithId } from "~/models/result";

const getResultByRollNo = async (
  rollNo: string
): Promise<{
  message: string;
  error: unknown;
  data: ResultTypeWithId | null;
}> => {
  if (!isValidRollNumber(rollNo)) {
    return Promise.resolve({
      message: "Invalid roll number",
      error: "INVALID_ROLL_NUMBER",
      data: null,
    });
  }
  try {
    await dbConnect();
    const resultData = await ResultModel.findOne<IResultType>({ rollNo });
    if (!resultData) {
      return Promise.resolve({
        message: "Result not found",
        error: "RESULT_NOT_FOUND",
        data: null,
      });
    }
    return Promise.resolve({
      data: JSON.parse(JSON.stringify(resultData)),
      message: "Result found",
      error: false,
    });
  } catch (err) {
    console.error("ERROR:[getResult]:", err);
    return Promise.resolve({
      message: "An error occurred",
      error: err,
      data: null,
    });
  }
};

export { getResultByRollNo };
